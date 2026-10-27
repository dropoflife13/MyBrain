import { buildBrainGraph } from './brainGraph';

export interface BrainDocNode {
  id: string;
  name: string;
  description: string;
  group: 1 | 2; // 1 = The 7 Core Agents (Cyan #00ffff), 2 = Rule & Domain Nodes (Tiny White #ffffff)
  agentCode?: 'PM' | 'UX' | 'GR' | 'SD' | 'IR' | 'DB' | 'SEC';
  category: 'hub' | 'agent' | 'domain' | 'heuristic' | 'identity' | 'synapse';
  content?: string;
  rules?: string[];
  val?: number;
  fx?: number;
  fy?: number;
  fz?: number;
  x?: number;
  y?: number;
  z?: number;
}

export interface BrainDocLink {
  source: string;
  target: string;
}

export interface VaultAuditReport {
  passed: boolean;
  totalRules: number;
  uniqueRuleIds: number;
  duplicateRuleIds: string[];
  prefixOverlaps: string[];
  sourceMode: 'live-filesystem' | 'static-snapshot' | 'blank-template';
}

export interface BrainGraphData {
  nodes: BrainDocNode[];
  links: BrainDocLink[];
  gateStatus?: {
    passed: boolean;
    ruleId: 'BN-00';
    missingAgents: string[];
  };
  vaultAudit?: VaultAuditReport;
}

export const REQUIRED_SEVEN_AGENTS = [
  { id: 'productmanageragent', code: 'PM', file: 'agents/productmanageragent.md', filename: 'productmanageragent.md' },
  { id: 'uiuxagent', code: 'UX', file: 'agents/uiuxagent.md', filename: 'uiuxagent.md' },
  { id: 'growthagent', code: 'GR', file: 'agents/growthagent.md', filename: 'growthagent.md' },
  { id: 'systemsdesignagent', code: 'SD', file: 'agents/systemsdesignagent.md', filename: 'systemsdesignagent.md' },
  { id: 'integrationagent', code: 'IR', file: 'agents/integrationagent.md', filename: 'integrationagent.md' },
  { id: 'dbaagent', code: 'DB', file: 'agents/dbaagent.md', filename: 'dbaagent.md' },
  { id: 'securityagent', code: 'SEC', file: 'agents/securityagent.md', filename: 'securityagent.md' },
] as const;

export function verifySevenAgentsGate(nodes: BrainDocNode[]): {
  passed: boolean;
  ruleId: 'BN-00';
  missingAgents: string[];
} {
  const presentIds = new Set(
    nodes.filter((n) => n.group === 1 || n.category === 'agent').map((n) => n.id)
  );
  const missingAgents = REQUIRED_SEVEN_AGENTS.filter((a) => !presentIds.has(a.id)).map(
    (a) => a.filename
  );
  return {
    passed: missingAgents.length === 0,
    ruleId: 'BN-00',
    missingAgents,
  };
}

const RESERVED_AGENT_PREFIXES = new Set(['PM', 'UX', 'GR', 'SD', 'IR', 'DB', 'SEC']);

/**
 * Deterministic anti-overlap & mechanical consistency check (H-03, H-06, BN-11).
 * Ensures zero duplicate rule IDs and zero prefix collisions between the 7 Agents and Domain files.
 */
export function auditVaultConsistency(
  docNodes: BrainDocNode[],
  sourceMode: VaultAuditReport['sourceMode'] = 'static-snapshot'
): VaultAuditReport {
  const seenIds = new Map<string, string>();
  const duplicateRuleIds: string[] = [];
  const prefixOverlaps: string[] = [];
  let totalRules = 0;

  for (const doc of docNodes) {
    if (!doc.rules) continue;
    for (const r of doc.rules) {
      const [idPart] = r.split(':');
      const ruleId = idPart.trim();
      if (!ruleId || ruleId.startsWith('EMPTY-') || ruleId.startsWith('STATUS-') || ruleId.startsWith('STEP-')) {
        continue;
      }
      totalRules++;
      const prefix = ruleId.split('-')[0];

      if (seenIds.has(ruleId)) {
        duplicateRuleIds.push(`${ruleId} (${seenIds.get(ruleId)} vs ${doc.id})`);
      } else {
        seenIds.set(ruleId, doc.id);
      }

      if (doc.category === 'domain' && RESERVED_AGENT_PREFIXES.has(prefix)) {
        prefixOverlaps.push(`${ruleId} in domain ${doc.id} collides with reserved agent prefix ${prefix}`);
      }
    }
  }

  return {
    passed: duplicateRuleIds.length === 0 && prefixOverlaps.length === 0,
    totalRules,
    uniqueRuleIds: seenIds.size,
    duplicateRuleIds,
    prefixOverlaps,
    sourceMode,
  };
}

const SEVEN_CORE_AGENTS: Record<string, 'PM' | 'UX' | 'GR' | 'SD' | 'IR' | 'DB' | 'SEC'> = {
  productmanageragent: 'PM',
  uiuxagent: 'UX',
  growthagent: 'GR',
  systemsdesignagent: 'SD',
  integrationagent: 'IR',
  dbaagent: 'DB',
  securityagent: 'SEC',
  PM: 'PM',
  UX: 'UX',
  GR: 'GR',
  SD: 'SD',
  IR: 'IR',
  DB: 'DB',
  SEC: 'SEC',
};

