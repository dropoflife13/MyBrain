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
  Coins,
  Compass,
  Cpu,
  Database,
  ExternalLink,
  FileCheck,
  Flame,
  GitFork,
  Globe,
  HelpCircle,
  Layers,
  Lock,
  MessageSquare,
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
  weightedScore?: number;
  displayScore?: number;
  displayCount?: number;
  target: number;
  avgConfidence?: number;
  prefixes: string[];
  description: string;
  isHighConfidence?: boolean;
  isOverclocked?: boolean;
  isUnverified?: boolean;
  percentageText?: string;
  fractionText?: string;
}

interface AgentMastery {
  agent: string;
  fullName?: string;
  label?: string;
  id?: string;
  code: string;
  cluster?: 'Engineering' | 'Humanities' | 'World' | string;
  file: string;
  count: number;
  weightedScore?: number;
  displayScore?: number;
  displayCount?: number;
  target: number;
  percentage: number;
  avgConfidence?: number;
  description: string;
  isHighConfidence?: boolean;
  isOverclocked?: boolean;
  isUnverified?: boolean;
  percentageText?: string;
  fractionText?: string;
}

interface BlindSpot {
  type?: 'low_mastery' | 'unverified';
  stat: string;
  percentage: number;
  avgConfidence?: number;
  ruleCount?: number;
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
    totalWeightedScore?: number;
    avgConfidence?: number;
  };
  totalAgents?: number;
  totalRules?: number;
  totalClusters?: number;
  cognitiveStats: CognitiveStat[];
  agentMastery: AgentMastery[];
  clusters?: Record<
    string,
    {
      id: string;
      name: string;
      description: string;
      agents: AgentMastery[];
      dimension?: CognitiveStat;
    }
  >;
  clusterList?: any[];
  blindSpots: BlindSpot[];
  prefixCounts: Record<string, number>;
  scannedFilesCount: number;
  timestamp: string;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  // Engineering
  SEC: <Lock className="w-4 h-4 text-rose-500 dark:text-rose-400" />,
  SD: <Layers className="w-4 h-4 text-cyan-500 dark:text-[#00ffff]" />,
  DB: <Database className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
  PM: <Brain className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />,
  UX: <Users className="w-4 h-4 text-purple-500 dark:text-purple-400" />,
  IR: <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
  GR: <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
  // Humanities
  PSY: <Brain className="w-4 h-4 text-pink-500 dark:text-pink-400" />,
  PHI: <Compass className="w-4 h-4 text-violet-500 dark:text-violet-400" />,
  RHE: <MessageSquare className="w-4 h-4 text-purple-500 dark:text-purple-400" />,
  // World
  ECO: <Coins className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
  GEO: <Globe className="w-4 h-4 text-sky-500 dark:text-sky-400" />,
  HLT: <Activity className="w-4 h-4 text-red-500 dark:text-red-400" />,
  RS: <FileCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
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

  const radarData = stats?.cognitiveStats.map((item) => {
    const weightedScore = item.weightedScore ?? item.count;
    const displayScore = item.displayScore ?? item.displayCount ?? Math.min(weightedScore, item.target);
    const isHighConfidence = item.isHighConfidence ?? item.isOverclocked ?? weightedScore > item.target;
    return {
      subject: item.subject,
      value: item.value,
      count: item.count,
      weightedScore,
      displayScore,
      target: item.target,
      avgConfidence: item.avgConfidence ?? 1,
      isHighConfidence,
      isUnverified: item.isUnverified ?? false,
      percentageText: item.percentageText || (isHighConfidence ? '100%+' : `${item.value}%`),
      fractionText: item.fractionText || `${displayScore} / ${item.target} pts`,
      fullMark: 100,
    };
  }) || [];

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
                  {stats?.totalAgents ?? '--'} / {stats?.totalAgents ?? '--'}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Radar Chart (Left: 5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-xl flex flex-col">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-600 dark:text-[#00ffff]" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Cognitive Radar
                  </h2>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-[#00ffff] border border-cyan-500/20 font-semibold">
                  3 Core Clusters
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mb-2">
                Triangular mastery polygon visualizes relative strength across the 3 core cognitive clusters: Engineering, Humanities, and World:
              </p>
            </div>

            {/* The Radar Chart with Cyan Glow and Dark Grid */}
            <div className="w-full h-[400px] min-h-[400px] my-2 flex items-center justify-center relative">
              {isMounted && radarData.length > 0 ? (
                <div
                  className="w-full h-[400px] min-h-[400px] flex items-center justify-center"
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
                                <div className="flex items-center justify-between gap-3 mb-1">
                                  <span className="text-cyan-400 font-bold">{data.subject}</span>
                                  {data.isHighConfidence && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                                      HIGH CONFIDENCE
                                    </span>
                                  )}
                                  {data.isUnverified && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                                      ⚠️ UNVERIFIED
                                    </span>
                                  )}
                                </div>
                                <div>Mastery: {data.percentageText || `${data.value}%`}</div>
                                <div className="text-zinc-400 text-[10px]">
                                  Weighted Score: {data.displayScore} / {data.target} pts
                                  {data.weightedScore > data.target ? ` (${data.weightedScore} total pts)` : ''}
                                </div>
                                <div className="text-zinc-500 text-[10px]">
                                  {data.count} rules • Avg Conf: {Number(data.avgConfidence ?? 1).toFixed(1)}
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

            <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-2">
              <span>Target: 60 Weighted Pts/Agent</span>
              <span className="text-purple-600 dark:text-purple-400 font-semibold">High Confidence Enabled</span>
            </div>
          </div>

          {/* Cognitive Stats Breakdown & Progress Bars (Right: 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-600 dark:text-[#00ffff]" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Cognitive Dimension Breakdown (Weighted by Confidence)
                  </h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                  conf 1–5 Scoring
                </span>
              </div>

              <div className="space-y-4 pt-1">
                {stats?.cognitiveStats.map((stat) => {
                  const weightedScore = stat.weightedScore ?? stat.count;
                  const isHighConfidence =
                    stat.isHighConfidence ?? stat.isOverclocked ?? weightedScore > stat.target;
                  const isUnverified =
                    stat.isUnverified ?? (stat.count >= 10 && (stat.avgConfidence ?? 1) < 2.0);
                  const displayScore =
                    stat.displayScore ?? stat.displayCount ?? Math.min(weightedScore, stat.target);
                  const percentageText =
                    stat.percentageText || (isHighConfidence ? '100%+' : `${stat.value}%`);

                  return (
                    <div key={stat.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {stat.subject}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                            ({stat.prefixes.join(' + ')})
                          </span>
                          {isHighConfidence && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 font-bold uppercase tracking-wider">
                              High Confidence
                            </span>
                          )}
                          {isUnverified && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35 font-bold uppercase tracking-wider">
                              ⚠️ Unverified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                            {displayScore} / {stat.target} pts
                          </span>
                          <span
                            className={`font-bold text-xs ${
                              isHighConfidence
                                ? 'text-purple-600 dark:text-purple-400'
                                : isUnverified
                                ? 'text-amber-600 dark:text-amber-400'
                                : stat.value >= 70
                                ? 'text-cyan-600 dark:text-[#00ffff]'
                                : stat.value >= 30
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {percentageText}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar with Cyan/Emerald or Purple High Confidence glow */}
                      <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.value}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full transition-all ${
                            isHighConfidence
                              ? 'bg-purple-500 dark:bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.7)]'
                              : isUnverified
                              ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                              : stat.value >= 80
                              ? 'bg-cyan-500 dark:bg-[#00ffff] shadow-[0_0_10px_rgba(0,255,255,0.7)]'
                              : stat.value >= 50
                              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                              : stat.value >= 30
                              ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                              : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
                        <span>{stat.description}</span>
                        <span className="font-mono text-[10px] shrink-0 ml-2">
                          {stat.count} rules • avg conf {Number(stat.avgConfidence ?? 1).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gap Analysis: Blind Spots & Unverified Knowledge Section */}
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Gap Analysis: Blind Spots & Unverified Knowledge
                  </h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold">
                  &lt; 30% Mastery or Avg Conf &lt; 2.0
                </span>
              </div>

              {stats?.blindSpots && stats.blindSpots.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {stats.blindSpots.map((spot, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                        spot.type === 'unverified'
                          ? 'bg-amber-500/10 border-amber-500/35'
                          : 'bg-rose-500/10 border-rose-500/25'
                      }`}
                    >
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          spot.type === 'unverified'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      />
                      <div className="space-y-1">
                        <div
                          className={`font-bold flex items-center gap-2 flex-wrap ${
                            spot.type === 'unverified'
                              ? 'text-amber-700 dark:text-amber-300'
                              : 'text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          <span>⚠️ {spot.label}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                            {spot.percentage}% Mastery
                            {spot.avgConfidence !== undefined
                              ? ` • Avg Conf ${spot.avgConfidence.toFixed(1)}`
                              : ''}
                          </span>
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
                      Zero Critical Blind Spots or Unverified Clusters Detected
                    </div>
                    <div className="text-slate-600 dark:text-zinc-300">
                      All cognitive dimensions exceed the 30% weighted threshold and maintain verified confidence levels.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Multi-Cluster Agents & Domains Breakdown */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-[#00ffff]" />
                <span>Multi-Cluster Knowledge & Agent Mastery Breakdown</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Confidence-weighted scoring across {stats?.totalClusters ?? (stats?.clusters ? Object.keys(stats.clusters).length : '3')} Clusters (Target: 60 weighted points per Agent/Domain; conf 1–5):
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-600 dark:text-[#00ffff] font-semibold">
              {stats?.totalClusters ?? (stats?.clusters ? Object.keys(stats.clusters).length : '3')} Clusters Active
            </span>
          </div>

          {Object.entries(stats?.clusters || {}).map(([clusterId, clusterData]) => {
            const clusterAgents = clusterData.agents || [];
            if (clusterAgents.length === 0) return null;

            return (
              <div key={clusterId} className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          clusterId === 'Engineering'
                            ? 'bg-cyan-500 shadow-[0_0_8px_#00ffff]'
                            : clusterId === 'Humanities'
                            ? 'bg-purple-500 shadow-[0_0_8px_#a855f7]'
                            : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                        }`}
                      />
                      <span>{clusterData.name || `${clusterId} Cluster`}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {clusterData.description || `${clusterId} Cognitive Domain Cluster`}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-slate-600 dark:text-zinc-300 font-semibold border border-black/5 dark:border-white/10">
                    {clusterAgents.length} {clusterId === 'Engineering' ? 'Agents' : 'Domains'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clusterAgents.map((agent) => {
                    const weightedScore = agent.weightedScore ?? agent.count;
                    const isHighConfidence =
                      agent.isHighConfidence ?? agent.isOverclocked ?? weightedScore > agent.target;
                    const isUnverified =
                      agent.isUnverified ?? (agent.count >= 10 && (agent.avgConfidence ?? 1) < 2.0);
                    const displayScore =
                      agent.displayScore ?? agent.displayCount ?? Math.min(weightedScore, agent.target);
                    const percentageText =
                      agent.percentageText || (isHighConfidence ? '100%+' : `${agent.percentage}%`);

                    return (
                      <div
                        key={agent.code}
                        className={`p-5 rounded-xl bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-xl border transition-all shadow-md space-y-3 ${
                          isHighConfidence
                            ? 'border-purple-500/35 hover:border-purple-500/65 shadow-[0_0_12px_rgba(168,85,247,0.12)]'
                            : isUnverified
                            ? 'border-amber-500/40 hover:border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                            : 'border-black/10 dark:border-white/10 hover:border-cyan-500/40 dark:hover:border-cyan-400/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 shrink-0">
                              {AGENT_ICONS[agent.code] || <Shield className="w-4 h-4 text-cyan-500" />}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                <span>{agent.agent || agent.fullName || agent.label}</span>
                                {isHighConfidence && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 font-bold uppercase tracking-wider">
                                    High Confidence
                                  </span>
                                )}
                                {isUnverified && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35 font-bold uppercase tracking-wider">
                                    ⚠️ Unverified
                                  </span>
                                )}
                              </h4>
                              <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono truncate">
                                {agent.code} • {agent.file}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-mono font-bold shrink-0 ${
                              isHighConfidence
                                ? 'text-purple-600 dark:text-purple-400'
                                : isUnverified
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-cyan-600 dark:text-[#00ffff]'
                            }`}
                          >
                            {percentageText}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isHighConfidence
                                  ? 'bg-purple-500 dark:bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.7)]'
                                  : isUnverified
                                  ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                                  : 'bg-cyan-500 dark:bg-[#00ffff] shadow-[0_0_8px_rgba(0,255,255,0.6)]'
                              }`}
                              style={{ width: `${agent.percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                            <span>
                              {displayScore} / {agent.target} pts ({agent.count} rules)
                            </span>
                            <span>Avg Conf: {Number(agent.avgConfidence ?? 1).toFixed(1)}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-snug">
                          {agent.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
