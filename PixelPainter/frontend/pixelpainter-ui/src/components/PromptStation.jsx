// File: src/components/PromptStation.jsx
import { useState } from 'react'

export default function PromptStation({ onSubmit, loading }){

  const [value, setValue] = useState('A red fox in a misty forest')

  const examples = [
    'A cute kitten playing with yarn',
    'Colorful flowers in a garden',
    'A happy puppy in a field',
    'Sunset over mountains',
    'Butterflies in a meadow',
    'A cozy cabin in snow',
    'Rainbow over hills',
    'Dolphins jumping in ocean'
  ]

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
      <div className="space-y-4">
        <textarea
          className="w-full p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-700 text-lg"
          rows={2}
          value={value}
          onChange={(e)=>setValue(e.target.value)}
          placeholder="Enter your prompt here..."
        />
        
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <button
            disabled={loading}
            onClick={()=> onSubmit(value)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium text-base whitespace-nowrap"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
          
          <div className="flex flex-wrap gap-2">
            {examples.map((ex, i)=>(
              <button 
                key={i} 
                onClick={()=> setValue(ex)} 
                className="text-sm px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}