/**
 * Extracts `name` (from `# Title`), `description` (from the first `- ` rule line),
 * and assigns `group: 1` to the 7 core agents (PM, UX, GR, SD, IR, DB, SEC) and `group: 2` to all other rule nodes.
 */
export function parseMarkdownNode(
  id: string,
  rawMarkdown: string,
  category: BrainDocNode['category'] = 'domain'
): BrainDocNode {
  const contentWithoutFrontmatter = rawMarkdown.replace(/^---[\s\S]*?---\r?\n?/, '');
  const lines = contentWithoutFrontmatter.split(/\r?\n/);

  let name = id;
  let description = '';
  const rules: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('# ')) {
      name = line.replace(/^#\s+/, '').trim();
      break;
    }
  }

  let firstDashLine = '';
  let firstRuleLine = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('- ')) {
      const withoutDash = line.slice(2).trim();
      const ruleMatch = withoutDash.match(/^\*\*([A-Z]{1,4}-\d+)\*\*:?\s*(.+)$/);
      if (ruleMatch) {
        const cleanRuleText = ruleMatch[2]
          .split('|')[0]
          .replace(/\*\*/g, '')
          .trim();
        const formattedRule = `${ruleMatch[1]}: ${cleanRuleText}`;
        rules.push(formattedRule);
        if (!firstRuleLine) {
          firstRuleLine = formattedRule;
        }
      } else if (!firstDashLine) {
        const cleaned = withoutDash
          .split('|')[0]
          .replace(/^\*\*([^*]+)\*\*:?\s*/, '$1: ')
          .replace(/\*\*/g, '')
          .trim();
        firstDashLine = cleaned;
      }
    }
  }

  description = firstRuleLine || firstDashLine || 'Procedural rule node in the Brainweb vault.';
  if (description.length > 160) {
    description = description.slice(0, 157).trimEnd() + '...';
  }

  const agentCode = SEVEN_CORE_AGENTS[id];
  const isCoreAgent = Boolean(agentCode || category === 'agent');

  return {
    id,
    name,
    description,
    group: isCoreAgent ? 1 : 2,
    agentCode,
    category: isCoreAgent ? 'agent' : category,
    content: contentWithoutFrontmatter.trim(),
    rules,
    val: isCoreAgent ? 3.2 : 1.0,
  };
}

