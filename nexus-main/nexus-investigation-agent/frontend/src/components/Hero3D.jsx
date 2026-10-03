import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Hero3D — Semantic 3D intelligence scene for NEXUS.
 *
 * Visual concept: "Secure Academic Evidence Intelligence System"
 * ─ Central NEXUS core (pulsing icosahedron)
 * ─ 8 module nodes representing actual NEXUS capabilities
 * ─ Semantic connection lines (evidence flows through the system)
 * ─ Animated data-flow particles along connections
 * ─ Hexagonal security grid geometry (cybersecurity aesthetic)
 * ─ Background star-field particles
 * ─ Mouse parallax camera
 * ─ Reduced-motion support
 *
 * Accepts a `mousePos` prop { x: [-1,1], y: [-1,1] } for parallax.
 * Renders into whatever size container it is placed in.
 */

const PI  = Math.PI;
const TAU = PI * 2;

// ── NEXUS module definitions ───────────────────────────────────────────────
// Each node represents a real application module.
const MODULES = [
  { name: 'Documents',    color: 0x3b82f6, pos: [ 16,  2,  2 ] }, // blue
  { name: 'Evidence',     color: 0x8b5cf6, pos: [ 11, -3, 13 ] }, // violet
  { name: 'RAG / AI',     color: 0x22d3ee, pos: [  0,  5, 17 ] }, // cyan
  { name: 'Criteria',     color: 0xf59e0b, pos: [-12, -2, 13 ] }, // amber
  { name: 'Knowledge',    color: 0x10b981, pos: [-17,  3, -1 ] }, // emerald
  { name: 'Citations',    color: 0x14b8a6, pos: [-11, -4,-13 ] }, // teal
  { name: 'Evaluation',   color: 0x6366f1, pos: [  0,  2,-17 ] }, // indigo
  { name: 'Audit Trail',  color: 0xf43f5e, pos: [ 11, -3,-13 ] }, // rose
];

// ── Semantic connections (indices into MODULES) ───────────────────────────
// These represent how evidence flows: Documents → Evidence → RAG → Criteria → … → Audit
const MODULE_EDGES = [
  [0, 1], // Documents → Evidence
  [1, 2], // Evidence  → RAG
  [2, 3], // RAG       → Criteria
  [3, 4], // Criteria  → Knowledge Graph
  [4, 5], // Knowledge → Citations
  [5, 7], // Citations → Audit
  [2, 6], // RAG       → Evaluation
  [6, 7], // Evaluation→ Audit
];

// How many data-flow particles per connection edge
const FLOW_PER_EDGE = 4;

