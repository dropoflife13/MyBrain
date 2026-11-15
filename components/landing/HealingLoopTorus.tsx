'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Activity, CheckCircle2, ShieldAlert, Sparkles, Terminal, Zap } from 'lucide-react';

const vertexShader = `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  vUv = uv;
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const fragmentShader = `
uniform float uT;
uniform float uGlow;
uniform vec3 uCol;
uniform vec3 uAlt;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
  float ln = smoothstep(0.44, 0.5, abs(fract(vUv.y * 36.0) - 0.5));
  float rg = smoothstep(0.45, 0.5, abs(fract(vUv.x * 128.0) - 0.5));
  float p = pow(max(0.0, sin(vUv.x * 18.8496 - uT * 2.4)), 20.0);
  vec3 c = mix(uCol, uAlt, 0.5 + 0.5 * sin(vUv.x * 12.57 + uT * 0.5));
  gl_FragColor = vec4(
    (c * (0.35 + f * 1.65) + vec3(p) * 0.9) * uGlow,
    clamp((f * 0.88 + ln * 0.32 + rg * 0.16 + p * 0.95) * uGlow, 0.0, 1.0)
  );
}
`;

export type GateVerdictState = 'PASS' | 'FAIL';

interface StageSpec {
  id: string;
  label: string;
  verdict: GateVerdictState;
  hexColor: number;
  altHexColor: number;
  badge: string;
  sqlAssertion: string;
  description: string;
}

const HEALING_STAGES: StageSpec[] = [
  {
    id: 'PASS_C0',
    label: 'GATE: PASS (C0_clean)',
    verdict: 'PASS',
    hexColor: 0x22d3ee,
    altHexColor: 0x00ffff,
    badge: 'INVARIANT 0 CERTIFIED · 86.3% BOUND COMPLIANCE',
    sqlAssertion:
      "ALTER TABLE orders FORCE ROW LEVEL SECURITY; USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);",
    description:
      'Verbatim rule retrieval (C0_clean) preserves exact SQL identifiers (app_metadata.tenant_id, fk_<table>_<column>, P0001). Deterministic AST + PG16 Oracle certifies 100% bound-fact pass.',
  },
  {
    id: 'FAIL_DISTILL',
    label: 'GATE: FAIL (Distillation Penalty)',
    verdict: 'FAIL',
    hexColor: 0xd946ef,
    altHexColor: 0xf43f5e,
    badge: 'TRIPPED: F-16 · F-25 · F-26 (-17.4% PENALTY)',
    sqlAssertion:
      "CREATE POLICY tenant_iso ON orders USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid); -- [REJECTED]",
    description:
      'Natural-language summarization (Condition C) strips exact identifiers, causing models to reference spoofable user_metadata.tenant_id or inline REFERENCES. Quarantine Gate blocks merge.',
  },
];

export default function HealingLoopTorus() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gateState, setGateState] = useState<GateVerdictState>('PASS');
  const [autoCycle, setAutoCycle] = useState<boolean>(false);
  const [activeCondition, setActiveCondition] = useState<'A' | 'C' | 'C_ID' | 'C0_clean' | 'B'>('C0_clean');

  const activeStage = gateState === 'PASS' ? HEALING_STAGES[0] : HEALING_STAGES[1];

  const targetColorRef = useRef(new THREE.Color(activeStage.hexColor));
  const targetAltRef = useRef(new THREE.Color(activeStage.altHexColor));
  const gateStateRef = useRef<GateVerdictState>(gateState);
  const pulseShockRef = useRef<number>(0);

  useEffect(() => {
    const st = gateState === 'PASS' ? HEALING_STAGES[0] : HEALING_STAGES[1];
    targetColorRef.current.setHex(st.hexColor);
    targetAltRef.current.setHex(st.altHexColor);
    gateStateRef.current = gateState;
    pulseShockRef.current = 0.35;
  }, [gateState]);

  useEffect(() => {
    if (!autoCycle) return;
    const timer = setInterval(() => {
      setGateState((prev) => (prev === 'PASS' ? 'FAIL' : 'PASS'));
    }, 4800);
    return () => clearInterval(timer);
  }, [autoCycle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x050505, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
    camera.position.set(0, 0.2, 5.6);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1;

    const group = new THREE.Group();
    scene.add(group);

    // 1. Holographic TorusKnot Core (p=2, q=3)
    const geo = new THREE.TorusKnotGeometry(1.05, 0.34, 320, 48, 2, 3);
    const curColor = new THREE.Color(0x22d3ee);
    const curAlt = new THREE.Color(0x00ffff);

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uT: { value: 0 },
        uGlow: { value: 1.15 },
        uCol: { value: curColor.clone() },
        uAlt: { value: curAlt.clone() },
      },
      vertexShader,
      fragmentShader,
    });
    const coreMesh = new THREE.Mesh(geo, mat);
    group.add(coreMesh);

    // 2. Outer CAD Wireframe Lattice
    const wireMat = new THREE.MeshBasicMaterial({
      color: curColor,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wire = new THREE.Mesh(geo, wireMat);
    wire.scale.setScalar(1.018);
    group.add(wire);

    // 3. Volumetric Atmospheric Halo
    const haloGeo = new THREE.TorusKnotGeometry(1.05, 0.56, 160, 24, 2, 3);
    const haloMat = new THREE.MeshBasicMaterial({
      color: curColor,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);

    // 4. 3,000 Volumetric Synaptic Particles Orbiting the TorusKnot
    const particleCount = 3000;
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * Math.PI * 4;
      const q = 1.5 * u;
      const r = (2 + Math.cos(q)) * 0.52;
      const vx = r * Math.cos(u);
      const vy = r * Math.sin(u);
      const vz = Math.sin(q) * 0.52;

      const ox = Math.random() - 0.5;
      const oy = Math.random() - 0.5;
      const oz = Math.random() - 0.5;
      const len = Math.hypot(ox, oy, oz) || 1;
      const dist = 0.35 + Math.random() * 0.75;

      pos[i * 3] = vx + (ox / len) * dist;
      pos[i * 3 + 1] = vy + (oy / len) * dist;
      pos[i * 3 + 2] = vz + (oz / len) * dist;
    }

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pointsMat = new THREE.PointsMaterial({
      color: curColor,
      size: 0.016,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(pointsGeo, pointsMat);
    group.add(points);

    const updateSize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w / h < 1 ? 6.8 : 5.4;
      camera.updateProjectionMatrix();
    };
    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    let isVisible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );
    io.observe(container);

    let animId = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      if (!isVisible || document.hidden) {
        lastTime = now;
        return;
      }

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const isFail = gateStateRef.current === 'FAIL';
      const speed = isFail ? 2.35 : 1.45;

      mat.uniforms.uT.value += dt * speed;

      // Smooth breathing pulsation (Cyan steady harmonic vs Magenta rapid alert pulse)
      const pulseFreq = isFail ? 6.2 : 2.4;
      const pulseAmp = isFail ? 0.065 : 0.035;
      const harmonicScale = 1.0 + Math.sin(now * 0.001 * pulseFreq) * pulseAmp;

      if (pulseShockRef.current > 0) {
        pulseShockRef.current = Math.max(0, pulseShockRef.current - dt);
      }
      const shockBoost = pulseShockRef.current > 0 ? 1.0 + Math.sin(pulseShockRef.current * 28) * 0.08 : 1.0;

      group.scale.setScalar(harmonicScale * shockBoost);
      group.rotation.y += dt * 0.24 * speed;
      group.rotation.x += dt * 0.09 * speed;
      wire.rotation.y -= dt * 0.06 * speed;
      points.rotation.y += dt * 0.12 * speed;

      curColor.lerp(targetColorRef.current, 0.08);
      curAlt.lerp(targetAltRef.current, 0.08);
      mat.uniforms.uCol.value.copy(curColor);
      mat.uniforms.uAlt.value.copy(curAlt);
      mat.uniforms.uGlow.value = (isFail ? 1.32 : 1.15) + Math.sin(now * 0.001 * pulseFreq) * 0.18;

      wireMat.color.copy(curColor);
      haloMat.color.copy(curColor);
      pointsMat.color.copy(curColor);

      controls.update();
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      renderer.dispose();
      geo.dispose();
      haloGeo.dispose();
      pointsGeo.dispose();
      mat.dispose();
      wireMat.dispose();
      haloMat.dispose();
      pointsMat.dispose();
    };
  }, []);

  const CONDITION_METRICS = {
    A: { label: 'A · Zero-Shot', compliance: '47.4%', pass1: '4.2%', tokens: '247 tok', color: '#94a3b8' },
    C: { label: 'C · Distilled (<24w)', compliance: '71.9%', pass1: '29.2%', tokens: '522 tok', color: '#fb923c' },
    C_ID: { label: 'C_ID · ID-Preserving', compliance: '83.8%', pass1: '49.2%', tokens: '538 tok', color: '#a855f7' },
    C0_clean: { label: 'C0_clean · Verbatim', compliance: '86.3%', pass1: '55.0%', tokens: '555 tok', color: '#22d3ee' },
    B: { label: 'B · Full 34 Rules', compliance: '93.9%', pass1: '77.5%', tokens: '1,139 tok', color: '#34d399' },
  };

  return (
    <div className="relative rounded-2xl bg-[#050505]/95 backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] text-white font-mono">
      {/* Blueprint 48px Hairline Coordinate Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(rgba(160,170,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(160,170,255,0.14) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Corner CAD Reticles (+) */}
      <span className="pointer-events-none absolute top-3 left-3 text-[10px] text-cyan-400/50 select-none">+</span>
      <span className="pointer-events-none absolute top-3 right-3 text-[10px] text-cyan-400/50 select-none">+</span>
      <span className="pointer-events-none absolute bottom-3 left-3 text-[10px] text-cyan-400/50 select-none">+</span>
      <span className="pointer-events-none absolute bottom-3 right-3 text-[10px] text-cyan-400/50 select-none">+</span>

      {/* Top Mission Control Telemetry Strip */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-white/10 bg-black/60 text-[11px]">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              gateState === 'PASS'
                ? 'bg-cyan-400 shadow-[0_0_12px_#22d3ee]'
                : 'bg-fuchsia-500 shadow-[0_0_12px_#d946ef] animate-ping'
            }`}
          />
          <span className="font-bold tracking-widest uppercase text-white">
            AXIOM × CORTEX // HEALING LOOP CRUCIBLE
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-400">
            INVARIANT 0: GENERATOR ⊥ VERIFIER
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAutoCycle(false);
              setGateState('PASS');
            }}
            className={`px-3 py-1 rounded text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer border ${
              gateState === 'PASS'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.35)]'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            ● Gate: PASS (Cyan)
          </button>
          <button
            type="button"
            onClick={() => {
              setAutoCycle(false);
              setGateState('FAIL');
            }}
            className={`px-3 py-1 rounded text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer border ${
              gateState === 'FAIL'
                ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.4)]'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            ▲ Gate: FAIL (Magenta)
          </button>
          <button
            type="button"
            onClick={() => setAutoCycle((prev) => !prev)}
            className={`px-2.5 py-1 rounded text-[10px] uppercase border transition-all cursor-pointer ${
              autoCycle
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {autoCycle ? 'Auto-Loop: ON' : 'Auto-Loop'}
          </button>
        </div>
      </div>

      {/* Main 3-Column Mission Control Stage */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 md:p-8 items-center">
        {/* Left Column: Empirical Telemetry & Distillation Penalty Proof */}
        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-1.5">
            <div
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded border ${
                gateState === 'PASS'
                  ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300'
                  : 'bg-fuchsia-500/10 border-fuchsia-400/30 text-fuchsia-300'
              }`}
            >
              {gateState === 'PASS' ? (
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
              ) : (
                <ShieldAlert className="w-3 h-3 text-fuchsia-400" />
              )}
              <span>{activeStage.badge}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white font-sans">
              {gateState === 'PASS'
                ? 'Verbatim Contracts Preserve Exact Identifiers.'
                : 'Distilled Memory Drops Critical Identifiers.'}
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">{activeStage.description}</p>
          </div>

          {/* Live SQL / AST Inspector Box */}
          <div
            className={`p-3.5 rounded-xl border bg-black/80 space-y-2 transition-colors ${
              gateState === 'PASS' ? 'border-cyan-500/30' : 'border-fuchsia-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>ORACLE AST &amp; PG16 PROBE</span>
              </span>
              <span className={gateState === 'PASS' ? 'text-cyan-400 font-bold' : 'text-fuchsia-400 font-bold'}>
                {gateState === 'PASS' ? 'EXIT 0 · VERIFIED' : 'ERRCODE P0001 · REJECTED'}
              </span>
            </div>
            <pre className="text-[11px] leading-relaxed text-zinc-200 whitespace-pre-wrap break-all bg-zinc-950/90 p-2.5 rounded border border-white/5">
              <code>{activeStage.sqlAssertion}</code>
            </pre>
          </div>

          {/* Empirical Lift KPI Strip */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
              <div className="text-[10px] text-zinc-400">TRIALS SCORED</div>
              <div className="text-sm md:text-base font-bold text-cyan-400">4,320</div>
              <div className="text-[9px] text-zinc-500">6 Model Families</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
              <div className="text-[10px] text-zinc-400">C0 vs C LIFT</div>
              <div className="text-sm md:text-base font-bold text-emerald-400">+17.36 pp</div>
              <div className="text-[9px] text-zinc-500">p = 1.0×10⁻⁵</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
              <div className="text-[10px] text-zinc-400">TOKEN SAVING</div>
              <div className="text-sm md:text-base font-bold text-purple-400">-51.3%</div>
              <div className="text-[9px] text-zinc-500">Top-K = 10</div>
            </div>
          </div>
        </div>

        {/* Center Column: Interactive 3D Volumetric TorusKnot Canvas */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div
            ref={containerRef}
            className="relative w-full h-[320px] sm:h-[360px] rounded-xl overflow-hidden border border-white/10 bg-[#050505]"
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full block cursor-grab active:cursor-grabbing"
              aria-label="Interactive 3D Healing Loop TorusKnot"
            />
            <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] text-zinc-400">
              <span>DRAG TO ORBIT · 3,000 VOLUMETRIC PARTICLES</span>
              <span className={gateState === 'PASS' ? 'text-cyan-400 font-bold' : 'text-fuchsia-400 font-bold'}>
                {gateState === 'PASS' ? '● CYAN HARMONIC' : '▲ MAGENTA ALERT'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Condition Ablation Matrix & Feature-Flag Taxonomy */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ablation Condition Telemetry</span>
            </span>
            <span className="text-[10px] text-zinc-500">NEMOTRON-550B · N=120</span>
          </div>

          <div className="space-y-2">
            {(Object.keys(CONDITION_METRICS) as Array<keyof typeof CONDITION_METRICS>).map((condKey) => {
              const item = CONDITION_METRICS[condKey];
              const isSelected = activeCondition === condKey;
              return (
                <button
                  key={condKey}
                  type="button"
                  onClick={() => {
                    setActiveCondition(condKey);
                    setGateState(condKey === 'A' || condKey === 'C' ? 'FAIL' : 'PASS');
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-white/[0.07] border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                      : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <div className="text-xs font-bold text-white">{item.label}</div>
                      <div className="text-[10px] text-zinc-400">Prompt budget: {item.tokens}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold" style={{ color: item.color }}>
                      {item.compliance}
                    </div>
                    <div className="text-[10px] text-zinc-400">Pass@1: {item.pass1}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 8-Cell Feature-Flag Taxonomy Pill Strip */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>FEATURE-FLAG DETERMINISTIC RETRIEVAL</span>
              </span>
              <span className="text-cyan-400">2³ = 8 CELLS</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              {[
                'tenant=true',
                'append_only=true',
                'ingestion=true',
                'sec_definer=true',
                'view=true',
                'status=true',
                'latest_per_key=true',
              ].map((flag) => (
                <span
                  key={flag}
                  className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-400/25 text-cyan-300"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
