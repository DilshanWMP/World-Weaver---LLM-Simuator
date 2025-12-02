// src/components/InternalInspector.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import Embedding3DViewer from "./Embedding3DViewer";

function shortVals(arr, n = 24) {
  if (!arr) return "";
  if (arr.length <= n) return arr.map(v => Number(v).toFixed(4)).join(", ");
  return arr.slice(0, n).map(v => Number(v).toFixed(4)).join(", ") + ", ...";
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-2">
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="text-sm text-slate-400">{subtitle}</div>
    </div>
  );
}

// number of tokens to SHOW in the "Token Embeddings" section  
const numTokensForEmbeddings = 3;


export default function InternalInspector({
  context,
  numTokens = 9999,
  autoRefreshTrigger = 0,
  onUpdate = () => {}
}) {
  const [data, setData] = useState(null);
  const [allEmbeddings, setAllEmbeddings] = useState([]);
  const [loading, setLoading] = useState(false);

  /** 🔄 Fetch internals whenever PromptBox generates a new token */
  useEffect(() => {
    if (!context || !context.trim()) {
      setData(null);
      setAllEmbeddings([]);
      onUpdate(null);
      return;
    }
    fetchInternals();
  }, [autoRefreshTrigger]);

  async function fetchInternals() {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/internal_forward",
        { context, num_tokens: numTokens, layer_index: -1 },
        { timeout: 150000 }
      );

      const d = res.data;
      setData(d);
      onUpdate(d);

      // Merge embeddings with dedupe (limit to last 30 for stable PCA)
      if (d?.embeddings_selected?.length) {
        setAllEmbeddings(prev => {
          const map = new Map();

          // keep only last 30 for performance
          [...prev, ...d.embeddings_selected].slice(-30).forEach(item => {
            map.set(item.token_id, item);
          });

          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.error("InternalInspector error:", err);
    }
    setLoading(false);
  }

  if (!data) {
    return (
      <div className="card">
        <div className="text-slate-400">
          Generate a token to begin the internal visualization.
        </div>
      </div>
    );
  }

  const lastN = (data.embeddings_selected || []).slice(-numTokensForEmbeddings);


  return (
    <div className="w-full space-y-10">

      {/* 0. ALL TOKENS */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700">
        <SectionHeader
          title="0. All Tokens (Full Sequence)"
          subtitle="The complete list of tokens produced so far."
        />

        <div className="flex flex-wrap gap-2">
          {(data.tokens_selected || []).map((t, i) => (
            <div
              key={i}
              className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-sm"
            >
              {i + 1}. {t}
            </div>
          ))}
        </div>
      </div>

      {/* 1. EMBEDDINGS */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700">
        <SectionHeader
          title={`1. Token Embeddings (Last ${numTokensForEmbeddings} Tokens)`}
           subtitle="LLMs convert tokens into high-dimensional vectors that encode meaning, context, and relationships."
          />

          <p className="text-sm text-slate-300 mb-3">
            Each token has:
            <br />• A <span className="text-emerald-400 font-semibold">Token Embedding</span> ← the model’s learned meaning
            <br />• A <span className="text-sky-400 font-semibold">Position Vector</span> ← where in the sentence the token appears
          </p>
        {lastN.map((t, i) => (
          <div
            key={t.token_id ?? i}
            className="p-3 bg-slate-800 rounded-lg border border-slate-700 mb-3"
          >
            <div className="text-slate-300 text-sm">
              Token:
              <span className="text-white font-bold"> {t.token}</span>
              &nbsp; | ID:
              <span className="text-amber-400"> {t.token_id}</span>
            </div>

            <div className="text-xs text-slate-400 mt-2">
              <span className="font-semibold text-emerald-400">
                Embedding (first 24 dims):
              </span>
              <br />
              {shortVals(t.embedding, 24)}
            </div>

            {t.position && (
              <div className="text-xs text-slate-400 mt-2">
                <span className="font-semibold text-sky-400">
                  Position Vector (first 24 dims):
                </span>
                <br />
                {shortVals(t.position, 24)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 2. 3D EMBEDDING SPACE */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700">
        <SectionHeader
          title="2. 3D Embedding Space"
          subtitle="Visualizing all tokens in reduced semantic space (PCA)."
        />

        <p className="text-sm text-slate-300 mb-3">
          Tokens with similar meaning appear closer together.  
          Only last 30 tokens are shown for stability & performance.
        </p>

        <Embedding3DViewer embeddings={allEmbeddings} />
      </div>

      {/* 3. ATTENTION MECHANISM */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700">
        <SectionHeader
          title="3. Attention Mechanism"
          subtitle="How each token decides which earlier tokens are important."
        />

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="font-semibold text-purple-300">Query</div>
            <div className="text-sm text-slate-300">“What am I looking for?”</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="font-semibold text-orange-300">Key</div>
            <div className="text-sm text-slate-300">“What information do I contain?”</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="font-semibold text-emerald-300">Value</div>
            <div className="text-sm text-slate-300">
              “What information should I pass forward if I matter?”
            </div>
          </div>
        </div>
      </div>

      {/* 4. ATTENTION MATRIX */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700">
        <SectionHeader
          title="4. Attention Matrix"
          subtitle="Weights showing how much each token attends to all others."
        />

        {Array.isArray(data.attention_matrix_selected) &&
        data.attention_matrix_selected.length > 0 ? (
          <div className="overflow-auto mt-3">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th></th>
                  {data.tokens_selected.map((t, i) => (
                    <th key={i} className="px-2 py-1 text-slate-400">
                      K{i + 1}
                      <br />
                      <span className="text-white">{t}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.attention_matrix_selected.map((row, r) => (
                  <tr key={r}>
                    <td className="px-2 py-1 text-slate-400 font-bold">
                      Q{r + 1}
                      <br />
                      <span className="text-white">{data.tokens_selected[r]}</span>
                    </td>

                    {row.map((v, c) => {
                      const bg = `rgba(59,130,246, ${
                        0.15 + Math.min(0.85, v)
                      })`;
                      return (
                        <td
                          key={c}
                          className="text-center px-2 py-1"
                          style={{ background: bg }}
                        >
                          {v.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-slate-400 text-sm">Attention not available.</div>
        )}
      </div>
    </div>
  );
}