export default function Hero3D({ mousePos }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const prefersReducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Renderer ──────────────────────────────────────────────────────────
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch { return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // ── Scene / Camera ────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    scene.fog    = new THREE.FogExp2(0x030112, 0.009);

    const camera = new THREE.PerspectiveCamera(52, el.clientWidth / el.clientHeight, 0.1, 300);
    camera.position.set(0, 4, 55);

    // ── Lights ────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x120830, 4));

    const pCore  = new THREE.PointLight(0x9b6de3, 9, 90);
    pCore.position.set(0, 0, 0);
    scene.add(pCore);

    const pCyan  = new THREE.PointLight(0x22d3ee, 5, 70);
    pCyan.position.set(18, 10, 10);
    scene.add(pCyan);

    const pBlue  = new THREE.PointLight(0x3b82f6, 4, 60);
    pBlue.position.set(-18, -8, -10);
    scene.add(pBlue);

    // ── Central NEXUS Core ────────────────────────────────────────────────
    // Inner solid
    const coreGeo = new THREE.IcosahedronGeometry(4.2, 3);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x7c3aed, emissive: 0x4c1d95, emissiveIntensity: 0.7,
      transparent: true, opacity: 0.92, shininess: 140,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Outer wireframe shell
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.14,
    });
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(6.0, 2), shellMat);
    scene.add(shell);

    // Cyan torus ring (security perimeter)
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(8.5, 0.065, 10, 80),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.28 })
    );
    ring1.rotation.x = PI * 0.3;
    scene.add(ring1);

    // Second tilted ring (depth)
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(7.0, 0.045, 8, 60),
      new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.18 })
    );
    ring2.rotation.z = PI * 0.25;
    scene.add(ring2);

    // ── Background hex security grid ──────────────────────────────────────
    // A large flat hexagonal wireframe in the far background
    const hexBg = new THREE.Mesh(
      new THREE.CylinderGeometry(55, 55, 0.1, 6),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.030 })
    );
    hexBg.rotation.x = PI / 2;
    hexBg.position.set(0, 0, -32);
    scene.add(hexBg);

    // Closer smaller hex (around the core)
    const hexMid = new THREE.Mesh(
      new THREE.CylinderGeometry(22, 22, 0.1, 6),
      new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.055 })
    );
    hexMid.rotation.x = PI / 2;
    scene.add(hexMid);

    // ── Module nodes ──────────────────────────────────────────────────────
    const nodeGeo = new THREE.IcosahedronGeometry(0.78, 1);
    const ringGeo = new THREE.TorusGeometry(1.35, 0.045, 6, 28);

    const nodeObjects = MODULES.map((mod) => {
      const mat = new THREE.MeshPhongMaterial({
        color: mod.color, emissive: mod.color, emissiveIntensity: 0.55,
        transparent: true, opacity: 0.90, shininess: 100,
      });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      mesh.position.set(...mod.pos);
      mesh.userData = {
        basePos: new THREE.Vector3(...mod.pos),
        phase: Math.random() * TAU,
        speed: 0.35 + Math.random() * 0.25,
      };

      // Small orbiting ring around each node
      const nodRing = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: mod.color, transparent: true, opacity: 0.38 })
      );
      nodRing.rotation.x = PI / 2;
      mesh.add(nodRing);

      scene.add(mesh);
      return mesh;
    });

    // ── Static connection lines: core → each node ─────────────────────────
    MODULES.forEach((mod, i) => {
      const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...mod.pos)];
      scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: mod.color, transparent: true, opacity: 0.12 })
      ));
    });

    // ── Semantic edge lines (node-to-node) ────────────────────────────────
    MODULE_EDGES.forEach(([a, b]) => {
      const pts = [new THREE.Vector3(...MODULES[a].pos), new THREE.Vector3(...MODULES[b].pos)];
      // color blended toward cyan for these semantic edges
      scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.10 })
      ));
    });

    // ── Data-flow particles along semantic edges ──────────────────────────
    const flowData = []; // { start, end, t, speed, color }
    MODULE_EDGES.forEach(([a, b]) => {
      const start = new THREE.Vector3(...MODULES[a].pos);
      const end   = new THREE.Vector3(...MODULES[b].pos);
      for (let k = 0; k < FLOW_PER_EDGE; k++) {
        flowData.push({
          start, end,
          t:     k / FLOW_PER_EDGE,          // stagger offsets
          speed: 0.0025 + Math.random() * 0.002,
          color: MODULES[b].color,
        });
      }
    });

    const flowCount = flowData.length;
    const flowPos   = new Float32Array(flowCount * 3);
    const flowColors = new Float32Array(flowCount * 3);
    const flowGeo   = new THREE.BufferGeometry();
    flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
    flowGeo.setAttribute('color',    new THREE.BufferAttribute(flowColors, 3));

    // Pre-fill vertex colors
    const tmp = new THREE.Color();
    flowData.forEach((fp, i) => {
      tmp.set(fp.color);
      flowColors[i * 3]     = tmp.r;
      flowColors[i * 3 + 1] = tmp.g;
      flowColors[i * 3 + 2] = tmp.b;
    });
    flowGeo.attributes.color.needsUpdate = true;

    const flowMat    = new THREE.PointsMaterial({
      size: 0.32, vertexColors: true,
      transparent: true, opacity: 0.88, sizeAttenuation: true,
    });
    scene.add(new THREE.Points(flowGeo, flowMat));

    // ── Background star particles ─────────────────────────────────────────
    const STAR_COUNT = 280;
    const starPos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const r     = 22 + Math.random() * 32;
      const theta = Math.random() * TAU;
      const phi   = Math.acos(2 * Math.random() - 1);
      starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xd4b4fe, size: 0.22, transparent: true, opacity: 0.45, sizeAttenuation: true })
    ));

    // ── Resize handler ────────────────────────────────────────────────────
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Animation loop ────────────────────────────────────────────────────
    let animId;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (prefersReducedMotion) {
        renderer.render(scene, camera);
        return;
      }
      t += 0.007;

      // Core rotation
      core.rotation.y  =  t * 0.16;
      core.rotation.x  =  Math.sin(t * 0.10) * 0.12;
      shell.rotation.y = -t * 0.09;
      shell.rotation.z =  t * 0.06;

      // Security rings
      ring1.rotation.z = t * 0.08;
      ring2.rotation.y = t * 0.12;

      // Hex grid slow drift
      hexMid.rotation.z = t * 0.04;

      // Node float + ring spin
      nodeObjects.forEach((n) => {
        const { basePos, phase, speed } = n.userData;
        n.position.y = basePos.y + Math.sin(t * speed + phase) * 0.9;
        n.position.x = basePos.x + Math.cos(t * speed * 0.7 + phase) * 0.3;
        // child ring spin
        if (n.children[0]) n.children[0].rotation.z = t * (0.8 + phase * 0.1);
      });

      // Data-flow particles along semantic edges
      const fp = flowGeo.attributes.position.array;
      flowData.forEach((p, i) => {
        p.t += p.speed;
        if (p.t > 1) p.t -= 1;
        fp[i * 3]     = p.start.x + (p.end.x - p.start.x) * p.t;
        fp[i * 3 + 1] = p.start.y + (p.end.y - p.start.y) * p.t;
        fp[i * 3 + 2] = p.start.z + (p.end.z - p.start.z) * p.t;
      });
      flowGeo.attributes.position.needsUpdate = true;

      // Core pulse
      coreMat.emissiveIntensity = 0.55 + Math.sin(t * 1.6) * 0.12;
      pCore.intensity = 8 + Math.sin(t * 2.0) * 1.5;

      // Camera parallax + slow orbit
      const mx = (mousePos?.x ?? 0);
      const my = (mousePos?.y ?? 0);
      camera.position.x = Math.sin(t * 0.05) * 7 + mx * 5;
      camera.position.y = 4 + Math.sin(t * 0.037) * 3 + my * 3.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);  // only mount once

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />;
}
