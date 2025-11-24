import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/*
  This component reproduces the same three.js sprite flow you had in app.py
  tokens: array of token strings
  speed: animation speed (0.0 fastest) — maps to sprite Z increment.
*/

export default function Transformer3D({ tokens = [], speed = 0.25 }) {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = 380;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    camera.position.z = 50;

    const layers = 6;
    const sprites = [];

    function makeSprite(text) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const size = 256;
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);
      ctx.font = "bold 36px Arial";
      ctx.fillStyle = "#0b2";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text || "", size / 2, size / 2);
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      return new THREE.Sprite(material);
    }

    for (let i = 0; i < tokens.length; i++) {
      const sp = makeSprite(tokens[i] || "");
      const layer = i % layers;
      sp.position.x = (Math.random() - 0.5) * 40;
      sp.position.y = (Math.random() - 0.5) * 18;
      sp.position.z = -layer * 10 - Math.random() * 4;
      sp.scale.set(6, 6, 1);
      scene.add(sp);
      sprites.push(sp);
    }

    let rafId;
    const speedFactor = Math.max(0.01, 0.12 * Math.max(0, (1 - speed))); // map slider to speed
    function animate() {
      rafId = requestAnimationFrame(animate);
      for (let i = 0; i < sprites.length; i++) {
        const s = sprites[i];
        s.position.z += 0.08 + speedFactor;
        s.rotation.z += 0.001;
        if (s.position.z > 30) s.position.z = -layers * 10 - Math.random() * 6;
      }
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      const w = container.clientWidth;
      renderer.setSize(w, height);
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      // remove children and textures
      sprites.forEach((s) => {
        if (s.material && s.material.map) s.material.map.dispose();
        if (s.material) s.material.dispose();
        scene.remove(s);
      });
    };
  }, [tokens, speed]);

  return (
    <div className="card">
      <div className="mb-2 text-slate-300">Transformer layers — visual simulation</div>
      <div ref={containerRef} style={{ width: "100%", height: 420, borderRadius: 8, overflow: "hidden", background: "#f8fafc" }} />
    </div>
  );
}
