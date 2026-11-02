'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, CheckCircle2, ShieldAlert, Zap, Code2, ArrowRight } from 'lucide-react';

interface PipelineStep {
  num: string;
  command: string;
  phase: string;
  title: string;
  desc: string;
  outputPreview: string;
  outputBadge: string;
  badgeTone: 'cyan' | 'emerald' | 'rose' | 'amber';
}

const STEPS: PipelineStep[] = [
  {
    num: '01',
    command: '/grill',
    phase: 'Elicitation & Excavation',
    title: 'Surface Unspoken Rules',
    desc: 'The Socratic interview parses edge cases before code is written, mining your latent heuristics.',
    outputPreview: '>>> INTERROGATION: How should the system respond when an unindexed tenant queries 5M rows?\n>>> INVARIANT IDENTIFIED: DB-14 (Mandatory composite indexes on tenant_id).',
    outputBadge: 'INVARIANT RECORDED',
    badgeTone: 'cyan',
  },
  {
    num: '02',
    command: '/to-tickets',
    phase: 'Architecture Decomposition',
    title: 'Atomic Spec Breakdown',
    desc: 'Decomposes features into 5 sequential atomic tasks with measurable acceptance criteria.',
    outputPreview: 'TICKET-01: Add RLS default-deny policy on user_profiles.\nTICKET-02: Enforce atomic balance decrement in PostgreSQL transaction.\nTICKET-03: Strip admin_notes on client-facing endpoint.',
    outputBadge: '5 TICKETS GENERATED',
    badgeTone: 'emerald',
  },
  {
    num: '03',
    command: '/implement',
    phase: 'Deterministic-First Sandbox',
    title: 'Static Linting & Code Gen',
    desc: 'Executes linter checks and unit tests before any LLM debug loop is ever permitted.',
    outputPreview: '>>> RUNNING: Deterministic AST Syntax & Balance Checks...\n>>> VALIDATION: 10/10 automated syntax assertions passed.\n>>> SANDBOX: Execution in E2B micro-container verified.',
    outputBadge: 'GATE: PASS (DETERMINISTIC)',
    badgeTone: 'emerald',
  },
  {
    num: '04',
    command: '/review',
    phase: 'Arbiter & Invariant Gate',
    title: '8-Agent Invariant Audit',
    desc: 'SEC audits RLS boundaries, DB audits append-only immutability, and ARB halts conflicts.',
    outputPreview: 'SEC-02 AUDIT: PASSED (Zero RLS bypass paths detected)\nDB-13 AUDIT: PASSED (Atomic WHERE balance >= amount applied)\nARB-02 CONFLICT CHECK: PASSED (No cross-domain contradiction)',
    outputBadge: 'MERGE AUTHORIZED',
    badgeTone: 'emerald',
  },
];

const monoLabel = 'font-mono text-xs uppercase tracking-widest';

export default function ExecutionPipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const current = STEPS[activeStep];

  return (
    <div className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-white/95 dark:bg-[#09090b]/90 backdrop-blur-xl overflow-hidden shadow-xl dark:shadow-[0_0_50px_rgba(34,211,238,0.06)]">
      {/* Top Progress Track */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
        {STEPS.map((s, idx) => {
          const isSelected = activeStep === idx;
          return (
            <button
              key={s.command}
              onClick={() => setActiveStep(idx)}
              className={`p-4 md:p-5 text-left transition-all border-b-2 md:border-b-2 md:border-r last:border-r-0 ${
                isSelected
                  ? 'border-sky-600 dark:border-cyan-400 bg-sky-500/[0.05] dark:bg-cyan-500/[0.05]'
                  : 'border-transparent border-r-slate-200 dark:border-r-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-sky-700 dark:text-cyan-400">
                  {s.command}
                </span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                  {s.num}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {s.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Execution View */}
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Stage Explanation */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-sky-700 dark:text-cyan-400 uppercase tracking-widest">
              Stage {current.num}
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500">·</span>
            <span className={`${monoLabel} text-slate-600 dark:text-zinc-400 font-semibold`}>
              {current.phase}
            </span>
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {current.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
            {current.desc}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] font-mono text-xs text-slate-700 dark:text-zinc-300">
              Command: <code className="text-sky-700 dark:text-cyan-400 font-bold">{current.command}</code>
            </div>
            <div className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 font-mono text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
              {current.outputBadge}
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulated Terminal Trace */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-200 p-5 font-mono text-xs shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-[10px] text-slate-400 tracking-wider">
                  CORTEX KERNEL · {current.command}
                </span>
              </div>
              <span className="text-[10px] text-cyan-400 animate-pulse">● LIVE EXECUTION</span>
            </div>

            <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto text-[11px] md:text-xs">
              {current.outputPreview}
            </pre>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>Deterministic Assertion Engine</span>
              <span className="text-emerald-400">Exit Code: 0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
