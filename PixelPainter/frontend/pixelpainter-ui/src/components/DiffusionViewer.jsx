// DiffusionViewer.jsx — Improved UI

import { useEffect } from 'react'

export default function DiffusionViewer({ frames = [], step = 0, setStep, ts=0 }) {

  useEffect(()=>{ setStep(0) }, [frames])

  const src = frames.length ? `http://localhost:8000/static/${frames[step]}?t=${ts}` : null

  return (
    <div className="bg-slate-800/70 p-5 rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold">🔄 Diffusion Steps</h3>
      <p className="text-sm text-slate-400">See how noise gradually forms an image.</p>

      <div className="mt-4 flex flex-col items-center">

        <div className="w-[384px] h-[384px] bg-black rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center">
          {src ? <img src={src} alt="frame" className="object-cover w-full h-full" /> : <div className="text-slate-500">No frames</div>}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={()=> setStep(Math.max(0, step-1))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded">Prev</button>
          <button onClick={()=> setStep(Math.min(frames.length-1, step+1))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded">Next</button>
          <div className="text-sm text-slate-300 ml-3">Step {step+1} / {frames.length}</div>
        </div>

        <input
          type="range"
          min={0}
          max={Math.max(0, frames.length-1)}
          value={step}
          onChange={(e)=> setStep(parseInt(e.target.value))}
          className="w-[380px] mt-4 accent-blue-500"
        />
      </div>
    </div>
  )
}
