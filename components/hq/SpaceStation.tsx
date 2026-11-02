'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import PixelBot, { AGENT_REGISTRY, type AgentCode } from '../PixelBot';
import SpeechBubble, { WORKING_SPEECH_OPTIONS } from '../SpeechBubble';

/* ────────────────────────────────────────────────────────────────────────────
 * 2D SPACE STATION LAYOUT (PANORAMIC / LANDSCAPED COMMAND DECK)
 *
 * Expands edge-to-edge across the viewport width with zero letterboxing:
 *   - Back wall (y: 0 -> FLOOR_TOP): Reactor core centered, server rack on right
 *   - TRON Deck (y: FLOOR_TOP -> stageH): Full-bleed perspective grid
 *   - Wings: Research Board on far left wing, High-Throughput Printer on far right wing
 *   - Center Deck: Arbiter Bench apex + Row A & Row B Engineering Desks
 *
 * Deterministic errand state machine moves bots along orthogonal walkway corridors.
 * ──────────────────────────────────────────────────────────────────────────── */

const DESK_W = 110;
const DESK_H = 44;
const WALK_SPEED = 140; // px/sec
const INTERACT_MS = 3600;

const AGENT_ORDER: AgentCode[] = ['PM', 'UX', 'GR', 'SD', 'IR', 'DB', 'SEC', 'RS', 'ARB'];
const WALKERS: AgentCode[] = ['PM', 'UX', 'GR', 'SD', 'IR', 'DB', 'SEC', 'RS'];

interface Seat {
  x: number;
  deskTop: number;
  seatY: number;
  backY: number;
  col: number;
}

type Dest = 'printer' | 'research_board';

interface Pt {
  x: number;
  y: number;
}

interface Anim {
  x: number | number[];
  y: number | number[];
  times?: number[];
  duration: number;
}

function pathToAnim(path: Pt[]): Anim {
  const dists = [0];
  for (let i = 1; i < path.length; i++) {
    dists.push(dists[i - 1] + Math.abs(path[i].x - path[i - 1].x) + Math.abs(path[i].y - path[i - 1].y));
  }
  const total = dists[dists.length - 1] || 1;
  return {
    x: path.map((p) => p.x),
    y: path.map((p) => p.y),
    times: dists.map((d) => d / total),
    duration: Math.max(0.6, total / WALK_SPEED),
  };
}

const restAnim = (x: number, y: number): Anim => ({ x, y, duration: 0.15 });

type Phase = 'seated' | 'out' | 'interact' | 'back';

interface BotState {
  phase: Phase;
  dest: Dest | null;
  bubble: string | null;
  anim: Anim;
}

