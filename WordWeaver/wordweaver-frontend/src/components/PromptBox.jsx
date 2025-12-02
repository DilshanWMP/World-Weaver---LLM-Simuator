// src/components/PromptBox.jsx
import React, { useState } from "react";
import axios from "axios";

const presets = [
  "Once upon a time",
  "The quick brown fox",
  "In a world where",
  "I love programming because",
  "During the storm, the",
  "Researchers discovered a new"
];

export default function PromptBox({
  context,
  setContext,
  output,
  setOutput,
  setLastToken,
  setCandidates,
  setProbs,
  setTokenIds,
  modelName,
  temperature,
  topK,
  speed,
  setAutoRefreshTrigger // <-- new prop accepted
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateNext = async () => {
    setError("");
    const ctx = output && output.length ? output : context;
    if (!ctx || !ctx.trim()) {
      setError("Please type a prompt or choose a preset before generating.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/generate", {
        context: ctx,
        temperature: temperature,
        top_k: topK
      }, { timeout: 120000 });

      const data = res.data;
      const nextToken = data.next_token ?? "";
      const cands = data.candidates ?? [];
      const probs = data.probs ?? [];

      // spacing heuristics like streamlit
      let newOutput = output && output.length ? output : context;
      if (nextToken.startsWith(" ")) {
        newOutput = newOutput + nextToken;
      } else {
        newOutput = (newOutput + " " + nextToken).trim();
      }

      setOutput(newOutput);
      setLastToken(nextToken);
      setCandidates(cands);
      setProbs(probs);

      // token ids: if backend returned token ids in data.token_ids, set them
      if (data.token_ids) {
        setTokenIds(data.token_ids);
      } else {
        const guessed = newOutput.split(/\s+/).map((_, i) => i + 1);
        setTokenIds(guessed);
      }

      // ---- IMPORTANT: notify inspector to refresh internals ----
      if (typeof setAutoRefreshTrigger === "function") {
        setAutoRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("generate error", err);
      // fallback sampling behavior
      const fallbackPool = ["the", "a", "story", "world", "time", "data", "love", "storm", "new", "city", "this", "that", "an", "model", "people", "night", "light", "voice", "found"];
      const nextToken = " " + fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
      const newOutput = (output && output.length ? output : context) + nextToken;
      setOutput(newOutput);
      setLastToken(nextToken);
      setCandidates([nextToken]);
      setProbs([1.0]);
      setTokenIds(newOutput.split(/\s+/).map((_, i) => i + 1));
      setError("Model/Backend error — used fallback token.");

      // ensure inspector still refreshes so UI remains consistent
      if (typeof setAutoRefreshTrigger === "function") {
        setAutoRefreshTrigger(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const doReset = () => {
    setContext("");
    setOutput("");
    setLastToken("");
    setCandidates([]);
    setProbs([]);
    setTokenIds([]);
    setError("");

    // reset inspector too (optional): trigger a refresh so it clears
    if (typeof setAutoRefreshTrigger === "function") {
      setAutoRefreshTrigger(prev => prev + 1);
    }
  };

  return (
    <div className="card">
      <div className="mb-3 text-slate-300">Input Prompt — type your prompt or choose a preset.</div>

      <textarea
        rows={4}
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Type prompt..."
        className="w-full p-3 bg-slate-800 rounded-md text-slate-100"
      />

      <div className="mt-3 flex gap-2 flex-wrap">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => {
              setContext(p);
              setOutput(p);
              // simple tokenization for UI
              setTokenIds(p.split(/\s+/).map((_, i) => i + 1));

              // Immediately trigger inspector to reflect the preset selection
              if (typeof setAutoRefreshTrigger === "function") {
                setAutoRefreshTrigger(prev => prev + 1);
              }
            }}
            className="px-3 py-1 bg-slate-700 rounded-md text-sm hover:bg-slate-600"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={generateNext} disabled={loading} className="px-4 py-2 bg-emerald-600 rounded-md hover:bg-emerald-500">
          {loading ? "Generating..." : "Generate Next Token"}
        </button>
        <button onClick={doReset} className="px-4 py-2 bg-rose-600 rounded-md hover:bg-rose-500">Reset</button>
      </div>

      {error && <div className="mt-2 text-sm text-rose-300">{error}</div>}
    </div>
  );
}
