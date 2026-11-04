# CORTEX: SYSTEM ARCHITECTURE & CODEBASE MANUSCRIPT
**The Procedural Judgment Engine, Deterministic Multi-Agent SDLC, and 3D Synaptic Knowledge Vault**

---

## 1. Executive Summary & Core Philosophy

> *"I engineer software that feels finished."*

**CORTEX** is an autonomous, self-reflective software engineering operating system and procedural knowledge vault. Unlike conventional generative AI systems that guess implementation details with stochastic randomness, Cortex operates on a **Deterministic-First, LLM-Fallback** architecture:

1. **The Architect (Human)**: Sets rules, constraints, and taste criteria. This is the ultimate source of truth.
2. **The Vault (`brain/`)**: A versioned Markdown repository of atomic rules, heuristics, and mental models. It stores *how* decisions are made, not just static documentation.
3. **The 8 Core Agents (`agents/`)**: Eight specialist reviewers that audit specifications, schemas, interfaces, and code against the Vault. They act as compiler passes that approve or reject work (`GATE: PASS / FAIL`).
4. **The Model (The CPU)**: Interchangeable compute (Gemini, NVIDIA, Anthropic) strictly subservient to the Constitution and never overriding the agents.

---

## 2. Layers & System Topography

| Layer | Location | Core Responsibility |
|---|---|---|
| **Procedural Judgment** | `brain/` | Canonical rules, heuristics, mental models, and taste criteria. |
| **Execution** | `agents/` | Invariant compiler passes, gate checks (`PASS / FAIL`), and Arbiter conflict resolution. |
| **Compute** | `lib/`, `app/api/` | Tiered routing, deterministic validation pipeline, and isolated sandbox execution. |
| **Presentation** | `app/`, `components/` | Telemetry HUD console, 3D synaptic constellation, self-assessments, and Space Station HQ. |

---

## 2. Complete Directory & Foldering Hierarchy (Exhaustive)

