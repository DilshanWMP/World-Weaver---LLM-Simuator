// File: src/components/EncoderStation.jsx
import { useState } from "react";

export default function EncoderStation({ tokens = [] }) {
  // Professional feature labels for image generation
  const featureLabels = ["Visual Concept", "Color Palette", "Style/Texture", "Composition", "Lighting/Mood", "Context/Setting", "..."];

  // For demo: embeddings for each token (numbers between 0-1)
  const embeddings = tokens.map((token) =>
    featureLabels.slice(0, -1).map(() => (Math.random() * 1).toFixed(2))
  );

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
      <h3 className="text-2xl font-semibold mb-4">Text Encoder Demo</h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
        The text encoder converts your prompt into numerical embeddings that guide the image generation process. 
        Each token is mapped to semantic features that influence visual attributes in the final image.
      </p>

      {/* Tokens */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Tokens</h4>
        <div className="flex flex-wrap gap-2">
          {tokens.map((t, i) => (
            <div key={i} className="px-3 py-1 rounded-full bg-slate-700 text-xs border border-slate-600">
              {t}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Each token represents a meaningful piece of your prompt that the AI processes individually.
        </p>
      </div>

      {/* Encoder with semantic features */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Text Encoder & Embeddings</h4>
        <p className="text-xs text-slate-500 mb-4">
          Each token is converted into a vector capturing semantic features that influence different aspects of image generation.
        </p>

        <div className="space-y-3">
          {tokens.map((token, i) => (
            <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <div className="text-sm font-medium mb-2 text-slate-200">"{token}"</div>
              <div className="grid grid-cols-2 gap-2">
                {featureLabels.slice(0, -1).map((label, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-20 truncate">{label}</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 bg-indigo-500 rounded-full"
                        style={{ width: `${embeddings[i][j] * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-300 w-8 text-right">{embeddings[i][j]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table preview */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3">Embedding Vector Table</h4>
        <p className="text-xs text-slate-500 mb-3">
          Numerical representation of token semantics. Higher values indicate stronger association with each visual feature.
        </p>
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-slate-700 text-xs w-full">
            <thead>
              <tr className="bg-slate-800">
                <th className="border border-slate-600 px-3 py-2 text-left">Token</th>
                {featureLabels.map((f, i) => (
                  <th key={i} className="border border-slate-600 px-2 py-2 text-center">{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, i) => (
                <tr key={i} className="hover:bg-slate-750">
                  <td className="border border-slate-600 px-3 py-2 font-medium text-left">{token}</td>
                  {embeddings[i].map((v, j) => (
                    <td key={j} className="border border-slate-600 px-2 py-2 text-center">{v}</td>
                  ))}
                  <td className="border border-slate-600 px-2 py-2 text-center text-slate-500">...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}