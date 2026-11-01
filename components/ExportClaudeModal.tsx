'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Copy,
  Download,
  FileCode,
  FileText,
  Layers,
  Sparkles,
  Terminal,
  X,
  ExternalLink,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  generateClaudeMarkdownPrompt,
  CORE_AGENT_CODES,
  CORE_AGENTS_METADATA,
  normalizeExportData,
} from '../lib/claude-export';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ExportClaudeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStats?: any;
}

export default function ExportClaudeModal({
  isOpen,
  onClose,
  initialStats,
}: ExportClaudeModalProps) {
  const [stats, setStats] = useState<any>(initialStats || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'scores' | 'setup'>('preview');

  // Fetch latest stats if not provided or when modal opens
  useEffect(() => {
    if (isOpen && !stats) {
      fetchLatestStats();
    }
  }, [isOpen]);

  const fetchLatestStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats for Claude export:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const normalized = useMemo(() => {
    return normalizeExportData(stats);
  }, [stats]);

  const generatedMarkdown = useMemo(() => {
    return generateClaudeMarkdownPrompt(stats);
  }, [stats]);

  // Copy to clipboard with fallback
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedMarkdown);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = generatedMarkdown;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Download as file
  const handleDownload = (filename: 'CLAUDE.md' | '.cursorrules') => {
    try {
      const blob = new Blob([generatedMarkdown], {
        type: 'text/markdown;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download markdown file:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="claude-export-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white dark:bg-[#09090b] border border-slate-300 dark:border-white/15 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-zinc-100 font-mono"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
                    Export CLAUDE.md & .cursorrules
                  </h2>
                  <Badge variant="default" className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30">
                    8 CORE AGENTS SYNCED
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                  Synchronize your local VS Code / Cursor IDE with live Cortex knowledge scores and invariants.
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close export modal"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-100/70 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-white/10 text-xs">
            <div className="flex flex-col px-3 py-1.5 rounded-lg bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <span className="text-[10px] uppercase text-slate-500 dark:text-zinc-400 font-semibold">Cognitive Level</span>
              <span className="text-slate-900 dark:text-white font-bold">Lvl {normalized.levelNumber} ({normalized.levelTitle})</span>
            </div>
            <div className="flex flex-col px-3 py-1.5 rounded-lg bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <span className="text-[10px] uppercase text-slate-500 dark:text-zinc-400 font-semibold">Total Rules</span>
              <span className="text-slate-900 dark:text-white font-bold">{normalized.totalRules} Enforced</span>
            </div>
            <div className="flex flex-col px-3 py-1.5 rounded-lg bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <span className="text-[10px] uppercase text-slate-500 dark:text-zinc-400 font-semibold">Weighted Score</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{normalized.totalWeightedScore} pts (avg conf {normalized.avgConfidence.toFixed(1)})</span>
            </div>
            <div className="flex flex-col px-3 py-1.5 rounded-lg bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <span className="text-[10px] uppercase text-slate-500 dark:text-zinc-400 font-semibold">Pre-Flight Gate</span>
              <span className="text-cyan-600 dark:text-[#00ffff] font-bold">BN-00 Required</span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d0d10] text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Markdown Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('scores')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'scores'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                8 Agents Roster ({CORE_AGENT_CODES.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('setup')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'setup'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                IDE Setup Guide
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLatestStats}
                disabled={isLoading}
                title="Refresh Live Scores"
                className="h-8 px-2.5 text-xs font-mono border-slate-300 dark:border-white/15"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === 'preview' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-1">
                  <span>Formatted System Prompt (`CLAUDE.md` / `.cursorrules`)</span>
                  <span>{generatedMarkdown.length} characters</span>
                </div>
                <div className="relative group">
                  <pre className="p-4 rounded-xl bg-slate-900 dark:bg-black/90 text-slate-200 dark:text-zinc-200 text-xs font-mono overflow-x-auto max-h-[460px] border border-slate-700 dark:border-white/15 leading-relaxed selection:bg-emerald-500/30">
                    <code>{generatedMarkdown}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-600/50 shadow-md text-xs flex items-center gap-1.5 transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'scores' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-800 dark:text-cyan-200 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <p>
                    These 8 agents form the core execution layer of Cortex. Each agent enforces a distinct set of non-negotiable invariants before code can be committed or merged.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CORE_AGENT_CODES.map((code) => {
                    const meta = CORE_AGENTS_METADATA[code];
                    const score = normalized.agentScores[code];
                    const isHigh = score.isHighConfidence || score.percentage >= 100;

                    return (
                      <div
                        key={code}
                        className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-white/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-white/10">
                              {code}
                            </span>
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {meta.fullName}
                            </span>
                          </div>
                          <Badge
                            variant={isHigh ? 'default' : 'outline'}
                            className={`text-[10px] ${
                              isHigh
                                ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
                                : score.percentage >= 70
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {score.status}
                          </Badge>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-snug">
                          {meta.role}
                        </p>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                            <span>{score.count} rules ({score.weightedScore} / {score.target} pts)</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {isHigh ? '100%+' : `${score.percentage}%`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isHigh
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, score.percentage)}%` }}
                            />
                          </div>
                        </div>

                        {/* Key Invariant Badges */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {meta.keyInvariants.slice(0, 4).map((inv) => (
                            <span
                              key={inv.id}
                              title={`${inv.title}: ${inv.summary}`}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-zinc-400 border border-slate-300/60 dark:border-white/5"
                            >
                              {inv.id}
                            </span>
                          ))}
                          {meta.keyInvariants.length > 4 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/5 text-slate-500 dark:text-zinc-500">
                              +{meta.keyInvariants.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'setup' && (
              <div className="space-y-5 text-xs text-slate-700 dark:text-zinc-300">
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <span>Option A: For Claude Code (VS Code Extension or CLI)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-zinc-400 pl-1 leading-relaxed">
                    <li>Click <strong className="text-slate-900 dark:text-white">&quot;Download CLAUDE.md&quot;</strong> below or click <strong className="text-slate-900 dark:text-white">&quot;Copy Prompt&quot;</strong>.</li>
                    <li>Save or paste the file directly into your local project root as <code className="text-emerald-600 dark:text-emerald-400 bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">CLAUDE.md</code>.</li>
                    <li>Ensure your local repo has an <code className="text-cyan-600 dark:text-[#00ffff] bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">agents/</code> folder containing all 8 core agent markdown specs.</li>
                    <li>Claude Code will automatically load <code className="text-slate-900 dark:text-white">CLAUDE.md</code> on every prompt, strictly enforcing the 8-Agent Gate and Golden Path workflow.</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                    <Cpu className="w-4 h-4 text-purple-500" />
                    <span>Option B: For Cursor IDE</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-zinc-400 pl-1 leading-relaxed">
                    <li>Click <strong className="text-slate-900 dark:text-white">&quot;Download .cursorrules&quot;</strong> below.</li>
                    <li>Place <code className="text-purple-600 dark:text-purple-400 bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">.cursorrules</code> in your project root directory.</li>
                    <li>Cursor&apos;s Agent & Composer will automatically index the 8-Agent invariants and enforce the pre-commit gate checklist when authoring diffs.</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-900 dark:text-red-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-red-700 dark:text-red-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Gate Enforcement Output Format</span>
                  </div>
                  <p className="text-[11px] text-red-800 dark:text-zinc-300">
                    When Claude or Cursor evaluates your code against the rules, it will output:
                  </p>
                  <pre className="p-2.5 rounded-lg bg-black/60 text-red-300 text-[11px] font-mono border border-red-500/30 overflow-x-auto">
                    <code>GATE: FAIL &lt;RULE_ID&gt; &lt;file:line&gt; &lt;required fix&gt;</code>
                  </pre>
                  <p className="text-[11px] text-red-800 dark:text-zinc-400">
                    If all invariants pass, it concludes with <code className="text-emerald-400">GATE: PASS</code>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Exact sync between Cortex Web App and IDE</span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('.cursorrules')}
                className="text-xs font-mono border-slate-300 dark:border-white/15 hover:border-purple-500/50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-purple-500" />
                <span>.cursorrules</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('CLAUDE.md')}
                className="text-xs font-mono border-slate-300 dark:border-white/15 hover:border-emerald-500/50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Download CLAUDE.md</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleCopy}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

