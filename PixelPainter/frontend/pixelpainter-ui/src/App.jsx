import { useState } from "react";
import axios from "axios";

function App() {
  const [prompt, setPrompt] = useState("");
  const [frames, setFrames] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ts, setTs] = useState(Date.now());

async function generate() {
  setLoading(true);
  setFrames([]);
  setStep(0);

  const res = await axios.post("http://localhost:8000/generate", {
    prompt: prompt
  });

  setTs(Date.now());   // 🟢 update timestamp HERE

  const frameFiles = res.data.frames;
  setFrames(frameFiles);
  setLoading(false);

    // autoplay animation
    let i = 0;
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= frameFiles.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 800); // change frame every 0.8s
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-6">🖌️ The Pixel Painter</h1>

      <div className="flex space-x-4 mb-6">
        <input
          className="flex-1 p-3 rounded bg-gray-800 border border-gray-700"
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={generate}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Generate
        </button>
      </div>

      {loading && <p className="text-lg">⏳ Generating diffusion steps...</p>}

      {frames.length > 0 && (
        <div className="mt-8">
          <p className="mb-2">Step {step + 1} / {frames.length}</p>

          <img
            src={`http://localhost:8000/static/${frames[step]}?t=${ts}`}
            className="w-[384px] rounded shadow-lg border border-gray-700"
            alt="generated"
          />

          <input
            type="range"
            min="0"
            max={frames.length - 1}
            value={step}
            onChange={(e) => setStep(parseInt(e.target.value))}
            className="w-[384px] mt-4"
          />
        </div>
      )}
    </div>
  );
}

export default App;
