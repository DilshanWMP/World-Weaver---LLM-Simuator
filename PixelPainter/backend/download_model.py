from diffusers import StableDiffusionPipeline
import torch

print("Downloading model...")

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16
)

pipe.save_pretrained("sd15")

print("Model downloaded and saved!")