```
c:\Users\neil\brain-web\
├── .env.local                                # Environment variables & API keys (GEMINI_API_KEY, NVIDIA_API_KEY)
├── .gitignore                                # Git ignore rules
├── AGENTS.md                                 # Next.js 16 agent rules and build-time metadata
├── CLAUDE.md                                 # System execution manual, BN-00 invariant, Golden Path workflows
├── brain-embeddings.json                     # Vector embeddings cache for memory-resident rule lookup
├── eslint.config.mjs                         # ESLint configuration
├── next-env.d.ts                             # Next.js TypeScript declarations
├── next.config.ts                            # Next.js 16 configuration (Webpack/Turbopack, headers, transpilePackages)
├── package.json                              # Project dependencies, scripts (dev, build, lint, check:vault)
├── package-lock.json                         # Locked dependency versions
├── postcss.config.mjs                        # PostCSS configuration for Tailwind CSS
├── README.md                                 # Project overview and quickstart guide
├── tsconfig.json                             # TypeScript compiler settings, path aliases (@/*)
├── tsconfig.tsbuildinfo                      # Incremental TypeScript compilation cache
├── vercel.json                               # Vercel deployment configuration
│
├── agents/                                   # EXECUTION LAYER (The Constitution - 8 Core Agents)
│   ├── README.md                             # Agent suite manifesto, BN-00 rule, gate protocols
│   ├── productmanageragent.md                # [PM] Scope, PRD, acceptance criteria, edge cases
│   ├── uiuxagent.md                          # [UX] Interaction tokens, cognitive friction, a11y, states
│   ├── growthagent.md                        # [GR] Value synthesis, executive pitch, activation loops
│   ├── systemsdesignagent.md                 # [SD] Latency budgets, failure domains, TRD, boundaries
│   ├── integrationagent.md                   # [IR] Third-party APIs, webhooks, idempotency, retry queues
│   ├── dbaagent.md                           # [DB] Schemas, append-only logs, RLS policies, indexing
│   ├── securityagent.md                      # [SEC] Threat modeling, STRIDE, RLS bypass suites, AuthZ
│   └── researchagent.md                      # [RS] Epistemic rigor, fact triangulation, citation gates
│
├── brain/                                    # PROCEDURAL JUDGMENT LAYER (The Vault)
│   ├── 00-INDEX.md                           # Vault index, loading tiers (0-3), domain mapping, BN-00 rule
│   │
│   ├── 01-identity/                          # Core Identity & Guiding Taste
│   │   ├── ABOUT-ME.md                       # Practitioner bio, engineering philosophy
│   │   ├── OPERATING-PRINCIPLES.md           # OP-01..15: Core software invariants (Tier 0)
│   │   └── TASTE.md                          # TA-01..14: Visual & interactive quality criteria
│   │
│   ├── 02-domains/                           # 29 Specialized Knowledge Domains
│   │   ├── _TEMPLATE.md                      # Standardized template for new domain files
│   │   ├── arbiter.md                        # ARB-01..06: Judgment Arbiter, conflict resolution
│   │   ├── art.md                            # ART: Visual composition, aesthetic theory
│   │   ├── authorization.md                  # AUTH-01..05: PDP/PEP, ABAC, Policy-as-Code
│   │   ├── business-analysis.md              # BA-01..07: Functional requirements, user journeys
│   │   ├── business.md                       # BIZ: Unit economics, competitive moats, pricing
│   │   ├── crypto.md                         # CRY: Cryptographic primitives, consensus, Web3
│   │   ├── cybersec.md                       # CS-01..07: Offensive/defensive security invariants
│   │   ├── data-science.md                   # DS: Statistical inference, causal modeling, features
│   │   ├── economy.md                        # ECO: Macroeconomics, monetary cycles, capital allocation
│   │   ├── education.md                      # EDU: Instructional design, spaced repetition, mastery
│   │   ├── empathy-personas.md               # Target personas & empathy maps for UX validation
│   │   ├── environment.md                    # ENV: Ecology, carbon accounting, climate resilience
│   │   ├── finance.md                        # FIN: Valuation models, liquidity, balance-sheet discipline
│   │   ├── geopolitics.md                    # GEO: Resource flows, trade corridors, statecraft
│   │   ├── health.md                         # HLT: Longevity, metabolic health, cognitive endurance
│   │   ├── history.md                        # HIS: Archival evidence, civilizational cycles
│   │   ├── law.md                            # LAW: Statutory interpretation, compliance, liability
│   │   ├── literature.md                     # LIT: Narrative structure, literary criticism
│   │   ├── management.md                     # MGT: Organizational cadence, governance, bottlenecks
│   │   ├── marketing.md                      # MKT: Brand positioning, distribution, conversion
│   │   ├── medicine.md                       # MED: Clinical trial hierarchy, pathophysiology, ethics
│   │   ├── news.md                           # NWS: Media framing, source attribution, signal filtering
│   │   ├── philosophy.md                     # PHI: Epistemology, ethical frameworks, dialectics
│   │   ├── politics.md                       # POL: Institutional incentives, civics, public policy
│   │   ├── psychology.md                     # PSY: Cognitive biases, behavioral psychology
│   │   ├── rhetoric.md                       # RHE: Classical persuasion, argument structures
│   │   ├── science.md                        # SCI: Empirical falsifiability, replication standards
│   │   ├── solutions.md                      # SO-01..08: Scalable architecture solutions
│   │   ├── ui-frontend.md                    # UI-01..09: State machines, micro-interactions
│   │   └── trends/
│   │       └── 2026-11-02.md                 # Longitudinal technology & market trend logs
│   │
│   ├── 03-heuristics/                        # Cross-Domain Judgment & Empirical Wisdom
│   │   ├── HEURISTICS.md                     # H-01..06: Tested rules of thumb
│   │   ├── PATTERNS.md                       # P-01..05: High-leverage architectural patterns
│   │   └── RED-FLAGS.md                      # RF-01..10: Instant disqualifiers and anti-patterns
│   │
│   ├── 04-models/                            # Mental Models & System Paradigms
│   │   ├── _TEMPLATE.md                      # Mental model authoring template
│   │   ├── M-01.md                           # Blast Radius containment model
│   │   └── M-02.md                           # Offline-First Synchronization state model
│   │
│   ├── 05-elicitation/                       # Knowledge Extraction & Verification Protocols
│   │   ├── ARTIFACT-ARCHAEOLOGY.md           # Reverse-engineering knowledge from code artifacts
│   │   ├── ELICITATION-PROTOCOL.md           # Socratic interview and gap-extraction workflows
│   │   ├── GAP-FINDER.md                     # Automated coverage scanner for vault domains
│   │   ├── LAUNCHERS.md                      # L-01..10: Project ignition prompt templates
│   │   ├── QUESTION-BANK.md                  # Socratic probing questions per specialty
│   │   ├── SCENARIO-BANK.md                  # Failure simulation and stress-testing scenarios
│   │   ├── THE-TEST.md                       # 50-question comprehensive practitioner benchmark
│   │   └── sessions/                         # Historical Elicitation Session Transcripts
│   │       ├── _TEMPLATE.md                  # Session logging template
│   │       ├── S-01.md                       # Initial engineering foundation elicitation
│   │       ├── S-02.md                       # Security & database invariants extraction
│   │       └── S-03.md                       # Visual design & human experience elicitation
│   │
│   ├── 06-raw/                               # Candidate Staging
│   │   └── inbox.md                          # Unprocessed ideas, rule candidates awaiting validation
│   │
│   ├── 07-meta/                              # Vault Governance & Tooling
│   │   ├── ARCHITECTURE.md                   # The 4-Layer System Philosophy specification
│   │   ├── brainagent.md                     # Meta-agent for maintaining vault consistency
│   │   ├── check-vault.py                    # Python script for linting IDs, links, and schemas
│   │   ├── CONVENTIONS.md                    # Rule ID syntax, metadata headers, and naming rules
│   │   ├── DIGEST.md                         # Compact, high-density vault summary (Tier 0)
│   │   ├── EXTENDING.md                      # Guide for authoring and landing new domains
│   │   ├── NEW-PROJECT-SNIPPET.md            # Portable snippet to inject Cortex into any repo
│   │   └── SYNC-PROTOCOL.md                  # Multi-machine git synchronization protocol
│   │
│   └── 08-workflows/                         # Standard Operating Procedures & Analytics
│       ├── SIX-COMMANDS.md                   # Golden Path SDLC commands manual
│       └── STATS-ENGINE.md                   # Mathematical specification of vault mastery metrics
│
├── app/                                      # NEXT.JS 16 APP ROUTER
│   ├── favicon.ico                           # Standard favicon
│   ├── globals.css                           # Global Tailwind CSS, CSS variables, glowing tokens
│   ├── layout.tsx                            # Root HTML layout, ThemeProvider, fonts, metadata
│   ├── not-found.tsx                         # Cyber-terminal 404 handler
│   ├── page.tsx                              # Landing page: Exploded view, Synaptic constellation, telemetry
│   ├── template.tsx                          # Route transition wrapper
│   │
│   ├── agents/                               # Agents Directory Route
│   │   └── page.tsx                          # Interactive 8-agent matrix, rules inspector, role viewer
│   │
│   ├── assess/                               # Self-Assessment Route
│   │   └── page.tsx                          # Interactive quiz runner executing THE-TEST.md benchmarks
│   │
│   ├── console/                              # Interactive AI Terminal / Console
│   │   └── page.tsx                          # Command-line interface, streaming responses, sandbox tabs
│   │
│   ├── hq/                                   # Space Station Headquarters
│   │   └── page.tsx                          # Gamified 3D tactical command deck
│   │
│   ├── profile/                              # System Profile Route
│   │   └── page.tsx                          # Architect credentials, taste manifesto, domain stats
│   │
│   ├── start/                                # Quickstart Onboarding Route
│   │   └── page.tsx                          # Step-by-step vault cloning and initialization wizard
│   │
│   └── api/                                  # BACKEND ROUTE HANDLERS
│       ├── brain/
│       │   └── route.ts                      # Serves parsed brain nodes, links, and domain trees
│       ├── chat/
│       │   └── route.ts                      # Primary conversational & workflow execution endpoint
│       ├── quiz/
│       │   └── generate/
│       │       └── route.ts                  # Dynamic assessment generation from vault rules
│       ├── research/
│       │   └── route.ts                      # Deep web & academic literature synthesis endpoint
│       ├── sandbox/
│       │   └── run/
│       │       └── route.ts                  # Isolated server-side code execution sandbox
│       └── stats/
│           └── route.ts                      # Computes weighted mastery scores, rule counts, clusters
│
├── components/                               # REACT / UI COMPONENTS
│   ├── AuditInspector.tsx                    # Invariant checklist auditor with PASS/FAIL chips
│   ├── Brain3D.tsx                           # Three.js 3D Synaptic Constellation visualizer
│   ├── BrainViewer.tsx                       # Interactive 2D graph viewer for knowledge nodes
│   ├── ChainedPipelineBubble.tsx             # Visual progress indicator for multi-agent chains
│   ├── ChatMessageContent.tsx                # Markdown parser with code highlighting & copy buttons
│   ├── CodeBlockSandbox.tsx                  # Interactive in-browser runner for code snippets
│   ├── CommandPalette.tsx                    # Quick-jump modal (Ctrl+K / Cmd+K)
│   ├── ExportClaudeModal.tsx                 # Exports vault configuration as CLAUDE.md / .cursorrules
│   ├── NeuralLoader.tsx                      # Glowing SVG synaptic loading animation
│   ├── NeuralTransition.tsx                  # Smooth page transition canvas effect
│   ├── PixelBot.tsx                          # Retro-futuristic avatar assistant
│   ├── SpeechBubble.tsx                      # Terminal-styled notification dialogue
│   ├── theme-provider.tsx                    # Next-themes wrapper for dark/terminal mode
│   ├── ThemeToggle.tsx                       # Dark / Terminal palette switcher
│   ├── Tooltip.tsx                           # Lightweight accessible hover tooltip
│   ├── VoiceInput.tsx                        # Web Speech API speech-to-text input component
│   │
│   ├── agents/
│   │   └── ExplodedPipeline.tsx              # Interactive 8-agent SDLC workflow visualizer
│   │
│   ├── hq/
│   │   └── SpaceStation.tsx                  # Isometric 3D command deck canvas
│   │
│   ├── landing/
│   │   ├── ExecutionPipeline.tsx             # 6-step SDLC pipeline animation
│   │   ├── ExplodedView.tsx                  # Interactive breakdown of Vault vs Agent layers
│   │   ├── MinimalistData.tsx                # Clean telemetry statistics counter
│   │   ├── RouterFlow.tsx                    # 3-Tier router visual demonstration
│   │   └── RulePeeler.tsx                    # Interactive rule unpacker showing file origins
│   │
│   └── ui/                                   # Primitive UI Atoms
│       ├── badge.tsx                         # Cyber-terminal status badge
│       └── button.tsx                        # High-contrast accessible button primitive
│
├── lib/                                      # CORE BUSINESS LOGIC & ENGINES
│   ├── brain-parser.ts                       # Parses Markdown files into typed AST nodes and links
│   ├── brainGraph.ts                         # Computes force-directed layout coordinates
│   ├── claude-export.ts                      # Bundles the vault into standalone context files
│   ├── deterministic-validator.ts            # Extraction, syntax balance, invariant AST & sandbox tests
│   ├── embedder.ts                           # Vector embedding generator for semantic search
│   ├── stats.ts                              # Weighted mastery scoring engine (Target: 60 pts/agent)
│   ├── tiered-router.ts                      # 3-tier request classifier ($0 Tier 1, Fast Tier 2, Heavy Tier 3)
│   ├── utils.ts                              # Tailwind merge (cn) and formatting helpers
│   └── webcontainer.ts                       # WebContainer browser-sandbox initialization
│
├── public/                                   # STATIC ASSETS
│   ├── apple-touch-icon.png                  # iOS home screen icon
│   ├── brain-embeddings.json                 # Pre-computed client-side embeddings
│   ├── brain-template.zip                    # Downloadable standalone starter vault
│   ├── cortex-logo-cyan.svg                  # Vector brand logo
│   ├── favicon.ico                           # Browser favicon
│   ├── favicon.svg                           # Vector favicon
│   ├── file.svg                              # System file icon
│   ├── globe.svg                             # Network globe icon
│   ├── icon-512.png                          # PWA splash icon
│   ├── next.svg                              # Next.js framework mark
│   ├── social-preview.png                    # OpenGraph / Twitter social card
│   ├── synaptic_constellation_brain.glb      # 3D GLTF molecular brain model for WebGL
│   ├── vercel.svg                            # Deployment mark
│   ├── window.svg                            # Terminal window icon
│   │
│   ├── agents/                               # Public static mirror of agent specifications
│   │   ├── README.md
│   │   ├── dbaagent.md
│   │   ├── growthagent.md
│   │   ├── integrationagent.md
│   │   ├── productmanageragent.md
│   │   ├── securityagent.md
│   │   ├── systemsdesignagent.md
│   │   └── uiuxagent.md
│   │
│   └── brain/                                # Public static mirror of vault knowledge base
│       ├── 00-INDEX.md
│       ├── 01-identity/                      # Mirrored identity files
│       ├── 02-domains/                       # Mirrored domain files
│       ├── 03-heuristics/                    # Mirrored heuristics files
│       ├── 04-models/                        # Mirrored mental models
│       ├── 05-elicitation/                   # Mirrored test banks and sessions
│       ├── 06-raw/                           # Mirrored inbox
│       ├── 07-meta/                          # Mirrored governance docs
│       └── 08-workflows/                     # Mirrored workflow manuals
│
└── types/                                    # TYPE DEFINITIONS
    └── d3-force-3d.d.ts                      # TypeScript definitions for 3D force physics
```

