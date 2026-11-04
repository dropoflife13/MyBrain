---
type: about
version: 3
status: active
---
# About Me — Intake

Purpose: give the quiz author (AI) and 8-Agent Suite enough context to ground scenarios, flaws, and gate checks in my real work. Sanitized per CV-09 (no credentials, personal phone numbers, street addresses, or third-party private data).

## 1. Snapshot
- **Name I go by, current role(s), where I work or study:** Neil Mar (Neil Mar C. De Asis) — BS Information Technology (BSIT) Student Leader, Full-Stack Developer, Systems Architect; Vice President (2025–2026) and former Treasurer (2024–2025) of CITEMAS at PHINMA University of Iloilo.
- **Stage of experience and years:** Senior student builder / OJT applicant; ~3–4 years building web, game, and organizational systems (Expected BSIT graduation: 2027).
- **Country/region and working languages:** Iloilo City, Western Visayas, Philippines · English, Hiligaynon, Tagalog.
- **Typical work context:** University innovation labs, hackathons (CITE Week 2025/2026, PHINMA AI Builder Workshop), pitch competitions (ORGFEST UIdeate Campus Shark Tank Champion), student organization executive leadership (CITEMAS), and Capstone / MVP team engineering.

## 2. Domains
*(Expanded from 3 core domains to a 29-domain Global Knowledge Graph)*

### Domain: UI & Frontend Architecture (`ui-frontend`) — prefix `UI`
- **How I use it / why it matters:** Primary team ownership role; building high-fidelity, interactive surfaces that feel like premium products (Linear-level clarity, Stripe-level consistency, studio-grade WebGL/motion).
- **Tools:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Three.js/WebGL, Framer Motion, WCAG 2.2 AA.
- **What I avoid:** Generic AI gradients, bouncy hover gimmicks, raw hex values in JSX, and fake saves.

### Domain: Solutions Architecture (`solutions`) — prefix `SO`
- **How I use it / why it matters:** Translating messy real-world constraints (intermittent connectivity, free-tier cloud limits) into resilient full-stack systems.
- **Tools:** Node.js, Next.js Server Actions, Supabase, MongoDB, Prisma, Python, Godot Engine.
- **What I avoid:** Premature microservices, overwriting historical records in-place, non-deterministic AI workflows.

### Domain: Business Analysis & Product Governance (`business-analysis`) — prefix `BA`
- **How I use it / why it matters:** Modeling who submits, who reviews, and who approves so software matches real institutional operations and survives panel defenses.
- **Tools:** Unified Context specs (`SPEC.md`), multi-actor role matrices, finite state machine workflow mapping.

### Domain: Cybersecurity & Data Integrity (`cybersec`) — prefix `CS`
- **How I use it / why it matters:** Protecting multi-tenant data from tampering, self-approval fraud, and secret leaks.
- **Tools:** Supabase RLS, JWT, bcrypt, Zod, DB-level `REVOKE` & triggers, RA 10173 safeguards.

### Domain: The Global Knowledge Graph (New v3.0)
- **How I use it:** Expanding beyond software into Humanities (Psychology, Philosophy, Law), Global Society (Crypto, Finance, Politics), and Frontier Science (Data Science, Medicine) using a 29-domain taxonomy.
- **The Arbiter (`ARB`):** A rule set that resolves conflicts between domains (e.g., Security > Growth) and enforces first-principles grounding (no volatile news, only timeless axioms).

## 3. Projects (7 real ones, sanitized)

1. **Cortex v3.0 — The Global Agentic OS (`A-06`):** Next.js 16 + Three.js WebGL interactive knowledge vault.
   - **Architecture:** 8 Core Agents (PM, UX, GR, SD, IR, DB, SEC, RS) + 1 Judgment Arbiter rule set.
   - **Efficiency:** Built a **Tiered AI Router** (Tier 1 local regex lookup = $0 cost, Tier 2 fast LLM, Tier 3 heavy LLM).
   - **Determinism:** Built a **Deterministic-First Sandbox** (lexical static gate + unit tests) so the LLM is only called for debugging *after* a test fails (saves 80% tokens).
   - **Autonomy:** Built a **Research Radar** (Vercel Cron + GitHub API) that self-heals empty domains by committing new Markdown rules directly to the repo twice a month.
   - **UX:** Pixel Agent HQ (2D isometric space station), Live WebGL Synaptic Constellation, Semantic Vector RAG, and `BN-00` fail-fast crash screens.
