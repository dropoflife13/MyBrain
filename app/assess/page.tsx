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
  Cpu,
  Download,
  Flame,
  GraduationCap,
  HelpCircle,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import Brain3D from '../../components/Brain3D';
import CommandPalette from '../../components/CommandPalette';
import NeuralLoader from '../../components/NeuralLoader';
import { ThemeToggle } from '../../components/ThemeToggle';
import { BrainDocNode, getBrainData } from '../../lib/brain-parser';

interface QuizQuestion {
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

type PersonaLevel = 'student' | 'junior' | 'senior' | 'non-technical';

interface PersonaConfig {
  id: PersonaLevel;
  title: string;
  badge: string;
  description: string;
  focus: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PERSONA_CONFIGS: PersonaConfig[] = [
  {
    id: 'student',
    title: 'Student / Beginner',
    badge: 'Foundations',
    description: 'Focuses on general logic, data privacy, and basic UX.',
    focus: 'OJT hours tracking, school portals, input validation, UI feedback',
    icon: GraduationCap,
  },
  {
    id: 'junior',
    title: 'Junior Developer',
    badge: 'Core Web',
    description: 'Focuses on standard security, basic SQL/NoSQL, and React patterns.',
    focus: 'SQL injection, auth tokens, React state handling, offline recovery',
    icon: Code2,
  },
  {
    id: 'senior',
    title: 'Senior Architect',
    badge: 'Enterprise',
    description: 'Focuses on high-scale trade-offs, race conditions, multi-tenancy, and authorization.',
    focus: 'Atomic updates, PDP/ABAC, CDN cache isolation, CAP theorem',
    icon: Cpu,
  },
  {
    id: 'non-technical',
    title: 'Non-Technical',
    badge: 'Stakeholder',
    description: 'Focuses on process, OJT hours, empathy, and business logic.',
    focus: 'Pre-mortem questioning, user friction, attendance tracking, MVP scope',
    icon: Users,
  },
];

function getRuleFriendlyName(ruleId: string): string {
  const map: Record<string, string> = {
    'AUTH-01': 'Decoupled Authorization Policy',
    'AUTH-04': 'Multi-Tenant Attribute Access Control',
    'DB-13': 'Atomic Conditional Updates',
    'SEC-14': 'Server-Side Commercial Data Sanitization',
    'SEC-15': 'Edge CDN Private Cache Isolation',
    'SEC-01': 'Input Validation and SQL Guard',
    'SEC-02': 'Least Privilege Boundaries',
    'RS-03': 'Epistemic Anti-Hallucination Halt',
    'PM-01': 'Pre-Mortem Problem Interrogation',
    'IR-05': 'Offline-First Queue and Idempotent Sync',
    'UX-01': 'Optimistic UI with Deterministic Rollback',
    'SD-01': 'Stateless Services & Horizontal Scaling',
  };
  if (map[ruleId]) return map[ruleId];
  const [prefix] = ruleId.split('-');
  const prefixMap: Record<string, string> = {
    AUTH: 'Authorization Policy',
    SEC: 'Security Hardening',
    DB: 'Database Reliability',
    IR: 'Integration & Resilience',
    PM: 'Product Scope & Discovery',
    UX: 'User Experience Invariant',
    SD: 'Systems Architecture',
    RS: 'Research & Epistemic Rigor',
  };
  return prefixMap[prefix] ? `${prefixMap[prefix]} Invariant` : 'Architectural Invariant';
}

// Default battery matching authentic scenario-based challenges with zero leaked rule IDs
const INITIAL_FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: 'Q1',
    questionType: 'scenario',
    title: 'Multi-Tenant Permissions: Student Assignment Editing',
    context:
      'You are building a university portal where students submit and edit their internship reports. An API route currently contains an insecure check: `if (user.role === \'student\') { await updateReport(reportId, payload); }`. Any student can edit any other student\'s report by guessing the report ID.',
    codeSnippet: `// Insecure route handler in /api/reports/[id]:\nif (user.role === 'student') {\n  await updateReport(reportId, payload);\n}`,
    codeLanguage: 'typescript',
    prompt: 'What is the most robust and scalable way to prevent students from tampering with other students\' reports?',
    options: [
      'Add more hardcoded roles to the database (e.g., student_owner, student_viewer, student_editor).',
      'Rely on frontend React state to disable the edit button if the report author does not match.',
      'Externalize permission checks using Attribute-Based Access Control (ABAC) with derived roles (e.g., allow edit if resource.authorId == principal.id).',
      'Create a completely separate SQL database for each enrolled student.',
    ],
    correctAnswer: 2,
    ruleId: 'AUTH-04',
    explanation:
      'Externalizing decision logic to a Policy Decision Point (PDP) using ABAC and derived roles decouples ownership verification from code and prevents role explosion.',
  },
  {
    id: 'Q2',
    questionType: 'scenario',
    title: 'Concurrent Sales: Small Retail POS Stock Decrement',
    context:
      'In a local campus supply shop POS, two cashiers ring up the very last uniform badge at the exact same second. Your backend executes a SELECT stock check followed by an UPDATE stock - 1. Both check queries return 1, and both write updates succeed, resulting in negative stock (-1) on the shelf.',
    codeSnippet: `-- Vulnerable read-then-write sequence:\nSELECT quantity FROM inventory WHERE item_id = 'badge_01';\n-- Both cashier threads see quantity = 1, then proceed:\nUPDATE inventory SET quantity = quantity - 1 WHERE item_id = 'badge_01';`,
    codeLanguage: 'sql',
    prompt: 'How should the database guarantee stock never dips below zero under concurrent traffic?',
    options: [
      'Add a visual disabled spinner on the checkout button to prevent double-clicks.',
      'Execute an atomic conditional update directly in SQL: UPDATE inventory SET quantity = quantity - 1 WHERE item_id = ? AND quantity >= 1.',
      'Temporarily store inventory balances in client-side localStorage before syncing to disk.',
      'Run an hourly background cleanup job to reset negative inventory values back to zero.',
    ],
    correctAnswer: 1,
    ruleId: 'DB-13',
    explanation:
      'Atomic conditional database updates guarantee that counters never breach zero without requiring table-wide locks or fragile application-level checks.',
  },
  {
    id: 'Q3',
    questionType: 'scenario',
    title: 'Data Privacy: Redacting Wholesale Costs in Cashier Terminal',
    context:
      'A school cooperative store employs student cashiers on shifts. The cashier terminal must display retail selling prices, but wholesale supplier costs and store profit margins must remain strictly confidential.',
    codeSnippet: `// Server API endpoint serving POS terminal:\nconst products = await db.products.findMany();\n// products array contains: [{ id, name, retailPrice, wholesaleCost, marginPercent }]\nreturn res.json(products);`,
    codeLanguage: 'typescript',
    prompt: 'Where must the wholesale cost and profit margin fields be stripped from the data?',
    options: [
      'In the React component by conditionally hiding the wholesale cost table column.',
      'Using CSS opacity: 0 and user-select: none to conceal the margin text.',
      'On the backend server before sending the HTTP response, using selective field projections or DTO sanitization.',
      'By instructing student cashiers not to open browser developer tools during their shift.',
    ],
    correctAnswer: 2,
    ruleId: 'SEC-14',
    explanation:
      'Server-side projection and sanitization must strip confidential commercial fields before payloads cross the server-client network boundary.',
  },
  {
    id: 'Q4',
    questionType: 'scenario',
    title: 'Intermittent Connectivity: Tracking OJT Hours in the Field',
    context:
      'An engineering student is completing an off-campus On-the-Job Training (OJT) shift at a remote construction site with dead cellular reception. They clock out at 5:00 PM, but the app fails to reach the cloud server.',
    codeSnippet: `async function logClockOut(studentId: string, timestamp: number) {\n  // What happens if navigator.onLine is false or the request times out?\n  await fetch('/api/ojt/clock-out', { method: 'POST', body: JSON.stringify({ studentId, timestamp }) });\n}`,
    codeLanguage: 'typescript',
    prompt: 'What architectural pattern guarantees student time records are never lost during field outages?',
    options: [
      'Show an alert error stating "No Connection" and clear the student\'s entered time entry.',
      'Persist the time entry in an offline IndexedDB queue and use a Service Worker background sync to replay it when connectivity returns.',
      'Block the student from opening the application until an active 5G signal is re-established.',
      'Store time logs in unencrypted cookies and delete them once the browser tab closes.',
    ],
    correctAnswer: 1,
    ruleId: 'IR-05',
    explanation:
      'Offline-first resilient integration requires local persistence in IndexedDB with transactional replay queues to prevent data loss during network disruptions.',
  },
  {
    id: 'Q5',
    questionType: 'scenario',
    title: 'System Discovery: Interrogating Edge Cases Before Specifying',
    context:
      'A university faculty asks your engineering capstone team to build a real-time thesis defense scheduler. Before drafting UI wireframes or writing database schemas, your team needs to identify blind spots, scheduling conflicts, and room double-booking pitfalls.',
    codeSnippet: `# Software Project Lifecycle:\nPhase 1: [ ??? ] -> Phase 2: Technical Specification -> Phase 3: Ticket Breakdown -> Phase 4: Implementation`,
    codeLanguage: 'text',
    prompt: 'What engineering practice should the team execute first before locking in requirements?',
    options: [
      'Begin coding the database migration immediately so frontend engineers have mock endpoints.',
      'Conduct a structured problem pre-mortem and challenge assumptions to reveal failure modes before writing specs.',
      'Deploy an unauthenticated prototype directly to production to gather user ratings.',
      'Purchase enterprise cloud infrastructure before confirming student and faculty volume.',
    ],
    correctAnswer: 1,
    ruleId: 'PM-01',
    explanation:
      'Thorough pre-mortem problem interrogation surfaces hidden constraints, edge cases, and architectural risks before specifications and code are committed.',
  },
  {
    id: 'Q6',
    questionType: 'advanced',
    title: 'Shared Edge Caching: Preventing Tenant Information Leaks',
    context:
      'A school portal deploys a shared CDN edge cache in front of its API. An authenticated student views their private academic transcript. Shortly after, another student on a shared computer requests the same endpoint and views the first student\'s private grades.',
    codeSnippet: `HTTP/1.1 200 OK\nContent-Type: application/json\nCache-Control: public, max-age=3600`,
    codeLanguage: 'http',
    prompt: 'Which HTTP Cache-Control header directive prevents intermediate CDNs and shared proxies from caching private student data?',
    options: [
      'Cache-Control: public, max-age=86400',
      'Cache-Control: private, no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin: *',
      'X-Forwarded-For: 127.0.0.1',
    ],
    correctAnswer: 1,
    ruleId: 'SEC-15',
    explanation:
      'Configuring Cache-Control: private, no-store, no-cache, must-revalidate on authenticated user responses ensures downstream CDNs, shared proxies, and browser caches never persist tenant-sensitive records.',
  },
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export default function AssessmentPage() {
  const router = useRouter();

  // Dynamic Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>(INITIAL_FALLBACK_QUESTIONS);
  const [selectedPersona, setSelectedPersona] = useState<PersonaLevel>('junior');
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

  // Call the Dynamic Quiz Generation API with selected candidate persona
  const handleGenerateAssessment = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: selectedPersona }),
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
        'AI generation experienced latency or rate limits. Loaded standard scenario battery.'
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

              {/* Candidate Persona / Difficulty Selector */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    <span>Candidate Persona / Assessment Rigor</span>
                  </label>
                  <span className="text-[11px] font-mono text-cyan-600 dark:text-[#00ffff]">
                    Scenario-Adaptive
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {PERSONA_CONFIGS.map((persona) => {
                    const isSelected = selectedPersona === persona.id;
                    const Icon = persona.icon;
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => setSelectedPersona(persona.id)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.2)] text-slate-900 dark:text-white'
                            : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div
                              className={`p-2 rounded-xl ${
                                isSelected
                                  ? 'bg-cyan-500 text-black'
                                  : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                                isSelected
                                  ? 'bg-cyan-500/20 text-cyan-600 dark:text-[#00ffff] border border-cyan-500/30'
                                  : 'bg-slate-200/60 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                              }`}
                            >
                              {persona.badge}
                            </span>
                          </div>
                          <div className="text-xs font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                            {persona.title}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 leading-snug">
                            {persona.description}
                          </div>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-white/5 text-[10px] font-mono text-slate-500 dark:text-zinc-500 leading-tight">
                          Focus: {persona.focus}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={handleGenerateAssessment}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-sm transition-all shadow-[0_0_25px_rgba(0,255,255,0.35)] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>
                    Generate AI Assessment (
                    {PERSONA_CONFIGS.find((p) => p.id === selectedPersona)?.title}) →
                  </span>
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
              {/* Category Badges - Rule IDs strictly hidden during active test */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-[#00ffff] border border-cyan-500/20 font-bold uppercase">
                    TYPE: {currentQuestion.questionType.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10 font-mono">
                    LEVEL: {PERSONA_CONFIGS.find((p) => p.id === selectedPersona)?.title.toUpperCase() || 'JUNIOR DEVELOPER'}
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
                      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 dark:border-emerald-400/30 text-xs sm:text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs uppercase">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>INVARIANT VERIFIED (+1 PT)</span>
                          </div>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono">
                            Rule: {currentQuestion.ruleId}
                          </span>
                        </div>

                        <p className="text-slate-700 dark:text-zinc-200 leading-relaxed mb-3">
                          This scenario tests your understanding of{' '}
                          <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            [{currentQuestion.ruleId}]
                          </strong>{' '}
                          ({getRuleFriendlyName(currentQuestion.ruleId)}). You verified this because{' '}
                          {currentQuestion.explanation}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                          <span>Rule Validated: [{currentQuestion.ruleId}]</span>
                          <span className="font-semibold text-emerald-500">Status: PASS</span>
                        </div>
                      </div>
                    ) : (
                      // INCORRECT ANSWER HUD (Rose/Red)
                      <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 dark:border-rose-400/30 text-xs sm:text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs uppercase">
                            <AlertTriangle className="w-4 h-4" />
                            <span>INVARIANT VIOLATION (0 PTS)</span>
                          </div>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-500 border border-rose-500/30 uppercase font-mono">
                            Failed Rule: {currentQuestion.ruleId}
                          </span>
                        </div>

                        <p className="text-slate-700 dark:text-zinc-200 leading-relaxed mb-3">
                          This scenario tests your understanding of{' '}
                          <strong className="text-rose-600 dark:text-rose-400 font-mono font-bold">
                            [{currentQuestion.ruleId}]
                          </strong>{' '}
                          ({getRuleFriendlyName(currentQuestion.ruleId)}). You missed this because{' '}
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
