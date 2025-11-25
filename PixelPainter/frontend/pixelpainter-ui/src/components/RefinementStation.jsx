// File: src/components/RefinementStation.jsx
export default function RefinementStation({ frames = [], step = 0, ts = 0 }) {

  const before = frames.length
    ? `http://localhost:8000/static/${frames[Math.floor(frames.length / 2)]}?t=${ts}`
    : null

  const after = frames.length
    ? `http://localhost:8000/static/${frames[frames.length - 1]}?t=${ts}`
    : null

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
      <h3 className="text-2xl font-semibold mb-2">Refinement Stage</h3>
      <p className="text-sm text-slate-400 mb-6">Compare mid-step and final output.</p>

      <div className="flex flex-col items-center gap-8">
        {/* BEFORE */}
        <div className="text-center">
          <div className="text-sm text-slate-300 mb-3">Mid-step Progress</div>
          <div className="w-64 h-64 bg-black rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center mx-auto">
            {before ? <img src={before} className="object-cover w-full h-full" alt="Mid-step progress" /> : <div className="text-slate-500 p-6">—</div>}
          </div>
        </div>

        {/* AFTER */}
        <div className="text-center">
          <div className="text-sm text-slate-300 mb-3">Final Output</div>
          <div className="w-64 h-64 bg-black rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center mx-auto">
            {after ? <img src={after} className="object-cover w-full h-full" alt="Final output" /> : <div className="text-slate-500 p-6">—</div>}
          </div>
        </div>
      </div>
    </div>
  )
}