const INITIAL_BUBBLES: Partial<Record<AgentCode, string>> = {
  PM: 'Planning...',
  DB: 'Indexing...',
  SEC: 'Scanning...',
  ARB: 'Adjudicating...',
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export interface StationAgentStats {
  percentage: number;
  health: number;
  isLowKnowledge: boolean;
}

export interface SpaceStationProps {
  statsMap: Record<AgentCode, StationAgentStats>;
  selectedAgent: AgentCode | null;
  isChatLoading: boolean;
  isTerminalOpen: boolean;
  drawerWidth: number;
  onSelectBot: (code: AgentCode) => void;
  onToggleTerminal: () => void;
}

/* ───────────────────────────── Furniture ───────────────────────────── */

function Desk({
  code,
  x,
  top,
  width = DESK_W,
  height = DESK_H,
  color,
  percentage,
  isLow,
  isSelected,
  isWorking,
  label,
  onClick,
}: {
  code: AgentCode;
  x: number;
  top: number;
  width?: number;
  height?: number;
  color: string;
  percentage: number;
  isLow: boolean;
  isSelected: boolean;
  isWorking: boolean;
  label?: string;
  onClick: () => void;
}) {
  const accent = isLow ? '#facc15' : color;
  return (
    <div
      className="absolute z-10 cursor-pointer group"
      style={{ left: x - width / 2, top, width, height }}
      onClick={onClick}
    >
      {/* Holo-monitor perched on the desk's far corner */}
      <div
        className="absolute right-0 bottom-full mb-[2px] w-[26px] h-[20px] rounded-sm border bg-[#040816] overflow-hidden"
        style={{ borderColor: `${accent}aa`, boxShadow: `0 0 8px ${accent}55` }}
      >
        <div className="p-[3px] space-y-[3px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-[2px] rounded-full"
              style={{ backgroundColor: accent }}
              animate={isWorking ? { width: ['25%', '90%', '45%', '75%'] } : { width: '30%' }}
              transition={
                isWorking
                  ? { duration: 1.6 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }
                  : { duration: 0.2 }
              }
            />
          ))}
        </div>
      </div>

      {/* Desk body */}
      <div
        className="absolute inset-0 rounded-md border bg-gradient-to-b from-[#0b1430] to-[#050914] transition-shadow"
        style={{
          borderColor: isSelected ? '#ffffff' : `${accent}b3`,
          boxShadow: isSelected
            ? `0 0 18px ${accent}, inset 0 0 12px ${accent}33`
            : `0 0 12px ${accent}33, inset 0 0 10px ${accent}14`,
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[3px] rounded-t-md"
          style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
        />
        {/* Keyboard strip */}
        <div className="absolute inset-x-3 top-[9px] flex gap-[2px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="h-[4px] flex-1 rounded-[1px]"
              style={{ backgroundColor: accent }}
              animate={isWorking ? { opacity: [0.25, 0.95, 0.25] } : { opacity: 0.25 }}
              transition={
                isWorking
                  ? { duration: 0.5 + ((i * 7) % 5) * 0.12, repeat: Infinity, delay: (i % 4) * 0.09 }
                  : { duration: 0.2 }
              }
            />
          ))}
        </div>

        {/* Desk front plate & live knowledge gauge */}
        <div className="absolute inset-x-2 bottom-1.5 flex items-center justify-between text-[8px] font-mono">
          <span className="tracking-wider text-slate-300 font-bold uppercase truncate max-w-[70px]">
            {label ?? `TERM // ${code}`}
          </span>
          <span className="font-bold" style={{ color: accent }}>
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

