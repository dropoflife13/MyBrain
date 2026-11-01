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
  Bot,
  Brain,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Code,
  Coins,
  Compass,
  Cpu,
  Database,
  DollarSign,
  FileCheck,
  FileCode,
  FlaskConical,
  Globe,
  GraduationCap,
  Heart,
  History,
  Landmark,
  Layers,
  Leaf,
  Lock,
  Megaphone,
  MessageSquare,
  Newspaper,
  Palette,
  RefreshCw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
import ExportClaudeModal from '../../components/ExportClaudeModal';
import PixelBot from '../../components/PixelBot';
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
  isUnseeded?: boolean;
  status?: 'seeded' | 'unseeded';
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
  isUnseeded?: boolean;
  status?: 'seeded' | 'unseeded';
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
  // Engineering Core (9 Gatekeepers)
  SEC: <Lock className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
  SD: <Layers className="w-5 h-5 text-cyan-500 dark:text-[#00ffff]" />,
  DB: <Database className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
  PM: <Brain className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
  UX: <Users className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
  IR: <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
  GR: <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
  RS: <FileCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
  ARB: <Scale className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
  // Humanities & Enterprise (8 Domains)
  PSY: <Brain className="w-5 h-5 text-pink-500 dark:text-pink-400" />,
  PHI: <Compass className="w-5 h-5 text-violet-500 dark:text-violet-400" />,
  RHE: <MessageSquare className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
  LIT: <BookOpen className="w-5 h-5 text-fuchsia-500 dark:text-fuchsia-400" />,
  ART: <Palette className="w-5 h-5 text-pink-500 dark:text-pink-400" />,
  EDU: <GraduationCap className="w-5 h-5 text-violet-500 dark:text-violet-400" />,
  MKT: <Megaphone className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
  MGT: <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
  // Global & Society (11 Domains)
  ECO: <Coins className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
  GEO: <Globe className="w-5 h-5 text-sky-500 dark:text-sky-400" />,
  HLT: <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
  LAW: <Scale className="w-5 h-5 text-teal-500 dark:text-teal-400" />,
  POL: <Landmark className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />,
  ENV: <Leaf className="w-5 h-5 text-green-500 dark:text-green-400" />,
  HIS: <History className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
  CRY: <Cpu className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />,
  FIN: <DollarSign className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
  NWS: <Newspaper className="w-5 h-5 text-sky-500 dark:text-sky-400" />,
  BIZ: <Briefcase className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
  // Frontier & Science (3 Domains)
  DS: <Code className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
  SCI: <FlaskConical className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />,
  MED: <Heart className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
};

