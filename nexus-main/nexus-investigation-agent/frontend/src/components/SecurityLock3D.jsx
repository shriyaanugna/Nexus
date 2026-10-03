import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const TAU = Math.PI * 2;
const PI  = Math.PI;

const EVIDENCE_NODES = [
  { label: 'DOCS',    color: 0x3b82f6, angle: 0,              radius: 4.8, yOffset:  0.8 },
  { label: 'CRIT',    color: 0xf59e0b, angle: TAU / 6,        radius: 5.2, yOffset: -0.5 },
  { label: 'RAG',     color: 0x22d3ee, angle: TAU * 2 / 6,    radius: 4.6, yOffset:  1.2 },
  { label: 'EVID',    color: 0x8b5cf6, angle: TAU * 3 / 6,    radius: 5.0, yOffset: -0.3 },
  { label: 'AUDIT',   color: 0xf43f5e, angle: TAU * 4 / 6,    radius: 4.7, yOffset:  0.6 },
  { label: 'KG',      color: 0x10b981, angle: TAU * 5 / 6,    radius: 5.1, yOffset: -0.9 },
];

export default function SecurityLock3D({ mousePos, size = 'large' }) {
  const mountRef = useRef(null);
  
  // Track theme so the 3D scene can adapt to light/dark mode
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');
  const mousePosRef = useRef(mousePos);

  useEffect(() => {
    mousePosRef.current = mousePos;
  }, [mousePos]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') || 'light');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const isDark = theme === 'dark';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch { return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    scene.fog    = new THREE.FogExp2(isDark ? 0x020110 : 0xfaf7ff, 0.045);

    const fov    = size === 'small' ? 48 : 44;
    const camera = new THREE.PerspectiveCamera(fov, el.clientWidth / el.clientHeight, 0.1, 200);
    camera.position.set(0, 1.2, 14);

    scene.add(new THREE.AmbientLight(isDark ? 0x0a0520 : 0xffffff, isDark ? 6 : 2.5));

    const pCyan = new THREE.PointLight(isDark ? 0x22d3ee : 0x0ea5e9, isDark ? 8 : 4, 30);
    pCyan.position.set(3, 5, 8);
    scene.add(pCyan);

    const pViolet = new THREE.PointLight(0x7c3aed, isDark ? 10 : 6, 25);
    pViolet.position.set(-4, -2, 6);
    scene.add(pViolet);

    const pBlue = new THREE.PointLight(0x3b82f6, isDark ? 5 : 3, 20);
    pBlue.position.set(0, -5, 10);
    scene.add(pBlue);

    const lockGroup = new THREE.Group();
    scene.add(lockGroup);

    const housingGeo = new THREE.BoxGeometry(2.8, 2.4, 0.9, 4, 4, 2);
    const housingMat = new THREE.MeshPhongMaterial({
      color: isDark ? 0x1a1235 : 0xffffff,
      emissive: isDark ? 0x110d28 : 0xf2ecfa,
      emissiveIntensity: 0.4,
      shininess: 180,
      specular: isDark ? 0x22d3ee : 0x8b5cf6,
      transparent: true,
      opacity: isDark ? 0.97 : 0.85,
    });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.position.set(0, -0.5, 0);
    lockGroup.add(housing);

    const housingEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(housingGeo),
      new THREE.LineBasicMaterial({ color: isDark ? 0x22d3ee : 0x8b5cf6, transparent: true, opacity: isDark ? 0.22 : 0.4 })
    );
    housingEdge.position.copy(housing.position);
    lockGroup.add(housingEdge);

    const cornerRadius = 0.42;
    const corners = [
      [  1.4 - cornerRadius,  1.2 - cornerRadius ],
      [ -1.4 + cornerRadius,  1.2 - cornerRadius ],
      [  1.4 - cornerRadius, -1.7 + cornerRadius ],
      [ -1.4 + cornerRadius, -1.7 + cornerRadius ],
    ];
    corners.forEach(([cx, cy]) => {
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const a = (PI / 2) * (i / 10);
        pts.push(new THREE.Vector3(cx + Math.cos(a) * cornerRadius * 0.4, cy + Math.sin(a) * cornerRadius * 0.4, 0.46));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      lockGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: isDark ? 0x22d3ee : 0x8b5cf6, transparent: true, opacity: isDark ? 0.25 : 0.4 })));
    });

    const shackleMat = new THREE.MeshPhongMaterial({
      color: isDark ? 0x293060 : 0xffffff,
      emissive: isDark ? 0x0d1040 : 0xe6dcef,
      emissiveIntensity: 0.5,
      shininess: 220,
      specular: 0x7c3aed,
    });

    const leftPillar  = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.6, 16), shackleMat);
    leftPillar.position.set(-0.75, 1.1, 0);
    lockGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.6, 16), shackleMat);
    rightPillar.position.set( 0.75, 1.1, 0);
    lockGroup.add(rightPillar);

    const archGeo = new THREE.TorusGeometry(0.75, 0.22, 14, 30, PI);
    const arch = new THREE.Mesh(archGeo, shackleMat);
    arch.position.set(0, 1.9, 0);
    arch.rotation.z = PI;
    lockGroup.add(arch);

    const archEdge = new THREE.Line(
      (() => {
        const pts = [];
        for (let i = 0; i <= 24; i++) {
          const a = PI + (PI * i / 24);
          pts.push(new THREE.Vector3(Math.cos(a) * 0.75, Math.sin(a) * 0.75 + 1.9, 0));
        }
        return new THREE.BufferGeometry().setFromPoints(pts);
      })(),
      new THREE.LineBasicMaterial({ color: isDark ? 0x22d3ee : 0x8b5cf6, transparent: true, opacity: isDark ? 0.5 : 0.7 })
    );
    lockGroup.add(archEdge);

    const keyholeGroup = new THREE.Group();
    keyholeGroup.position.set(0, -0.45, 0.47);

    const khCircle = new THREE.Mesh(
      new THREE.CircleGeometry(0.34, 24),
      new THREE.MeshBasicMaterial({ color: isDark ? 0x050210 : 0xfaf7ff, transparent: true, opacity: 0.95 })
    );
    keyholeGroup.add(khCircle);

    const khRing = new THREE.Mesh(
      new THREE.RingGeometry(0.34, 0.42, 24),
      new THREE.MeshBasicMaterial({ color: isDark ? 0x22d3ee : 0x8b5cf6, transparent: true, opacity: isDark ? 0.7 : 0.9, side: THREE.DoubleSide })
    );
    keyholeGroup.add(khRing);

    const khStem = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 0.38),
      new THREE.MeshBasicMaterial({ color: isDark ? 0x050210 : 0xfaf7ff, transparent: true, opacity: 0.95 })
    );
    khStem.position.set(0, -0.34, 0.001);
    keyholeGroup.add(khStem);

    const khGlow = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 24),
      new THREE.MeshBasicMaterial({ color: isDark ? 0x22d3ee : 0x8b5cf6, transparent: true, opacity: 0.07, side: THREE.DoubleSide })
    );
    khGlow.position.z = -0.01;
    keyholeGroup.add(khGlow);

    lockGroup.add(keyholeGroup);

    [[-0.5], [0], [0.5]].forEach(([x], i) => {
      const led = new THREE.Mesh(
        new THREE.CircleGeometry(0.07, 12),
        new THREE.MeshBasicMaterial({ color: [0x10b981, 0x22d3ee, 0x8b5cf6][i], transparent: true, opacity: 0.9 })
      );
      led.position.set(x, -1.45, 0.46);
      lockGroup.add(led);
    });

    const secRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.07, 10, 64),
      new THREE.MeshBasicMaterial({ color: isDark ? 0x22d3ee : 0x3b82f6, transparent: true, opacity: isDark ? 0.5 : 0.4 })
    );
    secRing.position.set(0, -0.5, 0);
    lockGroup.add(secRing);

    for (let i = 0; i < 16; i++) {
      const a = (TAU / 16) * i;
      const r = 2.2;
      const pts = [
        new THREE.Vector3(Math.cos(a) * (r - 0.15), Math.sin(a) * (r - 0.15), 0),
        new THREE.Vector3(Math.cos(a) * (r + 0.15), Math.sin(a) * (r + 0.15), 0),
      ];
      const tick = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: isDark ? 0x22d3ee : 0x3b82f6, transparent: true, opacity: isDark ? 0.35 : 0.4 })
      );
      tick.position.set(0, -0.5, 0);
      lockGroup.add(tick);
    }

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.04, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: isDark ? 0.38 : 0.5 })
    );
    innerRing.position.set(0, -0.5, 0);
    lockGroup.add(innerRing);

    const scanPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 0.12),
      new THREE.MeshBasicMaterial({
        color: isDark ? 0x22d3ee : 0x8b5cf6, transparent: true, opacity: isDark ? 0.18 : 0.1, side: THREE.DoubleSide,
      })
    );
    scanPlane.position.set(0, -0.5, 0.5);
    lockGroup.add(scanPlane);

    const circuitLines = [
      [[-1.3, 0.3], [1.3, 0.3]],
      [[-0.8,-0.8], [0.8,-0.8]],
      [[-1.2,-0.2], [-0.5,-0.2]],
      [[ 0.5,-0.2], [1.2,-0.2]],
      [[-0.4,-1.1], [0.4,-1.1]],
      [[-0.9, 0.3], [-0.9,-0.2]],
      [[ 0.9, 0.3], [ 0.9,-0.2]],
      [[-0.4,-0.8], [-0.4,-1.1]],
      [[ 0.4,-0.8], [ 0.4,-1.1]],
    ];
    circuitLines.forEach(([[x1,y1],[x2,y2]]) => {
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x1, y1, 0.46),
          new THREE.Vector3(x2, y2, 0.46),
        ]),
        new THREE.LineBasicMaterial({ color: isDark ? 0x22d3ee : 0x8b5cf6, transparent: true, opacity: isDark ? 0.15 : 0.25 })
      );
      lockGroup.add(line);
    });

    const nodeObjects = EVIDENCE_NODES.map(({ color, angle, radius, yOffset }) => {
      const nodeGroup = new THREE.Group();
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius * 0.5;
      nodeGroup.position.set(x, yOffset, z);
      nodeGroup.userData = { basePos: new THREE.Vector3(x, yOffset, z), phase: Math.random() * TAU };

      const nodeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.55, 0.12),
        new THREE.MeshPhongMaterial({
          color, emissive: color, emissiveIntensity: 0.4,
          transparent: true, opacity: isDark ? 0.88 : 0.95, shininess: 80,
        })
      );
      nodeGroup.add(nodeMesh);

      const nodeRing = new THREE.Mesh(
        new THREE.RingGeometry(0.32, 0.38, 16),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: isDark ? 0.4 : 0.6, side: THREE.DoubleSide })
      );
      nodeRing.position.z = 0.07;
      nodeGroup.add(nodeRing);

      scene.add(nodeGroup);
      return nodeGroup;
    });

    const connectionLines = EVIDENCE_NODES.map(({ color, angle, radius, yOffset }) => {
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius * 0.5;
      const pts = [
        new THREE.Vector3(x, yOffset, z),
        new THREE.Vector3(0, -0.5, 0),
      ];
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: isDark ? 0.14 : 0.25 })
      );
      scene.add(line);
      return line;
    });

    const PARTICLES_PER_LINE = 3;
    const particleData = EVIDENCE_NODES.flatMap(({ color, angle, radius, yOffset }) => {
      const start = new THREE.Vector3(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius * 0.5);
      const end   = new THREE.Vector3(0, -0.5, 0);
      return Array.from({ length: PARTICLES_PER_LINE }, (_, k) => ({
        start, end, t: k / PARTICLES_PER_LINE, speed: 0.003 + Math.random() * 0.002, color,
      }));
    });

    const particleCount = particleData.length;
    const pPos   = new Float32Array(particleCount * 3);
    const pColor = new Float32Array(particleCount * 3);
    const pGeo   = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pColor, 3));
    const tmp = new THREE.Color();
    particleData.forEach((p, i) => {
      tmp.set(p.color);
      pColor[i * 3] = tmp.r; pColor[i * 3 + 1] = tmp.g; pColor[i * 3 + 2] = tmp.b;
    });
    pGeo.attributes.color.needsUpdate = true;
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.09, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true,
    })));

    const STARS = 160;
    const sPos = new Float32Array(STARS * 3);
    for (let i = 0; i < STARS; i++) {
      sPos[i * 3]     = (Math.random() - 0.5) * 30;
      sPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      sPos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
      color: isDark ? 0xc4b5fd : 0x9b6de3, size: 0.065, transparent: true, opacity: isDark ? 0.35 : 0.6, sizeAttenuation: true,
    })));

    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onResize);

    let animId;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (prefersReducedMotion) { renderer.render(scene, camera); return; }
      t += 0.008;

      lockGroup.rotation.y  = Math.sin(t * 0.18) * 0.25;
      lockGroup.rotation.x  = Math.sin(t * 0.12) * 0.08;

      secRing.rotation.z  =  t * 0.28;
      innerRing.rotation.z = -t * 0.42;

      khRing.material.opacity = (isDark ? 0.5 : 0.7) + Math.sin(t * 2.2) * 0.2;
      khGlow.material.opacity = 0.05 + Math.sin(t * 2.2) * 0.04;
      pViolet.intensity = (isDark ? 8 : 4) + Math.sin(t * 1.8) * 2;
      pCyan.intensity   = (isDark ? 7 : 3) + Math.sin(t * 2.1) * 1.5;

      const scanY = Math.sin(t * 0.9) * 1.0;
      scanPlane.position.y = scanY - 0.5;
      scanPlane.material.opacity = (isDark ? 0.08 : 0.04) + Math.abs(Math.sin(t * 0.9)) * 0.1;

      nodeObjects.forEach((ng, i) => {
        const { basePos, phase } = ng.userData;
        ng.position.y = basePos.y + Math.sin(t * 0.6 + phase) * 0.22;
        ng.position.x = basePos.x + Math.cos(t * 0.4 + phase) * 0.08;
        ng.rotation.z = Math.sin(t * 0.5 + phase) * 0.12;
        if (ng.children[1]) ng.children[1].rotation.z = t * 0.9;
      });

      const pp = pGeo.attributes.position.array;
      particleData.forEach((p, i) => {
        p.t += p.speed;
        if (p.t > 1) p.t -= 1;
        const ease = p.t < 0.5 ? 2 * p.t * p.t : -1 + (4 - 2 * p.t) * p.t;
        pp[i * 3]     = p.start.x + (p.end.x - p.start.x) * ease;
        pp[i * 3 + 1] = p.start.y + (p.end.y - p.start.y) * ease;
        pp[i * 3 + 2] = p.start.z + (p.end.z - p.start.z) * ease;
      });
      pGeo.attributes.position.needsUpdate = true;

      const mx = mousePosRef.current?.x ?? 0;
      const my = mousePosRef.current?.y ?? 0;
      camera.position.x = mx * 1.6;
      camera.position.y = 1.2 - my * 1.0;
      camera.lookAt(0, -0.3, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [size, theme]); // re-run if theme changes

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />;
}
