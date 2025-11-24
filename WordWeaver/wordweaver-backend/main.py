# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from llm_core import compute_next_token, get_embeddings

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
    """
    Returns embeddings for the last `num_tokens` tokens in req.context
    Response: [ { token, token_id, embedding: [float,...] }, ... ]
    """
    embeddings = get_embeddings(req.context, num_tokens=req.num_tokens)
    return {"embeddings": embeddings}

@app.get("/")
def root():
    return {"status": "WordWeaver FastAPI backend running"}
