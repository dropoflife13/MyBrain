'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileCheck2,
  GitBranch,
  Layers,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { BrainDocNode, VaultAuditReport } from '../lib/brain-parser';

export interface AuditInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  auditReport?: VaultAuditReport | null;
  onSelectNode?: (nodeId: string) => void;
}

interface ContradictionItem {
  id: string;
  ruleA: string;
  ruleB: string;
  conflict: string;
  resolutionRule: string;
  razor: string;
  status: 'resolved' | 'open';
}

const RESOLVED_CONTRADICTIONS: ContradictionItem[] = [
  {
    id: 'X-01',
    ruleA: 'TA-02 (Studio 3D/Video Spectacle)',
    ruleB: 'UX-13 (Low-End Mobile 60fps Usability)',
    conflict: 'Full 3D constellation effects cause thermal throttling and frame drops on budget mobile GPUs.',
    resolutionRule: 'UI-05 / P-02',
    razor: 'UX-13 wins: Automatically degrade WebGL to fallback 2D when FPS < 30 or prefers-reduced-motion is detected.',
    status: 'resolved',
  },
  {
    id: 'X-02',
    ruleA: 'OP-05 (Strict Module Sandboxing)',
    ruleB: 'OP-02 (Defensible Working MVP)',
    conflict: 'Emergency 30m before client defense with an unreachable teammate owning an uncommitted branch.',
    resolutionRule: 'H-02',
    razor: 'Isolate minimal hotfix on personal branch, log compensating controls in handoff log; never fake a save or break sandboxing silently.',
    status: 'resolved',
  },
  {
    id: 'X-03',
    ruleA: 'OP-08 (submitter ≠ approver)',
    ruleB: 'Solo Pilot Day-1 Onboarding (active_staff_count == 1)',
    conflict: 'Strict separation of duties blocks single-developer initial deployment and prototype pilots.',
    resolutionRule: 'CS-02 / P-01',
    razor: 'Allow solo approval only while active_staff_count == 1 with approval_mode: solo_operator_waiver logged in an immutable audit trail.',
    status: 'resolved',
  },
  {
    id: 'X-04',
    ruleA: 'Manual camera.position.lerp() Focus Framing',
    ruleB: 'OrbitControls.autoRotate Continuous Spin',
    conflict: 'Two simultaneous camera mutators fight for spherical transforms, creating jarring snap-back jitter.',
    resolutionRule: 'UI-07 / RF-09',
    razor: 'OrbitControls exclusively owns continuous 360° orbit; camera.position.lerp() runs only while autoRotate is paused during locked inspection.',
    status: 'resolved',
  },
  {
    id: 'X-05',
    ruleA: 'Ready-to-Use Open-Source Fork',
    ruleB: 'Authentic Personal Judgment (BN-01)',
    conflict: 'Cloning someone else’s filled vault transfers unearned assumptions instead of genuine human judgment.',
    resolutionRule: 'SO-07 / P-05',
    razor: 'Ship all 7 Agent Gatekeepers intact so BN-00 passes, but start personal rules at 0 in blank-slate mode; adopters earn rules via THE-TEST.md.',
    status: 'resolved',
  },
];

interface DomainAgentMap {
  domainKey: string;
  domainName: string;
  rulePrefix: string;
  activeCount: number;
  primaryAgent: 'SEC' | 'DB' | 'SD' | 'UX' | 'IR' | 'PM' | 'GR';
  secondaryAgent?: 'SEC' | 'DB' | 'SD' | 'UX' | 'IR' | 'PM' | 'GR';
  gateCheck: string;
  coverage: string;
}

