'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  Eye,
  FileCode2,
  GitFork,
  Layers,
  Pause,
  RefreshCw,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Brain3D from '../../components/Brain3D';
import AuditInspector from '../../components/AuditInspector';
import CommandPalette from '../../components/CommandPalette';
import NeuralLoader from '../../components/NeuralLoader';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  BrainDocNode,
  BrainGraphData,
  getBrainData,
  verifySevenAgentsGate,
} from '../../lib/brain-parser';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const AGENT_DOCK: Array<{ id: string; code: string; label: string }> = [
  { id: 'dbaagent', code: 'DB', label: 'Database' },
  { id: 'securityagent', code: 'SEC', label: 'Security' },
  { id: 'uiuxagent', code: 'UX', label: 'UI / UX' },
  { id: 'productmanageragent', code: 'PM', label: 'Product' },
  { id: 'systemsdesignagent', code: 'SD', label: 'Systems' },
  { id: 'integrationagent', code: 'IR', label: 'Integration' },
  { id: 'growthagent', code: 'GR', label: 'Growth' },
];

const SELF_ASSESSMENT_PROMPT = `Act as the Brain Agent (brain/07-meta/brainagent.md). Step 0 (Strict Gate BN-00): Verify that all 7 Core Agent files (PM, UX, GR, SD, IR, DB, SEC) exist in /agents; if even one is missing, output GATE: FAIL BN-00 and refuse to start. Once all 7 agents are verified, read brain/01-identity/ABOUT-ME.md and brain/05-elicitation/THE-TEST.md, and run Launcher L-01 to assess my blank-slate vault (0 rules) one question at a time.`;

