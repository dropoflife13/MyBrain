'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PixelBot, { AGENT_REGISTRY, type AgentCode } from '../PixelBot';
import SpeechBubble, { WORKING_SPEECH_OPTIONS } from '../SpeechBubble';

/* ────────────────────────────────────────────────────────────────────────────
 * 2D SPACE STATION LAYOUT
 *
 * Everything lives in a fixed logical "stage" (STAGE_W x STAGE_H) that is scaled
 * to fit the viewport, so desk positions and walking paths are deterministic.
 *
 *   y   0 ─ 200   Back wall   : Reactor (top centre), server rack, wall sign
 *   y 200 ─ 580   Command deck: TRON perspective floor
 *                 Arbiter bench (centre) · Row A desks · Row B desks
 *                 Research Board (left) · Printer (right)
 *
 * Bots are anchored to their desks. A state machine sends one random bot at a
 * time on an errand (desk → printer / research board → desk) along simple
 * orthogonal paths: out of the desk, down an aisle gap, along the walkway lane.
 * ──────────────────────────────────────────────────────────────────────────── */

const STAGE_W = 1000;
const STAGE_H = 580;
const FLOOR_TOP = 200;
const FLOOR_H = STAGE_H - FLOOR_TOP;
const PLANE_H = 430; // rotated plane height that fills FLOOR_H at rotateX(62deg), perspective 800px

const DESK_W = 110;
const DESK_H = 44;
const DESK_XS = [270, 420, 580, 730];
/** x-centres of the aisle gaps: left of desk 0, between desks, right of desk 3 */
const GAP_XS = [195, 345, 500, 655, 805];
const LANE_Y = 418;
const WALK_SPEED = 130; // stage px per second
const INTERACT_MS = 3600;

const ROW_A = { deskTop: 340, seatY: 352, backY: 328 };
const ROW_B = { deskTop: 470, seatY: 482, backY: 458 };

const AGENT_ORDER: AgentCode[] = ['PM', 'UX', 'GR', 'SD', 'IR', 'DB', 'SEC', 'RS', 'ARB'];
const WALKERS: AgentCode[] = ['PM', 'UX', 'GR', 'SD', 'IR', 'DB', 'SEC', 'RS'];

interface Seat {
  x: number;
  deskTop: number;
  seatY: number;
  backY: number;
  col: number;
}

const SEATS: Record<AgentCode, Seat> = {
  // Row A (front of the Arbiter bench)
  RS: { x: DESK_XS[0], ...ROW_A, col: 0 },
  PM: { x: DESK_XS[1], ...ROW_A, col: 1 },
  UX: { x: DESK_XS[2], ...ROW_A, col: 2 },
  GR: { x: DESK_XS[3], ...ROW_A, col: 3 },
  // Row B
  DB: { x: DESK_XS[0], ...ROW_B, col: 0 },
  SD: { x: DESK_XS[1], ...ROW_B, col: 1 },
  IR: { x: DESK_XS[2], ...ROW_B, col: 2 },
  SEC: { x: DESK_XS[3], ...ROW_B, col: 3 },
  // Arbiter bench, directly beneath the reactor
  ARB: { x: 500, deskTop: 236, seatY: 250, backY: 250, col: 0 },
};

type Dest = 'printer' | 'research_board';

const DESTS: Record<Dest, { x: number; y: number; bubble: string }> = {
  printer: { x: 901, y: 438, bubble: '🖨️ Printing report...' },
  research_board: { x: 100, y: 436, bubble: '📄 Reading docs...' },
};

interface Pt {
  x: number;
  y: number;
}

/** desk → step back behind the desk → sideways into an aisle gap → onto the lane → along the lane → destination */
function buildOutPath(seat: Seat, dest: Dest): Pt[] {
  const d = DESTS[dest];
  const gapX = d.x < seat.x ? GAP_XS[seat.col] : GAP_XS[seat.col + 1];
  return [
    { x: seat.x, y: seat.seatY },
    { x: seat.x, y: seat.backY },
    { x: gapX, y: seat.backY },
    { x: gapX, y: LANE_Y },
    { x: d.x, y: LANE_Y },
    { x: d.x, y: d.y },
  ];
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
    duration: total / WALK_SPEED,
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

function createInitialBots(): Record<AgentCode, BotState> {
  const out = {} as Record<AgentCode, BotState>;
  for (const code of AGENT_ORDER) {
    const s = SEATS[code];
    out[code] = {
      phase: 'seated',
      dest: null,
      bubble: INITIAL_BUBBLES[code] ?? null,
      anim: { x: s.x, y: s.seatY, duration: 0 },
    };
  }
  return out;
}

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
  /** Width of the slide-out terminal drawer, so the stage re-centres in the visible area */
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
      {/* Holo-monitor perched on the desk's far corner (never covers the seated bot) */}
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
        <div className="absolute left-2 bottom-[7px] text-[8px] font-mono font-bold tracking-widest text-slate-300 uppercase">
          {label ?? `TERM // ${code}`}
        </div>
        <div
          className="absolute right-2 bottom-[7px] text-[8px] font-mono font-bold"
          style={{ color: accent }}
        >
          {percentage}%
        </div>
        <div className="absolute inset-x-2 bottom-[2px] h-[2px] rounded-full bg-white/10 overflow-hidden">
          <div className="h-full" style={{ width: `${percentage}%`, backgroundColor: accent }} />
        </div>
      </div>

      {/* Contact glow on the floor */}
      <div
        className="absolute -bottom-2 left-3 right-3 h-3 rounded-full blur-md pointer-events-none"
        style={{ backgroundColor: `${accent}22` }}
      />
    </div>
  );
}

