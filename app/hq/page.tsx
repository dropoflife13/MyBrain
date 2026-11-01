'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bot,
  Check,
  Compass,
  Cpu,
  Eye,
  FolderGit2,
  Layers,
  MessageSquare,
  Radio,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import PixelBot, {
  AgentCode,
  AGENT_REGISTRY,
  AgentMeta,
} from '../../components/PixelBot';
import ChatMessageContent from '../../components/ChatMessageContent';
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

// 8 Bots in order of the Golden Path / SDLC Suite
const ALL_AGENT_CODES: AgentCode[] = ['PM', 'UX', 'GR', 'SD', 'IR', 'DB', 'SEC', 'RS'];

// Coordinates for the 8 docking stations around the central mainframe
// Values are percentages relative to the room arena [x%, y%]
const STATION_COORDINATES: Record<AgentCode, { x: number; y: number; angle: number }> = {
  PM: { x: 18, y: 24, angle: 140 }, // Top Left (interrogation)
  UX: { x: 12, y: 50, angle: 180 }, // Mid Left (interaction)
  GR: { x: 18, y: 76, angle: 220 }, // Bottom Left (growth pitch)
  DB: { x: 38, y: 86, angle: 260 }, // Bottom Center-Left (storage)
  SEC: { x: 62, y: 86, angle: 280 }, // Bottom Center-Right (security)
  SD: { x: 82, y: 76, angle: 320 }, // Bottom Right (architecture)
  IR: { x: 88, y: 50, angle: 0 }, // Mid Right (integration)
  RS: { x: 82, y: 24, angle: 40 }, // Top Right (research)
};