---

## 3. Dual-System Architecture

Cortex resolves the core dilemma of modern software engineering: **How do we use LLMs without inheriting their hallucinations, regressions, and drift?**

It achieves this through a strict separation between two independent layers:

```
┌────────────────────────────────────────────────────────┐
│               PROCEDURAL JUDGMENT LAYER                │
│                 (brain/ — The Memory)                  │
│                                                        │
│  • 29 Knowledge Domains across 4 Clusters              │
│  • 200+ Atomic Invariant Rules (Single-line, Rule IDs) │
│  • Empirical Heuristics, Mental Models, Taste Criteria │
└──────────────────────────┬─────────────────────────────┘
                           │ Active Rules Feed
                           ▼
┌────────────────────────────────────────────────────────┐
│                   EXECUTION LAYER                      │
│              (agents/ — The Constitution)              │
│                                                        │
│  • 8 Autonomous Core Agents + Judgment Arbiter         │
│  • Pre-Flight Hard Stop: BN-00 (Must have all 8)       │
│  • Gate Checks: PASS / FAIL (Invariant Enforcement)    │
└──────────────────────────┬─────────────────────────────┘
                           │ Verified Constraints
                           ▼
┌────────────────────────────────────────────────────────┐
│                  COMPUTE ENGINE (CPU)                  │
│              (Tiered LLM Router & Sandbox)             │
│                                                        │
│  • Tier 1: Local AST & Vault Rule Lookup ($0.00)       │
│  • Tier 2: Fast LLM Utility (Conversations)            │
│  • Tier 3: Heavy Reasoning Engine (Workflows & Vision) │
└────────────────────────────────────────────────────────┘
```