export default function ProfilePage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState<boolean>(false);
  const [isExportClaudeOpen, setIsExportClaudeOpen] = useState<boolean>(false);
  const [isQuarantineOpen, setIsQuarantineOpen] = useState<boolean>(false);

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

          <button
            type="button"
            onClick={() => setIsExportClaudeOpen(true)}
            title="Export CLAUDE.md / .cursorrules for VS Code & Cursor"
            className="h-9 px-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)] font-mono"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CLAUDE.md</span>
          </button>

          <Link
            href="/hq"
            className="h-9 px-3 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 text-violet-700 dark:text-violet-300 border border-violet-500/30 text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.2)]"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pixel HQ</span>
          </Link>

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
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        {/* Hero Section: Level Badge & Key Metrics */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-[#09090b]/80 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-700 dark:text-[#00ffff] border border-cyan-500/25 tracking-wider uppercase">
                  Operator Mastery Grade
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-200">
                  • Synced with Local Markdown Vault
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <span>{stats?.level.title || 'Level 5 Autonomous Mastermind'}</span>
                <Award className="w-7 h-7 sm:w-9 sm:h-9 text-cyan-600 dark:text-[#00ffff] shrink-0" />
              </h1>
              <p className="text-sm text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed">
                {stats?.level.subtitle ||
                  'Deep institutional memory governing architecture, database schemas, and STRIDE security invariants.'}
              </p>
            </div>

            {/* Metric KPI Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <div className="text-[11px] text-slate-600 dark:text-slate-200 uppercase font-semibold">
                  Total Rules
                </div>
                <div className="text-2xl font-bold text-cyan-600 dark:text-[#00ffff]">
                  {stats?.level.totalRules ?? '--'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-300">Invariants Active</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <div className="text-[11px] text-slate-600 dark:text-slate-200 uppercase font-semibold">
                  Domains &amp; Agents
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats?.totalAgents ?? '--'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-300">4 Core Clusters</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <div className="text-[11px] text-slate-600 dark:text-slate-200 uppercase font-semibold">
                  Vault Integrity
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  100%
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-300">0 Collisions</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <div className="text-[11px] text-slate-600 dark:text-slate-200 uppercase font-semibold">
                  Files Scanned
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.scannedFilesCount ?? '--'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-300">brain &amp; agents</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Judgment Arbiter (ARB) Supreme Court Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-rose-500/10 via-white/80 dark:via-[#0b0d14]/90 to-amber-500/10 backdrop-blur-2xl border border-rose-500/30 dark:border-rose-500/35 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-5">
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/35 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(225,29,72,0.25)]">
                <PixelBot code="ARB" size={52} showNameTag={false} knowledge={100} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    <span>ARB • CONSTITUTIONAL ARBITER</span>
                  </span>
                  <span className="text-xs font-mono text-amber-600 dark:text-amber-300 font-semibold">
                    brain/02-domains/arbiter.md
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Judgment Arbiter (ARB)
                </h2>
                <p className="text-sm text-slate-700 dark:text-slate-200 max-w-3xl leading-relaxed">
                  The Supreme Court of the Cortex. Resolves conflicts between domains and enforces your core invariants when rules contradict.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 shrink-0 text-[11px] font-mono">
              <div className="px-3 py-2 rounded-xl bg-white/70 dark:bg-white/5 border border-rose-500/25 text-slate-800 dark:text-slate-200">
                <span className="text-rose-600 dark:text-rose-400 font-bold block">ARB-01</span>
                <span>Domain Separation</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/70 dark:bg-white/5 border border-rose-500/25 text-slate-800 dark:text-slate-200">
                <span className="text-rose-600 dark:text-rose-400 font-bold block">ARB-02</span>
                <span>Conflict Fallback</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/70 dark:bg-white/5 border border-rose-500/25 text-slate-800 dark:text-slate-200">
                <span className="text-amber-600 dark:text-amber-400 font-bold block">ARB-03</span>
                <span>Fact vs. Opinion</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/70 dark:bg-white/5 border border-rose-500/25 text-slate-800 dark:text-slate-200">
                <span className="text-amber-600 dark:text-amber-400 font-bold block">ARB-04</span>
                <span>Precautionary Rule</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 1: 2-Column Grid: 4-Cluster Radar Chart (Left) + Cognitive Dimensions (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Radar Chart (Left Column - 4 Core Clusters Diamond) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-[#09090b]/80 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-5 h-5 text-cyan-600 dark:text-[#00ffff]" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    4-Cluster Cognitive Radar
                  </h2>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-[#00ffff] border border-cyan-500/25 font-semibold">
                  4 Core Clusters
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 mb-3 leading-relaxed">
                Diamond mastery polygon visualizing relative strength across the 4 Core Clusters: Engineering Core, Humanities &amp; Enterprise, Global &amp; Society, and Frontier &amp; Science.
              </p>
            </div>

            {/* The Radar Chart with Cyan Glow and Dark Grid */}
            <div className="w-full h-[380px] my-2 flex items-center justify-center relative">
              {isMounted && radarData.length > 0 ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    filter: 'drop-shadow(0 0 16px rgba(0, 255, 255, 0.28))',
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData.slice(0, 4)}>
                      <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{
                          fill: '#00ffff',
                          fontSize: 11,
                          fontFamily: 'monospace',
                          fontWeight: 700,
                        }}
                      />
                      <PolarRadiusAxis
                        angle={45}
                        domain={[0, 100]}
                        tick={{ fill: '#cbd5e1', fontSize: 9, fontFamily: 'monospace' }}
                        stroke="#52525b"
                      />
                      <Radar
                        name="Mastery"
                        dataKey="value"
                        stroke="#00ffff"
                        strokeWidth={2.5}
                        fill="#00ffff"
                        fillOpacity={0.32}
                        dot={{
                          r: 4.5,
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
                              <div className="bg-[#09090b]/95 border border-cyan-500/40 p-3 rounded-xl shadow-xl font-mono text-xs text-white">
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
                                <div className="text-slate-200 text-[11px]">
                                  Weighted Score: {data.displayScore} / {data.target} pts
                                  {data.weightedScore > data.target ? ` (${data.weightedScore} total pts)` : ''}
                                </div>
                                <div className="text-slate-300 text-[10px]">
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
                <div className="flex items-center justify-center text-xs text-slate-300 font-mono">
                  Loading radar telemetry...
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-slate-600 dark:text-slate-200 font-mono mt-2">
              <span>Target: 60 Weighted Pts / Domain</span>
              <span className="text-purple-600 dark:text-purple-400 font-semibold">High Confidence Enabled</span>
            </div>
          </div>

          {/* Cognitive Stats Breakdown & Progress Bars (Right Column) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-[#09090b]/80 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-xl space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-cyan-600 dark:text-[#00ffff]" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    4-Cluster Dimension Breakdown
                  </h2>
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-200 font-mono">
                  conf 1–5 Scoring
                </span>
              </div>

              <div className="space-y-5 pt-1">
                {stats?.cognitiveStats.slice(0, 4).map((stat) => {
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
                    <div key={stat.key} className="space-y-2 p-3.5 rounded-xl bg-slate-100/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {stat.subject}
                          </span>
                          {isHighConfidence && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 font-bold uppercase tracking-wider">
                              High Confidence
                            </span>
                          )}
                          {isUnverified && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35 font-bold uppercase tracking-wider">
                              ⚠️ Unverified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 font-mono">
                          <span className="text-slate-600 dark:text-slate-200 text-xs">
                            {displayScore} / {stat.target} pts
                          </span>
                          <span
                            className={`font-bold text-sm ${
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
                      <div className="w-full h-3 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
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
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-200 leading-relaxed pt-0.5">
                        <span>{stat.description}</span>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-300 shrink-0 ml-3">
                          {stat.count} rules • avg conf {Number(stat.avgConfidence ?? 1).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Gap Analysis: Blind Spots & Unverified Knowledge */}
        <div className="w-full p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-[#09090b]/80 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3.5">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Gap Analysis: Blind Spots &amp; Unverified Knowledge
              </h2>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-semibold">
              &lt; 30% Mastery or Avg Conf &lt; 2.0
            </span>
          </div>

          {stats?.blindSpots && stats.blindSpots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {stats.blindSpots.slice(0, 8).map((spot, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
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
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                        {spot.percentage}% Mastery
                        {spot.avgConfidence !== undefined
                          ? ` • Avg Conf ${spot.avgConfidence.toFixed(1)}`
                          : ''}
                      </span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-200">{spot.advice}</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                      Target file: <code className="text-cyan-600 dark:text-[#00ffff]">{spot.file}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-emerald-700 dark:text-emerald-300">
                  Zero Critical Blind Spots or Unverified Clusters Detected
                </div>
                <div className="text-slate-700 dark:text-slate-200">
                  All cognitive dimensions exceed the 30% weighted threshold and maintain verified confidence levels.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed 4-Cluster Agents & Domains Breakdown with Floating PixelBots */}
        <div className="space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-cyan-600 dark:text-[#00ffff]" />
                <span>4-Cluster Knowledge &amp; Agent Mastery Breakdown</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200">
                Confidence-weighted scoring across all 4 Core Clusters (Target: 60 weighted points per Agent/Domain; conf 1–5):
              </p>
            </div>
            <span className="text-xs sm:text-sm font-mono px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-[#00ffff] border border-cyan-500/25 font-bold self-start sm:self-auto">
              {stats?.totalClusters ?? 4} Clusters Active
            </span>
          </div>

          {Object.entries(stats?.clusters || {}).map(([clusterId, clusterData]) => {
            const clusterAgents = (clusterData.agents || []).filter(
              (agent) => !agent.isUnseeded && (agent.count > 0 || clusterId === 'Engineering')
            );
            if (clusterAgents.length === 0) return null;

            return (
              <div key={clusterId} className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          clusterId === 'Engineering'
                            ? 'bg-cyan-500 shadow-[0_0_10px_#00ffff]'
                            : clusterId === 'Humanities'
                            ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]'
                            : clusterId === 'Science'
                            ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
                            : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                        }`}
                      />
                      <span>{clusterData.name || `${clusterId} Cluster`}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200">
                      {clusterData.description || `${clusterId} Cognitive Domain Cluster`}
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold border border-black/5 dark:border-white/10 self-start sm:self-auto">
                    {clusterAgents.length} {clusterId === 'Engineering' ? 'Core Agents' : 'Domains'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clusterAgents.map((agent, idx) => {
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
                        className={`p-6 sm:p-7 rounded-2xl bg-white/80 dark:bg-[#09090b]/85 backdrop-blur-xl border transition-all shadow-lg space-y-4 flex flex-col justify-between ${
                          agent.code === 'ARB'
                            ? 'border-rose-500/45 hover:border-rose-500/80 shadow-[0_0_18px_rgba(225,29,72,0.16)]'
                            : isHighConfidence
                            ? 'border-purple-500/40 hover:border-purple-500/75 shadow-[0_0_16px_rgba(168,85,247,0.14)]'
                            : isUnverified
                            ? 'border-amber-500/45 hover:border-amber-500/75 shadow-[0_0_16px_rgba(245,158,11,0.12)]'
                            : 'border-black/10 dark:border-white/10 hover:border-cyan-500/50 dark:hover:border-cyan-400/50'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3.5 min-w-0">
                              {/* Floating PixelBot Sprite + Domain Icon Badge */}
                              <div className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-black/5 dark:border-white/10 shrink-0 flex items-center justify-center">
                                <PixelBot
                                  code={agent.code}
                                  size={38}
                                  showNameTag={false}
                                  knowledge={agent.percentage}
                                  bobDelay={idx % 6}
                                />
                                <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-md bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 shadow-sm">
                                  {AGENT_ICONS[agent.code] || <Shield className="w-4 h-4 text-cyan-500" />}
                                </div>
                              </div>

                              <div className="min-w-0 space-y-1">
                                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap leading-snug">
                                  <span>{agent.agent || agent.fullName || agent.label}</span>
                                  {isHighConfidence && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 font-bold uppercase tracking-wider">
                                      High Conf
                                    </span>
                                  )}
                                  {isUnverified && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35 font-bold uppercase tracking-wider">
                                      ⚠️ Unverified
                                    </span>
                                  )}
                                </h4>
                                <div className="text-xs text-slate-600 dark:text-slate-200 font-mono truncate">
                                  <span className="font-bold text-cyan-700 dark:text-cyan-300">{agent.code}</span> • {agent.file}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`text-sm font-mono font-extrabold shrink-0 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 ${
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

                          <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">
                            {agent.code === 'ARB'
                              ? 'The Supreme Court of the Cortex. Resolves conflicts between domains and enforces your core invariants when rules contradict.'
                              : agent.description}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/10">
                          <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
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
                          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-200 font-mono">
                            <span>
                              {displayScore} / {agent.target} pts ({agent.count} rules)
                            </span>
                            <span>Avg Conf: {Number(agent.avgConfidence ?? 1).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Quarantined Draft Domains (Awaiting Elicitation) Accordion */}
          {(() => {
            const allUnseededDomains = (stats?.agentMastery || []).filter(
              (agent) => agent.isUnseeded || (agent.count === 0 && agent.cluster !== 'Engineering')
            );
            if (allUnseededDomains.length === 0) return null;

            return (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-950/40 p-6 sm:p-7 space-y-4">
                <button
                  type="button"
                  onClick={() => setIsQuarantineOpen(!isQuarantineOpen)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer focus:outline-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-zinc-200 group-hover:text-cyan-600 dark:group-hover:text-[#00ffff] transition-colors flex items-center gap-2.5">
                        <span>Quarantined Draft Domains (Awaiting Elicitation)</span>
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {allUnseededDomains.length} Domains
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Quarantined placeholder domains without verified rules. Isolated to prevent RAG hallucinations until seeded.
                      </p>
                    </div>
                  </div>
                  <div className="p-2 text-slate-400 dark:text-zinc-500 group-hover:text-cyan-600 dark:group-hover:text-[#00ffff] transition-colors">
                    {isQuarantineOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isQuarantineOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="pt-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-3">
                        {allUnseededDomains.map((agent, idx) => {
                          return (
                            <div
                              key={agent.code}
                              className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-white/40 dark:bg-zinc-900/30 opacity-65 grayscale hover:grayscale-0 hover:opacity-100 transition-all shadow-sm space-y-4 flex flex-col justify-between"
                            >
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 shrink-0 flex items-center justify-center">
                                      <PixelBot
                                        code={agent.code}
                                        size={34}
                                        showNameTag={false}
                                        knowledge={0}
                                        bobDelay={idx % 6}
                                      />
                                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 shadow-xs">
                                        {AGENT_ICONS[agent.code] || <Shield className="w-3.5 h-3.5 text-slate-400" />}
                                      </div>
                                    </div>

                                    <div className="min-w-0 space-y-0.5">
                                      <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 flex-wrap">
                                        <span>{agent.agent || agent.fullName || agent.label}</span>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-bold uppercase tracking-wider font-mono">
                                          Unseeded
                                        </span>
                                      </h4>
                                      <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono truncate">
                                        <span className="font-bold text-slate-600 dark:text-zinc-300">{agent.code}</span> • {agent.file}
                                      </div>
                                    </div>
                                  </div>

                                  <span className="text-xs font-mono font-bold shrink-0 px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-slate-500 dark:text-zinc-400">
                                    0%
                                  </span>
                                </div>

                                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                                  {agent.description || 'Cognitive domain awaiting procedural knowledge elicitation.'}
                                </p>
                              </div>

                              <div className="space-y-2 pt-2 border-t border-dashed border-slate-200 dark:border-white/10">
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-slate-400 dark:bg-zinc-600 rounded-full" style={{ width: '0%' }} />
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                                  <span>0 / {agent.target} pts (0 rules)</span>
                                  <span className="text-amber-600 dark:text-amber-400 font-semibold">Awaiting Elicitation</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}
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

      {/* Export CLAUDE.md Modal */}
      <ExportClaudeModal
        isOpen={isExportClaudeOpen}
        onClose={() => setIsExportClaudeOpen(false)}
        initialStats={stats}
      />

      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        nodes={getBrainData({ mode: 'assessed' }).nodes}
        onExportClaude={() => setIsExportClaudeOpen(true)}
      />
    </div>
  );
}