const VAULT_MARKDOWN_SOURCES: Array<{
  id: string;
  category: BrainDocNode['category'];
  anchor: [number, number, number];
  markdown: string;
}> = [
  {
    id: 'dbaagent',
    category: 'agent',
    anchor: [-24, 14, 18],
    markdown: `# [DB] DBA Agent — The Database
- **DB-01** Append-only entities use three layers: REVOKE UPDATE, DELETE, TRUNCATE from all app roles; no UPDATE/DELETE policies; BEFORE UPDATE/DELETE trigger that raises. Corrections are new rows with supersedes_id.
- **DB-02** Derived state is computed only from the source log; no INSERT/UPDATE grant on it; includes only approved, non-flagged rows.
- **DB-03** Refresh stays off the write critical path: the insert trigger is statement-level and only marks dirty or enqueues.
- **DB-04** Integrity: FK with ON DELETE RESTRICT, NOT NULL, CHECK; validity enforced in the DB, not only in app code.
- **DB-05** Ingestion RPC: SECURITY INVOKER; server stamps received_at = now() and bounds client observed_at within skew tolerance.
- **DB-06** RLS: enabled on every exposed table (default deny); roles read from JWT app_metadata, never user_metadata.
- **DB-07** Indexing: every FK, RLS-predicate column, and hot WHERE/ORDER is indexed with EXPLAIN (ANALYZE, BUFFERS) evidence.
- **DB-08** Read scaling order: index → query rewrite → cache → materialized/read model → read replica.
- **DB-09** Write scaling order: batch → async via outbox/queue → native partitioning → sharding only with approved ADR.
- **DB-10** Migrations: versioned, forward-only, expand-contract for destructive changes.`,
  },
  {
    id: 'securityagent',
    category: 'agent',
    anchor: [24, 14, 18],
    markdown: `# [SEC] Security Agent — The Gatekeeper
- **SEC-01** STRIDE Threat Model covers each trust boundary: browser + IndexedDB, RPC/API, realtime, webhooks, admin.
- **SEC-02** RLS bypass suite: attempt as anon and cross-role/cross-tenant via REST, RPC, views, and SECURITY DEFINER paths.
- **SEC-03** service_role and signing keys never appear in client bundles or NEXT_PUBLIC_*; secret scanning in CI.
- **SEC-04** Offline queue: IndexedDB is untrusted and tamperable, so the server re-validates everything on sync.
- **SEC-05** Ingestion trust: anomaly detection quarantines statistical outliers; approver != submitter; append-only audit log.
- **SEC-06** Auth SPOF: >= 2 admins, MFA for privileged roles, server-minted claims only, working session revocation.
- **SEC-07** Webhook authenticity: HMAC-SHA256 over raw body + timestamp, constant-time compare, <= 5-min replay window.
- **SEC-08** Web hardening: strict CSP, HSTS, frame-ancestors 'none', nosniff, Referrer-Policy, CSRF protection.
- **SEC-09** Abuse control: rate limits per IP/user/device and schema validation at every boundary.`,
  },
  {
    id: 'uiuxagent',
    category: 'agent',
    anchor: [-22, 8, 44],
    markdown: `# [UX] UI/UX Agent — The Frontend
- **UX-01** Dark mode: theme class set by a synchronous inline pre-paint script (zero FOUC); colors only via semantic tokens; WCAG AA contrast >= 4.5:1.
- **UX-02** Mobile menu: aria-expanded + aria-controls, focus trap while open, Esc closes, tap targets >= 44x44 px.
- **UX-03** Sticky header: fixed height token, zero layout shift, scroll-margin-top on anchors.
- **UX-04** Hover states: gated by @media (hover: hover), solid-color surface darkening, never sole carrier of information.
- **UX-05** Loading: skeleton matching final layout dimensions (zero CLS), honors prefers-reduced-motion.
- **UX-07** Confirmation modals only for destructive actions; buttons name the exact verb + object ("Discard 3 entries"), never "OK".
- **UX-08** Toasts: role="status" / role="alert", pause on hover, never fake optimistic saves before server confirmation.
- **UX-12** Sync surfaces: persistent connectivity indicator with pending/synced/flagged/rejected state badges.
- **UX-13** Performance & motion discipline: auto-downgrade heavy WebGL when FPS < 30 or prefers-reduced-motion is active.`,
  },
  {
    id: 'productmanageragent',
    category: 'agent',
    anchor: [22, 8, 44],
    markdown: `# [PM] Product Manager Agent — The Planner
- **PM-01** One concern per spec doc with version, status (draft|approved), and owner in frontmatter.
- **PM-02** Docs state current truth only; history lives in git, never in the document body.
- **PM-03** PRD defines problem, roles, As-Is/To-Be, Given/When/Then criteria, baseline metrics, and explicit non-goals.
- **PM-04** Every business rule has ID BRnn, one enforcement layer, one owning agent, and one verification test.
- **PM-09** Implementation plan: phased vertical slices, riskiest invariant first, Gate PASS required from every touched agent.
- **PM-10** Scope change amends PRD first; unapproved mid-sprint features park in LATER.md.
- **PM-11** Defense QA maps each likely panel attack to rule ID and concrete test/query evidence.`,
  },
  {
    id: 'systemsdesignagent',
    category: 'agent',
    anchor: [-28, 12, -22],
    markdown: `# [SD] Systems Design Agent — The Architect
- **SD-01** CAP/PACELC declared per workflow in an ADR: offline logging is AP; approval transitions are CP.
- **SD-02** Every data class defines its consistency model and max staleness window in seconds.
- **SD-03** SLOs define availability %, p95/p99 latency per operation, peak throughput, and RPO/RTO with capacity math.
- **SD-05** No scaling mechanism (cache, replica, queue, partition, shard) without a measured bottleneck in an ADR.
- **SD-06** Scaling order: vertical first; horizontal only for stateless tiers; sharding requires an approved ADR.
- **SD-09** Fault tolerance: writes never depend on reads, caches, or derived views.`,
  },
  {
    id: 'integrationagent',
    category: 'agent',
    anchor: [28, 12, -22],
    markdown: `# [IR] Integration Agent — The Reliability Engineer
- **IR-01** Webhooks: versioned envelope {id, type, version, created_at, data}, at-least-once queue delivery, consumer dedupe on id.
- **IR-02** Real-time transport: SSE default for one-way server->client; jittered reconnect and Last-Event-ID cursor resume.
- **IR-03** Idempotency: every client-originated mutation carries a client UUID/ULID persisted before any network call.
- **IR-04** Outbox state machine: pending -> inflight -> synced | rejected | flagged; removed only after server ack.
- **IR-05** Retries: exponential backoff with full jitter on network/5xx/429; 4xx is terminal.
- **IR-07** Long-running jobs exceeding request budget (>500 rows or >2s) offload to async queue + worker pool.`,
  },
  {
    id: 'growthagent',
    category: 'agent',
    anchor: [0, -16, -42],
    markdown: `# [GR] Growth Agent — The Marketing
- **GR-01** Newsletter & onboarding: double opt-in, explicit consent record, PH Data Privacy Act (RA 10173) compliance.
- **GR-02** UTM links: built only by a single helper, lowercase kebab-case registered in UTM_REGISTRY.md, zero PII.
- **GR-04** Cmd+K search: 150ms debounce, indexes public published content only, never drafts or authenticated PII.
- **GR-05** SEO baseline: unique title/description per route, canonical URLs, JSON-LD structured data, noindex on auth routes.
- **GR-07** Public claims: every metric traces to a measured baseline; zero unverifiable superlatives.`,
  },
  {
    id: 'cybersec',
    category: 'domain',
    anchor: [18, 22, 6],
    markdown: `# Cybersecurity Specialist — How I Think
- **CS-01** WHEN configuring API keys or database clients in a web app → DO keep service_role and signing keys strictly server-side and hard-block any PR exposing secrets in NEXT_PUBLIC_* | conf: 5
- **CS-02** WHEN a high-impact state transition occurs → DO enforce submitter != approver server-side and restrict approval to the counter-party role | conf: 4
- **CS-03** WHEN storing audit-critical records → DO enforce 3-layer append-only immutability (REVOKE UPDATE/DELETE, no mutation RLS, exception trigger) with supersedes_id | conf: 4
- **CS-04** WHEN exposing any database table or view → DO enable default-deny RLS and derive roles strictly from server-minted claims | conf: 4
- **CS-05** WHEN ingesting client or offline batches → DO stamp server received_at = now(), bound client observed_at skew, and quarantine statistical outliers | conf: 4
- **CS-06** WHEN shipping any schema migration or RLS policy change → DO execute the 5-Role Matrix Test plus cross-tenant isolation verification | conf: 4
- **CS-07** WHEN enforcing pre-flight architectural gates (BN-00) at API and UI boundaries → DO fail closed (HTTP 422 / empty nodes) and return only sanitized relative filenames without leaking host OS paths | conf: 5`,
  },
  {
    id: 'solutions',
    category: 'domain',
    anchor: [-18, 22, 6],
    markdown: `# Solutions Specialist — How I Think
- **SO-01** WHEN tracking current operational balances (stock, prices, OJT hours) → DO compute current state exclusively from verified append-only batch/event logs, never by overwriting a mutable total | conf: 5
- **SO-02** WHEN modeling multi-actor lifecycles → DO enforce a strict finite state machine (requested -> accepted | declined) via DB CHECK or Zod schemas | conf: 4
- **SO-03** WHEN read traffic surges → DO follow the relational scaling ladder: Index (EXPLAIN ANALYZE) -> Query rewrite -> CDN cache -> Materialized view -> Read replica | conf: 4
- **SO-04** WHEN delivering interactive 3D or video surfaces on constrained networks → DO use procedural math (<50KB) over heavy GLTF files and preload short videos in collapsed CSS Grid rows (0fr -> 1fr) | conf: 4
- **SO-05** WHEN processing batch uploads or offline queues → DO enforce UNIQUE idempotency keys (ON CONFLICT DO NOTHING) and per-row error isolation | conf: 4
- **SO-06** WHEN designing bulk CSV imports → DO validate <=500 rows / <2s synchronously with a pre-commit preview, offloading >500 rows to async queues | conf: 4
- **SO-07** WHEN architecting a coupled AI governance + knowledge system (brain/ + agents/) → DO enforce pre-flight gate BN-00 at API and UI boot and distribute public starter templates in blank-slate empty state (0 personal rules) | conf: 5
- **SO-08** WHEN synchronizing markdown knowledge bases with interactive visualizers → DO parse live .md files on disk to populate both parent and child synaptic nodes with zero static drift | conf: 5`,
  },
  {
    id: 'business-analysis',
    category: 'domain',
    anchor: [16, 18, 30],
    markdown: `# Business Analyst — How I Think
- **BA-01** WHEN kicking off any multi-user product or team build → DO publish an explicit Role & Ownership Matrix defining what each actor Owns and Must Not Independently Change | conf: 5
- **BA-02** WHEN a stakeholder requests unapproved scope mid-sprint → DO halt coding on that item, park it in LATER.md, and protect the 3-minute MVP path | conf: 5
- **BA-03** WHEN preparing for a capstone defense or pitch → DO assign stable rule IDs (BR-nn, DB-nn) and build the safeguard for the panel's #1 attack directly into the MVP | conf: 5
- **BA-04** WHEN digitizing institutional workflows → DO model the real authority chain and exception states (MOA expiry, CSV cohort upload) rather than generic B2C assumptions | conf: 4
- **BA-05** WHEN specs or stakeholder requirements conflict → DO log the exact conflict in Unresolved Decisions and ask the owner rather than silently guessing | conf: 4
- **BA-06** WHEN structuring institutional SaaS GTM → DO onboard with a free 1-cycle pilot that builds a compounding audit-history moat before converting to Founding-Partner pricing | conf: 5
- **BA-07** WHEN shipping a technical governance system to a mixed audience → DO pair a progressive 5-step Beginner Initiation Guide (/start) with power-user /console and /agents views | conf: 5`,
  },
  {
    id: 'ui-frontend',
    category: 'domain',
    anchor: [-16, 18, 30],
    markdown: `# UI & Frontend Specialist — How I Think
- **UI-01** WHEN building shared UI components (src/components/ui/) → DO keep them 100% dumb and prop-driven on top of shadcn/ui with zero DB or network fetches inside | conf: 5
- **UI-02** WHEN implementing theming and typography → DO inject a synchronous inline <head> script to kill FOUC, use semantic tokens, and enforce WCAG AA (#A5C7FF on dark, never #2563EB) | conf: 5
- **UI-03** WHEN wiring forms and async views → DO render layout-matching skeletons (zero CLS) and never fire optimistic fake saves before server confirmation | conf: 5
- **UI-04** WHEN designing interactive states and dialogs → DO use solid-color hover darkening (no scale-110 bounce or neon glow) and explicit verb+object destructive buttons | conf: 5
- **UI-05** WHEN engineering 3D WebGL or video showcases → DO enforce the 10s hook cut (#t=0,10) and auto-downgrade WebGL when FPS < 30 or prefers-reduced-motion is active | conf: 4
- **UI-06** WHEN designing multi-role responsive layouts → DO prioritize 375px mobile-first for field roles and 1440px calm data tables for batch operators | conf: 5
- **UI-07** WHEN animating an interactive Three.js / WebGL scene with OrbitControls → DO delegate continuous 360-degree rotation exclusively to controls.autoRotate = true and never call camera.position.lerp() while autoRotate is active | conf: 5
- **UI-08** WHEN transitioning between landing and heavy console routes → DO execute router.push() immediately and mount a single destination-owned NeuralLoader gated by isReady = isGraphReady && minTimerDone | conf: 5
- **UI-09** WHEN building a 3-group command bar and dual-theme 3D workspace → DO enforce grid-cols-[1fr_auto_1fr] with h-10 heights and pair dark obsidian (#050505) with Blueprint Light Mode (#f0f4f8 / #1e3a8a) | conf: 5`,
  },
  {
    id: 'OPERATING-PRINCIPLES',
    category: 'identity',
    anchor: [-14, 24, -12],
    markdown: `# Operating Principles — Tier 0 Governance
- **OP-01** I lock down role boundaries, module ownership, and who is forbidden from doing what before touching UI or code.
- **OP-02** I design every schema column, state transition, and business rule so I can defend its exact invariant under panel or audit interrogation.
- **OP-03** I connect technical architecture directly to real operational ground truth and a believable adoption model.
- **OP-04** Client inputs, browser storage (IndexedDB), role claims from the client, and mobile device clocks are untrusted until verified server-side.
- **OP-05** On shared codebases or team sprints, strict module sandboxing, data contracts, and branch gates are mandatory.
- **OP-06** Current state (stock, prices, OJT hours) is a derived view of immutable historical events, never a single mutable number overwritten in-place.
- **OP-07** Never expose service_role or signing secrets in NEXT_PUBLIC_* or client bundles, even for a two-hour demo emergency.
- **OP-08** Never allow self-approval (submitter = approver) or silent auto-approval on trust-critical workflow transitions.
- **OP-09** Never fake a successful save, fabricate audit/trust records, or hide security behind a hidden UI button.
- **OP-10** A feature is done only when its spec exists, server/DB permissions enforce its boundaries, states are honest, WCAG AA holds without FOUC, and the build passes cleanly.
- **OP-11** I refuse to silently expand MVP scope mid-sprint without an approved spec; unapproved ideas go to LATER.md.
- **OP-12** I explore candidate rules across real project contexts first and only promote them once I know the exact breaks: boundary condition.
- **OP-13** AI provides the necessary help to optimize my workflow, point out my inconsistencies, and fix what is needed, but must never overlap on or override my human judgment and data.
- **OP-14** Use deterministic math and statistical baselines first (z-score/MAD, regex, Zod) before reaching for an LLM API.
- **OP-15** After shipping any major build milestone, I run a post-build excavation session to feed lessons learned back into the vault and verify zero mechanical or ownership overlaps.`,
  },
  {
    id: 'TASTE',
    category: 'identity',
    anchor: [14, 24, -12],
    markdown: `# Taste — What I Call Good Work
- **TA-01** Calm, high-trust data density with Linear-level clarity and Stripe-level consistency: solid surface hierarchy and restrained hover darkening.
- **TA-02** Studio-grade spatial and video experiences engineered for zero jank: procedural Three.js geometry and DOM-persistent preloaded media.
- **TA-03** Strict typographic rhythm: defined scale (32/24/18/15/12px) with JetBrains Mono for IDs, timers, and numeric telemetry.
- **TA-04** Flash-free dual theming: synchronous inline <head> script sets dark/light state before first paint with WCAG AA contrast.
- **TA-05** Reject generic AI dashboard slop: purple/neon gradients, bouncy scale-105 hover, and oversized decorative cards.
- **TA-06** Reject broken contrast and color-only states: raw #2563EB blue text on dark backgrounds or status pills without labels.
- **TA-07** Reject arbitrary font sizes, all-caps sentences, misaligned table numerics, and layout shift (CLS).
- **TA-08** Reject dead controls, decorative filters, fake sorting, or optimistic fake saves.
- **TA-09** Composable, dumb prop-driven UI primitives (shadcn/ui foundation) cleanly separated from data-fetching containers.
- **TA-10** Specs use numbered sections, explicit role-ownership tables, Mermaid diagrams, and stable rule IDs (DB-01, UX-01).
- **TA-11** Admire Linear & Stripe interfaces for calm density, keyboard-first ergonomics, and disciplined token hierarchy.
- **TA-12** Admire Premiere Pro / studio telemetry HUDs and tactical game UIs for frame-accurate feedback and corner reticles.
- **TA-13** Video-editor pacing and storyboarding: enforce the 10-second hook rule and structure flows as Problem -> Friction -> 'Aha' Action -> Verified Outcome.
- **TA-14** Dual-mode spatial HUD precision: pair Obsidian Sci-Fi Dark Mode (#050505 / #00FFFF, 6px HUD scrollbar) with Architectural Blueprint Light Mode (#f0f4f8 / #1e3a8a) and strict grid-cols-[1fr_auto_1fr] alignment.`,
  },
  {
    id: 'HEURISTICS',
    category: 'heuristic',
    anchor: [-20, -4, -30],
    markdown: `# Heuristics — Cross-Domain Judgment
- **H-01** WHEN integrating AI or automated analytics → DO run deterministic math and statistical baselines first (z-score/MAD, regex, Zod) and keep AI strictly as an assistive copilot.
- **H-02** WHEN a teammate's backend endpoint breaks right before a live defense and they are unreachable → DO isolate a minimal fix on your own branch and disclose it in the handoff log, never faking the save in UI.
- **H-03** WHEN dividing responsibility across agents or docs → DO give every rule a single canonical owner and cite its stable ID (DB-01, SEC-05) instead of duplicating text.
- **H-04** WHEN designing a reviewing agent → DO separate blocking Gate Mode (hard invariants) from non-blocking Insight Mode (advisory optimizations).
- **H-05** WHEN hitting the same build or runtime error twice in a row → DO stop immediately, state what was tried and the likely root cause in plain English, and align before a third attempt.
- **H-06** WHEN evolving a live markdown knowledge vault alongside a TypeScript app → DO derive runtime graph state directly from live .md files, sync the fallback snapshot, and run check-vault to guarantee zero overlap or drift.`,
  },
  {
    id: 'PATTERNS',
    category: 'heuristic',
    anchor: [20, -4, -30],
    markdown: `# Patterns — Recurring Situations
- **P-01** SITUATION A two-party approval rule (submitter != approver) blocks a Day-1 solo pilot org (active_staff_count == 1) → PLAY Permit self-approval stamped with approval_mode: solo_operator_waiver until a 2nd staff seat joins.
- **P-02** SITUATION High-craft 3D WebGL or hover video loaded on constrained mobile hardware → PLAY Use procedural math (<50KB), DOM-persistent video rows (0fr -> 1fr), and auto-downgrade WebGL when FPS < 30.
- **P-03** SITUATION Pitching an MVP to judges or busy institutional users → PLAY Storyboard as Problem -> Friction -> 'Aha' Action -> Verified Outcome, cut media at <=10s, and pre-empt the #1 panel objection.
- **P-04** SITUATION Multi-project developer using AI across repos → PLAY Keep Brainweb in one central repo and attach via VS Code Multi-Root Workspace (.code-workspace) + CLAUDE.md bridge.
- **P-05** SITUATION Other developers want to fork your personal AI Brain Vault → PLAY Ship the 3D engine and all 7 Agent Gatekeepers intact (BN-00), but reset personal rules to blank-slate empty (0 rules) so adopters earn their own nodes via THE-TEST.md.`,
  },
  {
    id: 'RED-FLAGS',
    category: 'heuristic',
    anchor: [12, -10, 26],
    markdown: `# Red Flags — Visceral Blockers
- **RF-01** SIGNAL NEXT_PUBLIC_* containing SERVICE_ROLE or secret keys inside client code → MEANS Complete RLS bypass in browser bundle → DEFAULT Hard-block PR (GATE: FAIL CS-01) and rotate secret.
- **RF-02** SIGNAL Shared UI component inside src/components/ui/ importing createClient or fetch → MEANS Presentation coupled to backend → DEFAULT Strip to dumb props (UI-01).
- **RF-03** SIGNAL UPDATE or DELETE called directly on audit logs, stock balances, or attendance histories → MEANS Historical lineage overwritten → DEFAULT Enforce append-only with supersedes_id (CS-03, SO-01).
- **RF-04** SIGNAL Approval action lacks submitter_id !== current_user_id check or uses ad-hoc status strings → MEANS Self-approval fraud and broken state machine → DEFAULT Enforce counter-party check (CS-02) and canonical finite state machine (SO-02).
- **RF-05** SIGNAL alert("Saved!") or success toast fired before await completes → MEANS UI is lying about persistence → DEFAULT Await server confirmation and report missing backends plainly (UI-03).
- **RF-06** SIGNAL Theme state initialized inside React useEffect → MEANS White flash (FOUC) on dark-mode reload → DEFAULT Move theme class initialization to synchronous inline <head> script (UI-02).
- **RF-07** SIGNAL Neon purple-pink gradients, scale-110 bounce, or scattered raw hex codes → MEANS Generic AI dashboard slop → DEFAULT Replace with semantic tokens and solid-color hover darkening (UI-04).
- **RF-08** SIGNAL Raw #2563EB blue text on dark #0B1220 background or destructive button labeled "OK" → MEANS WCAG AA contrast failure and accidental destructive clicks → DEFAULT Use #A5C7FF on dark and explicit verb+object AlertDialog (UI-02, UI-04).
- **RF-09** SIGNAL camera.position.lerp() running inside requestAnimationFrame while OrbitControls.autoRotate = true is active → MEANS Competing camera writers causing spherical snap-back jitter → DEFAULT Let OrbitControls.autoRotate own continuous rotation (UI-07).
- **RF-10** SIGNAL A setTimeout loader on a landing page before router.push('/console') followed by a second loader on destination → MEANS Jarring double-loader UX and blank void → DEFAULT Navigate immediately and bind loader + canvas to a single isReady boolean (UI-08).`,
  },
  {
    id: 'DIGEST',
    category: 'identity',
    anchor: [-12, -10, 26],
    markdown: `# Digest — Tier 0 Executive Summary
- **Role & Ownership First:** Lock down who submits, who reviews, who approves, and module ownership before writing UI or code (OP-01, BA-01).
- **Derived Truth Over Mutable Counters:** Current balances (stock, prices, OJT hours) must be derived from append-only event logs (OP-06, SO-01, CS-03).
- **Deterministic Math Before AI:** Run statistical/schema baselines (z-score/MAD, regex, Zod) first; keep AI as a non-overlapping copilot (OP-13, OP-14, H-01).
- **Usability Beats Spectacle:** Use procedural 3D math (<50KB) and DOM-persistent video rows; auto-downgrade WebGL when FPS < 30 (SO-04, UI-05, P-02).`,
  },
  {
    id: 'ABOUT-ME',
    category: 'identity',
    anchor: [0, 20, -28],
    markdown: `# About Me — Practitioner Profile (Neil Mar)
- **Role:** BSIT Senior & Full-Stack Systems Builder, Project Manager, and UI/UX Lead across institutional SaaS, offline-first marketplaces, and WebGL studios.
- **Projects:** MerkadoTrack (A-01), Dugtong OJT (A-02), CITEMAS Portal (A-03), Synaptic Constellation 3D Brain (A-04), FlexSpace Iloilo & Agrivet Inventory (A-05).`,
  },
];