### The Invariant Contract: BN-00
Anyone initializing Cortex is governed by rule **`BN-00`**:
- The system **cannot begin** any assessment, workflow, or implementation unless all **8 Core Agents** (`PM`, `UX`, `GR`, `SD`, `IR`, `DB`, `SEC`, `RS`) are present in `agents/`.
- If any agent file is missing, the system halts instantly:
  ```
  GATE: FAIL BN-00 <missing-agent> — Restore all 8 Core Agents before proceeding.
  ```

---

## 4. The 29 Knowledge Domains & Invariant Rule Engine

Rules are stored in `brain/02-domains/` as single-line atomic declarations with deterministic IDs. A rule is strictly actionable, verifiable, and assigned a confidence score (1 to 5).

The vault holds **29 files** in `brain/02-domains/`. Grouped rigorously, this consists of **28 rule domains** and **1 reference framework file** (`empathy-personas.md`):

### The 4 Galactic Clusters

| Cluster | Domains Included | Primary Focus |
|---|---|---|
| **Cluster 1: Engineering & Core Governance** (6 domains + 1 ref) | Cybersecurity (`CS`), Solutions (`SO`), Business Analysis (`BA`), UI Frontend (`UI`), Authorization (`AUTH`), Arbiter (`ARB`), Empathy & Personas (Reference) | System invariants, failure containment, zero-trust security, state machines, and cross-agent rule adjudication. |
| **Cluster 2: Humanities & Enterprise** (8 domains) | Psychology (`PSY`), Philosophy (`PHI`), Rhetoric (`RHE`), Literature (`LIT`), Art & Aesthetics (`ART`), Education (`EDU`), Marketing (`MKT`), Management (`MGT`) | Cognitive resonance, narrative framing, classical argumentation, visual hierarchy, team cadence, and pedagogical mastery. |
| **Cluster 3: Global & Society** (11 domains) | Economy (`ECO`), Geopolitics (`GEO`), Health (`HLT`), Law (`LAW`), Politics (`POL`), Environment (`ENV`), History (`HIS`), Crypto (`CRY`), Finance (`FIN`), News (`NWS`), Business (`BIZ`) | Macro-economic incentives, regulatory liability, cryptographic primitives, institutional dynamics, capital efficiency, and source attribution. |
| **Cluster 4: Frontier & Science** (3 domains) | Data Science (`DS`), Science (`SCI`), Medicine (`MED`) | Causal inference, empirical falsifiability, replication rigor, and clinical evidence hierarchies. |

