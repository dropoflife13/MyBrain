# Cortex v2.4 — Global Second Brain & 7-Agent Execution Gate Suite

An interactive 3D WebGL procedural judgment vault and multi-agent governance engine built with **Next.js 16 (App Router)**, **Three.js / React Three Fiber**, **d3-force-3d**, and a local-first **Markdown Knowledge Base** (`brain/` + `agents/`).

Rather than storing passive notes, Cortex encodes *how you decide* (`WHEN <trigger> → DO <action> | breaks: <boundary> | conf: <1–5>`) and enforces those rules in automated **Gate Mode** across software engineering, humanities, and real-world research.

---

## 1. The 4-Layer Architecture (`brain/07-meta/ARCHITECTURE.md`)

1. **Layer 1 — The Architect (Human Operator):** Owns values, trade-offs, and final rule promotion (`conf ≥ 3` with an explicit `breaks:` boundary).
2. **Layer 2 — The Vault (`brain/`):** Local Markdown files storing Tier 0 Operating Principles (`OP`), Taste (`TA`), Cross-Domain Heuristics (`H`, `P`, `RF`), and 10 Domain files.
3. **Layer 3 — The Agent Gatekeepers (`agents/`):**
   - **7 Core Engineering Agents (Hard Invariant `BN-00`):** `PM`, `UX`, `GR`, `SD`, `IR`, `DB`, `SEC`
   - **Research Agent (`RS`):** Epistemic rigor, source triangulation, and anti-hallucination (`RS-01..04`)
4. **Layer 4 — The Model (LLM Runtime):** Stateless reasoning engine (`app/api/chat/route.ts`) constrained by rate limiting, Zod validation, and the active Markdown rules.

---

## 2. The 3 Cognitive Clusters (14 Gates)

The 3D Brain Constellation, Console Sidebar (`/console`), and Operator Profile (`/profile`) organize knowledge into **3 Clusters**:

| Cluster | Spatial Lobe (3D) | Gates / Domains | Target Mastery |
|---|---|---|---|
| **Engineering** | Left & Right Central Hemispheres (`x ≈ ±30`) | `DB`, `SEC`, `UX`, `PM`, `SD`, `IR`, `GR` (+ `CS`, `SO`, `BA`, `UI`, `OP`, `TA`, `H`, `P`, `RF`) | 420 weighted pts (7 × 60) |
| **Humanities** | Right Cortical Lobe (`x ≈ +78`) | `PSY` (Psychology), `PHI` (Philosophy), `RHE` (Rhetoric) | 180 weighted pts (3 × 60) |
| **World** | Left Cortical Lobe (`x ≈ -78`) | `ECO` (Economy), `GEO` (Geopolitics), `HLT` (Health), `RS` (Research Agent) | 240 weighted pts (4 × 60) |

---

## 3. Quick Start (Local Development or Open-Source Fork)

### Step 1: Clone or Unzip
Clone this repository or download the Blank-Slate Starter Archive (`/brain-template.zip` from the `/start` page):

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
# Optional: Upstash Redis for distributed rate limiting (falls back to in-memory 5 req/min/IP)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Step 3: Launch the 3D Runtime
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to explore the landing page, `/console` for the 3D Brain & AI Neural Chat, `/profile` for the 3-Cluster Cognitive Radar, `/assess` for the in-browser diagnostic quiz (`Launcher L-01`), `/agents` for the Agent Directory, and `/start` for the Beginner's Guide.

---

## 4. The 8-Command SDLC & Research Pipeline (`brain/08-workflows/SIX-COMMANDS.md`)

Inside the `/console` AI Neural Chat panel, trigger any workflow command:
- `/grill` — Interrogate the problem and uncover edge cases (`PM`)
- `/pitch` — Formulate a 3-minute value proposition (`GR` + `PM`)
- `/to-spec` — Author a technical PRD/TRD with As-Is/To-Be architectures (`SD` + `PM`)
- `/to-tickets` — Decompose the spec into 5 sequential atomic tickets (`PM`)
- `/implement` — Write production code obeying append-only & RLS gates (`DB` + `SEC` + `IR`)
- `/review` — Execute a STRIDE security & `BN-00` invariant audit (`SEC` + `SD`)
- `/harden` — Run an Enterprise Hardening audit checking atomic conditionals (`DB-13`), multi-tenant row isolation (`DB-14`), server-side payload redaction (`SEC-14`), and private cache headers (`SEC-15`)
- `/research` — Fact-check claims, triangulate across primary sources, and prevent hallucinations (`RS-01..04`)

---

## 5. Vault Integrity & Verification

Run the zero-dependency mechanical audit script at any time to verify frontmatter, rule grammar (`CV-01..08`), block IDs, and prefix isolation:

```bash
python brain/07-meta/check-vault.py
```
