import { useState } from "react";
import { Sliders, X } from "lucide-react";   // Icon library (already in Vite template via lucide-react)

export default function SidePanel({
  modelName, setModelName,
  temperature, setTemperature,
  topK, setTopK,
  speed, setSpeed
}) {

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-8 left-4 z-50 bg-sky-600 hover:bg-sky-500 text-white p-3 rounded-2xl shadow-lg"
      >
        <Sliders size={20} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">Controls</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-300 hover:text-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-6">

          {/* Model Selector */}
          <div>
            <label className="block text-sm text-slate-400">Model</label>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full mt-1 p-2 bg-slate-800 rounded-md text-slate-100"
            >
              <option>meta-llama/Llama-3.2-3B</option>
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm text-slate-400">
              Temperature: {temperature}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Top-k */}
          <div>
            <label className="block text-sm text-slate-400">
              Top-k: {topK}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Animation Speed */}
          <div>
            <label className="block text-sm text-slate-400">
              Animation Speed: {speed}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

        </div>
      </div>
    </>
  );
}
