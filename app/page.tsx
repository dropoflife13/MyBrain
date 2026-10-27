'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  GitFork,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  X,
} from 'lucide-react';
import Brain3D from '../components/Brain3D';
import CommandPalette from '../components/CommandPalette';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BrainDocNode, getBrainData } from '../lib/brain-parser';

const SELF_ASSESSMENT_PROMPT = `Act as the Brain Agent (brain/07-meta/brainagent.md). Step 0 (Strict Gate BN-00): Verify that all 7 Core Agent files (PM, UX, GR, SD, IR, DB, SEC) exist in /agents; if even one is missing, output GATE: FAIL BN-00 and refuse to start. Once all 7 agents are verified, read brain/01-identity/ABOUT-ME.md and brain/05-elicitation/THE-TEST.md, and run Launcher L-01 to assess my blank-slate vault (0 rules) one question at a time.`;

interface FaqItem {
  question: string;
  answer: string;
  hasDownloadButton?: boolean;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I deploy my own Brain Vault?',
    answer:
      'Clone the repository and push it directly to Vercel, or download the clean starter template below. Both packages contain the full Next.js 3D WebGL engine, the 7-Agent Execution Suite (/agents), and the diagnostic excavation tests (/brain/05-elicitation).',
    hasDownloadButton: true,
  },
  {
    question: 'Why does the forked template start 100% empty (0 rules)?',
    answer:
      "You cannot copy-paste someone else's engineering judgment. An unearned vault filled with someone else's decisions is generic slop. The template starts with status: empty (0 active rules) so that you run Launcher L-01 (THE-TEST.md) and earn every single synaptic node through rigorous self-assessment.",
  },
  {
    question: 'What are the 7 Core Agents in the suite?',
    answer:
      'The 7 Execution Gatekeepers are: Database Architect (DB), Security Gatekeeper (SEC), UI/UX Frontend Lead (UX), Product Manager (PM), Systems Design Architect (SD), Integration & Reliability Engineer (IR), and Growth Specialist (GR). Each agent owns a specific architectural boundary and executes non-negotiable GATE: PASS or GATE: FAIL checks.',
  },
  {
    question: 'What is the BN-00 Pre-Flight Invariant?',
    answer:
      'Rule BN-00 is a hard-stop architectural invariant: a Procedural Brain cannot operate in headless or ungoverned mode. If anyone clones the repository and deletes or omits even one of the 7 agent files in /agents, the procedural kernel crashes with a full-screen sci-fi panic overlay and refuses to execute.',
  },
  {
    question: 'How do I connect this vault to Claude Code, Cursor, or Antigravity?',
    answer:
      'Through CLAUDE.md and VS Code Multi-Root Workspaces. When you connect an AI agent to this workspace, it automatically loads Tier 0 governance principles on every prompt, checks active domain rules, and evaluates agent gate checklists before touching code.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedPluginSnippet, setCopiedPluginSnippet] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState<boolean>(false);
  const graphData = useMemo(() => getBrainData({ nodeCount: 360 }), []);

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
        .writeText('# Add a new agent to the suite\necho "# Legal Agent" > agents/legalagent.md')
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
                v2.4
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
            <a href="#faq" className="hidden xl:inline-block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              FAQ
            </a>
          </nav>
        </div>

        {/* Right: Search + Theme Toggle + Fork + Console CTA */}
        <div className="flex items-center justify-end gap-2 pointer-events-auto shrink-0">
          {/* Global Search Palette Button (GR-04) */}
          <button
            type="button"
            onClick={() => setIsCmdPaletteOpen(true)}
            className="h-10 flex items-center justify-center gap-1.5 px-3 rounded-xl bg-white/85 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-white backdrop-blur-xl border border-slate-200 dark:border-white/10 text-xs font-mono transition-all shadow-xl cursor-pointer"
            title="Search Rules & Agents (Ctrl+K / ⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff]" />
            <span className="hidden xl:inline">Search</span>
            <kbd className="text-[9px] px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-white/15 text-slate-500 dark:text-zinc-400 font-mono">
              ⌘K
            </kbd>
          </button>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="h-10 hidden sm:flex items-center justify-center gap-1.5 px-3 rounded-xl bg-white/85 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-900 border border-slate-200 dark:border-white/15 hover:border-cyan-400/40 text-xs font-mono text-slate-800 dark:text-zinc-200 transition-all shadow-xl cursor-pointer"
            title="Fork this Brain"
          >
            <GitFork className="w-3.5 h-3.5 text-cyan-500 dark:text-[#00ffff]" />
            <span className="hidden lg:inline">Fork this Brain</span>
          </button>

          <button
            type="button"
            onClick={handleOpenMind}
            className="h-10 flex items-center justify-center gap-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] cursor-pointer"
          >
            <span>Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
            <span>Procedural Judgment Engine &amp; 7-Agent Gate Suite</span>
          </div>

          {/* Main Headline with High-Contrast Text-Shadow Protection */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-950 dark:text-white mb-6 leading-[1.08] drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)] dark:drop-shadow-[0_0_50px_rgba(0,255,255,0.25)]">
            Your Judgment, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 dark:from-cyan-400 dark:via-sky-300 dark:to-blue-500">
              Encoded.
            </span>
          </h1>

          {/* Sub-headline with High-Contrast Legibility */}
          <p className="text-lg md:text-xl text-slate-700 dark:text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed font-sans font-medium drop-shadow-md">
            A 3D, AI-powered knowledge vault that doesn&apos;t just store your notes—it enforces your
            engineering standards.
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
          <div className="flex items-center gap-4 mt-12 text-xs font-mono text-slate-600 dark:text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_#00ffff]" />
              7 Autonomous Agents
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
              360 Synaptic Coordinates
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <Activity className="w-3.5 h-3.5" />
              60 FPS WebGL
            </span>
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
        {/* SECTION 1: ARCHITECTURE (3 Pillars) */}
        <section id="architecture" className="px-6 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold">
              // Three Foundational Pillars
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
              Engineered for Invariant Governance
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto font-sans">
              Unlike static wiki dumps or unstructured LLM chats, Cortex unites procedural 3D math,
              runtime security invariants, and domain judgment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 space-y-4 hover:border-cyan-400/50 transition-all shadow-xl dark:shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/25 dark:border-cyan-400/25 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  The Synaptic Constellation
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
                  A 360-node spatial WebGL graph. Every tacit rule, operational heuristic, and failure
                  boundary (<code className="text-cyan-600 dark:text-cyan-300 font-mono font-bold">breaks:</code>) is mathematically
                  anchored in 3D orbit around the central cognitive hub.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                <Badge variant="outline" className="font-mono text-[10px] text-cyan-600 dark:text-cyan-300 font-semibold">
                  360 SYNAPTIC NODES • PROCEDURAL GL
                </Badge>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 space-y-4 hover:border-cyan-400/50 transition-all shadow-xl dark:shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/25 dark:border-cyan-400/25 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                    The 7-Agent Execution Suite
                  </h3>
                  <Link
                    href="/agents"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-md hover:bg-cyan-500/20 transition-colors font-mono cursor-pointer shrink-0"
                  >
                    <span>Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-xs md:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
                  Seven autonomous gatekeepers (<code className="text-cyan-600 dark:text-cyan-300 font-mono font-bold">PM, UX, GR, SD, IR, DB, SEC</code>).
                  They inspect PRs, database schemas, and API contracts in Gate Mode, outputting blocking{' '}
                  <code className="text-red-500 font-mono font-bold">GATE: FAIL</code> on violations.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                <Badge variant="outline" className="font-mono text-[10px] text-cyan-600 dark:text-cyan-300 font-semibold">
                  7 EXECUTION AGENTS • ZERO SLOP
                </Badge>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 space-y-4 hover:border-red-400/50 transition-all shadow-xl dark:shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 dark:text-red-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  The BN-00 Invariant Fail-Safe
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
                  Pre-flight security invariant. If anyone forks the repository and deletes even one
                  agent gatekeeper, the system halts with a sci-fi system crash overlay. It refuses to
                  operate in headless mode.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                <Badge variant="destructive" className="font-mono text-[10px] font-semibold">
                  RULE BN-00 • FAIL-SAFE ENFORCED
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS (Two Columns) */}
        <section id="how-it-works" className="px-6 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold">
              // Operational Journey
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
              How High-Agency Engineers Encode Judgment
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto font-sans">
              Separate your human trade-offs from generative AI. You provide the judgment; AI
              enforces the gates.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1: For Practitioners & Users */}
            <div className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 md:p-10 space-y-6 shadow-xl dark:shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20 dark:border-cyan-400/20 uppercase font-bold">
                  User Protocol
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  For Builders &amp; Creators
                </h3>
              </div>

              <div className="space-y-6 text-xs md:text-sm font-sans text-slate-700 dark:text-zinc-300">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 dark:bg-cyan-400/15 text-cyan-600 dark:text-cyan-300 font-mono font-bold flex items-center justify-center shrink-0">
                    01
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white font-mono text-sm mb-1">
                      Assess Yourself (Excavation)
                    </h4>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                      Run <code className="text-cyan-600 dark:text-cyan-300 font-mono font-bold">THE-TEST.md</code> and the 3 Fast
                      Excavation Micro-Triggers (Artifact Archaeology, Visceral Cringe Test, and 30s
                      Trade-Off Triads) to discover what you truly care about.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 dark:bg-cyan-400/15 text-cyan-600 dark:text-cyan-300 font-mono font-bold flex items-center justify-center shrink-0">
                    02
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white font-mono text-sm mb-1">
                      Connect Any AI Agent
                    </h4>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                      Attach the vault to Claude Code, Cursor, or Antigravity via{' '}
                      <code className="text-cyan-600 dark:text-cyan-300 font-mono font-bold">CLAUDE.md</code>. The AI loads Tier 0
                      Operating Principles and gates every ticket before touching files.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 dark:bg-cyan-400/15 text-cyan-600 dark:text-cyan-300 font-mono font-bold flex items-center justify-center shrink-0">
                    03
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white font-mono text-sm mb-1">
                      Enforce Invariants &amp; Grow
                    </h4>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                      Promote tested rules (<code className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">conf &ge; 3</code>)
                      into domain files. Every verified rule lights up a new glowing node in your
                      3D constellation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: For Engineers & Reviewers */}
            <div className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 md:p-10 space-y-6 shadow-xl dark:shadow-2xl flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 uppercase font-bold">
                    Reviewer Protocol
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                    For Reviewers &amp; Architects
                  </h3>
                </div>

                {/* Inspect The Code */}
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-zinc-950/70 border border-slate-200 dark:border-white/10 space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      Codebase &amp; Specs
                    </span>
                    <a
                      href="https://github.com/dropoflife13/MyBrain"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans">
                    Explore the complete Next.js 16 App Router implementation, custom Three.js WebGL
                    runtime, and the 7-Agent Gate Suite markdown files.
                  </p>
                </div>

                {/* See The Crash */}
                <div className="p-4 rounded-xl bg-red-500/5 dark:bg-red-950/30 border border-red-500/30 space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-600 dark:text-red-300 uppercase tracking-wider flex items-center gap-2 font-bold">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      The Chaos Test (BN-00)
                    </span>
                    <Badge variant="destructive" className="text-[10px] font-bold">
                      LIVE INVARIANT
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 font-sans">
                    Want to see it halt? In your local clone, rename{' '}
                    <code className="text-red-500 font-mono font-bold">agents/securityagent.md</code> to{' '}
                    <code className="text-red-500 font-mono font-bold">.bak</code>. Watch the 3D console vanish and
                    render a sci-fi system crash screen with scanlines and blinking cursor.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                <Link
                  href="/agents"
                  className="text-xs font-mono text-slate-500 dark:text-zinc-400 hover:underline"
                >
                  View 7 Agents Directory &rarr;
                </Link>
                <button
                  type="button"
                  onClick={handleOpenMind}
                  className="inline-flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-bold"
                >
                  <span>Launch Live 3D Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: FAQ (Accordion Style) */}
        <section id="faq" className="px-6 max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold">
              // Frequently Asked Questions
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
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
                  <span>// Modular Architecture</span>
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
              The system is designed to grow. Drop a new{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-cyan-600 dark:text-cyan-300 font-mono text-xs font-semibold">
                .md
              </code>{' '}
              file into the{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-cyan-600 dark:text-cyan-300 font-mono text-xs font-semibold">
                agents/
              </code>{' '}
              folder to instantly spawn a new gatekeeper node in the 3D space.
            </p>

            {/* Code Snippet Box with Copy Button */}
            <div className="relative rounded-xl bg-zinc-950 border border-white/10 overflow-hidden font-mono shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-white/10 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] text-zinc-300">Terminal // Add Agent Node</span>
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
                  <span className="text-zinc-500"># Add a new agent to the suite</span>
                  {'\n'}
                  <span className="text-cyan-400 font-semibold">echo</span>{' '}
                  <span className="text-amber-300">&quot;# Legal Agent&quot;</span> &gt;{' '}
                  <span className="text-emerald-400">agents/legalagent.md</span>
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

              {/* Strict Pre-Flight Gate Warning (BN-00: 7 Agents Required) */}
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-xs font-mono text-red-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider">
                    ⚠ STRICT CLONE RULE (GATE: BN-00)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-200 border border-red-400/30">
                    7 AGENTS REQUIRED
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  You <strong className="text-white">cannot start</strong> or assess a Brain Vault unless all{' '}
                  <span className="text-[#00ffff]">7 Core Agents (PM, UX, GR, SD, IR, DB, SEC)</span> are present in{' '}
                  <code className="text-white">/agents</code>. Deleting any agent triggers{' '}
                  <code className="text-red-300">GATE: FAIL BN-00</code> and halts initialization.
                </p>
              </div>

              {/* 3-Step Self-Assessment Pipeline */}
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-white/10 text-xs font-mono text-zinc-300 space-y-2">
                <div className="text-[11px] text-[#00ffff] uppercase tracking-wider font-semibold">
                  // How You Build Your Own Cortex (Self-Assessment Loop):
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
