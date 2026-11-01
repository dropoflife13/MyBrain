'use client';

import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  Loader2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Bot,
  ExternalLink,
} from 'lucide-react';
import ChatMessageContent from './ChatMessageContent';

export interface PipelineStep {
  stepNumber: number;
  title: string;
  cmd: string;
  agent: string;
  agentName: string;
  agentColor: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  output?: string;
  model?: string;
  provider?: string;
  error?: string;
}

interface ChainedPipelineBubbleProps {
  steps: PipelineStep[];
  activeStepIndex?: number;
  timestamp: string;
}

export default function ChainedPipelineBubble({
  steps,
  activeStepIndex = 0,
  timestamp,
}: ChainedPipelineBubbleProps) {
  // Track open state for each step accordion
  const [openSteps, setOpenSteps] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  const toggleStep = (stepNumber: number) => {
    setOpenSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const allCompleted = steps.every((s) => s.status === 'completed');
  const runningStep = steps.find((s) => s.status === 'running');
  const completedCount = steps.filter((s) => s.status === 'completed').length;

  const toggleAll = () => {
    const areAnyOpen = Object.values(openSteps).some(Boolean);
    const newState = !areAnyOpen;
    setOpenSteps({
      1: newState,
      2: newState,
      3: newState,
      4: newState,
    });
  };

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 dark:bg-black/80 shadow-[0_0_25px_rgba(0,255,255,0.1)] overflow-hidden font-mono text-sm leading-relaxed text-zinc-200">
      {/* Top Banner: Golden Path Auto-Build Header */}
      <div className="p-3.5 bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-blue-950/80 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.3)]">
            <Zap className="w-4 h-4 fill-cyan-400 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                Golden Path Auto-Build
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold">
                Skill Chaining
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              {allCompleted ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> All 4 Agent Gates cleared • Ready for sandbox execution
                </span>
              ) : runningStep ? (
                <span className="text-cyan-300 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                  Agent Handoff in progress: Step {runningStep.stepNumber}/4 ({runningStep.cmd} [{runningStep.agent}])
                </span>
              ) : (
                <span>Initializing agent pipeline...</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-zinc-300 font-mono">
            {completedCount}/4 Completed
          </span>
          <button
            type="button"
            onClick={toggleAll}
            className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            {Object.values(openSteps).some(Boolean) ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Agent Handoff Stepper Ribbon */}
      <div className="px-3.5 py-2.5 bg-black/50 border-b border-cyan-500/10 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        {steps.map((s, idx) => {
          const isCurrent = s.status === 'running';
          const isDone = s.status === 'completed';
          const isErr = s.status === 'error';

          return (
            <React.Fragment key={s.stepNumber}>
              <button
                type="button"
                onClick={() => toggleStep(s.stepNumber)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono transition-all cursor-pointer shrink-0 border ${
                  isCurrent
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,255,255,0.3)] animate-pulse'
                    : isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : isErr
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-white/5 border-white/5 text-zinc-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                ) : (
                  <span className="w-3 h-3 rounded-full bg-white/10 flex items-center justify-center text-[8px]">
                    {s.stepNumber}
                  </span>
                )}
                <span className="font-bold">{s.cmd}</span>
                <span className="text-[9px] opacity-70">[{s.agent}]</span>
              </button>

              {idx < steps.length - 1 && (
                <ArrowRight
                  className={`w-3 h-3 shrink-0 ${
                    s.status === 'completed' ? 'text-emerald-500/70' : 'text-zinc-600'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Multi-Step Accordion Panels */}
      <div className="p-3.5 space-y-3">
        {steps.map((step) => {
          const isOpen = Boolean(openSteps[step.stepNumber]);
          const isRunning = step.status === 'running';
          const isCompleted = step.status === 'completed';
          const isError = step.status === 'error';

          return (
            <div
              key={step.stepNumber}
              className={`rounded-lg border transition-all ${
                isRunning
                  ? 'border-cyan-500/60 bg-cyan-950/20 shadow-[0_0_15px_rgba(0,255,255,0.15)]'
                  : isCompleted
                  ? 'border-zinc-800 bg-black/40 hover:border-zinc-700'
                  : isError
                  ? 'border-rose-500/40 bg-rose-950/20'
                  : 'border-zinc-900 bg-black/20 opacity-60'
              }`}
            >
              {/* Step Card Header */}
              <div
                onClick={() => toggleStep(step.stepNumber)}
                className="p-3 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: step.agentColor }}
                  >
                    {step.stepNumber}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-white tracking-wide">
                        {step.title}
                      </span>
                      <span
                        className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${step.agentColor}22`,
                          color: step.agentColor,
                          border: `1px solid ${step.agentColor}44`,
                        }}
                      >
                        {step.agentName}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Pipeline command: <code className="text-cyan-400 font-bold">{step.cmd}</code>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isRunning && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-bold animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Running...</span>
                    </span>
                  )}
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Completed</span>
                    </span>
                  )}
                  {isError && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Failed</span>
                    </span>
                  )}
                  {step.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>Queued</span>
                    </span>
                  )}

                  <button
                    type="button"
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    aria-label={isOpen ? 'Collapse step' : 'Expand step'}
                  >
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Step Expanded Content */}
              {isOpen && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-white/5">
                  {isRunning && (
                    <div className="py-6 flex flex-col items-center justify-center gap-2 text-center text-cyan-300">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                      <p className="text-xs font-mono font-medium">
                        {step.agentName} is executing <code className="text-white">{step.cmd}</code>...
                      </p>
                      <p className="text-[10px] text-zinc-400 max-w-sm">
                        Enforcing invariants, analyzing handoff telemetry, and formulating output for the next agent.
                      </p>
                    </div>
                  )}

                  {isCompleted && step.output && (
                    <div className="space-y-2 mt-1">
                      <ChatMessageContent
                        text={step.output}
                        role="assistant"
                        autoRunFirstCodeBlock={step.cmd === '/implement'}
                      />

                      {/* Step Footer Telemetry */}
                      <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <span>
                          via {step.provider ? step.provider.toUpperCase() : 'AI'} • {step.model || 'cortex-engine'}
                        </span>
                        {step.stepNumber < 4 ? (
                          <span className="text-cyan-400/80 flex items-center gap-1">
                            Handoff complete <ArrowRight className="w-3 h-3" /> Passing state to Step {step.stepNumber + 1}
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Layer 6 Sandbox Ready
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {isError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      <p className="font-bold flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        Execution Error
                      </p>
                      <p>{step.error || 'The agent encountered an error processing this step.'}</p>
                    </div>
                  )}

                  {step.status === 'pending' && (
                    <p className="py-2 text-xs text-zinc-500 italic">
                      Waiting for Step {step.stepNumber - 1} output before starting...
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

