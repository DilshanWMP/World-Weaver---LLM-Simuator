// src/components/EmbeddingViewer.jsx
import React, { useState } from "react";
import axios from "axios";

export default function EmbeddingViewer({ context, numTokens = 3 }) {
  const [loading, setLoading] = useState(false);
  const [embeddings, setEmbeddings] = useState([]); // array of { token, token_id, embedding }
  const [error, setError] = useState(null);

  const fetchEmbeddings = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/embed", {
        context,
        num_tokens: numTokens
      }, { timeout: 120000 });
      setEmbeddings(res.data.embeddings || []);
    } catch (err) {
      console.error("embed fetch error", err);
      setError("Failed to fetch embeddings from backend.");
      setEmbeddings([]);
    } finally {
      setLoading(false);
    }
  };

  // helper to truncate numeric array for textual display
  const shortVals = (arr, show = 8) => {
    if (!arr) return "";
    if (arr.length <= show) return arr.map((v) => v.toFixed(6)).join(", ");
    const first = arr.slice(0, show).map((v) => v.toFixed(6)).join(", ");
    return `${first}, ...`;
  };

  // We will only visualize first D dims (e.g., 48) to keep the heatmap readable.
  const VIS_DIMS = 48;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="text-slate-300 font-semibold">Embedding Viewer</div>
        <div className="text-sm text-slate-400">Last {numTokens} tokens</div>
      </div>

      <div className="mb-3">
        <div className="flex gap-2">
          <button
            onClick={fetchEmbeddings}
            disabled={loading || !context || !context.trim()}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-md text-sm"
          >
            {loading ? "Fetching..." : "Get Embeddings"}
          </button>

          <button
            onClick={() => {
              setEmbeddings([]);
              setError(null);
            }}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {error && <div className="text-rose-400 mb-2">{error}</div>}

      {embeddings.length === 0 ? (
        <div className="text-slate-400">No embeddings yet. Click “Get Embeddings” after you have a prompt/output.</div>
      ) : (
        <div className="space-y-4">
          {embeddings.map((obj, idx) => {
            const vec = obj.embedding || [];
            const heatVec = vec.slice(0, VIS_DIMS);
            // map to color scale between min..max for that token
            const minV = Math.min(...heatVec);
            const maxV = Math.max(...heatVec);
            const range = maxV - minV || 1;
            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm text-slate-300">Token: <span className="font-medium text-white">{obj.token}</span> <span className="text-slate-400 ml-2">id:{obj.token_id}</span></div>
                    <div className="text-xs text-slate-400 mt-1">Values (first 8 shown): {shortVals(vec, 8)}</div>
                  </div>
                </div>

                {/* heatmap row */}
                <div className="w-full overflow-x-auto">
                  <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(14px, 1fr)" }} className="gap-1 h-10 rounded">
                    {heatVec.map((val, j) => {
                      const norm = (val - minV) / range; // 0..1
                      const hue = 220 - Math.round(norm * 220); // blue -> cyan -> yellowish
                      const bg = `hsl(${hue}deg 80% ${Math.round(50 - norm * 22)}%)`;
                      return (
                        <div key={j} title={`${val.toFixed(6)}`} style={{ background: bg, height: 40, minWidth: 14 }} />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
