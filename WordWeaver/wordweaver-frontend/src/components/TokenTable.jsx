import React from "react";

export default function TokenTable({ tokens = [], tokenIds = [] }) {
  return (
    <div className="card">
      <div className="mb-3 text-slate-300"><strong>Generated Tokens</strong> — token text and token id for the current output.</div>

      {tokens.length ? (
        <div className="overflow-auto max-h-64">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-2">#</th>
                <th>Token</th>
                <th>Token id (guess)</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t, i) => (
                <tr key={i} className="border-t border-slate-800">
                  <td className="py-2 text-slate-200">{i + 1}</td>
                  <td className="py-2 font-semibold">{t}</td>
                  <td className="py-2">{tokenIds[i] ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-slate-400">No tokens yet. Type a prompt and click Generate Next Token.</div>
      )}
    </div>
  );
}
