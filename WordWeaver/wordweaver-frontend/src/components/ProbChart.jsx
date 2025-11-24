import React from "react";

export default function ProbChart({ candidates = [], probs = [] }) {
  const safeProbs = probs || [];

  const normalized = (() => {
    const s = safeProbs.reduce((a, b) => a + (b || 0), 0) || 1;
    return safeProbs.map((p) => (p || 0) / s);
  })();

  return (
    <div className="card">
      <div className="mb-3 text-slate-300"><strong>Next-word Probabilities</strong></div>

      {candidates.length ? (
        <>
          <div className="space-y-3">
            {candidates.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-28 text-sm truncate">{c}</div>
                <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div style={{ width: `${(normalized[i] || 0) * 100}%` }} className="h-3 bg-sky-500 rounded-full"></div>
                </div>
                <div className="w-16 text-right text-sm">{((normalized[i] || 0) * 100).toFixed(2)}%</div>
              </div>
            ))}
          </div>

          <div className="mt-4 overflow-auto max-h-40">
            <table className="w-full text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="py-2 text-left">Candidate</th>
                  <th className="py-2 text-left">Probability</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    <td className="py-2">{c}</td>
                    <td className="py-2">{(normalized[i] || 0).toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-slate-400">Generate a token to see probabilities.</div>
      )}
    </div>
  );
}
