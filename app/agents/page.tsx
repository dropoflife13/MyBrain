'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { ThemeToggle } from '../../components/ThemeToggle';
import ExplodedPipeline from '../../components/agents/ExplodedPipeline';

export default function AgentsPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#040711] text-slate-900 dark:text-white transition-colors duration-300 selection:bg-cyan-500 selection:text-black">
      {/* Blueprint Grid & Vignette Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 25%, transparent 40%, rgba(2, 6, 23, 0.08) 100%),
            radial-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px',
        }}
      />

      {/* Top Floating Navigation Bar */}
      <header className="sticky top-4 z-40 px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-white/10 text-xs font-mono transition-all shadow-xl backdrop-blur-xl"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          <span>Back to Home</span>
        </Link>

        {/* Center Title Pill */}
        <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/80 dark:bg-[#09090b]/85 border border-slate-300 dark:border-white/10 text-xs font-mono shadow-xl backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00ffff]" />
          <span className="font-bold text-slate-900 dark:text-white">3-TIER EXPLODED DEFENSE PIPELINE</span>
          <span className="text-slate-400 dark:text-zinc-500">•</span>
          <span className="text-slate-500 dark:text-zinc-400">8 AGENTS + ARBITER</span>
        </div>

        {/* Right CTA + Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/hq"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 text-xs font-mono transition-all shadow-xl backdrop-blur-xl"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Pixel HQ</span>
          </Link>
          <Link
            href="/console"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="default" className="text-xs uppercase tracking-widest px-3 py-1">
            Exploded Defense Architecture // Gate Mode Active
          </Badge>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-950 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            The Autonomous Defense Pipeline
          </h1>

          <p className="text-base md:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
            Every file in <code className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">/agents</code> enforces
            non-negotiable architectural gates. Code changes flow down from the <strong className="text-rose-500">Apex Arbiter</strong> through{' '}
            <strong className="text-amber-500">Intake</strong>, <strong className="text-purple-400">Engine</strong>, and into the{' '}
            <strong className="text-cyan-400">Immutable Core</strong>.
          </p>
        </div>

        {/* ── 3-TIER EXPLODED PIPELINE (STEPS 1 TO 5) ── */}
        <ExplodedPipeline />

        {/* BN-00 Hard Stop Notice Box */}
        <div className="rounded-2xl bg-red-500/5 dark:bg-red-950/25 border-2 border-red-500/30 p-8 md:p-10 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h3 className="text-lg md:text-xl font-bold font-mono text-red-700 dark:text-red-300 uppercase tracking-wide">
              The BN-00 Co-Dependency Invariant
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-sans max-w-4xl">
            A Procedural Brain (<code className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">/brain</code>) stores tacit
            human judgment, trade-offs, and boundary conditions. The 8-Agent Suite (<code className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">/agents</code>)
            enforces those rules in automated Gate Mode. If any agent file is deleted or unmapped, the procedural kernel hard-halts
            with <code className="font-mono text-red-500 font-bold">GATE: FAIL BN-00</code> to prevent headless, unverified execution.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
            <Link
              href="/console"
              className="inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:underline font-bold"
            >
              <span>Explore The 3D Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-slate-400 dark:text-zinc-600">•</span>
            <a
              href="https://github.com/dropoflife13/MyBrain"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 hover:underline"
            >
              <span>Inspect Agents on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-12 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 dark:text-zinc-500">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cortex-logo-cyan.svg" alt="Cortex" className="w-4 h-4 object-contain" />
          <span>CORTEX RUNTIME // 3-TIER EXPLODED DEFENSE PIPELINE</span>
        </div>
        <Link href="/" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
          Return to Overview
        </Link>
      </footer>
    </div>
  );
}
