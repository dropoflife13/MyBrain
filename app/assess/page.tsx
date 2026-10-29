'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  Flame,
  HelpCircle,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
  Zap,
} from 'lucide-react';
import Brain3D from '../../components/Brain3D';
import CommandPalette from '../../components/CommandPalette';
import NeuralLoader from '../../components/NeuralLoader';
import { ThemeToggle } from '../../components/ThemeToggle';
import { BrainDocNode, getBrainData } from '../../lib/brain-parser';

export interface QuizQuestion {
  id: string;
  questionType: 'recall' | 'scenario' | 'advanced';
  title: string;
  context: string;
  codeSnippet?: string;
  codeLanguage?: string;
  prompt: string;
  options: string[];
  correctAnswer: number; // 0, 1, 2, or 3
  ruleId: string;
  explanation: string;
}

// Default battery matching the elite enterprise hardening and multi-agent standards
const INITIAL_FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: 'Q1',
    questionType: 'scenario',
    title: 'Authorization: Scalable Multi-Tenant Access Control (Cerbos Pattern)',
    context:
      'You are building a multi-tenant SaaS where a user can only edit their own posts. You currently have if (user.role === \'author\') hardcoded in your API route.',
    codeSnippet: `// Legacy hardcoded role check in API route:
if (user.role === 'author') {
  await updatePost(postId, payload);
}`,
    codeLanguage: 'typescript',
    prompt: 'What is the most scalable way to handle this?',
    options: [
      'Add more roles (e.g., post_owner, post_editor) to the database.',
      'Use Postgres Row-Level Security (RLS) with a user_id = auth.uid() policy.',
      'Externalize the decision to a PDP using ABAC and Derived Roles (e.g., role: owner if resource.ownerId == principal.id).',
      'Create a new table for every user.',
    ],
    correctAnswer: 2,
    ruleId: 'AUTH-04',
    explanation:
      'Matches AUTH-01 and AUTH-04: Static roles cause role explosion. Externalizing authorization to a Policy Decision Point (PDP) using ABAC and derived roles decouples logic from application code.',
  },
  {
    id: 'Q2',
    questionType: 'scenario',
    title: 'Race Conditions: Concurrent Stock Decrement (Agrivet Pattern)',
    context:
      'Two cashiers buy the last bag of feed at the exact same millisecond. Your code does SELECT stock then UPDATE stock - 1. Both succeed, resulting in -1 inventory.',
    codeSnippet: `-- Vulnerable non-atomic read-then-write:
SELECT quantity FROM inventory WHERE product_id = 'prod_1';
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 'prod_1';`,
    codeLanguage: 'sql',
    prompt: 'How do you fix this at the database level?',
    options: [
      'Add a UI loading spinner to block the second click.',
      'Use an atomic conditional update (UPDATE stock SET quantity = quantity - 1 WHERE quantity >= 1).',
      'Store the stock in a Redis cache.',
      'Use a cron job to fix negative inventory every hour.',
    ],
    correctAnswer: 1,
    ruleId: 'DB-13',
    explanation:
      'Matches DB-13: Never calculate stock in application memory. Use an atomic conditional update in the database engine (WHERE quantity >= 1) to guarantee stock never breaches zero without locks.',
  },
  {
    id: 'Q3',
    questionType: 'scenario',
    title: 'Data Privacy: Commercial Margin & Cost Redaction (Agrivet Pattern)',
    context:
      'A store owner wants their cashiers to use the POS system, but cashiers must NOT see the buyingCost or profitMargin of the products.',
    codeSnippet: `// Cashier POS query:
const products = await db.products.findMany();
// Response contains: { id, name, price, buyingCost, profitMargin }
return res.json(products);`,
    codeLanguage: 'typescript',
    prompt: 'Where should this data redaction be enforced?',
    options: [
      'Hide the UI column using React conditional rendering.',
      'Use CSS to make the text invisible.',
      'Sanitize the API response on the server to strip buyingCost before it reaches the client.',
      'Trust the cashiers not to open DevTools.',
    ],
    correctAnswer: 2,
    ruleId: 'SEC-14',
    explanation:
      'Matches SEC-14: Server-side projection and sanitization must strip confidential commercial fields before payloads leave the server boundary. Never rely on client-side hiding.',
  },
  {
    id: 'Q4',
    questionType: 'recall',
    title: 'Anti-Hallucination: Epistemic Rigor (The Research Agent)',
    context:
      'A user asks the AI: "What is the current inflation rate in the Philippines today?" You have no local Markdown documents containing current statistics, and real-time web access is unavailable.',
    codeSnippet: `// User prompt to Cortex:
"What is the current inflation rate in the Philippines today?"
// Local Vault: No macroeconomic stats present. Web retrieval: Offline.`,
    codeLanguage: 'text',
    prompt: 'What should the AI do if it does not have real-time web access?',
    options: [
      'Guess the number based on the year.',
      'Say "I don\'t know, but it\'s probably around 4%."',
      'State: "WARNING: I do not have verified data for this. Hallucination risk is high. Please provide a source."',
      'Refuse to answer and end the chat.',
    ],
    correctAnswer: 2,
    ruleId: 'RS-03',
    explanation:
      'Matches RS-03: When local vault documents do not contain verified data and web retrieval is unavailable, the AI must halt and state the explicit anti-hallucination warning.',
  },
  {
    id: 'Q5',
    questionType: 'recall',
    title: 'The Golden Path: Problem Interrogation (SDLC)',
    context:
      'You are starting a new project in the Cortex Software Factory. You want to interrogate the problem, uncover edge cases, and challenge assumptions before writing the PRD.',
    codeSnippet: `# The Cortex Golden Path SDLC Pipeline:
Step 1: [ ??? ] -> Step 2: /pitch -> Step 3: /to-spec -> Step 4: /to-tickets`,
    codeLanguage: 'bash',
    prompt: 'Which pipeline command do you run first?',
    options: ['/to-spec', '/grill', '/implement', '/harden'],
    correctAnswer: 1,
    ruleId: 'PM-01',
    explanation:
      'Matches PM-01 and the Golden Path SDLC: /grill activates Product Manager rules to interrogate assumptions and surface edge cases before any specification or code is produced.',
  },
  {
    id: 'Q6',
    questionType: 'advanced',
    title: 'Enterprise Hardening: CDN Cache Isolation & Tenant Boundaries',
    context:
      'Your API serves tenant-specific data. A global CDN (like Cloudflare) caches the response, and the next user sees the previous user\'s data.',
    codeSnippet: `HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=3600`,
    codeLanguage: 'http',
    prompt: 'What header prevents cross-tenant CDN cache leaks?',
    options: [
      'Cache-Control: public, max-age=3600',
      'Cache-Control: private, no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin: *',
      'Content-Type: application/json',
    ],
    correctAnswer: 1,
    ruleId: 'SEC-15',
    explanation:
      'Matches SEC-15: Setting Cache-Control: private, no-store, no-cache, must-revalidate on authenticated routes prevents shared proxies, CDNs, and browsers from leaking tenant data.',
  },
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export default function AssessmentPage() {
  const router = useRouter();

  // Dynamic Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>(INITIAL_FALLBACK_QUESTIONS);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = Intro, 1..N = Scenarios, N+1 = Results
  const [answers, setAnswers] = useState<Record<number, number>>({}); // index (0..5) -> selected option index (0..3)
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copiedInbox, setCopiedInbox] = useState<boolean>(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState<boolean>(false);

  const graphData = useMemo(() => getBrainData({ nodeCount: 360 }), []);

  // Compute active question
  const currentQuestion =
    currentStep >= 1 && currentStep <= questions.length ? questions[currentStep - 1] : null;

  // Compute active focused node in the 3D constellation based on current question
  const currentFocusedNode = useMemo(() => {
    if (!currentQuestion) return null;
    const rulePrefix = currentQuestion.ruleId.split('-')[0].toUpperCase();

    // 1. Try to find the exact rule node in the graph
    const exactMatch = graphData.nodes.find(
      (n) =>
        n.id.toLowerCase() === currentQuestion.ruleId.toLowerCase() ||
        String(n.id).toLowerCase().startsWith(`${currentQuestion.ruleId.toLowerCase()}::`)
    );
    if (exactMatch) return exactMatch;

    // 2. Map rule prefix to target agent hub node
    const prefixMap: Record<string, string> = {
      AUTH: 'SEC',
      SEC: 'SEC',
      CS: 'SEC',
      DB: 'DB',
      SD: 'SD',
      SO: 'SD',
      UX: 'UX',
      UI: 'UX',
      IR: 'IR',
      PM: 'PM',
      OP: 'PM',
      GR: 'GR',
      RS: 'RS',
    };

    const targetAgent = prefixMap[rulePrefix] || 'SEC';
    return (
      graphData.nodes.find((n) => n.agentCode === targetAgent && n.category === 'agent') ||
      graphData.nodes.find((n) => n.id === 'HUB') ||
      null
    );
  }, [currentQuestion, graphData.nodes]);

  // Handle hotkeys (1, 2, 3, 4, Enter, Cmd+K, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen((prev) => !prev);
        return;
      }
      if (e.key === 'Escape') {
        if (isCmdPaletteOpen) {
          setIsCmdPaletteOpen(false);
          return;
        }
      }

      if (currentStep >= 1 && currentStep <= questions.length) {
        if (['1', '2', '3', '4'].includes(e.key) && !showExplanation) {
          const index = parseInt(e.key, 10) - 1;
          handleSelectOption(index);
        } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase()) && !showExplanation) {
          const charMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
          handleSelectOption(charMap[e.key.toLowerCase()]);
        } else if (e.key === 'Enter' && showExplanation) {
          handleNextScenario();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, showExplanation, isCmdPaletteOpen, questions.length]);

  // Call the Dynamic Quiz Generation API
  const handleGenerateAssessment = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data?.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setQuestions(INITIAL_FALLBACK_QUESTIONS);
      }

      setAnswers({});
      setShowExplanation(false);
      setCurrentStep(1);
    } catch (err: any) {
      console.warn('[Assessment] AI generation failed, using standard invariant battery:', err);
      setGenerationError(
        'AI generation experienced latency or rate limits. Loaded standard high-rigor invariant battery.'
      );
      setQuestions(INITIAL_FALLBACK_QUESTIONS);
      setAnswers({});
      setShowExplanation(false);
      setCurrentStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [currentStep - 1]: optionIndex }));
    setShowExplanation(true);
  };

  const handleNextScenario = () => {
    setShowExplanation(false);
    if (currentStep < questions.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setCurrentStep(questions.length + 1); // Go to results
    }
  };

  // Score computation
  const results = useMemo(() => {
    const totalQuestions = questions.length;
    let correctCount = 0;
    const failedQuestions: QuizQuestion[] = [];
    const passedQuestions: QuizQuestion[] = [];

    questions.forEach((q, idx) => {
      const userSelected = answers[idx];
      if (userSelected === q.correctAnswer) {
        correctCount += 1;
        passedQuestions.push(q);
      } else {
        failedQuestions.push(q);
      }
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    let classification = 'Pragmatic Systems Architect';
    if (scorePercentage === 100) {
      classification = 'High-Rigor Principal Systems Gatekeeper (100% Invariant Compliance)';
    } else if (scorePercentage >= 80) {
      classification = 'Defensive Senior Systems Architect (High Rigor)';
    } else if (scorePercentage >= 60) {
      classification = 'Pragmatic Systems Engineer (Intermediate Rigor)';
    } else {
      classification = 'Emerging Systems Practitioner (Remediation Required)';
    }

    return {
      totalQuestions,
      correctCount,
      scorePercentage,
      passedQuestions,
      failedQuestions,
      classification,
    };
  }, [answers, questions]);

  // Copy ONLY failed rules to clipboard for inbox.md study
  const handleCopyInbox = () => {
    if (results.failedQuestions.length === 0) {
      const lines = [
        '# Custom Inbox Rules — Excavated from Launcher L-01',
        `# Date: ${new Date().toISOString().split('T')[0]}`,
        `# Status: 100% Invariant Compliance — No Failed Rules to Remediate!`,
        '',
        'All tested invariant gates passed cleanly with zero violations.',
      ];
      navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
    } else {
      const lines = [
        '# Custom Inbox Rules — Excavated from Launcher L-01',
        `# Date: ${new Date().toISOString().split('T')[0]}`,
        `# Archetype: ${results.classification} (Score: ${results.correctCount}/${results.totalQuestions})`,
        `# Rules to Study: ${results.failedQuestions.length} Failed Invariants`,
        '',
      ];

      results.failedQuestions.forEach((q) => {
        lines.push(
          `- **${q.ruleId}** | ${q.title} | ${q.explanation} | conf: 1 | ev: L-01-assessment-failed | status: pending ^${q.ruleId.toLowerCase()}`
        );
      });

      navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
    }

    setCopiedInbox(true);
    setTimeout(() => setCopiedInbox(false), 2200);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300 selection:bg-cyan-500 selection:text-black overflow-x-hidden font-sans">
      {/* Dynamic Full-Screen Neural Loader */}
      <AnimatePresence>
        {isGenerating && <NeuralLoader key="dynamic-quiz-loader" />}
      </AnimatePresence>

      {/* 1. Full-Screen Interactive 3D Synaptic Constellation Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <Brain3D
          autoSpin={!currentFocusedNode}
          isBackground={true}
          selectedNode={currentFocusedNode}
          onNodeHover={() => {}}
        />
      </div>

      {/* 2. Atmospheric Sci-Fi Backdrop Overlays */}
      <div
        className="hidden dark:block fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 40%, rgba(5, 5, 5, 0.55) 0%, rgba(2, 4, 10, 0.92) 100%),
            radial-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px',
        }}
      />

      {/* 3. Header Grid Navigation */}
      <header className="fixed top-4 left-4 right-4 md:left-8 md:right-8 z-40 grid grid-cols-[1fr_auto_1fr] items-center pointer-events-none gap-4">
        {/* Left: Brand Pill & Back to Console */}
        <div className="flex items-center justify-start pointer-events-auto gap-2">
          <Link
            href="/console"
            className="h-10 px-3 rounded-xl bg-white/85 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl flex items-center justify-center gap-2 text-xs font-mono text-slate-700 dark:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Console</span>
          </Link>

          <div className="h-10 px-3.5 rounded-xl bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-[#00ffff]" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase">
              LAUNCHER L-01
            </span>
          </div>
        </div>

        {/* Center: Stage Indicator */}
        <div className="flex items-center justify-center pointer-events-auto">
          {currentStep >= 1 && currentStep <= questions.length && (
            <div className="h-10 px-4 rounded-xl bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl flex items-center gap-3">
              <span className="text-xs font-mono text-cyan-600 dark:text-[#00ffff] font-semibold">
                Challenge {currentStep} / {questions.length}
              </span>
              <div className="w-24 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_8px_rgba(0,255,255,0.6)]"
                  style={{
                    width: `${(currentStep / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Search + Theme Toggle */}
        <div className="flex items-center justify-end gap-2.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsCmdPaletteOpen(true)}
            className="h-10 flex items-center justify-center gap-1.5 px-3 rounded-xl bg-white/85 dark:bg-[#09090b]/85 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-white backdrop-blur-xl border border-slate-200 dark:border-white/10 text-xs font-mono transition-all shadow-xl cursor-pointer"
            title="Search Rules & Agents (Ctrl+K / ⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00ffff]" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden lg:inline-block text-[9px] px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-white/15 text-slate-500 dark:text-zinc-400 font-mono">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* 4. Main Stage Content Area */}
      <main className="relative z-10 pt-28 pb-16 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto flex flex-col items-center min-h-[calc(100vh-7rem)] justify-center">
        <AnimatePresence mode="wait">
          {/* STAGE 0: INTRO SCREEN */}
          {currentStep === 0 && (
            <motion.div
              key="intro-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-white/85 dark:bg-[#0a0a0c]/85 backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-600 dark:text-[#00ffff] uppercase bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                  PROTOCOL: DYNAMIC LAUNCHER L-01
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                  Real-Time Vault Synthesis
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                Earn Your Engineering Judgment.
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
                A blank-slate vault begins with <strong>0 rules</strong>. True judgment cannot be copy-pasted:
                it is forged through high-pressure trade-offs. The Cortex AI reads all 14 knowledge domains
                and 7 execution agents in your vault to generate an authentic 6-challenge exam on demand.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <Flame className="w-5 h-5 text-amber-500 mb-2" />
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    Dynamic Rule Sampling
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    AI synthesizes authentic challenges across all 14 domains.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <Zap className="w-5 h-5 text-cyan-500 mb-2" />
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    Strict Invariant Grading
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Spot flawed assumptions before checklists mislead you.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    Inbox.md Remediation
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Export ONLY the rules you missed directly into your study inbox.
                  </div>
                </div>
              </div>

              {generationError && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{generationError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={handleGenerateAssessment}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-sm transition-all shadow-[0_0_25px_rgba(0,255,255,0.35)] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>Generate AI Assessment →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuestions(INITIAL_FALLBACK_QUESTIONS);
                    setAnswers({});
                    setShowExplanation(false);
                    setCurrentStep(1);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/80 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-zinc-200 text-sm font-mono transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 text-cyan-500" />
                  <span>Quick Start Battery</span>
                </button>

                <Link
                  href="/console"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white text-sm font-mono transition-colors"
                >
                  <span>Skip to 3D Console</span>
                </Link>
              </div>
            </motion.div>
          )}

          {/* STAGE 1..N: DYNAMIC SCENARIO QUESTIONS */}
          {currentQuestion && (
            <motion.div
              key={`scenario-${currentQuestion.id}-${currentStep}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="w-full bg-white/90 dark:bg-[#0a0a0c]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            >
              {/* Category Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-[#00ffff] border border-cyan-500/20 font-bold uppercase">
                    TYPE: {currentQuestion.questionType.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10">
                    Rule Target: [{currentQuestion.ruleId}]
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                  Select 1–4 or Click
                </span>
              </div>

              {/* Title & Context */}
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
                {currentQuestion.title}
              </h2>
              <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed mb-4">
                {currentQuestion.context}
              </p>

              {/* Code Snippet Box */}
              {currentQuestion.codeSnippet && (
                <div className="mb-5 rounded-xl bg-slate-900 border border-slate-800 dark:border-white/10 p-4 font-mono text-xs overflow-x-auto text-slate-200 shadow-inner">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      {(currentQuestion.codeLanguage || 'CODE').toUpperCase()} INSPECTION
                    </span>
                  </div>
                  <pre className="leading-relaxed whitespace-pre font-mono">
                    {currentQuestion.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Prompt */}
              <div className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-500" />
                <span>{currentQuestion.prompt}</span>
              </div>

              {/* Option Buttons */}
              <div className="grid grid-cols-1 gap-2.5 mb-6">
                {currentQuestion.options.map((optionText, optIdx) => {
                  const letter = OPTION_LETTERS[optIdx];
                  const isSelected = answers[currentStep - 1] === optIdx;
                  const isCorrect = optIdx === currentQuestion.correctAnswer;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={showExplanation}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`text-left p-4 rounded-xl border transition-all text-xs sm:text-sm font-sans flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                          : showExplanation
                          ? isCorrect
                            ? 'bg-emerald-500/5 border-emerald-500/40 text-slate-800 dark:text-zinc-200'
                            : 'opacity-50 bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-white/5 text-slate-500 dark:text-zinc-400'
                          : 'bg-white dark:bg-zinc-900/70 hover:bg-slate-50 dark:hover:bg-zinc-800/80 border-slate-200 dark:border-white/10 text-slate-800 dark:text-zinc-200 hover:border-cyan-500/40'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-500 text-white'
                              : 'bg-rose-500 text-white'
                            : showExplanation && isCorrect
                            ? 'bg-emerald-500/80 text-white'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {letter}
                      </span>
                      <div className="flex-1 leading-snug">
                        <span className="font-medium">{optionText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Real-Time Explanation & Rule Unlocking HUD */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    {answers[currentStep - 1] === currentQuestion.correctAnswer ? (
                      // CORRECT ANSWER HUD (Emerald)
                      <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 dark:border-emerald-400/30 text-xs sm:text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs uppercase">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>INVARIANT VERIFIED (+1 PT)</span>
                          </div>
                          {currentFocusedNode && (
                            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                              Active Node: {currentFocusedNode.id}
                            </span>
                          )}
                        </div>

                        <p className="text-slate-700 dark:text-zinc-200 leading-relaxed mb-3">
                          {currentQuestion.explanation}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                          <span>Rule Validated: [{currentQuestion.ruleId}]</span>
                          <span className="font-semibold text-emerald-500">Status: PASS</span>
                        </div>
                      </div>
                    ) : (
                      // INCORRECT ANSWER HUD (Rose/Red)
                      <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 dark:border-rose-400/30 text-xs sm:text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs uppercase">
                            <AlertTriangle className="w-4 h-4" />
                            <span>INVARIANT VIOLATION (0 PTS)</span>
                          </div>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-500 border border-rose-500/30 uppercase">
                            Failed Rule: {currentQuestion.ruleId}
                          </span>
                        </div>

                        <p className="text-slate-700 dark:text-zinc-200 leading-relaxed mb-3">
                          {currentQuestion.explanation}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-rose-500/20 text-xs font-mono text-rose-700 dark:text-rose-300">
                          <span>
                            Correct Answer:{' '}
                            <strong>
                              Option {OPTION_LETTERS[currentQuestion.correctAnswer]}
                            </strong>
                          </span>
                          <span className="font-semibold text-rose-500">Status: FAILED</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Advance Action */}
              {showExplanation && (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleNextScenario}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)] cursor-pointer"
                  >
                    <span>
                      {currentStep < questions.length
                        ? 'Next Challenge →'
                        : 'View Diagnostic Report →'}
                    </span>
                    <kbd className="text-[9px] px-1 py-0.5 rounded bg-black/20 text-black font-mono">
                      Enter
                    </kbd>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STAGE RESULTS: DIAGNOSTIC REPORT */}
          {currentStep > questions.length && (
            <motion.div
              key="results-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-white/90 dark:bg-[#0a0a0c]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                  DIAGNOSTIC PROTOCOL COMPLETE
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                {results.classification}
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed mb-6">
                Your engineering instincts scored{' '}
                <strong className="text-cyan-600 dark:text-[#00ffff] font-mono text-base">
                  {results.correctCount} / {results.totalQuestions}
                </strong>{' '}
                ({results.scorePercentage}% Compliance) across the Multi-Agent governance matrix.
              </p>

              {/* Score Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase">
                    Score
                  </div>
                  <div className="text-xl font-bold font-mono text-cyan-600 dark:text-[#00ffff] mt-0.5">
                    {results.correctCount} / {results.totalQuestions}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase">
                    Compliance
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-500 mt-0.5">
                    {results.scorePercentage}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase">
                    Passed Invariants
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-500 mt-0.5">
                    +{results.passedQuestions.length}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase">
                    Failed Rules
                  </div>
                  <div className="text-xl font-bold font-mono text-rose-500 mt-0.5">
                    {results.failedQuestions.length}
                  </div>
                </div>
              </div>

              {/* Failed Rules Remediation Section */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-zinc-300 tracking-wider">
                      {results.failedQuestions.length > 0
                        ? 'Failed Rules Requiring Remediation'
                        : 'All Invariant Gates Passed'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      {results.failedQuestions.length > 0
                        ? 'Copy failed rules into your inbox.md to study before shipping to production.'
                        : 'Flawless evaluation. Zero failed invariants detected.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyInbox}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-mono text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    {copiedInbox ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy inbox.md Rules</span>
                      </>
                    )}
                  </button>
                </div>

                {results.failedQuestions.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {results.failedQuestions.map((q) => (
                      <div
                        key={q.ruleId}
                        className="p-3.5 rounded-xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 flex items-start gap-3"
                      >
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                          {q.ruleId}
                        </span>
                        <div className="flex-1 text-xs">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {q.title}
                          </div>
                          <div className="text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                            {q.explanation}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Zero failed rules detected. Your architecture aligns 100% with canonical
                      governance invariants.
                    </span>
                  </div>
                )}
              </div>

              {/* Primary Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleGenerateAssessment}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>Generate New AI Assessment →</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/console')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/80 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-zinc-200 font-mono text-xs transition-colors cursor-pointer"
                >
                  <Brain className="w-4 h-4" />
                  <span>Launch 3D Console</span>
                </button>

                <a
                  href="/brain-template.zip"
                  download="brain-vault-blank-template.zip"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-zinc-200 font-mono text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Blank Vault (.zip)</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setAnswers({});
                    setCurrentStep(0);
                    setShowExplanation(false);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono text-xs transition-colors cursor-pointer"
                  title="Reset Assessment"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 5. Global Cmd+K Search Palette (GR-04) */}
      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        nodes={graphData.nodes}
        onSelectNode={(node) => {
          const cleanId = String(node.id).split('::')[0];
          router.push(`/console?node=${encodeURIComponent(cleanId)}`);
        }}
        onNavigate={(href) => router.push(href)}
      />
    </div>
  );
}
