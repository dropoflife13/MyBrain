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
  Image as ImageIcon,
  Layers,
  Loader2,
  Menu,
  MessageSquare,
  Pause,
  RefreshCw,
  RotateCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Brain3D from '../../components/Brain3D';
import AuditInspector from '../../components/AuditInspector';
import CommandPalette from '../../components/CommandPalette';
import NeuralLoader from '../../components/NeuralLoader';
import { Tooltip } from '../../components/Tooltip';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  BrainDocNode,
  BrainGraphData,
  getBrainData,
  verifySevenAgentsGate,
} from '../../lib/brain-parser';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const AGENT_DOCK: Array<{
  id: string;
  code: string;
  label: string;
  fullName: string;
  prefixes: string[];
}> = [
  { id: 'dbaagent', code: 'DB', label: 'Database', fullName: 'Database Agent', prefixes: ['DB'] },
  { id: 'securityagent', code: 'SEC', label: 'Security', fullName: 'Security Agent', prefixes: ['CS'] },
  { id: 'uiuxagent', code: 'UX', label: 'UI / UX', fullName: 'UI/UX Agent', prefixes: ['UI', 'TA'] },
  { id: 'productmanageragent', code: 'PM', label: 'Product', fullName: 'Product Manager Agent', prefixes: ['BA', 'OP'] },
  { id: 'systemsdesignagent', code: 'SD', label: 'Systems', fullName: 'Systems Design Agent', prefixes: ['SO'] },
  { id: 'integrationagent', code: 'IR', label: 'Integration', fullName: 'Integration Agent', prefixes: ['RF', 'H', 'P'] },
  { id: 'growthagent', code: 'GR', label: 'Growth', fullName: 'Growth Agent', prefixes: [] },
];

const SELF_ASSESSMENT_PROMPT = `Act as the Brain Agent (brain/07-meta/brainagent.md). Step 0 (Strict Gate BN-00): Verify that all 7 Core Agent files (PM, UX, GR, SD, IR, DB, SEC) exist in /agents; if even one is missing, output GATE: FAIL BN-00 and refuse to start. Once all 7 agents are verified, read brain/01-identity/ABOUT-ME.md and brain/05-elicitation/THE-TEST.md, and run Launcher L-01 to assess my blank-slate vault (0 rules) one question at a time.`;

const WORKFLOW_PILLS = [
  {
    cmd: '/grill',
    label: 'Grill (PM)',
    desc: 'Interrogate problem & edge cases with Product Manager rules (PM)',
    prompt: '/grill: Interrogate my application problem and find edge cases. Ask me 5 hard, non-obvious questions before writing code.',
    agent: 'PM',
  },
  {
    cmd: '/pitch',
    label: 'Pitch (GR+PM)',
    desc: 'Write 3-minute executive pitch (Growth + PM)',
    prompt: '/pitch: Formulate a compelling 3-minute executive pitch to sell this product idea using Growth and PM principles.',
    agent: 'GR',
  },
  {
    cmd: '/to-spec',
    label: 'To Spec (SD)',
    desc: 'Write technical PRD with As-Is/To-Be architectures (SD)',
    prompt: '/to-spec: Generate a comprehensive technical PRD with As-Is/To-Be architectures, failure modes, and strict non-goals.',
    agent: 'SD',
  },
  {
    cmd: '/to-tickets',
    label: 'To Tickets (PM)',
    desc: 'Decompose PRD into 5 atomic sequential tickets (PM)',
    prompt: '/to-tickets: Break this PRD specification down into 5 sequential atomic implementation tickets. Do not write code yet.',
    agent: 'PM',
  },
  {
    cmd: '/implement',
    label: 'Implement (DB+SEC)',
    desc: 'Write production code for Ticket 1 enforcing DB/SEC gates',
    prompt: '/implement: Write production-ready code for Ticket 1 adhering strictly to append-only ledgers and security RLS defaults.',
    agent: 'DB',
  },
  {
    cmd: '/review',
    label: 'Review (SEC+SD)',
    desc: 'Run security and BN-00 architectural review (SEC+SD)',
    prompt: '/review: Run a comprehensive security and systems audit against Rule BN-00 invariants and STRIDE boundaries.',
    agent: 'SEC',
  },
];

