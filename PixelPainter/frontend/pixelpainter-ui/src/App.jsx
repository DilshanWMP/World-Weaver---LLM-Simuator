import { useState } from 'react'
import PromptStation from './components/PromptStation'
import EncoderStation from './components/EncoderStation'
import DiffusionViewer from './components/DiffusionViewer'
import RefinementStation from './components/RefinementStation'
import axios from 'axios'

export default function App(){
  const [prompt, setPrompt] = useState('')
  const [tokens, setTokens] = useState([])
  const [frames, setFrames] = useState([])
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [ts, setTs] = useState(Date.now())
  const [statusText, setStatusText] = useState('')

  async function generate(newPrompt){
    setPrompt(newPrompt)
    setFrames([])
    setStep(0)
    setStatusText('Tokenizing...')
    const toks = newPrompt.split(/(\s+)/).filter(t => t.trim().length > 0)
    setTokens(toks)
    setLoading(true)
    setStatusText('Requesting image generation...')
    try {
      const res = await axios.post('http://localhost:8000/generate', { prompt: newPrompt })
      const frameFiles = res.data.frames || []
      setTs(Date.now())
      setFrames(frameFiles)
      setStatusText('Animating diffusion steps')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">

        {/* LEFT SIDEBAR */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Title */}
          <div className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold tracking-tight">🖌️ Pixel Painter</h2>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Step-by-step demonstration of diffusion image generation.
            </p>
          </div>

          {/* Prompt */}
          <PromptStation onSubmit={generate} loading={loading} />

          {/* Encoder Station */}
          <EncoderStation tokens={tokens} />
        </div>

        {/* RIGHT SIDE */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <DiffusionViewer frames={frames} step={step} setStep={setStep} ts={ts} />
          <RefinementStation frames={frames} step={step} ts={ts} />
        </div>
      </div>
    </div>
  )
}
