# World Weaver & Pixel Painter

Welcome to the **World Weaver & Pixel Painter** repository! This repository hosts two interactive AI exhibit applications designed to demystify generative AI technologies: Large Language Models (LLMs) and Stable Diffusion (Image Generation). 

## 🚀 Projects Included

### 1. WordWeaver (LLM Simulator)
**WordWeaver** is an educational and interactive simulator that breaks down how Large Language Models work under the hood. 

* **What it does:** It allows users to input prompts and visually watch how the LLM generates a response token-by-token. The application features a 3D simulated visualizer of tokens flowing through Transformer layers and displays a real-time graph of next-word probabilities, giving users a clear look into the model's decision-making process.
* **Tech Stack:** 
  * **Backend/Logic:** Python, FastAPI, Streamlit, PyTorch, Hugging Face `transformers`
  * **Frontend:** React.js (Vite)
  * **AI Models:** Runs on local Hugging Face models (e.g., `meta-llama/Llama-3.2-3B`) leveraging local GPU (CUDA) or CPU.

### 2. PixelPainter (Stable Diffusion Exhibit)
**PixelPainter** is an interactive image generation exhibit that translates user imagination into visual art.

* **What it does:** Users provide a text prompt, and the application generates an image using the Stable Diffusion model. It demonstrates the diffusion process step-by-step, allowing users to see how an image evolves from pure noise to a complete picture.
* **Tech Stack:** 
  * **Backend:** Python, FastAPI, PyTorch, Diffusers
  * **Frontend:** React.js, Node.js
  * **AI Models:** Stable Diffusion v1.5 (`sd15`) accelerated by NVIDIA CUDA.

## 🛠️ Main Technical Highlights
Both projects emphasize running state-of-the-art AI locally without relying on external cloud APIs:
- **Local Inference:** Both projects use `PyTorch` to run large models directly on local hardware, utilizing NVIDIA CUDA for GPU acceleration (where available) to achieve real-time performance.
- **Decoupled Architecture:** Both projects employ a modern architecture with a decoupled Python `FastAPI` backend for heavy AI computation and a dynamic `React` frontend for a sleek, interactive user experience.
- **Interactive Visualizations:** Use of custom UI components (such as Streamlit metrics and Three.js 3D canvas) to visually explain complex AI concepts like tokens and diffusion steps.

## 📂 Getting Started
Each project has its own dedicated setup instructions. Navigate to the respective project directories to learn how to install dependencies and run the servers:

- 📖 [WordWeaver Setup Instructions](./WordWeaver/README.md)
- 📖 [PixelPainter Setup Instructions](./PixelPainter/README.txt)

---
*Note: Ensure you have Python 3.10+, Node.js (v18+), and Conda installed before setting up the projects.*
