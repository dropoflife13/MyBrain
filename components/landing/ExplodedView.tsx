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
  'font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border border-slate-300 dark:border-white/15 text-slate-700 dark:text-zinc-300 bg-white/60 dark:bg-white/[0.03]';

interface LayerProps {
  /** viewBox-space geometry (viewBox is 1000 x 620) */
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
        top: `${(y / 620) * 100}%`,
        width: `${(w / 1000) * 100}%`,
        height: `${(h / 620) * 100}%`,
      }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }}
    >
      <motion.div
        whileHover={{ y: -12, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="h-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-5 shadow-xl dark:shadow-[0_0_40px_rgba(0,255,255,0.06)] flex flex-col justify-between cursor-default"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={`${monoLabel} text-cyan-600 dark:text-cyan-400`}>{tag}</div>
            <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{blurb}</p>
          </div>
          <div className="w-9 h-9 shrink-0 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 overflow-hidden">{children}</div>
      </motion.div>
    </motion.div>
  );
}

export default function ExplodedView() {
  // Connector paths in viewBox space, from the core (180,310) to each layer's left edge.
  const paths = [
    'M180 310 C 290 310, 290 105, 380 105',
    'M180 310 L 340 310',
    'M180 310 C 290 310, 270 515, 300 515',
  ];

  return (
    <div className="w-full">
      {/* Desktop: exploded diagram */}
      <div className="relative hidden md:block w-full max-w-5xl mx-auto aspect-[1000/620]">
        <svg
          viewBox="0 0 1000 620"
          className="absolute inset-0 w-full h-full pointer-events-none"
          fill="none"
          aria-hidden="true"
        >
          {paths.map((d, i) => (
            <g key={i}>
              <path
                d={d}
                strokeWidth={1.25}
                strokeDasharray="2 7"
                strokeLinecap="round"
                className="stroke-slate-400 dark:stroke-cyan-300/60"
              />
              <circle r={3.5} className="fill-cyan-500 dark:fill-cyan-300 drop-shadow-[0_0_6px_#22d3ee]">
                <animateMotion dur={`${3 + i * 0.6}s`} repeatCount="indefinite" path={d} begin={`${i * 0.5}s`} />
              </circle>
            </g>
          ))}
        </svg>

        {/* Cortex Core */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 w-[15%] aspect-square"
          style={{ left: '18%', top: '50%' }}
        >
          <motion.div
            className="absolute inset-[-22%] rounded-full border border-dashed border-cyan-500/40 dark:border-cyan-300/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-[-8%] rounded-full border border-slate-300 dark:border-white/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 shadow-[0_0_60px_rgba(34,211,238,0.55)] dark:shadow-[0_0_90px_rgba(34,211,238,0.7)] flex items-center justify-center">
            <Brain className="w-1/2 h-1/2 text-white" strokeWidth={1.5} />
          </div>
          <div
            className={`${monoLabel} absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-slate-600 dark:text-zinc-300`}
          >
            Cortex Core
          </div>
        </div>

        {/* Floating layers (top -> bottom), exploded with horizontal offsets */}
        <Layer
          x={380}
          y={30}
          w={520}
          h={150}
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
          x={340}
          y={235}
          w={520}
          h={150}
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
          <span className={`${chip} text-cyan-600 dark:text-cyan-300`}>+15</span>
        </Layer>

        <Layer
          x={300}
          y={440}
          w={520}
          h={150}
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
                  ? 'border-rose-400/60 text-rose-600 dark:text-rose-300'
                  : ''
              }`}
            >
              {a}
            </span>
          ))}
        </Layer>
      </div>

      {/* Mobile: simple stacked fallback */}
      <div className="md:hidden space-y-3">
        {[
          { tag: 'Layer 01', title: 'The Brain Vault', items: VAULT_FILES },
          { tag: 'Layer 02', title: 'The 29 Domains', items: [...DOMAIN_TAGS.slice(0, 8), '+21'] },
          { tag: 'Layer 03', title: '8 Agents & the Arbiter', items: AGENT_CODES },
        ].map((l) => (
          <div
            key={l.tag}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-4"
          >
            <div className={`${monoLabel} text-cyan-600 dark:text-cyan-400`}>{l.tag}</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{l.title}</h3>
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
  );
}
