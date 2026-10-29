'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useTheme } from 'next-themes';
import { BrainDocNode, BrainGraphData, getBrainData } from '../lib/brain-parser';

export interface Brain3DProps {
  data?: BrainGraphData;
  selectedNode?: BrainDocNode | null;
  autoSpin?: boolean;
  isBackground?: boolean;
  divingIn?: boolean;
  theme?: 'dark' | 'light';
  onNodeHover?: (node: BrainDocNode | null) => void;
  onNodeClick?: (node: BrainDocNode | null) => void;
  onReady?: () => void;
  onFpsUpdate?: (fps: number) => void;
  /** When set, nodes whose clean id is not in this set are dimmed. */
  focusIds?: Set<string> | null;
}

/**
 * Generates quadratic Bézier curved line coordinates for galactic synaptic links.
 * Curvature gives links a swooping, orbital trajectory instead of rigid sticks.
 */
function buildCurvedLineCoords(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  curvature = 0.24,
  segments = 10
): number[] {
  const v = new THREE.Vector3().subVectors(p2, p1);
  const d = v.length();
  if (d < 0.5) return [p1.x, p1.y, p1.z, p2.x, p2.y, p2.z];
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  let normal = new THREE.Vector3().crossVectors(v, new THREE.Vector3(0, 0, 1));
  if (normal.lengthSq() < 0.0001) {
    normal = new THREE.Vector3().crossVectors(v, new THREE.Vector3(0, 1, 0));
  }
  if (normal.lengthSq() < 0.0001) {
    normal = new THREE.Vector3().crossVectors(v, new THREE.Vector3(1, 0, 0));
  }
  normal.normalize();
  if (normal.dot(mid) < 0) normal.negate();
  const ctrl = mid.clone().addScaledVector(normal, d * curvature);
  const coords: number[] = [];
  let prevX = p1.x;
  let prevY = p1.y;
  let prevZ = p1.z;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const invT = 1 - t;
    const currX = invT * invT * p1.x + 2 * invT * t * ctrl.x + t * t * p2.x;
    const currY = invT * invT * p1.y + 2 * invT * t * ctrl.y + t * t * p2.y;
    const currZ = invT * invT * p1.z + 2 * invT * t * ctrl.z + t * t * p2.z;
    coords.push(prevX, prevY, prevZ, currX, currY, currZ);
    prevX = currX;
    prevY = currY;
    prevZ = currZ;
  }
  return coords;
}

