import { useEffect } from 'react'


export default function DiffusionViewer({ frames = [], step = 0, setStep, ts=0 }){
useEffect(()=>{
// when frames change, reset step
setStep(0)
}, [frames])


const src = frames.length ? `http://localhost:8000/static/${frames[step]}?t=${ts}` : null


return (
<div className="bg-slate-800 p-4 rounded-2xl flex flex-col items-start">
<h3 className="text-lg font-medium">Diffusion — Step-by-step</h3>
<p className="text-sm text-slate-400">Watch how the model removes noise and forms the image.</p>


<div className="mt-4 flex items-start gap-6">
<div>
<div className="w-[384px] h-[384px] bg-black rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
{src ? <img src={src} alt="frame" /> : <div className="text-slate-500">No frames yet</div>}
</div>


<div className="mt-3 flex items-center gap-3">
<button onClick={()=> setStep(Math.max(0, step-1))} className="px-3 py-2 bg-slate-700 rounded">Prev</button>
<button onClick={()=> setStep(Math.min(Math.max(0, frames.length-1), step+1))} className="px-3 py-2 bg-slate-700 rounded">Next</button>
<div className="text-sm text-slate-300 ml-3">Step {step+1} / {frames.length || 0}</div>
</div>

<input
type="range"
min={0}
max={Math.max(0, frames.length-1)}
value={step}
onChange={(e)=> setStep(parseInt(e.target.value))}
className="w-[384px] mt-3"
/>
</div>


<div className="w-56">
<div className="bg-slate-900 p-3 rounded-md border border-slate-700">
<h4 className="text-sm font-medium">Guidance</h4>
<p className="text-xs text-slate-400 mt-2">Arrows show how text tokens influence regions (illustrative).</p>
<div className="mt-3 h-32 flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-700 rounded">Attention overlay preview</div>
</div>
</div>
</div>
</div>
)
}