export default function Home() {
  const [hoveredNode, setHoveredNode] = useState<BrainDocNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<BrainDocNode | null>(null);
  const [autoSpin, setAutoSpin] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [queryText, setQueryText] = useState<string>('');
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState<boolean>(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState<boolean>(false);
  const [vaultMode, setVaultMode] = useState<'assessed' | 'blank'>('assessed');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // 3D Graph Ready State for Seamless Neural Transition
  const [isGraphReady, setIsGraphReady] = useState<boolean>(false);
  const [minTimerDone, setMinTimerDone] = useState<boolean>(false);

  // Guarantee the NeuralLoader stays visible for at least 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimerDone(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Ready when both 3D graph is ready and minimum 2.5s has elapsed
  const isReady = isGraphReady && minTimerDone;

  const [assessedGraphData, setAssessedGraphData] = useState<BrainGraphData>(() =>
    getBrainData({ nodeCount: 360, mode: 'assessed' })
  );
  const blankGraphData = useMemo(
    () => getBrainData({ mode: 'blank' }),
    []
  );

  const graphData = vaultMode === 'blank' ? blankGraphData : assessedGraphData;
  const agentGate = useMemo(
    () => graphData.gateStatus ?? verifySevenAgentsGate(graphData.nodes),
    [graphData]
  );
  const [isCheckingGate, setIsCheckingGate] = useState<boolean>(false);

  const handleRecheckGate = () => {
    setIsCheckingGate(true);
    fetch('/api/brain')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (payload) {
          setAssessedGraphData(payload);
          if (payload.gateStatus?.passed) {
            setIsGraphReady(true);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setTimeout(() => setIsCheckingGate(false), 350);
      });
  };

  // Safety fallback so loader never hangs indefinitely
  useEffect(() => {
    const fallback = setTimeout(() => {
      setIsGraphReady(true);
      setMinTimerDone(true);
    }, 3800);
    return () => clearTimeout(fallback);
  }, []);

  // Sync live markdown files from /api/brain on mount
  useEffect(() => {
    let active = true;
    fetch('/api/brain')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (active && payload) {
          setAssessedGraphData(payload);
          if (payload.gateStatus && !payload.gateStatus.passed) {
            setIsGraphReady(true);
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleCopyPrompt = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(SELF_ASSESSMENT_PROMPT).catch(() => {});
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2200);
    }
  };

  const handleToggleVaultMode = (nextMode: 'assessed' | 'blank') => {
    setVaultMode(nextMode);
    setSelectedNode(null);
    setHoveredNode(null);
  };

  // Pressing Escape closes modals; Cmd+K and '/' open Global Command Palette (GR-04)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen((prev) => !prev);
        return;
      }
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        setIsCmdPaletteOpen(true);
        return;
      }
      if (e.key === 'Escape') {
        if (isCmdPaletteOpen) {
          setIsCmdPaletteOpen(false);
        } else if (isMatrixOpen) {
          setIsMatrixOpen(false);
        } else {
          setSelectedNode(null);
          setIsShareOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCmdPaletteOpen]);

  // Deep-link support for ?node=<id> URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get('node');
      if (targetId) {
        const found = graphData.nodes.find(
          (n) =>
            n.id.toLowerCase() === targetId.toLowerCase() ||
            String(n.id).toLowerCase().startsWith(`${targetId.toLowerCase()}::`)
        );
        if (found) {
          setSelectedNode(found);
          const ruleMatch = String(found.id).match(/^([A-Z]{1,4}-\d+)/);
          if (ruleMatch) setQueryText(ruleMatch[1]);
        }
      }
    }
  }, [graphData.nodes]);

  const handleSelectNodeFromPalette = (node: BrainDocNode) => {
    setSelectedNode(node);
    const ruleMatch = String(node.id).match(/^([A-Z]{1,4}-\d+)/);
    if (ruleMatch) {
      setQueryText(ruleMatch[1]);
    } else {
      setQueryText('');
    }
  };

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
      className="relative w-screen h-screen overflow-hidden bg-[#f0f4f8] dark:bg-[#050505] text-slate-900 dark:text-white select-none transition-colors duration-300"
    >
      {/* 1. Full-Screen 3D Synaptic Constellation Canvas */}
      <motion.div
        className="absolute inset-0 w-full h-full z-0 bg-[#f0f4f8] dark:bg-[#050505] transition-colors duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: isReady ? 1 : 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
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
          onReady={() => setIsGraphReady(true)}
          onFpsUpdate={setFps}
        />
      </motion.div>

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
      <div className="pointer-events-none fixed top-20 left-6 z-10 w-3 h-3 border-t border-l border-cyan-500/30 dark:border-cyan-400/30" />
      <div className="pointer-events-none fixed top-20 right-6 z-10 w-3 h-3 border-t border-r border-cyan-500/30 dark:border-cyan-400/30" />
      <div className="pointer-events-none fixed bottom-6 left-6 z-10 w-3 h-3 border-b border-l border-cyan-500/30 dark:border-cyan-400/30" />

      {/* 3. Top Desktop Command Bar (Horizontal Left-Aligned Gates & Telemetry) */}
      <header className="fixed top-4 left-4 right-4 md:left-6 md:right-6 z-30 flex items-center justify-between pointer-events-none gap-2 sm:gap-3">
        {/* Left: Overview Link + Cortex Brand Pill + Horizontal 7-Agent Gates */}
        <div className="flex items-center justify-start gap-2 pointer-events-auto shrink-0">
          <Link
            href="/"
            className="h-10 flex items-center justify-center gap-1.5 px-3 rounded-xl bg-white/90 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-white backdrop-blur-xl border border-slate-300 dark:border-white/10 text-xs font-mono transition-all shadow-xl cursor-pointer shrink-0"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Overview</span>
          </Link>

          <div className="h-10 flex items-center justify-center gap-2 px-3 rounded-xl bg-white/90 dark:bg-[#09090b]/85 backdrop-blur-xl border border-slate-300 dark:border-white/10 shadow-xl shrink-0">
            <img
              src="/cortex-logo-cyan.svg"
              alt="Cortex Logo"
              className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(0,255,255,0.45)]"
            />
            <span className="text-xs font-mono font-bold tracking-widest text-slate-900 dark:text-white uppercase">
              CORTEX
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-600 dark:text-[#00ffff] border border-cyan-500/20 dark:border-cyan-400/20 font-bold">
              v2.4
            </span>
          </div>

          {/* 7-Agent Horizontal Dock (Positioned on the Left) */}
          <nav className="h-10 hidden md:flex items-center justify-start gap-0.5 sm:gap-1 p-1 rounded-xl bg-white/90 dark:bg-[#09090b]/85 backdrop-blur-xl border border-slate-300 dark:border-white/10 shadow-xl shrink-0">
            <span className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff]" />
              Gates:
            </span>
            {AGENT_DOCK.map((agent) => {
              const isActive = selectedNode?.id === agent.id;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => handleSelectAgentFromDock(agent.id)}
                  className={`h-8 px-2 sm:px-2.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-cyan-500 dark:bg-[#00ffff] text-black font-bold shadow-[0_0_12px_rgba(0,255,255,0.4)]'
                      : 'text-slate-600 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-black' : 'bg-cyan-500 dark:bg-[#00ffff]'
                    }`}
                  />
                  <span>{agent.code}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Search Palette Trigger + Vault State Switcher + Theme Toggle + Auto-Spin */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          {/* Governance Matrix & Contradiction Inspector (GR-04, X-01..05) */}
          <button
            type="button"
            onClick={() => setIsMatrixOpen(true)}
            className="h-10 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-xl bg-white/90 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-white backdrop-blur-xl border border-slate-300 dark:border-white/10 text-xs font-mono transition-all shadow-xl cursor-pointer"
            title="Inspect Brain ↔ 7 Agent Matrix & Resolved Contradictions"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff]" />
            <span className="hidden 2xl:inline">Governance Matrix</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              0 Overlaps
            </span>
          </button>

          {/* Global Search Palette Button (GR-04) */}
          <button
            type="button"
            onClick={() => setIsCmdPaletteOpen(true)}
            className="h-10 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-xl bg-white/90 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-white backdrop-blur-xl border border-slate-300 dark:border-white/10 text-xs font-mono transition-all shadow-xl cursor-pointer"
            title="Search Rules & Agents (Ctrl+K / ⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff]" />
            <span className="hidden xl:inline">Search</span>
            <kbd className="text-[9px] px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-white/15 text-slate-500 dark:text-zinc-400 font-mono">
              ⌘K
            </kbd>
          </button>

          <div className="h-10 hidden sm:flex items-center justify-center p-1 rounded-xl bg-white/90 dark:bg-[#09090b]/85 backdrop-blur-xl border border-slate-300 dark:border-white/10 shadow-xl">
            <button
              type="button"
              onClick={() => handleToggleVaultMode('assessed')}
              className={`h-8 px-2.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                vaultMode === 'assessed'
                  ? 'bg-cyan-500/15 dark:bg-[#00ffff]/15 text-cyan-600 dark:text-[#00ffff] border border-cyan-500/30 dark:border-cyan-400/35 font-semibold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="View Neil's fully assessed 360-node Cortex"
            >
              <Sparkles className="w-3 h-3" />
              <span>Assessed</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleVaultMode('blank')}
              className={`h-8 px-2.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                vaultMode === 'blank'
                  ? 'bg-amber-500/15 dark:bg-amber-400/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/35 font-semibold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Preview blank-slate fork"
            >
              <Eye className="w-3 h-3" />
              <span>Blank</span>
            </button>
          </div>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setAutoSpin((prev) => !prev)}
            className={`h-10 flex items-center justify-center gap-2 px-3.5 rounded-xl backdrop-blur-xl border text-xs font-mono transition-all cursor-pointer shadow-xl ${
              autoSpin
                ? 'bg-white/90 dark:bg-[#09090b]/85 border-cyan-500/40 dark:border-cyan-400/35 text-cyan-600 dark:text-[#00ffff]'
                : 'bg-white/90 dark:bg-[#09090b]/85 border-slate-300 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Toggle 3D Auto-Orbit"
          >
            {autoSpin ? (
              <RotateCw className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff] animate-spin" />
            ) : (
              <Pause className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
            )}
            <span className="hidden sm:inline">Spin: {autoSpin ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </header>

      {/* Blank Fork Preview Mode Banner */}
      <AnimatePresence>
        {vaultMode === 'blank' && (
          <motion.div
            key="blank-mode-banner"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#09090b]/90 backdrop-blur-xl border border-amber-400/35 shadow-2xl text-xs font-mono"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-200">
              BLANK-SLATE FORK PREVIEW: <strong className="text-white">0 Personal Rules</strong> (Only the 7 Agent Gatekeepers + Empty Slots). You must assess yourself to grow your Cortex.
            </span>
            <Link
              href="/assess"
              className="px-2.5 py-1 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 cursor-pointer whitespace-nowrap inline-flex items-center gap-1"
            >
              <span>Take Self-Assessment Quiz (L-01) →</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Dynamic Cursor-Following Glass Tooltip (Shows ONLY Title) */}
      <AnimatePresence>
        {showHoverTooltip && (
          <motion.div
            key="cursor-tooltip"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-md border border-slate-300 dark:border-white/15 shadow-2xl text-slate-900 dark:text-white"
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
                  ? 'bg-cyan-500 dark:bg-[#00ffff] shadow-[0_0_8px_#00ffff]'
                  : 'bg-slate-700 dark:bg-white shadow-[0_0_4px_#ffffff]'
              }`}
            />
            <span className="text-xs font-mono font-medium whitespace-nowrap">
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
            className="fixed top-0 right-0 bottom-0 z-40 w-[460px] max-w-full backdrop-blur-md bg-white/80 dark:bg-black/60 border-l border-slate-300 dark:border-white/10 p-5 flex flex-col justify-between shadow-2xl"
          >
            <div
              className="flex flex-col h-full rounded-xl bg-white dark:bg-[#09090b] border border-slate-300 dark:border-white/10 overflow-hidden shadow-2xl"
              style={{
                fontFamily:
                  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              {/* Editor Top Tab Bar with Explicit Working Exit Button */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-950">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCode2 className="w-4 h-4 text-cyan-600 dark:text-[#00ffff] shrink-0" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
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
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-200 dark:bg-zinc-900 hover:bg-red-500/15 border border-slate-300 dark:border-white/10 hover:border-red-400/40 text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-200 text-xs font-mono transition-colors cursor-pointer"
                  title="Close Inspector (Esc)"
                  aria-label="Close panel"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ESC</span>
                </button>
              </div>

              {/* Node Title & Filter Search Bar */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#09090b] space-y-2.5">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                  {selectedNode.name}
                </h2>
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Filter rules in this file..."
                    className="w-full pl-8 pr-8 py-1.5 rounded-md bg-slate-100 dark:bg-zinc-900/90 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 dark:focus:border-[#00ffff]/60"
                  />
                  {queryText && (
                    <button
                      type="button"
                      onClick={() => setQueryText('')}
                      className="absolute right-2.5 text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Code Notepad Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
                {formattedLines.map((line: string, index: number) => {
                  const isHeading = line.trim().startsWith('#');
                  const cleanLine = line.replace(/^-\s*/, '').trim();
                  const ruleIdMatch = cleanLine.match(/^\*\*([A-Z]{1,4}-\d+)\*\*\s*(.+)$/);

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <span className="text-[10px] text-slate-400 dark:text-zinc-600 select-none w-5 text-right shrink-0 pt-0.5">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      {isHeading ? (
                        <span className="text-cyan-600 dark:text-[#00ffff] font-semibold">
                          {line.replace(/^#+\s*/, '# ')}
                        </span>
                      ) : ruleIdMatch ? (
                        <div className="flex-1">
                          <span className="inline-block px-1.5 py-0.5 mr-2 rounded bg-cyan-500/10 dark:bg-[#00ffff]/15 text-cyan-600 dark:text-[#00ffff] font-semibold text-[11px]">
                            {ruleIdMatch[1]}
                          </span>
                          <span className="text-slate-800 dark:text-zinc-200">
                            {ruleIdMatch[2].replace(/\*\*/g, '')}
                          </span>
                        </div>
                      ) : (
                        <span className="flex-1 text-slate-700 dark:text-zinc-300">
                          {cleanLine.replace(/\*\*/g, '')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Editor Status Bar Footer */}
              <div className="px-4 py-2.5 border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-950 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-500">
                <span>UTF-8 • MARKDOWN VAULT</span>
                <button
                  type="button"
                  onClick={handleCloseSidebar}
                  className="text-cyan-600 dark:text-[#00ffff] hover:underline cursor-pointer font-medium"
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
          className="backdrop-blur-xl bg-white/90 dark:bg-[#09090b]/85 border-slate-300 dark:border-white/15 hover:border-cyan-500 dark:hover:border-[#00ffff]/50 text-slate-800 dark:text-white shadow-2xl px-4 py-2.5 h-auto font-mono text-xs"
        >
          <GitFork className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff]" />
          <span>Fork this Brain</span>
        </Button>
      </div>

      {/* 7. Share / Export Modal ("Fork a Blank-Slate Brain — Assess Yourself") */}
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
              className="w-full max-w-lg rounded-2xl bg-[#09090b] border border-white/15 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/cortex-logo-cyan.svg"
                    alt="Cortex"
                    className="w-9 h-9 object-contain"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">
                        Want your own Brain Vault? Clone the template.
                      </h3>
                      <Badge variant="default">0 RULES • BLANK SLATE</Badge>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      You can&apos;t copy-paste someone else&apos;s judgment. The forked template starts{' '}
                      <span className="text-white font-medium">100% empty (status: empty)</span> so you must assess yourself to earn every synaptic node.
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

              {/* Strict Pre-Flight Gate Warning (BN-00: 7 Agents Required) */}
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-xs font-mono text-red-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider">
                    ⚠ STRICT CLONE RULE (GATE: BN-00)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-200 border border-red-400/30">
                    7 AGENTS REQUIRED
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  You <strong className="text-white">cannot start</strong> or assess a Brain Vault unless all{' '}
                  <span className="text-[#00ffff]">7 Core Agents (PM, UX, GR, SD, IR, DB, SEC)</span> are present in{' '}
                  <code className="text-white">/agents</code>. Deleting any agent triggers{' '}
                  <code className="text-red-300">GATE: FAIL BN-00</code> and halts initialization.
                </p>
              </div>

              {/* 3-Step Self-Assessment Pipeline */}
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-white/10 text-xs font-mono text-zinc-300 space-y-2">
                <div className="text-[11px] text-[#00ffff] uppercase tracking-wider font-semibold">
                  // How You Build Your Own Cortex (Self-Assessment Loop):
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-400/15 text-[#00ffff] text-[10px] font-bold">
                    01
                  </span>
                  <div>
                    <span className="text-white font-semibold">01-identity/ABOUT-ME.md</span> — Fill out your background or run <span className="text-[#00ffff]">Launcher L-09</span> (AI Interview).
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-400/15 text-[#00ffff] text-[10px] font-bold">
                    02
                  </span>
                  <div>
                    <span className="text-white font-semibold">05-elicitation/THE-TEST.md</span> — Run <span className="text-[#00ffff]">Launcher L-01</span> (Self-Map + Artifact Archaeology + Visceral Cringe Test + 30s Trade-Off Triads).
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-400/15 text-[#00ffff] text-[10px] font-bold">
                    03
                  </span>
                  <div>
                    <span className="text-white font-semibold">02-domains/*.md</span> — Promote proven rules (<span className="text-emerald-400">conf &ge; 3</span> + <span className="text-amber-300">breaks:</span> condition) to light up your 3D Constellation.
                  </div>
                </div>
              </div>

              {/* Copy Launcher L-01 Self-Assessment Prompt */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Starter Prompt (Paste into Claude / Cursor / Antigravity):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] font-mono text-[#00ffff] transition-colors cursor-pointer"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy L-01 Prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 line-clamp-2 leading-relaxed">
                  &ldquo;{SELF_ASSESSMENT_PROMPT}&rdquo;
                </p>
              </div>

              {/* In-Browser Self-Assessment Quiz Link */}
              <Link
                href="/assess"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-cyan-400/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-xs font-mono font-bold text-cyan-300 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.2)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00ffff]" />
                <span>Take In-Browser Self-Assessment Quiz (L-01) →</span>
              </Link>

              {/* Preview Blank Fork in 3D Button */}
              <button
                type="button"
                onClick={() => {
                  handleToggleVaultMode(vaultMode === 'blank' ? 'assessed' : 'blank');
                  setIsShareOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-amber-400/35 bg-amber-400/10 hover:bg-amber-400/20 text-xs font-mono text-amber-200 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {vaultMode === 'blank'
                    ? "Switch Back to Neil's Assessed 3D Cortex (86 Rules)"
                    : 'Preview Blank-Slate Fork in 3D (0 Personal Rules)'}
                </span>
              </button>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a
                  href="/brain-template.zip"
                  download="brain-vault-blank-template.zip"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#00ffff] px-4 py-2.5 text-xs font-mono font-semibold text-zinc-950 hover:bg-cyan-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Blank .zip (0 Rules)</span>
                </a>

                <a
                  href="https://github.com/dropoflife13/MyBrain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-zinc-900 px-4 py-2.5 text-xs font-mono font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#00ffff]" />
                  <span>Clone on GitHub</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Sci-Fi System Crash Overlay (GATE: FAIL BN-00 Hard Stop if any of the 7 Agents are missing) */}
      <AnimatePresence>
        {!agentGate.passed && (
          <motion.div
            key="bn00-sci-fi-crash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(130, 10, 15, 0.45) 0%, rgba(20, 2, 5, 0.96) 60%, #030002 100%)',
            }}
          >
            {/* CRT Scanline Texture Layer */}
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-45"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0px, rgba(0, 0, 0, 0.5) 1px, transparent 1px, transparent 3px)',
              }}
            />

            {/* Glowing Red Emergency Perimeter & Pulsing Vignette */}
            <div className="pointer-events-none absolute inset-0 z-0 border-[3px] border-red-600/40 shadow-[inset_0_0_100px_rgba(239,68,68,0.3)] animate-pulse" />

            {/* Precision Neon Corner Brackets */}
            <div className="pointer-events-none absolute top-6 left-6 z-10 w-8 h-8 border-t-2 border-l-2 border-red-500 shadow-[0_0_10px_#ef4444]" />
            <div className="pointer-events-none absolute top-6 right-6 z-10 w-8 h-8 border-t-2 border-r-2 border-red-500 shadow-[0_0_10px_#ef4444]" />
            <div className="pointer-events-none absolute bottom-6 left-6 z-10 w-8 h-8 border-b-2 border-l-2 border-red-500 shadow-[0_0_10px_#ef4444]" />
            <div className="pointer-events-none absolute bottom-6 right-6 z-10 w-8 h-8 border-b-2 border-r-2 border-red-500 shadow-[0_0_10px_#ef4444]" />

            {/* Fixed Floating Back to Home Button */}
            <Link
              href="/"
              className="fixed top-5 left-5 z-[210] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-950/90 border border-red-500/60 hover:bg-red-900/90 text-xs font-mono text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all cursor-pointer backdrop-blur-xl"
            >
              <ArrowLeft className="w-4 h-4 text-red-300" />
              <span>← Back to Safety (Home)</span>
            </Link>

            {/* Main Hardened Terminal Box (Constrained & Scrollable) */}
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#090203]/95 border-2 border-red-500/70 shadow-[0_0_60px_rgba(239,68,68,0.35)] p-5 sm:p-7 space-y-4 font-mono backdrop-blur-2xl"
              style={{
                fontFamily:
                  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              {/* Terminal Title Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/30 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                    <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-red-200 tracking-wider uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                      GATE: FAIL BN-00 // CRITICAL SYSTEM CRASH
                    </h2>
                    <p className="text-[10px] text-red-400/80 mt-0.5 tracking-tight">
                      CORTEX_PREFLIGHT_INVARIANT_VIOLATION [0xDEAD_AGENT_ORPHAN]
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-[11px] text-red-200 transition-colors cursor-pointer"
                    title="Exit to Landing Page"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Home</span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shadow-[0_0_8px_#ef4444]" />
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 border border-red-500/60 text-red-300 font-bold tracking-wider">
                      HALTED
                    </span>
                  </div>
                </div>
              </div>

              {/* Terminal Diagnostics Telemetry */}
              <div className="text-[11px] leading-relaxed text-red-300/80 space-y-1">
                <div>&gt;&gt;&gt; INITIATING PROCEDURAL KERNEL PRE-FLIGHT DIAGNOSTIC...</div>
                <div>&gt;&gt;&gt; VERIFYING 7-AGENT EXECUTION GATE SUITE (/agents)...</div>
                <div className="text-red-400 font-semibold">
                  &gt;&gt;&gt; [FATAL] INVARIANT BREACH: RULE BN-00 FORBIDS HEADLESS OR UNGOVERNED OPERATION.
                </div>
              </div>

              {/* Missing Agents Section (Formatted as [ERROR: AGENT_NOT_FOUND: filename]) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-red-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-red-400" />
                    Missing Required Gatekeepers:
                  </span>
                  <span className="text-red-400/70">
                    COUNT: {agentGate.missingAgents.length} / 7
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {agentGate.missingAgents.map((file) => {
                    const cleanName = file.replace(/^[^\w.-]+/, '').split(' ')[0];
                    return (
                      <div
                        key={file}
                        className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-red-950/70 border border-red-500/50 text-xs font-bold text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping shrink-0" />
                        <span className="tracking-wide text-red-100 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]">
                          [ERROR: AGENT_NOT_FOUND: {cleanName}]
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Architectural Explanation */}
              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-[11px] text-zinc-300 space-y-1 leading-relaxed">
                <div className="text-red-400 font-bold uppercase text-[10px]">
                  // Architectural Invariant Explained:
                </div>
                <p>
                  A <strong className="text-white">Procedural Brain</strong> (<code className="text-[#00ffff]">/brain</code>) stores tacit human judgment and trade-offs. The <strong className="text-white">7-Agent Suite</strong> (<code className="text-[#00ffff]">/agents</code>) enforces those rules as hard engineering gates (<code className="text-white">PM, UX, GR, SD, IR, DB, SEC</code>).
                </p>
                <p className="text-zinc-400">
                  If an agent is deleted or unmapped, all rule promotion, 3D synaptic matrix rendering, and AI queries are hard-locked to prevent unverified actions.
                </p>
              </div>

              {/* Blinking Terminal Cursor */}
              <div className="pt-2 border-t border-red-500/25 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-red-400">
                  <span className="text-red-500/80 font-bold">root@cortex-daemon:~#</span>
                  <span className="text-zinc-400 text-[11px]">waiting for filesystem restoration event</span>
                  <span className="inline-block w-2.5 h-4 bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" />
                </div>
                <span className="hidden sm:inline text-[10px] text-zinc-500">
                  REVERT .bak TO UNLOCK
                </span>
              </div>

              {/* Remediation Action Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-red-500/40 bg-red-950/60 hover:bg-red-900/80 text-xs font-bold text-red-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-red-400" />
                  <span>Exit to Home</span>
                </Link>

                <button
                  type="button"
                  onClick={handleRecheckGate}
                  disabled={isCheckingGate}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isCheckingGate ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {isCheckingGate
                      ? 'Re-Verifying...'
                      : 'Re-Verify Gate'}
                  </span>
                </button>

                <a
                  href="/brain-template.zip"
                  download="brain-vault-blank-template.zip"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-zinc-900/90 hover:bg-zinc-800 px-4 py-2.5 text-xs text-red-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-red-400" />
                  <span>Download Recovery</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. Seamless Neural Wiring Loader */}
      <AnimatePresence>
        {!isReady && (
          <NeuralLoader key="cortex-neural-loader" />
        )}
      </AnimatePresence>

      {/* Governance Matrix & Contradiction Inspector Modal */}
      <AuditInspector
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        auditReport={assessedGraphData.vaultAudit}
        onSelectNode={(nodeId) => {
          const found = graphData.nodes.find(
            (n) =>
              n.id.toLowerCase() === nodeId.toLowerCase() ||
              String(n.id).toLowerCase().startsWith(`${nodeId.toLowerCase()}::`)
          );
          if (found) {
            setSelectedNode(found);
            setQueryText(nodeId);
          }
        }}
      />

      {/* 10. Global Cmd+K Search Palette (GR-04) */}
      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        nodes={graphData.nodes}
        onSelectNode={handleSelectNodeFromPalette}
      />
    </main>
  );
}
