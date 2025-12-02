import React from "react";
import { motion } from "framer-motion";

export default function MLPFlowChart() {
  const box = "rounded-xl shadow-lg px-4 py-3 bg-slate-800/60 backdrop-blur border border-slate-700";
  const arrow = (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center text-slate-400 text-xl"
    >
      ↓
    </motion.div>
  );

  function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-2">
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="text-sm text-slate-400">{subtitle}</div>
    </div>
  );
}

  return (
    <div className="w-full mt-10 mb-10">
       
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto p-6 rounded-2xl bg-slate-900/50 shadow-2xl border border-slate-800"
      >
        
        <h2 className="text-2xl font-semibold text-sky-300 mb-2">
          🔬 Token Transformation Inside the MLP Layer
        </h2>
         <SectionHeader
            subtitle="Where the model mixes features and forms deeper abstractions."
          />
          <p className="text-sm text-slate-300 mb-3">
            After attention, every token passes through a feed-forward neural network (MLP).
            This adds non-linear reasoning and deeper pattern formation.
          </p>

        {/* Hidden State Input */}
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={box}>
          <h3 className="text-lg font-semibold text-sky-200">Hidden State (4096 dims)</h3>
          <p className="text-slate-400 text-sm">
            The token’s current meaning — encoded as a large vector.
          </p>
        </motion.div>

        {arrow}

        {/* Expand */}
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={box}>
          <h3 className="text-lg font-semibold text-teal-300">① Expand Layer (W1)</h3>
          <p className="text-slate-400 text-sm">
            Vector is expanded to a larger space (~14,000 dims).  
            This lets the model explore many possible meanings.
          </p>
        </motion.div>

        {arrow}

        {/* GELU */}
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={box}>
          <h3 className="text-lg font-semibold text-purple-300">② GELU Activation</h3>
          <p className="text-slate-400 text-sm">
            Non-linear filtering that keeps useful features  
            and discards noise. Adds reasoning & abstraction.
          </p>
        </motion.div>

        {arrow}

        {/* Shrink */}
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={box}>
          <h3 className="text-lg font-semibold text-orange-300">③ Shrink Layer (W2)</h3>
          <p className="text-slate-400 text-sm">
            Compresses the vector back to model size (4096 dims)  
            — now refined and semantically richer.
          </p>
        </motion.div>

        {arrow}

        {/* Output */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={box}>
          <h3 className="text-lg font-semibold text-green-300">New Hidden State</h3>
          <p className="text-slate-400 text-sm">
            Final refined meaning passed to the next transformer block  
            & used to predict the next token.
          </p>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-slate-800/40 border border-slate-700 rounded-xl"
        >
          <h3 className="text-center font-semibold text-sky-300">🧠 Why the MLP Matters</h3>
          <p className="text-slate-300 text-sm mt-2 text-center">
            If attention decides <span className="text-sky-400">who to look at</span>,  
            the MLP decides <span className="text-sky-400">what meaning to extract</span>.  
            Together they turn raw tokens into intelligent reasoning.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
