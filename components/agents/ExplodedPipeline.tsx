'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  ShieldAlert,
  Database,
  Layout,
  FileSpreadsheet,
  Cpu,
  Network,
  TrendingUp,
  FileCheck,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ArrowRight,
  Terminal,
  Sparkles,
  ExternalLink,
  Bot,
} from 'lucide-react';
import PixelBot, { type AgentCode } from '../PixelBot';
import { Badge } from '../ui/badge';

/* ────────────────────────────────────────────────────────────────────────────
 * 3-TIER EXPLODED DEFENSE PIPELINE
 *
 *   Apex     : The Judgment Arbiter (ARB) - Supreme Court of Invariants
 *   Tier 01  : Intake & Specification (PM + UX) - Outer Hull
 *   Tier 02  : Engine & Fabric Layer (SD + IR + GR) - Mid Hull
 *   Tier 03  : Immutable Core (DB + SEC + RS) - Deep Vault
 *
 * Interactive PR Simulator traces verification pulses down the pipeline.
 * ──────────────────────────────────────────────────────────────────────────── */

export interface AgentDetail {
  code: AgentCode;
  name: string;
  role: string;
  tier: 1 | 2 | 3 | 'apex';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  colorBorder: string;
  colorBg: string;
  ruleCode: string;
  ruleTitle: string;
  ruleSnippet: string;
  file: string;
  why: string;
  failureMode: string;
}

