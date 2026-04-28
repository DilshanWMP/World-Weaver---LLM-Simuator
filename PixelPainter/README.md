# PixelPainter

PixelPainter is an interactive exhibit project that generates images from text prompts using **Stable Diffusion**. This README provides all the steps to set up the project from scratch on a new machine.

---

## Table of Contents

1. [Requirements](#requirements)  
2. [Project Structure](#project-structure)  
3. [Setup Instructions](#setup-instructions)  
4. [CUDA and PyTorch Check](#cuda-and-pytorch-check)  
5. [Running the Backend](#running-the-backend)  
6. [Running the Frontend](#running-the-frontend)  
7. [Usage](#usage)  
8. [Notes](#notes)  

---

## Requirements

- Python 3.10+  
- Conda (Anaconda/Miniconda)  
- Node.js 18+ (for frontend)  
- NVIDIA GPU (optional but recommended for CUDA acceleration)  
- Internet connection (to download the model first time)  

---

## Project Structure

PixelPainter/
│
├─ backend/
│ ├─ api.py
│ ├─ download_model.py
│ ├─ generate_steps.py
│ ├─ requirements.txt
│ ├─ steps/ # folder to store generated images
│ └─ sd15/ # pre-downloaded Stable Diffusion model
│
├─ frontend/
│ └─ pixelpainter-ui/
│ ├─ package.json
│ └─ ... other React files
│
└─ .gitignore


---

## Setup Instructions

### 1. Clone the project

```bash
git clone <your-repo-url>
cd PixelPainter

2. Create and activate Conda environment

conda create -n pixelpainter python=3.10 -y
conda activate pixelpainter

3. Install backend requirements

Inside the backend folder:

cd backend
pip install -r requirements.txt

If sd15 model is not present, download it:

python download_model.py

4. Install frontend dependencies

Inside the frontend/pixelpainter-ui folder:

cd ../frontend/pixelpainter-ui
npm install

    Windows PowerShell tip: If you see a script execution error for npm, run:

    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

CUDA and PyTorch Check

Before running the backend, check that PyTorch detects your GPU:

python -c "import torch; print('CUDA available:', torch.cuda.is_available()); print('GPU count:', torch.cuda.device_count()); print('GPU name:', torch.cuda.get_device_name(0))"

    Output should show your GPU details and CUDA available: True.

    If you see OpenMP warnings (libiomp5md.dll), set the environment variable in PowerShell:

$env:KMP_DUPLICATE_LIB_OK="TRUE"

Running the Backend

From the backend folder:

uvicorn api:app --reload --port 8000

    The backend serves /generate endpoint for generating images.

    Generated steps are saved in backend/steps/.

Running the Frontend

From the frontend/pixelpainter-ui folder:

npm start

    Opens the React app in your browser (default: http://localhost:3000).

    Enter prompts to generate images via backend.

Usage

    Open the frontend in your browser.

    Type a text prompt.

    Click generate – backend generates 10 diffusion steps per prompt.

    Images appear in the frontend via the /static folder.

Notes

    Make sure the sd15 folder is at the same level as backend, or update generate_steps.py path:

MODEL_PATH = "../sd15"

    First-time model download requires internet. After that, it uses local files.

    CUDA is optional but significantly speeds up image generation.

    If you encounter OpenMP errors (libiomp5md.dll already initialized), use:

$env:KMP_DUPLICATE_LIB_OK="TRUE"

    Always ensure your Node.js and Conda environments are activated before running frontend/backend commands.