// Central Mainframe coordinates (center of the room)
const MAINFRAME_COORDS = { x: 50, y: 48 };

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
  });

  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [selectedBotCode, setSelectedBotCode] = useState<AgentCode | null>(null);
  const [hoveredBotCode, setHoveredBotCode] = useState<AgentCode | null>(null);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [crtEffect, setCrtEffect] = useState<boolean>(true);

  // Requirement 1: Collapsible Terminal Panel (Default: closed/hidden, 100% canvas)
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);

  // Requirement 2: Living Bots - Wandering offsets from station origins
  const [botOffsets, setBotOffsets] = useState<Record<AgentCode, { x: number; y: number }>>({
    PM: { x: 0, y: 0 },
    UX: { x: 0, y: 0 },
    GR: { x: 0, y: 0 },
    DB: { x: 0, y: 0 },
    SEC: { x: 0, y: 0 },
    SD: { x: 0, y: 0 },
    IR: { x: 0, y: 0 },
    RS: { x: 0, y: 0 },
  });

  // Chat panel state
  const [chatMessages, setChatMessages] = useState<Record<AgentCode, ChatMessage[]>>({
    DB: [],
    SEC: [],
    UX: [],
    PM: [],
    SD: [],
    IR: [],
    GR: [],
    RS: [],
  });
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch live stats from /api/stats
  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        const masteryList: any[] = data.agentMastery || [];
        const nextMap: Record<AgentCode, AgentStats> = { ...statsMap };

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

        setStatsMap(nextMap);
      }
    } catch (e) {
      console.error('Failed to fetch /api/stats:', e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Requirement 2: Wandering Timer (Simulate living bots pacing & inspecting systems)
  useEffect(() => {
    const interval = setInterval(() => {
      setBotOffsets((prev) => {
        const next: Record<AgentCode, { x: number; y: number }> = { ...prev };
        ALL_AGENT_CODES.forEach((code) => {
          if (code === selectedBotCode) {
            // Selected/docked bot stays on dock pad
            next[code] = { x: 0, y: 0 };
          } else {
            // Smooth wandering drift within ±2.2% X and ±2.2% Y from station origin
            const randX = Number((Math.sin(Date.now() / 1000 + code.charCodeAt(0)) * 2.2).toFixed(1));
            const randY = Number((Math.cos(Date.now() / 1200 + code.charCodeAt(1)) * 2.2).toFixed(1));
            next[code] = { x: randX, y: randY };
          }
        });
        return next;
      });
    }, 3600);

    return () => clearInterval(interval);
  }, [selectedBotCode]);

  // Requirement 1: Press 'Esc' to close terminal & undock bot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTerminalOpen) {
        handleUndockBot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTerminalOpen]);

  // Count degraded bots (< 30% knowledge)
  const degradedCount = useMemo(() => {
    return Object.values(statsMap).filter((s) => s.isLowKnowledge).length;
  }, [statsMap]);

  // Bot selection handler: bot walks to terminal and opens terminal drawer
  const handleSelectBot = (code: AgentCode) => {
    setIsWalking(true);
    setSelectedBotCode(code);
    setIsTerminalOpen(true);

    // Seed initial greeting if this bot has no messages yet
    if (!chatMessages[code] || chatMessages[code].length === 0) {
      const meta = AGENT_REGISTRY[code];
      const initialGreeting: ChatMessage = {
        id: `init-${Date.now()}`,
        role: 'assistant',
        text: `Hey Architect! ${meta.name} docked and online. What do you need verified?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'gemini-3.5-flash',
        provider: 'google',
      };
      setChatMessages((prev) => ({
        ...prev,
        [code]: [initialGreeting],
      }));
    }

    // Walking animation settles in 500ms
    setTimeout(() => {
      setIsWalking(false);
    }, 500);
  };

  // Undock bot and slide terminal drawer out
  const handleUndockBot = () => {
    setIsWalking(true);
    setIsTerminalOpen(false);
    setTimeout(() => {
      setSelectedBotCode(null);
      setIsWalking(false);
    }, 350);
  };

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (selectedBotCode && isTerminalOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, selectedBotCode, isTerminalOpen]);

  // Submit chat prompt to /api/chat with hardcoded contextNode and source='hq'
  const handleSendChat = async (queryText?: string) => {
    const textToSend = (queryText ?? chatInput).trim();
    if (!textToSend || !selectedBotCode || isChatLoading) return;

    const botCode = selectedBotCode;
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
          contextNode: botCode, // Hardcoded to specific bot code (DB, SEC, UX, PM, SD, IR, GR, RS)
          source: 'hq', // Enforces concise conversational responses
        }),
      });

      const data = await res.json().catch(() => null);
      let replyText =
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
    } catch (err: any) {
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

  const activeBotMeta = selectedBotCode ? AGENT_REGISTRY[selectedBotCode] : null;

  return (
    <div className="relative w-screen h-screen max-h-screen bg-[#02050e] text-slate-100 flex flex-col font-mono overflow-hidden select-none">
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
      <header className="sticky top-0 z-40 bg-[#060a16]/95 backdrop-blur-md border-b border-cyan-500/25 px-4 sm:px-6 py-2.5 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
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
            <span className="text-sm font-extrabold tracking-wider text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>ARCHITECT HUD</span>
              <span className="text-zinc-500">//</span>
              <span className="text-cyan-400">QA MONITORING ONLINE</span>
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
            const isSelected = selectedBotCode === code;
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
                    : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-cyan-500/40 hover:text-cyan-300'
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
            className="h-8 px-2.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs text-zinc-300 hover:text-cyan-400 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={() => setCrtEffect((prev) => !prev)}
            title="Toggle CRT Scanlines"
            className={`h-8 px-2.5 rounded-lg text-xs font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
              crtEffect
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
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

          <ThemeToggle />
        </div>
      </header>

      {/* 3. MAIN ARENA: 100% FULL-WIDTH SPACE STATION CANVAS */}
      <main className="relative flex-1 w-full h-[calc(100vh-61px)] max-h-[calc(100vh-61px)] overflow-hidden flex flex-col items-center justify-center bg-[#02050e]">
        {/* Requirement 3: Perspective TRON Grid Floor with Depth & Fading Horizon */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Deep space radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#09153a]/30 via-[#030613] to-[#010309]" />

          {/* 3D Perspective TRON Grid Floor */}
          <div
            className="absolute -bottom-28 left-0 right-0 h-[68%] origin-bottom"
            style={{
              transform: 'perspective(550px) rotateX(62deg)',
              backgroundImage: `
                linear-gradient(to right, rgba(0, 255, 255, 0.16) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 255, 255, 0.16) 1px, transparent 1px)
              `,
              backgroundSize: '44px 44px',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 35%, transparent 95%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 35%, transparent 95%)',
            }}
          />

          {/* Station Upper Atmospheric Grid Lines */}
          <div
            className="absolute top-0 left-0 right-0 h-[32%] opacity-15"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 255, 255, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 255, 255, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        {/* Top Space Station Telemetry Readout */}
        <div className="absolute top-3 left-6 right-6 hidden md:flex items-center justify-between text-[10px] text-zinc-500 pointer-events-none uppercase tracking-wider z-10">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>STATION ORBIT // SECTOR 08</span>
            </span>
            <span className="text-zinc-600">•</span>
            <span>SYSTEM INTEGRITY: 100% NOMINAL</span>
          </div>
          <div className="flex items-center gap-4">
            <span>BUS PROTOCOL: CORTEX 8-PORT ROOT</span>
            <span>PRESS ESC TO CLOSE TERMINAL</span>
          </div>
        </div>

        {/* Requirement 3: Radar Sweep & Concentric Energy Core Behind Mainframe */}
        <div
          className="absolute z-0 pointer-events-none"
          style={{
            left: `${MAINFRAME_COORDS.x}%`,
            top: `${MAINFRAME_COORDS.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Concentric Radar Range Rings */}
          <div className="w-[300px] h-[300px] rounded-full border border-cyan-500/15 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-[440px] h-[440px] rounded-full border border-cyan-500/10 border-dashed absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-[580px] h-[580px] rounded-full border border-cyan-500/5 absolute -translate-x-1/2 -translate-y-1/2" />

          {/* Crosshair Target Axes */}
          <div className="w-[600px] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="h-[600px] w-[1px] bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent absolute -translate-x-1/2 -translate-y-1/2" />

          {/* Slow Rotating Conic Radar Sweep */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="w-[520px] h-[520px] rounded-full absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(0, 255, 255, 0.16) 360deg)',
              filter: 'blur(1.5px)',
            }}
          />

          {/* Core Ambient Energy Glow */}
          <div className="w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl absolute -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* 4. DYNAMIC SVG TETHER LAYER (Live-updates as bots wander) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            {ALL_AGENT_CODES.map((code) => {
              const meta = AGENT_REGISTRY[code];
              return (
                <linearGradient
                  key={`grad-${code}`}
                  id={`tether-grad-${code}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={meta.colorLight} stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#00ffff" stopOpacity="0.3" />
                </linearGradient>
              );
            })}
          </defs>

          {ALL_AGENT_CODES.map((code, idx) => {
            const station = STATION_COORDINATES[code];
            const offset = botOffsets[code] || { x: 0, y: 0 };
            const isSelected = selectedBotCode === code;
            const meta = AGENT_REGISTRY[code];
            const isLow = statsMap[code]?.isLowKnowledge;
            const isWorking = isChatLoading && isSelected;

            // Compute dynamic coordinates (station origin + wandering offset)
            const currentX = station.x + offset.x;
            const currentY = station.y + offset.y;

            const startX = `${currentX}%`;
            const startY = `${currentY}%`;
            const endX = `${MAINFRAME_COORDS.x}%`;
            const endY = `${MAINFRAME_COORDS.y}%`;

            return (
              <g key={`tether-${code}`}>
                {/* Subtle base tether wire */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={isLow ? '#facc15' : meta.color}
                  strokeWidth={isSelected ? 4 : 1.5}
                  strokeOpacity={isSelected ? 0.9 : 0.35}
                  className="transition-all duration-300"
                  style={{
                    filter: isSelected
                      ? `drop-shadow(0 0 8px ${meta.colorLight})`
                      : undefined,
                  }}
                />

                {/* Animated dashed cable pulse */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={isSelected ? '#ffffff' : isLow ? '#fef08a' : meta.colorLight}
                  strokeWidth={isSelected ? 3 : 1.5}
                  strokeDasharray={isSelected ? '8 12' : '4 16'}
                  strokeLinecap="round"
                  className="animate-[dash_1.5s_linear_infinite]"
                />

                {/* Requirement 3: Animated Glowing Data Packet traveling from Bot to Mainframe */}
                <motion.circle
                  r={isSelected ? 4.5 : 2.5}
                  fill={isSelected ? '#00ffff' : isLow ? '#facc15' : meta.colorLight}
                  filter={`drop-shadow(0 0 6px ${isSelected ? '#00ffff' : meta.colorLight})`}
                  animate={{
                    cx: [`${currentX}%`, `${MAINFRAME_COORDS.x}%`],
                    cy: [`${currentY}%`, `${MAINFRAME_COORDS.y}%`],
                    opacity: [0.2, 1, 0.4],
                  }}
                  transition={{
                    duration: isWorking ? 0.6 : 2.4 + idx * 0.25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* 5. CENTRAL MAINFRAME TERMINAL (CORTEX BRAIN CONNECTION) */}
        <div
          className="absolute z-20 flex flex-col items-center justify-center pointer-events-auto"
          style={{
            left: `${MAINFRAME_COORDS.x}%`,
            top: `${MAINFRAME_COORDS.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Holographic Cortex Core */}
          <div className="relative group cursor-pointer" onClick={() => handleUndockBot()}>
            {/* Outer Cyan Cyber Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              className="w-36 h-36 rounded-full border border-dashed border-cyan-500/40 p-2 flex items-center justify-center relative"
              style={{
                filter: 'drop-shadow(0 0 18px rgba(0, 255, 255, 0.35))',
              }}
            >
              <div className="w-full h-full rounded-full border border-cyan-400/20" />
            </motion.div>

            {/* Mainframe Monitor Screen Box */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-[#060c1c] border-2 border-cyan-500/60 p-2.5 shadow-[0_0_25px_rgba(0,255,255,0.4)] flex flex-col items-center justify-between text-center relative overflow-hidden">
                {/* Subtle terminal matrix scan */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

                <div className="flex items-center justify-between w-full text-[8px] text-cyan-400 font-bold">
                  <span>BUS: 8</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                </div>

                {/* Pulsing Central Cortex Logo */}
                <div className="flex flex-col items-center">
                  <img
                    src="/cortex-logo-cyan.svg"
                    alt="Cortex Brain"
                    className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(0,255,255,0.7)] animate-pulse"
                  />
                  <span className="text-[9px] font-bold tracking-wider text-white mt-1 uppercase">
                    MAINFRAME
                  </span>
                </div>

                <span className="text-[7px] text-cyan-400/80 font-mono tracking-tighter">
                  {selectedBotCode ? `DOCKED: [${selectedBotCode}]` : 'ROOT BUS READY'}
                </span>
              </div>
            </div>

            {/* Docking Bay Floor Pad (In Front of Terminal) */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-28 h-8 rounded-[100%] bg-cyan-500/15 border border-cyan-400/40 blur-[0.5px] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.25)]">
              <span className="text-[8px] font-bold text-cyan-300 tracking-widest uppercase">
                {selectedBotCode ? `PORT [${selectedBotCode}] ACTIVE` : 'DOCKING RECEPTOR'}
              </span>
            </div>
          </div>

          {/* If a bot is currently docked, show the bot physically standing on the central terminal pad */}
          {selectedBotCode && (
            <motion.div
              layoutId={`bot-${selectedBotCode}`}
              className="absolute z-30 -bottom-16 flex flex-col items-center"
            >
              {/* Requirement 2: Working State (Faster floating + typing indicator) */}
              {isChatLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-[10px] font-mono text-cyan-300 flex items-center gap-1 shadow-[0_0_12px_rgba(0,255,255,0.6)] z-30"
                >
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
                  <span>thinking...</span>
                </motion.div>
              )}

              <PixelBot
                code={selectedBotCode}
                size={72}
                knowledge={statsMap[selectedBotCode].percentage}
                health={statsMap[selectedBotCode].health}
                isSelected={true}
                isWalking={isWalking}
                isLowKnowledgeOverride={statsMap[selectedBotCode].isLowKnowledge}
                showNameTag={true}
                showStats={true}
                showHealthBar={true}
              />
            </motion.div>
          )}
        </div>

        {/* 6. THE 8 PERIMETER STATIONS (Where Bots Live, Idle & Wander) */}
        {ALL_AGENT_CODES.map((code, idx) => {
          const station = STATION_COORDINATES[code];
          const offset = botOffsets[code] || { x: 0, y: 0 };
          const meta = AGENT_REGISTRY[code];
          const stat = statsMap[code];
          const isDocked = selectedBotCode === code;
          const isHovered = hoveredBotCode === code;
          const isLow = stat.isLowKnowledge;
          const isWorking = isChatLoading && isDocked;

          // Wandering coordinates
          const botX = station.x + offset.x;
          const botY = station.y + offset.y;

          return (
            <React.Fragment key={code}>
              {/* Static Floor Pad (Stays anchored at station origin) */}
              <div
                className="absolute z-10 flex flex-col items-center pointer-events-auto"
                style={{
                  left: `${station.x}%`,
                  top: `${station.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  onClick={() => handleSelectBot(code)}
                  className={`w-24 h-12 rounded-[100%] border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative ${
                    isDocked
                      ? 'border-cyan-400/20 bg-black/40'
                      : isLow
                      ? 'border-yellow-500/70 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                      : isHovered
                      ? 'border-white/60 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : 'border-zinc-700/60 bg-zinc-950/60 hover:border-cyan-500/40'
                  }`}
                  style={{
                    boxShadow: !isDocked ? `0 0 14px ${isLow ? 'rgba(234, 179, 8, 0.35)' : meta.glowColor}` : undefined,
                  }}
                >
                  <span
                    className="text-[9px] font-bold font-mono tracking-wider"
                    style={{ color: isLow ? '#facc15' : meta.colorLight }}
                  >
                    PAD [{code}]
                  </span>
                </div>

                {/* Station Info Sub-bar */}
                <div className="mt-2 text-center pointer-events-none">
                  <div className="text-[10px] font-bold text-white flex items-center justify-center gap-1">
                    <span>{meta.name.replace(' Agent', '')}</span>
                    {isLow && (
                      <span title="Knowledge < 30%" className="text-yellow-400 text-xs">
                        ⚠️
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-zinc-500 font-mono">
                    {stat.count} rules • {stat.percentage}%
                  </div>
                </div>
              </div>

              {/* Requirement 2: Living Wandering Bot Sprite (Pacing around station) */}
              {!isDocked ? (
                <motion.div
                  animate={{
                    left: `${botX}%`,
                    top: `${botY}%`,
                  }}
                  transition={{
                    duration: 3.5,
                    ease: 'easeInOut',
                  }}
                  className="absolute z-20 flex flex-col items-center pointer-events-auto"
                  style={{
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseEnter={() => setHoveredBotCode(code)}
                  onMouseLeave={() => setHoveredBotCode(null)}
                >
                  <div className="relative -top-6 flex flex-col items-center">
                    <motion.div
                      layoutId={`bot-${code}`}
                      onClick={() => handleSelectBot(code)}
                      // Staggered floating effect
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.2 + (idx % 4) * 0.25,
                        delay: idx * 0.2,
                        ease: 'easeInOut',
                      }}
                    >
                      <PixelBot
                        code={code}
                        size={60}
                        knowledge={stat.percentage}
                        health={stat.health}
                        isSelected={false}
                        isHovered={isHovered}
                        isWalking={false}
                        isLowKnowledgeOverride={isLow}
                        bobDelay={idx}
                        showNameTag={true}
                        showStats={true}
                        showHealthBar={true}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ) : null}
            </React.Fragment>
          );
        })}

        {/* Quick HUD Guide Tip (Bottom Left Corner) */}
        <div className="absolute bottom-4 left-6 hidden md:flex flex-col gap-1 text-[11px] font-mono text-zinc-400 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-zinc-800 z-20">
          <span className="text-cyan-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SPACE STATION HQ:</span>
          </span>
          <span>• Click any wandering Bot to dock &amp; open Chat Drawer</span>
          <span>• Yellow flashing eyes = Knowledge &lt; 30% alert</span>
          <span>• Live dynamic tethers stream packets into Mainframe</span>
        </div>

        {/* Requirement 1: Small Floating "Toggle Terminal" Button (Bottom Right) */}
        <button
          onClick={() => {
            if (isTerminalOpen) {
              handleUndockBot();
            } else {
              handleSelectBot(selectedBotCode || 'PM');
            }
          }}
          className="fixed bottom-5 right-5 z-30 px-3.5 py-2.5 rounded-xl bg-[#081124]/90 hover:bg-[#0c1833] border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,255,0.25)] backdrop-blur-md transition-all cursor-pointer group"
          title="Toggle Mainframe Terminal Panel (Esc to close)"
        >
          <Terminal className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span>{isTerminalOpen ? 'Close Terminal' : 'Open Terminal'}</span>
          {selectedBotCode && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              {selectedBotCode}
            </span>
          )}
        </button>
      </main>

      {/* Requirement 1: SLIDE-OUT COLLAPSIBLE TERMINAL DRAWER (Framer Motion) */}
      <AnimatePresence>
        {isTerminalOpen && activeBotMeta && selectedBotCode && (
          <motion.div
            key="terminal-drawer"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-[61px] right-0 bottom-0 w-full sm:w-[480px] xl:w-[520px] bg-[#070d1d]/95 backdrop-blur-xl border-l border-cyan-500/30 flex flex-col z-40 shadow-[-12px_0_35px_rgba(0,0,0,0.85)] max-h-[calc(100vh-61px)] overflow-hidden"
          >
            {/* Terminal Chat Header */}
            <div className="p-4 border-b border-cyan-500/25 bg-[#091126] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="p-1.5 rounded-lg border flex items-center justify-center"
                  style={{
                    borderColor: activeBotMeta.color,
                    backgroundColor: `${activeBotMeta.color}20`,
                  }}
                >
                  <PixelBot
                    code={selectedBotCode}
                    size={36}
                    knowledge={statsMap[selectedBotCode].percentage}
                    health={statsMap[selectedBotCode].health}
                    isLowKnowledgeOverride={statsMap[selectedBotCode].isLowKnowledge}
                    showNameTag={false}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white tracking-wide">
                      {activeBotMeta.name}
                    </h2>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${activeBotMeta.badgeBg}`}>
                      {activeBotMeta.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {activeBotMeta.role} • {activeBotMeta.invariants.split(':')[0]}
                  </p>
                </div>
              </div>

              {/* Undock / Close Button */}
              <button
                onClick={handleUndockBot}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono border border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Undock bot and close terminal (Esc)"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>

            {/* Bot Vital Telemetry Bar */}
            <div className="px-4 py-2 bg-black/40 border-b border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
              <div className="flex items-center gap-2">
                <span>Knowledge:</span>
                <span
                  className={`font-bold ${
                    statsMap[selectedBotCode].isLowKnowledge
                      ? 'text-yellow-400 animate-pulse'
                      : 'text-cyan-400'
                  }`}
                >
                  {statsMap[selectedBotCode].percentage}%
                </span>
                <span>•</span>
                <span>Health:</span>
                <span className="text-emerald-400 font-bold">
                  {statsMap[selectedBotCode].health}%
                </span>
              </div>
              <div className="text-[10px] text-zinc-500">
                Target: /api/chat?contextNode={selectedBotCode}
              </div>
            </div>

            {/* Quick Invariant Prompt Shortcuts */}
            <div className="px-4 py-2 bg-[#081022] border-b border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
              <button
                onClick={() => handleSendChat(activeBotMeta.samplePrompt)}
                className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer shrink-0"
              >
                ⚡ {activeBotMeta.samplePrompt.slice(0, 36)}...
              </button>
              <button
                onClick={() =>
                  handleSendChat(`List your top invariants and explain why they must not be violated.`)
                }
                className="px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer shrink-0"
              >
                📜 Core Invariants
              </button>
              <button
                onClick={() =>
                  handleSendChat(`/implement a minimal reference implementation enforcing ${activeBotMeta.code} rules`)
                }
                className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer shrink-0"
              >
                🚀 /implement
              </button>
            </div>

            {/* Chat Message History Stream */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-250px)] p-4 space-y-4">
              {(chatMessages[selectedBotCode] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="text-[10px] font-mono text-zinc-500 mb-1 flex items-center gap-1.5">
                    <span>{msg.role === 'user' ? 'Architect / QA' : activeBotMeta.name}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[90%] p-3.5 rounded-xl text-xs leading-relaxed font-mono ${
                      msg.role === 'user'
                        ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/40 rounded-br-none shadow-[0_0_10px_rgba(0,255,255,0.15)]'
                        : 'bg-[#091329] text-slate-200 border border-zinc-800 rounded-bl-none shadow-md'
                    }`}
                  >
                    <ChatMessageContent text={msg.text} role={msg.role} />
                    {msg.role === 'assistant' && (
                      <div className="text-[10px] text-gray-500 font-mono mt-2 border-t border-black/10 dark:border-white/10 pt-1 flex items-center justify-between">
                        <span>
                          [via {msg.provider ? msg.provider.toUpperCase() : 'GOOGLE'} • {msg.model || 'gemini-3.5-flash'}]
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 p-3 bg-[#091329] border border-cyan-500/30 rounded-xl w-fit">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Querying {activeBotMeta.name} neural bus...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Prompt Input Bar */}
            <div className="p-3 bg-[#091126] border-t border-cyan-500/20 shrink-0">
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
                  placeholder={`Query ${activeBotMeta.name} (contextNode: ${selectedBotCode})...`}
                  disabled={isChatLoading}
                  className="flex-1 h-10 px-3 rounded-lg bg-black/60 border border-zinc-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs font-mono text-white placeholder-zinc-500 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="h-10 px-3.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-black font-bold text-xs transition-all flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