function ResearchBoard({ active }: { active: boolean }) {
  const cards = ['#38bdf8', '#f472b6', '#fbbf24', '#a78bfa', '#34d399', '#fb7185'];
  return (
    <div className="absolute z-10 pointer-events-none" style={{ left: 24, top: 244, width: 152, height: 164 }}>
      <div
        className="absolute inset-x-0 top-0 h-[140px] rounded-lg border bg-gradient-to-b from-[#150f33] to-[#07051a] overflow-hidden"
        style={{
          borderColor: 'rgba(168,85,247,0.8)',
          boxShadow: active
            ? '0 0 28px rgba(168,85,247,0.6), inset 0 0 22px rgba(168,85,247,0.25)'
            : '0 0 14px rgba(168,85,247,0.3), inset 0 0 14px rgba(168,85,247,0.12)',
          transition: 'box-shadow .4s ease',
        }}
      >
        <div className="px-2.5 pt-2 flex items-center justify-between text-[8px] font-mono font-bold tracking-widest text-purple-300 uppercase">
          <span>Research Board</span>
          <span className={active ? 'text-emerald-300' : 'text-purple-400/60'}>●</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 px-2.5 pt-2.5">
          {cards.map((c, i) => (
            <motion.div
              key={c}
              className="h-[34px] rounded-[3px] bg-[#0d0a24] border border-purple-400/20 relative overflow-hidden"
              animate={{ opacity: active ? [0.7, 1, 0.7] : 0.85 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }}
            >
              <div className="h-[3px]" style={{ backgroundColor: c }} />
              <div className="mt-1.5 mx-1 h-[2px] rounded-full bg-white/30" />
              <div className="mt-1 mx-1 h-[2px] w-2/3 rounded-full bg-white/20" />
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

function Printer({ active }: { active: boolean }) {
  return (
    <div className="absolute z-10 pointer-events-none" style={{ left: 836, top: 322, width: 130, height: 88 }}>
      {/* Paper sheet slides out of the top slot (rendered before the body so it emerges from behind it) */}
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

function ServerRack() {
  return (
    <div
      className="absolute z-[4] pointer-events-none rounded-md border bg-gradient-to-b from-[#0e0a26] to-[#060414] p-1.5 flex flex-col gap-1"
      style={{
        left: 792,
        top: 50,
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
  dockedCode,
  isProcessing,
  onClick,
}: {
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
    <div className="absolute z-[5]" style={{ left: 350, top: 6, width: 300, height: 164 }}>
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
              background: 'radial-gradient(circle, rgba(165,243,252,0.95) 0%, rgba(34,211,238,0.55) 45%, rgba(8,47,73,0.2) 100%)',
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
  const [size, setSize] = useState({ w: 1200, h: 640 });
  const [bots, setBots] = useState<Record<AgentCode, BotState>>(createInitialBots);
  const [hovered, setHovered] = useState<AgentCode | null>(null);
  const selectedRef = useRef<AgentCode | null>(selectedAgent);

  useEffect(() => {
    selectedRef.current = selectedAgent;
  }, [selectedAgent]);

  // Measure the viewport (ResizeObserver fires once on observe, so no synchronous setState here)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // STATE MACHINE: Working → Walking → Interacting → Returning, one random bot every 10–15s
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
      // Always schedule the next errand first so the cadence never stalls
      later(runErrand, 10000 + Math.random() * 5000);

      const pool = WALKERS.filter((c) => c !== selectedRef.current && !busy.has(c));
      if (pool.length === 0) return;
      const code = pick(pool);
      const dest: Dest = Math.random() < 0.5 ? 'printer' : 'research_board';
      const seat = SEATS[code];
      const outPath = buildOutPath(seat, dest);
      const outAnim = pathToAnim(outPath);
      const backAnim = pathToAnim([...outPath].reverse());
      const d = DESTS[dest];
      busy.add(code);

      // STATE 2: Walking out
      setBots((p) => ({ ...p, [code]: { phase: 'out', dest, bubble: null, anim: outAnim } }));

      later(() => {
        // STATE 3: Interacting (contextual speech bubble)
        setBots((p) => ({
          ...p,
          [code]: { phase: 'interact', dest, bubble: d.bubble, anim: restAnim(d.x, d.y) },
        }));

        later(() => {
          // STATE 4: Returning to the desk
          setBots((p) => ({ ...p, [code]: { phase: 'back', dest, bubble: null, anim: backAnim } }));

          later(() => {
            // STATE 1: Working again
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

    later(runErrand, 4000);
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  // Working chatter: rotate "Indexing...", "Scanning..." bubbles over a few seated bots
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
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  const usableW = size.w - (isTerminalOpen && size.w >= 768 ? drawerWidth : 0);
  const scale = Math.min(1.5, Math.max(0.55, Math.min(usableW / STAGE_W, size.h / STAGE_H)));

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
      className="absolute inset-0 overflow-auto select-none"
      style={{
        backgroundColor: '#02040b',
        backgroundImage: [
          'radial-gradient(ellipse at 50% 0%, rgba(14,40,96,0.55) 0%, rgba(2,4,11,0) 60%)',
          'radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.55), transparent)',
          'radial-gradient(1px 1px at 38% 42%, rgba(165,243,252,0.45), transparent)',
          'radial-gradient(1.5px 1.5px at 66% 24%, rgba(255,255,255,0.5), transparent)',
          'radial-gradient(1px 1px at 84% 60%, rgba(196,181,253,0.45), transparent)',
          'radial-gradient(1px 1px at 52% 82%, rgba(255,255,255,0.4), transparent)',
        ].join(','),
        backgroundSize: '100% 100%, 320px 240px, 320px 240px, 320px 240px, 320px 240px, 320px 240px',
      }}
    >
      <div
        className="min-h-full flex items-center justify-center"
        style={{ width: Math.max(usableW, STAGE_W * scale), transition: 'width .35s ease' }}
      >
        <div
          className="relative shrink-0"
          style={{
            width: STAGE_W * scale,
            height: STAGE_H * scale,
            transition: 'width .35s ease, height .35s ease',
          }}
        >
          <div
            className="absolute left-0 top-0"
            style={{
              width: STAGE_W,
              height: STAGE_H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              transition: 'transform .35s ease',
            }}
          >
            {/* ── BACK WALL ── */}
            <div
              className="absolute left-0 top-0 w-full pointer-events-none"
              style={{
                height: FLOOR_TOP,
                background:
                  'linear-gradient(180deg, rgba(5,10,28,0.55) 0%, rgba(6,14,36,0.92) 100%), repeating-linear-gradient(90deg, rgba(34,211,238,0.05) 0 1px, transparent 1px 100px)',
              }}
            />
            <div className="absolute left-7 top-8 pointer-events-none">
              <div className="text-[10px] font-mono font-bold tracking-[0.25em] text-cyan-300 uppercase">
                Station Orbit // Deck 09
              </div>
              <div className="mt-1 text-[8px] font-mono tracking-widest text-slate-400 uppercase">
                9 stations online · 8 agents + arbiter
              </div>
              <div className="mt-3 text-[8px] font-mono tracking-widest text-slate-500 uppercase">
                Click a bot or desk to dock · Esc to undock
              </div>
            </div>

            <Reactor
              dockedCode={selectedAgent}
              isProcessing={isChatLoading && selectedAgent !== null}
              onClick={onToggleTerminal}
            />
            <ServerRack />

            {/* ── COMMAND DECK (TRON perspective floor) ── */}
            <div
              className="absolute left-0 right-0 overflow-hidden pointer-events-none"
              style={{
                top: FLOOR_TOP,
                height: FLOOR_H,
                perspective: '800px',
                perspectiveOrigin: '50% 0%',
                maskImage: 'linear-gradient(to bottom, transparent 0%, #000 24%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 24%)',
              }}
            >
              <div
                className="absolute left-0 top-0 w-full"
                style={{
                  height: PLANE_H,
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
            <div
              className="absolute left-0 right-0 h-[2px] pointer-events-none"
              style={{
                top: FLOOR_TOP,
                background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.8), transparent)',
                boxShadow: '0 0 14px rgba(34,211,238,0.7)',
              }}
            />

            {/* Interaction pads where bots stop */}
            <FloorPad x={DESTS.research_board.x} y={DESTS.research_board.y} color="#a855f7" />
            <FloorPad x={DESTS.printer.x} y={DESTS.printer.y} color="#22d3ee" />

            {/* ── WORKSTATIONS ── */}
            <ResearchBoard active={boardActive} />
            <Printer active={printerActive} />

            <Desk
              {...deskProps('ARB')}
              x={SEATS.ARB.x}
              top={SEATS.ARB.deskTop}
              width={96}
              height={36}
              label="ARBITER BENCH"
            />
            {WALKERS.map((code) => (
              <Desk key={`desk-${code}`} {...deskProps(code)} x={SEATS[code].x} top={SEATS[code].deskTop} />
            ))}

            {/* ── THE WORKERS (anchored at desks; walk only during errands) ── */}
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
      </div>
    </div>
  );
}
