'use client';

import React from 'react';
import { motion } from 'framer-motion';

/** Circuit-trace paths in a 1000 x 360 viewBox. */
const TRACES = {
  queryToRouter: 'M200 180 H 330',
  toTier1: 'M470 180 H 560 V 70 H 700',
  toTier2: 'M470 180 H 700',
  toTier3: 'M470 180 H 560 V 290 H 700',
  t1ToT2: 'M820 100 V 150',
  t2ToT3: 'M820 210 V 260',
};

function Pulse({ path, dur, begin }: { path: string; dur: number; begin: number }) {
  return (
    <circle
      r={4}
      fill="var(--svg-pulse)"
      className="drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
    >
      <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} />
    </circle>
  );
}

export default function RouterFlow() {
  return (
    <div className="w-full">
      <div className="hidden md:block">
        <svg
          viewBox="0 0 1000 360"
          className="w-full h-auto"
          fill="none"
          role="img"
          aria-label="Tiered router flow: user query goes through the router to Tier 1 local lookup, Tier 2 fast LLM, or Tier 3 heavy LLM"
        >
          <defs>
            <marker
              id="rf-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" fill="var(--svg-trace)" />
            </marker>
          </defs>

          {/* Traces */}
          {Object.values(TRACES).map((d, i) => (
            <path
              key={i}
              d={d}
              stroke="var(--svg-trace)"
              strokeWidth={1.75}
              strokeLinejoin="round"
              markerEnd="url(#rf-arrow)"
              strokeDasharray={i >= 4 ? '4 4' : undefined}
            />
          ))}

          {/* Solder pads at trace corners */}
          {[
            [560, 180],
            [560, 70],
            [560, 290],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="var(--svg-trace)" />
          ))}

          {/* Pulses travelling along the traces */}
          <Pulse path={TRACES.queryToRouter} dur={1.6} begin={0} />
          <Pulse path={TRACES.toTier1} dur={2.2} begin={1.6} />
          <Pulse path={TRACES.toTier2} dur={2.0} begin={2.4} />
          <Pulse path={TRACES.toTier3} dur={2.2} begin={3.4} />
          <Pulse path={TRACES.t1ToT2} dur={1.2} begin={4.2} />
          <Pulse path={TRACES.t2ToT3} dur={1.2} begin={5.0} />

          {/* Box 1: User Query */}
          <rect
            x={40}
            y={150}
            width={160}
            height={60}
            rx={10}
            fill="var(--svg-box-fill)"
            stroke="var(--svg-box-stroke)"
            strokeWidth={1.5}
          />
          <text
            x={120}
            y={185}
            textAnchor="middle"
            fontSize={12}
            letterSpacing={2}
            fill="var(--svg-label)"
            className="font-mono font-semibold"
          >
            USER QUERY
          </text>

          {/* Box 2: Tiered Router (diamond) */}
          <polygon
            points="400,110 470,180 400,250 330,180"
            fill="var(--svg-box-fill)"
            stroke="var(--svg-diamond-stroke)"
            strokeWidth={1.75}
            className="drop-shadow-[0_0_14px_rgba(34,211,238,0.35)]"
          />
          <text
            x={400}
            y={178}
            textAnchor="middle"
            fontSize={11}
            letterSpacing={2}
            fill="var(--svg-label)"
            className="font-mono font-semibold"
          >
            TIERED
          </text>
          <text
            x={400}
            y={194}
            textAnchor="middle"
            fontSize={11}
            letterSpacing={2}
            fill="var(--svg-label)"
            className="font-mono font-semibold"
          >
            ROUTER
          </text>

          {/* Box 3: Tiers */}
          {[
            { y: 40, t: 'TIER 1 · LOCAL', s: 'Rule ID lookup · $0' },
            { y: 150, t: 'TIER 2 · FAST LLM', s: 'Simple questions' },
            { y: 260, t: 'TIER 3 · HEAVY LLM', s: 'Workflows & reasoning' },
          ].map((n) => (
            <g key={n.t}>
              <rect
                x={700}
                y={n.y}
                width={240}
                height={60}
                rx={10}
                fill="var(--svg-box-fill)"
                stroke="var(--svg-box-stroke)"
                strokeWidth={1.5}
              />
              <text
                x={720}
                y={n.y + 27}
                fontSize={12}
                letterSpacing={2}
                fill="var(--svg-label)"
                className="font-mono font-semibold"
              >
                {n.t}
              </text>
              <text
                x={720}
                y={n.y + 45}
                fontSize={10}
                fill="var(--svg-sub)"
                className="font-mono"
              >
                {n.s}
              </text>
            </g>
          ))}

          {/* Escalation label */}
          <text x={832} y={130} fontSize={9} letterSpacing={2} fill="var(--svg-sub)" className="font-mono">
            ESCALATE
          </text>
          <text x={832} y={240} fontSize={9} letterSpacing={2} fill="var(--svg-sub)" className="font-mono">
            ESCALATE
          </text>
        </svg>
      </div>

      {/* Mobile: vertical flow, no horizontal overflow */}
      <div className="md:hidden flex flex-col items-center font-mono">
        <div className={mBox}>User Query</div>
        <VLine />
        <div className="relative w-28 h-28 flex items-center justify-center my-1">
          <div className="absolute inset-3 rotate-45 border-2 border-sky-600 dark:border-cyan-400/60 bg-white dark:bg-[#09090b] shadow-[0_0_14px_rgba(34,211,238,0.35)]" />
          <span className="relative text-[10px] font-semibold uppercase tracking-widest text-slate-900 dark:text-white text-center leading-tight">
            Tiered
            <br />
            Router
          </span>
        </div>
        <VLine />
        {[
          { t: 'Tier 1 · Local', s: 'Rule ID lookup · $0' },
          { t: 'Tier 2 · Fast LLM', s: 'Simple questions' },
          { t: 'Tier 3 · Heavy LLM', s: 'Workflows & reasoning' },
        ].map((n, i) => (
          <React.Fragment key={n.t}>
            {i > 0 && <VLine dashed label="escalate" />}
            <div className={`${mBox} items-start text-left`}>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-900 dark:text-white">
                {n.t}
              </span>
              <span className="text-[10px] text-slate-600 dark:text-zinc-400 mt-1">{n.s}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

const mBox =
  'w-full max-w-xs flex flex-col items-center justify-center rounded-xl border border-slate-400 dark:border-white/25 bg-white dark:bg-[#09090b] px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-900 dark:text-white shadow-sm';

function VLine({ dashed, label }: { dashed?: boolean; label?: string }) {
  return (
    <div className="relative h-10 flex items-center">
      <div
        className={`h-full border-l-2 ${
          dashed ? 'border-dashed' : ''
        } border-slate-600 dark:border-cyan-400/50`}
      />
      <motion.span
        className="absolute left-0 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-sky-600 dark:bg-cyan-300 shadow-[0_0_8px_#22d3ee]"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
      />
      {label && (
        <span className="absolute left-3 text-[9px] uppercase tracking-widest text-slate-600 dark:text-zinc-400">
          {label}
        </span>
      )}
    </div>
  );
}