export default function Brain3D({
  data,
  selectedNode,
  autoSpin = true,
  isBackground = false,
  divingIn = false,
  theme: themeProp,
  onNodeHover,
  onNodeClick,
  onReady,
  onFpsUpdate,
  focusIds = null,
}: Brain3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const currentTheme = themeProp || (resolvedTheme as 'dark' | 'light') || 'dark';
  const isLight = currentTheme === 'light';

  // Latest prop refs for use inside the 60fps animation & event loop
  const autoSpinRef = useRef<boolean>(autoSpin);
  const isBackgroundRef = useRef<boolean>(isBackground);
  const divingInRef = useRef<boolean>(divingIn);
  const selectedNodeRef = useRef<BrainDocNode | null>(selectedNode || null);
  const hoveredNodeRef = useRef<BrainDocNode | null>(null);
  const onNodeHoverRef = useRef(onNodeHover);
  const onNodeClickRef = useRef(onNodeClick);
  const onReadyRef = useRef(onReady);
  const onFpsUpdateRef = useRef(onFpsUpdate);

  // Camera lerp target refs when locking/unlocking focus
  const desiredCameraPosRef = useRef<THREE.Vector3 | null>(null);
  const focusIdsRef = useRef<Set<string> | null>(focusIds);
  const desiredTargetPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isReturningHomeRef = useRef<boolean>(false);

  // Highlight & theme update callback refs (avoid destroying WebGLRenderer on theme switch)
  const isLightRef = useRef<boolean>(isLight);
  const meshByIdRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const applyVisualStateRef = useRef<((hoverId: string | null, selectId: string | null) => void) | null>(
    null
  );
  const applyThemeRef = useRef<((lightMode: boolean) => void) | null>(null);

  const graphData = useMemo(() => {
    return data && data.nodes?.length ? data : getBrainData({ nodeCount: 360 });
  }, [data]);

  useEffect(() => {
    autoSpinRef.current = autoSpin;
    isBackgroundRef.current = isBackground;
    divingInRef.current = divingIn;
  }, [autoSpin, isBackground, divingIn]);

  useEffect(() => {
    onNodeHoverRef.current = onNodeHover;
    onNodeClickRef.current = onNodeClick;
    onReadyRef.current = onReady;
    onFpsUpdateRef.current = onFpsUpdate;
  }, [onNodeHover, onNodeClick, onReady, onFpsUpdate]);

  // Update Three.js materials & scene background in-place when light/dark mode toggles (zero WebGL flash)
  useEffect(() => {
    isLightRef.current = isLight;
    applyThemeRef.current?.(isLight);
  }, [isLight]);

  // Re-apply visual state whenever the gate filter changes
  useEffect(() => {
    focusIdsRef.current = focusIds;
    if (applyVisualStateRef.current) {
      applyVisualStateRef.current(
        hoveredNodeRef.current ? String(hoveredNodeRef.current.id) : null,
        selectedNodeRef.current && selectedNodeRef.current.id !== 'hub'
          ? String(selectedNodeRef.current.id)
          : null
      );
    }
  }, [focusIds]);

  // Update camera lock target whenever selectedNode changes
  useEffect(() => {
    selectedNodeRef.current = selectedNode || null;

    if (selectedNode && selectedNode.id !== 'hub') {
      const mesh = meshByIdRef.current.get(String(selectedNode.id));
      const nodeVec = new THREE.Vector3();
      if (mesh) {
        mesh.getWorldPosition(nodeVec);
      } else {
        const nx = selectedNode.fx ?? selectedNode.x ?? 0;
        const ny = selectedNode.fy ?? selectedNode.y ?? 0;
        const nz = selectedNode.fz ?? selectedNode.z ?? 0;
        nodeVec.set(nx, ny, nz);
      }
      const dir = nodeVec.clone().normalize();
      if (dir.lengthSq() < 0.001) dir.set(0, 0.2, 1).normalize();

      desiredTargetPosRef.current.copy(nodeVec);
      desiredCameraPosRef.current = nodeVec.clone().addScaledVector(dir, 52).add(new THREE.Vector3(0, 8, 0));
      isReturningHomeRef.current = false;
    } else {
      // Unlock camera and smoothly return target to center (0,0,0)
      desiredTargetPosRef.current.set(0, 0, 0);
      desiredCameraPosRef.current = null;
      isReturningHomeRef.current = true;
    }

    if (applyVisualStateRef.current) {
      applyVisualStateRef.current(
        hoveredNodeRef.current ? String(hoveredNodeRef.current.id) : null,
        selectedNode && selectedNode.id !== 'hub' ? String(selectedNode.id) : null
      );
    }
  }, [selectedNode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth || window.innerWidth, 320);
    const height = Math.max(container.clientHeight || window.innerHeight, 320);

    // 1. Scene
    const scene = new THREE.Scene();
    const bgColor = isLight ? 0xf8fafc : 0x050505;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, isLight ? 0.0016 : 0.0022);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1500);
    camera.position.set(0, 26, 165);

    // 3. WebGLRenderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls (Seamless hardware-damped infinite 360 spin)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoSpinRef.current;
    controls.autoRotateSpeed = 1.0;
    controls.minDistance = 28;
    controls.maxDistance = 340;
    controls.target.set(0, 0, 0);
    // Keep brain strictly centered — disable panning so users cannot accidentally shove the constellation off-screen
    controls.enablePan = false;

    if (isBackgroundRef.current) {
      controls.enableRotate = false;
      controls.enableZoom = false;
    }

    // 5. Ambient Deep-Space Starfield & Tactical Orbital Rings
    const environmentGroup = new THREE.Group();
    scene.add(environmentGroup);

    // Subtle radial concentric orbital rings around the galaxy cortex
    // Ring 1 (Core / Engineering Ring ~28)
    const ringGeo1 = new THREE.RingGeometry(27.8, 28.25, 128);
    ringGeo1.rotateX(Math.PI / 2);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: isLight ? 0x0284c7 : 0x00ffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isLight ? 0.38 : 0.30,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.position.y = -32;
    environmentGroup.add(ring1);

    // Ring 2 (Humanities Ring ~80)
    const ringGeo2 = new THREE.RingGeometry(79.7, 80.3, 160);
    ringGeo2.rotateX(Math.PI / 2);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: isLight ? 0x9333ea : 0xd946ef,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isLight ? 0.32 : 0.24,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.position.y = -32;
    environmentGroup.add(ring2);

    // Ring 3 (World Ring ~140)
    const ringGeo3 = new THREE.RingGeometry(139.5, 140.4, 192);
    ringGeo3.rotateX(Math.PI / 2);
    const ringMat3 = new THREE.MeshBasicMaterial({
      color: isLight ? 0x059669 : 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isLight ? 0.26 : 0.18,
    });
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.position.y = -32;
    environmentGroup.add(ring3);

    // Polar crosshairs on the tactical floor plane
    const gridHelper = new THREE.GridHelper(
      220,
      28,
      isLight ? 0x94a3b8 : 0x1e3a8a,
      isLight ? 0xcbd5e1 : 0x0f172a
    );
    gridHelper.position.y = -32.2;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = isLight ? 0.35 : 0.25;
    environmentGroup.add(gridHelper);

    // Ambient background dust particles
    const starCount = 420;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 130 + Math.random() * 190;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: isLight ? 0x64748b : 0x38bdf8,
      size: isLight ? 0.95 : 0.85,
      transparent: true,
      opacity: isLight ? 0.32 : 0.35,
    });
    const starField = new THREE.Points(starGeo, starMat);
    environmentGroup.add(starField);

    // 6. Build Synaptic Constellation Nodes & Links
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    const nodeById = new Map<string, BrainDocNode>();
    const meshById = new Map<string, THREE.Mesh>();
    meshByIdRef.current = meshById;
    const haloById = new Map<string, THREE.Mesh>();
    const pickableMeshes: THREE.Mesh[] = [];

    // Tiered geometries: Core Agents large (2.6), Domain Agents medium (1.7), Rules tiny (0.65)
    const coreAgentGeo = new THREE.SphereGeometry(2.6, 24, 24);
    const coreHaloGeo = new THREE.SphereGeometry(4.8, 24, 24);
    const domainAgentGeo = new THREE.SphereGeometry(1.7, 18, 18);
    const domainHaloGeo = new THREE.SphereGeometry(3.2, 18, 18);
    const ruleCoreGeo = new THREE.SphereGeometry(0.65, 12, 12);
    const ruleHaloGeo = new THREE.SphereGeometry(1.8, 12, 12);

    const getNodeTier = (node: BrainDocNode): 'core' | 'domain' | 'rule' => {
      if ((node.val && node.val >= 20) || (node.group === 1 && node.cluster === 'Engineering')) {
        return 'core';
      }
      if ((node.val && node.val >= 10) || node.category === 'agent' || node.category === 'domain') {
        return 'domain';
      }
      return 'rule';
    };

    const getClusterColor = (cluster?: string, light = isLight): number => {
      if (cluster === 'Humanities') {
        return light ? 0x9333ea : 0xd946ef; // Purple / Magenta
      }
      if (cluster === 'World') {
        return light ? 0x059669 : 0x10b981; // Emerald Green
      }
      return light ? 0x0284c7 : 0x00ffff; // Electric Cyan (Engineering)
    };

    const ruleColor = isLight ? 0x1e3a8a : 0xffffff;

    graphData.nodes.forEach((node) => {
      nodeById.set(String(node.id), node);
      if (node.id === 'hub') return;

      const nx = node.fx ?? node.x ?? 0;
      const ny = node.fy ?? node.y ?? 0;
      const nz = node.fz ?? node.z ?? 0;
      const tier = getNodeTier(node);
      const isCore = tier === 'core';
      const isDomain = tier === 'domain';
      const isAnchor = isCore || isDomain;

      const coreGeo = isCore ? coreAgentGeo : isDomain ? domainAgentGeo : ruleCoreGeo;
      const haloGeo = isCore ? coreHaloGeo : isDomain ? domainHaloGeo : ruleHaloGeo;
      const hitRadius = isCore ? 6.0 : isDomain ? 4.2 : 2.8;

      const nodeColor = getClusterColor(node.cluster, isLight);

      const coreMat = new THREE.MeshBasicMaterial({
        color: isAnchor ? nodeColor : ruleColor,
      });
      const mesh = new THREE.Mesh(coreGeo, coreMat);
      mesh.position.set(nx, ny, nz);
      mesh.userData = { node };
      brainGroup.add(mesh);
      meshById.set(String(node.id), mesh);

      // Generous invisible hit target so mouse hover & click register reliably
      const hitTargetGeo = new THREE.SphereGeometry(hitRadius, 12, 12);
      const hitTargetMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitTargetGeo, hitTargetMat);
      hitMesh.position.set(nx, ny, nz);
      hitMesh.userData = { node };
      brainGroup.add(hitMesh);
      pickableMeshes.push(hitMesh);

      // Outer glow halo (visible by default for Anchors, and shown on hover/select for Rules)
      const haloMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: isCore
          ? (isLight ? 0.38 : 0.30)
          : isDomain
          ? (isLight ? 0.30 : 0.22)
          : 0.0,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(nx, ny, nz);
      brainGroup.add(halo);
      haloById.set(String(node.id), halo);
    });

    // Build Base Synaptic Curved Links + Highlight Overlay Curved Links (Curvature 0.24)
    const validLinks: Array<{
      src: BrainDocNode;
      tgt: BrainDocNode;
      curveCoords: number[];
      isLongRange: boolean;
    }> = [];
    const baseLineCoords: number[] = [];

    graphData.links.forEach((link) => {
      const srcId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const tgtId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      if (srcId === 'hub' || tgtId === 'hub') return;

      const a = nodeById.get(String(srcId));
      const b = nodeById.get(String(tgtId));
      if (a && b) {
        const p1 = new THREE.Vector3(a.fx ?? a.x ?? 0, a.fy ?? a.y ?? 0, a.fz ?? a.z ?? 0);
        const p2 = new THREE.Vector3(b.fx ?? b.x ?? 0, b.fy ?? b.y ?? 0, b.fz ?? b.z ?? 0);
        const curveCoords = buildCurvedLineCoords(p1, p2, 0.24, 10);
        const isLongRange =
          (a.group === 1 && b.category === 'synapse') || (b.group === 1 && a.category === 'synapse');

        validLinks.push({ src: a, tgt: b, curveCoords, isLongRange });
        if (!isLongRange) {
          for (let i = 0; i < curveCoords.length; i++) {
            baseLineCoords.push(curveCoords[i]);
          }
        }
      }
    });

    const baseLineGeo = new THREE.BufferGeometry();
    baseLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(baseLineCoords, 3));
    const baseLineMat = new THREE.LineBasicMaterial({
      color: isLightRef.current ? 0xcbd5e1 : 0x1e3a8a,
      transparent: true,
      opacity: isLightRef.current ? 0.65 : 0.42,
    });
    const baseLineSegments = new THREE.LineSegments(baseLineGeo, baseLineMat);
    brainGroup.add(baseLineSegments);

    // Dynamic highlighted curved links connected to hovered/selected node
    const highlightLineGeo = new THREE.BufferGeometry();
    const highlightLineMat = new THREE.LineBasicMaterial({
      color: isLightRef.current ? 0x0284c7 : 0x00ffff,
      transparent: true,
      opacity: 0.92,
    });
    const highlightLineSegments = new THREE.LineSegments(highlightLineGeo, highlightLineMat);
    brainGroup.add(highlightLineSegments);

    // Function to update node scale/glow and active links on hover or select
    const applyVisualState = (hoverId: string | null, selectId: string | null) => {
      const activeId = hoverId || selectId;
      const light = isLightRef.current;
      const curRuleColor = light ? 0x1e3a8a : 0xffffff;

      meshById.forEach((mesh, id) => {
        const node = mesh.userData.node as BrainDocNode;
        const tier = getNodeTier(node);
        const isCore = tier === 'core';
        const isDomain = tier === 'domain';
        const isAnchor = isCore || isDomain;
        const isHovered = id === hoverId;
        const isSelected = id === selectId;
        const isActive = isHovered || isSelected;
        const nodeColor = getClusterColor(node.cluster, light);

        const mat = mesh.material as THREE.MeshBasicMaterial;
        const halo = haloById.get(id);
        const haloMat = halo?.material as THREE.MeshBasicMaterial | undefined;

        if (isActive) {
          mat.color.setHex(nodeColor);
          mesh.scale.setScalar(isCore ? 1.4 : isDomain ? 1.6 : 2.0);
          if (halo && haloMat) {
            haloMat.color.setHex(nodeColor);
            halo.scale.setScalar(1.35);
            haloMat.opacity = light ? 0.55 : 0.45;
          }
        } else {
          mat.color.setHex(isAnchor ? nodeColor : curRuleColor);
          mesh.scale.setScalar(1.0);
          if (halo && haloMat) {
            haloMat.color.setHex(nodeColor);
            halo.scale.setScalar(1.0);
            haloMat.opacity = isCore
              ? (light ? 0.38 : 0.30)
              : isDomain
              ? (light ? 0.30 : 0.22)
              : 0.0;
          }
        }
      });

      // Gate filter: dim nodes and links outside the focused agent
      const focus = focusIdsRef.current;
      meshById.forEach((mesh, id) => {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        const halo = haloById.get(id);
        const haloMat = halo?.material as THREE.MeshBasicMaterial | undefined;
        const dimmed = Boolean(focus) && !focus!.has(id.split('::')[0]) && id !== hoverId && id !== selectId;
        mat.transparent = true;
        mat.opacity = dimmed ? 0.08 : 1;
        if (dimmed && haloMat) haloMat.opacity = 0;
      });
      baseLineMat.opacity = focus ? 0.08 : light ? 0.65 : 0.42;

      if (!activeId) {
        highlightLineGeo.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
        return;
      }

      const activeNode = nodeById.get(activeId);
      if (activeNode) {
        highlightLineMat.color.setHex(getClusterColor(activeNode.cluster, light));
      }

      const activeCoords: number[] = [];
      validLinks.forEach(({ src, tgt, curveCoords }) => {
        if (String(src.id) === activeId || String(tgt.id) === activeId) {
          for (let i = 0; i < curveCoords.length; i++) {
            activeCoords.push(curveCoords[i]);
          }
        }
      });
      highlightLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(activeCoords, 3));
    };

    applyVisualStateRef.current = applyVisualState;

    // Seamless in-place theme update (zero WebGL recreation / zero flash)
    applyThemeRef.current = (lightMode: boolean) => {
      const nextBg = lightMode ? 0xf8fafc : 0x050505;
      scene.background = new THREE.Color(nextBg);
      scene.fog = new THREE.FogExp2(nextBg, lightMode ? 0.0016 : 0.0022);
      ringMat1.color.setHex(lightMode ? 0x0284c7 : 0x00ffff);
      ringMat1.opacity = lightMode ? 0.38 : 0.30;
      ringMat2.color.setHex(lightMode ? 0x9333ea : 0xd946ef);
      ringMat2.opacity = lightMode ? 0.32 : 0.24;
      ringMat3.color.setHex(lightMode ? 0x059669 : 0x10b981);
      ringMat3.opacity = lightMode ? 0.26 : 0.18;
      (gridHelper.material as THREE.Material).opacity = lightMode ? 0.35 : 0.25;
      starMat.color.setHex(lightMode ? 0x64748b : 0x38bdf8);
      starMat.size = lightMode ? 0.95 : 0.85;
      starMat.opacity = lightMode ? 0.32 : 0.35;
      baseLineMat.color.setHex(lightMode ? 0xcbd5e1 : 0x1e3a8a);
      highlightLineMat.color.setHex(lightMode ? 0x0284c7 : 0x00ffff);
      applyVisualState(
        hoveredNodeRef.current ? String(hoveredNodeRef.current.id) : null,
        selectedNodeRef.current && selectedNodeRef.current.id !== 'hub'
          ? String(selectedNodeRef.current.id)
          : null
      );
    };

    // 7. Raycaster for Instant Hover & Click Detection
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 2 };
    const pointer = new THREE.Vector2(-999, -999);
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(pickableMeshes, false);

      const hitNode: BrainDocNode | null =
        intersects.length > 0 ? (intersects[0].object.userData.node as BrainDocNode) : null;

      const prevHoverId = hoveredNodeRef.current ? String(hoveredNodeRef.current.id) : null;
      const nextHoverId = hitNode ? String(hitNode.id) : null;

      if (prevHoverId !== nextHoverId) {
        hoveredNodeRef.current = hitNode;
        renderer.domElement.style.cursor = hitNode ? 'pointer' : 'grab';
        applyVisualState(
          nextHoverId,
          selectedNodeRef.current ? String(selectedNodeRef.current.id) : null
        );
        onNodeHoverRef.current?.(hitNode);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      if (!hoveredNodeRef.current) {
        renderer.domElement.style.cursor = 'grabbing';
      }
      // Stop camera lerp if user manually drags to orbit
      desiredCameraPosRef.current = null;
      isReturningHomeRef.current = false;
    };

    const handlePointerUp = (e: MouseEvent) => {
      const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      renderer.domElement.style.cursor = hoveredNodeRef.current ? 'pointer' : 'grab';

      // Only count as a click if the user didn't drag the camera
      if (moveDist < 6) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(pickableMeshes, false);

        if (intersects.length > 0) {
          const clickedNode = intersects[0].object.userData.node as BrainDocNode;
          onNodeClickRef.current?.(clickedNode);
        } else if (selectedNodeRef.current) {
          // Clicking empty space deselects node and closes sidebar
          onNodeClickRef.current?.(null);
        }
      }
    };

    const handleDblClick = () => {
      desiredTargetPosRef.current.set(0, 0, 0);
      desiredCameraPosRef.current = new THREE.Vector3(0, 26, 165);
      isReturningHomeRef.current = true;
      onNodeClickRef.current?.(null);
    };

    if (!isBackgroundRef.current) {
      renderer.domElement.addEventListener('mousemove', handlePointerMove);
      renderer.domElement.addEventListener('mousedown', handlePointerDown);
      renderer.domElement.addEventListener('mouseup', handlePointerUp);
      renderer.domElement.addEventListener('dblclick', handleDblClick);
    }

    // 8. 60fps Animation Loop (Auto-Spin + Camera Focus Lerp + Agent Pulse)
    let animId: number;
    let lastFpsTime = performance.now();
    let frames = 0;

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);

      // Smooth infinite 360-degree rotation powered directly by OrbitControls
      const isLockedOnNode = Boolean(selectedNodeRef.current && selectedNodeRef.current.id !== 'hub');
      controls.autoRotate = autoSpinRef.current && !isLockedOnNode;
      controls.autoRotateSpeed = 1.0;

      // Smoothly orient controls target when a node is selected (or return home to 0,0,0)
      controls.target.lerp(desiredTargetPosRef.current, 0.05);

      if (isLockedOnNode && desiredCameraPosRef.current) {
        camera.position.lerp(desiredCameraPosRef.current, 0.06);
        if (camera.position.distanceTo(desiredCameraPosRef.current) < 0.8) {
          desiredCameraPosRef.current = null;
        }
      }

      controls.update();

      // Continuous subtle rotation so the entire galaxy slowly revolves in space
      if (!isLockedOnNode) {
        brainGroup.rotation.y += 0.0006;
      }
      starField.rotation.y += 0.0003;
      ring1.rotation.z += 0.0008;
      ring2.rotation.z -= 0.0006;
      ring3.rotation.z += 0.0004;

      renderer.render(scene, camera);

      // FPS counter
      frames++;
      const elapsed = now - lastFpsTime;
      if (elapsed >= 1000) {
        const currentFps = Math.min(60, Math.round((frames * 1000) / elapsed));
        if (Number.isFinite(currentFps) && currentFps > 0) {
          onFpsUpdateRef.current?.(currentFps);
        }
        frames = 0;
        lastFpsTime = now;
      }
    };

    animId = requestAnimationFrame(animate);

    // Signal ready to dismiss initial boot loader
    const readyTimer = setTimeout(() => {
      onReadyRef.current?.();
    }, 350);

    // 9. Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = Math.max(container.clientWidth || window.innerWidth, 320);
      const h = Math.max(container.clientHeight || window.innerHeight, 320);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    if (resizeObserver) resizeObserver.observe(container);

    return () => {
      clearTimeout(readyTimer);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (!isBackgroundRef.current) {
        renderer.domElement.removeEventListener('mousemove', handlePointerMove);
        renderer.domElement.removeEventListener('mousedown', handlePointerDown);
        renderer.domElement.removeEventListener('mouseup', handlePointerUp);
        renderer.domElement.removeEventListener('dblclick', handleDblClick);
      }
      cancelAnimationFrame(animId);
      meshByIdRef.current.clear();
      applyThemeRef.current = null;
      applyVisualStateRef.current = null;
      controls.dispose();
      renderer.dispose();
    };
  }, [graphData]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none transition-colors duration-300 ${
        isLight ? 'bg-slate-50' : 'bg-[#050505]'
      }`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    />
  );
}