> [!NOTE] Architectural Realignment & Citations
> - **Citations Mapping:** Agents currently cite `DB-01..15`, `RS-01..04`, and `SEC-14`. Currently, `SEC` citations map directly to `CS` (cybersecurity) and `AUTH` (authorization), while `DB` and `RS` rules reside in their corresponding execution agent files (`agents/dbaagent.md` and `agents/researchagent.md`). Future revisions may split these into standalone domain files.
> - **The Arbiter:** `arbiter.md` is an adjudication rule set (`ARB-01..06`) that the 8 agents consult to break deadlocks, not an independent agent.

### Rule Structure Standard (`CONVENTIONS.md`)
Every active rule follows this canonical markdown format:
```markdown
- **ID-##**: Short imperative statement of invariant. Why it matters. [conf:1-5, src:source_reference]
```
Example:
```markdown
- **DB-13**: Every financial transaction ledger must be strictly append-only; balance is a computed aggregate, never an in-place UPDATE. [conf:5, src:accounting-standards]
```

---

## 5. The 8 Core Agents & The Arbiter

The 8 agents in `agents/` are not vague conversational personas. They are specialized compilers that audit specifications, schemas, interfaces, and code against the Vault's invariants.

```
       ┌────────────────────────────────────────────────────────┐
       │                THE ARBITER (arbiter.md)                │
       │    Adjudication rule set consulted during conflicts    │
       └──────────────┬──────────────────────────┬──────────────┘
                      │                          │
        ┌─────────────┴────────────┐┌────────────┴─────────────┐
        │       PRODUCT SUITE      ││     ENGINEERING SUITE     │
        ├──────────────────────────┤├──────────────────────────┤
        │ [PM] Product Manager     ││ [SD] Systems Design      │
        │ [UX] UI / UX Designer    ││ [IR] Integration / Queues│
        │ [GR] Growth Strategist   ││ [DB] Database Architect  │
        │ [RS] Research Specialist ││ [SEC] Security Auditor   │
        └──────────────────────────┘└──────────────────────────┘
```