export const AGENT_PIPELINE_DATA: Record<AgentCode, AgentDetail> = {
  ARB: {
    code: 'ARB',
    name: 'Judgment Arbiter',
    role: 'The Supreme Court of Invariants',
    tier: 'apex',
    icon: Scale,
    color: 'text-rose-400',
    colorBorder: 'border-rose-500/40',
    colorBg: 'bg-rose-500/10',
    ruleCode: 'ARB-01 / ARB-07',
    ruleTitle: 'Domain Separation & Escalation Sovereignty',
    ruleSnippet: 'An agent or domain must never override the core invariants of another domain without explicit Arbiter escalation.',
    file: 'brain/02-domains/arbiter.md',
    why: 'Prevents rogue agents from weakening security for convenience or overriding append-only database policies.',
    failureMode: 'Deadlocked PRs or cross-domain policy conflicts hard-halt the pipeline until Arbiter issues a written judgment.',
  },
  PM: {
    code: 'PM',
    name: 'Product Manager Agent',
    role: 'The Specification Planner',
    tier: 1,
    icon: FileSpreadsheet,
    color: 'text-amber-400',
    colorBorder: 'border-amber-400/40',
    colorBg: 'bg-amber-400/10',
    ruleCode: 'PM-04',
    ruleTitle: 'Atomic Rule Identification (BR-nn)',
    ruleSnippet: 'Every business rule has ID BRnn, one enforcement layer, one owning agent, and one verification test.',
    file: 'agents/productmanageragent.md',
    why: 'Untagged requirements create scope creep and untestable code. Every feature must declare its exact invariant ID.',
    failureMode: 'PR lacks BR-nn tag or mixes multiple domains into a single untestable specification.',
  },
  UX: {
    code: 'UX',
    name: 'UI / UX Agent',
    role: 'The Accessibility & Frontend Guard',
    tier: 1,
    icon: Layout,
    color: 'text-sky-400',
    colorBorder: 'border-sky-400/40',
    colorBg: 'bg-sky-400/10',
    ruleCode: 'UX-01',
    ruleTitle: 'Zero-FOUC & WCAG AA Contrast',
    ruleSnippet: 'Dark mode: theme class set by synchronous inline pre-paint script (zero FOUC); colors only via semantic tokens; contrast >= 4.5:1.',
    file: 'agents/uiuxagent.md',
    why: 'Prevents jarring visual flashes, inaccessible contrast ratios, and fake optimistic state mismatches.',
    failureMode: 'FOUC white flashes on page reload, hardcoded non-semantic colors, or missing layout-matching skeletons.',
  },
  SD: {
    code: 'SD',
    name: 'Systems Design Agent',
    role: 'The Distributed Architect',
    tier: 2,
    icon: Cpu,
    color: 'text-purple-400',
    colorBorder: 'border-purple-400/40',
    colorBg: 'bg-purple-400/10',
    ruleCode: 'SD-01',
    ruleTitle: 'Explicit CAP / PACELC Declarations',
    ruleSnippet: 'CAP/PACELC declared per workflow in an ADR: offline logging is AP; approval transitions are CP.',
    file: 'agents/systemsdesignagent.md',
    why: 'Distributed architectures fail when engineers assume strong consistency across asynchronous networks.',
    failureMode: 'Undeclared network partition assumptions or scaling mechanisms added without measured bottleneck telemetry.',
  },
  IR: {
    code: 'IR',
    name: 'Integration Agent',
    role: 'The Reliability & Outbox Guard',
    tier: 2,
    icon: Network,
    color: 'text-emerald-400',
    colorBorder: 'border-emerald-400/40',
    colorBg: 'bg-emerald-400/10',
    ruleCode: 'IR-03',
    ruleTitle: 'Client-Originated Idempotency Keys',
    ruleSnippet: 'Idempotency: every client-originated mutation carries a client UUID/ULID persisted before any network call.',
    file: 'agents/integrationagent.md',
    why: 'Network retries without idempotency cause duplicate charges, duplicate records, and split-brain states.',
    failureMode: 'API mutations without client-side idempotency keys or webhook handlers missing signature verification.',
  },
  GR: {
    code: 'GR',
    name: 'Growth Agent',
    role: 'The Telemetry & Consent Officer',
    tier: 2,
    icon: TrendingUp,
    color: 'text-rose-400',
    colorBorder: 'border-rose-400/40',
    colorBg: 'bg-rose-400/10',
    ruleCode: 'GR-05',
    ruleTitle: 'Double Opt-In Consent & Canonical Routing',
    ruleSnippet: 'SEO baseline: unique title/description per route, canonical URLs, JSON-LD structured data, noindex on auth routes.',
    file: 'agents/growthagent.md',
    why: 'Protects user privacy regulations (PH RA 10173 / GDPR) and prevents duplicate URL indexing in search engines.',
    failureMode: 'Marketing tracking firing before user consent or public routes lacking canonical tags.',
  },
  DB: {
    code: 'DB',
    name: 'DBA Agent',
    role: 'The Append-Only Immutability Vault',
    tier: 3,
    icon: Database,
    color: 'text-cyan-400',
    colorBorder: 'border-cyan-400/40',
    colorBg: 'bg-cyan-400/10',
    ruleCode: 'DB-01',
    ruleTitle: 'Three-Layer Append-Only Immutability',
    ruleSnippet: 'Append-only entities revoke UPDATE/DELETE from app roles. Corrections are new rows with supersedes_id.',
    file: 'agents/dbaagent.md',
    why: 'Prevents irreversible data loss and historical rewriting. Financial ledgers and audit logs must never be deleted.',
    failureMode: 'Destructive UPDATE or DELETE issued against immutable tables, or missing foreign key index ladders.',
  },
  SEC: {
    code: 'SEC',
    name: 'Security Agent',
    role: 'The Cryptographic Gatekeeper',
    tier: 3,
    icon: ShieldAlert,
    color: 'text-red-400',
    colorBorder: 'border-red-400/40',
    colorBg: 'bg-red-400/10',
    ruleCode: 'SEC-02',
    ruleTitle: 'RLS Default-Deny & STRIDE Verification',
    ruleSnippet: 'RLS bypass suite required: attempt as anon and cross-role/cross-tenant via REST, RPC, views, and SECURITY DEFINER paths.',
    file: 'agents/securityagent.md',
    why: 'Client-side WHERE clauses fail against direct REST or GraphQL calls. Authorization must be baked into the DB kernel.',
    failureMode: 'Service-role secrets leaked to the client bundle or public tables missing default-deny RLS policies.',
  },
  RS: {
    code: 'RS',
    name: 'Research Agent',
    role: 'The Epistemic Grounding Officer',
    tier: 3,
    icon: FileCheck,
    color: 'text-teal-400',
    colorBorder: 'border-teal-400/40',
    colorBg: 'bg-teal-400/10',
    ruleCode: 'RS-03',
    ruleTitle: 'Anti-Hallucination Triangulation',
    ruleSnippet: 'RS-03: "I don\'t know" rule blocks hallucination. Mandatory source triangulation; separate fact from opinion.',
    file: 'agents/researchagent.md',
    why: 'AI agents hallucinate confidence when unverified. Cortex requires primary citations before landing assertions.',
    failureMode: 'Unsubstantiated claims, missing source citations, or presenting hypotheses as established facts.',
  },
};

