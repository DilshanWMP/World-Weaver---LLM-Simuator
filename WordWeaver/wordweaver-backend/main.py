# wordweaver-backend/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from llm_core import compute_next_token, get_embeddings, internal_forward

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # or ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Generate request model
class GenRequest(BaseModel):
    context: str
    temperature: float = 1.0
    top_k: int = 8

class EmbRequest(BaseModel):
    context: str
    num_tokens: int = 3   # default to last 3 tokens

class InternalRequest(BaseModel):
    context: str
    num_tokens: int = 3
    layer_index: int = -1

@app.post("/generate")
def generate(req: GenRequest):
    result = compute_next_token(
        context_text=req.context,
        temp=req.temperature,
        top_k=req.top_k
    )
    return result

@app.post("/embed")
def embed(req: EmbRequest):
    embeddings = get_embeddings(req.context, num_tokens=req.num_tokens)
    return {"embeddings": embeddings}

@app.post("/internal_forward")
def internal(req: InternalRequest):
    """
    Returns internal tensors for the last `num_tokens` tokens. Best-effort fields:
      tokens_selected
      embeddings_selected
      positional_vectors_selected
      q_vectors_selected, k_vectors_selected, v_vectors_selected
      attention_matrix_selected (n x n)
      hidden_states_selected (n x dim)
      logits (raw for last position)
    """
    data = internal_forward(req.context, num_tokens=req.num_tokens, layer_index=req.layer_index)
    return data

@app.get("/")
def root():
    return {"status": "WordWeaver FastAPI backend running"}
