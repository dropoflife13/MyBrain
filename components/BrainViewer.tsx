'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { buildBrainGraph } from '../lib/brainGraph';

type DisplayMode = 'glb' | 'procedural';

export default function BrainViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<DisplayMode>('glb');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [stats, setStats] = useState({ nodes: 0, links: 0, fps: 60 });
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // References to keep across renders
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const brainGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913); // Deep cosmic midnight

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 20, 150);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controls.maxDistance = 350;
    controls.minDistance = 40;

    // 5. Ambient & Accent Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    blueRimLight.position.set(-60, 40, -50);
    scene.add(blueRimLight);

    const violetRimLight = new THREE.DirectionalLight(0xa855f7, 2.0);
    violetRimLight.position.set(60, -40, 50);
    scene.add(violetRimLight);

    // Master Group for brain models
    const brainGroup = new THREE.Group();
    brainGroupRef.current = brainGroup;
    scene.add(brainGroup);

    // Grid floor helper
    const gridHelper = new THREE.GridHelper(160, 24, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -45;
    scene.add(gridHelper);

    // Animation & Render Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      controls.update();
      renderer.render(scene, camera);

      // FPS tracking
      frameCount++;
      if (time - lastTime >= 1000) {
        setStats((prev) => ({ ...prev, fps: Math.round((frameCount * 1000) / (time - lastTime)) }));
        frameCount = 0;
        lastTime = time;
      }
    };
    animationFrameId = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update auto-rotate on controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Load Model based on active mode
  useEffect(() => {
    const brainGroup = brainGroupRef.current;
    if (!brainGroup) return;

    // Clear existing objects
    while (brainGroup.children.length > 0) {
      const obj = brainGroup.children[0];
      brainGroup.remove(obj);
      if ('geometry' in obj && (obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose();
      }
    }

    setLoading(true);
    setErrorMsg(null);

    if (mode === 'glb') {
      // Load GLB
      const loader = new GLTFLoader();
      loader.load(
        '/synaptic_constellation_brain.glb',
        (gltf) => {
          const model = gltf.scene;

          let nodeMeshCount = 0;
          let linkMeshCount = 0;

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh && child.name.includes('Constellation_Nodes')) {
              (child as THREE.Mesh).material = new THREE.MeshBasicMaterial({
                color: 0x67e8f9, // Electric cyan
              });
              nodeMeshCount = 900;
            }
            if ((child as THREE.LineSegments).isLineSegments && child.name.includes('Constellation_Links')) {
              (child as THREE.LineSegments).material = new THREE.LineBasicMaterial({
                color: 0x3b82f6, // Vibrant synaptic blue
                transparent: true,
                opacity: 0.35,
              });
              linkMeshCount = 1420;
            }
          });

          // Center model
          model.position.set(0, 0, 0);
          brainGroup.add(model);
          setStats((prev) => ({ ...prev, nodes: nodeMeshCount, links: linkMeshCount }));
          setLoading(false);
        },
        undefined,
        (err) => {
          console.error('Error loading GLB:', err);
          setErrorMsg('GLB file not found in /public or failed to parse. Falling back to Procedural mode.');
          setMode('procedural');
          setLoading(false);
        }
      );
    } else {
      // Build Procedural Constellation
      try {
        const { nodes, links } = buildBrainGraph({ nodeCount: 900, k: 3, maxLinkLen: 17, seed: 7 });

        // 1. Instanced Mesh for Nodes
        const sphereGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const nodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const instancedMesh = new THREE.InstancedMesh(sphereGeo, nodeMat, nodes.length);

        const dummy = new THREE.Object3D();
        nodes.forEach((n, idx) => {
          dummy.position.set(n.ax, n.ay, n.az);
          dummy.updateMatrix();
          instancedMesh.setMatrixAt(idx, dummy.matrix);
        });
        instancedMesh.instanceMatrix.needsUpdate = true;
        brainGroup.add(instancedMesh);

        // 2. Line Segments for Links
        const linePositions: number[] = [];
        const nodeMap = new Map<number, (typeof nodes)[0]>();
        nodes.forEach((n) => nodeMap.set(n.id, n));

        links.forEach((l) => {
          const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
          const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
          const a = nodeMap.get(srcId);
          const b = nodeMap.get(tgtId);
          if (a && b) {
            linePositions.push(a.ax, a.ay, a.az);
            linePositions.push(b.ax, b.ay, b.az);
          }
        });

        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x60a5fa,
          transparent: true,
          opacity: 0.3,
        });
        const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
        brainGroup.add(lineSegments);

        setStats((prev) => ({ ...prev, nodes: nodes.length, links: links.length }));
        setLoading(false);
      } catch (err: any) {
        console.error('Error generating procedural brain:', err);
        setErrorMsg(err.message || 'Error generating procedural graph');
        setLoading(false);
      }
    }
  }, [mode]);

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 overflow-hidden bg-[#060913] select-none">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Left: Telemetry HUD */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 text-xs shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono font-semibold tracking-wider text-cyan-300 uppercase">
            Synaptic Constellation
          </span>
        </div>
        <div className="h-[1px] bg-slate-700/60 my-1" />
        <div className="flex justify-between gap-6 font-mono">
          <span className="text-slate-400">Mode:</span>
          <span className="text-white font-bold uppercase">{mode === 'glb' ? 'GLB Mesh' : 'Procedural Math'}</span>
        </div>
        <div className="flex justify-between gap-6 font-mono">
          <span className="text-slate-400">Nodes:</span>
          <span className="text-cyan-400">{stats.nodes}</span>
        </div>
        <div className="flex justify-between gap-6 font-mono">
          <span className="text-slate-400">Links:</span>
          <span className="text-blue-400">{stats.links}</span>
        </div>
        <div className="flex justify-between gap-6 font-mono">
          <span className="text-slate-400">Performance:</span>
          <span className="text-emerald-400">{stats.fps} FPS</span>
        </div>
        <div className="flex justify-between gap-6 font-mono">
          <span className="text-slate-400">Structure:</span>
          <span className="text-slate-300">Bi-hemispheric + Cerebellum</span>
        </div>
      </div>

      {/* Top Right: Controls */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-xl">
          <button
            onClick={() => setMode('glb')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'glb'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            GLB Binary (1.8MB)
          </button>
          <button
            onClick={() => setMode('procedural')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'procedural'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Procedural (7KB)
          </button>
        </div>

        {/* Auto-Rotate Switch */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center justify-between gap-4 px-3 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs font-mono transition-all shadow-xl ${
            autoRotate ? 'text-cyan-300 border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          <span>Auto-Rotate:</span>
          <span className={`font-bold ${autoRotate ? 'text-emerald-400' : 'text-slate-500'}`}>
            {autoRotate ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Bottom Center: Navigation Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 text-[11px] font-mono text-slate-400 pointer-events-none">
        Drag to Orbit • Scroll to Zoom • Right-click to Pan
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#060913]/90 backdrop-blur-sm">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-cyan-300 font-mono text-xs tracking-wider uppercase animate-pulse">
            Synthesizing Synaptic Matrix...
          </p>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-lg bg-amber-950/80 border border-amber-600/50 text-amber-200 text-xs font-mono">
          {errorMsg}
        </div>
      )}
    </div>
  );
}

