import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass, Cpu, BookOpen, FolderGit2, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <main
      className="min-h-screen w-full bg-[#f0f4f8] dark:bg-[#050505] text-slate-900 dark:text-white flex items-center justify-center p-6 transition-colors duration-300"
      style={{
        fontFamily:
          "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      <div className="max-w-lg w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl p-8 shadow-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 dark:text-[#00ffff] text-[11px] font-bold tracking-widest uppercase mb-4">
          <span>HTTP 404 • SYNAPTIC ROUTE NOT FOUND</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Unmapped Neural Coordinate
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mb-6">
          The route you requested does not exist in the Cortex vault. Use one of the verified entry points below to return to the constellation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 text-left">
          <Link
            href="/console"
            className="flex items-center gap-2.5 p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-700 dark:text-[#00ffff] text-xs font-semibold transition-all"
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span>3D Synaptic Console</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300 text-xs transition-all"
          >
            <Compass className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>Landing Overview</span>
          </Link>
          <Link
            href="/start"
            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300 text-xs transition-all"
          >
            <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Beginner&apos;s Guide</span>
          </Link>
          <Link
            href="/assess"
            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300 text-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Assess Yourself (L-01)</span>
          </Link>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-[#00ffff] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Cortex Home</span>
        </Link>
      </div>
    </main>
  );
}

