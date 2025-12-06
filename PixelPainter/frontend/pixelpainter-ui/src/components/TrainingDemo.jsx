// File: src/components/TrainingDemo.jsx
import { useEffect, useMemo, useRef, useState } from "react";

/*
TrainingDemo
Props:
- finalImageUrl: URL of the clean target image (string). If null, forward side shows placeholder.
- backwardFrames: array of backend frame filenames e.g. ["step_000.png", ...]
- ts: timestamp for cache-busting used in other components
- initialSteps: number of frames to create for forward sim (default 20)
*/
export default function TrainingDemo({
  finalImageUrl = null,
  backwardFrames = [],
  ts = 0,
  initialSteps = 20,
}) {
  const [forwardFrames, setForwardFrames] = useState([]); // dataURLs
  const [steps, setSteps] = useState(initialSteps);
  const [speedMs, setSpeedMs] = useState(200);
  const [playing, setPlaying] = useState(false);
  const [fIndex, setFIndex] = useState(0);
  const [bIndex, setBIndex] = useState(0);

  const playRef = useRef(null);

  // Utility: load image as HTMLImageElement (promise)
  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });

  // Generate simulated forward frames (client-side)
  useEffect(() => {
    let cancelled = false;

    async function gen() {
      if (!finalImageUrl) {
        setForwardFrames([]);
        return;
      }

      try {
        const img = await loadImage(finalImageUrl + (finalImageUrl.includes("?") ? "&" : "?") + `t=${ts}`);
        // create a canvas matching displayed size (we use 384x384 to match your viewer)
        const W = 384;
        const H = 384;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");

        // Draw base image sized to fit (cover)
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, W, H);
        // Draw image centered & cover-like
        const imgRatio = img.width / img.height;
        const targetRatio = W / H;
        let drawW = W, drawH = H, offsetX = 0, offsetY = 0;
        if (imgRatio > targetRatio) {
          // image wider
          drawH = H;
          drawW = Math.round(H * imgRatio);
          offsetX = Math.round((W - drawW) / 2);
        } else {
          drawW = W;
          drawH = Math.round(W / imgRatio);
          offsetY = Math.round((H - drawH) / 2);
        }

        // Get original imageData for pixel values
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        const baseImageData = ctx.getImageData(0, 0, W, H);

        // For reproducible-ish noise across frames we will use Math.random() (no seed)
        const frames = [];
        for (let i = 0; i < steps; ++i) {
          if (cancelled) return;
          const alpha = (i + 1) / steps; // 0<alpha<=1: fraction of noise
          // create new ImageData
          const newData = ctx.createImageData(W, H);
          for (let p = 0; p < baseImageData.data.length; p += 4) {
            // base pixel
            const r = baseImageData.data[p];
            const g = baseImageData.data[p + 1];
            const b = baseImageData.data[p + 2];
            const aPixel = baseImageData.data[p + 3];

            // noise pixel ~ gaussian approx with two uniform draws (quick)
            // scale noise to full [0,255]
            const nr = Math.floor((Math.random() + Math.random()) * 127.5); // rough bell-shape
            const ng = Math.floor((Math.random() + Math.random()) * 127.5);
            const nb = Math.floor((Math.random() + Math.random()) * 127.5);

            // blend: (1 - alpha)*orig + alpha*noise
            newData.data[p] = Math.max(0, Math.min(255, Math.round((1 - alpha) * r + alpha * nr)));
            newData.data[p + 1] = Math.max(0, Math.min(255, Math.round((1 - alpha) * g + alpha * ng)));
            newData.data[p + 2] = Math.max(0, Math.min(255, Math.round((1 - alpha) * b + alpha * nb)));
            newData.data[p + 3] = aPixel;
          }
          // put it and export dataURL
          ctx.putImageData(newData, 0, 0);
          frames.push(canvas.toDataURL("image/png"));
        }

        if (!cancelled) setForwardFrames(frames);
      } catch (e) {
        console.error("Forward frame generation failed", e);
        setForwardFrames([]);
      }
    }

    gen();
    return () => {
      cancelled = true;
    };
  }, [finalImageUrl, ts, steps]);

  // Playback handler
  useEffect(() => {
    if (!playing) {
      if (playRef.current) {
        clearInterval(playRef.current);
        playRef.current = null;
      }
      return;
    }
    // Start a timer to advance both animations
    playRef.current = setInterval(() => {
      setFIndex((prev) => {
        const next = (prev + 1) % Math.max(1, forwardFrames.length || 1);
        return next;
      });
      setBIndex((prev) => {
        const next = (prev + 1) % Math.max(1, backwardFrames.length || 1);
        return next;
      });
    }, Math.max(40, speedMs));
    return () => {
      if (playRef.current) {
        clearInterval(playRef.current);
        playRef.current = null;
      }
    };
  }, [playing, speedMs, forwardFrames.length, backwardFrames.length]);

  // clickable scrubbing for forward/backward
  const forwardSrc = forwardFrames.length ? forwardFrames[fIndex] : null;
  const backwardSrc =
    backwardFrames.length > 0
      ? `http://localhost:8000/static/${backwardFrames[Math.max(0, Math.min(backwardFrames.length - 1, bIndex))]}?t=${ts}`
      : null;

  // Basic UI
  return (
    <div className="bg-slate-800/70 p-4 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">🔁 Diffusion Training vs. Generation</h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-300 mr-1">Speed (ms)</label>
          <input
            type="range"
            min="80"
            max="1000"
            step="20"
            value={speedMs}
            onChange={(e) => setSpeedMs(parseInt(e.target.value))}
            className="w-28"
          />
          <button
            onClick={() => setPlaying((s) => !s)}
            className="ml-2 px-3 py-1 bg-blue-600 rounded text-white text-sm"
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Forward (training) */}
        <div className="p-3 bg-slate-900 rounded-lg">
          <div className="text-sm text-slate-400 mb-2">Forward diffusion (training): clean → noise</div>
          <div className="w-[320px] h-[320px] bg-black rounded-lg overflow-hidden mx-auto border border-slate-700 flex items-center justify-center">
            {forwardSrc ? (
              <img src={forwardSrc} alt="forward" className="object-cover w-full h-full" />
            ) : (
              <div className="text-slate-500 p-6 text-center">No final image available</div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 justify-center">
            <button onClick={() => setPlaying(false)} className="px-2 py-1 bg-slate-700 rounded">Stop</button>
            <input
              type="range"
              min={0}
              max={Math.max(0, steps - 1)}
              value={fIndex}
              onChange={(e) => { setFIndex(parseInt(e.target.value)); setPlaying(false); }}
              className="w-48"
            />
            <div className="text-xs text-slate-300">{fIndex + 1} / {Math.max(1, steps)}</div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <div>Frames: 
              <input
                type="number"
                min={5}
                max={60}
                value={steps}
                onChange={(e) => setSteps(Math.max(5, Math.min(60, parseInt(e.target.value) || 20)))}
                className="ml-2 w-16 bg-slate-800 px-2 py-0.5 rounded text-xs"
              />
            </div>
            <div className="italic">Simulated client-side (fast)</div>
          </div>
        </div>

        {/* Backward (generation) */}
        <div className="p-3 bg-slate-900 rounded-lg">
          <div className="text-sm text-slate-400 mb-2">Backward diffusion (generation): noise → clean</div>
          <div className="w-[320px] h-[320px] bg-black rounded-lg overflow-hidden mx-auto border border-slate-700 flex items-center justify-center">
            {backwardSrc ? (
              <img src={backwardSrc} alt="backward" className="object-cover w-full h-full" />
            ) : (
              <div className="text-slate-500 p-6 text-center">No generated frames yet</div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 justify-center">
            <button onClick={() => setPlaying(false)} className="px-2 py-1 bg-slate-700 rounded">Stop</button>
            <input
              type="range"
              min={0}
              max={Math.max(0, backwardFrames.length - 1)}
              value={bIndex}
              onChange={(e) => { setBIndex(parseInt(e.target.value)); setPlaying(false); }}
              className="w-48"
            />
            <div className="text-xs text-slate-300">{bIndex + 1} / {Math.max(1, backwardFrames.length)}</div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <div>Source: Backend frames</div>
            <div className="italic">Actual generation (real model)</div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500">
        Tip: run Generate first to produce backend frames (right). The forward animation uses the final image to show how noise is added during training.
      </div>
    </div>
  );
}