1. **`[PM]` Product Manager Agent (`productmanageragent.md`)**
   - **Enforces:** Strict MVP boundary control, edge-case coverage, business rules (`BA-01..07`, `PM-14..15`).
   - **Rejects:** Feature bloat, undefined user roles, untestable acceptance criteria.
2. **`[UX]` UI/UX Agent (`uiuxagent.md`)**
   - **Enforces:** Design tokens, honest component states (Empty, Loading, Error, Success), keyboard navigation, WCAG AA accessibility, cyber-terminal polish (`UI-01..09`, `TA-01..14`).
   - **Rejects:** Jarring layout shifts (CLS > 0.1), unhandled touch targets, raw unstyled buttons.
3. **`[GR]` Growth Agent (`growthagent.md`)**
   - **Enforces:** Value propositions, public OpenGraph metadata, SEO indexing, conversion loops.
   - **Rejects:** Jargon-heavy landing pages, hidden calls-to-action, broken social previews.
4. **`[SD]` Systems Design Agent (`systemsdesignagent.md`)**
   - **Enforces:** Micro-service vs modular monolith boundaries, failure domains, latency budgets, strict API contracts (`SO-01..08`).
   - **Rejects:** Cascading distributed failures, single points of failure, missing circuit breakers.
5. **`[IR]` Integration Agent (`integrationagent.md`)**
   - **Enforces:** Webhook signature verification, idempotent retry queues, dead-letter storage, offline sync state machines (`M-02`).
   - **Rejects:** Naive fire-and-forget fetch calls, missing timeout limits, unhandled rate limits (429).
6. **`[DB]` DBA Agent (`dbaagent.md`)**
   - **Enforces:** Relational integrity, append-only logs, Row-Level Security (RLS) on multi-tenant tables, b-tree foreign key indexing (`DB-01..15`).
   - **Rejects:** In-place mutable financial updates, raw unguarded database queries, un-indexed foreign keys.
7. **`[SEC]` Security Agent (`securityagent.md`)**
   - **Enforces:** STRIDE threat modeling, policy-as-code authorization (`AUTH-01..05`), input sanitization, CSRF tokens, secret zero-leakage (`CS-01..07`).
   - **Rejects:** Client-side privilege checks, exposed API secrets, missing rate limiters.
8. **`[RS]` Research Agent (`researchagent.md`)**
   - **Enforces:** Epistemic rigor, multi-source triangulation, peer-reviewed citation verification, zero-hallucination gates (`RS-01..04`).
   - **Rejects:** Unsubstantiated factual assertions, single-source citations, synthetic hallucinations.

