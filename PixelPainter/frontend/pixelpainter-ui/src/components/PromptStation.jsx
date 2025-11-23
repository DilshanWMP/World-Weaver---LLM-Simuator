// PromptStation.jsx — Improved UI

import { useState } from 'react'

export default function PromptStation({ onSubmit, loading }) {

  const [value, setValue] = useState('A cyberpunk city at sunset')

  const examples = [
    'A red fox in a misty forest, cinematic lighting',
    'Futuristic flying city above clouds',
    'A cute robot painting a mural',
  ]

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm p-5 rounded-2xl shadow-lg">

      <label className="block text-sm font-medium text-slate-200 mb-2">
        ✏️ Prompt Input
      </label>

      <textarea
        className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-700 focus:border-blue-500 outline-none text-slate-100"
        rows={3}
        value={value}
        onChange={(e)=>setValue(e.target.value)}
      />

      <div className="flex flex-wrap gap-2 mt-3">

        <button
          disabled={loading}
          onClick={()=> onSubmit(value)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 
                     rounded-lg text-white font-medium transition disabled:opacity-40"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>

        {examples.map((ex, i)=>( 
          <button
            key={i}
            onClick={()=> setValue(ex)}
            className="text-xs px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
          >
            {ex.split(',')[0]}
          </button>
        ))}
      </div>

    </div>
  )
}
