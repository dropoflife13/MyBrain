'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Cpu,
  Download,
  ExternalLink,
  FileCode2,
  GitFork,
  Pause,
  RotateCw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import Brain3D from '../components/Brain3D';
import { BrainDocNode, BrainGraphData, getBrainData } from '../lib/brain-parser';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const AGENT_DOCK: Array<{ id: string; code: string; label: string }> = [
  { id: 'dbaagent', code: 'DB', label: 'Database' },
  { id: 'securityagent', code: 'SEC', label: 'Security' },
  { id: 'uiuxagent', code: 'UX', label: 'UI / UX' },
  { id: 'productmanageragent', code: 'PM', label: 'Product' },
  { id: 'systemsdesignagent', code: 'SD', label: 'Systems' },
  { id: 'integrationagent', code: 'IR', label: 'Integration' },
  { id: 'growthagent', code: 'GR', label: 'Growth' },
];

export default function Home() {
  const [hoveredNode, setHoveredNode] = useState<BrainDocNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<BrainDocNode | null>(null);
  const [autoSpin, setAutoSpin] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [queryText, setQueryText] = useState<string>('');
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  // Custom Boot Loader State
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [bootProgress, setBootProgress] = useState<number>(12);
  const [sceneReady, setSceneReady] = useState<boolean>(false);

  const [graphData, setGraphData] = useState<BrainGraphData>(() =>
    getBrainData({ nodeCount: 360 })
  );

  // Smooth Boot Loader Progression
  useEffect(() => {
    const interval = setInterval(() => {
      setBootProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = sceneReady ? 18 : 7;
        return Math.min(100, prev + step);
      });
    }, 65);

    return () => clearInterval(interval);
  }, [sceneReady]);

  useEffect(() => {
    if (bootProgress >= 100) {
      const doneTimer = setTimeout(() => setIsBooting(false), 220);
      return () => clearTimeout(doneTimer);
    }
  }, [bootProgress]);

  // Safety fallback so loader never hangs > 2.2s
  useEffect(() => {
    const fallback = setTimeout(() => {
      setBootProgress(100);
      setIsBooting(false);
    }, 2200);
    return () => clearTimeout(fallback);
  }, []);

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

  // Pressing Escape closes the sidebar and deselects the node (or closes Share modal)
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

  const handleCloseSidebar = () => {
    setSelectedNode(null);
    setQueryText('');
  };

  const handleSelectAgentFromDock = (agentId: string) => {
    const target = graphData.nodes.find((n) => n.id === agentId);
    if (target) {
      if (selectedNode?.id === target.id) {
        handleCloseSidebar();
      } else {
        setSelectedNode(target);
        setQueryText('');
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const showHoverTooltip = Boolean(hoveredNode && hoveredNode.id !== 'hub');
  const selectedIdClean = selectedNode?.id ? String(selectedNode.id).split('::')[0] : '';

  const formattedLines: string[] = useMemo(() => {
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
    >
      {/* 1. Full-Screen 3D Synaptic Constellation Canvas */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Brain3D
          data={graphData}
          selectedNode={selectedNode}
          autoSpin={autoSpin}
          onNodeHover={setHoveredNode}
          onNodeClick={(node) => {
            if (node) {
              setSelectedNode(node);
              setQueryText('');
            }
          }}
          onReady={() => setSceneReady(true)}
          onFpsUpdate={setFps}
        />
      </div>

      {/* 2. Layered Atmospheric Background Overlays (Blueprint Grid + Radial Vignette + Corner Reticles) */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, transparent 42%, rgba(2, 4, 10, 0.82) 100%),
            radial-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px',
        }}
      />

      {/* Precision Corner Telemetry Reticles */}
      <div className="pointer-events-none fixed top-20 left-6 z-10 w-3 h-3 border-t border-l border-cyan-400/30" />
      <div className="pointer-events-none fixed top-20 right-6 z-10 w-3 h-3 border-t border-r border-cyan-400/30" />
      <div className="pointer-events-none fixed bottom-6 left-6 z-10 w-3 h-3 border-b border-l border-cyan-400/30" />

      {/* 3. Top Desktop Command Bar (Brand + 7-Agent Quick Dock + Auto-Spin Control) */}
      <header className="fixed top-4 left-6 right-6 z-30 flex items-center justify-between gap-4 pointer-events-none">
        {/* Left: Cortex Brand & Telemetry Pill */}
        <div className="pointer-events-auto flex items-center gap-3.5 px-3.5 py-2 rounded-xl bg-[#09090b]/85 backdrop-blur-xl border border-white/10 shadow-2xl">
          <img
            src="/cortex-logo-cyan.svg"
            alt="Cortex Logo"
            className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(0,255,255,0.45)]"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                CORTEX
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/10 text-[#00ffff] border border-cyan-400/20">
                v2.4
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00ffff] shadow-[0_0_6px_#00ffff]" />
                7 Agents
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {graphData.nodes.length - 1} Synapses
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400">
                <Activity className="w-3 h-3" />
                {fps} FPS
              </span>
            </div>
          </div>
        </div>

        {/* Center: 7-Agent Quick-Jump Dock */}
        <nav className="pointer-events-auto hidden lg:flex items-center gap-1 p-1.5 rounded-xl bg-[#09090b]/85 backdrop-blur-xl border border-white/10 shadow-2xl">
          <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00ffff]" />
            Gates:
          </span>
          {AGENT_DOCK.map((agent) => {
            const isActive = selectedNode?.id === agent.id;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => handleSelectAgentFromDock(agent.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#00ffff] text-zinc-950 font-bold shadow-[0_0_12px_rgba(0,255,255,0.4)]'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-zinc-950' : 'bg-[#00ffff]'
                  }`}
                />
                <span>{agent.code}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Auto-Spin Toggle Control */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoSpin((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl backdrop-blur-xl border text-xs font-mono transition-all cursor-pointer shadow-2xl ${
              autoSpin
                ? 'bg-[#09090b]/85 border-cyan-400/35 text-[#00ffff]'
                : 'bg-[#09090b]/85 border-white/10 text-zinc-400 hover:text-white'
            }`}
            title="Toggle 3D Auto-Orbit"
          >
            {autoSpin ? (
              <RotateCw className="w-3.5 h-3.5 text-[#00ffff] animate-spin" />
            ) : (
              <Pause className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span>Auto-Spin: {autoSpin ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </header>

      {/* 4. Dynamic Cursor-Following Dark Glass Tooltip (Shows ONLY Title) */}
      <AnimatePresence>
        {showHoverTooltip && (
          <motion.div
            key="cursor-tooltip"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#09090b]/95 backdrop-blur-md border border-white/15 shadow-2xl"
            style={{
              left: `${Math.min(
                mousePos.x + 18,
                (typeof window !== 'undefined' ? window.innerWidth : 1200) - 260
              )}px`,
              top: `${Math.max(mousePos.y - 12, 16)}px`,
            }}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                hoveredNode?.group === 1
                  ? 'bg-[#00ffff] shadow-[0_0_8px_#00ffff]'
                  : 'bg-white shadow-[0_0_4px_#ffffff]'
              }`}
            />
            <span className="text-xs font-mono font-medium text-white whitespace-nowrap">
              {hoveredNode?.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Right Sidebar Overhaul (Framer Motion Slide-In + Guaranteed Close on X & Escape) */}
      <AnimatePresence>
        {selectedNode && selectedNode.id !== 'hub' && (
          <motion.aside
            key="inspector-sidebar"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-40 w-[460px] max-w-full backdrop-blur-md bg-black/60 border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl"
          >
            <div
              className="flex flex-col h-full rounded-xl bg-[#09090b] border border-white/10 overflow-hidden shadow-2xl"
              style={{
                fontFamily:
                  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              {/* Editor Top Tab Bar with Explicit Working Exit Button */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-950">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCode2 className="w-4 h-4 text-[#00ffff] shrink-0" />
                  <span className="text-xs font-semibold text-zinc-100 truncate">
                    {selectedIdClean}.md
                  </span>
                  <Badge variant={selectedNode.group === 1 ? 'default' : 'secondary'}>
                    {selectedNode.group === 1 ? 'GROUP 1 • AGENT' : 'GROUP 2 • RULE'}
                  </Badge>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseSidebar();
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-red-500/20 border border-white/10 hover:border-red-400/40 text-zinc-300 hover:text-red-200 text-xs font-mono transition-colors cursor-pointer"
                  title="Close Inspector (Esc)"
                  aria-label="Close panel"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ESC</span>
                </button>
              </div>

              {/* Node Title & Filter Search Bar */}
              <div className="px-4 py-3 border-b border-white/10 bg-[#09090b] space-y-2.5">
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  {selectedNode.name}
                </h2>
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Filter rules in this file..."
                    className="w-full pl-8 pr-8 py-1.5 rounded-md bg-zinc-900/90 border border-white/10 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#00ffff]/60"
                  />
                  {queryText && (
                    <button
                      type="button"
                      onClick={() => setQueryText('')}
                      className="absolute right-2.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Code Notepad Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5 text-xs leading-relaxed text-zinc-300">
                {formattedLines.map((line: string, index: number) => {
                  const isHeading = line.trim().startsWith('#');
                  const cleanLine = line.replace(/^-\s*/, '').trim();
                  const ruleIdMatch = cleanLine.match(/^\*\*([A-Z]{1,4}-\d+)\*\*\s*(.+)$/);

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 py-1.5 px-2 rounded hover:bg-white/[0.04] transition-colors"
                    >
                      <span className="text-[10px] text-zinc-600 select-none w-5 text-right shrink-0 pt-0.5">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      {isHeading ? (
                        <span className="text-[#00ffff] font-semibold">
                          {line.replace(/^#+\s*/, '# ')}
                        </span>
                      ) : ruleIdMatch ? (
                        <div className="flex-1">
                          <span className="inline-block px-1.5 py-0.5 mr-2 rounded bg-[#00ffff]/15 text-[#00ffff] font-semibold text-[11px]">
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
              <div className="px-4 py-2.5 border-t border-white/10 bg-zinc-950 flex items-center justify-between text-[10px] text-zinc-500">
                <span>UTF-8 • MARKDOWN VAULT</span>
                <button
                  type="button"
                  onClick={handleCloseSidebar}
                  className="text-[#00ffff] hover:underline cursor-pointer"
                >
                  UNLOCK CAMERA [ESC]
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 6. Floating "Fork this Brain" Button (Bottom-Right Corner) */}
      <div className="fixed bottom-6 right-6 z-30">
        <Button
          variant="outline"
          onClick={() => setIsShareOpen(true)}
          className="backdrop-blur-xl bg-[#09090b]/85 border-white/15 hover:border-[#00ffff]/50 shadow-2xl px-4 py-2.5 h-auto font-mono text-xs"
        >
          <GitFork className="w-3.5 h-3.5 text-[#00ffff]" />
          <span>Fork this Brain</span>
        </Button>
      </div>

      {/* 7. Share / Export Modal ("Want your own Brain Vault? Clone the template.") */}
      <AnimatePresence>
        {isShareOpen && (
          <motion.div
            key="share-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShareOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-[#09090b] border border-white/15 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/cortex-logo-cyan.svg"
                    alt="Cortex"
                    className="w-9 h-9 object-contain"
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

              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-white/10 text-xs font-mono text-zinc-300 space-y-1">
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
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Clone on GitHub</span>
                </a>

                <a
                  href="/brain-template.zip"
                  download="brain-vault-template.zip"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-zinc-900 px-4 py-2.5 text-xs font-mono font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#00ffff]" />
                  <span>Download .zip</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Custom Initial Boot Loader Overlay */}
      <AnimatePresence>
        {isBooting && (
          <motion.div
            key="cortex-boot-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.08) 0%, transparent 60%)',
            }}
          >
            {/* Orbital Spinner + Cortex Logo */}
            <div className="relative flex items-center justify-center w-28 h-28 mb-6">
              <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" />
              <div className="absolute inset-1 rounded-full border-2 border-t-[#00ffff] border-r-transparent border-b-blue-600/50 border-l-transparent animate-spin" />
              <img
                src="/cortex-logo-cyan.svg"
                alt="Cortex Boot"
                className="w-12 h-12 object-contain drop-shadow-[0_0_16px_rgba(0,255,255,0.6)]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono tracking-[0.2em] text-white uppercase mb-2">
              <Cpu className="w-3.5 h-3.5 text-[#00ffff]" />
              <span>SYNTHESIZING CORTEX MATRIX</span>
            </div>

            <p className="text-[11px] font-mono text-zinc-500 mb-5">
              HYDRATING 7-AGENT GATE SUITE &amp; 360 SYNAPTIC NODES...
            </p>

            {/* Progress Bar */}
            <div className="w-64 h-1 rounded-full bg-zinc-900 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-[#00ffff] transition-all duration-100"
                style={{ width: `${bootProgress}%` }}
              />
            </div>
            <span className="mt-2 text-[10px] font-mono text-[#00ffff]">{bootProgress}%</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
