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
