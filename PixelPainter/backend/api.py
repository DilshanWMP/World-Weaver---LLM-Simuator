import os
import subprocess
import glob
import shutil
import datetime
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

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

def _select_start_mid_final(sorted_files):
    count = len(sorted_files)
    if count == 0:
        return None
    start = sorted_files[0]
    middle = sorted_files[count // 2]
    final = sorted_files[-1]
    return {"start": start, "middle": middle, "final": final}

@app.post("/generate")
def generate_image(data: Prompt):
    prompt = data.prompt

    # 1) Collect existing frames (if any)
    existing = sorted(glob.glob(f"{STEPS_DIR}/*.png"))
    existing = sorted(existing)

    prev_info = None
    prev_dir = os.path.join(STEPS_DIR, "prev")
    os.makedirs(prev_dir, exist_ok=True)

    if existing:
        # 2) Pick start/middle/final from existing frames
        sel = _select_start_mid_final(existing)
        if sel:
            # Clear previous folder contents (so only these three files remain)
            for f in glob.glob(os.path.join(prev_dir, "*")):
                try:
                    if os.path.isfile(f):
                        os.remove(f)
                    else:
                        shutil.rmtree(f)
                except Exception:
                    pass

            # Copy selected files into prev folder with fixed names
            try:
                shutil.copy(sel["start"], os.path.join(prev_dir, "start.png"))
                shutil.copy(sel["middle"], os.path.join(prev_dir, "middle.png"))
                shutil.copy(sel["final"], os.path.join(prev_dir, "final.png"))
                prev_info = {
                    "start": "prev/start.png",
                    "middle": "prev/middle.png",
                    "final": "prev/final.png",
                }
            except Exception as e:
                # If copy fails, ignore but log
                print("Warning: failed to copy previous selection:", e)

    # 3) Delete existing frames (so generator can write fresh files)
    for f in existing:
        try:
            os.remove(f)
        except Exception:
            pass

    # 4) Run generator (same as before)
    subprocess.run(
        ["python", "generate_steps.py"] + prompt.split(),
        cwd=BASE_DIR,
    )

    # 5) Collect generated images
    files = sorted(glob.glob(f"{STEPS_DIR}/*.png"))
    filenames = [os.path.basename(f) for f in files]

    # 6) Return both current frames and previous selection (if any)
    return {"frames": filenames, "previous": prev_info}