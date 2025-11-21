import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
import subprocess
import glob

app = FastAPI()

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REAL steps directory is backend/steps
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STEPS_DIR = os.path.join(BASE_DIR, "steps")

print("SERVING STATIC FROM:", STEPS_DIR)

# Serve backend/steps to frontend
app.mount("/static", StaticFiles(directory=STEPS_DIR), name="static")


class Prompt(BaseModel):
    prompt: str


@app.post("/generate")
def generate_image(data: Prompt):
    prompt = data.prompt

    # Delete old frames
    for f in glob.glob(f"{STEPS_DIR}/*.png"):
        os.remove(f)

    # Run generator
    subprocess.run(
        ["python", "generate_steps.py"] + prompt.split(),
        cwd=BASE_DIR,
    )

    # Collect generated images
    files = sorted(glob.glob(f"{STEPS_DIR}/*.png"))
    filenames = [os.path.basename(f) for f in files]

    return {"frames": filenames}
