// src/components/LogitsPanel.jsx
import React from "react";

/*
  LogitsPanel
  - props:
    - logits: array (full vocab raw scores) OR null
    - showTop: number (how many top entries to show)
    - temperature: number (for explanation)
*/

export default function LogitsPanel({ logits = null, showTop = 10, temperature = 1.0 }) {
  if (!logits || !Array.isArray(logits)) {
    return (
      <div className="card">
        <div className="text-slate-300 mb-2"><strong>Logits (raw scores)</strong></div>
        <div className="text-slate-400 text-sm">No logits available yet. Generate a token to fetch raw model scores for the next position.</div>
      </div>
    );
  }

  // convert to pairs and pick topN
  const pairs = logits.map((s, idx) => ({ id: idx, score: Number(s) }));
  pairs.sort((a, b) => b.score - a.score);
  const top = pairs.slice(0, showTop);

  return (
    <div className="card">
      <div className="text-slate-300 mb-2"><strong>Logits (raw scores) preview — top {showTop}</strong></div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="py-2 text-left">ID</th>
              <th className="py-2 text-left">Token</th>
              <th className="py-2 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {top.map((p) => (
              <tr key={p.id} className="border-t border-slate-800">
                <td className="py-1">{p.id}</td>
                <td className="py-1 italic text-slate-400">[token decoding not provided]</td>
                <td className="py-1">{p.score.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-400 mt-3">
        <strong>What are logits?</strong> — raw model scores for every possible next token. They are converted to probabilities using <strong>softmax</strong>.
        <br />
        <strong>Softmax & temperature:</strong> dividing logits by <em>temperature</em> 1 smooths probabilities (more random sampling); temperature &lt;1 sharpens them (more deterministic). The Next-word Probabilities panel shows the softmaxed probabilities for the candidates.
      </div>
    </div>
  );
}
