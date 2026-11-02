'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Scale, Database, Cpu, CheckCircle2, AlertOctagon, Terminal } from 'lucide-react';

interface InvariantSample {
  id: string;
  domain: string;
  prefix: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  when: string;
  doAction: string;
  why: string;
  breaks: string;
  conf: number;
  block: string;
}

const SAMPLES: InvariantSample[] = [
  {
    id: 'SEC-02',
    domain: 'cybersec',
    prefix: 'SEC',
    title: 'RLS Bypass Defense',
    icon: ShieldCheck,
    tag: 'Engineering Gate',
    when: 'designing multi-tenant database access or RPC endpoints',
    doAction: 'enforce default-deny Row Level Security (RLS) on all tables and verify cross-tenant isolation as anon and authenticated roles',
    why: 'Client-side filters and API WHERE clauses fail under direct REST/GraphQL query attacks; security must be enforced at the database engine',
    breaks: 'Public read-only marketing catalogs with zero tenant-specific or user-private rows',
    conf: 5,
    block: '^sec-02',
  },
  {
    id: 'LAW-04',
    domain: 'law',
    prefix: 'LAW',
    title: 'Rule of Law & Non-Retroactivity',
    icon: Scale,
    tag: 'Global & Society',
    when: 'evaluating statutory legitimacy or regulatory mandates',
    doAction: 'verify that rules are General (not ad hoc), Public (known to all), and Prospective (not retroactive)',
    why: "Lon Fuller's internal morality of law dictates that citizens cannot conform conduct to rules enacted after the fact",
    breaks: 'Authoritarian martial decrees or emergency executive triage actions during existential warfare',
    conf: 5,
    block: '^law-04',
  },
  {
    id: 'DB-13',
    domain: 'solutions',
    prefix: 'DB',
    title: 'Atomic Counter Invariance',
    icon: Database,
    tag: 'Data Architecture',
    when: 'mutating decrementing stock, ticket capacity, or financial ledger balances',
    doAction: 'execute atomic SQL increments/decrements with strict WHERE balance >= amount bounds in a single transaction',
    why: 'Application-layer read-modify-write patterns suffer from TOCTOU race conditions under concurrent client requests',
    breaks: 'Eventual-consistency analytics pipelines where transient approximate counts are mathematically tolerated',
    conf: 5,
    block: '^db-13',
  },
];

const monoLabel = 'font-mono text-xs uppercase tracking-widest';

export default function RulePeeler() {
  const [activeIdx, setActiveIdx] = useState(0);
  const sample = SAMPLES[activeIdx];
  const Icon = sample.icon;

  return (
    <div className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-white/95 dark:bg-[#09090b]/90 backdrop-blur-xl overflow-hidden shadow-xl dark:shadow-[0_0_50px_rgba(34,211,238,0.06)]">
      {/* Top Header / Domain Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-white/10 px-6 py-4 bg-slate-50/70 dark:bg-white/[0.02] gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
          <span className={`${monoLabel} text-slate-700 dark:text-zinc-300 font-semibold`}>
            CV-02 Invariant Peeler
          </span>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-zinc-900 border border-slate-300/60 dark:border-white/10">
          {SAMPLES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveIdx(i)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
                activeIdx === i
                  ? 'bg-white dark:bg-cyan-500/15 text-sky-700 dark:text-cyan-300 shadow-sm border border-slate-300 dark:border-cyan-400/30'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {s.id}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Sample Meta Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-sky-500/30 dark:border-cyan-500/30 bg-sky-500/10 dark:bg-cyan-500/10 flex items-center justify-center text-sky-700 dark:text-cyan-300">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {sample.id}
                </span>
                <span className="text-xs text-slate-400 dark:text-zinc-500">·</span>
                <span className="font-mono text-xs text-sky-700 dark:text-cyan-400 font-semibold uppercase">
                  {sample.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {sample.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] text-slate-700 dark:text-zinc-300">
              Confidence: {sample.conf}/5
            </span>
            <span className="px-2.5 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              STATUS: ACTIVE
            </span>
          </div>
        </div>

        {/* Exploded Rule Anatomical Breakdown */}
        <AnimatePresence mode="wait">
          <motion.div
            key={sample.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Box 1: Condition (WHEN) */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`${monoLabel} text-sky-700 dark:text-cyan-400 font-semibold`}>
                  01 · Trigger Condition
                </span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">WHEN</span>
              </div>
              <p className="text-sm text-slate-800 dark:text-zinc-200 leading-relaxed font-sans">
                {sample.when}
              </p>
            </div>

            {/* Box 2: Invariant Action (DO) */}
            <div className="rounded-xl border border-sky-400/40 dark:border-cyan-400/30 bg-sky-500/[0.04] dark:bg-cyan-500/[0.04] p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`${monoLabel} text-sky-800 dark:text-cyan-300 font-semibold`}>
                  02 · Enforced Action
                </span>
                <span className="font-mono text-[10px] text-sky-600 dark:text-cyan-400 font-bold">
                  → DO
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed font-sans">
                {sample.doAction}
              </p>
            </div>

            {/* Box 3: Timeless Rationale (why:) */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`${monoLabel} text-slate-700 dark:text-zinc-300 font-semibold`}>
                  03 · Axiomatic Foundation
                </span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                  why:
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
                {sample.why}
              </p>
            </div>

            {/* Box 4: Exception Boundary (breaks:) */}
            <div className="rounded-xl border border-rose-400/40 dark:border-rose-500/20 bg-rose-500/[0.03] dark:bg-rose-500/[0.03] p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`${monoLabel} text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1.5`}>
                  <AlertOctagon className="w-3.5 h-3.5" />
                  04 · Epistemic Boundary
                </span>
                <span className="font-mono text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                  breaks:
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
                {sample.breaks}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Live Raw Canonical Representation */}
        <div className="rounded-xl border border-slate-300 dark:border-white/10 bg-slate-900 text-slate-200 p-4 font-mono text-xs overflow-x-auto shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
            <span>Canonical Markdown File Format</span>
            <span className="text-cyan-400">{sample.block}</span>
          </div>
          <div className="leading-relaxed whitespace-pre-wrap break-all text-slate-300">
            <span className="text-rose-400">- **{sample.id}**</span> ({sample.title}): WHEN {sample.when} → DO <span className="text-cyan-300 font-bold">{sample.doAction}</span> | why: {sample.why} | breaks: {sample.breaks} | conf: {sample.conf} | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #{sample.domain} <span className="text-sky-400">{sample.block}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
