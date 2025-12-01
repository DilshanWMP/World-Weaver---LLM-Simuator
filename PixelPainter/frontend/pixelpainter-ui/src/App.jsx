// File: src/App.jsx
import { useState } from 'react'
import PromptStation from './components/PromptStation'
import EncoderStation from './components/EncoderStation'
import DiffusionViewer from './components/DiffusionViewer'
import RefinementStation from './components/RefinementStation'
import axios from 'axios'

export default function App(){
  const [prevSelection, setPrevSelection] = useState(null)
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
      const prev = res.data.previous || null
      setTs(Date.now())
      setFrames(frameFiles)
      setPrevSelection(prev)   // new
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
      
      {/* Header with Icon */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="text-4xl">🎨</div>
          <h1 className="text-4xl font-bold">Pixel Painter</h1>
        </div>
        <p className="text-slate-400 mt-2">Step-by-step diffusion generation demo</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Prompt Station - Top */}
        <PromptStation onSubmit={generate} loading={loading} />

        {/* Text Encoder Demo - Middle */}
        <EncoderStation tokens={tokens} />

        {/* Bottom Section: Diffusion Steps (Left) and Refinement (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DiffusionViewer frames={frames} step={step} setStep={setStep} ts={ts} />
          <RefinementStation frames={frames} step={step} ts={ts} prev={prevSelection} />
        </div>

      </div>
    </div>
  )
}