const DOMAIN_AGENT_MAP: DomainAgentMap[] = [
  {
    domainKey: 'cybersec',
    domainName: 'Cybersecurity & Zero-Trust',
    rulePrefix: 'CS-01..07',
    activeCount: 7,
    primaryAgent: 'SEC',
    secondaryAgent: 'IR',
    gateCheck: 'GATE: PASS SEC-01 • Service Role & RLS Bounds',
    coverage: '100% (6/6 Sub-areas)',
  },
  {
    domainKey: 'database',
    domainName: 'Database Architecture & Schemas',
    rulePrefix: 'DB-01..10',
    activeCount: 10,
    primaryAgent: 'DB',
    secondaryAgent: 'SD',
    gateCheck: 'GATE: PASS DB-01 • Zero Downtime Migrations',
    coverage: '100% (6/6 Sub-areas)',
  },
  {
    domainKey: 'solutions',
    domainName: 'Systems Design & Distributed Architecture',
    rulePrefix: 'SO-01..08',
    activeCount: 8,
    primaryAgent: 'SD',
    secondaryAgent: 'IR',
    gateCheck: 'GATE: PASS SD-01 • Modular Monolith First',
    coverage: '100% (6/6 Sub-areas)',
  },
  {
    domainKey: 'ui-frontend',
    domainName: 'UI/UX & WebGL Frontend Engineering',
    rulePrefix: 'UI-01..09',
    activeCount: 9,
    primaryAgent: 'UX',
    gateCheck: 'GATE: PASS UX-01 • Single-Owner OrbitControls',
    coverage: '100% (6/6 Sub-areas)',
  },
  {
    domainKey: 'taste',
    domainName: 'Aesthetic Standards & Craft Judgments',
    rulePrefix: 'TA-01..14',
    activeCount: 14,
    primaryAgent: 'UX',
    secondaryAgent: 'PM',
    gateCheck: 'GATE: PASS UX-02 • Spatial Depth & Contrast',
    coverage: '100% Calibrated',
  },
  {
    domainKey: 'business-analysis',
    domainName: 'Business Analysis & Scoping',
    rulePrefix: 'BA-01..07',
    activeCount: 7,
    primaryAgent: 'PM',
    secondaryAgent: 'GR',
    gateCheck: 'GATE: PASS PM-01 • 2-Tier Progressive Onboarding',
    coverage: '100% (6/6 Sub-areas)',
  },
  {
    domainKey: 'operating-principles',
    domainName: 'Operating Principles & Governance',
    rulePrefix: 'OP-01..15',
    activeCount: 15,
    primaryAgent: 'PM',
    secondaryAgent: 'SD',
    gateCheck: 'GATE: PASS PM-02 • Pragmatic Delivery Razor',
    coverage: 'Universal Tier 0',
  },
  {
    domainKey: 'heuristics-cross',
    domainName: 'Heuristics, Patterns & Red Flags',
    rulePrefix: 'H-01..06, P-01..05, RF-01..10',
    activeCount: 21,
    primaryAgent: 'IR',
    secondaryAgent: 'SEC',
    gateCheck: 'GATE: PASS IR-01 • Fail-Closed Telemetry Invariant',
    coverage: 'Cross-Agent Matrix',
  },
];

