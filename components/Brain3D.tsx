'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { BrainGraphData, getBrainData } from '../lib/brain-parser';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
});

export interface Brain3DProps {
  data?: BrainGraphData;
  selectedNode?: any;
  onNodeHover: (node: any) => void;
  onNodeClick?: (node: any) => void;
}

export default function Brain3D({
  data,
  selectedNode,
  onNodeHover,
  onNodeClick,
}: Brain3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const angleRef = useRef<number>(0);
  const isHoveredRef = useRef<boolean>(false);
  const isLockedRef = useRef<boolean>(false);

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1440,
    height: 900,
  });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const graphData = useMemo(() => {
    return data && data.nodes?.length ? data : getBrainData({ nodeCount: 360 });
  }, [data]);

  // Measure full-screen viewport cleanly
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || window.innerWidth;
        const h = containerRef.current.clientHeight || window.innerHeight;
        setDimensions({ width: Math.max(w, 320), height: Math.max(h, 320) });
      } else if (typeof window !== 'undefined') {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    const observer =
      typeof ResizeObserver !== 'undefined' && containerRef.current
        ? new ResizeObserver(updateSize)
        : null;
    if (observer && containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      if (observer) observer.disconnect();
    };
  }, []);

  // 1. Slow Auto-Rotate Camera Loop around the center by default
  useEffect(() => {
    const distance = 165;
    let frameId: number;

    const configureControls = () => {
      if (fgRef.current) {
        const controls = fgRef.current.controls?.();
        if (controls) {
          controls.enableDamping = true;
          controls.dampingFactor = 0.06;
          controls.autoRotate = !isHoveredRef.current && !isLockedRef.current;
          controls.autoRotateSpeed = 0.55;
        }
      }
    };

    const initTimer = setTimeout(() => {
      if (fgRef.current) {
        fgRef.current.cameraPosition({ x: 0, y: 20, z: distance }, { x: 0, y: 0, z: 0 }, 0);
        configureControls();
      }
    }, 150);

    const tick = () => {
      if (fgRef.current && !isHoveredRef.current && !isLockedRef.current) {
        const controls = fgRef.current.controls?.();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.55;
        } else {
          angleRef.current += 0.0018;
          fgRef.current.cameraPosition({
            x: distance * Math.sin(angleRef.current),
            y: 20,
            z: distance * Math.cos(angleRef.current),
          });
        }
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      clearTimeout(initTimer);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // 2. Lock Camera onto Selected Node (or unlock when deselected via Escape / Close)
  useEffect(() => {
    isLockedRef.current = Boolean(selectedNode && selectedNode.id !== 'hub');

    if (!fgRef.current) return;
    const controls = fgRef.current.controls?.();

    if (selectedNode && selectedNode.id !== 'hub') {
      if (controls) controls.autoRotate = false;

      const nx = selectedNode.x ?? selectedNode.fx ?? 0;
      const ny = selectedNode.y ?? selectedNode.fy ?? 0;
      const nz = selectedNode.z ?? selectedNode.fz ?? 0;
      const dist = Math.hypot(nx, ny, nz) || 1;
      const distanceRatio = 1 + 48 / dist;

      fgRef.current.cameraPosition(
        {
          x: nx * distanceRatio,
          y: ny * distanceRatio + 6,
          z: nz * distanceRatio,
        },
        { x: nx, y: ny, z: nz },
        900
      );
    } else {
      // Return to center orbit when deselected
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.55;
      }
      fgRef.current.cameraPosition({ x: 0, y: 20, z: 165 }, { x: 0, y: 0, z: 0 }, 800);
    }
  }, [selectedNode]);

  const handleNodeHover = useCallback(
    (node: any) => {
      const validHover = node && node.id !== 'hub' ? node : null;
      isHoveredRef.current = Boolean(validHover);
      setHoveredId(validHover ? String(validHover.id) : null);

      if (typeof document !== 'undefined') {
        document.body.style.cursor = validHover ? 'pointer' : 'default';
      }

      if (fgRef.current) {
        const controls = fgRef.current.controls?.();
        if (controls) {
          controls.autoRotate = !validHover && !isLockedRef.current;
        }
      }

      onNodeHover(validHover);
    },
    [onNodeHover]
  );

  const handleNodeClick = useCallback(
    (node: any) => {
      if (!node || node.id === 'hub') return;
      if (onNodeClick) {
        onNodeClick(node);
      }
    },
    [onNodeClick]
  );

  const selectedId = selectedNode ? String(selectedNode.id) : null;

  // 3. Visual Hierarchy: Group 1 = 7 Core Agents (Cyan #00ffff, larger), Group 2 = Rule Nodes (Tiny White #ffffff)
  const nodeThreeObject = useCallback(
    (node: any) => {
      const idStr = String(node.id);
      const isHovered = hoveredId === idStr;
      const isSelected = selectedId === idStr;
      const isHighlighted = (isHovered || isSelected) && node.id !== 'hub';
      const isAgent = node.group === 1;

      if (isHighlighted) {
        const group = new THREE.Group();
        const coreRadius = isAgent ? 2.6 : 1.55;
        const haloRadius = isAgent ? 4.4 : 2.8;

        const coreGeo = new THREE.SphereGeometry(coreRadius, 18, 18);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        group.add(new THREE.Mesh(coreGeo, coreMat));

        const haloGeo = new THREE.SphereGeometry(haloRadius, 18, 18);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.34,
        });
        group.add(new THREE.Mesh(haloGeo, haloMat));

        return group;
      }

      if (isAgent) {
        // Group 1: The 7 Core Agents — Larger Cyan (#00ffff) nodes with subtle glow
        const group = new THREE.Group();
        const coreGeo = new THREE.SphereGeometry(1.85, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        group.add(new THREE.Mesh(coreGeo, coreMat));

        const glowGeo = new THREE.SphereGeometry(2.9, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.18,
        });
        group.add(new THREE.Mesh(glowGeo, glowMat));

        return group;
      }

      // Group 2: Tiny White (#ffffff) Rule Nodes
      const sphereGeo = new THREE.SphereGeometry(node.id === 'hub' ? 1.2 : 0.62, 10, 10);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
      return new THREE.Mesh(sphereGeo, sphereMat);
    },
    [hoveredId, selectedId]
  );

  const getNodeColor = useCallback(
    (node: any) => {
      const idStr = String(node.id);
      if (hoveredId === idStr || selectedId === idStr) return '#00ffff';
      return node.group === 1 ? '#00ffff' : '#ffffff';
    },
    [hoveredId, selectedId]
  );

  const getLinkColor = useCallback(
    (link: any) => {
      const activeId = hoveredId || selectedId;
      if (!activeId) return '#1E3A8A';
      const srcId = typeof link.source === 'object' ? link.source?.id : link.source;
      const tgtId = typeof link.target === 'object' ? link.target?.id : link.target;
      if (String(srcId) === activeId || String(tgtId) === activeId) {
        return '#00ffff';
      }
      return '#1E3A8A';
    },
    [hoveredId, selectedId]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#050505] overflow-hidden select-none"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#050505',
        overflow: 'hidden',
      }}
    >
      <ForceGraph3D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        backgroundColor="#050505"
        showNavInfo={false}
        nodeLabel={() => ''}
        nodeColor={getNodeColor}
        nodeThreeObject={nodeThreeObject}
        nodeRelSize={1.2}
        linkColor={getLinkColor}
        linkOpacity={0.38}
        linkWidth={(link: any) => {
          const activeId = hoveredId || selectedId;
          if (!activeId) return 0.55;
          const srcId = typeof link.source === 'object' ? link.source?.id : link.source;
          const tgtId = typeof link.target === 'object' ? link.target?.id : link.target;
          return String(srcId) === activeId || String(tgtId) === activeId ? 1.5 : 0.45;
        }}
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.4}
        warmupTicks={20}
        cooldownTicks={60}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
      />
    </div>
  );
}
