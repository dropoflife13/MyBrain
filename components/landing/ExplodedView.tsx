'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, Layers, ShieldCheck } from 'lucide-react';

const VAULT_FILES = [
  'ABOUT-ME.md',
  'TASTE.md',
  'OPERATING-PRINCIPLES.md',
  'HEURISTICS.md',
  'PATTERNS.md',
  'RED-FLAGS.md',
];

const DOMAIN_TAGS = [
  'cybersec',
  'solutions',
  'ui-frontend',
  'law',
  'finance',
  'economy',
  'psychology',
  'philosophy',
  'medicine',
  'science',
  'history',
  'crypto',
  'geopolitics',
  'authorization',
];

const AGENT_CODES = ['PM', 'UX', 'GR', 'SD', 'IR', 'DB', 'SEC', 'RS', 'ARB'];

const monoLabel = 'font-mono text-xs uppercase tracking-widest';
const chip =
  'font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border border-slate-300 dark:border-white/15 text-slate-700 dark:text-zinc-300 bg-slate-100/80 dark:bg-white/[0.04]';

interface LayerProps {
  /** viewBox-space geometry (viewBox is 1000 x 660) */
  x: number;
  y: number;
  w: number;
  h: number;
  floatDelay: number;
  tag: string;
  title: string;
  blurb: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Layer({ x, y, w, h, floatDelay, tag, title, blurb, icon, children }: LayerProps) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${(x / 1000) * 100}%`,
        top: `${(y / 660) * 100}%`,
        width: `${(w / 1000) * 100}%`,
        height: `${(h / 660) * 100}%`,
      }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }}
    >
      <motion.div
        whileHover={{ y: -10, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="h-full rounded-2xl border border-slate-300 dark:border-white/10 bg-white/95 dark:bg-[#09090b]/90 backdrop-blur-xl p-5 shadow-lg dark:shadow-[0_0_40px_rgba(0,255,255,0.06)] flex flex-col justify-between cursor-default overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={`${monoLabel} text-sky-700 dark:text-cyan-400 font-semibold`}>{tag}</div>
            <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">{blurb}</p>
          </div>
          <div className="w-9 h-9 shrink-0 rounded-lg border border-sky-500/30 dark:border-cyan-500/30 bg-sky-500/10 dark:bg-cyan-500/10 text-sky-700 dark:text-cyan-300 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 overflow-hidden">{children}</div>
      </motion.div>
    </motion.div>
  );
}

export default function ExplodedView() {
  // Connector paths in viewBox space (1000 x 660), from the core (140, 330) to each layer's left edge.
  const paths = [
    'M140 330 C 260 330, 260 112, 380 112',
    'M140 330 L 350 330',
    'M140 330 C 250 330, 240 548, 320 548',
  ];

  return (
    <div className="w-full">
      {/* Desktop (lg+): exploded diagram with wide separation between Core orb and Layer cards */}
      <div className="relative hidden lg:block w-full max-w-5xl mx-auto aspect-[1000/660]">
        <svg
          viewBox="0 0 1000 660"
          className="absolute inset-0 w-full h-full pointer-events-none"
          fill="none"
          aria-hidden="true"
        >
          {paths.map((d, i) => (
            <g key={i}>
              <path
                d={d}
                stroke="var(--svg-connector)"
                strokeWidth={1.75}
                strokeDasharray="3 7"
                strokeLinecap="round"
              />
              <circle
                r={4}
                fill="var(--svg-pulse)"
                className="drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
              >
                <animateMotion
                  dur={`${3 + i * 0.6}s`}
                  repeatCount="indefinite"
                  path={d}
                  begin={`${i * 0.5}s`}
                />
              </circle>
            </g>
          ))}
        </svg>

        {/* Cortex Core (centered at x=14%, y=50%, well clear of cards starting at x>=32%) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 w-[13%] aspect-square z-10"
          style={{ left: '14%', top: '50%' }}
        >
          <motion.div
            className="absolute inset-[-20%] rounded-full border border-dashed border-sky-600/50 dark:border-cyan-300/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-[-8%] rounded-full border border-slate-400 dark:border-white/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 shadow-[0_0_50px_rgba(2,132,199,0.45)] dark:shadow-[0_0_90px_rgba(34,211,238,0.7)] flex items-center justify-center">
            <Brain className="w-1/2 h-1/2 text-white" strokeWidth={1.5} />
          </div>
          <div
            className={`${monoLabel} absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-slate-700 dark:text-zinc-300 font-semibold`}
          >
            Cortex Core
          </div>
        </div>

        {/* Floating layers (top -> bottom), exploded with horizontal offsets */}
        <Layer
          x={380}
          y={24}
          w={580}
          h={175}
          floatDelay={0}
          tag="Layer 01"
          title="The Brain Vault"
          blurb="Plain Markdown. Your files are the database."
          icon={<FileText className="w-4 h-4" />}
        >
          {VAULT_FILES.map((f) => (
            <span key={f} className={chip}>
              {f}
            </span>
          ))}
        </Layer>

        <Layer
          x={350}
          y={242}
          w={580}
          h={175}
          floatDelay={0.8}
          tag="Layer 02"
          title="The 29 Domains"
          blurb="Four clusters of invariants."
          icon={<Layers className="w-4 h-4" />}
        >
          {DOMAIN_TAGS.map((d, i) => (
            <motion.span
              key={d}
              className={chip}
              animate={{ y: [0, i % 2 ? -2 : 2, 0] }}
              transition={{ duration: 3 + (i % 4), repeat: Infinity, ease: 'easeInOut' }}
            >
              {d}
            </motion.span>
          ))}
          <span className={`${chip} text-sky-700 dark:text-cyan-300 font-semibold`}>+15</span>
        </Layer>

        <Layer
          x={320}
          y={460}
          w={580}
          h={175}
          floatDelay={1.6}
          tag="Layer 03"
          title="8 Agents & the Arbiter"
          blurb="Gate Mode. Violations output GATE: FAIL."
          icon={<ShieldCheck className="w-4 h-4" />}
        >
          {AGENT_CODES.map((a) => (
            <span
              key={a}
              className={`${chip} ${
                a === 'ARB'
                  ? 'border-rose-500/60 text-rose-700 dark:text-rose-300 font-semibold'
                  : ''
              }`}
            >
              {a}
            </span>
          ))}
        </Layer>
      </div>

      {/* Mobile & Tablet (<1024px): clean vertical stack with isolated Core orb header so cards never overlap */}
      <div className="lg:hidden flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center pt-4 pb-2">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full border border-dashed border-sky-600/50 dark:border-cyan-300/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border border-slate-400 dark:border-white/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 shadow-[0_0_40px_rgba(2,132,199,0.45)] dark:shadow-[0_0_50px_rgba(34,211,238,0.55)] flex items-center justify-center">
              <Brain className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <div className={`${monoLabel} mt-3 text-slate-700 dark:text-zinc-300 font-semibold`}>
            Cortex Core
          </div>
          <div className="h-8 border-l-2 border-dashed border-slate-500 dark:border-cyan-400/60 mt-2" />
        </div>

        <div className="w-full space-y-4">
          {[
            {
              tag: 'Layer 01',
              title: 'The Brain Vault',
              blurb: 'Plain Markdown. Your files are the database.',
              items: VAULT_FILES,
            },
            {
              tag: 'Layer 02',
              title: 'The 29 Domains',
              blurb: 'Four clusters of invariants.',
              items: [...DOMAIN_TAGS.slice(0, 8), '+21'],
            },
            {
              tag: 'Layer 03',
              title: '8 Agents & the Arbiter',
              blurb: 'Gate Mode. Violations output GATE: FAIL.',
              items: AGENT_CODES,
            },
          ].map((l) => (
            <div
              key={l.tag}
              className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-white/95 dark:bg-[#09090b]/90 backdrop-blur-xl p-5 shadow-md"
            >
              <div className={`${monoLabel} text-sky-700 dark:text-cyan-400 font-semibold`}>
                {l.tag}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {l.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mb-3">{l.blurb}</p>
              <div className="flex flex-wrap gap-1.5">
                {l.items.map((i) => (
                  <span key={i} className={chip}>
                    {i}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
