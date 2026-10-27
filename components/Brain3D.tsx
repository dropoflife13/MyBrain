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
  onNodeHover: (node: any) => void;
  onNodeClick?: (node: any) => void;
}

export default function Brain3D({ data, onNodeHover, onNodeClick }: Brain3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1280,
    height: 800,
  });
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  const graphData = useMemo(() => {
    return data && data.nodes?.length ? data : getBrainData({ nodeCount: 360 });
  }, [data]);

  // Track viewport/container dimensions cleanly
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

  // Set initial camera distance and gentle auto-orbit
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fgRef.current) {
        fgRef.current.cameraPosition({ x: 0, y: 24, z: 165 }, { x: 0, y: 0, z: 0 }, 800);
        const controls = fgRef.current.controls?.();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.65;
          controls.enableDamping = true;
          controls.dampingFactor = 0.06;
        }
      }
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const handleNodeHover = useCallback(
    (node: any) => {
      setActiveHoverId(node ? String(node.id) : null);
      if (typeof document !== 'undefined') {
        document.body.style.cursor = node && node.id !== 'hub' ? 'pointer' : 'default';
      }
      // Pause auto-rotate while inspecting a hovered node so it stays steady under the cursor
      if (fgRef.current) {
        const controls = fgRef.current.controls?.();
        if (controls) {
          controls.autoRotate = !node;
        }
      }
      onNodeHover(node || null);
    },
    [onNodeHover]
  );

  // Shared geometries & materials for crisp 60fps rendering
  const nodeThreeObject = useCallback(
    (node: any) => {
      const isHovered = activeHoverId !== null && String(node.id) === activeHoverId;
      const isHub = node.id === 'hub';
      const isPrimaryDoc =
        node.category === 'agent' ||
        node.category === 'domain' ||
        node.category === 'heuristic' ||
        node.category === 'identity';

      if (isHovered && !isHub) {
        // Larger, brighter glowing cyan/white node when hovered
        const group = new THREE.Group();

        const coreGeo = new THREE.SphereGeometry(isPrimaryDoc ? 2.1 : 1.65, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        group.add(new THREE.Mesh(coreGeo, coreMat));

        const haloGeo = new THREE.SphereGeometry(isPrimaryDoc ? 3.4 : 2.7, 16, 16);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0x22d3ee,
          transparent: true,
          opacity: 0.38,
        });
        group.add(new THREE.Mesh(haloGeo, haloMat));

        return group;
      }

      const radius = isHub ? 2.4 : isPrimaryDoc ? 1.15 : 0.68;
      const sphereGeo = new THREE.SphereGeometry(radius, 10, 10);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: isHub ? 0x38bdf8 : 0xffffff,
      });
      return new THREE.Mesh(sphereGeo, sphereMat);
    },
    [activeHoverId]
  );

  const getNodeColor = useCallback(
    (node: any) => {
      if (activeHoverId !== null && String(node.id) === activeHoverId && node.id !== 'hub') {
        return '#22D3EE';
      }
      return '#FFFFFF';
    },
    [activeHoverId]
  );

  const getLinkColor = useCallback(
    (link: any) => {
      if (!activeHoverId) return '#1E3A8A';
      const srcId = typeof link.source === 'object' ? link.source?.id : link.source;
      const tgtId = typeof link.target === 'object' ? link.target?.id : link.target;
      if (String(srcId) === activeHoverId || String(tgtId) === activeHoverId) {
        return '#38BDF8';
      }
      return '#1E3A8A';
    },
    [activeHoverId]
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
        linkOpacity={0.42}
        linkWidth={(link: any) => {
          if (!activeHoverId) return 0.6;
          const srcId = typeof link.source === 'object' ? link.source?.id : link.source;
          const tgtId = typeof link.target === 'object' ? link.target?.id : link.target;
          return String(srcId) === activeHoverId || String(tgtId) === activeHoverId ? 1.6 : 0.5;
        }}
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.4}
        warmupTicks={20}
        cooldownTicks={60}
        onNodeHover={handleNodeHover}
        onNodeClick={(node: any) => {
          if (onNodeClick && node && node.id !== 'hub') {
            onNodeClick(node);
          }
        }}
      />
    </div>
  );
}
