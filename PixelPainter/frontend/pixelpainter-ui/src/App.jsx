// App.jsx — Improved UI Layout

import { useState } from 'react'
import PromptStation from './components/PromptStation'
import EncoderStation from './components/EncoderStation'
import DiffusionViewer from './components/DiffusionViewer'
import RefinementStation from './components/RefinementStation'
import axios from 'axios'

export default function App(){

  const [prompt, setPrompt] = useState('')
  const [tokens, setTokens] = useState([])
  const [embeddings, setEmbeddings] = useState(null)
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

    setStatusText('Encoding tokens...')
    const fakeEmb = toks.map(() => Math.random())
    setEmbeddings(fakeEmb)

    setLoading(true)
    setStatusText('Requesting image generation...')

    try {
      const res = await axios.post('http://localhost:8000/generate', { prompt: newPrompt })
      const frameFiles = res.data.frames || []
      setTs(Date.now())
      setFrames(frameFiles)

      setStatusText('Animating diffusion steps')

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-slate-100 p-8">

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">

        {/* LEFT SIDEBAR */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* Title Card */}
          <div className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold tracking-tight">🖌️ Pixel Painter</h2>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              A step-by-step visual demonstration of how diffusion models generate images.
            </p>
          </div>

          {/* Prompt */}
          <PromptStation onSubmit={generate} loading={loading} />

          {/* Status Panel */}
          <div className="bg-slate-800/70 p-5 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold">Status</h3>
            <p className="text-sm text-slate-400 mt-2">{statusText}</p>

            <div className="mt-4">
              <h4 className="text-sm text-slate-300 font-medium">Tokens</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {tokens.map((t,i)=> (
                  <div key={i} className="token-pill text-xs">{t}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Encoder */}
          <EncoderStation tokens={tokens} embeddings={embeddings} />
        </div>

        {/* RIGHT SIDE */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          <DiffusionViewer 
            frames={frames} 
            step={step} 
            setStep={setStep} 
            ts={ts} 
          />

          <RefinementStation 
            frames={frames} 
            step={step} 
            ts={ts} 
          />

        </div>
      </div>
    </div>
  )
}