### The Judgment Arbiter (`arbiter.md`)
When two agents produce conflicting mandates (e.g., `SEC` demands strict multi-factor verification while `UX` demands frictionless 1-click checkout), the agents consult the **Judgment Arbiter** rule set:
- **`ARB-01` (Domain Separation):** Security invariants always take precedence over convenience.
- **`ARB-02` (Precautionary Principle):** When irreversible data loss or financial exposure is possible, the system halts.

---

## 6. Tiered Router & Deterministic-First Execution Topology

Order of evaluation matters. To optimize latency, cost, and prevent rule lookups from intercepting workflow commands, Cortex routes every interaction in strict precedence:

```
Incoming Request (query, hasImage)
       │
       ▼
[1. Tier 3 Triggers First]
       ├─► Workflow command? (/grill, /to-spec, /to-tickets, /implement, /harden, /retro)
       │   OR Image attachment present?
       │     └─► Tier 3: Heavy Workflow / Multimodal Model (e.g. /implement DB-13 routes here)
       │
       ▼
[2. Tier 1 Pure Rule Lookup]
       ├─► Single rule inquiry? ("DB-13", "what is SEC-02?", "explain ARB-01")
       │     ├─► Exists in Index ──► Tier 1: Local Table ($0.00, <10ms single-digit ms)
       │     └─► Unknown Rule ID  ──► Tier 2: Fallback to Fast Model
       │
       ▼
[3. Tier 3 Heuristics]
       ├─► Query length > 400 chars OR architecture keywords (threat model, stride, failure domain)?
       │     └─► Tier 3: Heavy Reasoning Engine
       │
       ▼
[4. Tier 2 Conversational Utility]
       └─► Default conversational inquiries ──► Tier 2: Fast Utility Model
```

### Deterministic Validation Pipeline (`lib/deterministic-validator.ts`)
For `/implement`, model output is never trusted directly. It undergoes a 3-stage validation pipeline with a bounded retry loop (capped at 3 attempts):

```
LLM Generates Implementation Code
               │
               ▼
   [Stage 1: Code Extraction]
   Extracts fenced code blocks (```typescript, ```sql, etc.).
               │
               ▼
   [Stage 2: Lexical Static Gate]
   • Comment- and string-aware bracket/brace balance check.
   • Invariant Regex Scanner:
       - DB-13: Rejects UPDATE/DELETE on ledger/journal/balance tables.
       - SEC-14: Forbids eval(), new Function(), unescaped innerHTML, hardcoded secrets.
   • Test Assertions Check: Verifies expect(), assert(), or should. exist.
   (Note: Stage 2 is a fast lexical filter, not a full AST analysis).
               │
               ▼
   [Stage 3: Sandbox Execution & Bounded Retry]
   Executes unit tests in an isolated sandbox.
               │
      ┌────────┴────────┐
   Passed?            Failed?
      │                 │
      ▼                 ▼
[Status: Committed]   [Feed exact STDERR back to model]
                      "Fix the failing test only" (Attempts ≤ 3)
```
                  "Fix the failing test only"
```

---

## 7. Frontend Architecture & Visual Design System

The visual design system of Cortex is engineered to resemble an elite aerospace telemetry terminal. It avoids generic flat design in favor of deep atmospheric depth, cyber-terminal precision, and high-performance WebGL.

### Color Tokens & Atmospheric Depth
- **Background Deep Void:** `#0a1224` / `#0B1120` (Midnight Navy)
- **Terminal Elevated Card:** `#0f172a` with subtle border `rgba(34, 211, 238, 0.12)`
- **Accent Cyan (Neural Flux):** `#22D3EE` (Tailwind `cyan-400`)
- **Accent Emerald (Invariant Pass):** `#10B981` (Tailwind `emerald-500`)
- **Accent Amber (Warning / Review):** `#F59E0B` (Tailwind `amber-500`)
- **Accent Crimson (Gate Failure):** `#EF4444` (Tailwind `red-500`)

### Typography & Layout Rules
- **Display Headings:** Inter / Geist Sans with tight tracking (`tracking-tight`)
- **Telemetry & Labels:** JetBrains Mono / Geist Mono, uppercase, small tracking (`text-xs font-mono tracking-wider`)
- **Tabular Numerals:** All metric counters use `font-mono tabular-nums` to eliminate jitter during updates.
- **Broken Spatial Grid:** Left HUD telemetry panel + central viewport + right audit inspector.
- **Interactive 3D WebGL:** `Brain3D.tsx` renders `public/synaptic_constellation_brain.glb` with particle synaptic glows, dynamic rotation, and interactive node selection.