function ResearchBoard({ left, top, active }: { left: number; top: number; active: boolean }) {
  const cards = ['#a855f7', '#38bdf8', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
  return (
    <div
      className="absolute z-10 pointer-events-none"
      style={{ left, top, width: 144, height: 168 }}
    >
      <div
        className="absolute inset-0 rounded-xl border bg-gradient-to-b from-[#130b2e] to-[#070414] p-2"
        style={{
          borderColor: 'rgba(168,85,247,0.75)',
          boxShadow: active
            ? '0 0 28px rgba(168,85,247,0.6), inset 0 0 18px rgba(168,85,247,0.2)'
            : '0 0 14px rgba(168,85,247,0.35), inset 0 0 10px rgba(168,85,247,0.1)',
          transition: 'box-shadow .4s ease',
        }}
      >
        <div className="flex items-center justify-between border-b border-purple-400/30 pb-1">
          <span className="text-[8px] font-mono font-bold tracking-widest text-purple-200 uppercase">
            Research Board
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              className="h-[32px] rounded border border-purple-400/20 bg-[#090518] p-1"
              animate={{ opacity: active ? [0.7, 1, 0.7] : 0.85 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }}
            >
              <div className="h-[3px]" style={{ backgroundColor: c }} />
              <div className="mt-1 mx-0.5 h-[2px] rounded-full bg-white/30" />
              <div className="mt-1 mx-0.5 h-[2px] w-2/3 rounded-full bg-white/20" />
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-x-2.5 bottom-2 flex items-center gap-1 text-[7px] font-mono text-purple-300/70">
          <span className="uppercase tracking-widest">{active ? 'indexing sources' : 'idle'}</span>
        </div>
        {active && (
          <motion.div
            className="absolute inset-x-0 h-[2px] bg-purple-300/80"
            style={{ boxShadow: '0 0 10px rgba(216,180,254,0.9)' }}
            animate={{ top: ['8%', '96%', '8%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>
      <div className="absolute bottom-0 left-8 w-2 h-6 rounded-b bg-slate-700" />
      <div className="absolute bottom-0 right-8 w-2 h-6 rounded-b bg-slate-700" />
      <div className="absolute bottom-0 left-5 right-5 h-[3px] rounded-full bg-purple-500/40" />
    </div>
  );
}

function Printer({ left, top, active }: { left: number; top: number; active: boolean }) {
  return (
    <div
      className="absolute z-10 pointer-events-none"
      style={{ left, top, width: 130, height: 88 }}
    >
      {/* Paper sheet slides out of top slot */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-[58px] h-[28px] rounded-t-sm bg-slate-100 border border-slate-300/80"
        style={{ top: 12 }}
        animate={active ? { y: [0, -22, -22, 0] } : { y: 0 }}
        transition={active ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      >
        <div className="mt-1.5 mx-1.5 h-[2px] bg-slate-400/70" />
        <div className="mt-1 mx-1.5 h-[2px] w-2/3 bg-slate-400/50" />
      </motion.div>

      <div
        className="absolute inset-x-0 bottom-0 h-[66px] rounded-lg border bg-gradient-to-b from-[#0b1430] to-[#050914]"
        style={{
          borderColor: 'rgba(34,211,238,0.75)',
          boxShadow: active
            ? '0 0 24px rgba(34,211,238,0.55), inset 0 0 16px rgba(34,211,238,0.2)'
            : '0 0 12px rgba(34,211,238,0.28), inset 0 0 10px rgba(34,211,238,0.1)',
          transition: 'box-shadow .4s ease',
        }}
      >
        <div className="mx-auto mt-2 h-[4px] w-[72%] rounded-full bg-black border border-cyan-400/30" />
        <div className="mx-3 mt-2 h-[16px] rounded-sm bg-[#030818] border border-cyan-400/25 flex items-center justify-between px-1.5 text-[7px] font-mono tracking-wider">
          <span className="text-cyan-300 uppercase">{active ? 'printing...' : 'ready'}</span>
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: active ? [1, 0.2, 1] : 1 }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        </div>
        <div className="absolute left-3 bottom-1.5 text-[8px] font-mono font-bold tracking-widest text-slate-300 uppercase">
          Printer // 01
        </div>
      </div>
    </div>
  );
}

function ServerRack({ left, top }: { left: number; top: number }) {
  return (
    <div
      className="absolute z-[4] pointer-events-none rounded-md border bg-gradient-to-b from-[#0e0a26] to-[#060414] p-1.5 flex flex-col gap-1"
      style={{
        left,
        top,
        width: 76,
        height: 148,
        borderColor: 'rgba(168,85,247,0.7)',
        boxShadow: '0 0 20px rgba(168,85,247,0.3), inset 0 0 14px rgba(168,85,247,0.12)',
      }}
    >
      {[0, 1, 2, 3, 4].map((u) => (
        <div
          key={u}
          className="flex-1 rounded-[3px] border border-purple-400/25 bg-[#0a0720] px-1.5 flex items-center justify-between"
        >
          <div className="flex gap-[3px]">
            {[0, 1, 2].map((l) => (
              <motion.span
                key={l}
                className="w-[3px] h-[3px] rounded-full"
                style={{ backgroundColor: l === 2 ? '#a78bfa' : l === 1 ? '#22d3ee' : '#34d399' }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 0.9 + ((u * 3 + l) % 4) * 0.3, repeat: Infinity, delay: (u + l) * 0.17 }}
              />
            ))}
          </div>
          <div className="space-y-[2px]">
            <div className="h-[1px] w-5 bg-purple-300/30" />
            <div className="h-[1px] w-5 bg-purple-300/30" />
          </div>
        </div>
      ))}
      <div className="text-center text-[7px] font-mono tracking-widest text-purple-300/70 uppercase pt-0.5">
        SRV-RACK 01
      </div>
    </div>
  );
}

function Reactor({
  left,
  top,
  dockedCode,
  isProcessing,
  onClick,
}: {
  left: number;
  top: number;
  dockedCode: AgentCode | null;
  isProcessing: boolean;
  onClick: () => void;
}) {
  const calm = [
    'inset 0 0 50px rgba(34,211,238,0.26), inset 0 -24px 40px rgba(34,211,238,0.1), 0 0 22px rgba(34,211,238,0.25)',
    'inset 0 0 64px rgba(34,211,238,0.4), inset 0 -24px 40px rgba(34,211,238,0.16), 0 0 48px rgba(34,211,238,0.5)',
    'inset 0 0 50px rgba(34,211,238,0.26), inset 0 -24px 40px rgba(34,211,238,0.1), 0 0 22px rgba(34,211,238,0.25)',
  ];
  return (
    <div className="absolute z-[5]" style={{ left, top, width: 300, height: 164 }}>
      {/* Glass containment chamber */}
      <motion.div
        onClick={onClick}
        className="absolute inset-0 cursor-pointer overflow-hidden"
        style={{
          borderRadius: '150px 150px 14px 14px',
          border: '2px solid rgba(34,211,238,0.7)',
          background:
            'linear-gradient(180deg, rgba(34,211,238,0.16) 0%, rgba(14,116,144,0.06) 55%, rgba(34,211,238,0.12) 100%)',
        }}
        animate={{ boxShadow: calm }}
        transition={{ duration: isProcessing ? 1.1 : 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Rotating containment rings */}
        <div className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[132px] h-[132px] rounded-full border border-dashed border-cyan-300/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full border border-cyan-400/35"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
          {/* Core */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[68px] h-[68px] rounded-full flex items-center justify-center"
            style={{
              background:
                'radial-gradient(circle, rgba(165,243,252,0.95) 0%, rgba(34,211,238,0.55) 45%, rgba(8,47,73,0.2) 100%)',
            }}
            animate={{ scale: isProcessing ? [1, 1.14, 1] : [1, 1.06, 1] }}
            transition={{ duration: isProcessing ? 0.9 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cortex-logo-cyan.svg"
              alt="Cortex Brain"
              className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]"
            />
          </motion.div>
        </div>

        <div className="absolute inset-x-0 top-[14px] text-center">
          <div className="text-[10px] font-mono font-bold tracking-[0.28em] text-cyan-200 uppercase">
            Cortex Mainframe
          </div>
          <div className="text-[8px] font-mono tracking-widest text-cyan-400/80 mt-0.5 uppercase">
            {dockedCode ? `Docked: [${dockedCode}]` : 'Root bus ready'}
          </div>
        </div>

        {/* Glass reflections */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.14) 0%, transparent 32%)' }}
        />
        <div className="absolute left-[14%] top-[10%] w-[3px] h-[46%] rounded-full bg-white/20 rotate-[18deg] pointer-events-none" />
      </motion.div>

      {/* Reactor plinth */}
      <div
        className="absolute -left-5 -right-5 -bottom-[18px] h-[20px] rounded-md border border-cyan-400/55 bg-gradient-to-b from-[#0a1a3a] to-[#040a1a] flex items-center justify-between px-3"
        style={{ boxShadow: '0 0 16px rgba(34,211,238,0.3)' }}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cyan-300"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }}
            />
          ))}
        </div>
        <span className="text-[7px] font-mono tracking-[0.3em] text-cyan-300/80 uppercase">Reactor Base</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cyan-300"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.75 - i * 0.25 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FloorPad({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <div
      className="absolute rounded-[100%] pointer-events-none z-[2]"
      style={{
        left: x - 40,
        top: y - 8,
        width: 80,
        height: 18,
        border: `1px solid ${color}88`,
        background: `radial-gradient(ellipse, ${color}33 0%, transparent 70%)`,
        boxShadow: `0 0 14px ${color}44`,
      }}
    />
  );
}

/* ───────────────────────────── Station ───────────────────────────── */

export default function SpaceStation({
  statsMap,
  selectedAgent,
  isChatLoading,
  isTerminalOpen,
  drawerWidth,
  onSelectBot,
  onToggleTerminal,
}: SpaceStationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1400, h: 720 });
  const [hovered, setHovered] = useState<AgentCode | null>(null);
  const selectedRef = useRef<AgentCode | null>(selectedAgent);

  useEffect(() => {
    selectedRef.current = selectedAgent;
  }, [selectedAgent]);

  // Measure viewport size cleanly
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute wide landscaped stage geometry
  const usableW = Math.max(1060, size.w - (isTerminalOpen && size.w >= 768 ? drawerWidth : 0));
  const stageW = usableW;
  const stageH = Math.max(560, size.h);
  const floorTop = Math.min(200, Math.max(150, Math.round(stageH * 0.26)));
  const floorH = stageH - floorTop;
  const planeH = Math.max(500, Math.round(floorH * 1.35));
  const centerX = Math.round(stageW / 2);

  // Dynamic horizontal spread for command desks across the landscape
  const colSpacing = Math.min(220, Math.max(140, Math.round((stageW - 540) / 4)));
  const deskXs = useMemo(
    () => [
      centerX - 1.5 * colSpacing,
      centerX - 0.5 * colSpacing,
      centerX + 0.5 * colSpacing,
      centerX + 1.5 * colSpacing,
    ],
    [centerX, colSpacing]
  );

  const gapXs = useMemo(
    () => [
      centerX - 2 * colSpacing,
      centerX - colSpacing,
      centerX,
      centerX + colSpacing,
      centerX + 2 * colSpacing,
    ],
    [centerX, colSpacing]
  );

  const rowA_top = floorTop + Math.min(150, Math.max(90, Math.round(floorH * 0.32)));
  const rowB_top = floorTop + Math.min(320, Math.max(200, Math.round(floorH * 0.68)));
  const arbiterTop = floorTop + Math.min(48, Math.max(24, Math.round(floorH * 0.08)));
  const laneY = Math.round((rowA_top + 12 + rowB_top - 12) / 2);

  const seats: Record<AgentCode, Seat> = useMemo(
    () => ({
      RS: { x: deskXs[0], deskTop: rowA_top, seatY: rowA_top + 12, backY: rowA_top - 14, col: 0 },
      PM: { x: deskXs[1], deskTop: rowA_top, seatY: rowA_top + 12, backY: rowA_top - 14, col: 1 },
      UX: { x: deskXs[2], deskTop: rowA_top, seatY: rowA_top + 12, backY: rowA_top - 14, col: 2 },
      GR: { x: deskXs[3], deskTop: rowA_top, seatY: rowA_top + 12, backY: rowA_top - 14, col: 3 },

      DB: { x: deskXs[0], deskTop: rowB_top, seatY: rowB_top + 12, backY: rowB_top - 14, col: 0 },
      SD: { x: deskXs[1], deskTop: rowB_top, seatY: rowB_top + 12, backY: rowB_top - 14, col: 1 },
      IR: { x: deskXs[2], deskTop: rowB_top, seatY: rowB_top + 12, backY: rowB_top - 14, col: 2 },
      SEC: { x: deskXs[3], deskTop: rowB_top, seatY: rowB_top + 12, backY: rowB_top - 14, col: 3 },

      ARB: { x: centerX, deskTop: arbiterTop, seatY: arbiterTop + 14, backY: arbiterTop + 14, col: 0 },
    }),
    [deskXs, rowA_top, rowB_top, arbiterTop, centerX]
  );

  // Wings positioning
  const boardLeft = Math.max(28, centerX - 2 * colSpacing - 190);
  const boardDestX = boardLeft + 72;
  const printerLeft = Math.min(stageW - 165, centerX + 2 * colSpacing + 55);
  const printerDestX = printerLeft + 65;
  const serverRackLeft = Math.min(stageW - 100, Math.max(printerLeft + 25, stageW - 120));

  const dests: Record<Dest, { x: number; y: number; bubble: string }> = useMemo(
    () => ({
      research_board: { x: boardDestX, y: laneY + 16, bubble: '📄 Reading docs...' },
      printer: { x: printerDestX, y: laneY + 18, bubble: '🖨️ Printing report...' },
    }),
    [boardDestX, printerDestX, laneY]
  );

  const [bots, setBots] = useState<Record<AgentCode, BotState>>(() => {
    const out = {} as Record<AgentCode, BotState>;
    for (const code of AGENT_ORDER) {
      out[code] = {
        phase: 'seated',
        dest: null,
        bubble: INITIAL_BUBBLES[code] ?? null,
        anim: { x: 0, y: 0, duration: 0 },
      };
    }
    return out;
  });

  // Keep seated bots locked to their dynamic desk positions
  useEffect(() => {
    setBots((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const code of AGENT_ORDER) {
        if (next[code].phase === 'seated') {
          const s = seats[code];
          if (next[code].anim.x !== s.x || next[code].anim.y !== s.seatY) {
            next[code] = {
              ...next[code],
              anim: { x: s.x, y: s.seatY, duration: 0.2 },
            };
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [seats]);

  // STATE MACHINE: Working -> Walking -> Interacting -> Returning
  useEffect(() => {
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const busy = new Set<AgentCode>();
    const later = (fn: () => void, ms: number) => {
      timers.push(
        setTimeout(() => {
          if (alive) fn();
        }, ms)
      );
    };

    const runErrand = () => {
      later(runErrand, 11000 + Math.random() * 5000);

      const pool = WALKERS.filter((c) => c !== selectedRef.current && !busy.has(c));
      if (pool.length === 0) return;
      const code = pick(pool);
      const dest: Dest = Math.random() < 0.5 ? 'printer' : 'research_board';
      const seat = seats[code];
      const d = dests[dest];
      const gapX = d.x < seat.x ? gapXs[seat.col] : gapXs[seat.col + 1];

      const outPath: Pt[] = [
        { x: seat.x, y: seat.seatY },
        { x: seat.x, y: seat.backY },
        { x: gapX, y: seat.backY },
        { x: gapX, y: laneY },
        { x: d.x, y: laneY },
        { x: d.x, y: d.y },
      ];

      const outAnim = pathToAnim(outPath);
      const backAnim = pathToAnim([...outPath].reverse());
      busy.add(code);

      // STATE 2: Walking out
      setBots((p) => ({ ...p, [code]: { phase: 'out', dest, bubble: null, anim: outAnim } }));

      later(() => {
        // STATE 3: Interacting
        setBots((p) => ({
          ...p,
          [code]: { phase: 'interact', dest, bubble: d.bubble, anim: restAnim(d.x, d.y) },
        }));

        later(() => {
          // STATE 4: Returning
          setBots((p) => ({ ...p, [code]: { phase: 'back', dest, bubble: null, anim: backAnim } }));

          later(() => {
            // STATE 1: Seated & working
            setBots((p) => ({
              ...p,
              [code]: {
                phase: 'seated',
                dest: null,
                bubble: pick(WORKING_SPEECH_OPTIONS[code]),
                anim: restAnim(seat.x, seat.seatY),
              },
            }));
            busy.delete(code);
          }, outAnim.duration * 1000);
        }, INTERACT_MS);
      }, outAnim.duration * 1000);
    };

    later(runErrand, 3500);
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [seats, dests, gapXs, laneY]);

  // Working chatter rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setBots((prev) => {
        const next = { ...prev };
        const seated = AGENT_ORDER.filter((c) => prev[c].phase === 'seated');
        seated.forEach((c) => {
          if (prev[c].bubble) next[c] = { ...prev[c], bubble: null };
        });
        const talkers = [...seated].sort(() => 0.5 - Math.random()).slice(0, 3);
        talkers.forEach((c) => {
          next[c] = { ...next[c], bubble: pick(WORKING_SPEECH_OPTIONS[c]) };
        });
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const printerActive = AGENT_ORDER.some((c) => bots[c].phase === 'interact' && bots[c].dest === 'printer');
  const boardActive = AGENT_ORDER.some((c) => bots[c].phase === 'interact' && bots[c].dest === 'research_board');

  const deskProps = (code: AgentCode) => {
    const meta = AGENT_REGISTRY[code];
    const stat = statsMap[code];
    return {
      code,
      color: meta.color,
      percentage: stat.percentage,
      isLow: stat.isLowKnowledge,
      isSelected: selectedAgent === code,
      isWorking: bots[code].phase === 'seated',
      onClick: () => onSelectBot(code),
    };
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-x-auto overflow-y-hidden select-none bg-[#02040b]"
      style={{
        backgroundImage: [
          'radial-gradient(ellipse at 50% 0%, rgba(14,40,96,0.65) 0%, rgba(2,4,11,0) 65%)',
          'radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.6), transparent)',
          'radial-gradient(1px 1px at 38% 42%, rgba(165,243,252,0.5), transparent)',
          'radial-gradient(1.5px 1.5px at 66% 24%, rgba(255,255,255,0.55), transparent)',
          'radial-gradient(1px 1px at 84% 60%, rgba(196,181,253,0.5), transparent)',
          'radial-gradient(1px 1px at 52% 82%, rgba(255,255,255,0.45), transparent)',
        ].join(','),
        backgroundSize: '100% 100%, 320px 240px, 320px 240px, 320px 240px, 320px 240px, 320px 240px',
      }}
    >
      {/* Dynamic Landscaped Deck Stage (Full Bleed) */}
      <div
        className="relative h-full"
        style={{
          width: stageW,
          minWidth: '100%',
          transition: 'width .35s ease',
        }}
      >
        {/* ── BACK WALL (Full width) ── */}
        <div
          className="absolute left-0 right-0 top-0 pointer-events-none"
          style={{
            height: floorTop,
            background:
              'linear-gradient(180deg, rgba(5,10,28,0.55) 0%, rgba(6,14,36,0.92) 100%), repeating-linear-gradient(90deg, rgba(34,211,238,0.05) 0 1px, transparent 1px 100px)',
          }}
        />

        {/* Orbit Title HUD */}
        <div className="absolute left-8 top-7 pointer-events-none z-10">
          <div className="text-[11px] font-mono font-bold tracking-[0.25em] text-cyan-300 uppercase">
            Station Orbit // Deck 09
          </div>
          <div className="mt-1 text-[8px] font-mono tracking-widest text-slate-400 uppercase">
            9 stations online · 8 agents + arbiter
          </div>
          <div className="mt-2 text-[8px] font-mono tracking-widest text-slate-500 uppercase">
            Click a bot or desk to dock · Esc to undock
          </div>
        </div>

        {/* Reactor Core (Centered) */}
        <Reactor
          left={centerX - 150}
          top={Math.max(6, floorTop - 190)}
          dockedCode={selectedAgent}
          isProcessing={isChatLoading && selectedAgent !== null}
          onClick={onToggleTerminal}
        />

        {/* Server Rack (Right Wing Wall) */}
        <ServerRack left={serverRackLeft} top={Math.max(12, floorTop - 165)} />

        {/* ── COMMAND DECK (TRON perspective floor - 100% full width) ── */}
        <div
          className="absolute left-0 right-0 overflow-hidden pointer-events-none"
          style={{
            top: floorTop,
            height: floorH,
            perspective: '850px',
            perspectiveOrigin: '50% 0%',
            maskImage: 'linear-gradient(to bottom, transparent 0%, #000 20%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 20%)',
          }}
        >
          <div
            className="absolute left-0 top-0 w-full"
            style={{
              height: planeH,
              transform: 'rotateX(62deg)',
              transformOrigin: '50% 0%',
              backgroundColor: '#030816',
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: [
                  'linear-gradient(to right, rgba(34,211,238,0.42) 1.5px, transparent 1.5px)',
                  'linear-gradient(to bottom, rgba(34,211,238,0.42) 1.5px, transparent 1.5px)',
                  'linear-gradient(to right, rgba(168,85,247,0.12) 1px, transparent 1px)',
                ].join(','),
                backgroundSize: '62px 62px, 62px 62px, 15.5px 62px',
              }}
              animate={{ backgroundPositionY: ['0px', '62px'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Horizon glowing laser line */}
        <div
          className="absolute left-0 right-0 h-[2px] pointer-events-none"
          style={{
            top: floorTop,
            background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.85), transparent)',
            boxShadow: '0 0 16px rgba(34,211,238,0.75)',
          }}
        />

        {/* Interaction contact pads */}
        <FloorPad x={dests.research_board.x} y={dests.research_board.y} color="#a855f7" />
        <FloorPad x={dests.printer.x} y={dests.printer.y} color="#22d3ee" />

        {/* ── WORKSTATIONS (Wings + Center Deck) ── */}
        <ResearchBoard left={boardLeft} top={laneY - 84} active={boardActive} />
        <Printer left={printerLeft} top={laneY - 42} active={printerActive} />

        <Desk
          {...deskProps('ARB')}
          x={seats.ARB.x}
          top={seats.ARB.deskTop}
          width={100}
          height={36}
          label="ARBITER BENCH"
        />
        {WALKERS.map((code) => (
          <Desk key={`desk-${code}`} {...deskProps(code)} x={seats[code].x} top={seats[code].deskTop} />
        ))}

        {/* ── THE WORKERS (Pixel Bots anchored at desks or on errands) ── */}
        {AGENT_ORDER.map((code, idx) => {
          const meta = AGENT_REGISTRY[code];
          const stat = statsMap[code];
          const st = bots[code];
          const isSelected = selectedAgent === code;
          const walking = st.phase === 'out' || st.phase === 'back';
          const zIndex = walking ? 30 : st.phase === 'interact' ? 20 : 9;

          return (
            <motion.div
              key={code}
              initial={false}
              animate={{ x: st.anim.x, y: st.anim.y }}
              transition={{
                duration: st.anim.duration,
                ease: 'linear',
                ...(st.anim.times ? { times: st.anim.times } : {}),
              }}
              style={{ position: 'absolute', left: 0, top: 0, zIndex }}
              onClick={() => onSelectBot(code)}
              onMouseEnter={() => setHovered(code)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-full">
                <SpeechBubble
                  text={isSelected ? null : st.bubble}
                  isProcessing={isSelected && isChatLoading}
                  accentColor={meta.colorLight}
                />
                <PixelBot
                  code={code}
                  size={52}
                  knowledge={stat.percentage}
                  health={stat.health}
                  isSelected={isSelected}
                  isHovered={hovered === code}
                  isWalking={walking}
                  isTyping={st.phase === 'seated'}
                  isLowKnowledgeOverride={stat.isLowKnowledge}
                  bobDelay={idx}
                  showNameTag={false}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
