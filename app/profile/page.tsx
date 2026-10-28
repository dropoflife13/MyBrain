'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  GitFork,
  HelpCircle,
  Layers,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { ThemeToggle } from '../../components/ThemeToggle';
import CommandPalette from '../../components/CommandPalette';
import { getBrainData } from '../../lib/brain-parser';

interface CognitiveStat {
  subject: string;
  key: string;
  value: number;
  count: number;
  target: number;
  prefixes: string[];
  description: string;
}

interface AgentMastery {
  agent: string;
  code: string;
  file: string;
  count: number;
  target: number;
  percentage: number;
  description: string;
}

interface BlindSpot {
  stat: string;
  percentage: number;
  label: string;
  advice: string;
  file: string;
}

interface StatsPayload {
  level: {
    levelNumber: number;
    title: string;
    subtitle: string;
    totalRules: number;
  };
  cognitiveStats: CognitiveStat[];
  agentMastery: AgentMastery[];
  blindSpots: BlindSpot[];
  prefixCounts: Record<string, number>;
  scannedFilesCount: number;
  timestamp: string;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  SEC: <Lock className="w-4 h-4 text-rose-500 dark:text-rose-400" />,
  SD: <Layers className="w-4 h-4 text-cyan-500 dark:text-[#00ffff]" />,
  DB: <Database className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
  PM: <Brain className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />,
  UX: <Users className="w-4 h-4 text-purple-500 dark:text-purple-400" />,
  IR: <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
  GR: <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
};

