'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Cpu,
  Database,
  ExternalLink,
  FileSpreadsheet,
  Layout,
  Network,
  ShieldAlert,
  Terminal,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { ThemeToggle } from '../../components/ThemeToggle';

interface AgentInfo {
  code: 'DB' | 'SEC' | 'UX' | 'PM' | 'SD' | 'IR' | 'GR';
  name: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  ruleCode: string;
  ruleSnippet: string;
  file: string;
  accent: string;
}

const AGENTS: AgentInfo[] = [
  {
    code: 'SEC',
    name: 'Security Agent',
    role: 'The Gatekeeper',
    icon: ShieldAlert,
    description:
      'Prevents RLS bypasses, executes STRIDE threat modeling, blocks client-side service_role secrets, and audits HMAC webhook authenticity.',
    ruleCode: 'SEC-02',
    ruleSnippet:
      'RLS bypass suite required: attempt as anon and cross-role/cross-tenant via REST, RPC, views, and SECURITY DEFINER paths.',
    file: 'agents/securityagent.md',
    accent: 'text-red-400 border-red-500/30 bg-red-500/10',
  },
  {
    code: 'DB',
    name: 'DBA Agent',
    role: 'The Database',
    icon: Database,
    description:
      'Guarantees 3-layer append-only immutability, RLS default-deny, FK integrity with ON DELETE RESTRICT, and indexed query scaling ladders.',
    ruleCode: 'DB-01',
    ruleSnippet:
      'Append-only entities revoke UPDATE/DELETE from app roles. Corrections are new rows with supersedes_id.',
    file: 'agents/dbaagent.md',
    accent: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
  },
  {
    code: 'UX',
    name: 'UI / UX Agent',
    role: 'The Frontend',
    icon: Layout,
    description:
      'Enforces synchronous zero-FOUC theme scripts, WCAG AA contrast (≥4.5:1), layout-matching skeletons, and honest non-fake saves.',
    ruleCode: 'UX-01',
    ruleSnippet:
      'Dark mode: theme class set by synchronous inline pre-paint script (zero FOUC); colors only via semantic tokens; WCAG AA contrast >= 4.5:1.',
    file: 'agents/uiuxagent.md',
    accent: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
  },
  {
    code: 'PM',
    name: 'Product Manager Agent',
    role: 'The Planner',
    icon: FileSpreadsheet,
    description:
      'Defines single-concern PRDs, assigns stable rule IDs (BR-nn), protects the MVP via LATER.md, and maps defense QA attacks.',
    ruleCode: 'PM-04',
    ruleSnippet:
      'Every business rule has ID BRnn, one enforcement layer, one owning agent, and one verification test.',
    file: 'agents/productmanageragent.md',
    accent: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  },
  {
    code: 'SD',
    name: 'Systems Design Agent',
    role: 'The Architect',
    icon: Cpu,
    description:
      'Declares CAP/PACELC per workflow in an ADR, sets latency SLOs, and forbids scaling mechanisms without measured bottleneck evidence.',
    ruleCode: 'SD-01',
    ruleSnippet:
      'CAP/PACELC declared per workflow in an ADR: offline logging is AP; approval transitions are CP.',
    file: 'agents/systemsdesignagent.md',
    accent: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  },
  {
    code: 'IR',
    name: 'Integration Agent',
    role: 'The Reliability Engineer',
    icon: Network,
    description:
      'Enforces versioned webhook envelopes, client-originated idempotency keys, outbox sync state machines, and exponential backoff with jitter.',
    ruleCode: 'IR-03',
    ruleSnippet:
      'Idempotency: every client-originated mutation carries a client UUID/ULID persisted before any network call.',
    file: 'agents/integrationagent.md',
    accent: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  },
  {
    code: 'GR',
    name: 'Growth Agent',
    role: 'The Marketing',
    icon: TrendingUp,
    description:
      'Enforces double opt-in consent records (PH RA 10173), validates lowercase kebab-case UTM links, and verifies public telemetry claims.',
    ruleCode: 'GR-05',
    ruleSnippet:
      'SEO baseline: unique title/description per route, canonical URLs, JSON-LD structured data, noindex on auth routes.',
    file: 'agents/growthagent.md',
    accent: 'text-rose-400 border-rose-400/30 bg-rose-400/10',
  },
];

export default function AgentsPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300 selection:bg-cyan-500 selection:text-black">
      {/* Precision Blueprint Grid & Vignette Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 30%, transparent 40%, rgba(2, 6, 23, 0.08) 100%),
            radial-gradient(rgba(0, 255, 255, 0.04) 1px, transparent 1px)
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
          <span className="font-bold text-slate-900 dark:text-white">THE 7-AGENT SUITE</span>
          <span className="text-slate-400 dark:text-zinc-500">•</span>
          <span className="text-slate-500 dark:text-zinc-400">RULE BN-00 GOVERNANCE</span>
        </div>

        {/* Right CTA + Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/start"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-white/10 text-xs font-mono transition-all shadow-xl backdrop-blur-xl"
          >
            <span>Beginner&apos;s Guide</span>
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
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="default" className="text-xs uppercase tracking-widest px-3 py-1">
            Execution Invariants // Gate Mode Default
          </Badge>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            The 7 Autonomous Gatekeepers
          </h1>

          <p className="text-base md:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
            Every file in <code className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">/agents</code> enforces
            non-negotiable architectural standards. They review code in Gate Mode, blocking unvetted changes
            with <code className="text-red-500 font-mono">GATE: FAIL</code>.
          </p>
        </div>

        {/* 7 Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENTS.map((agent, idx) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.code}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="rounded-2xl bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-7 space-y-5 hover:border-cyan-400/50 transition-all shadow-xl dark:shadow-2xl flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner ${agent.accent}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {agent.file}
                    </Badge>
                  </div>

                  {/* Title & Role */}
                  <div>
                    <div className="text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase">
                      [{agent.code}] • {agent.role}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {agent.name}
                    </h2>
                  </div>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
                    {agent.description}
                  </p>
                </div>

                {/* Code Snippet Box */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
                      Invariant Rule
                    </span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{agent.ruleCode}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-950/90 border border-slate-200 dark:border-white/10 font-mono text-xs text-slate-800 dark:text-zinc-300 leading-relaxed overflow-x-auto">
                    <span className="text-cyan-600 dark:text-cyan-400 font-semibold mr-1.5">
                      {agent.ruleCode}:
                    </span>
                    <span>{agent.ruleSnippet.replace(/^[^:]+:\s*/, '')}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

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
            human judgment, trade-offs, and boundary conditions. The 7-Agent Suite (<code className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">/agents</code>)
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
          <img src="/cortex-logo-cyan.svg" alt="Cortex" className="w-4 h-4 object-contain" />
          <span>CORTEX RUNTIME // 7-AGENT SUITE DIRECTORY</span>
        </div>
        <Link href="/" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
          Return to Overview
        </Link>
      </footer>
    </div>
  );
}

