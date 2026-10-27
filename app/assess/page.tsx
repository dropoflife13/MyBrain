'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  Flame,
  HelpCircle,
  Play,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import Brain3D from '../../components/Brain3D';
import CommandPalette from '../../components/CommandPalette';
import { ThemeToggle } from '../../components/ThemeToggle';
import { BrainDocNode, getBrainData } from '../../lib/brain-parser';

interface ScenarioOption {
  id: 'A' | 'B' | 'C' | 'D';
  label: string;
  rationale: string;
  earnedRuleId: string;
  earnedRuleTitle: string;
  ruleCategory: 'security' | 'database' | 'systems' | 'ui' | 'operations' | 'taste';
  agentCode: 'SEC' | 'DB' | 'SD' | 'UX' | 'IR' | 'PM' | 'GR';
  confidence: number;
}

interface DiagnosticScenario {
  id: string;
  triggerType: 'Artifact Archaeology' | 'The Cringe Test' | 'Trade-Off Triad' | 'Pre-Flight Invariant' | 'Architecture Probe';
  agentTarget: 'SEC' | 'DB' | 'SD' | 'UX' | 'IR' | 'PM' | 'GR';
  title: string;
  context: string;
  codeSnippet?: string;
  codeLanguage?: string;
  prompt: string;
  examinerKey: string;
  options: ScenarioOption[];
}