---

## 8. Functional & Non-Functional Requirements (FR & NFR)

### Functional Requirements (FR)

| ID | Requirement | Specification |
|---|---|---|
| **FR-01** | **Deterministic Rule Lookup** | Resolve any canonical rule ID locally with zero token cost in single-digit milliseconds (<10ms). |
| **FR-02** | **Pre-Flight Invariant Gate** | Halt workflows immediately (`BN-00`) if any of the 8 core agent files are missing from `agents/`. |
| **FR-03** | **Interactive 3D Constellation** | Render the 29-node knowledge graph in 3D WebGL with interactive orbital controls. |
| **FR-04** | **Per-Agent Pipeline State** | Render live per-agent status chips (`PENDING`, `RUNNING`, `PASS`, `FAIL`) during workflow execution. |
| **FR-05** | **Isolated Sandbox Execution** | Execute test suites in an isolated sandbox with stdout/stderr capture and strict timeout controls. |
| **FR-06** | **Weighted Mastery Analytics** | Compute weighted mastery scores from rule confidence weights (Target: 60 pts/agent). |
| **FR-07** | **Assessment Engine** | Run `THE-TEST.md` benchmark assessments against model generations. |

### Non-Functional Requirements (NFR)

| ID | Category | Specification |
|---|---|---|
| **NFR-01** | **Performance** | Next.js App Router performance achieving FCP < 1.0s and zero Cumulative Layout Shift (CLS = 0). |
| **NFR-02** | **Cost Efficiency** | Establish and monitor baseline query distribution; Tier 1 guarantees $0.00 token cost for pure rule lookups. |
| **NFR-03** | **Security & Sandboxing** | Zero secrets in client-side bundles. Server-side code execution (`/api/sandbox/run`) must enforce strict isolation, quota limits, and authentication to prevent unauthorized execution. |
| **NFR-04** | **Accessibility** | Full WCAG 2.1 AA compliance: contrast ratios ≥ 4.5:1, keyboard focus outlines, and screen-reader safe modals. |
| **NFR-05** | **Reliability & Resilience** | Local rule lookup operates completely offline ($0, no network) even when upstream LLM APIs are unreachable. |

---

## 9. The Golden Path: 6-Commands Workflow

```
/grill ──► /to-spec ──► /to-tickets ──► /implement ──► /harden ──► /retro
```

1. **`/grill <idea>`**: The 8 agents interrogate the user with relentless Socratic pressure. Exposes hidden assumptions, unhandled failure modes, and scope creep.
2. **`/to-spec`**: Compiles the grilled agreement into a versioned Technical Requirements Document (e.g. `TRD-v1.0`) with numbered revisions as specifications evolve.
3. **`/to-tickets`**: Decomposes the TRD into atomic, test-driven implementation tickets with strict acceptance criteria and dependency graphs.
4. **`/implement <ticket>`**: Generates code, immediately audited by the 3-stage deterministic validator (Extraction -> Lexical Static Gate -> Sandbox Tests with bounded retry loop).
5. **`/harden`**: The Security (`SEC`) and DBA (`DB`) agents subject the codebase to boundary fuzzing, RLS bypass vectors, and concurrent race tests.
6. **`/retro`**: Post-implementation reflection. Extracts newly discovered heuristics or failure patterns and appends candidate rules into `brain/06-raw/inbox.md`.

---

## 10. Maintenance Risks & Operational Recommendations

1. **Automated Mirror Parity:** `public/brain/`, `public/agents/`, and `brain-embeddings.json` must be generated by an automated prebuild script (`npm run sync:mirrors`) to prevent manual copy-paste drift.
2. **Continuous Vault Linting (`check-vault.py`):** Execute rule syntax checks, duplicate ID scans, numbering gap warnings, and `BN-00` checks in CI.
3. **Model Decoupling:** Model identifiers (Gemini, Claude, NVIDIA) should reside in environment and router configuration files, never hardcoded into documentation prose.
4. **Bounded Sandbox Retries:** Ensure the code execution retry loop is strictly capped (e.g. 3 attempts) with human escalation on repeated test failure.
5. **Versioned Specifications:** Treat TRDs as versioned living contracts (`TRD-v1.0`, `TRD-v1.1`) rather than immutable artifacts, reflecting continuous retro learning.