interface PRScenario {
  id: string;
  title: string;
  description: string;
  failingTier: 1 | 2 | 3 | null;
  failingCode: AgentCode | null;
  failingRule: string;
  logs: string[];
}

const SCENARIOS: PRScenario[] = [
  {
    id: 'pr-clean',
    title: 'PR #205: Clean Append-Only Invariant Patch',
    description: 'Adds a new immutable audit ledger with client UUID idempotency and RLS default-deny.',
    failingTier: null,
    failingCode: null,
    failingRule: '',
    logs: [
      '[TIER 01: INTAKE] PM-04 Verified: BR-41 assigned with single-concern test harness.',
      '[TIER 01: INTAKE] UX-01 Verified: Zero-FOUC theme tokens and WCAG AA contrast (5.2:1).',
      '[TIER 02: ENGINE] SD-01 Verified: AP/CP boundary declared in ADR-042.',
      '[TIER 02: ENGINE] IR-03 Verified: Client ULID idempotency key persisted before RPC.',
      '[TIER 03: CORE] DB-01 Verified: Append-only ledger; UPDATE/DELETE privileges revoked.',
      '[TIER 03: CORE] SEC-02 Verified: Cross-tenant RLS bypass tests passed for anon & user roles.',
      '[TIER 03: CORE] RS-03 Verified: Triangulated citations verified.',
      '[APEX ARBITER] ARB-01 Approved: All tier invariants satisfied. Cryptographic signoff granted.',
    ],
  },
  {
    id: 'pr-sec-fail',
    title: 'PR #142: Expose Service Role Secret to Client Component',
    description: 'Attempts to use SUPABASE_SERVICE_ROLE_KEY inside a client-side React component to bypass RLS.',
    failingTier: 3,
    failingCode: 'SEC',
    failingRule: 'SEC-02',
    logs: [
      '[TIER 01: INTAKE] PM-04 Verified: Feature ticket found.',
      '[TIER 01: INTAKE] UX-01 Verified: Component renders clean skeleton.',
      '[TIER 02: ENGINE] IR-03 Verified: RPC headers configured.',
      '[TIER 03: CORE] DB-01 Checked: Schema intact.',
      '🚨 [TIER 03: CORE] GATE: FAIL [SEC-02]! Detected service_role secret export in client bundle.',
      '🛑 EXECUTION HALTED: STRIDE threat model violation. RLS bypass attack vector blocked.',
    ],
  },
  {
    id: 'pr-db-fail',
    title: 'PR #108: Hard DELETE on Financial Transactions Table',
    description: 'Tries to clean up failed transactions using SQL "DELETE FROM transactions WHERE status = \'failed\'".',
    failingTier: 3,
    failingCode: 'DB',
    failingRule: 'DB-01',
    logs: [
      '[TIER 01: INTAKE] PM-04 Verified: Requirement ID BR-19 present.',
      '[TIER 02: ENGINE] SD-01 Checked: Latency SLO acceptable.',
      '🚨 [TIER 03: CORE] GATE: FAIL [DB-01]! Destructive DELETE detected on append-only entity.',
      '🛑 EXECUTION HALTED: Revoked DELETE rule triggered. Failed records must be superseded, not erased.',
    ],
  },
  {
    id: 'pr-pm-fail',
    title: 'PR #089: Unstructured PRD Without Rule ID (BR-nn)',
    description: 'Feature branch submitted without stable rule identification, ambiguous ownership, and no tests.',
    failingTier: 1,
    failingCode: 'PM',
    failingRule: 'PM-04',
    logs: [
      '🚨 [TIER 01: INTAKE] GATE: FAIL [PM-04]! No stable BR-nn rule ID declared in PR description.',
      '🛑 EXECUTION HALTED: Procedural kernel refuses unanchored requirements. Single-concern PRD required.',
    ],
  },
];

