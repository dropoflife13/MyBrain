'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Download,
  ExternalLink,
  FileCode2,
  GitFork,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import Brain3D from '../components/Brain3D';
import { BrainGraphData, getBrainData } from '../lib/brain-parser';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function Home() {
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [queryText, setQueryText] = useState<string>('');
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
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
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // BUG FIX: Pressing Escape MUST close the sidebar and deselect the node (or close modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedNode(null);
        setIsShareOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const showHoverTooltip = Boolean(hoveredNode && hoveredNode.id !== 'hub');
  const selectedIdClean = selectedNode?.id ? String(selectedNode.id).split('::')[0] : '';

  const formattedLines: string[] = React.useMemo(() => {
    if (!selectedNode) return [];
    const raw = selectedNode.content || selectedNode.description || '';
    return raw
      .split(/\r?\n/)
      .filter((line: string) =>
        queryText.trim()
          ? line.toLowerCase().includes(queryText.toLowerCase())
          : line.trim().length > 0
      );
  }, [selectedNode, queryText]);

  return (
    <main
      onMouseMove={handleMouseMove}
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
      {/* Full-Screen 3D Synaptic Constellation Canvas */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <Brain3D
          data={graphData}
          selectedNode={selectedNode}
          onNodeHover={setHoveredNode}
          onNodeClick={(node) => {
            setSelectedNode(node);
            setQueryText('');
          }}
        />
      </div>

      {/* Minimal Top-Left Brand Mark (Uses uploaded /cortex-logo-cyan.svg) */}
      <header
        className="fixed top-5 left-6 z-20 flex items-center gap-3 pointer-events-none"
        style={{
          position: 'fixed',
          top: '20px',
          left: '24px',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'none',
        }}
      >
        <img
          src="/cortex-logo-cyan.svg"
          alt="Cortex Logo"
          className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(0,255,255,0.35)]"
          style={{ width: '32px', height: '32px' }}
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono font-semibold tracking-widest text-white uppercase"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.1em',
              }}
            >
              CORTEX
            </span>
            <span className="text-[10px] font-mono text-zinc-500">// VAULT</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full bg-[#00ffff] shadow-[0_0_6px_#00ffff]"
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '9999px',
                  backgroundColor: '#00ffff',
                  display: 'inline-block',
                }}
              />
              7 Core Agents
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-white"
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  display: 'inline-block',
                }}
              />
              Vault Rules
            </span>
          </div>
        </div>
      </header>

      {/* 1. Dynamic Cursor-Following Dark Glass Tooltip (Shows ONLY Title) */}
      <AnimatePresence>
        {showHoverTooltip && (
          <motion.div
            key="cursor-tooltip"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.12 }}
            className="fixed z-50 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#09090b]/90 backdrop-blur-md border border-white/10 shadow-2xl"
            style={{
              position: 'fixed',
              left: `${Math.min(mousePos.x + 16, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 260)}px`,
              top: `${Math.max(mousePos.y - 12, 16)}px`,
              zIndex: 50,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(9, 9, 11, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.8)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '9999px',
                backgroundColor: hoveredNode?.group === 1 ? '#00ffff' : '#ffffff',
                boxShadow:
                  hoveredNode?.group === 1
                    ? '0 0 8px #00ffff'
                    : '0 0 4px rgba(255,255,255,0.6)',
              }}
            />
            <span
              className="text-xs font-medium text-white whitespace-nowrap"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                color: '#ffffff',
                whiteSpace: 'nowrap',
              }}
            >
              {hoveredNode?.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Right Sidebar Overhaul (Framer Motion Slide-In + Glass Overlay + Code Notepad) */}
      <AnimatePresence>
        {selectedNode && selectedNode.id !== 'hub' && (
          <motion.aside
            key="inspector-sidebar"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-40 w-[460px] max-w-full backdrop-blur-md bg-black/60 border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 40,
              width: '460px',
              maxWidth: '100vw',
              backdropFilter: 'blur(16px)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Code Editor / Notepad Container (`#09090b`, `JetBrains Mono`) */}
            <div
              className="flex flex-col h-full rounded-xl bg-[#09090b] border border-white/10 overflow-hidden shadow-inner"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderRadius: '12px',
                backgroundColor: '#09090b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              {/* Editor Top Tab Bar */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-950/80"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCode2 className="w-4 h-4 text-[#00ffff] shrink-0" />
                  <span className="text-xs font-semibold text-zinc-100 truncate">
                    {selectedIdClean}.md
                  </span>
                  <Badge variant={selectedNode.group === 1 ? 'default' : 'secondary'}>
                    {selectedNode.group === 1 ? 'GROUP 1 • AGENT' : 'GROUP 2 • RULE'}
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedNode(null)}
                  title="Close (Esc)"
                  aria-label="Close panel"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Node Title & Filter Bar */}
              <div
                className="px-4 py-3 border-b border-white/10 bg-[#09090b] space-y-2.5"
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  {selectedNode.name}
                </h2>
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Filter markdown rules... (Press Esc to close)"
                    className="w-full pl-8 pr-3 py-1.5 rounded-md bg-zinc-900/90 border border-white/10 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#00ffff]/60"
                    style={{
                      width: '100%',
                      paddingLeft: '30px',
                      paddingRight: '12px',
                      paddingTop: '6px',
                      paddingBottom: '6px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(24, 24, 27, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '12px',
                      color: '#e4e4e7',
                    }}
                  />
                </div>
              </div>

              {/* Code Notepad Body */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-2 text-xs leading-relaxed text-zinc-300"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  fontSize: '12px',
                  lineHeight: 1.65,
                  color: '#d4d4d8',
                }}
              >
                {formattedLines.map((line: string, index: number) => {
                  const isHeading = line.trim().startsWith('#');
                  const cleanLine = line.replace(/^-\s*/, '').trim();
                  const ruleIdMatch = cleanLine.match(/^\*\*([A-Z]{1,4}-\d+)\*\*\s*(.+)$/);

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 py-1.5 px-2 rounded hover:bg-white/[0.03] transition-colors"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '6px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      <span
                        className="text-[10px] text-zinc-600 select-none w-5 text-right shrink-0 pt-0.5"
                        style={{
                          fontSize: '10px',
                          color: '#52525b',
                          width: '20px',
                          textAlign: 'right',
                          flexShrink: 0,
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      {isHeading ? (
                        <span className="text-[#00ffff] font-semibold">
                          {line.replace(/^#+\s*/, '# ')}
                        </span>
                      ) : ruleIdMatch ? (
                        <div className="flex-1">
                          <span
                            className="inline-block px-1.5 py-0.5 mr-2 rounded bg-[#00ffff]/15 text-[#00ffff] font-semibold text-[11px]"
                            style={{
                              padding: '1px 6px',
                              marginRight: '8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(0, 255, 255, 0.14)',
                              color: '#00ffff',
                              fontWeight: 600,
                              fontSize: '11px',
                            }}
                          >
                            {ruleIdMatch[1]}
                          </span>
                          <span className="text-zinc-200">
                            {ruleIdMatch[2].replace(/\*\*/g, '')}
                          </span>
                        </div>
                      ) : (
                        <span className="flex-1 text-zinc-300">
                          {cleanLine.replace(/\*\*/g, '')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Editor Status Bar Footer */}
              <div
                className="px-4 py-2 border-t border-white/10 bg-zinc-950 flex items-center justify-between text-[10px] text-zinc-500"
                style={{
                  padding: '8px 16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: '#71717a',
                }}
              >
                <span>UTF-8 • MARKDOWN VAULT</span>
                <span>ESC TO UNLOCK CAMERA</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 4. Floating "Fork this Brain" Button (Bottom-Right Corner) */}
      <div
        className="fixed bottom-6 right-6 z-30"
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 30 }}
      >
        <Button
          variant="outline"
          onClick={() => setIsShareOpen(true)}
          className="backdrop-blur-md bg-[#09090b]/85 border-white/15 hover:border-[#00ffff]/50 shadow-2xl px-4 py-2.5 h-auto font-mono text-xs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            backgroundColor: 'rgba(9, 9, 11, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#f4f4f5',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          <GitFork className="w-3.5 h-3.5 text-[#00ffff]" />
          <span>Fork this Brain</span>
        </Button>
      </div>

      {/* Share / Export Modal ("Want your own Brain Vault? Clone the template.") */}
      <AnimatePresence>
        {isShareOpen && (
          <motion.div
            key="share-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShareOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(6px)',
              padding: '16px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-[#09090b] border border-white/10 p-6 shadow-2xl space-y-5"
              style={{
                width: '100%',
                maxWidth: '440px',
                borderRadius: '16px',
                backgroundColor: '#09090b',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/cortex-logo-cyan.svg"
                    alt="Cortex"
                    className="w-9 h-9 object-contain"
                    style={{ width: '36px', height: '36px' }}
                  />
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Want your own Brain Vault? Clone the template.
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Deploy your own 7-Agent Gate Suite & Procedural Markdown Brain.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsShareOpen(false)}
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div
                className="p-3.5 rounded-xl bg-zinc-900/70 border border-white/5 text-xs font-mono text-zinc-300 space-y-1"
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(24, 24, 27, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                }}
              >
                <div className="text-zinc-500">// Includes:</div>
                <div>• /agents (PM, UX, GR, SD, IR, DB, SEC Gatekeepers)</div>
                <div>• /brain (01-identity, 02-domains, 03-heuristics, 07-meta)</div>
                <div>• 3D Synaptic Constellation WebGL Console</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a
                  href="https://github.com/dropoflife13/MyBrain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#00ffff] px-4 py-2.5 text-xs font-mono font-semibold text-zinc-950 hover:bg-cyan-300 transition-colors"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '8px',
                    backgroundColor: '#00ffff',
                    color: '#09090b',
                    padding: '10px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Clone on GitHub</span>
                </a>

                <a
                  href="/brain-template.zip"
                  download="brain-vault-template.zip"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-zinc-900 px-4 py-2.5 text-xs font-mono font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#18181b',
                    color: '#e4e4e7',
                    padding: '10px 16px',
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                >
                  <Download className="w-3.5 h-3.5 text-[#00ffff]" />
                  <span>Download .zip</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
