// EncoderStation.jsx
import { useState } from "react";

export default function EncoderStation({ tokens = [] }) {
  // Example semantic features for demonstration
  const featureLabels = ["Object Type", "Color", "Size", "Pose", "Action", "Background", "…etc"];

  // For demo: embeddings for each token (numbers between 0-1)
  const embeddings = tokens.map((token) =>
    featureLabels.map(() => (Math.random() * 1).toFixed(2))
  );

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold mb-3">🔤 Text Encoder Demo</h3>
      <p className="text-sm text-slate-400 mb-4 leading-relaxed">
        This section demonstrates how the AI processes your text prompt: it breaks your prompt into tokens, then converts each token into a numerical vector (embedding) that captures its meaning. These embeddings guide the image generator.
      </p>

      {/* Tokens */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-2">1️⃣ Tokens</h4>
        <div className="flex flex-wrap gap-2">
          {tokens.map((t, i) => (
            <div key={i} className="px-3 py-1 rounded-full bg-slate-700 text-xs">
              {t}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Each token represents a meaningful piece of your prompt.
        </p>
      </div>

      {/* Encoder with semantic features */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-2">2️⃣ Text Encoder & Embeddings</h4>
        <p className="text-xs text-slate-500 mb-3">
          Each token is converted into a vector capturing semantic features: Object Type, Color, Size, Pose, Action, Background, etc.
        </p>

        <div className="space-y-3">
          {tokens.map((token, i) => (
            <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <div className="text-sm font-medium mb-1 text-slate-200">Token: "{token}"</div>
              <div className="grid grid-cols-3 gap-2">
                {featureLabels.map((label, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{label}</span>
                    <div
                      className="h-3 bg-indigo-500 rounded"
                      style={{ width: `${embeddings[i][j] * 100}%` }}
                    ></div>
                    <span className="text-xs text-slate-300">{embeddings[i][j]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table preview */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-2">3️⃣ Embedding Vector Table</h4>
        <p className="text-xs text-slate-500 mb-2">
          Rows = tokens, Columns = semantic features. Numbers show the strength of each token’s contribution to each feature.
        </p>
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-slate-700 text-xs w-full">
            <thead>
              <tr>
                <th className="border border-slate-600 px-2 py-1">Token</th>
                {featureLabels.map((f, i) => (
                  <th key={i} className="border border-slate-600 px-2 py-1">{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, i) => (
                <tr key={i} className="hover:bg-slate-700">
                  <td className="border border-slate-600 px-2 py-1 font-medium">{token}</td>
                  {embeddings[i].map((v, j) => (
                    <td key={j} className="border border-slate-600 px-2 py-1 text-center">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