export default function ExplodedPipeline() {
  const [selectedAgent, setSelectedAgent] = useState<AgentCode | null>('ARB');
  const [activeScenario, setActiveScenario] = useState<PRScenario>(SCENARIOS[0]);
  const [simState, setSimState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [simStep, setSimStep] = useState<number>(0);

  const runSimulation = () => {
    setSimState('running');
    setSimStep(1);

    const timer1 = setTimeout(() => {
      if (activeScenario.failingTier === 1) {
        setSimState('completed');
        return;
      }
      setSimStep(2);

      const timer2 = setTimeout(() => {
        if (activeScenario.failingTier === 2) {
          setSimState('completed');
          return;
        }
        setSimStep(3);

        const timer3 = setTimeout(() => {
          setSimStep(4);
          setSimState('completed');
        }, 800);
        return () => clearTimeout(timer3);
      }, 800);
      return () => clearTimeout(timer2);
    }, 800);

    return () => clearTimeout(timer1);
  };

  const resetSimulation = () => {
    setSimState('idle');
    setSimStep(0);
  };

  const activeAgentMeta = selectedAgent ? AGENT_PIPELINE_DATA[selectedAgent] : null;

  return (
    <div className="space-y-16">
      {/* ── INTERACTIVE SIMULATOR TOOLBAR ── */}
      <div className="rounded-2xl bg-white/80 dark:bg-[#070b16]/90 border border-slate-200 dark:border-cyan-500/25 p-5 md:p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>Step 5: Interactive Defense Circuit Simulator</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-1">
              Simulate Code Commits Against Invariant Gates
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              Select a pull request scenario to watch verification pulses descend through Intake, Engine, and Core.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={runSimulation}
              disabled={simState === 'running'}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{simState === 'running' ? 'Verifying...' : 'Run PR Simulation'}</span>
            </button>
            <button
              onClick={resetSimulation}
              title="Reset Simulation"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scenario Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-4">
          {SCENARIOS.map((sc) => {
            const isSelected = activeScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setActiveScenario(sc);
                  resetSimulation();
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-900 dark:text-cyan-100 shadow-md'
                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                    {sc.failingTier ? `FAILS TIER 0${sc.failingTier}` : 'CLEAN PASS'}
                  </span>
                  {sc.failingCode && (
                    <Badge variant="destructive" className="text-[9px] py-0 px-1.5 font-mono">
                      {sc.failingCode}
                    </Badge>
                  )}
                </div>
                <div className="text-xs font-bold truncate">{sc.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                  {sc.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Simulation Output Logs Console */}
        {simState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10"
          >
            <div className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs space-y-1.5 border border-cyan-500/30 overflow-x-auto shadow-inner">
              <div className="flex items-center justify-between pb-1 text-[10px] text-cyan-400/80 border-b border-cyan-500/20">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  GATE EXECUTION TELEMETRY
                </span>
                <span>STATUS: {simState === 'running' ? 'ANALYZING...' : activeScenario.failingTier ? 'REJECTED' : 'PASSED'}</span>
              </div>
              {activeScenario.logs.slice(0, simStep * 2).map((log, i) => {
                const isFail = log.includes('GATE: FAIL');
                const isApproved = log.includes('Approved');
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-2 ${
                      isFail
                        ? 'text-red-400 font-bold bg-red-950/40 p-1 rounded'
                        : isApproved
                        ? 'text-emerald-400 font-bold'
                        : 'text-slate-300'
                    }`}
                  >
                    <span>{'>'}</span>
                    <span>{log}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── THE 3-TIER EXPLODED DEFENSE PIPELINE ── */}
      <div className="relative space-y-10">
        {/* Animated Connecting Electrical SVG Traces */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-4 pointer-events-none z-0">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <line
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              stroke="rgba(34,211,238,0.25)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {simState === 'running' && (
              <motion.line
                x1="50%"
                y1="0%"
                x2="50%"
                y2="100%"
                stroke="#22d3ee"
                strokeWidth="3"
                animate={{ strokeDashoffset: [0, -100] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={{ strokeDasharray: '8 8', filter: 'drop-shadow(0 0 6px #22d3ee)' }}
              />
            )}
          </svg>
        </div>

        {/* ── STEP 1: FLOATING PINNACLE (ARBITER APEX) ── */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-center mb-3">
            <span className="text-[10px] font-mono tracking-[0.3em] text-rose-500 font-bold uppercase bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
              Step 1: Supreme Court Pinnacle // ARB-01
            </span>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedAgent('ARB')}
            className={`w-full max-w-2xl rounded-2xl bg-gradient-to-b from-rose-950/30 via-slate-900/90 to-[#070b16] border-2 p-6 md:p-8 backdrop-blur-xl shadow-2xl cursor-pointer transition-all ${
              selectedAgent === 'ARB'
                ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.35)]'
                : 'border-rose-500/30 hover:border-rose-500/60'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 shrink-0">
                <PixelBot code="ARB" size={68} showNameTag={false} knowledge={100} bobDelay={0} />
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-rose-400" />
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] border-rose-500/40 text-rose-300">
                    ARB-01 & ARB-07
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">•</span>
                  <span className="text-xs font-mono text-rose-400 font-bold uppercase">The Judgment Arbiter</span>
                </div>
                <h4 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  The Invariant Supreme Court
                </h4>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                  The floating apex of Cortex governance. Adjudicates irreconcilable cross-domain conflicts, forbids
                  unauthorized rule overrides, and cryptographically ratifies production deployment passes.
                </p>
                <div className="pt-2 flex items-center justify-center sm:justify-start gap-4 text-xs font-mono text-rose-300/90">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                    Domain Sovereignty Enforced
                  </span>
                  <span>•</span>
                  <span>Escalation Gate Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── STEP 2: TIER 01 (INTAKE & SPECIFICATION - OUTER HULL) ── */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
              <h4 className="text-xs md:text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Step 2: Tier 01 // Intake & Specification Layer (Outer Defense Hull)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-amber-500 dark:text-amber-400 uppercase font-bold">
              Boundary & Specification Gate
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['PM', 'UX'] as AgentCode[]).map((code) => {
              const agent = AGENT_PIPELINE_DATA[code];
              const Icon = agent.icon;
              const isSelected = selectedAgent === code;
              const isFailing =
                simState === 'completed' && activeScenario.failingCode === code;

              return (
                <motion.div
                  key={code}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedAgent(code)}
                  className={`rounded-2xl p-6 border backdrop-blur-xl transition-all cursor-pointer flex flex-col justify-between ${
                    isFailing
                      ? 'bg-red-500/10 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.35)]'
                      : isSelected
                      ? 'bg-white/95 dark:bg-[#070e1c] border-cyan-400 shadow-xl'
                      : 'bg-white/80 dark:bg-[#070b16]/80 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <PixelBot code={code} size={54} showNameTag={false} knowledge={95} bobDelay={1} />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge variant="outline" className={`font-mono text-[10px] ${agent.colorBorder} ${agent.color}`}>
                          {agent.ruleCode}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">{agent.file}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        [{agent.code}] • {agent.role}
                      </div>
                      <h5 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{agent.name}</h5>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
                      {agent.why}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">{agent.ruleTitle}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── STEP 3: TIER 02 (ENGINE & FABRIC - MID HULL) ── */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_10px_#c084fc]" />
              <h4 className="text-xs md:text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Step 3: Tier 02 // Engine & Fabric Layer (Mid Defense Hull)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-purple-500 dark:text-purple-400 uppercase font-bold">
              Distributed Network & Telemetry Gate
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['SD', 'IR', 'GR'] as AgentCode[]).map((code) => {
              const agent = AGENT_PIPELINE_DATA[code];
              const isSelected = selectedAgent === code;
              const isFailing =
                simState === 'completed' && activeScenario.failingCode === code;

              return (
                <motion.div
                  key={code}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedAgent(code)}
                  className={`rounded-2xl p-6 border backdrop-blur-xl transition-all cursor-pointer flex flex-col justify-between ${
                    isFailing
                      ? 'bg-red-500/10 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.35)]'
                      : isSelected
                      ? 'bg-white/95 dark:bg-[#070e1c] border-cyan-400 shadow-xl'
                      : 'bg-white/80 dark:bg-[#070b16]/80 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <PixelBot code={code} size={50} showNameTag={false} knowledge={92} bobDelay={2} />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge variant="outline" className={`font-mono text-[10px] ${agent.colorBorder} ${agent.color}`}>
                          {agent.ruleCode}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">{agent.file}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        [{agent.code}] • {agent.role}
                      </div>
                      <h5 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{agent.name}</h5>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
                      {agent.why}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">{agent.ruleTitle}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── STEP 4: TIER 03 (IMMUTABLE CORE - DEEP VAULT) ── */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <h4 className="text-xs md:text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Step 4: Tier 03 // Immutable Core Layer (Deep Cryptographic Vault)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-cyan-500 dark:text-cyan-400 uppercase font-bold">
              Immutability & Threat Gate
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['DB', 'SEC', 'RS'] as AgentCode[]).map((code) => {
              const agent = AGENT_PIPELINE_DATA[code];
              const isSelected = selectedAgent === code;
              const isFailing =
                simState === 'completed' && activeScenario.failingCode === code;

              return (
                <motion.div
                  key={code}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedAgent(code)}
                  className={`rounded-2xl p-6 border backdrop-blur-xl transition-all cursor-pointer flex flex-col justify-between ${
                    isFailing
                      ? 'bg-red-500/10 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.35)]'
                      : isSelected
                      ? 'bg-white/95 dark:bg-[#070e1c] border-cyan-400 shadow-xl'
                      : 'bg-white/80 dark:bg-[#070b16]/80 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <PixelBot code={code} size={50} showNameTag={false} knowledge={98} bobDelay={3} />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge variant="outline" className={`font-mono text-[10px] ${agent.colorBorder} ${agent.color}`}>
                          {agent.ruleCode}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">{agent.file}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        [{agent.code}] • {agent.role}
                      </div>
                      <h5 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{agent.name}</h5>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
                      {agent.why}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">{agent.ruleTitle}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ACTIVE AGENT INVARIANT INSPECTOR PANEL ── */}
      <AnimatePresence mode="wait">
        {activeAgentMeta && (
          <motion.div
            key={activeAgentMeta.code}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="rounded-2xl bg-white/90 dark:bg-[#080d1a] border-2 border-cyan-500/40 p-6 md:p-8 shadow-2xl space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <PixelBot code={activeAgentMeta.code} size={58} showNameTag={false} knowledge={100} bobDelay={0} />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
                    ACTIVE INSPECTOR // [{activeAgentMeta.code}]
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white">
                    {activeAgentMeta.name} — {activeAgentMeta.role}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/hq"
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Dock in Pixel HQ</span>
                </Link>
                <a
                  href={`https://github.com/dropoflife13/MyBrain/blob/main/${activeAgentMeta.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 transition-all"
                >
                  <span>Inspect Markdown</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Invariant Statement & Code Block */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                    Invariant Rule Statement
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {activeAgentMeta.ruleCode}: {activeAgentMeta.ruleTitle}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed shadow-inner">
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold mr-2">{activeAgentMeta.ruleCode}:</span>
                  <span>{activeAgentMeta.ruleSnippet}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                    Why It Exists & Enforcement Mode
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-sans mt-1">
                    {activeAgentMeta.why}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs font-mono text-red-600 dark:text-red-400">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>FAILURE REJECTION CONDITION:</span>
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-700 dark:text-red-200">
                    {activeAgentMeta.failureMode}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
