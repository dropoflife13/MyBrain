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
import SpeechBubble, {
  IDLE_SPEECH_MESSAGES,
  WORKING_SPEECH_OPTIONS,
  OfficeWaypointKey,
  PixelWorkstation,
  PixelOfficeProp,
} from '../../components/SpeechBubble';
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

// Base Workstation Coordinates as percentages of the usable arena [x%, y%]
const STATION_COORDINATES: Record<AgentCode, { x: number; y: number }> = {
  ARB: { x: 50, y: 18 }, // Top Center (Supreme Court Arbiter Bench)
  PM: { x: 18, y: 26 },  // Top Left (Interrogation Desk)
  UX: { x: 13, y: 53 },  // Mid Left (Design Studio Desk)
  GR: { x: 20, y: 79 },  // Bottom Left (Growth Pitch Desk)
  DB: { x: 37, y: 85 },  // Bottom Center-Left (Vault Ledger Desk)
  SEC: { x: 63, y: 85 }, // Bottom Center-Right (Sentinel Firewall Desk)
  SD: { x: 80, y: 79 },  // Bottom Right (Systems Blueprint Desk)
  IR: { x: 87, y: 53 },  // Mid Right (Sync Bus Desk)
  RS: { x: 82, y: 26 },  // Top Right (Research Archive Desk)
};

// Shared Isometric Office Waypoints (Printer, Research Board, Coffee Machine)
const SHARED_WAYPOINTS: Record<Exclude<OfficeWaypointKey, 'desk'>, { x: number; y: number }> = {
  printer: { x: 33, y: 40 },
  research_board: { x: 67, y: 40 },
  coffee_machine: { x: 50, y: 73 },
};

type BotRoutineAction = 'working' | 'fetching_research' | 'printing' | 'coffee_break';

interface BotRoutineState {
  action: BotRoutineAction;
  waypoint: OfficeWaypointKey;
  bubbleText: string | null;
  isWalking: boolean;
}