export default function ProfilePage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch profile stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const radarData = stats?.cognitiveStats.map((item) => ({
    subject: item.subject,
    value: item.value,
    count: item.count,
    target: item.target,
    fullMark: 100,
  })) || [];

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white relative overflow-x-hidden selection:bg-cyan-500/20"
      style={{
        fontFamily:
          "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      {/* Background Reticle Grid & Cyber Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-80"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(0, 255, 255, 0.07), transparent 60%),
            radial-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px',
        }}
      />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 h-16 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/console"
            className="h-9 px-3 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-[#00ffff] border border-black/10 dark:border-white/10 text-xs font-mono transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Console</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest text-slate-900 dark:text-white uppercase">
              CORTEX PROFILE
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-[#00ffff] border border-cyan-500/20 font-bold">
              ASSESSMENT TRACKER
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchStats}
            disabled={isLoading}
            title="Refresh Vault Telemetry"
            className="h-9 px-3 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-[#00ffff] border border-black/10 dark:border-white/10 text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-500' : ''}`} />
            <span className="hidden md:inline">Sync</span>
          </button>

          <Link
            href="/assess"
            className="h-9 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-[#00ffff]/15 dark:hover:bg-[#00ffff]/25 text-white dark:text-[#00ffff] border border-cyan-500/30 text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,255,255,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Take Assessment</span>
          </Link>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Hero Section: Level Badge & Key Metrics */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-700 dark:text-[#00ffff] border border-cyan-500/25 tracking-wider uppercase">
                  Operator Mastery Grade
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  • Synced with Local Markdown Vault
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <span>{stats?.level.title || 'Level 3 Systems Architect'}</span>
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600 dark:text-[#00ffff] shrink-0" />
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-2xl">
                {stats?.level.subtitle ||
                  'Deep institutional memory governing architecture, database schemas, and STRIDE security invariants.'}
              </p>
            </div>

            {/* Metric KPI Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-semibold">
                  Total Rules
                </div>
                <div className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-[#00ffff]">
                  {stats?.level.totalRules ?? '--'}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-zinc-500">Invariants Active</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-semibold">
                  Gatekeepers
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  7 / 7
                </div>
                <div className="text-[10px] text-slate-400 dark:text-zinc-500">BN-00 Enforced</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-semibold">
                  Vault Integrity
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  100%
                </div>
                <div className="text-[10px] text-slate-400 dark:text-zinc-500">0 Collisions</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-semibold">
                  Files Scanned
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.scannedFilesCount ?? '--'}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-zinc-500">brain & agents</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Radar Chart (Left) + Cognitive Dimensions (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Radar Chart (Left: 5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-600 dark:text-[#00ffff]" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Cognitive Radar
                  </h2>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-[#00ffff] border border-cyan-500/20 font-semibold">
                  5 Core Stats
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mb-2">
                Hexagonal mastery polygon visualizes relative strength across the 5 core cognitive dimensions:
              </p>
            </div>

            {/* The Radar Chart with Cyan Glow and Dark Grid */}
            <div className="w-full h-80 my-2 flex items-center justify-center relative">
              {isMounted && radarData.length > 0 ? (
                <div
                  className="w-full h-full"
                  style={{
                    filter: 'drop-shadow(0 0 16px rgba(0, 255, 255, 0.28))',
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#27272a" strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{
                          fill: '#00ffff',
                          fontSize: 11,
                          fontFamily: 'monospace',
                          fontWeight: 600,
                        }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: '#71717a', fontSize: 9, fontFamily: 'monospace' }}
                        stroke="#3f3f46"
                      />
                      <Radar
                        name="Mastery"
                        dataKey="value"
                        stroke="#00ffff"
                        strokeWidth={2.5}
                        fill="#00ffff"
                        fillOpacity={0.35}
                        dot={{
                          r: 4,
                          fill: '#00ffff',
                          stroke: '#09090b',
                          strokeWidth: 2,
                        }}
                      />
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#09090b]/95 border border-cyan-500/40 p-2.5 rounded-lg shadow-xl font-mono text-xs text-white">
                                <div className="text-cyan-400 font-bold mb-1">{data.subject}</div>
                                <div>Mastery: {data.value}%</div>
                                <div className="text-zinc-400 text-[10px]">
                                  Count: {data.count} / {data.target} rules
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center text-xs text-zinc-500 font-mono">
                  Loading radar telemetry...
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              <span>Benchmark: 20 Rules = 100%</span>
              <span className="text-cyan-600 dark:text-[#00ffff] font-semibold">Max Cap: 100%</span>
            </div>
          </div>

          {/* Cognitive Stats Breakdown & Progress Bars (Right: 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-600 dark:text-[#00ffff]" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Cognitive Dimension Breakdown
                  </h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                  5 Dimensions Evaluated
                </span>
              </div>

              <div className="space-y-4 pt-1">
                {stats?.cognitiveStats.map((stat) => (
                  <div key={stat.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {stat.subject}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                          ({stat.prefixes.join(' + ')})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                          {stat.count} / {stat.target} rules
                        </span>
                        <span
                          className={`font-bold text-xs ${
                            stat.value >= 70
                              ? 'text-cyan-600 dark:text-[#00ffff]'
                              : stat.value >= 30
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {stat.value}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar with Cyan/Emerald glow */}
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full transition-all ${
                          stat.value >= 80
                            ? 'bg-cyan-500 dark:bg-[#00ffff] shadow-[0_0_10px_rgba(0,255,255,0.7)]'
                            : stat.value >= 50
                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                            : stat.value >= 30
                            ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                            : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
                      {stat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gap Analysis: Blind Spots Section */}
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Gap Analysis & Blind Spots
                  </h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold">
                  Threshold: &lt; 30%
                </span>
              </div>

              {stats?.blindSpots && stats.blindSpots.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {stats.blindSpots.map((spot, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold text-amber-700 dark:text-amber-300">
                          ⚠️ {spot.label} ({spot.percentage}%)
                        </div>
                        <div className="text-slate-700 dark:text-zinc-300">{spot.advice}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                          Target file: <code className="text-cyan-600 dark:text-[#00ffff]">{spot.file}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-emerald-700 dark:text-emerald-300">
                      Zero Critical Blind Spots Detected
                    </div>
                    <div className="text-slate-600 dark:text-zinc-300">
                      All 5 cognitive dimensions exceed the minimum 30% threshold. Your vault has
                      solid coverage across Security, Systems, Empathy, Execution, and Rule Capacity.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed 7 Agent Gatekeepers Breakdown */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-[#00ffff]" />
                <span>The 7 Agent Gatekeepers Mastery Breakdown</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Rule saturation and invariant density across the 7 core procedural gatekeepers:
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-600 dark:text-[#00ffff] font-semibold">
              Rule BN-00 Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.agentMastery.map((agent) => (
              <div
                key={agent.code}
                className="p-5 rounded-xl bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-xl border border-black/10 dark:border-white/10 hover:border-cyan-500/40 dark:hover:border-cyan-400/40 transition-all shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10">
                      {AGENT_ICONS[agent.code] || <Shield className="w-4 h-4 text-cyan-500" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {agent.agent}
                      </h3>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                        {agent.code} • {agent.file}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-600 dark:text-[#00ffff]">
                    {agent.percentage}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 dark:bg-[#00ffff] rounded-full shadow-[0_0_8px_rgba(0,255,255,0.6)]"
                      style={{ width: `${agent.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                    <span>
                      {agent.count} rules registered
                    </span>
                    <span>Target: {agent.target}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-snug">
                  {agent.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Callouts Footer */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-slate-100/50 dark:via-zinc-900/50 to-indigo-500/10 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-cyan-600 dark:text-[#00ffff]" />
              <span>Grow Your Cortex Mastery</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Run the diagnostic scenarios to convert tacit engineering decisions into concrete Markdown invariants.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/assess"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-[#00ffff] dark:hover:bg-cyan-300 text-white dark:text-black font-mono text-xs font-bold shadow-[0_0_12px_rgba(0,255,255,0.3)] transition-all cursor-pointer"
            >
              Take Assessment Quiz
            </Link>
            <Link
              href="/console"
              className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-black/10 dark:border-white/15 font-mono text-xs font-bold transition-all cursor-pointer"
            >
              Open 3D Graph
            </Link>
          </div>
        </div>
      </main>

      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        nodes={getBrainData({ mode: 'assessed' }).nodes}
      />
    </div>
  );
}
