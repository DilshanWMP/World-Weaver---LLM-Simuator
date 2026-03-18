# WordWeaver - LLM Simulator

This project consists of a Python FastAPI backend and a React (Vite) frontend. Below are the step-by-step instructions on how to set up and run the application on your local machine.

## Prerequisites & Requirements

Before you begin, ensure you have the following installed on your laptop:
- [Git](https://git-scm.com/downloads) (to clone the repository)
- [Anaconda](https://www.anaconda.com/download) or [Miniconda](https://docs.conda.io/en/latest/miniconda.html) (for Python environment management)
- [Node.js and npm](https://nodejs.org/en/download/) (for the frontend React application)

---

## Step-by-Step Installation Guide

### 1. Clone the Repository
Open your terminal or command prompt and run:
```bash
git clone <repository-url>
cd "World-Weaver---LLM-Simuator/WordWeaver"
```
*(Note: Replace `<repository-url>` with the actual URL of your Git repository if applicable).*

### 2. Backend Setup
The backend is built with Python and FastAPI. It uses a Conda environment for dependency management.

1. **Open a terminal** and navigate to the project root.
2. **Create a Conda environment** (if you haven't already):
   ```bash
   conda create -n WordWeaver python=3.10
   ```
3. **Activate the Conda environment**:
   ```bash
   conda activate WordWeaver
   ```
4. **Navigate to the backend directory and install dependencies**:
   ```bash
   cd wordweaver-backend
   pip install -r requirements.txt
   ```
5. **Run the backend server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend API will now be running at `http://localhost:8000`.

### 3. Frontend Setup
The frontend is built with React and Vite.

1. **Open a new terminal window** (so your backend keeps running).
2. **Navigate to the frontend directory** from the project root:
   ```bash
   cd wordweaver-frontend
   ```
3. **Install the Node.js dependencies**:
   ```bash
   npm install
   ```
4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   The terminal will output a local URL (usually `http://localhost:5173`). Open this URL in your browser to access the WordWeaver application.

---

## Summary of Commands to Run (After Installation)

Whenever you want to start the application again later, you just need to run: in Anaconda Prompt terminal go to root folder. then run the following commands:

**Terminal 1 (Backend):**
```bash
conda activate WordWeaver
cd wordweaver-backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd wordweaver-frontend
npm run dev
```