const DIAGNOSTIC_SCENARIOS: DiagnosticScenario[] = [
  {
    id: 'DIAG-01',
    triggerType: 'The Cringe Test',
    agentTarget: 'SEC',
    title: 'Compliant-but-Wrong: RLS & Privileged Keys',
    context:
      'During a pre-launch security audit, a SaaS application passes all checklist items: TLS 1.3 enforced, MFA enabled for staff, and Row Level Security (RLS) enabled on all 12 PostgreSQL tables. However, you inspect the Next.js client bundle and database policies.',
    codeSnippet: `-- supabase/policies.sql
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON user_sessions
  FOR SELECT TO authenticated
  USING (true); -- Notice the condition

// .env.production (bundled into client)
NEXT_PUBLIC_SUPABASE_SERVICE_KEY="eyJhbGciOi..."`,
    codeLanguage: 'sql',
    prompt: 'What is your immediate engineering response before shipping?',
    examinerKey:
      'F1: USING (true) permits ANY authenticated user to read all other users’ sessions. F2: Exposing the service-role key client-side completely bypasses RLS anyway.',
    options: [
      {
        id: 'A',
        label: 'Block release immediately: Replace USING (true) with auth.uid() check and revoke client-side service key.',
        rationale: 'Fail-closed security: A checklist pass is meaningless if authorization is structurally bypassed.',
        earnedRuleId: 'CS-01',
        earnedRuleTitle: 'Least Privilege Service Keys & Scoped RLS',
        ruleCategory: 'security',
        agentCode: 'SEC',
        confidence: 3,
      },
      {
        id: 'B',
        label: 'Ship on schedule since RLS is marked enabled, and file a P2 Jira ticket to restrict the policy next sprint.',
        rationale: 'Velocity bias over security boundaries; exposes multi-tenant data.',
        earnedRuleId: 'RF-01',
        earnedRuleTitle: 'Compliant-but-Insecure Policy Trap',
        ruleCategory: 'security',
        agentCode: 'SEC',
        confidence: 1,
      },
      {
        id: 'C',
        label: 'Add a Cloudflare WAF rule to inspect incoming HTTP payloads for suspicious query parameters.',
        rationale: 'WAFs cannot fix broken object-level authorization inside the database layer.',
        earnedRuleId: 'CS-04',
        earnedRuleTitle: 'Defense in Depth & Database Boundary Separation',
        ruleCategory: 'security',
        agentCode: 'SEC',
        confidence: 2,
      },
      {
        id: 'D',
        label: 'Disable RLS completely and handle all tenant permission filtering inside Next.js server actions.',
        rationale: 'Moves data boundary into application layer, prone to leakage if any endpoint forgets a WHERE clause.',
        earnedRuleId: 'SO-03',
        earnedRuleTitle: 'Database-Level Enforced Isolation',
        ruleCategory: 'systems',
        agentCode: 'SD',
        confidence: 2,
      },
    ],
  },
  {
    id: 'DIAG-02',
    triggerType: 'Trade-Off Triad',
    agentTarget: 'DB',
    title: 'High-Volume Tenant Indexing vs Write Throughput',
    context:
      'Your application manages 4M active transaction records. A new analytics feature requires filtering by `tenant_id`, `status`, and `created_at`. Under test load, write ingestion takes 18% longer when a composite B-Tree index is added, but read latency drops from 680ms to 4ms.',
    codeSnippet: `-- Migration candidate
CREATE INDEX CONCURRENTLY idx_transactions_tenant_status_date 
  ON transactions(tenant_id, status, created_at DESC);`,
    codeLanguage: 'sql',
    prompt: 'How do you structure this database boundary under production constraints?',
    examinerKey:
      'Index strategy must balance write amplification with query SLA. The tenant_id lead column provides cardinality isolation; concurrent creation prevents write locking.',
    options: [
      {
        id: 'A',
        label: 'Deploy CONCURRENTLY with tenant_id prefix; accept 18% write overhead to guarantee sub-10ms queries.',
        rationale: 'Reads outnumber writes 15:1; predictable latency and zero downtime migration take precedence.',
        earnedRuleId: 'DB-01',
        earnedRuleTitle: 'Concurrent Composite Indexing with Tenant Lead',
        ruleCategory: 'database',
        agentCode: 'DB',
        confidence: 3,
      },
      {
        id: 'B',
        label: 'Avoid the index to protect write speed; offload read queries to an in-memory Redis cache with 60s TTL.',
        rationale: 'Caching masks underlying database design flaws and leads to cache invalidation race conditions.',
        earnedRuleId: 'DB-05',
        earnedRuleTitle: 'Primary Store Authority over Ephemeral Caching',
        ruleCategory: 'database',
        agentCode: 'DB',
        confidence: 2,
      },
      {
        id: 'C',
        label: 'Split the table into separate per-tenant schemas immediately to eliminate the need for tenant indexing.',
        rationale: 'Extreme operational complexity; schema sprawl breaks migrations for early-stage systems.',
        earnedRuleId: 'SO-04',
        earnedRuleTitle: 'Proportional Data Architecture',
        ruleCategory: 'systems',
        agentCode: 'SD',
        confidence: 2,
      },
      {
        id: 'D',
        label: 'Delay the migration until traffic reaches 10M rows and queries breach 1500ms.',
        rationale: 'Reactive maintenance causes production outages during sudden traffic spikes.',
        earnedRuleId: 'OP-02',
        earnedRuleTitle: 'Proactive Telemetry & Query Budgeting',
        ruleCategory: 'operations',
        agentCode: 'IR',
        confidence: 1,
      },
    ],
  },
  {
    id: 'DIAG-03',
    triggerType: 'Architecture Probe',
    agentTarget: 'SD',
    title: 'Distributed System Sizing: Microservices vs Monolith',
    context:
      'A proposal arrives for a field monitoring system servicing 400 municipal staff. The proposed architecture consists of 8 Dockerized microservices orchestrated via Kubernetes, an Apache Kafka event bus, a GraphQL federation gateway, and isolated databases per service. The engineering team consists of 3 developers, and go-live is in 6 weeks.',
    codeSnippet: `# Architecture Proposal Diagram
[Mobile App] -> [Envoy Gateway] 
   -> [Auth Service (K8s)]
   -> [Asset Service (K8s)]
   -> [Event Bus (Kafka)] -> [Sync Service (K8s)]
   -> [ML Anomaly Service (Python / Free Tier Hosting)]`,
    codeLanguage: 'yaml',
    prompt: 'What is your architectural verdict on this proposal?',
    examinerKey:
      'Architecture must be sized to team cognitive bandwidth and actual user scale. 3 developers cannot maintain K8s + Kafka + 8 services under a 6-week deadline without cascading outages.',
    options: [
      {
        id: 'A',
        label: 'Reject the distributed topology: Mandate a modular Next.js / Node monolith with a single PostgreSQL database.',
        rationale: 'Proportional architecture: Sized to team bandwidth and delivery runway; eliminates distributed failure modes.',
        earnedRuleId: 'SO-01',
        earnedRuleTitle: 'Modular Monolith First for High-Velocity Teams',
        ruleCategory: 'systems',
        agentCode: 'SD',
        confidence: 3,
      },
      {
        id: 'B',
        label: 'Approve the proposal as written: Modern systems should always be microservices to allow independent scaling.',
        rationale: 'Resume-driven development that bankrupts small engineering teams with operational overhead.',
        earnedRuleId: 'RF-03',
        earnedRuleTitle: 'Premature Microservices Anti-Pattern',
        ruleCategory: 'systems',
        agentCode: 'SD',
        confidence: 1,
      },
      {
        id: 'C',
        label: 'Keep Kubernetes and Kafka, but merge the 8 services into 4 services.',
        rationale: 'Half-measure that still carries the full infrastructure maintenance tax of Kafka and K8s.',
        earnedRuleId: 'SO-05',
        earnedRuleTitle: 'Operational Complexity Budgeting',
        ruleCategory: 'systems',
        agentCode: 'SD',
        confidence: 2,
      },
      {
        id: 'D',
        label: 'Outsource the Kubernetes operations to a managed cloud provider and proceed with parallel microservice development.',
        rationale: 'Cloud hosting costs escalate dramatically while distributed data consistency issues remain unsolved.',
        earnedRuleId: 'BA-04',
        earnedRuleTitle: 'Total Cost of Ownership & Sustainable Runway',
        ruleCategory: 'operations',
        agentCode: 'PM',
        confidence: 2,
      },
    ],
  },
  {
    id: 'DIAG-04',
    triggerType: 'Artifact Archaeology',
    agentTarget: 'UX',
    title: 'WebGL State Machine: Dual Camera Control Jitter',
    context:
      'In an interactive 3D WebGL data visualization, users report that camera auto-rotation intermittently stutters and snaps backwards when zooming. Investigation reveals that a `requestAnimationFrame` lerp loop and Three.js `OrbitControls` are both mutating the camera position simultaneously without exclusive ownership.',
    codeSnippet: `// components/GraphViewer.tsx
function renderLoop() {
  requestAnimationFrame(renderLoop);
  camera.position.x += (targetX - camera.position.x) * 0.05; // Lerp fighting
  controls.update(); // OrbitControls overrides spherical angles!
}`,
    codeLanguage: 'typescript',
    prompt: 'How do you enforce single-source-of-truth camera ownership?',
    examinerKey:
      'Never allow two state mutators on camera transforms. OrbitControls must be sole owner with autoRotate = true; manual lerps must be locked behind an explicit transitioning flag.',
    options: [
      {
        id: 'A',
        label: 'Establish single-owner OrbitControls: Delegate auto-rotation to controls.autoRotate and lock manual lerping.',
        rationale: 'Eliminates competing state mutators (UI-07); preserves 60 FPS fluidity and natural touch gestures.',
        earnedRuleId: 'UI-07',
        earnedRuleTitle: 'Single-Owner OrbitControls & Camera State Isolation',
        ruleCategory: 'ui',
        agentCode: 'UX',
        confidence: 3,
      },
      {
        id: 'B',
        label: 'Increase the lerp interpolation factor from 0.05 to 0.5 to outspeed OrbitControls updates.',
        rationale: 'Band-aid that creates even more jarring visual snapping and breaks user drag interactions.',
        earnedRuleId: 'UI-02',
        earnedRuleTitle: 'Deterministic Physics & Animation Timelines',
        ruleCategory: 'ui',
        agentCode: 'UX',
        confidence: 1,
      },
      {
        id: 'C',
        label: 'Disable user dragging entirely and keep only the scripted automated camera fly-through.',
        rationale: 'Degrades UX by removing user agency and exploratory spatial interaction.',
        earnedRuleId: 'TA-04',
        earnedRuleTitle: 'Tactile Responsiveness & User Agency',
        ruleCategory: 'taste',
        agentCode: 'UX',
        confidence: 2,
      },
      {
        id: 'D',
        label: 'Replace Three.js WebGL rendering with a static 2D SVG canvas chart.',
        rationale: 'Abandoning architectural capabilities due to improper state management.',
        earnedRuleId: 'UI-05',
        earnedRuleTitle: 'Multi-Dimensional Data Density',
        ruleCategory: 'ui',
        agentCode: 'UX',
        confidence: 1,
      },
    ],
  },
  {
    id: 'DIAG-05',
    triggerType: 'Pre-Flight Invariant',
    agentTarget: 'IR',
    title: 'Fail-Closed Gatekeeper: Invariant BN-00 Verification',
    context:
      'A teammate clones your repository into production. To make their minimal feature run faster, they delete the security gatekeeper and database architect configuration files, believing optional agents can be skipped during early staging.',
    codeSnippet: `// Terminal command executed:
$ rm agents/securityagent.md
$ npm run dev

// System Reaction:
[CORTEX KERNEL] Pre-flight audit initialized...
GATE: FAIL BN-00 • AGENT_NOT_FOUND: securityagent.md`,
    codeLanguage: 'bash',
    prompt: 'Should the runtime degrade silently and boot anyway, or halt completely?',
    examinerKey:
      'Fail-closed governance (BN-00 / CS-07): A system cannot operate in ungoverned mode. Missing gatekeepers must crash the boot sequence with a clear invariant failure.',
    options: [
      {
        id: 'A',
        label: 'Fail-closed hard halt: Display the red PANIC overlay and block all API routes until all 7 agents are restored.',
        rationale: 'Architectural invariants are non-negotiable (BN-00, CS-07). A headless cortex compromises governance.',
        earnedRuleId: 'SO-07',
        earnedRuleTitle: 'Strict Pre-Flight Gatekeeping & Fail-Closed Boot',
        ruleCategory: 'systems',
        agentCode: 'IR',
        confidence: 3,
      },
      {
        id: 'B',
        label: 'Boot in degraded mode with a yellow console warning so the developer is not blocked.',
        rationale: 'Silent degradation allows ungoverned code to bypass security and schema audits into production.',
        earnedRuleId: 'RF-05',
        earnedRuleTitle: 'Silent Degradation & Governance Bypass',
        ruleCategory: 'operations',
        agentCode: 'IR',
        confidence: 1,
      },
      {
        id: 'C',
        label: 'Automatically generate an empty placeholder file so the build passes.',
        rationale: 'Fake compliance that satisfies the check while gutting the actual gatekeeper logic.',
        earnedRuleId: 'CS-07',
        earnedRuleTitle: 'Authentic Gate Validation & Checksum Verification',
        ruleCategory: 'security',
        agentCode: 'SEC',
        confidence: 2,
      },
      {
        id: 'D',
        label: 'Only enforce the gate check on git push, but allow local dev and staging to run freely without agents.',
        rationale: 'Creates drift between local environment behavior and production verification.',
        earnedRuleId: 'OP-04',
        earnedRuleTitle: 'Environment Parity & Universal Invariants',
        ruleCategory: 'operations',
        agentCode: 'IR',
        confidence: 2,
      },
    ],
  },
  {
    id: 'DIAG-06',
    triggerType: 'Trade-Off Triad',
    agentTarget: 'PM',
    title: 'The 48-Hour Launch Razor: Craft vs Velocity',
    context:
      'You are 48 hours away from a high-profile public release. A core API response has an N+1 query issue that takes 450ms. A quick 1-line Redis cache hides the latency to 5ms, but a proper refactoring of the relational join would take 14 hours of focused coding and risk introducing regression bugs.',
    codeSnippet: `// Option 1: Band-aid Cache (3 minutes)
await redis.set(\`user_feed:\${id}\`, data, 'EX', 120);

// Option 2: Join Refactoring (14 hours)
SELECT u.*, json_agg(posts.*) FROM users u 
JOIN posts ON posts.user_id = u.id GROUP BY u.id;`,
    codeLanguage: 'typescript',
    prompt: 'What is your operational razor under real-world launch pressure?',
    examinerKey:
      'Pragmatic triage: Ship with the defensive cache to protect release velocity, but file a P0 debt invariant with automated telemetry to refactor within 72h post-launch.',
    options: [
      {
        id: 'A',
        label: 'Ship with defensive Redis caching for the launch window; lock a P0 refactor ticket with telemetry to resolve in sprint +1.',
        rationale: 'Pragmatic engineering razor: Protects the launch milestone without denying technical debt (OP-01).',
        earnedRuleId: 'OP-01',
        earnedRuleTitle: 'Pragmatic Delivery Razor & Tracked Debt Invariants',
        ruleCategory: 'operations',
        agentCode: 'PM',
        confidence: 3,
      },
      {
        id: 'B',
        label: 'Delay the public launch by 4 days to completely rewrite the data access layer.',
        rationale: 'Uncoordinated launch delays destroy commercial trust when a viable compensating control exists.',
        earnedRuleId: 'BA-02',
        earnedRuleTitle: 'Commercial Viability & Commitment Delivery',
        ruleCategory: 'operations',
        agentCode: 'PM',
        confidence: 2,
      },
      {
        id: 'C',
        label: 'Ship the N+1 query directly without caching or refactoring and see if the database crashes.',
        rationale: 'Negligent launch posture that risks catastrophic downtime under public traffic.',
        earnedRuleId: 'RF-02',
        earnedRuleTitle: 'Uncontrolled Production Exposure',
        ruleCategory: 'operations',
        agentCode: 'IR',
        confidence: 1,
      },
      {
        id: 'D',
        label: 'Apply the Redis cache and permanently delete the refactor ticket since users cannot tell the difference.',
        rationale: 'Accumulates silent architectural rot that detonates during future schema migrations.',
        earnedRuleId: 'TA-02',
        earnedRuleTitle: 'Integrity of Internal State & Craft Standards',
        ruleCategory: 'taste',
        agentCode: 'PM',
        confidence: 1,
      },
    ],
  },
];

