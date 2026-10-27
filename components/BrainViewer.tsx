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
  const [stats, setStats] = useState({ nodes: 900, links: 1712, fps: 60 });
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const brainGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = Math.max(container.clientWidth || window.innerWidth, 320);
    const height = Math.max(container.clientHeight || window.innerHeight - 64, 320);

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 2000);
    camera.position.set(0, 22, 145);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controls.maxDistance = 400;
    controls.minDistance = 30;

    // 5. Ambient & Accent Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
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

    // Animation & Render Loop (guarded against NaN FPS)
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const animate = (now?: number) => {
      animationFrameId = requestAnimationFrame(animate);

      controls.update();
      renderer.render(scene, camera);

      const currentTime = typeof now === 'number' ? now : performance.now();
      frameCount++;
      const elapsed = currentTime - lastTime;
      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / elapsed);
        if (Number.isFinite(currentFps) && currentFps > 0) {
          setStats((prev) => ({ ...prev, fps: currentFps }));
        }
        frameCount = 0;
        lastTime = currentTime;
      }
    };
    animationFrameId = requestAnimationFrame(animate);

    // Resize Handler + ResizeObserver
    const handleResize = () => {
      if (!container) return;
      const w = Math.max(container.clientWidth || window.innerWidth, 320);
      const h = Math.max(container.clientHeight || window.innerHeight - 64, 320);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    if (resizeObserver) {
      resizeObserver.observe(container);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
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

  // Helper to build procedural brain into brainGroup
  const buildProceduralIntoGroup = (brainGroup: THREE.Group) => {
    const { nodes, links } = buildBrainGraph({ nodeCount: 900, k: 3, maxLinkLen: 17, seed: 7 });

    // 1. Instanced Mesh for Nodes
    const sphereGeo = new THREE.SphereGeometry(0.55, 10, 10);
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
      opacity: 0.35,
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    brainGroup.add(lineSegments);

    setStats((prev) => ({ ...prev, nodes: nodes.length, links: links.length }));
  };

  // Load Model based on active mode
  useEffect(() => {
    const brainGroup = brainGroupRef.current;
    if (!brainGroup) return;

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
      const loader = new GLTFLoader();
      loader.load(
        '/synaptic_constellation_brain.glb',
        (gltf) => {
          const model = gltf.scene;
          let foundRenderable = false;

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              foundRenderable = true;
              (child as THREE.Mesh).material = new THREE.MeshBasicMaterial({
                color: 0x67e8f9,
              });
            }
            if ((child as THREE.LineSegments).isLineSegments || (child as THREE.Line).isLine) {
              foundRenderable = true;
              (child as THREE.LineSegments).material = new THREE.LineBasicMaterial({
                color: 0x3b82f6,
                transparent: true,
                opacity: 0.38,
              });
            }
            if ((child as THREE.Points).isPoints) {
              foundRenderable = true;
              (child as THREE.Points).material = new THREE.PointsMaterial({
                color: 0x67e8f9,
                size: 1.2,
              });
            }
          });

          // Auto-center and normalize scale if needed
          const box = new THREE.Box3().setFromObject(model);
          if (!box.isEmpty()) {
            const size = new THREE.Vector3();
            const center = new THREE.Vector3();
            box.getSize(size);
            box.getCenter(center);
            model.position.sub(center);
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0 && (maxDim < 20 || maxDim > 250)) {
              const targetSpan = 95;
              model.scale.setScalar(targetSpan / maxDim);
            }
          }

          if (foundRenderable) {
            brainGroup.add(model);
            setStats((prev) => ({ ...prev, nodes: 900, links: 1420 }));
          } else {
            buildProceduralIntoGroup(brainGroup);
          }
          setLoading(false);
        },
        undefined,
        (err) => {
          console.error('Error loading GLB, switching to procedural:', err);
          setErrorMsg('GLB fallback: switched to Procedural Math mode.');
          setMode('procedural');
          setLoading(false);
        }
      );
    } else {
      try {
        buildProceduralIntoGroup(brainGroup);
        setLoading(false);
      } catch (err: any) {
        console.error('Error generating procedural brain:', err);
        setErrorMsg(err.message || 'Error generating procedural graph');
        setLoading(false);
      }
    }
  }, [mode]);

  return (
    <div
      className="relative w-full h-full min-h-[500px] flex-1 overflow-hidden bg-[#060913] select-none"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '500px',
        overflow: 'hidden',
        backgroundColor: '#060913',
        userSelect: 'none',
      }}
    >
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'grab',
        }}
      />

      {/* Top Left: Telemetry HUD */}
      <div
        className="absolute top-6 left-6 z-10 flex flex-col gap-2 p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 text-xs shadow-2xl"
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(51, 65, 85, 0.6)',
          color: '#e2e8f0',
          fontSize: '12px',
          minWidth: '250px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#22d3ee',
              display: 'inline-block',
              boxShadow: '0 0 8px #22d3ee',
            }}
          />
          <span
            style={{
              fontFamily: 'monospace',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: '#67e8f9',
              textTransform: 'uppercase',
            }}
          >
            Synaptic Constellation
          </span>
        </div>
        <div style={{ height: '1px', backgroundColor: 'rgba(51, 65, 85, 0.6)', margin: '4px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', fontFamily: 'monospace' }}>
          <span style={{ color: '#94a3b8' }}>Mode:</span>
          <span style={{ color: '#ffffff', fontWeight: 700, textTransform: 'uppercase' }}>
            {mode === 'glb' ? 'GLB Mesh' : 'Procedural Math'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', fontFamily: 'monospace' }}>
          <span style={{ color: '#94a3b8' }}>Nodes:</span>
          <span style={{ color: '#22d3ee' }}>{stats.nodes}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', fontFamily: 'monospace' }}>
          <span style={{ color: '#94a3b8' }}>Links:</span>
          <span style={{ color: '#60a5fa' }}>{stats.links}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', fontFamily: 'monospace' }}>
          <span style={{ color: '#94a3b8' }}>Performance:</span>
          <span style={{ color: '#34d399' }}>{stats.fps} FPS</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', fontFamily: 'monospace' }}>
          <span style={{ color: '#94a3b8' }}>Structure:</span>
          <span style={{ color: '#cbd5e1' }}>Bi-hemispheric + Cerebellum</span>
        </div>
      </div>

      {/* Top Right: Controls */}
      <div
        className="absolute top-6 right-6 z-10 flex flex-col gap-3"
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px',
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(51, 65, 85, 0.6)',
          }}
        >
          <button
            onClick={() => setMode('glb')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'monospace',
              fontWeight: mode === 'glb' ? 600 : 500,
              backgroundColor: mode === 'glb' ? '#06b6d4' : 'transparent',
              color: mode === 'glb' ? '#020617' : '#cbd5e1',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            GLB Binary (1.8MB)
          </button>
          <button
            onClick={() => setMode('procedural')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'monospace',
              fontWeight: mode === 'procedural' ? 600 : 500,
              backgroundColor: mode === 'procedural' ? '#06b6d4' : 'transparent',
              color: mode === 'procedural' ? '#020617' : '#cbd5e1',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Procedural (7KB)
          </button>
        </div>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '8px 12px',
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(12px)',
            border: autoRotate
              ? '1px solid rgba(6, 182, 212, 0.45)'
              : '1px solid rgba(51, 65, 85, 0.6)',
            color: autoRotate ? '#67e8f9' : '#94a3b8',
            fontSize: '12px',
            fontFamily: 'monospace',
            cursor: 'pointer',
          }}
        >
          <span>Auto-Rotate:</span>
          <span style={{ fontWeight: 700, color: autoRotate ? '#34d399' : '#64748b' }}>
            {autoRotate ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Bottom Center: Navigation Hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          padding: '8px 16px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#94a3b8',
          pointerEvents: 'none',
        }}
      >
        Drag to Orbit • Scroll to Zoom • Right-click to Pan
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(6, 9, 19, 0.88)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <p
            style={{
              color: '#67e8f9',
              fontFamily: 'monospace',
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Synthesizing Synaptic Matrix...
          </p>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div
          style={{
            position: 'absolute',
            bottom: '64px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(69, 26, 3, 0.85)',
            border: '1px solid rgba(217, 119, 6, 0.5)',
            color: '#fde68a',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}
