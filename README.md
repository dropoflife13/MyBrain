# Cortex v3.0 — Autonomous Agentic OS & 8-Agent Governance Suite

An interactive 3D WebGL procedural judgment vault and deterministic multi-agent governance engine built with **Next.js 16 (App Router)**, **Three.js / React Three Fiber**, **d3-force-3d**, and a local-first **Markdown Knowledge Base** (29 Domains across 4 Clusters).

Rather than storing passive documentation, Cortex encodes *how you decide* (`WHEN <trigger> → DO <action> | breaks: <boundary> | conf: <1–5>`) and enforces those rules in automated **Gate Mode** across software engineering, enterprise systems, humanities, and frontier science.

---

## 1. The 4-Layer Architecture (`brain/07-meta/ARCHITECTURE.md`)

1. **Layer 1 — The Architect (Human Operator):** Owns values, trade-offs, and final rule promotion (`conf ≥ 3` with an explicit `breaks:` boundary).
2. **Layer 2 — The Vault (`brain/`):** Local Markdown repository storing Tier 0 Operating Principles (`OP-01..19`), Taste (`TA-01..20`), Cross-Domain Heuristics (`H`, `P`, `RF`), and 29 Domain files.
3. **Layer 3 — The Agent Gatekeepers (`agents/` & `arbiter.md`):**
   - **8 Core Agents (Hard Invariant `BN-00`):** `PM`, `UX`, `GR`, `SD`, `IR`, `DB`, `SEC`, `RS`.
   - **The Arbiter (`ARB-01..07`):** Adjudication rule set resolving cross-agent conflicts (Security > Convenience).
4. **Layer 4 — The Compute & Execution Engine (`lib/` & `app/api/`):**
   - **Tiered AI Router (`lib/tiered-router.ts`):** Routes direct rule queries to Tier 1 local table ($0.00, <10ms), conversational queries to Tier 2 (fast utility model), and complex workflows to Tier 3 (heavy multi-agent reasoning).
   - **Deterministic Sandbox (`lib/deterministic-validator.ts`):** Fast lexical static gate (bracket checking + invariant validation) and isolated test execution *before* invoking an LLM for debugging.
   - **Autonomous Research Radar (`app/api/research/route.ts`):** Automated background seeder that surveys domain literature and commits new foundational rules to self-heal empty domains.
   - **Pixel Agent HQ (`app/hq/page.tsx`):** 2D isometric command deck anchoring agents to physical workstations with finite state machine progression.

---

## 2. The 4 Cognitive Clusters (29 Domains)

The 3D Brain Constellation, Console Sidebar (`/console`), and Operator Profile (`/profile`) organize knowledge into **4 Clusters**:

| Cluster | Spatial Lobe (3D) | Gates / Domains | Focus |
|---|---|---|---|
| **Cluster 1: Engineering & Governance** | Left & Right Central Hemispheres | `CS`, `SO`, `BA`, `UI`, `AUTH`, `ARB`, `empathy-personas` | System invariants, failure containment, zero-trust security, state machines, and cross-agent rule adjudication. |
| **Cluster 2: Humanities & Enterprise** | Right Cortical Lobe | `PSY`, `PHI`, `RHE`, `LIT`, `ART`, `EDU`, `MKT`, `MGT` | Cognitive resonance, narrative framing, classical argumentation, visual hierarchy, team cadence, and pedagogy. |
| **Cluster 3: Global & Society** | Left Cortical Lobe | `ECO`, `GEO`, `LAW`, `POL`, `ENV`, `HIS`, `CRY`, `FIN`, `NWS`, `BIZ`, `HLT` | Macroeconomics, statutory liability, cryptographic primitives, institutional dynamics, capital efficiency, and source attribution. |
| **Cluster 4: Frontier & Science** | Upper Cortical Apex | `DS`, `SCI`, `MED` | Causal inference, empirical falsifiability, replication rigor, and clinical evidence hierarchies. |

---

## 3. Core Features

- **Export `CLAUDE.md` Modal:** Export your vault rules and agent configurations into portable single-file system prompts (`CLAUDE.md` or `.cursorrules`) to govern AI coding assistants in external IDEs.
- **Fork This Brain Template:** Download a clean, standalone starter archive (`brain-template.zip` via `/start`) initialized with `0 personal rules` and intact `BN-00` gatekeepers so you can earn your own knowledge graph through `THE-TEST.md`.
- **Golden Path 8-Command SDLC:** Sequential command workflow (`/grill`, `/pitch`, `/to-spec`, `/to-tickets`, `/implement`, `/review`, `/harden`, `/research`).

---

## 4. Quick Start (Local Development)

### Step 1: Clone Repository
```bash
git clone https://github.com/dropoflife13/MyBrain.git
cd MyBrain
npm install
```

### Step 2: Configure Environment Variables
Create a `.env.local` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
# Optional: OpenRouter or NVIDIA NIM fallbacks
OPENROUTER_API_KEY=your_openrouter_key_here
# Optional: Upstash Redis for distributed rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the landing page, `/console` for the 3D Brain & AI Neural Chat, `/hq` for the Pixel Agent Space Station, `/profile` for the 4-Cluster Cognitive Radar, `/assess` for the diagnostic benchmark, `/agents` for the Agent Directory, and `/start` for the onboarding guide.
