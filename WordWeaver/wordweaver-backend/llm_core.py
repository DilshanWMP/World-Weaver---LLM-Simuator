# llm_core.py
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

# --- existing next-token function (unchanged except small cleanup) ---
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

# --- NEW: get_embeddings function ---
def get_embeddings(context_text: str, num_tokens: int = 3):
    """
    Return embeddings for the last `num_tokens` tokens from the tokenized context_text.
    Returns: list of dicts: { 'token': token_str, 'token_id': id, 'embedding': [float,...] }
    """
    device = next(model.parameters()).device

    # Tokenize without adding special tokens (match your compute_next_token)
    inputs = tokenizer(context_text, return_tensors="pt", add_special_tokens=False)
    input_ids = inputs["input_ids"].to(device)  # shape (1, seq_len)

    # choose the last num_tokens token ids (if not enough tokens, take all)
    seq = input_ids[0]
    seq_len = seq.shape[0]
    if seq_len == 0:
        return []

    n = max(1, min(num_tokens, seq_len))
    selected_ids = seq[-n:]  # a tensor of length n

    # Get the embedding matrix (use model.get_input_embeddings())
    with torch.no_grad():
        embed_layer = model.get_input_embeddings()  # usually nn.Embedding
        # embedding lookup for the selected token ids
        selected_ids = selected_ids.unsqueeze(0)  # shape (1, n)
        embeddings = embed_layer(selected_ids)     # shape (1, n, dim)
        embeddings = embeddings[0].cpu()           # shape (n, dim)

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
