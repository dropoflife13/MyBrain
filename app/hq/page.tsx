'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Cpu,
  Eye,
  FileCode,
  Radio,
  RefreshCw,
  Send,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import PixelBot, {
  AgentCode,
  AGENT_REGISTRY,
} from '../../components/PixelBot';
import SpaceStation from '../../components/hq/SpaceStation';
import ChatMessageContent from '../../components/ChatMessageContent';
import ExportClaudeModal from '../../components/ExportClaudeModal';
import VoiceInput, { VoiceTTSButton, VoiceModeBadge } from '../../components/VoiceInput';
import { ThemeToggle } from '../../components/ThemeToggle';

interface AgentStats {
  percentage: number;
  count: number;
  avgConfidence: number;
  health: number;
  isLowKnowledge: boolean;
  isUnverified?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
  model?: string;
  provider?: string;
}

// 9 Core Engineering & Governance Bots (8 Core Agents + Judgment Arbiter)
const ALL_AGENT_CODES: AgentCode[] = ['PM', 'UX', 'GR', 'SD', 'IR', 'DB', 'SEC', 'RS', 'ARB'];

// Width of the slide-out terminal drawer on desktop viewports
const TERMINAL_DRAWER_WIDTH = 480;

export default function PixelAgentHQPage() {
  const [statsMap, setStatsMap] = useState<Record<AgentCode, AgentStats>>({
    DB: { percentage: 95, count: 14, avgConfidence: 4.8, health: 98, isLowKnowledge: false },
    SEC: { percentage: 92, count: 15, avgConfidence: 4.7, health: 95, isLowKnowledge: false },
    UX: { percentage: 88, count: 15, avgConfidence: 4.5, health: 92, isLowKnowledge: false },
    PM: { percentage: 90, count: 14, avgConfidence: 4.6, health: 94, isLowKnowledge: false },
    SD: { percentage: 94, count: 14, avgConfidence: 4.8, health: 97, isLowKnowledge: false },
    IR: { percentage: 86, count: 14, avgConfidence: 4.4, health: 90, isLowKnowledge: false },
    GR: { percentage: 85, count: 14, avgConfidence: 4.3, health: 89, isLowKnowledge: false },
    RS: { percentage: 91, count: 14, avgConfidence: 4.6, health: 93, isLowKnowledge: false },
    ARB: { percentage: 100, count: 4, avgConfidence: 5.0, health: 100, isLowKnowledge: false },
  });

  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [crtEffect, setCrtEffect] = useState<boolean>(true);
  const [isExportClaudeOpen, setIsExportClaudeOpen] = useState<boolean>(false);

  // Terminal & Selection State (strictly null when closed)
  const [selectedAgent, setSelectedAgent] = useState<AgentCode | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);

  // Chat state per agent
  const [chatMessages, setChatMessages] = useState<Record<AgentCode, ChatMessage[]>>({
    DB: [],
    SEC: [],
    UX: [],
    PM: [],
    SD: [],
    IR: [],
    GR: [],
    RS: [],
    ARB: [],
  });
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch live stats from /api/stats
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        const masteryList: any[] = data.agentMastery || [];
        setStatsMap((prev) => {
          const nextMap: Record<AgentCode, AgentStats> = { ...prev };
          masteryList.forEach((a) => {
            const code = (a.code || '').toUpperCase() as AgentCode;
            if (ALL_AGENT_CODES.includes(code)) {
              const percentage = typeof a.percentage === 'number' ? a.percentage : 80;
              const avgConf = typeof a.avgConfidence === 'number' ? a.avgConfidence : 4.0;
              const isLow = percentage < 30 || a.isUnverified === true;
              const health = isLow
                ? 25
                : Math.min(100, Math.round(percentage * 0.7 + (avgConf / 5) * 30));

              nextMap[code] = {
                percentage,
                count: a.count ?? 14,
                avgConfidence: avgConf,
                health,
                isLowKnowledge: isLow,
                isUnverified: a.isUnverified,
              };
            }
          });
          return nextMap;
        });
      }
    } catch (e) {
      console.error('Failed to fetch /api/stats:', e);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Select a bot & dock to Mainframe
  const handleSelectBot = (code: AgentCode) => {
    if (!code) return;
    setSelectedAgent(code);
    setIsTerminalOpen(true);

    // Seed initial greeting if this bot has no messages yet
    setChatMessages((prev) => {
      if (prev[code] && prev[code].length > 0) return prev;
      const meta = AGENT_REGISTRY[code];
      const initialGreeting: ChatMessage = {
        id: `init-${Date.now()}`,
        role: 'assistant',
        text: `Hey Architect! ${meta.name} docked and online. What do you need verified?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'gemini-3.8-flash',
        provider: 'google',
      };
      return {
        ...prev,
        [code]: [initialGreeting],
      };
    });
  };

  // PART 1.1 & 1.5: Close terminal & smoothly return bot to baseX, baseY (without resetting keys)
  const handleCloseTerminal = useCallback(() => {
    setSelectedAgent(null);
    setIsTerminalOpen(false);
  }, []);

  // Esc key closes terminal and returns bot to base
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (isTerminalOpen || selectedAgent !== null)) {
        handleCloseTerminal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTerminalOpen, selectedAgent, handleCloseTerminal]);

  // Count degraded bots (< 30% knowledge)
  const degradedCount = useMemo(() => {
    return Object.values(statsMap).filter((s) => s.isLowKnowledge).length;
  }, [statsMap]);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (selectedAgent && isTerminalOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, selectedAgent, isTerminalOpen]);

  // Send message to /api/chat
  const handleSendChat = async (queryText?: string) => {
    const textToSend = (queryText ?? chatInput).trim();
    if (!textToSend || !selectedAgent || isChatLoading) return;

    const botCode = selectedAgent;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [botCode]: [...(prev[botCode] || []), userMsg],
    }));
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          contextNode: botCode,
          source: 'hq',
        }),
      });

      const data = await res.json().catch(() => null);
      const replyText =
        data?.text ||
        data?.message ||
        `[${botCode}] Telemetry received. Invariants enforced according to ${AGENT_REGISTRY[botCode].invariants}.`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: data?.model,
        provider: data?.provider,
      };

      setChatMessages((prev) => ({
        ...prev,
        [botCode]: [...(prev[botCode] || []), aiMsg],
      }));
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Mainframe Bus Timeout**: Unable to reach neural bus for ${botCode}. Verify local server status.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => ({
        ...prev,
        [botCode]: [...(prev[botCode] || []), errorMsg],
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  const activeBotMeta = selectedAgent ? AGENT_REGISTRY[selectedAgent] : null;

  return (
    <div className="relative w-screen h-screen max-h-screen bg-slate-50 text-slate-900 dark:bg-[#02050e] dark:text-slate-100 flex flex-col font-mono overflow-hidden select-none transition-colors duration-300">
      {/* 1. Retro CRT Scanline & Phosphor Overlay */}
      {crtEffect && (
        <div
          className="fixed inset-0 pointer-events-none z-50 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.04))',
            backgroundSize: '100% 3px, 6px 100%',
          }}
        />
      )}

      {/* 2. ARCHITECT / QA MONITORING HUD (TOP BAR) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#060a16]/95 backdrop-blur-md border-b border-slate-200 dark:border-cyan-500/25 px-4 sm:px-6 py-2.5 shadow-sm dark:shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
        {/* Left: Architect Title & System Status */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            title="Return to Cortex Landing"
            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>ARCHITECT HUD</span>
              <span className="text-zinc-500">{'//'}</span>
              <span className="text-cyan-400">SPACE STATION HQ</span>
            </span>

            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                degradedCount > 0
                  ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40 animate-pulse'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  degradedCount > 0 ? 'bg-yellow-400' : 'bg-emerald-400'
                }`}
              />
              <span>{degradedCount > 0 ? `QA ALERT: ${degradedCount} DEGRADED` : 'QA: NOMINAL'}</span>
            </span>
          </div>
        </div>

        {/* Center: Live Bot Roster Pill Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {ALL_AGENT_CODES.map((code) => {
            const meta = AGENT_REGISTRY[code];
            const stat = statsMap[code];
            const isSelected = selectedAgent === code;
            const isLow = stat.isLowKnowledge;

            return (
              <button
                key={code}
                onClick={() => handleSelectBot(code)}
                className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 border transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.7)]'
                    : isLow
                    ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/25 animate-pulse'
                    : 'bg-slate-100 dark:bg-zinc-900/80 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-cyan-500/40 hover:text-cyan-700 dark:hover:text-cyan-300'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: isLow ? '#facc15' : meta.color,
                    boxShadow: `0 0 4px ${isLow ? '#facc15' : meta.color}`,
                  }}
                />
                <span className="font-bold">{code}</span>
                <span className={`text-[10px] ${isLow ? 'text-yellow-400 font-bold' : 'text-zinc-500'}`}>
                  {stat.percentage}%
                </span>
                {isLow && <span className="text-yellow-400">⚠️</span>}
              </button>
            );
          })}
        </div>

        {/* Right: Actions, Sync & Links */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchStats}
            disabled={isLoadingStats}
            title="Refresh Live Vault Telemetry"
            className="h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-zinc-900/80 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 text-xs text-slate-700 dark:text-zinc-300 hover:text-cyan-700 dark:hover:text-cyan-400 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={() => setCrtEffect((prev) => !prev)}
            title="Toggle CRT Scanlines"
            className={`h-8 px-2.5 rounded-lg text-xs font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
              crtEffect
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 font-bold'
                : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden md:inline">CRT</span>
          </button>

          <Link
            href="/console"
            className="h-8 px-3 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,255,0.2)]"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Brain</span>
          </Link>

          <button
            onClick={() => setIsExportClaudeOpen(true)}
            title="Export CLAUDE.md / .cursorrules"
            className="h-8 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export CLAUDE.md</span>
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* 3. MAIN ARENA: 2D SPACE STATION (Reactor / Command Deck / Workstations) */}
      <main className="relative flex-1 w-full h-[calc(100vh-61px)] max-h-[calc(100vh-61px)] overflow-hidden bg-[#02040b]">
        <SpaceStation
          statsMap={statsMap}
          selectedAgent={selectedAgent}
          isChatLoading={isChatLoading}
          isTerminalOpen={isTerminalOpen}
          drawerWidth={TERMINAL_DRAWER_WIDTH}
          onSelectBot={handleSelectBot}
          onToggleTerminal={() => {
            if (isTerminalOpen) {
              handleCloseTerminal();
            } else {
              setIsTerminalOpen(true);
            }
          }}
        />

        {/* Quick HUD Guide Tip (Bottom Left Corner) */}
        <div className="absolute bottom-4 left-6 hidden md:flex flex-col gap-1 text-[11px] font-mono text-zinc-400 bg-black/65 backdrop-blur-md p-3 rounded-xl border border-cyan-500/20 z-20 pointer-events-none">
          <span className="text-cyan-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SPACE STATION HQ:</span>
          </span>
          <span>• Click any bot, desk, or the reactor to open comms</span>
          <span>• Press Esc or click [X] to close the terminal</span>
        </div>

        {/* Floating "Open Terminal" Button — hidden when terminal is already open */}
        {!isTerminalOpen && (
          <button
            type="button"
            onClick={() => setIsTerminalOpen(true)}
            className="fixed bottom-5 right-5 z-30 px-3.5 py-2.5 rounded-xl bg-[#081124]/90 hover:bg-[#0c1833] border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,255,0.25)] backdrop-blur-md transition-all cursor-pointer group"
            title="Open Mainframe Terminal Panel"
          >
            <Terminal className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Open Terminal</span>
          </button>
        )}
      </main>

      {/* 8. SLIDE-OUT COLLAPSIBLE TERMINAL DRAWER (Framer Motion) */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            key="terminal-drawer"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-[61px] right-0 bottom-0 w-full sm:w-[480px] bg-white/95 dark:bg-[#070d1d]/95 backdrop-blur-xl border-l border-slate-200 dark:border-cyan-500/30 flex flex-col z-40 shadow-xl dark:shadow-[-12px_0_35px_rgba(0,0,0,0.85)] max-h-[calc(100vh-61px)] overflow-hidden"
          >
            {/* PART 1.1: Sleek Top-Right "X" Close Button (Always accessible in both Docked & Standby states) */}
            <div className="p-4 border-b border-slate-200 dark:border-cyan-500/25 bg-slate-50 dark:bg-[#091126] flex items-center justify-between shrink-0">
              {selectedAgent && activeBotMeta ? (
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="p-1.5 rounded-lg border flex items-center justify-center shrink-0"
                    style={{
                      borderColor: activeBotMeta.color,
                      backgroundColor: `${activeBotMeta.color}20`,
                    }}
                  >
                    <PixelBot
                      code={selectedAgent}
                      size={36}
                      knowledge={statsMap[selectedAgent].percentage}
                      health={statsMap[selectedAgent].health}
                      isLowKnowledgeOverride={statsMap[selectedAgent].isLowKnowledge}
                      showNameTag={false}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide truncate">
                        {activeBotMeta.name}
                      </h2>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border shrink-0 ${activeBotMeta.badgeBg}`}>
                        {activeBotMeta.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                      {activeBotMeta.role} • {activeBotMeta.invariants.split(':')[0]}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                      MAINFRAME TERMINAL
                    </h2>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Select an agent workstation to open neural comms
                    </p>
                  </div>
                </div>
              )}

              {/* Sleek Lucide "X" Close Button */}
              <button
                type="button"
                onClick={handleCloseTerminal}
                aria-label="Close terminal panel"
                title="Close terminal and return bot to workstation (Esc)"
                className="p-2 rounded-lg bg-slate-200 dark:bg-zinc-800/90 hover:bg-red-500/20 text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-300 border border-slate-300 dark:border-zinc-700 hover:border-red-500/40 transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedAgent && activeBotMeta ? (
              // Active Docked Bot Terminal Body
              <div className="flex-1 flex flex-col h-full max-h-full overflow-hidden">
                {/* Bot Vital Telemetry Bar */}
                <div className="px-4 py-2 bg-slate-100 dark:bg-black/40 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 text-[11px] font-mono text-slate-600 dark:text-zinc-400 shrink-0 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span>Knowledge:</span>
                    <span
                      className={`font-bold ${
                        statsMap[selectedAgent].isLowKnowledge
                          ? 'text-yellow-600 dark:text-yellow-400 animate-pulse'
                          : 'text-cyan-700 dark:text-cyan-400'
                      }`}
                    >
                      {statsMap[selectedAgent].percentage}%
                    </span>
                    <span>•</span>
                    <span>Health:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {statsMap[selectedAgent].health}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <VoiceModeBadge />
                  </div>
                </div>

                {/* Quick Invariant Prompt Shortcuts */}
                <div className="px-4 py-2 bg-slate-50 dark:bg-[#081022] border-b border-slate-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSendChat(activeBotMeta.samplePrompt)}
                    className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer shrink-0"
                  >
                    ⚡ {activeBotMeta.samplePrompt.slice(0, 36)}...
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSendChat(`List your top invariants and explain why they must not be violated.`)
                    }
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer shrink-0"
                  >
                    📜 Core Invariants
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSendChat(`/implement a minimal reference implementation enforcing ${activeBotMeta.code} rules`)
                    }
                    className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer shrink-0"
                  >
                    🚀 /implement
                  </button>
                </div>

                {/* Chat Message History Stream */}
                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-250px)] p-4 space-y-4">
                  {(chatMessages[selectedAgent] || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 mb-1 flex items-center gap-1.5">
                        <span>{msg.role === 'user' ? 'Architect / QA' : activeBotMeta.name}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[90%] p-3.5 rounded-xl text-xs leading-relaxed font-mono ${
                          msg.role === 'user'
                            ? 'bg-cyan-600/15 dark:bg-cyan-600/20 text-cyan-950 dark:text-cyan-100 border border-cyan-500/40 rounded-br-none shadow-sm dark:shadow-[0_0_10px_rgba(0,255,255,0.15)]'
                            : 'bg-slate-100 dark:bg-[#091329] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-zinc-800 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <ChatMessageContent text={msg.text} role={msg.role} />
                        {msg.role === 'assistant' && (
                          <div className="text-[10px] text-slate-500 dark:text-gray-500 font-mono mt-2 border-t border-black/10 dark:border-white/10 pt-1.5 flex items-center justify-between gap-2">
                            <span>
                              [via {msg.provider ? msg.provider.toUpperCase() : 'GOOGLE'} • {msg.model || 'gemini-3.8-flash'}]
                            </span>
                            <VoiceTTSButton text={msg.text} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-700 dark:text-cyan-400 p-3 bg-slate-100 dark:bg-[#091329] border border-cyan-500/30 rounded-xl w-fit">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Querying {activeBotMeta.name} neural bus...</span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Prompt Input Bar */}
                <div className="p-3 bg-slate-50 dark:bg-[#091126] border-t border-slate-200 dark:border-cyan-500/20 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChat();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Query ${activeBotMeta.name} (contextNode: ${selectedAgent})...`}
                      disabled={isChatLoading}
                      className="flex-1 h-10 px-3 rounded-lg bg-white dark:bg-black/60 border border-slate-300 dark:border-zinc-700 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 outline-none transition-all"
                    />
                    <VoiceInput
                      disabled={isChatLoading}
                      variant="hq"
                      onTranscript={(transcribed) =>
                        setChatInput((prev) => (prev.trim() ? `${prev.trim()} ${transcribed}` : transcribed))
                      }
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isChatLoading}
                      className="h-10 px-3.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white dark:text-black font-bold text-xs transition-all flex items-center justify-center cursor-pointer shadow-md dark:shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              // Standby View when Drawer is opened without a selected bot
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4 shadow-md dark:shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                  <Terminal className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wider mb-2">
                  TERMINAL STANDBY // SELECT AGENT
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-200 max-w-xs leading-relaxed mb-6 font-mono">
                  Click any of the 9 Core Pixel Bots (8 Engineering Agents + the Judgment Arbiter) or select a badge below to dock them to the central Mainframe.
                </p>

                {/* Bot Quick-Select Grid */}
                <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
                  {ALL_AGENT_CODES.map((code) => {
                    const meta = AGENT_REGISTRY[code];
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleSelectBot(code)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-cyan-500/40 text-xs font-mono text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white flex flex-col items-center gap-1 transition-all cursor-pointer shadow-sm dark:shadow-none"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="font-bold">{code}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export CLAUDE.md Modal */}
      <ExportClaudeModal
        isOpen={isExportClaudeOpen}
        onClose={() => setIsExportClaudeOpen(false)}
      />
    </div>
  );
}
