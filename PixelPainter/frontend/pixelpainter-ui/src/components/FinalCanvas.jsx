export default function FinalCanvas({ frames = [], step = 0, ts=0 }){
const src = frames.length ? `http://localhost:8000/static/${frames[frames.length-1]}?t=${ts}` : null


return (
<div className="bg-slate-800 p-4 rounded-2xl">
<h3 className="text-lg font-medium">Final Image Canvas</h3>
<p className="text-sm text-slate-400">Download or explore the final image.</p>


<div className="mt-4 flex items-center gap-4">
<div className="w-[480px] h-[320px] bg-black rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center">
{src ? <img src={src} alt="final"/> : <div className="text-slate-500">No final image yet</div>}
</div>


<div className="flex flex-col gap-3">
<a href={src || '#'} download className="px-4 py-2 bg-blue-600 rounded text-white">Download</a>
<button className="px-4 py-2 bg-slate-700 rounded">Reset</button>
</div>
</div>
</div>
)
}