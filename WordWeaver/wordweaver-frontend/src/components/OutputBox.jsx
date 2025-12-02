import React from "react";

export default function OutputBox({ output, lastToken }) {
  return (
    <div className="card">
      <div className="mb-2 text-slate-300">Output (built token-by-token)</div>
      <div className="mb-4 text-center text-6xl font-extrabold text-emerald-400 leading-tight">{lastToken}</div>
      <div className="bg-slate-800 p-4 rounded-md min-h-[100px] whitespace-pre-wrap text-slate-100 text-4xl font-bold">
        {output || "No output yet."}
      </div>
    </div>
  );
}
