---
type: architecture
version: 2
status: active
---
# Cortex v3.0 Architecture (The 4 Layers)

Cortex is an autonomous, deterministic-first engineering operating system and procedural knowledge vault.

## 1. The 4 Layers

1. **The Architect (Human Operator):** The ultimate source of truth. Dictates taste criteria (`TASTE.md`), operational principles (`OPERATING-PRINCIPLES.md`), and promotes active rules (`conf ≥ 3` with an explicit `breaks:` condition).
2. **The Vault (Procedural Memory — `brain/`):** Hierarchical Markdown repository containing 29 knowledge domains across 4 clusters, cross-domain heuristics, mental models, and empirical invariants. It never forgets and stores *how* decisions are reached.
3. **The 8 Core Agents + Arbiter (The Constitution — `agents/` & `arbiter.md`):** Deterministic guardrails acting as an invariant compiler. They audit specifications, schemas, interfaces, and code, rejecting violations (`GATE: FAIL <ID>`).
   - The 8 Core Agents: `PM`, `UX`, `GR`, `SD`, `IR`, `DB`, `SEC`, `RS`.
   - The Arbiter (`ARB-01..07`): Adjudication rule set consulted to break cross-agent priority deadlocks (Security > Convenience).
4. **The Model & Execution Engine (The CPU — `lib/` & `app/api/`):** Replaceable, subservient compute (Gemini, NVIDIA NIM, Claude) strictly governed by deterministic validation gates and the tiered router.

---

## 2. Core Architectural Subsystems

### A. The Tiered AI Router (`lib/tiered-router.ts`)
Routes queries according to strict economic and latency precedence:
- **Tier 1 (Local Regex / Memory Index — $0.00, <10ms):** Direct rule ID lookups (e.g. `DB-13`, `What is SEC-02?`) resolved locally without network calls.
- **Tier 2 (Fast Utility LLM):** Conversational questions and lightweight explanations (e.g. Gemini Flash).
- **Tier 3 (Heavy Multi-Agent Engine):** Workflow commands (`/grill`, `/to-spec`, `/implement`, `/harden`, `/research`), image attachments, and deep multi-step architecture inquiries.

### B. Deterministic-First Validation Sandbox (`lib/deterministic-validator.ts`)
When generating implementation code (`/implement`), Cortex refuses to blindly trust LLMs:
1. **Stage 1 (Extraction):** Parses fenced code blocks.
2. **Stage 2 (Lexical Static Gate):** Fast string- and comment-aware bracket balance check, invariant regex enforcement (`DB-13` append-only, `SEC-14` forbidden eval/innerHTML/secrets), and assertion verification (`expect`/`assert`).
3. **Stage 3 (Isolated Sandbox Run):** Executes unit tests in an isolated WebContainer/Node sandbox.
4. **Feedback Loop:** If a test fails, the exact `STDERR` is fed back to the model with the directive to *fix only the failing test* (bounded to 3 attempts), saving up to 80% token costs.

### C. Autonomous Research Radar (`app/api/research/route.ts`)
A background agentic loop that periodically surveys domain literature, extracts candidate heuristics, and submits pull requests or inbox entries to self-heal empty knowledge domains without human prompting.

### D. Pixel Agent HQ (`app/hq/page.tsx` & `components/hq/SpaceStation.tsx`)
A 2D isometric command deck that anchors all 8 agents to physical workstations (research boards, server racks, review desks) governed by explicit finite state machines (`Working → Walking → Fetching → Returning`).

---

## 3. Core Design Principles

- **The AI is the muscle, not the brain:** Deterministic rules and static tests always override stochastic model generation.
- **BN-00 Invariant:** No build task, assessment, or launcher can run if any of the 8 Core Agent files is missing (`GATE: FAIL BN-00`).
- **Evidence-Weighted Truth:** A single battle-tested rule with a verified failure boundary (`breaks:`) is worth 5 unproven suggestions.
