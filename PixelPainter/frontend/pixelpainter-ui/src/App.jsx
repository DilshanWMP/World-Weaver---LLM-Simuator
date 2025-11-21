import { useState } from 'react'
import PromptStation from './components/PromptStation'
import EncoderStation from './components/EncoderStation'
import NoiseCanvas from './components/NoiseCanvas'
import DiffusionViewer from './components/DiffusionViewer'
import RefinementStation from './components/RefinementStation'
import FinalCanvas from './components/FinalCanvas'
import axios from 'axios'
import './index.css'

export default function App(){
const [prompt, setPrompt] = useState('')
const [tokens, setTokens] = useState([])
const [embeddings, setEmbeddings] = useState(null) // optional numeric array for visualization
const [frames, setFrames] = useState([])
const [step, setStep] = useState(0)
const [loading, setLoading] = useState(false)
const [ts, setTs] = useState(Date.now())
const [statusText, setStatusText] = useState('')

async function generate(newPrompt){
// main entry called from PromptStation
setPrompt(newPrompt)
setFrames([])
setStep(0)
setStatusText('Tokenizing...')


// tokenization for demo (split by whitespace, keep punctuation lightly)
const toks = newPrompt.split(/(\s+)/).filter(t => t.trim().length > 0)
setTokens(toks)


// simulate encoder call by sending prompt to backend? We do a lightweight frontend demo
setStatusText('Encoding tokens...')
// optional: request backend to return token embeddings (not implemented server-side), so we create fake embeddings
const fakeEmb = toks.map((_, i) => Math.random())
setEmbeddings(fakeEmb)


// call backend to generate real diffusion frames
setLoading(true)
setStatusText('Requesting image generation...')

try {
const res = await axios.post('http://localhost:8000/generate', { prompt: newPrompt })
const frameFiles = res.data.frames || []
// update timestamp for cache-busting
setTs(Date.now())
setFrames(frameFiles)
setStatusText('Animating diffusion steps')


// autoplay
let i = 0
const interval = setInterval(() => {
setStep(prev => {
if(prev >= frameFiles.length - 1){
clearInterval(interval)
setStatusText('Generation complete')
setLoading(false)
return prev
}
return prev + 1
})
}, 700)


} catch(e){
console.error(e)
setStatusText('Generation failed: ' + (e.message||e))
setLoading(false)
}
}

return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-8">
<div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
<div className="col-span-12 lg:col-span-4 space-y-6">
<div className="bg-slate-800 p-4 rounded-2xl shadow-lg">
<h2 className="text-2xl font-semibold">🖌️ The Pixel Painter</h2>
<p className="text-sm text-slate-400 mt-1">Type a prompt and watch how a diffusion model paints it — step by step.</p>
</div>


<PromptStation
onSubmit={generate}
loading={loading}
/>


<div className="bg-slate-800 p-4 rounded-2xl">
<h3 className="text-lg font-medium">Status</h3>
<p className="text-sm text-slate-400 mt-2">{statusText}</p>
<div className="mt-3">
<h4 className="text-sm text-slate-300">Tokens</h4>
<div className="flex flex-wrap gap-2 mt-2">
{tokens.map((t,i)=> (
<div key={i} className="token-pill text-xs">{t}</div>
))}
</div>
</div>
</div>


<EncoderStation tokens={tokens} embeddings={embeddings} />


</div>

<div className="col-span-12 lg:col-span-8 space-y-6">
<NoiseCanvas />


<DiffusionViewer frames={frames} step={step} setStep={setStep} ts={ts} />


<RefinementStation frames={frames} step={step} ts={ts} />


<FinalCanvas frames={frames} step={step} ts={ts} />
</div>
</div>
</div>
)
}