export default function Home() {
  const router = useRouter();
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
  const [activeGate, setActiveGate] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Sliding AI Neural Chat Panel State (Framer Motion right sidebar)
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      role: 'user' | 'assistant';
      text: string;
      imageUrl?: string;
      timestamp: string;
    }>
  >([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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

  // Nodes belonging to the active gate: the agent, its linked nodes, and its rule prefixes
  const focusIds = useMemo<Set<string> | null>(() => {
    if (!activeGate) return null;
    const agent = AGENT_DOCK.find((a) => a.code === activeGate);
    if (!agent) return null;
    const ids = new Set<string>([agent.id]);
    const clean = (v: unknown) => String(typeof v === 'object' && v ? (v as { id: string }).id : v).split('::')[0];
    graphData.links.forEach((l) => {
      const s = clean(l.source);
      const t = clean(l.target);
      if (s === agent.id) ids.add(t);
      if (t === agent.id) ids.add(s);
    });
    graphData.nodes.forEach((n) => {
      const cid = String(n.id).split('::')[0];
      const m = cid.match(/^([A-Z]{1,4})-\d+/);
      if ((m && agent.prefixes.includes(m[1])) || n.agentCode === agent.code) ids.add(cid);
    });
    ids.delete('hub');
    return ids;
  }, [activeGate, graphData]);

  // Master Hub Node representation for general 7-Agent AI queries
  const hubNode = useMemo<BrainDocNode>(() => {
    return (
      graphData.nodes.find((n) => n.id === 'hub') || {
        id: 'hub',
        name: 'Cortex Master Hub',
        description: 'Central procedural judgment engine & 7-Agent execution gatekeeper.',
        group: 2,
        category: 'hub',
      }
    );
  }, [graphData.nodes]);

  const handleOpenGeneralChat = () => {
    setSelectedNode(hubNode);
    setQueryText('');
  };

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
    setActiveGate(null);
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
        } else if (isShareOpen) {
          setIsShareOpen(false);
        } else if (selectedNode) {
          setSelectedNode(null);
          setQueryText('');
        } else if (activeGate) {
          setActiveGate(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCmdPaletteOpen, isMatrixOpen, isShareOpen, selectedNode, activeGate]);

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

  // Connect neural chat session whenever a node is selected in Brain3D or via the general Chat button
  useEffect(() => {
    if (selectedNode) {
      const cleanId = String(selectedNode.id).split('::')[0];
      const isHub = cleanId === 'hub' || cleanId.toLowerCase() === 'hub';
      setChatMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: isHub
            ? 'Neural connection established with Cortex Master Hub. Ask any question about the 7-Agent Suite (PM, UX, GR, SD, IR, DB, SEC) or attach an architecture diagram/wireframe for multimodal verification:'
            : `Neural connection established with ${selectedNode.name} [${cleanId}]. Query this rule, agent specification, or attach an image to evaluate:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setChatInput('');
      setAttachedImage(null);
    } else {
      setChatMessages([]);
      setChatInput('');
      setAttachedImage(null);
    }
  }, [selectedNode]);

  // Auto-scroll chat history on new messages or loading updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const sanitizeAiMessage = (
    data: { text?: string; error?: string } | null,
    fallbackErr?: unknown
  ): string => {
    const candidate = String(
      data?.text ||
        data?.error ||
        (fallbackErr instanceof Error ? fallbackErr.message : fallbackErr ? String(fallbackErr) : '') ||
        ''
    );
    const lower = candidate.toLowerCase();
    if (
      lower.includes('503') ||
      lower.includes('429') ||
      lower.includes('high demand') ||
      lower.includes('overloaded') ||
      lower.includes('service unavailable') ||
      lower.includes('resource_exhausted') ||
      lower.includes('unavailable')
    ) {
      return 'The AI is currently experiencing high demand. Please try again in a few moments.';
    }
    return candidate || 'No response returned from the neural core.';
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query =
      chatInput.trim() ||
      (attachedImage
        ? 'Please evaluate and audit this attached architecture diagram / wireframe / schema against our 7 Agent Gatekeepers and procedural invariants.'
        : '');
    if (!query || isChatLoading || !selectedNode) return;

    const imageToSend = attachedImage;
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      text: query,
      imageUrl: imageToSend || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setAttachedImage(null);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          imageUrl: imageToSend || undefined,
          contextNode: selectedNode.id === 'hub' ? 'hub' : selectedNode,
        }),
      });

      const data = await res.json().catch(() => null);
      const aiText = sanitizeAiMessage(data, !res.ok ? new Error(`Status ${res.status}`) : undefined);

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant' as const,
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant' as const,
          text: sanitizeAiMessage(null, err),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleExecuteWorkflowCommand = async (pill: (typeof WORKFLOW_PILLS)[0]) => {
    if (isChatLoading) return;
    const userPrompt = chatInput.trim()
      ? `${pill.cmd}: ${chatInput.trim()}`
      : pill.prompt;

    const imageToSend = attachedImage;
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      text: userPrompt,
      imageUrl: imageToSend || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setAttachedImage(null);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userPrompt,
          imageUrl: imageToSend || undefined,
          contextNode: 'SIX-COMMANDS',
          workflowCommand: pill.cmd,
        }),
      });

      const data = await res.json().catch(() => null);
      const aiText = sanitizeAiMessage(data, !res.ok ? new Error(`Status ${res.status}`) : undefined);

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant' as const,
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant' as const,
          text: sanitizeAiMessage(null, err),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const showHoverTooltip = Boolean(hoveredNode && hoveredNode.id !== 'hub');
  const selectedIdClean = selectedNode?.id ? String(selectedNode.id).split('::')[0] : '';

  return (
    <main
      onMouseMove={handleMouseMove}
      className={`relative w-screen h-screen overflow-hidden ${
        isReady ? 'bg-slate-50 dark:bg-[#050505]' : 'bg-[#050505]'
      } text-slate-900 dark:text-white select-none transition-colors duration-300`}
    >
      {/* 1. Full-Screen 3D Synaptic Constellation Canvas */}
      <motion.div
        className={`absolute inset-y-0 right-0 h-screen z-0 ${
          isReady ? 'bg-slate-50 dark:bg-[#050505]' : 'bg-[#050505]'
        } transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'left-0 md:left-64' : 'left-0'
        }`}
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
            console.log("Node clicked:", node);
            if (node) {
              setSelectedNode(node);
              setQueryText('');
            }
          }}
          onReady={() => setIsGraphReady(true)}
          onFpsUpdate={setFps}
          focusIds={focusIds}
        />
      </motion.div>

      {/* Main Interactive Dashboard (Revealed only when 3D graph and 2.5s timer are ready) */}
      {isReady && (
        <>
          {/* 2. Layered Atmospheric Background Overlays (Blueprint Grid + Radial Vignette + Corner Reticles) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none"
          >
            <div
              className={`fixed inset-y-0 right-0 z-10 opacity-0 dark:opacity-100 transition-all duration-300 ease-in-out ${
                isSidebarOpen ? 'left-0 md:left-64' : 'left-0'
              }`}
              style={{
                backgroundImage: `
                  radial-gradient(circle at 50% 50%, transparent 42%, rgba(2, 4, 10, 0.82) 100%),
                  radial-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 32px 32px',
              }}
            />

            {/* Precision Corner Telemetry Reticles */}
            <div
              className={`fixed top-20 z-10 w-3 h-3 border-t border-l border-cyan-600/40 dark:border-cyan-400/30 transition-all duration-300 ${
                isSidebarOpen ? 'left-6 md:left-[17.5rem]' : 'left-6'
              }`}
            />
            <div className="fixed top-20 right-6 z-10 w-3 h-3 border-t border-r border-cyan-600/40 dark:border-cyan-400/30" />
            <div
              className={`fixed bottom-6 z-10 w-3 h-3 border-b border-l border-cyan-600/40 dark:border-cyan-400/30 transition-all duration-300 ${
                isSidebarOpen ? 'left-6 md:left-[17.5rem]' : 'left-6'
              }`}
            />
          </motion.div>

          {/* 3. Top Command Bar (fixed top-0 right-0 z-40, dynamically offsets based on sidebar state) */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={`fixed top-0 right-0 z-40 h-16 flex items-center justify-between px-3 sm:px-6 pointer-events-none transition-all duration-300 ease-in-out ${
              isSidebarOpen ? 'left-0 md:left-64' : 'left-0'
            }`}
          >
        {/* Left: Sidebar Toggle (☰) + Overview Link + Cortex Brand Pill */}
        <div className="flex items-center justify-start gap-2 pointer-events-auto shrink-0">
          <Tooltip content={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} side="bottom">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              aria-label="Toggle sidebar"
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/90 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 backdrop-blur-xl border border-slate-300 dark:border-white/10 text-xs font-mono transition-all shadow-xl cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4 text-cyan-600 dark:text-[#00ffff]" />
            </button>
          </Tooltip>

          <Tooltip content="Return to landing page" side="bottom">
            <Link
              href="/"
              className="h-10 flex items-center justify-center gap-1.5 px-3 rounded-xl bg-white/90 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-white backdrop-blur-xl border border-slate-300 dark:border-white/10 text-xs font-mono transition-all shadow-xl cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">Overview</span>
            </Link>
          </Tooltip>

          <div className="h-10 flex items-center justify-center gap-2 px-3 rounded-xl bg-white/90 dark:bg-[#09090b]/85 backdrop-blur-xl border border-slate-300 dark:border-white/10 shadow-xl shrink-0">
            <img
              src="/cortex-logo-cyan.svg"
              alt="Cortex Logo"
              className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(0,255,255,0.45)]"
            />
            <span className="text-xs font-mono font-bold tracking-widest text-slate-900 dark:text-white uppercase">
              CORTEX
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-700 dark:text-[#00ffff] border border-cyan-500/20 dark:border-cyan-400/20 font-bold">
              v2.4
            </span>
          </div>
        </div>

        {/* Right: Matrix + Search + Vault Switcher + Theme + Auto-Spin */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          <Tooltip content="Brain ↔ 7 Agent matrix & resolved contradictions" side="bottom">
            <button
              type="button"
              onClick={() => setIsMatrixOpen(true)}
              className="h-10 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-xl bg-white/90 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-white backdrop-blur-xl border border-slate-300 dark:border-white/10 text-xs font-mono transition-all shadow-xl cursor-pointer shrink-0"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff]" />
              <span className="hidden lg:inline">Governance Matrix</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                0 Overlaps
              </span>
            </button>
          </Tooltip>

          <Tooltip content="Search rules & agents (Ctrl+K)" side="bottom">
            <button
              type="button"
              onClick={() => setIsCmdPaletteOpen(true)}
              className="h-10 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-xl bg-white/90 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-white backdrop-blur-xl border border-slate-300 dark:border-white/10 text-xs font-mono transition-all shadow-xl cursor-pointer shrink-0"
            >
              <Search className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff]" />
              <span className="hidden xl:inline">Search</span>
              <kbd className="text-[9px] px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-white/15 text-slate-600 dark:text-zinc-400 font-mono">
                ⌘K
              </kbd>
            </button>
          </Tooltip>

          <div className="h-10 hidden sm:flex items-center justify-center p-1 rounded-xl bg-white/90 dark:bg-[#09090b]/85 backdrop-blur-xl border border-slate-300 dark:border-white/10 shadow-xl shrink-0">
            <Tooltip content="View the fully assessed 360-node Cortex" side="bottom">
              <button
                type="button"
                onClick={() => handleToggleVaultMode('assessed')}
                className={`h-8 px-2.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  vaultMode === 'assessed'
                    ? 'bg-cyan-500/15 dark:bg-[#00ffff]/15 text-cyan-700 dark:text-[#00ffff] border border-cyan-500/30 dark:border-cyan-400/35 font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Assessed</span>
              </button>
            </Tooltip>
            <Tooltip content="Preview the blank-slate fork" side="bottom">
              <button
                type="button"
                onClick={() => handleToggleVaultMode('blank')}
                className={`h-8 px-2.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  vaultMode === 'blank'
                    ? 'bg-amber-500/15 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/35 font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Blank</span>
              </button>
            </Tooltip>
          </div>

          <ThemeToggle />

          <Tooltip content={autoSpin ? 'Pause auto-orbit' : 'Resume auto-orbit'} side="bottom">
            <button
              type="button"
              onClick={() => setAutoSpin((prev) => !prev)}
              className={`h-10 flex items-center justify-center gap-2 px-3.5 rounded-xl backdrop-blur-xl border text-xs font-mono transition-all cursor-pointer shadow-xl shrink-0 ${
                autoSpin
                  ? 'bg-white/90 dark:bg-[#09090b]/85 border-cyan-500/40 dark:border-cyan-400/35 text-cyan-700 dark:text-[#00ffff]'
                  : 'bg-white/90 dark:bg-[#09090b]/85 border-slate-300 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {autoSpin ? (
                <RotateCw className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff] animate-spin" />
              ) : (
                <Pause className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              )}
              <span className="hidden sm:inline">Spin: {autoSpin ? 'ON' : 'OFF'}</span>
            </button>
          </Tooltip>
        </div>
      </motion.header>

      {/* Left Sidebar: Gates Directory (Collapsible w-64 vs w-0) */}
      <motion.aside
        aria-label="Gates directory"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={`fixed left-0 top-0 z-40 h-screen flex flex-col bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 text-slate-900 dark:text-white transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? 'w-64 opacity-100 pointer-events-auto'
            : 'w-0 opacity-0 overflow-hidden border-none pointer-events-none'
        }`}
        style={{
          fontFamily:
            "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      >
        <div className="w-64 flex flex-col h-full">
          <div className="px-5 pt-6 pb-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff]" />
              <span>Gates Directory</span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-zinc-500">
              Filter the constellation by agent.
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            <button
              type="button"
              onClick={() => setActiveGate(null)}
              aria-pressed={activeGate === null}
              className={`w-full h-9 px-3 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer border ${
                activeGate === null
                  ? 'bg-cyan-500/10 dark:bg-[#00ffff]/10 border-cyan-500/30 dark:border-[#00ffff]/30 text-cyan-700 dark:text-[#00ffff] font-semibold'
                  : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <span>Show All</span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-500">{AGENT_DOCK.length} gates</span>
            </button>

            <div className="my-2 border-t border-slate-200 dark:border-white/5" />

            {AGENT_DOCK.map((agent) => {
              const isActive = activeGate === agent.code;
              return (
                <Tooltip key={agent.id} content={agent.fullName} side="right" className="w-full">
                  <button
                    type="button"
                    onClick={() => setActiveGate(isActive ? null : agent.code)}
                    aria-pressed={isActive}
                    className={`w-full h-10 px-3 rounded-lg flex items-center gap-3 text-xs transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-cyan-500/10 dark:bg-[#00ffff]/10 border-cyan-500/40 dark:border-[#00ffff]/40 text-cyan-700 dark:text-[#00ffff] font-semibold shadow-[0_0_14px_rgba(0,255,255,0.15)]'
                        : 'border-transparent text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/10'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-cyan-600 dark:bg-[#00ffff] shadow-[0_0_8px_#00ffff]' : 'bg-cyan-500/70'
                      }`}
                    />
                    <span className="font-bold tracking-wider w-8 text-left">{agent.code}</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-500 truncate">{agent.label}</span>
                  </button>
                </Tooltip>
              );
            })}
          </nav>

          <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 text-[10px] text-slate-500 dark:text-zinc-500">
            {graphData.nodes.length - 1} synapses • {graphData.vaultAudit?.uniqueRuleIds ?? 159} rules • {fps} FPS
          </div>
        </div>
      </motion.aside>

      {/* Blank Fork Preview Mode Banner */}
      <AnimatePresence>
        {vaultMode === 'blank' && (
          <motion.div
            key="blank-mode-banner"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#09090b]/90 backdrop-blur-xl border border-amber-400/35 shadow-2xl text-xs font-mono"
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

      {/* 5. Sliding AI Neural Chat Panel (Framer Motion Slide-In + Close on X & Esc) */}
      <AnimatePresence>
        {selectedNode && (
          <motion.aside
            key="node-chat-panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="w-[400px] max-w-full fixed right-0 top-0 h-screen z-50 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl border-l border-black/10 dark:border-white/10 flex flex-col justify-between shadow-2xl"
            style={{
              fontFamily:
                "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          >
            {/* Header: Node Title, Node ID, green SYSTEM READY dot, and close X */}
            <div className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex items-start justify-between gap-3 bg-slate-50/80 dark:bg-black/40">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                    SYSTEM READY
                  </span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {selectedNode.id === 'hub' ? 'Cortex Master Hub (7-Agent Suite)' : selectedNode.name}
                </h2>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                  NODE ID: <span className="font-semibold text-cyan-600 dark:text-[#00ffff]">{selectedNode.id === 'hub' ? 'HUB • GLOBAL' : selectedIdClean}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseSidebar}
                className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-white/5 hover:bg-red-500/15 text-slate-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer shrink-0"
                aria-label="Close chat panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body: Scrollable chat history */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl p-3.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/10 text-cyan-900 dark:text-cyan-100 border border-cyan-500/20 ml-6'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-zinc-200 border border-black/5 dark:border-white/10 mr-4 whitespace-pre-wrap'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-60 mb-1.5 uppercase font-bold tracking-wider">
                    <span>{msg.role === 'user' ? 'Operator' : 'Neural Core'}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div>{msg.text}</div>
                  {msg.imageUrl && (
                    <div className="mt-2.5 overflow-hidden rounded-lg border border-black/10 dark:border-white/15 max-w-[260px] bg-black/10">
                      <img
                        src={msg.imageUrl}
                        alt="Attached diagram"
                        className="w-full h-auto max-h-48 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.imageUrl, '_blank')}
                      />
                    </div>
                  )}
                </div>
              ))}

              {isChatLoading && (
                <div className="bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-zinc-200 border border-black/5 dark:border-white/10 rounded-xl p-3.5 mr-4 font-mono text-sm flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 text-cyan-600 dark:text-[#00ffff] animate-spin" />
                  <span className="text-xs text-slate-500 dark:text-zinc-400">Querying neural knowledge base...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Horizontal Workflow Pipeline Bar (Golden Path SDLC) */}
            <div className="px-3.5 pt-2.5 pb-2 border-t border-black/10 dark:border-white/10 bg-slate-100/80 dark:bg-black/40">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 dark:text-zinc-400 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-[#00ffff] shadow-[0_0_6px_#00ffff]" />
                  SDLC Workflow
                </span>
                <span className="text-[9px] font-mono text-cyan-600 dark:text-[#00ffff] font-semibold">
                  6-Command Pipeline
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {WORKFLOW_PILLS.map((pill) => (
                  <button
                    key={pill.cmd}
                    type="button"
                    disabled={isChatLoading}
                    onClick={() => handleExecuteWorkflowCommand(pill)}
                    title={pill.desc}
                    className="px-2.5 py-1 rounded-md bg-white dark:bg-white/5 hover:bg-cyan-500/15 dark:hover:bg-cyan-400/15 text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-[#00ffff] border border-black/10 dark:border-white/10 hover:border-cyan-500/40 dark:hover:border-cyan-400/40 text-[11px] font-mono font-semibold transition-all shrink-0 cursor-pointer disabled:opacity-40 active:scale-95 flex items-center gap-1 shadow-sm"
                  >
                    <span>{pill.cmd}</span>
                    <span className="text-[9px] opacity-60 font-normal">[{pill.agent}]</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Attached Image Preview Chip */}
            {attachedImage && (
              <div className="px-3 py-2 bg-slate-100/90 dark:bg-zinc-900/90 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-9 h-9 rounded-md overflow-hidden border border-cyan-500/40 shrink-0">
                    <img src={attachedImage} alt="Attachment" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 text-[11px] font-mono leading-tight">
                    <div className="font-semibold text-cyan-600 dark:text-[#00ffff] truncate">
                      Diagram Attached
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                      Nemotron Omni Vision Active
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-1 rounded-md text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input: Monospace input, Image attachment button and Send button */}
            <form
              onSubmit={handleSendChat}
              className="p-3 border-t border-black/10 dark:border-white/10 bg-slate-50/80 dark:bg-black/30 flex items-center gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isChatLoading}
                title="Attach Architecture Diagram, Wireframe, or Schema"
                className={`p-2 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  attachedImage
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-[#00ffff]'
                    : 'bg-white dark:bg-white/5 border-black/10 dark:border-white/15 text-slate-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-[#00ffff]'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={attachedImage ? 'Ask about this diagram or audit it...' : 'Ask about this rule or agent...'}
                disabled={isChatLoading}
                className="flex-1 px-3 py-2 text-sm font-mono rounded-lg bg-white dark:bg-zinc-900/90 border border-black/10 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 dark:focus:border-[#00ffff]"
              />
              <button
                type="submit"
                disabled={isChatLoading || (!chatInput.trim() && !attachedImage)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 dark:bg-[#00ffff] dark:hover:bg-cyan-300 text-white dark:text-black font-mono text-sm font-bold disabled:opacity-40 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,255,0.3)] shrink-0 flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 6. Floating Action Buttons (Bottom-Right Corner) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2.5"
      >
        {/* Floating AI Chat Trigger (Ask Cortex AI) */}
        <Tooltip content="Ask Cortex AI (General 7-Agent Hub)" side="left">
          <Button
            type="button"
            onClick={handleOpenGeneralChat}
            className="backdrop-blur-xl bg-white/90 dark:bg-[#09090b]/85 border border-slate-300 dark:border-white/15 hover:border-cyan-500 dark:hover:border-[#00ffff]/60 text-slate-800 dark:text-white shadow-2xl px-4 py-2.5 h-auto font-mono text-xs flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff]" />
            <span>Ask Cortex AI</span>
          </Button>
        </Tooltip>

        {/* Floating "Fork this Brain" Button */}
        <Tooltip content="Export or fork blank-slate vault" side="left">
          <Button
            variant="outline"
            onClick={() => setIsShareOpen(true)}
            className="backdrop-blur-xl bg-white/90 dark:bg-[#09090b]/85 border border-slate-300 dark:border-white/15 hover:border-cyan-500 dark:hover:border-[#00ffff]/50 text-slate-800 dark:text-white shadow-2xl px-4 py-2.5 h-auto font-mono text-xs flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <GitFork className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff]" />
            <span>Fork this Brain</span>
          </Button>
        </Tooltip>
      </motion.div>
      </>
      )}

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
        onNavigate={(href) => router.push(href)}
      />
    </main>
  );
}
