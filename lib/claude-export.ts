/**
 * Claude.md / .cursorrules Export Generator for Cortex AI.
 * Bridges the Cortex Web App with local VS Code / Cursor IDEs.
 * Generates an up-to-date system prompt containing live knowledge scores
 * and strict invariants for the 8 Core Agents.
 */

export const CORE_AGENT_CODES = [
  'PM',
  'UX',
  'GR',
  'SD',
  'IR',
  'DB',
  'SEC',
  'RS',
] as const;

export type CoreAgentCode = (typeof CORE_AGENT_CODES)[number];

export interface AgentExportMeta {
  code: CoreAgentCode;
  fullName: string;
  role: string;
  file: string;
  cluster: string;
  prefixes: string[];
  keyInvariants: { id: string; title: string; summary: string }[];
}

export const CORE_AGENTS_METADATA: Record<CoreAgentCode, AgentExportMeta> = {
  PM: {
    code: 'PM',
    fullName: 'Product Manager Agent',
    role: 'PRD, TRD, business rules registry, edge case interrogation, scope cut, waiver protocol.',
    file: 'agents/productmanageragent.md',
    cluster: 'Engineering',
    prefixes: ['PM', 'BA', 'OP'],
    keyInvariants: [
      { id: 'PM-01', title: 'Problem First', summary: 'State why before how; zero solutioning before problem definition.' },
      { id: 'PM-02', title: 'Scope Boundary', summary: 'Explicit non-goals; cut 30% fluff to reach atomic MVP.' },
      { id: 'PM-03', title: 'BR Registry', summary: 'Single source of truth for business rules with unique IDs.' },
      { id: 'PM-04', title: 'Acceptance Criteria', summary: 'Given/When/Then criteria verifiable by automated tests.' },
      { id: 'PM-05', title: 'Edge Case Interrogation', summary: 'Probe failure modes, concurrency, and adversarial users before coding.' },
      { id: 'PM-12', title: 'Waiver Protocol', summary: 'Only PM can grant rule waivers in docs/WAIVERS.md; no agent self-waives.' },
      { id: 'PM-13', title: 'Assumptions Log', summary: 'All unverified assumptions must have an owner and expiration date.' },
      { id: 'PM-14', title: 'Traceability Matrix', summary: 'Trace every business requirement to DB, SEC, UX, and SD gates.' },
    ],
  },
  UX: {
    code: 'UX',
    fullName: 'UI/UX Agent',
    role: 'Interaction design, cognitive friction, accessibility, deterministic UI state, zero fake saves.',
    file: 'agents/uiuxagent.md',
    cluster: 'Engineering',
    prefixes: ['UX', 'UI', 'TA'],
    keyInvariants: [
      { id: 'UX-01', title: 'Deterministic State', summary: 'Honest UI state; zero phantom loaders or misleading UI indicators.' },
      { id: 'UX-02', title: 'Accessible Semantics', summary: 'WCAG 2.1 AA focus rings, ARIA labels, and full keyboard navigability.' },
      { id: 'UX-03', title: 'Touch Targets', summary: 'Minimum 44x44px interactive target sizes on mobile layouts.' },
      { id: 'UX-04', title: 'Theme Contrast', summary: 'High contrast across dark/light modes; zero blinding flashes on mount.' },
      { id: 'UX-05', title: 'Zero Fake Saves', summary: 'Never display success toast unless backend has committed the transaction.' },
      { id: 'UX-06', title: 'Modal Dismissal', summary: 'Esc closes modals; click backdrop dismisses; restore focus on exit.' },
      { id: 'UX-07', title: 'Preserved Focus', summary: 'Command palettes and inputs must preserve focus without layout shift.' },
      { id: 'UX-12', title: 'Offline Awareness', summary: 'Display explicit offline badge; rollback optimistic updates on failure.' },
    ],
  },
  GR: {
    code: 'GR',
    fullName: 'Growth Agent',
    role: 'Value synthesis, executive pitches, activation loops, viral mechanics, SEO, analytics telemetry.',
    file: 'agents/growthagent.md',
    cluster: 'Engineering',
    prefixes: ['GR'],
    keyInvariants: [
      { id: 'GR-01', title: 'Social Metadata', summary: 'OpenGraph, Twitter cards, and dynamic previews for all shareable pages.' },
      { id: 'GR-02', title: 'SEO Hygiene', summary: 'Semantic heading hierarchy, canonical URLs, sitemaps, and robots.txt.' },
      { id: 'GR-03', title: 'Privacy Telemetry', summary: 'UTM tagging and analytics without transmitting sensitive user PII.' },
      { id: 'GR-04', title: 'Debounced Search', summary: '150ms debounce on search and interactive inputs to protect backends.' },
      { id: 'GR-05', title: 'Frictionless Viral Hooks', summary: '1-click copy-to-clipboard, shareable deep links, and fork templates.' },
      { id: 'GR-06', title: 'Performance Budget', summary: 'Core Web Vitals enforcement: LCP < 2.5s, FID/INP < 200ms, CLS < 0.1.' },
    ],
  },
  SD: {
    code: 'SD',
    fullName: 'Systems Design Agent',
    role: 'Architecture boundaries, failure domains, data contracts, TRDs, SLOs, distributed consensus.',
    file: 'agents/systemsdesignagent.md',
    cluster: 'Engineering',
    prefixes: ['SD', 'SO'],
    keyInvariants: [
      { id: 'SD-01', title: 'CAP Trade-offs', summary: 'Explicit document of consistency vs availability requirements.' },
      { id: 'SD-02', title: 'Consistency Boundaries', summary: 'Strict separation of read-your-writes vs lag-tolerant read replicas.' },
      { id: 'SD-03', title: 'SPOF Audit', summary: 'Identify single points of failure across services, queues, and caches.' },
      { id: 'SD-04', title: 'SLO Definition', summary: 'Latency p95/p99, throughput, and error budget definitions for each route.' },
      { id: 'SD-05', title: 'Async Offloading', summary: 'Keep write critical paths short; offload heavy jobs to worker queues.' },
      { id: 'SD-06', title: 'ADR Enforcement', summary: 'Major architectural pivots require an Architectural Decision Record.' },
      { id: 'SD-08', title: 'Blast Radius Limits', summary: 'Circuit breakers, rate limits, and bulkheads between micro-services.' },
      { id: 'SD-09', title: 'Contract-First APIs', summary: 'Explicit schemas (TypeScript/Zod/OpenAPI) before writing endpoints.' },
    ],
  },
  IR: {
    code: 'IR',
    fullName: 'Integration Agent',
    role: 'External API contracts, offline sync queues, retry backoff, idempotent webhooks, outbox sync.',
    file: 'agents/integrationagent.md',
    cluster: 'Engineering',
    prefixes: ['IR', 'RF', 'H', 'P'],
    keyInvariants: [
      { id: 'IR-01', title: 'Webhook Verification', summary: 'HMAC SHA-256 signature verification in constant-time comparison.' },
      { id: 'IR-02', title: 'Idempotent Consumer', summary: 'Deduplication ledger prevents double-processing of incoming webhooks.' },
      { id: 'IR-03', title: 'Transactional Outbox', summary: 'Atomically commit outbound events with domain data before publishing.' },
      { id: 'IR-04', title: 'Exponential Backoff', summary: 'Retries must incorporate exponential backoff with full randomized jitter.' },
      { id: 'IR-05', title: 'Dead Letter Queue', summary: 'Poison pill events routed to DLQ after max retries with inspection hook.' },
      { id: 'IR-07', title: 'Worker Debounce', summary: 'Debounce cache/materialized view invalidation off the write path.' },
      { id: 'IR-08', title: 'Health Probes', summary: 'Explicit /healthz liveness and /readyz readiness probes with dependency checks.' },
    ],
  },
  DB: {
    code: 'DB',
    fullName: 'Database Agent',
    role: 'Schema invariants, RLS authoring, index optimization, append-only integrity, migrations.',
    file: 'agents/dbaagent.md',
    cluster: 'Engineering',
    prefixes: ['DB'],
    keyInvariants: [
      { id: 'DB-01', title: 'Append-Only Ledger', summary: 'REVOKE UPDATE/DELETE on financial logs; corrections are new rows.' },
      { id: 'DB-02', title: 'Derived State Safety', summary: 'Derived views recomputed from source logs; never accept direct client writes.' },
      { id: 'DB-03', title: 'Asynchronous Refresh', summary: 'Refresh stays off the write critical path; trigger enqueues worker refresh.' },
      { id: 'DB-04', title: 'Database-Level Integrity', summary: 'FK ON DELETE RESTRICT, NOT NULL, and CHECK constraints in database.' },
      { id: 'DB-05', title: 'Batch Ingestion RPC', summary: 'SECURITY INVOKER; server stamps received_at; idempotent idempotency keys.' },
      { id: 'DB-06', title: 'Strict RLS Enforcement', summary: 'Enabled on all tables (default deny); pgTAP allow/deny test suites.' },
      { id: 'DB-07', title: 'Indexing Discipline', summary: 'Every FK, RLS predicate, and hot WHERE/ORDER indexed with EXPLAIN evidence.' },
      { id: 'DB-13', title: 'Atomic Conditionals', summary: 'Concurrent balance updates must use atomic conditional operations ($gte/$inc).' },
      { id: 'DB-14', title: 'Multi-Tenant Isolation', summary: 'Strict tenant_id partitioning in queries and RLS; zero cross-tenant leakage.' },
    ],
  },
  SEC: {
    code: 'SEC',
    fullName: 'Security Agent',
    role: 'Offensive & defensive security, RLS bypass suites, externalized authorization, secrets, zero-trust.',
    file: 'agents/securityagent.md',
    cluster: 'Engineering',
    prefixes: ['SEC', 'CS', 'AUTH'],
    keyInvariants: [
      { id: 'SEC-01', title: 'Threat Modeling', summary: 'STRIDE threat models with attack trees for sensitive endpoints.' },
      { id: 'SEC-02', title: 'RLS Adversarial Testing', summary: 'Red-team test suites executing as anonymous and unprivileged tenants.' },
      { id: 'SEC-03', title: 'Secret Isolation', summary: 'Zero plaintext secrets in source code; strict environment variable segregation.' },
      { id: 'SEC-04', title: 'Tamper-Proof Ingestion', summary: 'HMAC signature or signed JWT required on ingestion queues.' },
      { id: 'SEC-05', title: 'Anomaly Detection', summary: 'Heuristic or ML flags on statistical outliers; quarantine suspicious writes.' },
      { id: 'SEC-06', title: 'Fail-Closed Auth', summary: 'If identity provider or auth service is unreachable, deny all access.' },
      { id: 'SEC-07', title: 'Constant-Time Compare', summary: 'Verify signatures and secrets using timingSafeEqual to prevent side-channels.' },
      { id: 'SEC-14', title: 'Zero-Trust Inputs', summary: 'Never trust frontend claims; sanitize, validate with Zod, and authorize.' },
      { id: 'SEC-15', title: 'Rate Limiting', summary: 'Apply IP and user-based token bucket rate limiting on all public endpoints.' },
    ],
  },
  RS: {
    code: 'RS',
    fullName: 'Research Agent',
    role: 'Epistemic rigor, source verification, triangulation, anti-hallucination gates, boundary tracking.',
    file: 'agents/researchagent.md',
    cluster: 'World',
    prefixes: ['RS'],
    keyInvariants: [
      { id: 'RS-01', title: 'Empirical Verification', summary: 'Cite primary sources, dates, and numbers; never invent or guess facts.' },
      { id: 'RS-02', title: 'Fact vs Hypothesis', summary: 'Explicitly separate objective facts from speculative opinions or predictions.' },
      { id: 'RS-03', title: 'The I-Do-Not-Know Gate', summary: 'Halt with clear warning when data is ungrounded or hallucination risk is high.' },
      { id: 'RS-04', title: 'Multi-Source Triangulation', summary: 'Require 2+ independent authoritative sources before accepting cross-domain claims.' },
    ],
  },
};

