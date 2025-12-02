# wordweaver-backend/llm_core.py
import math
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

MODEL_NAME = "meta-llama/Llama-3.2-3B"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_fast=False)

bnb = BitsAndBytesConfig(load_in_8bit=True)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb,
    device_map="auto",
    trust_remote_code=True
)

# ---- existing next-token function ----
def compute_next_token(context_text, temp=1.0, top_k=10):
    device = next(model.parameters()).device

    inputs = tokenizer(context_text, return_tensors="pt", add_special_tokens=False)
    input_ids = inputs["input_ids"].to(device)

    with torch.no_grad():
        outputs = model(input_ids)
        logits = outputs.logits[0, -1] / max(temp, 1e-8)
        probs = torch.softmax(logits, dim=-1)

        # Top-K
        topk = torch.topk(probs, k=min(top_k, probs.shape[0]))
        ids = topk.indices.cpu().tolist()
        vals = topk.values.cpu().tolist()
        tokens = [tokenizer.decode([i]) for i in ids]

        # Sample one token
        next_id = torch.multinomial(probs, 1).item()
        next_token = tokenizer.decode([next_id])

    # Return full IDs so TokenTable shows accurate Token IDs
    return {
        "next_token": next_token,
        "candidates": tokens,
        "probs": vals,
        "token_ids": input_ids[0].cpu().tolist()
    }

# ---- existing get_embeddings (unchanged) ----
def get_embeddings(context_text: str, num_tokens: int = 3):
    device = next(model.parameters()).device

    inputs = tokenizer(context_text, return_tensors="pt", add_special_tokens=False)
    input_ids = inputs["input_ids"].to(device)  # shape (1, seq_len)

    seq = input_ids[0]
    seq_len = seq.shape[0]
    if seq_len == 0:
        return []

    n = max(1, min(num_tokens, seq_len))
    selected_ids = seq[-n:]  # a tensor of length n

    with torch.no_grad():
        embed_layer = model.get_input_embeddings()
        selected_ids = selected_ids.unsqueeze(0)
        embeddings = embed_layer(selected_ids)
        embeddings = embeddings[0].cpu()

    result = []
    for i, tok_id in enumerate(selected_ids[0].cpu().tolist()):
        token_str = tokenizer.decode([tok_id])
        emb_vector = embeddings[i].tolist()
        result.append({
            "token": token_str,
            "token_id": tok_id,
            "embedding": emb_vector
        })
    return result

