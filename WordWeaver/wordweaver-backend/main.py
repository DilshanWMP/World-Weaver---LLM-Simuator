from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from llm_core import compute_next_token

app = FastAPI()

# ---------------------------------------------------
# CORS FIX — REQUIRED FOR YOUR REACT FRONTEND
# ---------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # or ["http://localhost:5173"] for extra safety
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# Request model
# ---------------------------------------------------
class GenRequest(BaseModel):
    context: str
    temperature: float = 1.0
    top_k: int = 8

# ---------------------------------------------------
# Routes
# ---------------------------------------------------
@app.post("/generate")
def generate(req: GenRequest):
    result = compute_next_token(
        context_text=req.context,
        temp=req.temperature,
        top_k=req.top_k
    )
    return result


@app.get("/")
def root():
    return {"status": "WordWeaver FastAPI backend running"}
