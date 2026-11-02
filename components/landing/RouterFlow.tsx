'use client';

import React from 'react';

/** Circuit-trace paths in a 1000 x 360 viewBox. */
const TRACES = {
  queryToRouter: 'M200 180 H 330',
  toTier1: 'M470 180 H 560 V 70 H 700',
  toTier2: 'M470 180 H 700',
  toTier3: 'M470 180 H 560 V 290 H 700',
  t1ToT2: 'M820 100 V 150',
  t2ToT3: 'M820 210 V 260',
};

const label = 'font-mono fill-slate-800 dark:fill-white';
const sub = 'font-mono fill-slate-500 dark:fill-zinc-400';
const box =
  'fill-white dark:fill-black stroke-slate-300 dark:stroke-white/25';
const trace = 'stroke-slate-400 dark:stroke-white/30';

function Pulse({ path, dur, begin }: { path: string; dur: number; begin: number }) {
  return (
    <circle r={3.5} className="fill-cyan-500 dark:fill-cyan-300 drop-shadow-[0_0_6px_#22d3ee]">
      <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} />
    </circle>
  );
}

export default function RouterFlow() {
  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 1000 360"
        className="w-full min-w-[640px] h-auto"
        fill="none"
        role="img"
        aria-label="Tiered router flow: user query goes through the router to Tier 1 local lookup, Tier 2 fast LLM, or Tier 3 heavy LLM"
      >
        <defs>
          <marker id="rf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="fill-slate-400 dark:fill-white/50" />
          </marker>
        </defs>

        {/* Traces */}
        {Object.values(TRACES).map((d, i) => (
          <path
            key={i}
            d={d}
            strokeWidth={1.25}
            strokeLinejoin="round"
            markerEnd="url(#rf-arrow)"
            strokeDasharray={i >= 4 ? '3 4' : undefined}
            className={trace}
          />
        ))}

        {/* Solder pads at trace corners */}
        {[
          [560, 180],
          [560, 70],
          [560, 290],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.5} className="fill-slate-400 dark:fill-white/50" />
        ))}

        {/* Pulses travelling along the traces */}
        <Pulse path={TRACES.queryToRouter} dur={1.6} begin={0} />
        <Pulse path={TRACES.toTier1} dur={2.2} begin={1.6} />
        <Pulse path={TRACES.toTier2} dur={2.0} begin={2.4} />
        <Pulse path={TRACES.toTier3} dur={2.2} begin={3.4} />
        <Pulse path={TRACES.t1ToT2} dur={1.2} begin={4.2} />
        <Pulse path={TRACES.t2ToT3} dur={1.2} begin={5.0} />

        {/* Box 1: User Query */}
        <rect x={40} y={150} width={160} height={60} rx={10} strokeWidth={1.25} className={box} />
        <text x={120} y={185} textAnchor="middle" fontSize={12} letterSpacing={2} className={label}>
          USER QUERY
        </text>

        {/* Box 2: Tiered Router (diamond) */}
        <polygon
          points="400,110 470,180 400,250 330,180"
          strokeWidth={1.25}
          className={`${box} drop-shadow-[0_0_14px_rgba(34,211,238,0.35)]`}
        />
        <text x={400} y={178} textAnchor="middle" fontSize={11} letterSpacing={2} className={label}>
          TIERED
        </text>
        <text x={400} y={194} textAnchor="middle" fontSize={11} letterSpacing={2} className={label}>
          ROUTER
        </text>

        {/* Box 3: Tiers */}
        {[
          { y: 40, t: 'TIER 1 · LOCAL', s: 'Rule ID lookup · $0' },
          { y: 150, t: 'TIER 2 · FAST LLM', s: 'Simple questions' },
          { y: 260, t: 'TIER 3 · HEAVY LLM', s: 'Workflows & reasoning' },
        ].map((n) => (
          <g key={n.t}>
            <rect x={700} y={n.y} width={240} height={60} rx={10} strokeWidth={1.25} className={box} />
            <text x={720} y={n.y + 27} fontSize={12} letterSpacing={2} className={label}>
              {n.t}
            </text>
            <text x={720} y={n.y + 45} fontSize={10} className={sub}>
              {n.s}
            </text>
          </g>
        ))}

        {/* Escalation label */}
        <text x={832} y={130} fontSize={9} letterSpacing={2} className={sub}>
          ESCALATE
        </text>
        <text x={832} y={240} fontSize={9} letterSpacing={2} className={sub}>
          ESCALATE
        </text>
      </svg>
    </div>
  );
}
