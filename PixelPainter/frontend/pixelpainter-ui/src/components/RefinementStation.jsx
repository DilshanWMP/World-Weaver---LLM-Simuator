// RefinementStation.jsx — Improved UI

export default function RefinementStation({ frames = [], step = 0, ts = 0 }) {

  const before = frames.length
    ? `http://localhost:8000/static/${frames[Math.floor(frames.length / 2)]}?t=${ts}`
    : null

  const after = frames.length
    ? `http://localhost:8000/static/${frames[frames.length - 1]}?t=${ts}`
    : null

  return (
    <div className="bg-slate-800/70 p-5 rounded-2xl shadow-lg">

      <h3 className="text-xl font-semibold">🎨 Refinement Stage</h3>
      <p className="text-sm text-slate-400">Compare mid-step and final output.</p>

      <div className="mt-4 flex gap-5">

        {/* BEFORE */}
        <div className="flex-1">
          <div className="text-xs text-slate-400 mb-1">Before (Mid-step)</div>
          <div className="w-[240px] h-[240px] rounded-xl bg-black border border-slate-700 overflow-hidden">
            {before ? <img src={before} className="object-cover w-full h-full" /> : <div className="text-slate-500 p-6">—</div>}
          </div>
        </div>

        {/* AFTER */}
        <div className="flex-1">
          <div className="text-xs text-slate-400 mb-1">Final Output</div>
          <div className="w-[240px] h-[240px] rounded-xl bg-black border border-slate-700 overflow-hidden">
            {after ? <img src={after} className="object-cover w-full h-full" /> : <div className="text-slate-500 p-6">—</div>}
          </div>
        </div>

      </div>
    </div>
  )
}