const BLANK_VAULT_MARKDOWN_SOURCES: Array<{
  id: string;
  category: BrainDocNode['category'];
  anchor: [number, number, number];
  markdown: string;
}> = [
  ...VAULT_MARKDOWN_SOURCES.filter((s) => s.category === 'agent'),
  {
    id: 'ABOUT-ME',
    category: 'identity',
    anchor: [0, 20, -28],
    markdown: `# About Me — Practitioner Intake (status: empty)
- **STATUS-00** Vault is unassessed (0 personal rules). Fill out 01-identity/ABOUT-ME.md or run Launcher L-09 (AI Interview) before taking THE-TEST.md.
- **STEP-01** Complete §1 Snapshot, §2 Domains & Years, §3 Shipped Systems, and §4 Failure Modes to calibrate your diagnostic quiz.`,
  },
  {
    id: 'OPERATING-PRINCIPLES',
    category: 'identity',
    anchor: [-14, 24, -12],
    markdown: `# Operating Principles — Tier 0 Governance (status: empty)
- **EMPTY-OP** _None yet._ Run Launcher L-01 (05-elicitation/THE-TEST.md) to excavate your non-negotiable engineering principles.`,
  },
  {
    id: 'TASTE',
    category: 'identity',
    anchor: [14, 24, -12],
    markdown: `# Taste — What I Call Good Work (status: empty)
- **EMPTY-TA** _None yet._ Take the Visceral Cringe Test in 05-elicitation/THE-TEST.md to define what you respect vs. what you reject as slop.`,
  },
  {
    id: 'cybersec',
    category: 'domain',
    anchor: [18, 22, 6],
    markdown: `# Cybersecurity Specialist — How I Think (status: draft • 0 Rules)
- **EMPTY-CS** _None yet (0 active rules)._ Rate your Self-Map (0–3) and complete the Cybersecurity scenarios in 05-elicitation/THE-TEST.md to earn CS-nn rules.`,
  },
  {
    id: 'solutions',
    category: 'domain',
    anchor: [-18, 22, 6],
    markdown: `# Solutions Specialist — How I Think (status: draft • 0 Rules)
- **EMPTY-SO** _None yet (0 active rules)._ Rate your Self-Map (0–3) and complete the Architecture Trade-Off Triads in 05-elicitation/THE-TEST.md to earn SO-nn rules.`,
  },
  {
    id: 'business-analysis',
    category: 'domain',
    anchor: [16, 18, 30],
    markdown: `# Business Analyst — How I Think (status: draft • 0 Rules)
- **EMPTY-BA** _None yet (0 active rules)._ Rate your Self-Map (0–3) and complete the Scope & Stakeholder scenarios in 05-elicitation/THE-TEST.md to earn BA-nn rules.`,
  },
  {
    id: 'ui-frontend',
    category: 'domain',
    anchor: [-16, 18, 30],
    markdown: `# UI & Frontend Specialist — How I Think (status: draft • 0 Rules)
- **EMPTY-UI** _None yet (0 active rules)._ Rate your Self-Map (0–3) and run the Visceral Cringe Test in 05-elicitation/THE-TEST.md to earn UI-nn rules.`,
  },
  {
    id: 'HEURISTICS',
    category: 'heuristic',
    anchor: [-20, -4, -30],
    markdown: `# Heuristics — Cross-Domain Judgment (status: empty • 0 Rules)
- **EMPTY-H** _None yet._ Promote validated cross-domain rules from 06-raw/inbox.md using Launcher L-06 once conf >= 3.`,
  },
  {
    id: 'RED-FLAGS',
    category: 'heuristic',
    anchor: [12, -10, 26],
    markdown: `# Red Flags — Visceral Blockers (status: empty • 0 Rules)
- **EMPTY-RF** _None yet._ Document the signals in a PR, schema, or UI that make you immediately halt approval.`,
  },
];

