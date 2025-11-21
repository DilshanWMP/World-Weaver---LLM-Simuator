export default function RefinementStation({ frames = [], step = 0, ts=0 }){
const before = frames.length ? `http://localhost:8000/static/${frames[Math.max(0, Math.floor(frames.length/2))]}?t=${ts}` : null
const after = frames.length ? `http://localhost:8000/static/${frames[frames.length-1]}?t=${ts}` : null


return (
<div className="bg-slate-800 p-4 rounded-2xl">
<h3 className="text-lg font-medium">Refinement Station</h3>
<p className="text-sm text-slate-400">Compare a mid-step and the final refined image.</p>


<div className="mt-4 flex gap-4">
<div className="flex-1">
<div className="text-xs text-slate-400 mb-2">Before (mid-step)</div>
<div className="w-[220px] h-[220px] bg-black rounded-md border border-slate-700 overflow-hidden">
{before? <img src={before} alt="before"/> : <div className="text-slate-500 p-6">—</div>}
</div>
</div>


<div className="flex-1">
<div className="text-xs text-slate-400 mb-2">After (final)</div>
<div className="w-[220px] h-[220px] bg-black rounded-md border border-slate-700 overflow-hidden">
{after? <img src={after} alt="after"/> : <div className="text-slate-500 p-6">—</div>}
</div>
</div>
</div>


<div className="mt-3">
<label className="text-sm text-slate-300">Adjustment</label>
<div className="flex gap-3 mt-2">
<input type="range" min={0} max={100} defaultValue={50} className="w-48"/>
<button className="px-3 py-2 bg-slate-700 rounded">Apply</button>
</div>
</div>
</div>
)
}