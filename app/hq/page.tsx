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
  PM: { x: 18, y: 22, angle: 140 }, // Top Left (interrogation)
  UX: { x: 10, y: 50, angle: 180 }, // Mid Left (interaction)
  GR: { x: 18, y: 78, angle: 220 }, // Bottom Left (growth pitch)
  DB: { x: 38, y: 88, angle: 260 }, // Bottom Center-Left (storage)
  SEC: { x: 62, y: 88, angle: 280 }, // Bottom Center-Right (security)
  SD: { x: 82, y: 78, angle: 320 }, // Bottom Right (architecture)
  IR: { x: 90, y: 50, angle: 0 }, // Mid Right (integration)
  RS: { x: 82, y: 22, angle: 40 }, // Top Right (research)
};

// Central Mainframe coordinates (center of the room)
const MAINFRAME_COORDS = { x: 50, y: 46 };

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

  // Count degraded bots (< 30% knowledge)
  const degradedCount = useMemo(() => {
    return Object.values(statsMap).filter((s) => s.isLowKnowledge).length;
  }, [statsMap]);

  // Average knowledge score
  const avgKnowledge = useMemo(() => {
    const list = Object.values(statsMap);
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + curr.percentage, 0);
    return Math.round(sum / list.length);
  }, [statsMap]);

  // Bot selection handler: bot walks to terminal and opens terminal chat
  const handleSelectBot = (code: AgentCode) => {
    if (selectedBotCode === code) return;
    setIsWalking(true);
    setSelectedBotCode(code);

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

    // Walking animation settles in 600ms
    setTimeout(() => {
      setIsWalking(false);
    }, 600);
  };

  // Undock bot back to its station
  const handleUndockBot = () => {
    setIsWalking(true);
    setSelectedBotCode(null);
    setTimeout(() => {
      setIsWalking(false);
    }, 500);
  };

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (selectedBotCode) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, selectedBotCode]);

  // Submit chat prompt to /api/chat with hardcoded contextNode
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
          source: 'hq', // Flag indicating quick conversational command center
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
    <div className="relative w-screen h-screen max-h-screen bg-[#04060d] text-slate-100 flex flex-col font-mono overflow-hidden select-none">
      {/* 1. Retro CRT Scanline & Phosphor Overlay */}
      {crtEffect && (
        <div
          className="fixed inset-0 pointer-events-none z-50 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.04))',
            backgroundSize: '100% 3px, 6px 100%',
          }}
        />
      )}

      {/* 2. ARCHITECT / QA MONITORING HUD (TOP BAR) */}
      <header className="sticky top-0 z-40 bg-[#070b16]/90 backdrop-blur-md border-b border-cyan-500/25 px-4 sm:px-6 py-2.5 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3">
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

      {/* 3. MAIN ARENA: 2D RETRO COMMAND CENTER ROOM */}
      <main className="relative flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-65px)] max-h-[calc(100vh-65px)]">
        {/* Left / Center Area: The Command Center Deck */}
        <div className="relative flex-1 min-h-[500px] lg:min-h-full flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#030611]">
          {/* Neon Floor Grid Background (Isometric/Perspective Cyberpunk Grid) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 255, 255, 0.12) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 255, 255, 0.12) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />

          {/* Perspective Radial Glowing Core */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          {/* Top Cyber Server Racks in Background */}
          <div className="absolute top-3 left-6 right-6 hidden md:flex items-center justify-between text-[10px] text-zinc-600 pointer-events-none uppercase">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-cyan-500">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>RACK-A // BUS 0x88</span>
              </span>
              <span className="text-zinc-600">COOLING: 99.8% NOMINAL</span>
            </div>
            <div className="flex items-center gap-4">
              <span>VAULT REPO: MyBrain/agents/</span>
              <span>SYNAPSE BUFFER: 8/8 NODES</span>
            </div>
          </div>

          {/* 4. SVG TETHER LAYER (Connections from Stations to Central Mainframe) */}
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

            {ALL_AGENT_CODES.map((code) => {
              const station = STATION_COORDINATES[code];
              const isSelected = selectedBotCode === code;
              const meta = AGENT_REGISTRY[code];
              const isLow = statsMap[code]?.isLowKnowledge;

              // Render curved spline connecting station to mainframe
              const startX = `${station.x}%`;
              const startY = `${station.y}%`;
              const endX = `${MAINFRAME_COORDS.x}%`;
              const endY = `${MAINFRAME_COORDS.y}%`;

              return (
                <g key={`tether-${code}`}>
                  {/* Subtle wide glow line */}
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

                  {/* Pulsing data packets traveling along the tether */}
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
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="w-36 h-36 rounded-full border border-dashed border-cyan-500/40 p-2 flex items-center justify-center relative"
                style={{
                  filter: 'drop-shadow(0 0 16px rgba(0, 255, 255, 0.3))',
                }}
              >
                <div className="w-full h-full rounded-full border border-cyan-400/20" />
              </motion.div>

              {/* Mainframe Monitor Screen Box */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-2xl bg-[#070e1e] border-2 border-cyan-500/60 p-2.5 shadow-[0_0_25px_rgba(0,255,255,0.4)] flex flex-col items-center justify-between text-center relative overflow-hidden">
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
                    {selectedBotCode ? `DOCKED: [${selectedBotCode}]` : 'READY // 8-PORT'}
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

          {/* 6. THE 8 PERIMETER STATIONS (Where Bots Live & Idle) */}
          {ALL_AGENT_CODES.map((code, idx) => {
            const station = STATION_COORDINATES[code];
            const meta = AGENT_REGISTRY[code];
            const stat = statsMap[code];
            const isDocked = selectedBotCode === code;
            const isHovered = hoveredBotCode === code;
            const isLow = stat.isLowKnowledge;

            return (
              <div
                key={code}
                className="absolute z-20 flex flex-col items-center"
                style={{
                  left: `${station.x}%`,
                  top: `${station.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredBotCode(code)}
                onMouseLeave={() => setHoveredBotCode(null)}
              >
                {/* Station Floor Pedestal Pad */}
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

                {/* The Bot Sprite (Only visible at this station when NOT docked to mainframe) */}
                <div className="absolute -top-10 flex flex-col items-center">
                  {!isDocked ? (
                    <motion.div
                      layoutId={`bot-${code}`}
                      onClick={() => handleSelectBot(code)}
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
                  ) : (
                    // Ghost outline / docking placeholder while bot is at the terminal
                    <div className="w-12 h-14 border border-dashed border-cyan-500/30 rounded-xl flex items-center justify-center opacity-40">
                      <span className="text-[9px] font-mono text-cyan-400 animate-pulse">
                        DOCKED
                      </span>
                    </div>
                  )}
                </div>

                {/* Station Info Sub-bar */}
                <div className="mt-7 text-center">
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
            );
          })}

          {/* Quick HUD Guide Tip (Bottom Left Corner of Arena) */}
          <div className="absolute bottom-4 left-6 hidden md:flex flex-col gap-1 text-[11px] font-mono text-zinc-400 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-zinc-800">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMMAND CONTROLS:</span>
            </span>
            <span>• Click any Bot to walk to Terminal &amp; Query</span>
            <span>• Yellow flashing eyes = Knowledge &lt; 30% warning</span>
            <span>• Tethers stream live telemetry into Cortex Mainframe</span>
          </div>
        </div>

        {/* 7. RIGHT DOCKED TERMINAL CHAT PANEL */}
        <div
          className={`w-full lg:w-[480px] xl:w-[520px] bg-[#070d1d] border-t lg:border-t-0 lg:border-l border-cyan-500/30 flex flex-col z-30 transition-all h-full max-h-full overflow-hidden ${
            selectedBotCode ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {selectedBotCode && activeBotMeta ? (
            // Active Docked Bot Terminal View
            <div className="flex-1 flex flex-col h-full max-h-full overflow-hidden">
              {/* Terminal Chat Header */}
              <div className="p-4 border-b border-cyan-500/25 bg-[#091126] flex items-center justify-between">
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

                {/* Undock / Return Bot Button */}
                <button
                  onClick={handleUndockBot}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono border border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Undock bot and return to perimeter station"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Undock</span>
                </button>
              </div>

              {/* Bot Vital Telemetry Bar */}
              <div className="px-4 py-2 bg-black/40 border-b border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
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
              <div className="px-4 py-2 bg-[#081022] border-b border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
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
              <div className="p-3 bg-[#091126] border-t border-cyan-500/20">
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
            </div>
          ) : (
            // Default Standby Terminal View (When no bot is docked)
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                <Terminal className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white tracking-wider mb-2">
                TERMINAL STANDBY // AWAITING BOT
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-6 font-mono">
                Click any of the 8 Pixel Bots on the perimeter command stations to dock them to the central Mainframe and inspect their engineering invariants.
              </p>

              {/* Bot Quick-Select Grid */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
                {ALL_AGENT_CODES.map((code) => {
                  const meta = AGENT_REGISTRY[code];
                  return (
                    <button
                      key={code}
                      onClick={() => handleSelectBot(code)}
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-xs font-mono text-zinc-300 hover:text-white flex flex-col items-center gap-1 transition-all cursor-pointer"
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
        </div>
      </main>
    </div>
  );
}

