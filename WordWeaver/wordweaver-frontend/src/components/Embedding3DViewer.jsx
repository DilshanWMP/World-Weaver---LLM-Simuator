// src/components/Embedding3DViewer.jsx
import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import { PCA } from "ml-pca";

/*
  Embedding3DViewer
  - embeddings: array of { token, token_id, embedding: [floats] }
  - options: internal constants: maxPoints, showArrows
  - Uses PCA for deterministic reduction (PCA is deterministic for fixed input)
  - Limits to last maxPoints to keep PCA stable
*/

function normalize(vec) {
  const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0)) || 1;
  return vec.map((x) => x / norm);
}

function shortVals(arr, n = 6) {
  if (!arr) return "";
  return arr.slice(0, n).map((v) => Number(v).toFixed(4)).join(", ");
}

export default function Embedding3DViewer({ embeddings = [] }) {
  // configuration
  const maxPoints = 30; // keep PCA stable and UI responsive
  const showArrows = true; // draw lines from origin

  const plotData = useMemo(() => {
    if (!embeddings || embeddings.length === 0) return null;

    // only keep the last maxPoints embeddings for the 3D view
    const slice = embeddings.slice(-maxPoints);

    // defensive: ensure every entry has embedding array
    const valid = slice.filter((e) => Array.isArray(e.embedding) && e.embedding.length > 0);
    if (valid.length === 0) return null;

    const tokens = valid.map((e) => `${e.token} (${e.token_id})`);
    // convert to numeric arrays and normalize
    const vectors = valid.map((e) => {
      // defensive: if embedding has NaNs or undefined, fallback to zeros
      const vec = e.embedding.map((v) => (Number.isFinite(v) ? v : 0));
      return normalize(vec);
    });

    // PCA reduction to 3 components
    let transformed;
    try {
      const pca = new PCA(vectors, { center: true, scale: false });
      const pred = pca.predict(vectors, { nComponents: 3 });
      // ml-pca predict returns Matrix object — to2DArray available
      transformed = Array.isArray(pred) ? pred : (pred.to2DArray ? pred.to2DArray() : pred);
      // defensive: ensure transformed is array of arrays
      if (!Array.isArray(transformed) || !Array.isArray(transformed[0])) {
        // fallback: map first 3 dims of original vectors
        transformed = vectors.map((v) => [v[0] || 0, v[1] || 0, v[2] || 0]);
      }
    } catch (err) {
      // fallback to first 3 dims (if PCA fails)
      console.warn("PCA failed, falling back to raw projection:", err);
      transformed = vectors.map((v) => [v[0] || 0, v[1] || 0, v[2] || 0]);
    }

    // Optionally normalize projected points to unit-sphere for consistent visual scale
    const spherePoints = transformed.map((pt) => {
      const n = Math.sqrt((pt[0] || 0) ** 2 + (pt[1] || 0) ** 2 + (pt[2] || 0) ** 2) || 1;
      return [pt[0] / n, pt[1] / n, pt[2] / n];
    });

    // Build scatter trace for points
    const xs = spherePoints.map((p) => p[0]);
    const ys = spherePoints.map((p) => p[1]);
    const zs = spherePoints.map((p) => p[2]);

    const text = valid.map((e, i) => {
      return `${tokens[i]} › dims: ${shortVals(valid[i].embedding, 8)}`;
    });

    const pointsTrace = {
      type: "scatter3d",
      mode: "markers+text",
      x: xs,
      y: ys,
      z: zs,
      text: tokens,
      hovertext: text,
      hoverinfo: "text",
      textposition: "top center",
      marker: {
        size: Math.max(4, 9 - Math.floor(valid.length / 4)), // smaller markers if many points
        color: valid.map((_, i) => i), // let plotly color scale if desired
        colorscale: "Viridis",
        opacity: 0.95,
        showscale: false,
      },
      name: "tokens",
    };

    // Arrow/line traces
    const arrowTraces = showArrows
      ? spherePoints.map((p, i) => ({
          type: "scatter3d",
          mode: "lines",
          x: [0, p[0]],
          y: [0, p[1]],
          z: [0, p[2]],
          line: { width: 3, color: "rgba(255,255,255,0.7)" },
          hoverinfo: "none",
          showlegend: false,
        }))
      : [];

    // axis lines (centered, slightly extended)
    const axes = [
      {
        type: "scatter3d",
        mode: "lines",
        x: [-1.2, 1.2],
        y: [0, 0],
        z: [0, 0],
        line: { width: 4, color: "red" },
        name: "X axis",
        hoverinfo: "skip",
      },
      {
        type: "scatter3d",
        mode: "lines",
        x: [0, 0],
        y: [-1.2, 1.2],
        z: [0, 0],
        line: { width: 4, color: "green" },
        name: "Y axis",
        hoverinfo: "skip",
      },
      {
        type: "scatter3d",
        mode: "lines",
        x: [0, 0],
        y: [0, 0],
        z: [-1.2, 1.2],
        line: { width: 4, color: "blue" },
        name: "Z axis",
        hoverinfo: "skip",
      },
    ];

    return [pointsTrace, ...arrowTraces, ...axes];
  }, [embeddings]);

  if (!plotData) {
    return <div className="text-slate-400">Generate tokens to see embeddings (3D view).</div>;
  }

  const layout = {
    autosize: true,
    margin: { l: 0, r: 0, b: 0, t: 0 },
    scene: {
      aspectmode: "cube",
      xaxis: { title: "X", showgrid: true, zeroline: true, backgroundcolor: "#051321" },
      yaxis: { title: "Y", showgrid: true, zeroline: true, backgroundcolor: "#051321" },
      zaxis: { title: "Z", showgrid: true, zeroline: true, backgroundcolor: "#051321" },
      bgcolor: "#071218",
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    showlegend: false,
    hovermode: "closest",
  };

  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["select2d", "lasso2d", "autoScale2d"],
  };

  // style wrapper makes Plot responsive and gives a clean size
  return (
    <div style={{ width: "100%", height: 640 }}>
      <Plot
        data={plotData}
        layout={{ ...layout, width: undefined, height: 640 }}
        config={config}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler={true}
      />
    </div>
  );
}