export function getBrainData(options?: {
  nodeCount?: number;
  mode?: 'assessed' | 'blank';
  liveOverrides?: Map<string, BrainDocNode>;
}): BrainGraphData {
  const mode = options?.mode ?? 'assessed';

  if (mode === 'blank') {
    const blankDocs: BrainDocNode[] = BLANK_VAULT_MARKDOWN_SOURCES.map((src) => {
      const parsed = parseMarkdownNode(src.id, src.markdown, src.category);
      return {
        ...parsed,
        fx: src.anchor[0],
        fy: src.anchor[1],
        fz: src.anchor[2],
      };
    });

    const nodes: BrainDocNode[] = [
      {
        id: 'hub',
        name: 'Unassessed Cortex Seed',
        description: 'Blank-slate vault (0 personal rules). Run Launcher L-01 to assess yourself.',
        group: 2,
        category: 'hub',
        val: 2.0,
        fx: 0,
        fy: 0,
        fz: 0,
      },
      ...blankDocs,
    ];

    const links: BrainDocLink[] = [];
    const coreAgents = blankDocs.filter((d) => d.group === 1);
    const emptyFiles = blankDocs.filter((d) => d.group === 2);

    // Connect the 7 Core Agent Gatekeepers in their perimeter ring + to central seed
    for (let i = 0; i < coreAgents.length; i++) {
      links.push({ source: 'hub', target: coreAgents[i].id });
      links.push({
        source: coreAgents[i].id,
        target: coreAgents[(i + 1) % coreAgents.length].id,
      });
    }

    // Connect each empty domain/identity slot to the central seed and nearest agent gate
    emptyFiles.forEach((doc, idx) => {
      links.push({ source: 'hub', target: doc.id });
      if (coreAgents.length > 0) {
        links.push({
          source: coreAgents[idx % coreAgents.length].id,
          target: doc.id,
        });
      }
    });

    return {
      nodes,
      links,
      vaultAudit: auditVaultConsistency(blankDocs, 'blank-template'),
    };
  }

  const totalConstellationNodes = options?.nodeCount ?? 360;
  const procedural = buildBrainGraph({
    nodeCount: totalConstellationNodes,
    k: 3,
    maxLinkLen: 22,
    seed: 7,
  });

  const liveOverrides = options?.liveOverrides;
  const docNodes: BrainDocNode[] = VAULT_MARKDOWN_SOURCES.map((src) => {
    const live = liveOverrides?.get(src.id);
    const parsed = live ?? parseMarkdownNode(src.id, src.markdown, src.category);
    return {
      ...parsed,
      fx: src.anchor[0],
      fy: src.anchor[1],
      fz: src.anchor[2],
    };
  });

  const allRulesCatalog: Array<{
    ruleId: string;
    parentName: string;
    description: string;
    parentContent: string;
  }> = [];

  for (const doc of docNodes) {
    if (doc.rules && doc.rules.length > 0) {
      for (const r of doc.rules) {
        const [prefixPart] = r.split(':');
        allRulesCatalog.push({
          ruleId: prefixPart.trim(),
          parentName: doc.name,
          description: r,
          parentContent: doc.content || r,
        });
      }
    }
  }

  const nodes: BrainDocNode[] = [];
  const links: BrainDocLink[] = [];

  // Central Hub node (`id: 'hub'`, `group: 2`)
  nodes.push({
    id: 'hub',
    name: 'Cortex Master Hub',
    description: 'Central procedural judgment engine & 7-Agent execution gatekeeper.',
    group: 2,
    category: 'hub',
    val: 2.0,
    fx: 0,
    fy: 0,
    fz: 0,
  });

  // Map procedural 3D coordinates to the 7 core agents (`group: 1`) and rule nodes (`group: 2`)
  procedural.nodes.forEach((pNode, index) => {
    if (index < docNodes.length) {
      const doc = docNodes[index];
      nodes.push({
        ...doc,
        fx: doc.fx ?? pNode.ax,
        fy: doc.fy ?? pNode.ay,
        fz: doc.fz ?? pNode.az,
      });
      links.push({
        source: 'hub',
        target: doc.id,
      });
    } else {
      const ruleEntry = allRulesCatalog[index % allRulesCatalog.length];
      const nodeId = `${ruleEntry.ruleId}::${pNode.id}`;
      nodes.push({
        id: nodeId,
        name: `${ruleEntry.ruleId} — ${ruleEntry.parentName.replace(/^\[[A-Z]+\]\s*/, '').split('—')[0].trim()}`,
        description: ruleEntry.description,
        group: 2,
        category: 'synapse',
        content: ruleEntry.parentContent,
        val: 1.0,
        fx: pNode.ax,
        fy: pNode.ay,
        fz: pNode.az,
      });
    }
  });

  // Inter-connect the 7 core agents (`group: 1`) in a subtle cortical ring
  const coreAgentIds = docNodes.filter((d) => d.group === 1).map((d) => d.id);
  for (let i = 0; i < coreAgentIds.length; i++) {
    links.push({
      source: coreAgentIds[i],
      target: coreAgentIds[(i + 1) % coreAgentIds.length],
    });
  }

  const idByProceduralIndex = new Map<number, string>();
  procedural.nodes.forEach((pNode, idx) => {
    const mappedNode = nodes[idx + 1];
    if (mappedNode) {
      idByProceduralIndex.set(pNode.id, mappedNode.id);
    }
  });

  procedural.links.forEach((pLink) => {
    const srcNum = typeof pLink.source === 'object' ? pLink.source.id : pLink.source;
    const tgtNum = typeof pLink.target === 'object' ? pLink.target.id : pLink.target;
    const sourceId = idByProceduralIndex.get(srcNum);
    const targetId = idByProceduralIndex.get(tgtNum);
    if (sourceId && targetId) {
      links.push({
        source: sourceId,
        target: targetId,
      });
    }
  });

  return {
    nodes,
    links,
    vaultAudit: auditVaultConsistency(
      docNodes,
      liveOverrides && liveOverrides.size > 0 ? 'live-filesystem' : 'static-snapshot'
    ),
  };
}

export default getBrainData;