# ---- NEW: internal_forward to expose intermediate values ----
def internal_forward(context_text: str, num_tokens: int = 3, layer_index: int = -1):
    """
    Perform a forward pass and return internals:
      - selected token embeddings
      - a positional vector (sinusoidal demo)
      - averaged attention matrix (last or chosen layer)
      - Q/K/V projections for selected tokens (if accessible)
      - FFN/hidden state for last layer (if available)
      - logits (raw) for the last position
    """

    device = next(model.parameters()).device

    # Tokenize and prepare
    inputs = tokenizer(context_text, return_tensors="pt", add_special_tokens=False)
    input_ids = inputs["input_ids"].to(device)
    seq_len = input_ids.shape[1] if input_ids is not None else 0

    if seq_len == 0:
        return {"error": "no tokens in input"}

    # number of tokens to inspect: last `num_tokens`
    n = max(1, min(num_tokens, seq_len))
    start_idx = seq_len - n
    positions = list(range(start_idx, seq_len))

    # Do a forward pass asking model to return attentions and hidden_states
    with torch.no_grad():
        try:
            outputs = model(input_ids, output_attentions=True, output_hidden_states=True)
        except TypeError:
            # some wrappers require flags in config instead; try without flags
            outputs = model(input_ids)

    resp = {}
    # ---- logits (raw scores) for last position ----
    try:
        logits = outputs.logits  # shape [1, seq_len, vocab_size]
        last_logits = logits[0, -1].cpu().tolist()
        resp["logits"] = last_logits  # full vocab raw scores (can be big)
    except Exception:
        resp["logits"] = None

    # ---- hidden states ----
    try:
        # hidden_states is tuple(len = num_layers+1), first is embedding outputs
        hidden_states = outputs.hidden_states
        # choose the layer index (negative indexes allowed)
        chosen_hidden = hidden_states[layer_index]  # shape [1, seq_len, dim]
        # move to CPU and convert last n token hidden states to list
        chosen_hidden_cpu = chosen_hidden[0, start_idx:seq_len].cpu().tolist()
        resp["hidden_states_selected"] = chosen_hidden_cpu
    except Exception:
        resp["hidden_states_selected"] = None

    # ---- attentions ----
    try:
        # attentions: tuple of (layer) tensors [batch, num_heads, seq_len, seq_len]
        attentions = outputs.attentions
        # pick requested layer (last by default)
        att = attentions[layer_index]  # shape [batch, num_heads, seq_len, seq_len]
        # average heads to get single matrix [seq_len, seq_len]
        att_avg = att[0].mean(dim=0).cpu().tolist()
        # For compactness, only return the last n x n submatrix (selected tokens attending to selected tokens)
        att_sub = [[row[start_idx:seq_len] for row in att_avg][r][c] for r in range(start_idx, seq_len) for c in range(start_idx, seq_len)]
        # better shape: create proper submatrix
        att_matrix = []
        for r in range(start_idx, seq_len):
            row_vals = att_avg[r][start_idx:seq_len]
            att_matrix.append([float(v) for v in row_vals])
        resp["attention_matrix_selected"] = att_matrix  # n x n
    except Exception:
        resp["attention_matrix_selected"] = None

    # ---- embeddings for the last tokens (reuse get_embeddings) ----
    try:
        emb_info = get_embeddings(context_text, num_tokens=n)
        resp["embeddings_selected"] = emb_info
    except Exception:
        resp["embeddings_selected"] = None

    # ---- positional vectors (sinusoidal demo) ----
    try:
        # produce a small sinusoidal positional vector (same dim as embedding vector if possible)
        # try to use embedding dim
        emb_dim = None
        if resp.get("embeddings_selected") and len(resp["embeddings_selected"]) > 0:
            emb_dim = len(resp["embeddings_selected"][0]["embedding"])
        else:
            # fallback guess
            emb_dim = 256 if emb_dim is None else emb_dim

        def sinusoidal_position_vector(pos, dim):
            vec = []
            for i in range(dim):
                denom = 10000 ** (2 * (i // 2) / float(dim))
                if i % 2 == 0:
                    vec.append(math.sin(pos / denom))
                else:
                    vec.append(math.cos(pos / denom))
            return vec

        pos_vectors = []
        for p in positions:
            pos_vectors.append(sinusoidal_position_vector(p, emb_dim))
        resp["positional_vectors_selected"] = pos_vectors
    except Exception:
        resp["positional_vectors_selected"] = None

    # ---- try to compute Q/K/V for selected tokens (best-effort) ----
    try:
        qkv = []
        # try to access layer module for projection weights
        # different HF wrappers name things differently; try several common paths
        proj_found = False
        layer_module = None
        # common path for LLaMA-like: model.model.layers[layer_index]
        try:
            # if user passed negative index, python will handle it
            layer_module = model.model.layers[layer_index]
            proj_found = True
        except Exception:
            proj_found = False

        if proj_found:
            # try common attribute names for self-attention projections
            q_proj = getattr(layer_module.self_attn, "q_proj", None)
            k_proj = getattr(layer_module.self_attn, "k_proj", None)
            v_proj = getattr(layer_module.self_attn, "v_proj", None)
            # fallback: some models name them q_proj, k_proj, v_proj directly under layer_module
            if q_proj is None:
                q_proj = getattr(layer_module, "q_proj", None)
                k_proj = getattr(layer_module, "k_proj", None)
                v_proj = getattr(layer_module, "v_proj", None)

            if q_proj is not None and k_proj is not None and v_proj is not None:
                # use chosen_hidden (the input to that layer) if present, else use embeddings
                src_hidden = None
                try:
                    src_hidden = hidden_states[layer_index][0, start_idx:seq_len]  # shape [n, dim]
                except Exception:
                    src_hidden = None
                if src_hidden is None:
                    # fallback to input embeddings of selected tokens
                    src_hidden = torch.tensor([e["embedding"] for e in resp.get("embeddings_selected", [])])
                # compute q/k/v = src_hidden @ W.T (+ bias if present)
                q_w = getattr(q_proj, "weight", None)
                q_b = getattr(q_proj, "bias", None)
                k_w = getattr(k_proj, "weight", None)
                k_b = getattr(k_proj, "bias", None)
                v_w = getattr(v_proj, "weight", None)
                v_b = getattr(v_proj, "bias", None)

                if q_w is not None:
                    q_vecs = (src_hidden.to(q_w.device) @ q_w.t().to(src_hidden.device)).cpu().tolist()
                    if q_b is not None:
                        # add bias (roughly)
                        qb = q_b.cpu().tolist()
                        q_vecs = [[qv + qb_i for qv, qb_i in zip(vec, qb[:len(vec)])] for vec in q_vecs]
                else:
                    q_vecs = None

                if k_w is not None:
                    k_vecs = (src_hidden.to(k_w.device) @ k_w.t().to(src_hidden.device)).cpu().tolist()
                    if k_b is not None:
                        kb = k_b.cpu().tolist()
                        k_vecs = [[kv + kb_i for kv, kb_i in zip(vec, kb[:len(vec)])] for vec in k_vecs]
                else:
                    k_vecs = None

                if v_w is not None:
                    v_vecs = (src_hidden.to(v_w.device) @ v_w.t().to(src_hidden.device)).cpu().tolist()
                    if v_b is not None:
                        vb = v_b.cpu().tolist()
                        v_vecs = [[vv + vb_i for vv, vb_i in zip(vec, vb[:len(vec)])] for vec in v_vecs]
                else:
                    v_vecs = None

                resp["q_vectors_selected"] = q_vecs
                resp["k_vectors_selected"] = k_vecs
                resp["v_vectors_selected"] = v_vecs
            else:
                resp["q_vectors_selected"] = None
                resp["k_vectors_selected"] = None
                resp["v_vectors_selected"] = None
        else:
            resp["q_vectors_selected"] = None
            resp["k_vectors_selected"] = None
            resp["v_vectors_selected"] = None
    except Exception:
        resp["q_vectors_selected"] = None
        resp["k_vectors_selected"] = None
        resp["v_vectors_selected"] = None

    # ---- return the last n token strings for convenience ----
    try:
        token_list = [tokenizer.decode([int(x)]) for x in input_ids[0, start_idx:seq_len].cpu().tolist()]
        resp["tokens_selected"] = token_list
    except Exception:
        resp["tokens_selected"] = None

    return resp