2. **Dugtong OJT (`A-02`):** Multi-tenant OJT management SaaS. *Role:* UI/UX & Frontend Design System Lead. *Decisions:* Enforced dumb prop-driven `shadcn/ui` primitives, Coordinator-only journal approval, and strict `origin/neil` branch isolation.
3. **CITEMAS Portal (`A-03`):** Full-stack creative studio & org portal. *Role:* Lead Architect & Org VP. *Decisions:* Procedural Three.js WebGL 3D logo, Premiere-inspired hover video showcase, strict RBAC (`super_admin`, `adviser` gate, `@phinmaed.com` regex).
4. **MerkadoTrack & 7-Agent Suite (`A-01`):** Offline-first agricultural market price tracker. *Decisions:* Append-only `price_logs` (`DB-01`), derived `current_prices` view (`DB-02`), offline IndexedDB outbox (`DB-05`), z-score outlier quarantine (`SEC-05`).
5. **FlexSpace Iloilo (Capstone):** Workspace discovery platform for Iloilo City. *Lesson:* Defending every schema column and scope boundary under tough panel questioning.
6. **Agrivet:** Integrated retail operations platform for small businesses. *Lesson:* "Current stock" must be derived from batch/transaction logs with expiration dates—never a single mutable integer.
7. **2D Top-Down Godot Roguelike:** Desktop game with stage progression. *Lesson:* Instilled composable data-driven design and strict finite state machine transitions.

## 4. How I work
- **First move on a new task:** Define the roles, who owns what, and the hard boundaries (who is NOT allowed to do what—both among user roles and among teammates) before touching UI or code.
- **What I check before calling something done:** Zero fake saves; loading/empty/error states wired; dark/light contrast meets WCAG AA without FOUC; permissions enforced server-side/DB-side; build and type-check pass cleanly.
- **My AI Philosophy (Deterministic-First):** When building AI features, I default to deterministic validation (regex, static gates, unit tests) *before* invoking the LLM. The AI is the muscle; the code is the constitution.
- **What I refuse to do:** Expose `service_role` keys to the browser; fake a successful save when the backend is missing; overwrite audit/ledger rows in-place; allow self-approval on two-party gates; ship generic neon-gradient AI slop.
- **Tools and formats I default to:** Markdown specs (`CLAUDE.md`, `SPEC.md`, `LATER.md`), Mermaid architecture & sequence diagrams, Next.js + TypeScript + Tailwind, Three.js procedural math.

## 5. Goals for the brain
- **What I want AI to do better:** Act as my 8-Agent Gatekeeper when building code, remember my exact architectural and visual taste across every new project, and never hallucinate (via `RS-03`).
- **Where I want to be tested hardest:** Boundary conditions (`breaks:`) where my strict rules (append-only, two-party approval, deterministic validation) collide with extreme scale, legal mandates, or deadline constraints.
- **Upcoming situations the quiz should prepare me for:** OJT technical interviews, Capstone defenses, hackathon pitches, and senior full-stack/solutions architecture reviews.

## 6. Quiz preferences
- **Formats:** Fast multiple-choice diagnostics, 7-minute micro-triggers (Artifact Archaeology, Visceral Cringe Test, Forced Trade-Off Triads).
- **Difficulty and time:** Realistic to hard · 5–10 minutes per session.
- **Language(s):** English.
- **Feedback style:** Concise synthesis after each round mapping choices to vault rules and `breaks:` conditions.

## 7. Materials I can provide
- `A-01` — 7-Agent Suite & MerkadoTrack bindings (`agents/*`)
- `A-02` — Dugtong OJT Unified Project Context (`docs/Dugtong_OJT_Unified_Context.md`)
- `A-03` — CITEMAS Portal System Architecture (`docs/CITEMAS_Portal_Architecture.md`)
- `A-04` — Synaptic Constellation 3D Brain (`lib/brainGraph.ts`)
- `A-05` — Practitioner Resume & Project Lineage (`01-identity/ABOUT-ME.md`)
- `A-06` — **Cortex v3.0** Full-Stack Agentic OS (`app/console/page.tsx`, `app/hq/page.tsx`, `lib/tiered-router.ts`, `lib/deterministic-validator.ts`, `app/api/research/route.ts`)