export default function AssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = Intro, 1..6 = Scenarios, 7 = Results
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [copiedInbox, setCopiedInbox] = useState<boolean>(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState<boolean>(false);

  const graphData = useMemo(() => getBrainData({ nodeCount: 360 }), []);

  // Compute active focused node in the 3D constellation based on current scenario
  const currentScenario = currentStep >= 1 && currentStep <= DIAGNOSTIC_SCENARIOS.length
    ? DIAGNOSTIC_SCENARIOS[currentStep - 1]
    : null;

  const currentFocusedNode = useMemo(() => {
    if (!currentScenario) return null;
    const selectedAnswerKey = answers[currentStep - 1];
    if (selectedAnswerKey) {
      const opt = currentScenario.options.find((o) => o.id === selectedAnswerKey);
      if (opt) {
        const found = graphData.nodes.find(
          (n) =>
            n.id.toLowerCase() === opt.earnedRuleId.toLowerCase() ||
            String(n.id).toLowerCase().startsWith(`${opt.earnedRuleId.toLowerCase()}::`)
        );
        if (found) return found;
      }
    }
    // Fallback: focus on the target agent hub
    return (
      graphData.nodes.find(
        (n) => n.agentCode === currentScenario.agentTarget && n.category === 'agent'
      ) || null
    );
  }, [currentScenario, currentStep, answers, graphData.nodes]);

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

      if (currentStep >= 1 && currentStep <= DIAGNOSTIC_SCENARIOS.length) {
        if (['1', '2', '3', '4'].includes(e.key) && !showExplanation) {
          const map: Record<string, 'A' | 'B' | 'C' | 'D'> = {
            '1': 'A',
            '2': 'B',
            '3': 'C',
            '4': 'D',
          };
          handleSelectOption(map[e.key]);
        } else if (e.key === 'Enter' && showExplanation) {
          handleNextScenario();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, showExplanation, isCmdPaletteOpen]);

  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({ ...prev, [currentStep - 1]: optionId }));
    setShowExplanation(true);
  };

  const handleNextScenario = () => {
    setShowExplanation(false);
    if (currentStep < DIAGNOSTIC_SCENARIOS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setCurrentStep(DIAGNOSTIC_SCENARIOS.length + 1); // Go to results
    }
  };

  // Score computation
  const results = useMemo(() => {
    const unlockedRules: ScenarioOption[] = [];
    const agentScores: Record<string, number> = {
      SEC: 0,
      DB: 0,
      SD: 0,
      UX: 0,
      IR: 0,
      PM: 0,
      GR: 0,
    };

    DIAGNOSTIC_SCENARIOS.forEach((scenario, idx) => {
      const ansKey = answers[idx];
      if (ansKey) {
        const option = scenario.options.find((o) => o.id === ansKey);
        if (option) {
          unlockedRules.push(option);
          agentScores[option.agentCode] = (agentScores[option.agentCode] || 0) + option.confidence;
        }
      }
    });

    const totalConfidence = unlockedRules.reduce((acc, r) => acc + r.confidence, 0);
    const maxConfidence = DIAGNOSTIC_SCENARIOS.length * 3;
    const rigorPercentage = Math.round((totalConfidence / maxConfidence) * 100);

    let classification = 'Pragmatic Systems Architect';
    if (rigorPercentage >= 85) {
      classification = 'High-Rigor Principal Systems Gatekeeper';
    } else if (agentScores.SEC >= 5) {
      classification = 'Defensive Security & Resilience Specialist';
    } else if (agentScores.DB >= 5) {
      classification = 'High-Throughput Data Infrastructure Architect';
    } else if (agentScores.UX >= 5) {
      classification = 'Craft-Focused Full-Stack Frontend Engineer';
    }

    return {
      unlockedRules,
      agentScores,
      rigorPercentage,
      classification,
    };
  }, [answers]);

  const handleCopyInbox = () => {
    const lines = [
      '# Custom Inbox Rules — Excavated from Launcher L-01',
      `# Date: ${new Date().toISOString().split('T')[0]}`,
      `# Archetype: ${results.classification} (Rigor: ${results.rigorPercentage}%)`,
      '',
    ];

    results.unlockedRules.forEach((rule) => {
      lines.push(
        `- **${rule.earnedRuleId}** | ${rule.earnedRuleTitle} | ${rule.rationale} | conf: ${rule.confidence} | ev: L-01-web-assessment | status: active ^${rule.earnedRuleId.toLowerCase()}`
      );
    });

    navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
    setCopiedInbox(true);
    setTimeout(() => setCopiedInbox(false), 2200);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300 selection:bg-cyan-500 selection:text-black overflow-x-hidden font-sans">
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
          {currentStep >= 1 && currentStep <= DIAGNOSTIC_SCENARIOS.length && (
            <div className="h-10 px-4 rounded-xl bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl flex items-center gap-3">
              <span className="text-xs font-mono text-cyan-600 dark:text-[#00ffff] font-semibold">
                Challenge {currentStep} / {DIAGNOSTIC_SCENARIOS.length}
              </span>
              <div className="w-24 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_8px_rgba(0,255,255,0.6)]"
                  style={{
                    width: `${(currentStep / DIAGNOSTIC_SCENARIOS.length) * 100}%`,
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
                  PROTOCOL: LAUNCHER L-01
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                  Fast Diagnostic Excavation
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                Earn Your Engineering Judgment.
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
                A blank-slate vault begins with <strong>0 rules</strong>. You cannot copy-paste someone
                else’s decisions: true judgment is earned through high-pressure trade-offs. Step through
                6 authentic scenarios spanning Security, Database Architecture, Systems Sizing, and
                Pre-Flight Governance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <Flame className="w-5 h-5 text-amber-500 mb-2" />
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    The Cringe Test
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Spot structural flaws before checklists mislead you.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <Zap className="w-5 h-5 text-cyan-500 mb-2" />
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    Trade-Off Triads
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Pressure-test velocity vs data integrity under 48h deadlines.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    7-Agent Validation
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Watch synaptic nodes light up in 3D WebGL in real time.
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-sm transition-all shadow-[0_0_25px_rgba(0,255,255,0.35)] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Begin Diagnostic Probe →</span>
                </button>

                <Link
                  href="/console"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/80 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-zinc-200 text-sm font-mono transition-colors"
                >
                  <span>Skip to 3D Console</span>
                </Link>
              </div>
            </motion.div>
          )}

          {/* STAGE 1..6: SCENARIOS */}
          {currentScenario && (
            <motion.div
              key={`scenario-${currentScenario.id}`}
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
                    {currentScenario.triggerType}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10">
                    Agent: {currentScenario.agentTarget}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                  Select 1–4 or Click
                </span>
              </div>

              {/* Title & Context */}
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
                {currentScenario.title}
              </h2>
              <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed mb-4">
                {currentScenario.context}
              </p>

              {/* Code Snippet Box */}
              {currentScenario.codeSnippet && (
                <div className="mb-5 rounded-xl bg-slate-900 border border-slate-800 dark:border-white/10 p-4 font-mono text-xs overflow-x-auto text-slate-200 shadow-inner">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      {currentScenario.codeLanguage?.toUpperCase()} INSPECTION
                    </span>
                  </div>
                  <pre className="leading-relaxed whitespace-pre font-mono">
                    {currentScenario.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Prompt */}
              <div className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-500" />
                <span>{currentScenario.prompt}</span>
              </div>

              {/* Option Buttons */}
              <div className="grid grid-cols-1 gap-2.5 mb-6">
                {currentScenario.options.map((opt, i) => {
                  const isSelected = answers[currentStep - 1] === opt.id;
                  const isBest = opt.confidence === 3;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={showExplanation}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`text-left p-4 rounded-xl border transition-all text-xs sm:text-sm font-sans flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? isBest
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : showExplanation
                          ? 'opacity-60 bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-white/5 text-slate-500 dark:text-zinc-400'
                          : 'bg-white dark:bg-zinc-900/70 hover:bg-slate-50 dark:hover:bg-zinc-800/80 border-slate-200 dark:border-white/10 text-slate-800 dark:text-zinc-200 hover:border-cyan-500/40'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected
                            ? isBest
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-500 text-black'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <div className="flex-1 leading-snug">
                        <span className="font-medium">{opt.label}</span>
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
                    <div className="p-4 rounded-2xl bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/30 dark:border-cyan-400/30 text-xs sm:text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-cyan-600 dark:text-[#00ffff] font-mono font-bold text-xs uppercase">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>SYNAPTIC NODE ACTIVATED</span>
                        </div>
                        {currentFocusedNode && (
                          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                            Node: {currentFocusedNode.id}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-700 dark:text-zinc-200 leading-relaxed mb-3">
                        {currentScenario.examinerKey}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20 text-xs font-mono text-cyan-700 dark:text-cyan-300">
                        <span>Unlocked: [{currentScenario.options.find(o => o.id === answers[currentStep - 1])?.earnedRuleId}]</span>
                        <span className="font-semibold">
                          Confidence: +{currentScenario.options.find(o => o.id === answers[currentStep - 1])?.confidence} / 3
                        </span>
                      </div>
                    </div>
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
                      {currentStep < DIAGNOSTIC_SCENARIOS.length
                        ? 'Next Challenge →'
                        : 'View Judgment Report →'}
                    </span>
                    <kbd className="text-[9px] px-1 py-0.5 rounded bg-black/20 text-black font-mono">
                      Enter
                    </kbd>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STAGE 7: DIAGNOSTIC RESULTS REPORT */}
          {currentStep > DIAGNOSTIC_SCENARIOS.length && (
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
                Your engineering instincts scored an overall Architectural Rigor rating of{' '}
                <strong className="text-cyan-600 dark:text-[#00ffff]">
                  {results.rigorPercentage}%
                </strong>
                . You earned {results.unlockedRules.length} verified rules across the 7-Agent
                governance matrix.
              </p>

              {/* Agent Alignment Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
                {Object.entries(results.agentScores).map(([agent, score]) => (
                  <div
                    key={agent}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10"
                  >
                    <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase">
                      Agent [{agent}]
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                      +{score} pts
                    </div>
                  </div>
                ))}
              </div>

              {/* Earned Rules Breakdown */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-zinc-300 tracking-wider">
                    Activated Canonical Rules
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyInbox}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-mono text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
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

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {results.unlockedRules.map((rule) => (
                    <div
                      key={rule.earnedRuleId}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 flex items-start gap-3"
                    >
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-[#00ffff] border border-cyan-500/20 shrink-0">
                        {rule.earnedRuleId}
                      </span>
                      <div className="flex-1 text-xs">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {rule.earnedRuleTitle}
                        </div>
                        <div className="text-slate-500 dark:text-zinc-400 mt-0.5">
                          {rule.rationale}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                        conf: {rule.confidence}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => router.push('/console')}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)] cursor-pointer"
                >
                  <Brain className="w-4 h-4" />
                  <span>Launch in 3D Console →</span>
                </button>

                <a
                  href="/brain-template.zip"
                  download="brain-vault-blank-template.zip"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-zinc-200 font-mono text-xs transition-colors"
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
                  title="Retake Diagnostic Quiz"
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

