import { motion } from 'framer-motion'
export default function EncoderStation({ tokens = [], embeddings }){
return (
<div className="bg-slate-800 p-4 rounded-2xl">
<h3 className="text-lg font-medium">Text Encoder</h3>
<p className="text-sm text-slate-400">Tokens are converted into vectors (embeddings) that guide image generation.</p>


<div className="mt-3 flex gap-2 flex-wrap">
{tokens.map((t,i)=> (
<motion.div
key={i}
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: i * 0.05 }}
className="px-3 py-1 rounded-full bg-slate-700 text-xs"
>{t}</motion.div>
))}
</div>


<div className="mt-4">
<h4 className="text-sm text-slate-300">Embedding preview</h4>
<div className="mt-2 grid grid-cols-6 gap-2">
{(embeddings || Array.from({length: Math.max(6, tokens.length)}, ()=>Math.random())).slice(0,12).map((v, i)=> (
<div key={i} className="h-8 bg-gradient-to-r from-sky-500 to-indigo-500 rounded" style={{ transform: `scaleY(${0.5 + v})` }} />
))}
</div>
</div>
</div>
)
}