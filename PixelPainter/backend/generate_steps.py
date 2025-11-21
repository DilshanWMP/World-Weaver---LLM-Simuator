import sys
import torch
import os
from diffusers import StableDiffusionPipeline
from PIL import Image

# get the prompt
prompt = " ".join(sys.argv[1:])

# load local model
MODEL_PATH = "../sd15"

pipe = StableDiffusionPipeline.from_pretrained(
    MODEL_PATH,
    torch_dtype=torch.float16,
    local_files_only=True
)

pipe = pipe.to("cuda")
pipe.set_progress_bar_config(disable=True)

# output folder
os.makedirs("steps", exist_ok=True)

# ---- REDUCED DIFFUSION STEPS ----
num_steps = 10   # reduced from 30 → MUCH lower VRAM
pipe.scheduler.set_timesteps(num_steps, device="cuda")

# encode text prompt
prompt_embeds, negative_embeds = pipe.encode_prompt(
    prompt=prompt,
    device="cuda",
    num_images_per_prompt=1,
    do_classifier_free_guidance=True
)

# ---- REDUCED RESOLUTION (384×384) ----
latent_size = 48   # 48 × 8 = 384px output resolution

latents = torch.randn(
    (1, pipe.unet.config.in_channels, latent_size, latent_size),
    device="cuda",
    dtype=torch.float16
)

guidance_scale = 7.5

# Safety: disable VAE gradients (faster)
pipe.vae.eval()
for p in pipe.vae.parameters():
    p.requires_grad_(False)

# ---- DIFFUSION LOOP ----
for i, t in enumerate(pipe.scheduler.timesteps):

    # classifier-free guidance requires 2 copies
    latent_input = torch.cat([latents] * 2)

    # forward UNet
    with torch.amp.autocast("cuda"):
        noise_pred = pipe.unet(
            latent_input,
            t,
            encoder_hidden_states=torch.cat([negative_embeds, prompt_embeds])
        ).sample

    # CFG combine noise
    noise_uncond, noise_text = noise_pred.chunk(2)
    noise_pred = noise_uncond + guidance_scale * (noise_text - noise_uncond)

    # update latents
    latents = pipe.scheduler.step(noise_pred, t, latents).prev_sample

    # ---- DECODE the image ----
    with torch.no_grad():
        with torch.amp.autocast("cuda"):
            decoded = pipe.vae.decode(latents / 0.18215).sample

        # format to real image
        image = (decoded.detach().float().cpu().clamp(-1, 1) + 1) / 2
        image = image.permute(0, 2, 3, 1)[0].numpy()
        image = (image * 255).astype("uint8")
        image = Image.fromarray(image)

    # save each step
    image.save(f"steps/step_{i:03}.png")

print("✓ All 10 steps generated successfully!")