// Central Mainframe coordinates (center of the room)
const MAINFRAME_COORDS = { x: 50, y: 50 };

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
  const [hoveredBotCode, setHoveredBotCode] = useState<AgentCode | null>(null);

  // Arena viewport measurement
  const arenaRef = useRef<HTMLDivElement>(null);
  const [arenaDimensions, setArenaDimensions] = useState({ width: 1200, height: 720 });

  // Refs for DOM-driven SVG Tethers via requestAnimationFrame (zero React state lag)
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mainframeAnchorRef = useRef<HTMLDivElement | null>(null);
  const botAnchorRefs = useRef<Record<AgentCode, HTMLDivElement | null>>({
    PM: null,
    UX: null,
    GR: null,
    SD: null,
    IR: null,
    DB: null,
    SEC: null,
    RS: null,
    ARB: null,
  });
  const baseLineRefs = useRef<Record<AgentCode, SVGLineElement | null>>({
    PM: null,
    UX: null,
    GR: null,
    SD: null,
    IR: null,
    DB: null,
    SEC: null,
    RS: null,
    ARB: null,
  });
  const pulseLineRefs = useRef<Record<AgentCode, SVGLineElement | null>>({
    PM: null,
    UX: null,
    GR: null,
    SD: null,
    IR: null,
    DB: null,
    SEC: null,
    RS: null,
    ARB: null,
  });

  // Wandering micro-offsets around current desk when working (updated every 4 seconds via setInterval)
  const [wanderOffsets, setWanderOffsets] = useState<Record<AgentCode, { x: number; y: number }>>({
    PM: { x: 0, y: 0 },
    UX: { x: 0, y: 0 },
    GR: { x: 0, y: 0 },
    DB: { x: 0, y: 0 },
    SEC: { x: 0, y: 0 },
    SD: { x: 0, y: 0 },
    IR: { x: 0, y: 0 },
    RS: { x: 0, y: 0 },
    ARB: { x: 0, y: 0 },
  });

  // Living Isometric Office Routine State Machine per Bot (desk, printer, research_board, coffee_machine)
  const [botRoutines, setBotRoutines] = useState<Record<AgentCode, BotRoutineState>>({
    PM: { action: 'working', waypoint: 'desk', bubbleText: 'Planning...', isWalking: false },
    UX: { action: 'working', waypoint: 'desk', bubbleText: null, isWalking: false },
    GR: { action: 'working', waypoint: 'desk', bubbleText: null, isWalking: false },
    DB: { action: 'working', waypoint: 'desk', bubbleText: 'Indexing...', isWalking: false },
    SEC: { action: 'working', waypoint: 'desk', bubbleText: null, isWalking: false },
    SD: { action: 'working', waypoint: 'desk', bubbleText: 'Architecting...', isWalking: false },
    IR: { action: 'working', waypoint: 'desk', bubbleText: null, isWalking: false },
    RS: { action: 'working', waypoint: 'desk', bubbleText: null, isWalking: false },
    ARB: { action: 'working', waypoint: 'desk', bubbleText: 'Adjudicating...', isWalking: false },
  });

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

  // Measure arena container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (arenaRef.current) {
        setArenaDimensions({
          width: arenaRef.current.clientWidth,
          height: arenaRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    const ro = new ResizeObserver(updateDimensions);
    if (arenaRef.current) ro.observe(arenaRef.current);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      ro.disconnect();
    };
  }, []);

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

  // PART 1.3: Desk Micro-Shift Logic — setInterval every 4 seconds for bots working at their desk
  useEffect(() => {
    const interval = setInterval(() => {
      setWanderOffsets((prev) => {
        const next: Record<AgentCode, { x: number; y: number }> = { ...prev };
        ALL_AGENT_CODES.forEach((code) => {
          if (code === selectedAgent) {
            next[code] = { x: 0, y: 0 };
          } else {
            // Subtle posture shift around the bot's workstation desk (-10px to +10px)
            next[code] = {
              x: Math.round(Math.random() * 20 - 10),
              y: Math.round(Math.random() * 14 - 7),
            };
          }
        });
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedAgent]);

  // PART 3: Isometric Office Routine State Machine (Every 10-15 seconds, bots execute routines between desk, printer, research_board, coffee_machine)
  useEffect(() => {
    let isMounted = true;
    const activeTimers: Array<ReturnType<typeof setTimeout>> = [];
    let mainLoopTimer: ReturnType<typeof setTimeout> | null = null;

    const triggerOfficeRoutines = () => {
      if (!isMounted) return;
      const availableBots = ALL_AGENT_CODES.filter((c) => c !== selectedAgent);
      if (availableBots.length > 0) {
        const shuffled = [...availableBots].sort(() => 0.5 - Math.random());
        const travelerBot = shuffled[0];
        const deskWorkers = shuffled.slice(1, 4);

        // Pick an errand for the traveler bot: fetching_research, printing, or coffee_break
        const errandRoll = Math.random();
        const chosenErrand: {
          action: BotRoutineAction;
          waypoint: Exclude<OfficeWaypointKey, 'desk'>;
          pauseBubble: string;
        } =
          errandRoll < 0.42
            ? { action: 'fetching_research', waypoint: 'research_board', pauseBubble: '📄 Reading...' }
            : errandRoll < 0.82
            ? { action: 'printing', waypoint: 'printer', pauseBubble: '🖨️ Printing...' }
            : { action: 'coffee_break', waypoint: 'coffee_machine', pauseBubble: '☕ Recharging...' };

        // 1. Update desk workers with fresh typing/thinking bubbles, and start traveler walking to waypoint
        setBotRoutines((prev) => {
          const next = { ...prev };

          // Clear old desk bubbles first so the room doesn't get cluttered
          ALL_AGENT_CODES.forEach((c) => {
            if (next[c].waypoint === 'desk') {
              next[c] = { ...next[c], bubbleText: null };
            }
          });

          // Give 2-3 desk workers a contextual working bubble ("Analyzing...", "Compiling...", "Reading docs...")
          deskWorkers.forEach((c) => {
            if (next[c].waypoint === 'desk') {
              const options = WORKING_SPEECH_OPTIONS[c] || [IDLE_SPEECH_MESSAGES[c]];
              const picked = options[Math.floor(Math.random() * options.length)];
              next[c] = {
                action: 'working',
                waypoint: 'desk',
                bubbleText: picked,
                isWalking: false,
              };
            }
          });

          // Send travelerBot to the chosen waypoint
          next[travelerBot] = {
            action: chosenErrand.action,
            waypoint: chosenErrand.waypoint,
            bubbleText: null,
            isWalking: true,
          };

          return next;
        });

        // 2. Upon arriving at waypoint (~1.3s), pause for 3 seconds with action speech bubble ("📄 Reading..." or "🖨️ Printing...")
        const arriveTimer = setTimeout(() => {
          setBotRoutines((prev) => {
            if (selectedAgent === travelerBot) return prev;
            return {
              ...prev,
              [travelerBot]: {
                ...prev[travelerBot],
                isWalking: false,
                bubbleText: chosenErrand.pauseBubble,
              },
            };
          });
        }, 1300);
        activeTimers.push(arriveTimer);

        // 3. After pausing for 3 seconds (at t = 4.5s), walk back to their base desk
        const returnTimer = setTimeout(() => {
          setBotRoutines((prev) => {
            if (selectedAgent === travelerBot) return prev;
            return {
              ...prev,
              [travelerBot]: {
                action: 'working',
                waypoint: 'desk',
                bubbleText: null,
                isWalking: true,
              },
            };
          });
        }, 4500);
        activeTimers.push(returnTimer);

        // 4. Settle back at desk (~5.8s) and resume working
        const settleTimer = setTimeout(() => {
          setBotRoutines((prev) => {
            if (selectedAgent === travelerBot) return prev;
            const options = WORKING_SPEECH_OPTIONS[travelerBot] || [IDLE_SPEECH_MESSAGES[travelerBot]];
            return {
              ...prev,
              [travelerBot]: {
                action: 'working',
                waypoint: 'desk',
                bubbleText: options[0],
                isWalking: false,
              },
            };
          });
        }, 5800);
        activeTimers.push(settleTimer);

        // 5. Fade out desk speech bubbles after 6.5s so bubbles cycle cleanly
        const clearDeskBubblesTimer = setTimeout(() => {
          setBotRoutines((prev) => {
            const next = { ...prev };
            deskWorkers.forEach((c) => {
              if (next[c].waypoint === 'desk') {
                next[c] = { ...next[c], bubbleText: null };
              }
            });
            return next;
          });
        }, 6500);
        activeTimers.push(clearDeskBubblesTimer);
      }

      // Schedule next routine cycle in 10 to 14 seconds
      if (!isMounted) return;
      const nextDelay = Math.floor(Math.random() * 4000) + 10000;
      mainLoopTimer = setTimeout(triggerOfficeRoutines, nextDelay);
    };

    const initialTimer = setTimeout(triggerOfficeRoutines, 3500);
    activeTimers.push(initialTimer);

    return () => {
      isMounted = false;
      if (mainLoopTimer) clearTimeout(mainLoopTimer);
      activeTimers.forEach((t) => clearTimeout(t));
      activeTimers.length = 0;
    };
  }, [selectedAgent]);

  // PART 1.4: requestAnimationFrame loop that reads getBoundingClientRect() and updates SVG <line> DOM nodes directly
  useEffect(() => {
    let animationFrameId: number;

    const updateTetherLines = () => {
      const svgEl = svgRef.current;
      const mainframeEl = mainframeAnchorRef.current;

      if (svgEl && mainframeEl) {
        const svgRect = svgEl.getBoundingClientRect();
        const mfRect = mainframeEl.getBoundingClientRect();

        const mx = mfRect.left + mfRect.width / 2 - svgRect.left;
        const my = mfRect.top + mfRect.height / 2 - svgRect.top;

        for (let i = 0; i < ALL_AGENT_CODES.length; i++) {
          const code = ALL_AGENT_CODES[i];
          const botEl = botAnchorRefs.current[code];
          const baseLine = baseLineRefs.current[code];
          const pulseLine = pulseLineRefs.current[code];

          if (botEl) {
            const botRect = botEl.getBoundingClientRect();
            const bx = botRect.left + botRect.width / 2 - svgRect.left;
            const by = botRect.top + botRect.height / 2 - svgRect.top;

            const x1Str = bx.toFixed(1);
            const y1Str = by.toFixed(1);
            const x2Str = mx.toFixed(1);
            const y2Str = my.toFixed(1);

            if (baseLine) {
              baseLine.setAttribute('x1', x1Str);
              baseLine.setAttribute('y1', y1Str);
              baseLine.setAttribute('x2', x2Str);
              baseLine.setAttribute('y2', y2Str);
            }
            if (pulseLine) {
              pulseLine.setAttribute('x1', x1Str);
              pulseLine.setAttribute('y1', y1Str);
              pulseLine.setAttribute('x2', x2Str);
              pulseLine.setAttribute('y2', y2Str);
            }
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(updateTetherLines);
    };

    animationFrameId = window.requestAnimationFrame(updateTetherLines);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
        model: 'gemini-3.5-flash',
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

  // Compute usable arena width so bots and workstations never overlap the slide-out chat panel
  const usableArenaWidth = useMemo(() => {
    if (isTerminalOpen && arenaDimensions.width >= 768) {
      return Math.max(420, arenaDimensions.width - TERMINAL_DRAWER_WIDTH);
    }
    return arenaDimensions.width;
  }, [isTerminalOpen, arenaDimensions.width]);

  // Center Mainframe coordinates in pixels (shifts smoothly into open arena area when drawer opens)
  const centerPixelX = (MAINFRAME_COORDS.x / 100) * usableArenaWidth;
  const mainframePixelY = (MAINFRAME_COORDS.y / 100) * arenaDimensions.height;
  // Docked bot stands right in front of the central Mainframe docking pad
  const dockedBotPixelY = Math.min(arenaDimensions.height - 85, mainframePixelY + 56);

  // Helper to clamp bot coordinates safely inside the visible arena
  const clampX = (x: number) => Math.max(68, Math.min(usableArenaWidth - 68, x));
  const clampY = (y: number) => Math.max(82, Math.min(arenaDimensions.height - 78, y));

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

      {/* 3. MAIN ARENA: ISOMETRIC SPACE STATION / OFFICE GAME DECK */}
      <main
        ref={arenaRef}
        className="relative flex-1 w-full h-[calc(100vh-61px)] max-h-[calc(100vh-61px)] overflow-hidden bg-[#02050e]"
      >
        {/* PART 2.1: Isometric Space Station / Office Grid Floor (transform: rotateX(60deg)) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ perspective: '900px' }}
        >
          {/* Deep space radial atmosphere */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a193d]/45 via-[#030714] to-[#010309]" />

          {/* Isometric Floor Plane with rotateX(60deg) */}
          <div
            className="absolute -inset-x-[25%] -top-[15%] -bottom-[35%] origin-center"
            style={{
              transform: 'rotateX(60deg)',
              backgroundImage: `
                linear-gradient(to right, rgba(0, 255, 255, 0.18) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 255, 255, 0.18) 1px, transparent 1px),
                linear-gradient(45deg, rgba(56, 189, 248, 0.06) 1px, transparent 1px),
                linear-gradient(-45deg, rgba(56, 189, 248, 0.06) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px, 48px 48px, 96px 96px, 96px 96px',
              maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 42%, transparent 88%)',
              WebkitMaskImage:
                'radial-gradient(ellipse at center, rgba(0,0,0,1) 42%, transparent 88%)',
            }}
          />

          {/* Subtle Isometric Floor Sector Border Frame */}
          <div
            className="absolute inset-x-[12%] top-[10%] bottom-[6%] border-2 border-cyan-500/15 rounded-3xl"
            style={{
              transform: 'rotateX(60deg)',
              boxShadow: 'inset 0 0 60px rgba(0, 255, 255, 0.07)',
            }}
          />
        </div>

        {/* Top Space Station Telemetry Readout */}
        <div
          className="absolute top-3 left-6 hidden md:flex items-center justify-between text-[10px] text-slate-300 pointer-events-none uppercase tracking-wider z-10 transition-all duration-300"
          style={{ width: `${Math.max(300, usableArenaWidth - 48)}px` }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>STATION ORBIT // ISOMETRIC OFFICE DECK 09</span>
            </span>
            <span className="text-slate-500">•</span>
            <span>9 CORE WORKSTATIONS ONLINE (8 AGENTS + ARBITER)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>CLICK BOT TO DOCK • ESC TO CLOSE</span>
          </div>
        </div>

        {/* Radar Sweep & Concentric Energy Core Behind Mainframe */}
        <motion.div
          animate={{ x: centerPixelX, y: mainframePixelY }}
          transition={{ type: 'spring', stiffness: 50, damping: 15, mass: 1 }}
          style={{ position: 'absolute', left: 0, top: 0 }}
          className="z-0 pointer-events-none"
        >
          <div className="-translate-x-1/2 -translate-y-1/2 relative">
            <div className="w-[260px] h-[260px] rounded-full border border-cyan-500/15 absolute -translate-x-1/2 -translate-y-1/2" />
            <div className="w-[400px] h-[400px] rounded-full border border-cyan-500/10 border-dashed absolute -translate-x-1/2 -translate-y-1/2" />
            <div className="w-[540px] h-[540px] rounded-full border border-cyan-500/5 absolute -translate-x-1/2 -translate-y-1/2" />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              className="w-[460px] h-[460px] rounded-full absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, transparent 275deg, rgba(0, 255, 255, 0.14) 360deg)',
              }}
            />
            <div className="w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl absolute -translate-x-1/2 -translate-y-1/2" />
          </div>
        </motion.div>

        {/* 4. PART 1.4: SVG TETHER LAYER (Updated directly in DOM via requestAnimationFrame + useRef) */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          {ALL_AGENT_CODES.map((code) => {
            const meta = AGENT_REGISTRY[code];
            const isLow = statsMap[code]?.isLowKnowledge;
            const isSelected = selectedAgent === code;

            return (
              <g key={`tether-group-${code}`}>
                {/* Base glowing tether line (coords driven at 60fps by requestAnimationFrame) */}
                <line
                  ref={(el) => {
                    baseLineRefs.current[code] = el;
                  }}
                  x1={centerPixelX}
                  y1={mainframePixelY}
                  x2={centerPixelX}
                  y2={mainframePixelY}
                  stroke={isLow ? '#facc15' : meta.color}
                  strokeWidth={isSelected ? 3.5 : 1.5}
                  strokeOpacity={isSelected ? 0.9 : 0.32}
                  style={{
                    filter: isSelected ? `drop-shadow(0 0 8px ${meta.colorLight})` : undefined,
                  }}
                />

                {/* Animated dashed signal pulse line */}
                <line
                  ref={(el) => {
                    pulseLineRefs.current[code] = el;
                  }}
                  x1={centerPixelX}
                  y1={mainframePixelY}
                  x2={centerPixelX}
                  y2={mainframePixelY}
                  stroke={isSelected ? '#ffffff' : isLow ? '#fef08a' : meta.colorLight}
                  strokeWidth={isSelected ? 2.5 : 1.2}
                  strokeDasharray={isSelected ? '6 10' : '3 14'}
                  strokeLinecap="round"
                  strokeOpacity={isSelected ? 0.95 : 0.55}
                />
              </g>
            );
          })}
        </svg>

        {/* 5. CENTRAL MAINFRAME TERMINAL (CORTEX BRAIN CONNECTION) */}
        <motion.div
          animate={{ x: centerPixelX, y: mainframePixelY }}
          transition={{ type: 'spring', stiffness: 50, damping: 15, mass: 1 }}
          style={{ position: 'absolute', left: 0, top: 0 }}
          className="z-10 pointer-events-auto"
        >
          <div
            ref={mainframeAnchorRef}
            className="-translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
          >
            <div
              className="relative group cursor-pointer"
              onClick={() => {
                if (isTerminalOpen) {
                  handleCloseTerminal();
                } else {
                  setIsTerminalOpen(true);
                }
              }}
            >
              {/* Outer Cyan Cyber Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                className="w-32 h-32 rounded-full border border-dashed border-cyan-500/40 p-2 flex items-center justify-center relative"
                style={{
                  filter: 'drop-shadow(0 0 18px rgba(0, 255, 255, 0.35))',
                }}
              >
                <div className="w-full h-full rounded-full border border-cyan-400/20" />
              </motion.div>

              {/* Mainframe Monitor Screen Box */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-22 h-22 rounded-2xl bg-[#060c1c] border-2 border-cyan-500/60 p-2 shadow-[0_0_25px_rgba(0,255,255,0.4)] flex flex-col items-center justify-between text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

                  <div className="flex items-center justify-between w-full text-[8px] text-cyan-400 font-bold">
                    <span>BUS: 9</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  </div>

                  <div className="flex flex-col items-center">
                    <img
                      src="/cortex-logo-cyan.svg"
                      alt="Cortex Brain"
                      className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(0,255,255,0.7)] animate-pulse"
                    />
                    <span className="text-[9px] font-bold tracking-wider text-white mt-0.5 uppercase">
                      MAINFRAME
                    </span>
                  </div>

                  <span className="text-[7px] text-cyan-400/80 font-mono tracking-tighter">
                    {selectedAgent ? `DOCKED: [${selectedAgent}]` : 'ROOT BUS READY'}
                  </span>
                </div>
              </div>

              {/* Docking Bay Floor Pad */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-28 h-7 rounded-[100%] bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.25)]">
                <span className="text-[7px] font-bold text-cyan-300 tracking-widest uppercase">
                  {selectedAgent ? `PORT [${selectedAgent}] ACTIVE` : 'DOCKING PAD'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 6A. SHARED ISOMETRIC OFFICE WAYPOINT STATIONS (PRINTER, RESEARCH BOARD, COFFEE MACHINE) */}
        {(Object.entries(SHARED_WAYPOINTS) as Array<[Exclude<OfficeWaypointKey, 'desk'>, { x: number; y: number }]>).map(
          ([waypointKey, coords]) => {
            const propX = clampX((coords.x / 100) * usableArenaWidth);
            const propY = clampY((coords.y / 100) * arenaDimensions.height);

            return (
              <motion.div
                key={`office-prop-${waypointKey}`}
                animate={{ x: propX, y: propY - 16 }}
                transition={{ type: 'spring', stiffness: 50, damping: 15, mass: 1 }}
                style={{ position: 'absolute', left: 0, top: 0 }}
                className="z-10 pointer-events-none"
              >
                <div className="-translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <PixelOfficeProp type={waypointKey} />
                </div>
              </motion.div>
            );
          }
        )}

        {/* 6B. PART 2.1: PIXEL WORKSTATION DESKS AT EACH BOT'S BASE POSITION */}
        {ALL_AGENT_CODES.map((code) => {
          const station = STATION_COORDINATES[code];
          const meta = AGENT_REGISTRY[code];
          const stat = statsMap[code];
          const isLow = stat.isLowKnowledge;

          const baseX = clampX((station.x / 100) * usableArenaWidth);
          const baseY = clampY((station.y / 100) * arenaDimensions.height);

          return (
            <motion.div
              key={`workstation-${code}`}
              animate={{ x: baseX, y: baseY - 18 }}
              transition={{ type: 'spring', stiffness: 50, damping: 15, mass: 1 }}
              style={{ position: 'absolute', left: 0, top: 0 }}
              className="z-10 pointer-events-auto cursor-pointer group"
              onClick={() => handleSelectBot(code)}
            >
              <div className="-translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <PixelWorkstation
                  code={code}
                  color={meta.color}
                  colorLight={meta.colorLight}
                  isLowKnowledge={isLow}
                />
              </div>
            </motion.div>
          );
        })}

        {/* 7. PERSISTENT LIVING BOTS WITH OFFICE ROUTINE WAYPOINTS, SPRING PHYSICS & SPEECH BUBBLES */}
        {ALL_AGENT_CODES.map((code, idx) => {
          const station = STATION_COORDINATES[code];
          const meta = AGENT_REGISTRY[code];
          const stat = statsMap[code];
          const routine = botRoutines[code];
          const isSelected = selectedAgent === code;
          const isLow = stat.isLowKnowledge;
          const isProcessing = isSelected && isChatLoading;

          // Base home desk coordinates in pixels
          const baseX = clampX((station.x / 100) * usableArenaWidth);
          const baseY = clampY((station.y / 100) * arenaDimensions.height);

          // Resolve waypoint coordinates if the bot is on an office routine errand (printer, research_board, coffee_machine)
          const waypointCoords =
            routine?.waypoint && routine.waypoint !== 'desk'
              ? SHARED_WAYPOINTS[routine.waypoint]
              : null;

          const targetRoutineX = waypointCoords
            ? clampX((waypointCoords.x / 100) * usableArenaWidth)
            : clampX(baseX + (wanderOffsets[code]?.x || 0));

          const targetRoutineY = waypointCoords
            ? clampY((waypointCoords.y / 100) * arenaDimensions.height + 12)
            : clampY(baseY + (wanderOffsets[code]?.y || 0));

          // Current target X & Y:
          // - If selected: glide to Central Mainframe docking position
          // - If unselected: glide to current routine waypoint (desk, printer, research_board, or coffee_machine)
          const currentX = isSelected ? centerPixelX : targetRoutineX;
          const currentY = isSelected ? dockedBotPixelY : targetRoutineY;

          // Speech bubble text:
          // - When selected & answering: "Processing..." with animated dots
          // - When executing office routine or working at desk: routine.bubbleText
          const idleBubbleText = !isSelected ? routine?.bubbleText : null;

          return (
            <motion.div
              key={code}
              animate={{
                x: currentX,
                y: currentY,
              }}
              transition={{
                type: 'spring',
                stiffness: 42,
                damping: 15,
                mass: 1,
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
              }}
              className="z-20 pointer-events-auto cursor-pointer"
              onClick={() => handleSelectBot(code)}
              onMouseEnter={() => setHoveredBotCode(code)}
              onMouseLeave={() => setHoveredBotCode(null)}
            >
              {/* Inner centering wrapper so Framer Motion exclusively owns outer transform */}
              <div
                ref={(el) => {
                  botAnchorRefs.current[code] = el;
                }}
                className="-translate-x-1/2 -translate-y-1/2 relative flex flex-col items-center"
              >
                {/* Pixel Speech Bubble */}
                <SpeechBubble
                  text={idleBubbleText}
                  isProcessing={isProcessing}
                  accentColor={meta.colorLight}
                />

                {/* PixelBot Sprite */}
                <PixelBot
                  code={code}
                  size={isSelected ? 68 : 56}
                  knowledge={stat.percentage}
                  health={stat.health}
                  isSelected={isSelected}
                  isHovered={hoveredBotCode === code}
                  isWalking={!isSelected && Boolean(routine?.isWalking)}
                  isLowKnowledgeOverride={isLow}
                  bobDelay={idx}
                  showNameTag={true}
                  showStats={true}
                  showHealthBar={true}
                />
              </div>
            </motion.div>
          );
        })}

        {/* Quick HUD Guide Tip (Bottom Left Corner) */}
        <div className="absolute bottom-4 left-6 hidden md:flex flex-col gap-1 text-[11px] font-mono text-zinc-400 bg-black/65 backdrop-blur-md p-3 rounded-xl border border-zinc-800 z-20 pointer-events-none">
          <span className="text-cyan-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ISOMETRIC SPACE STATION HQ:</span>
          </span>
          <span>• Click any Bot or Workstation Desk to dock &amp; chat</span>
          <span>• Press Esc or click [X] to undock &amp; glide back to desk</span>
        </div>

        {/* PART 1.1: Floating "Open Terminal" Button — Hidden when terminal is already open */}
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
            className="fixed top-[61px] right-0 bottom-0 w-full sm:w-[480px] bg-[#070d1d]/95 backdrop-blur-xl border-l border-cyan-500/30 flex flex-col z-40 shadow-[-12px_0_35px_rgba(0,0,0,0.85)] max-h-[calc(100vh-61px)] overflow-hidden"
          >
            {/* PART 1.1: Sleek Top-Right "X" Close Button (Always accessible in both Docked & Standby states) */}
            <div className="p-4 border-b border-cyan-500/25 bg-[#091126] flex items-center justify-between shrink-0">
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
                      <h2 className="text-sm font-bold text-white tracking-wide truncate">
                        {activeBotMeta.name}
                      </h2>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border shrink-0 ${activeBotMeta.badgeBg}`}>
                        {activeBotMeta.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {activeBotMeta.role} • {activeBotMeta.invariants.split(':')[0]}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-wide">
                      MAINFRAME TERMINAL
                    </h2>
                    <p className="text-[10px] text-zinc-400">
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
                className="p-2 rounded-lg bg-zinc-800/90 hover:bg-red-500/20 text-zinc-300 hover:text-red-300 border border-zinc-700 hover:border-red-500/40 transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedAgent && activeBotMeta ? (
              // Active Docked Bot Terminal Body
              <div className="flex-1 flex flex-col h-full max-h-full overflow-hidden">
                {/* Bot Vital Telemetry Bar */}
                <div className="px-4 py-2 bg-black/40 border-b border-zinc-800 flex items-center justify-between gap-2 text-[11px] font-mono text-zinc-400 shrink-0 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span>Knowledge:</span>
                    <span
                      className={`font-bold ${
                        statsMap[selectedAgent].isLowKnowledge
                          ? 'text-yellow-400 animate-pulse'
                          : 'text-cyan-400'
                      }`}
                    >
                      {statsMap[selectedAgent].percentage}%
                    </span>
                    <span>•</span>
                    <span>Health:</span>
                    <span className="text-emerald-400 font-bold">
                      {statsMap[selectedAgent].health}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <VoiceModeBadge />
                  </div>
                </div>

                {/* Quick Invariant Prompt Shortcuts */}
                <div className="px-4 py-2 bg-[#081022] border-b border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSendChat(activeBotMeta.samplePrompt)}
                    className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer shrink-0"
                  >
                    ⚡ {activeBotMeta.samplePrompt.slice(0, 36)}...
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSendChat(`List your top invariants and explain why they must not be violated.`)
                    }
                    className="px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer shrink-0"
                  >
                    📜 Core Invariants
                  </button>
                  <button
                    type="button"
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
                  {(chatMessages[selectedAgent] || []).map((msg) => (
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
                          <div className="text-[10px] text-gray-500 font-mono mt-2 border-t border-black/10 dark:border-white/10 pt-1.5 flex items-center justify-between gap-2">
                            <span>
                              [via {msg.provider ? msg.provider.toUpperCase() : 'GOOGLE'} • {msg.model || 'gemini-3.5-flash'}]
                            </span>
                            <VoiceTTSButton text={msg.text} />
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
                      placeholder={`Query ${activeBotMeta.name} (contextNode: ${selectedAgent})...`}
                      disabled={isChatLoading}
                      className="flex-1 h-10 px-3 rounded-lg bg-black/60 border border-zinc-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs font-mono text-white placeholder-zinc-500 outline-none transition-all"
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
                      className="h-10 px-3.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-black font-bold text-xs transition-all flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              // Standby View when Drawer is opened without a selected bot
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                  <Terminal className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-white tracking-wider mb-2">
                  TERMINAL STANDBY // SELECT AGENT
                </h3>
                <p className="text-xs text-slate-200 max-w-xs leading-relaxed mb-6 font-mono">
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
