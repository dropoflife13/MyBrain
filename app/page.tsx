'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Bot,
  Brain,
  Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  GitFork,
  Search,
  ShieldAlert,
  Sparkles,
  Terminal,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import Brain3D from '../components/Brain3D';
import CommandPalette from '../components/CommandPalette';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BrainDocNode, getBrainData } from '../lib/brain-parser';
import ExplodedView from '../components/landing/ExplodedView';
import MinimalistData from '../components/landing/MinimalistData';
import RouterFlow from '../components/landing/RouterFlow';
import RulePeeler from '../components/landing/RulePeeler';
import ExecutionPipeline from '../components/landing/ExecutionPipeline';

const SELF_ASSESSMENT_PROMPT = `Act as the Brain Agent (brain/07-meta/brainagent.md). Step 0 (Strict Gate BN-00): Verify that all 8 Core Agent files (PM, UX, GR, SD, IR, DB, SEC, RS) exist in /agents; if even one is missing, output GATE: FAIL BN-00 and refuse to start. Once all 8 agents are verified, read brain/01-identity/ABOUT-ME.md and brain/05-elicitation/THE-TEST.md, and run Launcher L-01 to assess my blank-slate vault (0 rules) one question at a time.`;

interface FaqItem {
  question: string;
  answer: string;
  hasDownloadButton?: boolean;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is the "Golden Path"?',
    answer:
      'An 8-step lifecycle (/grill → /pitch → /to-spec → /to-tickets → /implement → /review → /harden → /research), every step gated by the 29 domains and the Judgment Arbiter.',
  },
  {
    question: 'Do I need a database for this?',
    answer: 'No, your Markdown files in brain/ and agents/ are the database.',
  },
  {
    question: 'What happens if I delete a core Agent file?',
    answer: 'Rule BN-00 halts the console until all 8 core agents and the Judgment Arbiter are restored.',
  },
  {
    question: 'Can I use this for non-coding projects?',
    answer: 'Yes, swap dbaagent.md for legalagent.md to govern any decision process.',
  },
  {
    question: 'How do I deploy this to the web?',
    answer: 'Push to GitHub and connect Vercel; the /start guide has the steps.',
    hasDownloadButton: true,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedPluginSnippet, setCopiedPluginSnippet] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState<boolean>(false);
  const [liveTelemetry, setLiveTelemetry] = useState<{
    totalDomains: number;
    totalRules: number;
    totalCoreAgents: number;
    totalClusters: number;
  }>({
    totalDomains: 29,
    totalRules: 281,
    totalCoreAgents: 8,
    totalClusters: 4,
  });
  const graphData = useMemo(() => getBrainData({ nodeCount: 360 }), []);

  useEffect(() => {
    let active = true;
    const syncStats = () => {
      fetch('/api/stats', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data) {
            setLiveTelemetry({
              totalDomains: data.totalDomains ?? 29,
              totalRules: data.totalRules ?? 281,
              totalCoreAgents: data.totalCoreAgents ?? 8,
              totalClusters: data.totalClusters ?? 4,
            });
          }
        })
        .catch(() => {});
    };
    syncStats();
    window.addEventListener('focus', syncStats);
    return () => {
      active = false;
      window.removeEventListener('focus', syncStats);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen((prev) => !prev);
        return;
      }
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        setIsCmdPaletteOpen(true);
        return;
      }
      if (e.key === 'Escape' && isCmdPaletteOpen) {
        setIsCmdPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCmdPaletteOpen]);

  const handleOpenMind = () => {
    router.push('/console');
  };

  const handleCopyPrompt = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(SELF_ASSESSMENT_PROMPT).catch(() => {});
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2200);
    }
  };

  const handleCopyPluginSnippet = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText('# Add a new domain to the cluster\necho "# Law & Jurisprudence" > brain/02-domains/law.md')
        .catch(() => {});
      setCopiedPluginSnippet(true);
      setTimeout(() => setCopiedPluginSnippet(false), 2200);
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300 selection:bg-cyan-500 selection:text-black overflow-x-hidden font-sans">
      {/* 1. Full-Screen Fixed 3D Synaptic Constellation Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <Brain3D
          autoSpin={true}
          isBackground={true}
          onNodeHover={() => {}}
        />
      </div>

      {/* 2. Atmospheric Overlays (Radial Gradient + Blueprint Grid + Corner Reticles) */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(248, 250, 252, 0.45) 0%, rgba(241, 245, 249, 0.92) 100%),
            radial-gradient(rgba(0, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px',
        }}
      />
      <div
        className="hidden dark:block fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(5, 5, 5, 0.45) 0%, rgba(2, 4, 10, 0.88) 100%),
            radial-gradient(rgba(0, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px',
        }}
      />

      <div className="pointer-events-none fixed top-20 left-6 z-10 w-3 h-3 border-t border-l border-cyan-500/30 dark:border-cyan-400/30 hidden md:block" />
      <div className="pointer-events-none fixed top-20 right-6 z-10 w-3 h-3 border-t border-r border-cyan-500/30 dark:border-cyan-400/30 hidden md:block" />

      {/* 3. Top Floating Navigation Bar (Spacious Flex Alignment) */}
      <header className="fixed top-4 left-4 right-4 md:left-6 md:right-6 z-40 flex items-center justify-between pointer-events-none gap-2">
        {/* Left: Brand Pill */}
        <div className="flex items-center justify-start pointer-events-auto shrink-0">
          <div className="h-10 px-3.5 rounded-xl bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl flex items-center justify-center gap-2.5">
            <img
              src="/cortex-logo-cyan.svg"
              alt="Cortex Logo"
              className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(0,255,255,0.45)]"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold tracking-widest text-slate-900 dark:text-white uppercase">
                CORTEX
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-600 dark:text-[#00ffff] border border-cyan-500/20 dark:border-cyan-400/20 font-bold">
                v3.0
              </span>
            </div>
          </div>
        </div>

        {/* Center: Main Navigation (Desktop) */}
        <div className="hidden md:flex items-center justify-center pointer-events-auto">
          <nav className="h-10 flex items-center justify-center gap-3 lg:gap-4 px-4 rounded-xl bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-600 dark:text-zinc-400 shadow-xl">
            <a href="#architecture" className="hidden xl:inline-block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Architecture
            </a>
            <a href="#how-it-works" className="hidden xl:inline-block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              How It Works
            </a>
            <a href="#why-cortex" className="hidden xl:inline-block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Philosophy
            </a>
            <Link
              href="/agents"
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-semibold text-cyan-600 dark:text-cyan-300"
            >
              <Users className="w-3.5 h-3.5" />
              <span>The Agents</span>
            </Link>
            <Link
              href="/start"
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guide</span>
            </Link>
            <Link
              href="/assess"
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assess (L-01)</span>
            </Link>
            <Link
              href="/hq"
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-semibold text-violet-600 dark:text-violet-400"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Pixel HQ</span>
            </Link>
            <a href="#faq" className="hidden xl:inline-block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              FAQ
            </a>
          </nav>
        </div>

        {/* Right: Search Palette Trigger + Theme Toggle */}
        <div className="flex items-center justify-end gap-2 pointer-events-auto shrink-0">
          {/* Global Search Palette Button (GR-04) */}
          <button
            type="button"
            onClick={() => setIsCmdPaletteOpen(true)}
            className="h-10 flex items-center justify-center gap-1.5 px-3 rounded-xl bg-white/85 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-white backdrop-blur-xl border border-slate-200 dark:border-white/10 text-xs font-mono transition-all shadow-xl cursor-pointer"
            title="Search Rules & Agents (Ctrl+K / ⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff]" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="text-[9px] px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-white/15 text-slate-500 dark:text-zinc-400 font-mono">
              ⌘K
            </kbd>
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* 4. Cinematic Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Subtitle Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/25 dark:border-cyan-400/25 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-semibold tracking-wider uppercase mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Procedural Judgment Engine &amp; Multi-Agent Gate Suite</span>
          </div>

          {/* Main Headline with High-Contrast Text-Shadow Protection */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-950 dark:text-white mb-6 leading-[1.08] drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)] dark:drop-shadow-[0_0_50px_rgba(0,255,255,0.25)]">
            Your Judgment, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 dark:from-cyan-400 dark:via-sky-300 dark:to-blue-500">
              Encoded.
            </span>
          </h1>

          {/* Sub-headline with High-Contrast Legibility */}
          <p className="text-lg md:text-xl text-slate-700 dark:text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed font-sans font-medium drop-shadow-md">
            A 3D, AI-powered knowledge vault that doesn&apos;t just store your notes—it enforces your
            engineering standards across {liveTelemetry.totalDomains} domains and {liveTelemetry.totalClusters} clusters.
          </p>

          {/* Giant Glowing CTA Button */}
          <button
            type="button"
            onClick={handleOpenMind}
            className="group relative inline-flex items-center gap-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-lg md:text-xl px-10 py-5 rounded-full transition-all duration-300 shadow-[0_0_35px_rgba(34,211,238,0.5)] hover:shadow-[0_0_60px_rgba(34,211,238,0.85)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Open Your Mind</span>
            <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1.5" />
          </button>

          {/* Telemetry Indicator */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-12 text-xs font-mono uppercase tracking-widest text-slate-600 dark:text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_#00ffff]" />
              {liveTelemetry.totalDomains} Domains Active
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
              {liveTelemetry.totalRules} Synaptic Invariants
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
              <Activity className="w-3.5 h-3.5" />
              Arbiter: Gate Mode
            </span>
          </div>

          {/* CLI Quick Action Pill */}
          <div className="mt-6 flex items-center gap-2 p-1.5 px-3 rounded-full border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-md text-xs font-mono text-slate-600 dark:text-zinc-400 shadow-sm">
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">$</span>
            <span>npx cortex gate --verify-all</span>
            <button
              onClick={() => {
                if (navigator?.clipboard) {
                  navigator.clipboard.writeText('npx cortex gate --verify-all');
                  setCopiedPrompt(true);
                  setTimeout(() => setCopiedPrompt(false), 2000);
                }
              }}
              className="ml-2 hover:text-cyan-600 dark:hover:text-white transition-colors"
              title="Copy Command"
            >
              {copiedPrompt ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Down Scroll Indicator */}
          <a
            href="#architecture"
            className="inline-flex flex-col items-center gap-1.5 mt-16 text-slate-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-xs font-mono"
          >
            <span>Explore Architecture</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </motion.div>
      </section>

      {/* 5. Scrollable Sections (Glassmorphic containers over fixed 3D canvas) */}
      <div className="relative z-10 space-y-36 pb-32">
        {/* SECTION 1: EXPLODED VIEW ARCHITECTURE */}
        <section id="architecture" className="px-6 max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-semibold">
              {'//'} Anatomy
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-950 dark:text-white">
              Three layers. One core.
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-xl mx-auto font-sans">
              Markdown in, enforced judgment out.
            </p>
          </div>
          <ExplodedView
            totalDomains={liveTelemetry.totalDomains}
            totalCoreAgents={liveTelemetry.totalCoreAgents}
            totalClusters={liveTelemetry.totalClusters}
          />
        </section>

        {/* SECTION 1B: MINIMALIST DATA */}
        <section id="scale" className="px-6 max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-semibold">
              {'//'} Scale &amp; Efficiency
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-950 dark:text-white">
              Built to grow. Built to be cheap.
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-xl mx-auto font-sans">
              Local-first routing keeps heavy models for heavy work.
            </p>
          </div>
          <MinimalistData
            totalDomains={liveTelemetry.totalDomains}
            totalRules={liveTelemetry.totalRules}
          />
        </section>

        {/* SECTION 1C: TIERED ROUTER FLOW */}
        <section id="router" className="px-6 max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-semibold">
              {'//'} Tiered Router
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-950 dark:text-white">
              Every query takes the cheapest path.
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-xl mx-auto font-sans">
              Rule IDs resolve locally. Only hard problems reach Tier 3.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl p-4 md:p-8">
            <RouterFlow />
          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS (Circuit-Trace Execution Pipeline) */}
        <section id="how-it-works" className="px-6 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold">
              {'//'} Operational Journey
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-950 dark:text-white">
              The Golden Path Execution Pipeline
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto font-sans">
              From Socratic excavation to deterministic sandbox verification.
            </p>
          </div>

          <ExecutionPipeline />
        </section>

        {/* SECTION: WHY CORTEX? (Interactive Invariant Peeler) */}
        <section id="why-cortex" className="px-6 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold">
              {'//'} The Core Philosophy
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-950 dark:text-white">
              Anatomy of an Enforced Invariant
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto font-sans">
              Every rule is mathematically anchored: trigger, action, axiomatic rationale, and boundary.
            </p>
          </div>

          <RulePeeler />
        </section>

        {/* SECTION 3: FAQ (Accordion Style) */}
        <section id="faq" className="px-6 max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold">
              {'//'} Frequently Asked Questions
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-950 dark:text-white">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 overflow-hidden transition-colors shadow-sm dark:shadow-xl"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-6 text-left cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/[0.02]"
                  >
                    <span className="text-sm md:text-base font-bold text-slate-900 dark:text-white font-mono">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-cyan-600 dark:text-cyan-400 transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 pb-6 pt-1 text-xs md:text-sm text-slate-700 dark:text-zinc-300 font-sans leading-relaxed border-t border-slate-200/60 dark:border-white/5 space-y-4"
                      >
                        <p>{item.answer}</p>
                        {item.hasDownloadButton && (
                          <div className="pt-2">
                            <a
                              href="/brain-template.zip"
                              download="brain-vault-blank-template.zip"
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-semibold text-xs shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download Blank Starter Template (.zip)</span>
                            </a>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: EXTEND THE CORTEX */}
        <section id="extending" className="px-6 max-w-4xl mx-auto space-y-6">
          <div className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 sm:p-10 space-y-6 shadow-xl dark:shadow-2xl hover:border-cyan-400/40 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{'//'} Modular Architecture</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white font-mono">
                  Extend the Cortex
                </h2>
              </div>
              <Badge variant="outline" className="w-fit font-mono text-[10px] text-cyan-600 dark:text-cyan-300 font-semibold">
                PLUGINS &amp; CUSTOM AGENTS
              </Badge>
            </div>

            <p className="text-sm md:text-base text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
                Drop a <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-cyan-600 dark:text-cyan-300 font-mono text-xs font-semibold">.md</code> into <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-cyan-600 dark:text-cyan-300 font-mono text-xs font-semibold">brain/02-domains/</code> and it auto-clusters into one of 4 regions by prefix.
              </p>

            {/* Code Snippet Box with Copy Button */}
            <div className="relative rounded-xl bg-zinc-950 border border-white/10 overflow-hidden font-mono shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-white/10 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] text-zinc-300">Terminal {'//'} Add Domain Node</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPluginSnippet}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] text-cyan-400 transition-colors cursor-pointer"
                >
                  {copiedPluginSnippet ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 text-xs sm:text-sm text-zinc-200 overflow-x-auto leading-relaxed">
                <code>
                  <span className="text-zinc-500"># Add a new domain to the cluster</span>
                  {'\n'}
                  <span className="text-cyan-400 font-semibold">echo</span>{' '}
                  <span className="text-amber-300">&quot;# Law &amp; Jurisprudence&quot;</span> &gt;{' '}
                  <span className="text-emerald-400">brain/02-domains/law.md</span>
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* 6. Footer */}
        <footer className="px-6 max-w-6xl mx-auto pt-16 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-slate-500 dark:text-zinc-500">
          <div className="flex items-center gap-3">
            <img src="/cortex-logo-cyan.svg" alt="Cortex" className="w-5 h-5 object-contain" />
            <span>CORTEX RUNTIME // NEIL MAR • BSIT SENIOR</span>
          </div>

          <div className="flex items-center gap-6 text-slate-600 dark:text-zinc-400">
            <Link href="/agents" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              The Agents
            </Link>

            <Link href="/start" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-emerald-600 dark:text-emerald-400">
              Beginner&apos;s Guide
            </Link>

            <a
              href="https://github.com/dropoflife13/MyBrain"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/neilmar/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.92 0-1.67-.75-1.67-1.67s.75-1.67 1.67-1.67 1.67.75 1.67 1.67-.75 1.67-1.67 1.67M5.07 18.5h2.78v-8.37H5.07v8.37Z" />
              </svg>
              <span>LinkedIn</span>
            </a>

            <button
              type="button"
              onClick={handleOpenMind}
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Console
            </button>
          </div>
        </footer>
      </div>

      {/* 7. Fork this Brain Modal */}
      <AnimatePresence>
        {isShareOpen && (
          <motion.div
            key="share-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShareOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-mono"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-[#09090b] border border-white/15 p-6 shadow-2xl space-y-5 text-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/cortex-logo-cyan.svg"
                    alt="Cortex"
                    className="w-9 h-9 object-contain"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">
                        Want your own Brain Vault? Clone the template.
                      </h3>
                      <Badge variant="default">0 RULES • BLANK SLATE</Badge>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-sans">
                      You can&apos;t copy-paste someone else&apos;s judgment. The forked template starts{' '}
                      <span className="text-white font-medium">100% empty (status: empty)</span> so you must assess yourself to earn every synaptic node.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsShareOpen(false)}
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Strict Pre-Flight Gate Warning (BN-00: 8 Agents & Arbiter Required) */}
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-xs font-mono text-red-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider">
                    ⚠ STRICT CLONE RULE (GATE: BN-00)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-200 border border-red-400/30">
                    8 AGENTS + ARBITER
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  You <strong className="text-white">cannot start</strong> or assess a Brain Vault unless all{' '}
                  <span className="text-[#00ffff]">8 Core Agents (PM, UX, GR, SD, IR, DB, SEC, RS) and the Judgment Arbiter</span> are present. Deleting any agent triggers{' '}
                  <code className="text-red-300">GATE: FAIL BN-00</code> and halts initialization.
                </p>
              </div>

              {/* 3-Step Self-Assessment Pipeline */}
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-white/10 text-xs font-mono text-zinc-300 space-y-2">
                <div className="text-[11px] text-[#00ffff] uppercase tracking-wider font-semibold">
                  {'//'} How You Build Your Own Cortex (Self-Assessment Loop):
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-400/15 text-[#00ffff] text-[10px] font-bold">
                    01
                  </span>
                  <div className="font-sans">
                    <span className="text-white font-semibold font-mono">01-identity/ABOUT-ME.md</span> — Fill out your background or run <span className="text-[#00ffff]">Launcher L-09</span> (AI Interview).
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-400/15 text-[#00ffff] text-[10px] font-bold">
                    02
                  </span>
                  <div className="font-sans">
                    <span className="text-white font-semibold font-mono">05-elicitation/THE-TEST.md</span> — Run <span className="text-[#00ffff]">Launcher L-01</span> (Self-Map + Artifact Archaeology + Visceral Cringe Test + 30s Trade-Off Triads).
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-400/15 text-[#00ffff] text-[10px] font-bold">
                    03
                  </span>
                  <div className="font-sans">
                    <span className="text-white font-semibold font-mono">02-domains/*.md</span> — Promote proven rules (<span className="text-emerald-400">conf &ge; 3</span> + <span className="text-amber-300">breaks:</span> condition) to light up your 3D Constellation.
                  </div>
                </div>
              </div>

              {/* Copy Launcher L-01 Self-Assessment Prompt */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Starter Prompt (Paste into Claude / Cursor / Antigravity):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] font-mono text-[#00ffff] transition-colors cursor-pointer"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy L-01 Prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 line-clamp-2 leading-relaxed">
                  &ldquo;{SELF_ASSESSMENT_PROMPT}&rdquo;
                </p>
              </div>

              <Link
                href="/assess"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500/15 hover:bg-cyan-500/25 px-4 py-2.5 text-xs font-mono font-bold text-cyan-300 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.2)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00ffff]" />
                <span>Take In-Browser Self-Assessment Quiz (L-01) →</span>
              </Link>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a
                  href="/brain-template.zip"
                  download="brain-vault-blank-template.zip"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#00ffff] px-4 py-2.5 text-xs font-mono font-semibold text-zinc-950 hover:bg-cyan-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Blank .zip (0 Rules)</span>
                </a>

                <a
                  href="https://github.com/dropoflife13/MyBrain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-zinc-900 px-4 py-2.5 text-xs font-mono font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#00ffff]" />
                  <span>Clone on GitHub</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom-Right Action: Fork this Brain */}
      <div className="fixed bottom-6 right-6 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsShareOpen(true)}
          className="h-10 flex items-center justify-center gap-2 px-3.5 rounded-xl bg-white/90 dark:bg-[#09090b]/90 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-white/15 hover:border-cyan-400/40 text-xs font-mono transition-all shadow-2xl backdrop-blur-xl cursor-pointer"
          title="Fork this Brain Vault"
        >
          <GitFork className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff]" />
          <span>Fork this Brain</span>
        </button>
      </div>

      {/* Global Cmd+K Search Palette (GR-04) */}
      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        nodes={graphData.nodes}
        onSelectNode={(node) => {
          const cleanId = String(node.id).split('::')[0];
          router.push(`/console?node=${encodeURIComponent(cleanId)}`);
        }}
        onNavigate={(href) => router.push(href)}
      />
    </div>
  );
}
