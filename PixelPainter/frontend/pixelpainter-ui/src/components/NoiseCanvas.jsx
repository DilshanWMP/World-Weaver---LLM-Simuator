export default function NoiseCanvas(){
return (
<div className="bg-gradient-to-br from-black/60 to-slate-900 p-4 rounded-2xl">
<h3 className="text-lg font-medium mb-2">Noise Canvas</h3>
<p className="text-sm text-slate-400">AI starts from random pixels (noise).</p>
<div className="w-[384px] h-[384px] bg-noise rounded-lg border border-slate-700 mt-3" style={{ backgroundImage: 'url(data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="%23090909"/></svg>)' }}>
<div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Random noise (starting latent)</div>
</div>
</div>
)
}