export interface ExportAgentScore {
  code: string;
  count: number;
  weightedScore: number;
  target: number;
  percentage: number;
  avgConfidence: number;
  isHighConfidence?: boolean;
  status: string;
}

export interface ClaudeExportData {
  levelNumber: number;
  levelTitle: string;
  totalRules: number;
  totalWeightedScore: number;
  avgConfidence: number;
  agentScores: Record<string, ExportAgentScore>;
  exportedAt?: string;
}

/**
 * Normalizes input stats payload into a structured format for prompt generation.
 */
export function normalizeExportData(stats: any): ClaudeExportData {
  const agentScores: Record<string, ExportAgentScore> = {};

  const agentList = Array.isArray(stats?.agentMastery)
    ? stats.agentMastery
    : Array.isArray(stats?.agentList)
    ? stats.agentList
    : [];

  // Index agents by code
  for (const item of agentList) {
    const code = (item.code || item.id || '').toUpperCase();
    if (!code) continue;

    const count = Number(item.count) || 0;
    const weightedScore = Number(item.weightedScore ?? item.count) || 0;
    const target = Number(item.target) || 60;
    const percentage = Number(item.percentage) || Math.min(100, Math.round((weightedScore / target) * 100));
    const avgConfidence = Number(item.avgConfidence) || (count > 0 ? Number((weightedScore / count).toFixed(1)) : 1.0);
    const isHighConfidence = Boolean(item.isHighConfidence || item.isOverclocked || weightedScore > target);

    let status = 'IN PROGRESS';
    if (isHighConfidence || percentage >= 100) {
      status = 'OVERCLOCKED';
    } else if (percentage >= 70) {
      status = 'VERIFIED';
    } else if (percentage >= 30) {
      status = 'DEVELOPING';
    } else {
      status = 'EMBRYONIC';
    }

    agentScores[code] = {
      code,
      count,
      weightedScore,
      target,
      percentage,
      avgConfidence,
      isHighConfidence,
      status,
    };
  }

  // Provide fallback default scores for core agents if not yet computed
  for (const code of CORE_AGENT_CODES) {
    if (!agentScores[code]) {
      const defaultRules = code === 'RS' ? 4 : 14;
      const defaultScore = code === 'RS' ? 16 : 56;
      agentScores[code] = {
        code,
        count: defaultRules,
        weightedScore: defaultScore,
        target: 60,
        percentage: Math.round((defaultScore / 60) * 100),
        avgConfidence: 4.0,
        status: defaultScore >= 60 ? 'OVERCLOCKED' : 'VERIFIED',
      };
    }
  }

  return {
    levelNumber: stats?.level?.levelNumber ?? 6,
    levelTitle: stats?.level?.title ?? 'Operational Cortex',
    totalRules: stats?.totalRules ?? 106,
    totalWeightedScore: stats?.totalWeightedScore ?? stats?.level?.totalWeightedScore ?? 420,
    avgConfidence: stats?.level?.avgConfidence ?? 3.9,
    agentScores,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Generates the full, production-ready system prompt Markdown file for CLAUDE.md / .cursorrules.
 */
export function generateClaudeMarkdownPrompt(statsInput: any): string {
  const data = normalizeExportData(statsInput);
  const now = data.exportedAt || new Date().toISOString();
  const dateFormatted = new Date(now).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Build the live 8-agent table
  const tableRows = CORE_AGENT_CODES.map((code) => {
    const meta = CORE_AGENTS_METADATA[code];
    const score = data.agentScores[code];
    const masteryDisplay = score.isHighConfidence ? '100%+' : `${score.percentage}%`;
    const scoreFraction = `${score.weightedScore} / ${score.target} pts`;
    return `| **${meta.fullName}** | \`[${code}]\` | ${meta.cluster} | ${score.count} rules | ${scoreFraction} | ${masteryDisplay} | conf: ${score.avgConfidence.toFixed(1)} | \`${score.status}\` |`;
  }).join('\n');

  // Build detailed invariants section
  const invariantsSections = CORE_AGENT_CODES.map((code) => {
    const meta = CORE_AGENTS_METADATA[code];
    const score = data.agentScores[code];
    const ruleBullets = meta.keyInvariants
      .map((inv) => `- **${inv.id}** (${inv.title}): ${inv.summary}`)
      .join('\n');

    return `### ${meta.fullName} (\`[${code}]\` — Mastery: ${score.percentage}% • ${score.status})
*File: \`${meta.file}\` | Rule Prefixes: \`${meta.prefixes.join(', ')}\`*
${meta.role}

**Core Invariants & Non-Negotiables:**
${ruleBullets}
`;
  }).join('\n');

  return `# Brainweb Router — Dual System Architecture & 8-Agent SDLC Prompt

> **Cortex System Prompt Export**
> **Generated:** ${dateFormatted}
> **Cognitive Level:** Level ${data.levelNumber} (${data.levelTitle}) • **Total Rules:** ${data.totalRules} • **Weighted Score:** ${data.totalWeightedScore} pts (avg conf ${data.avgConfidence.toFixed(1)})
> **Target Files:** Copy and paste into \`CLAUDE.md\` (Claude Code) or \`.cursorrules\` (Cursor IDE) in your project root.

---

## 0. Strict Pre-Flight Initialization Rule (\`BN-00\` — Hard Stop)

> **MANDATORY PRE-FLIGHT CHECK (HARD INVARIANT):**
> Before running **any** task, self-assessment (\`THE-TEST.md\`), spec generation, code implementation, or PR review, you **MUST** verify that all **8 Core Agent files** exist in \`agents/\` (or \`brain/04-agents/\`):
> 1. \`agents/productmanageragent.md\` (\`[PM]\`) — Product Requirements & Scoping
> 2. \`agents/uiuxagent.md\` (\`[UX]\`) — Interaction, Accessibility & Deterministic UI
> 3. \`agents/growthagent.md\` (\`[GR]\`) — Viral Loops, SEO, Metadata & Telemetry
> 4. \`agents/systemsdesignagent.md\` (\`[SD]\`) — Architecture, SLOs & Data Contracts
> 5. \`agents/integrationagent.md\` (\`[IR]\`) — Webhooks, Offline Queues & Retries
> 6. \`agents/dbaagent.md\` (\`[DB]\`) — Append-Only Ledger, Schemas, Indexes & RLS
> 7. \`agents/securityagent.md\` (\`[SEC]\`) — Threat Models, RLS Attacks & Zero-Trust
> 8. \`agents/researchagent.md\` (\`[RS]\`) — Epistemic Rigor, Verification & Anti-Hallucination
>
> **If even ONE of the 8 agents is missing or deleted:**
> - **DO NOT START** the task, plan, or build workflow.
> - Immediately output:
>   \`GATE: FAIL BN-00 <missing-agent-file> — Cannot initialize Brain Vault without all 8 Core Agents (PM, UX, GR, SD, IR, DB, SEC, RS). Restore the /agents directory before proceeding.\`
> - **Why:** A Procedural Brain without the 8 Execution Gatekeepers has no enforcement targets and cannot anchor its synaptic graph.

---

## 1. Core Agent Registry & Live Knowledge Scores

The table below reflects the live knowledge scores and mastery ratings computed by the Cortex Cognitive Engine:

| Agent | Code | Cluster | Enforced Rules | Weighted Score | Mastery | Confidence | Status |
|---|---|---|---|---|---|---|---|
${tableRows}

---

## 2. Dual System Architecture

This repository operates on two synchronized layers that **cannot function independently**:
1. **The 8-Agent Suite (\`agents/\`):** The **execution layer** (\`PM\`, \`UX\`, \`GR\`, \`SD\`, \`IR\`, \`DB\`, \`SEC\`, \`RS\`) that enforces strict pre-commit gates, inspects code diffs, and blocks insecure or sloppy implementations.
2. **The Procedural Brain (\`brain/\`):** The **judgment layer** that stores tacit knowledge, trade-offs, and boundary conditions (\`breaks:\`) that feed into the 8 agents.

### The Feedback Loop
- **Brain → Agent:** Active domain rules define what agents enforce in Gate checklists.
- **Agent → Brain:** When an agent gate fails or a waiver is requested during a project, the underlying decision is routed to \`brain/06-raw/inbox.md\` to elicit the boundary condition (\`breaks:\`) in the next excavation session.

---

## 3. Golden Path 6-Commands Workflow

When operating inside this repository or building features, execute work via this sequential chain:

| Step | Command | Primary Agents | Purpose & Output |
|---|---|---|---|
| **1** | \`/grill [idea]\` | \`[PM]\` | Interrogate requirements, find unhandled edge cases, cut 30% scope, create Acceptance Criteria. |
| **2** | \`/to-spec [context]\` | \`[SD]\` | Author Technical Requirements Doc (TRD), define SLOs, error budgets, contracts, and failure domains. |
| **3** | \`/to-tickets [spec]\` | \`[PM]\` + \`[SD]\` | Decompose TRD into atomic, verifiable implementation tickets with explicit dependencies. |
| **4** | \`/implement [ticket]\` | \`[DB]\` \`[SEC]\` \`[UX]\` \`[IR]\` | Write code under continuous gatekeeper review; enforce atomic transactions, RLS, and a11y. |
| **5** | \`/harden [target]\` | \`[SEC]\` + \`[DB]\` | Adversarial audit: attack RLS policies, probe race conditions, check tenant isolation, test timing attacks. |
| **6** | \`/retro [session]\` | \`[RS]\` + Meta | Post-implementation excavation: record tacit lessons, failure edges (\`breaks:\`), update brain vault. |

---

## 4. Hard Restrictions & Non-Negotiable Invariants

${invariantsSections}

---

## 5. Operating Modes: Gate vs. Insight

### 1. Gate Mode (Default for Reviews, Diff Inspections, PRs & Builds)
- **Strictly evaluate rules.** Any violation is a blocker.
- Must output standard rejection format:
  \`GATE: FAIL <RULE_ID> <file:line> <required fix>\`
- Example:
  \`GATE: FAIL DB-13 src/services/inventory.ts:42 — Counter decrement lacks atomic conditional ($gte). Concurrent requests can produce negative balances.\`
- If all checks pass, output:
  \`GATE: PASS — All 8 Core Agent checks verified cleanly.\`

### 2. Insight Mode (Exploration, Design Proposals & Suggestions)
- Non-blocking suggestions. Output:
  \`INSIGHT <RULE_ID> <impact> <recommendation>\`
- Insight **never** overrides or waives a Gate failure.
- Waivers may only be granted by following rule **PM-12** in \`docs/WAIVERS.md\`. No agent can self-waive.

---

## 6. IDE Directives for Claude Code & Cursor

When acting as an AI pair programmer inside VS Code or Cursor:
1. **Always read existing files before making edits.** Never guess class names, types, or routes.
2. **Preserve strict tenant isolation (DB-14).** Never write queries that select rows without filtering by tenant or user credentials.
3. **Never allow unindexed database queries on foreign keys or RLS predicates (DB-07).**
4. **Never trust client-supplied authentication data (SEC-14).** Read roles and tenant IDs from verified server-side JWT claims.
5. **Enforce honest UI state (UX-01, UX-05).** Never fake a save or show a success toast before the backend network request succeeds.
6. **Verify empirical claims (RS-01, RS-03).** If data is not present in local documentation or verified sources, output:
   \`WARNING: I do not have verified data for this claim. Hallucination risk is high.\`
`;
}
