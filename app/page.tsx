'use client';

import React, { useEffect, useState } from 'react';
import Brain3D from '../components/Brain3D';
import { BrainGraphData, getBrainData } from '../lib/brain-parser';

export default function Home() {
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [queryText, setQueryText] = useState<string>('');
  const [graphData, setGraphData] = useState<BrainGraphData>(() =>
    getBrainData({ nodeCount: 360 })
  );

  // Sync live markdown files from /api/brain on mount
  useEffect(() => {
    let active = true;
    fetch('/api/brain')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (active && payload && Array.isArray(payload.nodes) && payload.nodes.length > 0) {
          setGraphData(payload);
        }
      })
      .catch(() => {
        // Fallback to local getBrainData already initialized
      });
    return () => {
      active = false;
    };
  }, []);

  const showTooltip = Boolean(hoveredNode && hoveredNode.id !== 'hub');
  const displayNodeId = hoveredNode?.id ? String(hoveredNode.id).split('::')[0] : '';

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-[#050505] text-white select-none"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#050505',
        color: '#ffffff',
      }}
    >
      {/* 3D Synaptic Constellation Canvas */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <Brain3D
          data={graphData}
          onNodeHover={setHoveredNode}
          onNodeClick={(node) => {
            setSelectedNode(node);
            setQueryText('');
          }}
        />
      </div>

      {/* Vercel/Linear-Style Dynamic Hover Tooltip (Fixed Top-Left, Hidden on 'hub' or null) */}
      <div
        className={`fixed top-6 left-6 z-50 w-80 max-w-[calc(100vw-3rem)] bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl transition-all duration-200 pointer-events-none ${
          showTooltip
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-2 scale-95'
        }`}
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          zIndex: 50,
          width: '320px',
          maxWidth: 'calc(100vw - 48px)',
          backgroundColor: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
          transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          opacity: showTooltip ? 1 : 0,
          transform: showTooltip ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
          visibility: showTooltip ? 'visible' : 'hidden',
        }}
      >
        {showTooltip && (
          <div className="flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Header: Tiny Glowing Cyan Dot + Node Name */}
            <div className="flex items-center gap-2.5" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] shrink-0"
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  backgroundColor: '#22d3ee',
                  boxShadow: '0 0 8px #22d3ee',
                  flexShrink: 0,
                }}
              />
              <h3
                className="text-sm font-semibold text-white truncate"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {hoveredNode.name}
              </h3>
            </div>

            {/* Description (First `- ` rule line) */}
            <p
              className="text-xs text-gray-400 leading-relaxed line-clamp-3"
              style={{
                fontSize: '12px',
                color: '#9ca3af',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {hoveredNode.description}
            </p>

            {/* Footer: Node ID + Click to query */}
            <div
              className="pt-2 mt-1 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-cyan-400"
              style={{
                paddingTop: '8px',
                marginTop: '4px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#22d3ee',
              }}
            >
              <span>ID: {displayNodeId}</span>
              <span>Click to query →</span>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Bottom-Left Status Pill when idle */}
      <div
        className="fixed bottom-6 left-6 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 text-[11px] font-mono text-gray-400 pointer-events-none"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#9ca3af',
          pointerEvents: 'none',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '9999px',
            backgroundColor: '#22d3ee',
            boxShadow: '0 0 6px #22d3ee',
          }}
        />
        <span>SYNAPTIC CONSTELLATION • {graphData.nodes.length} NODES • HOVER NODE TO INSPECT</span>
      </div>

      {/* Node Query / Inspection Panel (Opens when clicking a node) */}
      {selectedNode && selectedNode.id !== 'hub' && (
        <aside
          className="fixed top-6 right-6 bottom-6 z-40 w-96 max-w-[calc(100vw-3rem)] bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col justify-between transition-all duration-200"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            bottom: '24px',
            zIndex: 40,
            width: '384px',
            maxWidth: 'calc(100vw - 48px)',
            backgroundColor: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            className="flex flex-col gap-4 overflow-hidden h-full"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden', height: '100%' }}
          >
            <div
              className="flex items-start justify-between gap-3 pb-3 border-b border-white/10"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div>
                <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '9999px',
                      backgroundColor: '#22d3ee',
                      boxShadow: '0 0 8px #22d3ee',
                    }}
                  />
                  <span
                    className="text-[10px] font-mono uppercase tracking-wider text-cyan-400"
                    style={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', color: '#22d3ee' }}
                  >
                    {String(selectedNode.id).split('::')[0]}
                  </span>
                </div>
                <h2
                  className="text-base font-semibold text-white mt-1"
                  style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginTop: '4px' }}
                >
                  {selectedNode.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="px-2 py-1 rounded-md text-xs font-mono text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#9ca3af',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                }}
              >
                ESC
              </button>
            </div>

            {/* Filter / Query Input */}
            <div>
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Filter rules in this node..."
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-cyan-400"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '12px',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {/* Node Content / Active Rules */}
            <div
              className="flex-1 overflow-y-auto pr-1 text-xs text-gray-300 space-y-2.5 font-mono leading-relaxed"
              style={{
                flex: 1,
                overflowY: 'auto',
                fontSize: '12px',
                color: '#d1d5db',
                fontFamily: 'monospace',
                lineHeight: 1.6,
              }}
            >
              {(selectedNode.content || selectedNode.description || '')
                .split('\n')
                .filter((line: string) =>
                  queryText.trim()
                    ? line.toLowerCase().includes(queryText.toLowerCase())
                    : line.trim().length > 0
                )
                .map((line: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-gray-300"
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      marginBottom: '8px',
                    }}
                  >
                    {line.replace(/^-\s*/, '')}
                  </div>
                ))}
            </div>
          </div>
        </aside>
      )}
    </main>
  );
}
