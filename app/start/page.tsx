'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Compass,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  Key,
  Laptop,
  Play,
  Sparkles,
  Terminal,
  Workflow,
} from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export default function StartPage() {
  const [copiedEnv, setCopiedEnv] = useState<boolean>(false);
  const [copiedInstall, setCopiedInstall] = useState<boolean>(false);
  const [copiedDev, setCopiedDev] = useState<boolean>(false);
  const [copiedRule, setCopiedRule] = useState<boolean>(false);
  const [copiedFactory, setCopiedFactory] = useState<boolean>(false);

  const copyToClipboard = (
    text: string,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
      setter(true);
      setTimeout(() => setter(false), 2200);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300 selection:bg-cyan-500 selection:text-black font-sans overflow-x-hidden">
      {/* Layered Atmospheric Background Grid & Radial Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 25%, rgba(0, 255, 255, 0.07) 0%, transparent 60%),
            radial-gradient(rgba(0, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px',
        }}
      />

      {/* Top Floating Command Bar */}
      <header className="fixed top-4 left-4 right-4 md:left-8 md:right-8 z-40 flex items-center justify-between gap-4 pointer-events-none">
        {/* Left: Back to Home + Brand Pill */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/85 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-white backdrop-blur-xl transition-all shadow-xl cursor-pointer"
            title="Return to Home"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl">
            <img
              src="/cortex-logo-cyan.svg"
              alt="Cortex Logo"
              className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(0,255,255,0.45)]"
            />
            <span className="text-xs font-mono font-bold tracking-widest text-slate-900 dark:text-white uppercase">
              CORTEX
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
              GUIDE
            </span>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <ThemeToggle />

          <Link
            href="/agents"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/85 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 backdrop-blur-xl transition-all shadow-xl"
          >
            <span>The Agents</span>
          </Link>

          <Link
            href="/console"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] cursor-pointer"
          >
            <span>Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Hero Introduction */}
        <div className="text-center space-y-4 mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/25 dark:border-cyan-400/25 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-semibold tracking-wider uppercase shadow-sm">
            <Compass className="w-3.5 h-3.5" />
            <span>The Initiation Protocol • Beginner&apos;s Guide</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
            Your Personal Cortex, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 dark:from-cyan-400 dark:via-sky-300 dark:to-blue-500">
              Step by Step.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            You don&apos;t need to be a software engineer or understand complex Git commands to run
            your own 3D judgment vault. Follow these 7 simple steps to get your Cortex running
            locally, encode your judgment, and build with AI agents.
          </p>
        </div>

        {/* 7-Step Vertical Timeline */}
        <div className="relative border-l-2 border-cyan-500/30 dark:border-cyan-400/25 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-16">
          {/* STEP 1: Download the Vault */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative space-y-4"
          >
            {/* Timeline Number Node */}
            <div className="absolute -left-[35px] sm:-left-[51px] top-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 text-black font-mono font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,255,255,0.6)]">
              01
            </div>

            <div className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-4 hover:border-cyan-400/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-mono flex items-center gap-2">
                  <Download className="w-5 h-5 text-cyan-500 dark:text-[#00ffff]" />
                  <span>Download the Vault</span>
                </h2>
                <Badge variant="outline" className="w-fit text-[10px] font-mono text-cyan-600 dark:text-cyan-300">
                  NO GIT REQUIRED
                </Badge>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
                Don&apos;t worry about terminal clone commands or GitHub setup. Download the clean
                starter <code className="font-mono text-cyan-600 dark:text-cyan-300">.zip</code> archive and unzip it anywhere on your computer (for example, directly to your Desktop).
              </p>

              <div className="pt-2">
                <a
                  href="/brain-template.zip"
                  download="brain-vault-blank-template.zip"
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-sm shadow-[0_0_25px_rgba(0,255,255,0.4)] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Starter Vault (.zip)</span>
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-zinc-900/70 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-mono">
                ✓ Unzipping gives you the complete ready-to-run folder with the 7 Agent Gatekeepers and all 3D engine assets.
              </div>
            </div>
          </motion.div>

          {/* STEP 2: Get a Free Gemini API Key */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative space-y-4"
          >
            {/* Timeline Number Node */}
            <div className="absolute -left-[35px] sm:-left-[51px] top-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 text-black font-mono font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,255,255,0.6)]">
              02
            </div>

            <div className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-4 hover:border-cyan-400/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-mono flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-500 dark:text-[#00ffff]" />
                  <span>Get an API Key</span>
                </h2>
                <Badge variant="outline" className="w-fit text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                  100% FREE • NO CREDIT CARD
                </Badge>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
                Your Cortex uses Google Gemini to power its reasoning agents and interactive
                self-assessment. Go to Google AI Studio to generate your personal free API key.
              </p>

              <div className="pt-2">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-cyan-500/40 dark:border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-mono font-semibold text-sm transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Key className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                  <span>Get Free Gemini API Key (Google AI Studio)</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>

              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-zinc-400 font-mono pl-1">
                <li>Sign in with any standard Google account.</li>
                <li>Click <strong className="text-slate-900 dark:text-white">&ldquo;Create API key&rdquo;</strong> in the dashboard.</li>
                <li>Copy the generated key to your clipboard.</li>
              </ol>
            </div>
          </motion.div>

          {/* STEP 3: Set up VS Code */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative space-y-4"
          >
            {/* Timeline Number Node */}
            <div className="absolute -left-[35px] sm:-left-[51px] top-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 text-black font-mono font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,255,255,0.6)]">
              03
            </div>

            <div className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-4 hover:border-cyan-400/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-mono flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-cyan-500 dark:text-[#00ffff]" />
                  <span>Set up VS Code</span>
                </h2>
                <Badge variant="outline" className="w-fit text-[10px] font-mono text-cyan-600 dark:text-cyan-300">
                  CONFIGURATION
                </Badge>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
                Download and open <a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 underline underline-offset-4">Visual Studio Code</a>. Open your unzipped folder (<code className="font-mono text-xs">File → Open Folder...</code>), create a new file named <code className="font-mono text-cyan-600 dark:text-cyan-300 font-bold">.env.local</code> in the root, and paste your key:
              </p>

              {/* Code Snippet Box */}
              <div className="relative rounded-xl bg-zinc-950 border border-white/10 overflow-hidden font-mono shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-white/10 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] text-zinc-300">.env.local</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard('GEMINI_API_KEY=your_key_here', setCopiedEnv)
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] text-cyan-400 transition-colors cursor-pointer"
                  >
                    {copiedEnv ? (
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
                    <span className="text-cyan-400 font-semibold">GEMINI_API_KEY</span>=
                    <span className="text-amber-300">your_key_here</span>
                  </code>
                </pre>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                Replace <code className="text-amber-500 dark:text-amber-300">your_key_here</code> with the actual key you copied from Google AI Studio.
              </p>
            </div>
          </motion.div>

          {/* STEP 4: Run the App */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative space-y-4"
          >
            {/* Timeline Number Node */}
            <div className="absolute -left-[35px] sm:-left-[51px] top-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 text-black font-mono font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,255,255,0.6)]">
              04
            </div>

            <div className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-4 hover:border-cyan-400/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-mono flex items-center gap-2">
                  <Play className="w-5 h-5 text-cyan-500 dark:text-[#00ffff]" />
                  <span>Run the App</span>
                </h2>
                <Badge variant="outline" className="w-fit text-[10px] font-mono text-cyan-600 dark:text-cyan-300">
                  TERMINAL COMMANDS
                </Badge>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
                Make sure you have <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 underline underline-offset-4">Node.js</a> installed. In VS Code, open the integrated terminal (press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-xs font-mono">Ctrl + `</kbd> on Windows or <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-xs font-mono">Cmd + `</kbd> on Mac), and run:
              </p>

              {/* Command 1: npm install */}
              <div className="space-y-3">
                <div className="relative rounded-xl bg-zinc-950 border border-white/10 overflow-hidden font-mono shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-white/10 text-xs text-zinc-400">
                    <span className="text-[11px] text-zinc-300">1. Install dependencies</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('npm install', setCopiedInstall)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] text-cyan-400 transition-colors cursor-pointer"
                    >
                      {copiedInstall ? (
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
                  <pre className="p-4 text-xs sm:text-sm text-cyan-400 leading-relaxed">
                    <code>npm install</code>
                  </pre>
                </div>

                {/* Command 2: npm run dev */}
                <div className="relative rounded-xl bg-zinc-950 border border-white/10 overflow-hidden font-mono shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-white/10 text-xs text-zinc-400">
                    <span className="text-[11px] text-zinc-300">2. Launch local server</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('npm run dev', setCopiedDev)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] text-cyan-400 transition-colors cursor-pointer"
                    >
                      {copiedDev ? (
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
                  <pre className="p-4 text-xs sm:text-sm text-emerald-400 leading-relaxed">
                    <code>npm run dev</code>
                  </pre>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-700 dark:text-emerald-300 font-mono">
                🎉 Open your browser and navigate to <strong className="text-slate-900 dark:text-white">http://localhost:3000</strong>. Your 3D constellation is live!
              </div>
            </div>
          </motion.div>

          {/* STEP 5: Add Your First Rule */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative space-y-4"
          >
            {/* Timeline Number Node */}
            <div className="absolute -left-[35px] sm:-left-[51px] top-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 text-black font-mono font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,255,255,0.6)]">
              05
            </div>

            <div className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-4 hover:border-cyan-400/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-mono flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-500 dark:text-[#00ffff]" />
                  <span>Write Your Engineering Rules</span>
                </h2>
                <Badge variant="outline" className="w-fit text-[10px] font-mono text-cyan-600 dark:text-cyan-300">
                  MARKDOWN VAULT
                </Badge>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
                Open any markdown file in <code className="font-mono text-xs text-cyan-600 dark:text-cyan-300">brain/02-domains/</code> or <code className="font-mono text-xs text-cyan-600 dark:text-cyan-300">agents/</code>. Define your hard engineering gates using the standard <code className="font-mono text-xs text-cyan-500 font-bold">WHEN... DO...</code> trigger format. Every saved rule automatically materializes as a synaptic coordinate in your 3D brain. Think of this as writing to your permanent memory. The AI will use this rule to govern your future projects, even years from now.
              </p>

              {/* Code Snippet Box */}
              <div className="relative rounded-xl bg-zinc-950 border border-white/10 overflow-hidden font-mono shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-white/10 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] text-zinc-300">Example Rule Format (.md)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        '- **RULE-01** WHEN client requests unindexed query → REJECT and mandate index.',
                        setCopiedRule
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] text-cyan-400 transition-colors cursor-pointer"
                  >
                    {copiedRule ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Rule</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 text-xs sm:text-sm text-zinc-200 overflow-x-auto leading-relaxed">
                  <code>
                    <span className="text-zinc-500">- </span>
                    <strong className="text-cyan-400 font-bold">**RULE-01**</strong>{' '}
                    <span className="text-slate-100">WHEN client requests unindexed query → REJECT and mandate index.</span>
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>

          {/* STEP 6: Run the Software Factory */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative space-y-4"
          >
            {/* Timeline Number Node */}
            <div className="absolute -left-[35px] sm:-left-[51px] top-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 text-black font-mono font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,255,255,0.6)]">
              06
            </div>

            <div className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-4 hover:border-cyan-400/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-mono flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-cyan-500 dark:text-[#00ffff]" />
                  <span>Run the Software Factory</span>
                </h2>
                <Badge variant="outline" className="w-fit text-[10px] font-mono text-cyan-600 dark:text-cyan-300">
                  BUILD WITH AI AGENTS
                </Badge>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
                Open the 3D Console and click any node. The sliding chat panel is your AI factory. Type <code className="font-mono text-xs text-cyan-600 dark:text-cyan-300 font-bold">/grill</code> to interrogate a new idea, or <code className="font-mono text-xs text-cyan-600 dark:text-cyan-300 font-bold">/to-spec</code> to generate a PRD. The AI will read your Markdown rules before writing a single line of code.
              </p>

              {/* 6-Command Pipeline Matrix Card */}
              <div className="relative rounded-xl bg-zinc-950 border border-white/10 overflow-hidden font-mono shadow-2xl space-y-0">
                <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-white/10 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] text-zinc-300">The Golden Path (8 SDLC &amp; Research Commands)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        '/grill -> /pitch -> /to-spec -> /to-tickets -> /implement -> /review -> /harden -> /research',
                        setCopiedFactory
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] text-cyan-400 transition-colors cursor-pointer"
                  >
                    {copiedFactory ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Pipeline</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 space-y-1">
                    <span className="text-cyan-400 font-bold">/grill</span>
                    <p className="text-[11px] text-zinc-400">Edge-case interrogation (PM)</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 space-y-1">
                    <span className="text-cyan-400 font-bold">/pitch</span>
                    <p className="text-[11px] text-zinc-400">3-min value prop &amp; GTM (GR)</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 space-y-1">
                    <span className="text-cyan-400 font-bold">/to-spec</span>
                    <p className="text-[11px] text-zinc-400">PRD + architecture rules (PM+SD)</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 space-y-1">
                    <span className="text-cyan-400 font-bold">/to-tickets</span>
                    <p className="text-[11px] text-zinc-400">5 atomic tickets (PM)</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 space-y-1">
                    <span className="text-cyan-400 font-bold">/implement</span>
                    <p className="text-[11px] text-zinc-400">Code obeying gates (DB+SEC)</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 space-y-1">
                    <span className="text-cyan-400 font-bold">/review</span>
                    <p className="text-[11px] text-zinc-400">STRIDE &amp; BN-00 audit (SEC+SD)</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 space-y-1">
                    <span className="text-purple-400 font-bold">/harden</span>
                    <p className="text-[11px] text-zinc-400">Enterprise DB &amp; SEC audit</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 space-y-1">
                    <span className="text-emerald-400 font-bold">/research</span>
                    <p className="text-[11px] text-zinc-400">Source triangulation (RS)</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* STEP 7: The Long-Term Game */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative space-y-4"
          >
            {/* Timeline Number Node */}
            <div className="absolute -left-[35px] sm:-left-[51px] top-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 text-black font-mono font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,255,255,0.6)]">
              07
            </div>

            <div className="rounded-2xl bg-white/85 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-4 hover:border-cyan-400/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-mono flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-500 dark:text-[#00ffff]" />
                  <span>7. A Brain for the Rest of Your Career</span>
                </h2>
                <Badge variant="outline" className="w-fit text-[10px] font-mono text-cyan-600 dark:text-cyan-300">
                  THE LONG-TERM GAME
                </Badge>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
                You just built a permanent external memory. Whenever you learn a new architectural trade-off, add it to <code className="font-mono text-xs text-cyan-600 dark:text-cyan-300 font-bold">brain/</code>. Whenever you start a new project, run the <code className="font-mono text-xs text-cyan-600 dark:text-cyan-300 font-bold">/to-spec</code> pipeline. Even if you forget a rule in 5 years, the Cortex will remember it for you. This isn&apos;t just a 3D graph—it&apos;s your evolving engineering judgment.
              </p>

              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                  <span>The Lifelong Judgment Protocol</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs font-mono text-slate-700 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">01.</span>
                    <span>Assess your tacit engineering instincts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">02.</span>
                    <span>Extract hidden non-negotiable rules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">03.</span>
                    <span>Permanently store them in your vault</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">04.</span>
                    <span>Apply gates to all future codebases</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Call to Action */}
        <div className="mt-20 pt-12 border-t border-slate-200 dark:border-white/10 flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white font-mono">
              Ready to Explore?
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
              Dive into the interactive 3D console to inspect the 360 synaptic coordinates and 7 execution gatekeepers live.
            </p>
          </div>

          <Link
            href="/console"
            className="group inline-flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-base sm:text-lg px-8 py-4 rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_50px_rgba(34,211,238,0.85)] hover:scale-105 active:scale-95 cursor-pointer font-mono"
          >
            <span>I&apos;m Ready. Open the Console</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/"
            className="text-xs font-mono text-slate-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            ← Return to Landing Page
          </Link>
        </div>
      </main>
    </div>
  );
}

