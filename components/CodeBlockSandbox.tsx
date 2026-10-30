'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Flame,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Terminal as TerminalIcon,
  X,
} from 'lucide-react';
import { executeCodeInSandbox, SandboxExecutionResult } from '../lib/webcontainer';

interface CodeBlockSandboxProps {
  code: string;
  language?: string;
  autoRun?: boolean;
}

export default function CodeBlockSandbox({
  code,
  language = 'typescript',
  autoRun = false,
}: CodeBlockSandboxProps) {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stdout, setStdout] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error' | 'timeout'>('idle');
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedOutput, setCopiedOutput] = useState<boolean>(false);
  const [sandboxType, setSandboxType] = useState<string>('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const cleanLang = (language || 'typescript').toLowerCase().trim();

  // Handle auto-run (e.g. triggered by /implement)
  useEffect(() => {
    if (autoRun && status === 'idle') {
      handleRunCode();
    }
  }, [autoRun]);

  // Autoscroll terminal output as it streams
  useEffect(() => {
    if (showTerminal && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [stdout, stderr, isRunning]);

  const handleRunCode = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setShowTerminal(true);
    setStdout('');
    setStderr('');
    setExitCode(null);
    setStatus('running');
    setExecutionTimeMs(null);

    try {
      const result: SandboxExecutionResult = await executeCodeInSandbox(
        code,
        cleanLang,
        (type, chunk) => {
          if (type === 'stdout') {
            setStdout((prev) => prev + chunk);
          } else {
            setStderr((prev) => prev + chunk);
          }
        }
      );

      setStdout(result.stdout);
      setStderr(result.stderr);
      setExitCode(result.exitCode);
      setStatus(result.status);
      setExecutionTimeMs(result.executionTimeMs);
      setSandboxType(result.sandbox);
    } catch (err: any) {
      setStderr((prev) => prev + `\n[Cortex Sandbox Error: ${err.message || 'Execution failed'}]`);
      setStatus('error');
      setExitCode(1);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyOutput = () => {
    const textToCopy = [stdout, stderr].filter(Boolean).join('\n');
    navigator.clipboard.writeText(textToCopy).catch(() => {});
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  const getRunnerCommand = () => {
    if (['python', 'py'].includes(cleanLang)) return 'python sandbox.py';
    if (['bash', 'sh', 'shell'].includes(cleanLang)) return 'bash sandbox.sh';
    return 'node sandbox.ts';
  };

  return (
    <div className="my-3 rounded-2xl bg-slate-900 border border-slate-700/80 dark:border-white/10 shadow-2xl overflow-hidden font-mono text-xs">
      {/* 1. Code Block Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/90 dark:bg-zinc-900/90 border-b border-slate-700 dark:border-white/10 text-slate-300">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-[11px] uppercase tracking-wider text-cyan-400">
            {cleanLang || 'CODE'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            LAYER 6 SANDBOX READY
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-2.5 py-1 rounded-lg bg-slate-700/60 dark:bg-white/5 hover:bg-slate-700 dark:hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
            title="Copy Code"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Run Code / Execute Sandbox Button */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isRunning
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 cursor-wait'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_14px_rgba(0,255,255,0.4)] active:scale-95'
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Code Snippet Body */}
      <div className="p-3.5 overflow-x-auto bg-[#0a0d14] text-slate-200 leading-relaxed font-mono max-h-72 overflow-y-auto selection:bg-cyan-500 selection:text-black">
        <pre className="whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>

      {/* 3. Sleek Terminal Output Block (Layer 6 Sandbox) */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="border-t border-slate-700/90 dark:border-white/10 bg-[#04060a] overflow-hidden"
          >
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-[#090d16] border-b border-slate-800 text-[11px]">
              {/* Traffic light dots + Title */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_6px_#ef4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_6px_#10b981]" />
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>TERMINAL // CORTEX SANDBOX</span>
                </div>
              </div>

              {/* Status Pills + Actions */}
              <div className="flex items-center gap-2">
                {status === 'running' && (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-[#00ffff] border border-cyan-500/30 flex items-center gap-1 text-[10px] animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ffff]" />
                    EXECUTING
                  </span>
                )}
                {status === 'success' && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 text-[10px]">
                    <Check className="w-3 h-3" />
                    EXIT 0 (PASS)
                  </span>
                )}
                {status === 'error' && (
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px]">
                    EXIT {exitCode ?? 1} (FAIL)
                  </span>
                )}
                {status === 'timeout' && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">
                    TIMEOUT (8s)
                  </span>
                )}

                {executionTimeMs !== null && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    +{executionTimeMs}ms
                  </span>
                )}

                {/* Re-run button */}
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Re-run in Sandbox"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                </button>

                {/* Copy output button */}
                <button
                  type="button"
                  onClick={handleCopyOutput}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Copy Output"
                >
                  {copiedOutput ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Close terminal button */}
                <button
                  type="button"
                  onClick={() => setShowTerminal(false)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close Terminal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Screen / Output Body */}
            <div className="p-3.5 font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto selection:bg-cyan-500 selection:text-black">
              {/* Command execution banner */}
              <div className="text-slate-500 flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-900">
                <span className="text-cyan-400 font-bold">$</span>
                <span className="text-slate-300">{getRunnerCommand()}</span>
                {sandboxType && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-slate-500 ml-auto uppercase">
                    {sandboxType}
                  </span>
                )}
              </div>

              {/* Streaming stdout */}
              {stdout && (
                <pre className="whitespace-pre-wrap text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                  {stdout}
                </pre>
              )}

              {/* Streaming stderr */}
              {stderr && (
                <pre className="whitespace-pre-wrap text-rose-400 mt-1 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]">
                  {stderr}
                </pre>
              )}

              {/* No output message */}
              {!stdout && !stderr && !isRunning && status !== 'idle' && (
                <div className="text-slate-500 italic py-1">
                  [Process exited with code {exitCode ?? 0} • No standard output]
                </div>
              )}

              {/* Running cursor */}
              {isRunning && (
                <div className="flex items-center gap-1.5 text-cyan-400 mt-1">
                  <span className="animate-pulse">▋</span>
                  <span className="text-[10px] text-slate-500">Streaming execution logs...</span>
                </div>
              )}

              <div ref={terminalEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

