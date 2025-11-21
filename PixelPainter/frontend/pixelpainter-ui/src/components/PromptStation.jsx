import { useState } from 'react'
export default function PromptStation({ onSubmit, loading }){
const [value, setValue] = useState('A cyberpunk city at sunset')
const examples = [
'A red fox in a misty forest, cinematic lighting',
'Futuristic flying city above clouds',
'A cute robot painting a mural',
]


return (
<div className="bg-slate-800 p-4 rounded-2xl shadow">
<label className="block text-sm font-medium text-slate-200 mb-2">Prompt Input Station</label>
<textarea
className="w-full p-3 rounded bg-slate-900 text-slate-100 border border-slate-700"
rows={3}
value={value}
onChange={(e)=>setValue(e.target.value)}
/>
<div className="flex gap-2 mt-3">
<button
disabled={loading}
onClick={()=> onSubmit(value)}
className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
>{loading? 'Generating...':'Generate'}</button>
<div className="flex gap-2 items-center">
{examples.map((ex, i)=>(
<button key={i} onClick={()=>{ setValue(ex); }} className="text-xs px-2 py-1 rounded bg-slate-700">{ex.split(',')[0]}</button>
))}
</div>
</div>
</div>
)
}