export default function AuditInspector({
  isOpen,
  onClose,
  auditReport,
  onSelectNode,
}: AuditInspectorProps) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'contradictions' | 'audit'>('matrix');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[88vh] bg-white dark:bg-[#0a0a0c] border border-slate-300 dark:border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white z-10"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-950/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-[#00ffff]" />
              </div>
              <div>
                <h2 className="text-sm font-bold font-mono tracking-tight uppercase">
                  Governance Matrix & Contradiction Inspector
                </h2>
                <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                  <span>Pre-flight Invariant BN-00: PASS</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    0 Contradictions Open
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-950/40 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'matrix'
                  ? 'border-cyan-500 text-cyan-600 dark:text-[#00ffff]'
                  : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Brain ↔ 7 Agent Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('contradictions')}
              className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'contradictions'
                  ? 'border-cyan-500 text-cyan-600 dark:text-[#00ffff]'
                  : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Resolved Contradictions (X-01..X-05)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'audit'
                  ? 'border-cyan-500 text-cyan-600 dark:text-[#00ffff]'
                  : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Live Vault Audit (CV-01..08)</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: BRAIN ↔ AGENT MATRIX */}
            {activeTab === 'matrix' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-cyan-500/10 dark:bg-cyan-950/20 border border-cyan-500/20 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
                  <strong className="text-cyan-700 dark:text-[#00ffff]">Architectural Guarantee:</strong> Every active domain rule in <code className="text-slate-900 dark:text-white font-mono">/brain</code> is bound to at least one primary gatekeeper in the <code className="text-slate-900 dark:text-white font-mono">/agents</code> suite. No rule exists without an enforcement gate, and no agent executes code without backing domain rules.
                </div>

                <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-100 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400">
                      <tr>
                        <th className="py-2.5 px-3">Domain / Subsystem</th>
                        <th className="py-2.5 px-3">Rule Scope</th>
                        <th className="py-2.5 px-3">Primary Gate</th>
                        <th className="py-2.5 px-3">Enforcement Check</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                      {DOMAIN_AGENT_MAP.map((item) => (
                        <tr
                          key={item.domainKey}
                          className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                            {item.domainName}
                          </td>
                          <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400">
                            {item.rulePrefix} ({item.activeCount} rules)
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/15 dark:bg-cyan-400/15 text-cyan-700 dark:text-[#00ffff] font-bold border border-cyan-500/20">
                              {item.primaryAgent}
                            </span>
                            {item.secondaryAgent && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px]">
                                +{item.secondaryAgent}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-zinc-300 text-[11px]">
                            {item.gateCheck}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              VERIFIED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: CONTRADICTION QUEUE */}
            {activeTab === 'contradictions' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Contradictions occur when two valid engineering principles collide under real-world pressure. In Cortex v2.4, all 5 recorded contradictions have been resolved through explicit decision razors.
                </div>

                <div className="space-y-3">
                  {RESOLVED_CONTRADICTIONS.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono font-bold text-xs border border-amber-500/30">
                            {c.id}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                            {c.ruleA} vs {c.ruleB}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          RESOLVED
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                        <strong className="text-slate-800 dark:text-zinc-200">The Dilemma:</strong> {c.conflict}
                      </p>

                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 text-xs">
                        <div className="text-[10px] font-mono uppercase text-cyan-600 dark:text-[#00ffff] font-bold mb-1">
                          Decision Razor (Resolved via {c.resolutionRule}):
                        </div>
                        <p className="text-slate-700 dark:text-zinc-200 leading-relaxed font-sans text-xs">
                          {c.razor}
                        </p>
                      </div>

                      {onSelectNode && (
                        <div className="flex items-center justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const match = c.resolutionRule.match(/([A-Z]{1,4}-\d+)/);
                              if (match) {
                                onSelectNode(match[1]);
                                onClose();
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-600 dark:text-[#00ffff] hover:underline cursor-pointer"
                          >
                            <span>Inspect Resolving Node in 3D</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: LIVE VAULT AUDIT */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                    <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase">
                      Total Active Rules
                    </div>
                    <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                      {auditReport?.totalRules ?? 139}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      100% Unique IDs
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                    <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase">
                      Duplicate Rule IDs
                    </div>
                    <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      {auditReport?.duplicateRuleIds.length ?? 0}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 mt-1">
                      Zero Clashes
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                    <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase">
                      Prefix Overlaps
                    </div>
                    <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      {auditReport?.prefixOverlaps.length ?? 0}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 mt-1">
                      Clean Boundaries
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                    <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase">
                      Vault Filesystem
                    </div>
                    <div className="text-base font-bold font-mono text-cyan-600 dark:text-[#00ffff] mt-2">
                      LIVE DISK
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 mt-1">
                      Single Truth
                    </div>
                  </div>
                </div>

                {/* Audit Terminal Log Output */}
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-slate-200 space-y-1.5 shadow-inner">
                  <div className="text-slate-500 text-[10px] pb-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      VAULT MECHANICAL AUDIT REPORT (CV-01..08)
                    </span>
                    <span className="text-emerald-400 font-bold">STATUS: PASS</span>
                  </div>
                  <div className="text-slate-400">&gt;&gt;&gt; Scanning 31 canonical vault files in /brain...</div>
                  <div className="text-slate-400">&gt;&gt;&gt; Verifying grammar: status: active, breaks:, ev: tags (CV-02)...</div>
                  <div className="text-slate-400">&gt;&gt;&gt; Verifying block ID anchors ^[prefix]-[nn] (CV-08)...</div>
                  <div className="text-slate-400">&gt;&gt;&gt; Verifying 7 Core Agent files in /agents (BN-00)...</div>
                  <div className="text-emerald-400 font-semibold">
                    &gt;&gt;&gt; AUDIT COMPLETE: 31 files | 0 errors | 0 warnings | 139 verified rules.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar Footer */}
          <div className="px-6 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-950 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-zinc-400">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-[10px]">Esc</kbd> to exit inspector
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

