import React, { useState } from "react";
import PromptBox from "../components/PromptBox";
import OutputBox from "../components/OutputBox";
import TokenTable from "../components/TokenTable";
import ProbChart from "../components/ProbChart";
import Transformer3D from "../components/Transformer3D";
import SidePanel from "../components/SidePanel";

export default function Home() {
  // main app state
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [lastToken, setLastToken] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [probs, setProbs] = useState([]);
  const [tokenIds, setTokenIds] = useState([]);

  // Controls (sidebar-controlled)
  const [modelName, setModelName] = useState("meta-llama/Llama-3.2-3B");
  const [temperature, setTemperature] = useState(0.8);
  const [topK, setTopK] = useState(8);
  const [speed, setSpeed] = useState(0.25);

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
          />

          <OutputBox output={output} lastToken={lastToken} />

          <TokenTable
            tokens={output ? outputTokens(output) : []}
            tokenIds={tokenIds}
          />
        </div>

        {/* Right side: 3D + probabilities */}
        <div className="space-y-6">
          <Transformer3D
            tokens={output ? outputTokens(output).slice(-24) : []}
            speed={speed}
          />

          <ProbChart candidates={candidates} probs={probs} />
        </div>

      </div>
    </div>
  );
}

// Helper tokenizer fallback
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
