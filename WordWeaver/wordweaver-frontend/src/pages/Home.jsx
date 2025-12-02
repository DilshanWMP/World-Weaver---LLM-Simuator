// wordweaver-frontend/src/pages/Home.jsx

import React, { useState } from "react";
import PromptBox from "../components/PromptBox";
import OutputBox from "../components/OutputBox";

import ProbChart from "../components/ProbChart";
import Transformer3D from "../components/Transformer3D";
import SidePanel from "../components/SidePanel";

import InternalInspector from "../components/InternalInspector";
import MLPFlowChart from "../components/MLPFlowChart";
import LogitsPanel from "../components/LogitsPanel";

export default function Home() {
  // main app state
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [lastToken, setLastToken] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [probs, setProbs] = useState([]);
  const [tokenIds, setTokenIds] = useState([]);
  const [autoRefreshTrigger, setAutoRefreshTrigger] = useState(0);


  // internals from inspector (set by InternalInspector via onUpdate)
  const [internals, setInternals] = useState(null);

  // Controls (sidebar-controlled)
  const [modelName, setModelName] = useState("meta-llama/Llama-3.2-3B");
  const [temperature, setTemperature] = useState(0.8);
  const [topK, setTopK] = useState(8);
  const [speed, setSpeed] = useState(0.25);

  function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-2">
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="text-sm text-slate-400">{subtitle}</div>
    </div>
  );
}

  return (
    <div className="ml-10 mt-5">
      {/* Top navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-6 bg-gradient-to-r from-slate-900 to-slate-950 text-sky-100 shadow-lg">
        <div className="text-4xl font-semibold flex items-center gap-3 ml-10 mt-5">
          <span>🧵</span> <span>Word Weaver - LLM Simulator</span>
        </div>
        <div className="flex-1" />
        <div className="text-sm text-slate-300">Offline demo</div>
      </div>

      {/* Sidebar (floating UI) */}
      <SidePanel
        modelName={modelName}
        setModelName={setModelName}
        temperature={temperature}
        setTemperature={setTemperature}
        topK={topK}
        setTopK={setTopK}
        speed={speed}
        setSpeed={setSpeed}
      />

      {/* Main content grid */}
      <div className="pt-20 px-6 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left side: input + output + tokens */}
        <div className="lg:col-span-2 space-y-6">
          <PromptBox
            context={context}
            setContext={setContext}
            output={output}
            setOutput={setOutput}
            setLastToken={setLastToken}
            setCandidates={setCandidates}
            setProbs={setProbs}
            setTokenIds={setTokenIds}
            modelName={modelName}
            temperature={temperature}
            topK={topK}
            speed={speed}
            setAutoRefreshTrigger={setAutoRefreshTrigger}

          />

          <OutputBox output={output} lastToken={lastToken} />

          {/* Internal inspector shows tokens, embeddings, positional vectors, attention & 3D */}
          <InternalInspector
            context={output ? output : context}
            numTokens={9999}
            autoRefreshTrigger={autoRefreshTrigger}
            onUpdate={(d) => setInternals(d)}
          />


        </div>
        

        {/* Right side: 3D + MLP + logits + probs */}
        <div className="space-y-6">
          <Transformer3D
            tokens={output ? outputTokens(output).slice(-24) : []}
            speed={speed}
          />

          {/* MLP Flow diagram */}
          <MLPFlowChart />

          {/* Logits panel powered by internals */}
          <LogitsPanel logits={internals?.logits} temperature={temperature} />

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700">
          <SectionHeader
            title="7. Softmax & Token Probabilities"
            subtitle="Softmax turns logits into probabilities that sum to 1."
          />

          <p className="text-sm text-slate-300 mb-2">
            Softmax amplifies differences — the highest logits become the highest probability next-token choices.
          </p>

          <p className="text-sm text-slate-300">
            <span className="text-amber-400 font-semibold">Temperature</span> controls randomness:
            <br/>• Low temperature → focused, predictable  
            <br/>• High temperature → more creative and chaotic  
          </p>
        </div>

          {/* Next-word probabilities */}
          <ProbChart candidates={candidates} probs={probs} />
        </div>

      </div>
    </div>
  );
}

// Helper tokenizer fallback (same as before)
function outputTokens(text) {
  if (!text) return [];
  const parts = [];
  let token = "";

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    token += ch;
    if (ch === " " || i === text.length - 1) {
      parts.push(token);
      token = "";
    }
  }
  if (token) parts.push(token);
  return parts.length ? parts : [text];
}
