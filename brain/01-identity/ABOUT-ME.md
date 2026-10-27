---
type: about
version: 2
status: active
---
# About Me — Intake

Purpose: give the quiz author (AI) and 7-Agent Suite enough context to ground scenarios, flaws, and gate checks in my real work. Sanitized per CV-09 (no credentials, personal phone numbers, street addresses, or third-party private data).

## 1. Snapshot
- **Name I go by, current role(s), where I work or study:** Neil Mar (Neil Mar C. De Asis) — BS Information Technology (BSIT) Student Leader, Full-Stack Developer, UI/UX & Frontend System Lead; Vice President (2025–2026) and former Treasurer (2024–2025) of CITEMAS at PHINMA University of Iloilo.
- **Stage of experience and years:** Senior student builder / OJT applicant; ~3–4 years building web, game, and organizational systems (Expected BSIT graduation: 2027).
- **Country/region and working languages:** Iloilo City, Western Visayas, Philippines · English, Hiligaynon, Tagalog.
- **Typical work context:** University innovation labs, hackathons (CITE Week 2025/2026, PHINMA AI Builder Workshop), pitch competitions (ORGFEST UIdeate Campus Shark Tank Champion), student organization executive leadership (CITEMAS), and Capstone / MVP team engineering.

## 2. Domains

### Domain: UI & Frontend Architecture (`ui-frontend`) — prefix `UI`
- **How I use it / why it matters to me:** Primary team ownership role; the visual and interactive surface is what makes a product immediately credible to judges, deans, and users (Linear-level clarity, Stripe-level consistency, studio-grade WebGL/motion).
- **Depth:** specialist / teach-others
- **Years or number of projects:** 3+ years, 6+ projects
- **Tools, stacks, frameworks, standards I use:** Next.js (15/16 App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Three.js / WebGL, Framer Motion, Figma, Canva, Adobe Premiere Pro, CapCut, Blender (Python scripting → GLB), WCAG 2.1/2.2 AA.
- **Courses, certifications, credentials:** Basic Web Development Training (2024), Armada Logistics 3-Day Online Coding Training (2024), Online Slingshot Region 6 Creatives Conference (2025).
- **What people ask me for in this domain:** Design systems & token foundations, shared dumb component libraries, clickable prototypes, 3D/spatial hero centerpieces, role-aware dashboards, pitch decks, and final UI polish.
- **What I avoid or am still learning:** Avoid generic AI gradients, bouncy hover gimmicks, raw hex values in JSX, and fake saves.
- **Roles I play:** UI/UX Lead, Frontend Architect, Design System Owner, Motion/3D Engineer.

### Domain: Solutions Architecture (`solutions`) — prefix `SO`
- **How I use it / why it matters to me:** Translating messy real-world constraints (intermittent Philippine mobile data, zero-Docker shared laptops, free-tier cloud limits) into resilient full-stack systems.
- **Depth:** working / specialist
- **Years or number of projects:** 3+ years, 6 projects
- **Tools, stacks, frameworks, standards I use:** Node.js, Express.js, Next.js Server Actions / Route Handlers, Supabase (PostgreSQL, Storage), MongoDB Atlas & Compass, Mongoose, MySQL, PHP, Python, Godot Engine (2D game state machines & data-driven systems), Cloudinary, Vercel, Render, Postman, Git.
- **Courses, certifications, credentials:** Basic Python Fundamentals (2023), DICT-ITU DTC Initiative (Intro to Modern AI, Data Science Essentials with Python, Data Analytics Essentials, Analyze Customer Reviews — 2026), Region 6 HIMS Conference (2025).
- **What people ask me for in this domain:** Database schema design, derived state vs. transaction logs, offline sync architecture, API contracts, and performance-first media/3D delivery.
- **What I avoid or am still learning:** Avoid premature microservices/Kafka for small teams; avoid overwriting historical records in-place.
- **Roles I play:** Full-Stack Builder, Systems Designer, Database Architect.

### Domain: Business Analysis & Product Governance (`business-analysis`) — prefix `BA`
- **How I use it / why it matters to me:** Rooted in serving as CITEMAS Treasurer and Vice President plus winning Campus Shark Tank; I model who submits, who reviews, and who approves so software matches real institutional operations and survives panel defenses.
- **Depth:** working / specialist
- **Years or number of projects:** 3+ years (executive org leadership + 5+ software systems)
- **Tools, stacks, frameworks, standards I use:** Unified Context specs (`SPEC.md`, `PROBLEM.md`, `PITCH.md`, `LATER.md`), Google Workspace, Excel/Sheets audit tracking, multi-actor role matrices, finite state machine workflow mapping.
- **Courses, certifications, credentials:** Student Leadership and Professional Development Seminar (2025), ORGFEST UIdeate Campus Shark Tank Champion.
- **What people ask me for in this domain:** Defining role boundaries, spotting spec contradictions between teammates, cutting scope to a 3-minute demoable MVP, and structuring defensible business models.
- **What I avoid or am still learning:** Avoid happy-path-only specs that ignore exceptions (expired MOAs, rejected requests, unverified accounts); avoid silent scope expansion.
- **Roles I play:** Product Strategist, Spec Author, Presenter / Pitch Lead, Org Executive.

### Domain: Cybersecurity & Data Integrity (`cybersec`) — prefix `CS`
- **How I use it / why it matters to me:** Protecting multi-tenant school, student, and financial/inventory data from tampering, self-approval fraud, and accidental client-bundle secret leaks.
- **Depth:** working
- **Years or number of projects:** 2+ years across multi-role web platforms
- **Tools, stacks, frameworks, standards I use:** Supabase Auth & Row Level Security (RLS), JWT (`lib/auth.js`), bcrypt, Zod schema validation, DB-level `REVOKE` & triggers, Philippine Data Privacy Act (RA 10173) safeguards.
- **What people ask me for in this domain:** Role-based access control (RBAC) hierarchies, trust boundary enforcement, audit log integrity, and pre-activation verification gates.
- **What I avoid or am still learning:** Avoid relying on hidden UI buttons for security; avoid exposing `service_role` keys in `NEXT_PUBLIC_*`; expanding automated adversarial pentest suites (`pgTAP`).
- **Roles I play:** Security Gatekeeper, RBAC Designer, Code Reviewer.

## 3. Projects (6 real ones, sanitized)
1. **Dugtong OJT (`A-02`):** Multi-tenant OJT management SaaS + verified company marketplace for Philippine colleges. *Role:* UI/UX & Frontend Design System Lead (with Khent, Josiah, Arwin). *Decisions:* Enforced dumb prop-driven `shadcn/ui` primitives, centralized light/dark WCAG AA tokens, Coordinator-only journal approval, receiver-only partnership acceptance, and strict `origin/neil` branch isolation on a shared laptop.
2. **CITEMAS Portal (`A-03`):** Full-stack creative studio & org portal for PHINMA UI CITEMAS (Next.js 16, React 19, Tailwind v4, MongoDB, Cloudinary). *Role:* Lead Architect & Org VP. *Decisions:* Built a procedural Three.js WebGL 3D logo (avoiding heavy `.gltf` downloads), a Premiere-inspired 10-second hover video showcase using DOM-persistent CSS Grid rows (zero black flash), a 400vh sticky card stack, and strict RBAC (`super_admin`, `adviser` pre-activation gate, single- vs. multi-holder `officer` seats, `@phinmaed.com` regex validation).
3. **MerkadoTrack & 7-Agent Suite (`A-01`):** Offline-first agricultural market price tracker and reusable 7-agent gatekeeper architecture (`PM`, `SD`, `DB`, `IR`, `UX`, `GR`, `SEC`). *Decisions:* Append-only `price_logs` with `supersedes_id` (`DB-01`), derived `current_prices` view (`DB-02`), offline IndexedDB outbox with server `received_at` vs. bounded `observed_at` (`DB-05`), and z-score outlier quarantine with `approver ≠ submitter` (`SEC-05`).
4. **FlexSpace Iloilo (Capstone 1 & 2, `A-05`):** Workspace discovery platform for Iloilo City enabling students and professionals to locate co-working hubs via live GPS tracking. *Lesson:* Forged my habit of defending every schema column, business rule ID, and scope boundary under tough capstone panel questioning.
5. **Agrivet (`A-05`):** Integrated retail operations platform for small agrivet businesses to track stock, monitor batch expiration, and manage suppliers. *Lesson:* Taught me that "current stock" must be derived from batch/transaction logs with expiration dates—never a single mutable integer overwritten in-place.
6. **2D Top-Down Godot Roguelike Game (`A-05`):** Desktop game with stage-based progression, stat upgrades, and augment synergies. *Lesson:* Instilled composable data-driven design (modular upgrade definitions instead of spaghetti conditionals) and strict finite state machine transitions.

## 4. How I work
- **First move on a new task:** Define the roles, who owns what, and the hard boundaries (who is NOT allowed to do what—both among user roles and among teammates) before touching UI or code.
- **What I check before calling something done:** Zero fake saves; loading/empty/error states wired; dark/light contrast meets WCAG AA without FOUC; permissions enforced server-side/DB-side; build and type-check pass cleanly.
- **What I refuse to do:** Expose `service_role` keys to the browser; fake a successful save when the backend is missing; overwrite audit/ledger rows in-place; allow self-approval on two-party gates; ship generic neon-gradient AI slop.
- **Tools and formats I default to:** Markdown specs (`CLAUDE.md`, `SPEC.md`, `LATER.md`), Mermaid architecture & sequence diagrams, Next.js + TypeScript + Tailwind + shadcn/ui, Three.js procedural math.
- **How I decide under time pressure:** Cut scope to one user type and one 3-minute demoable core job; park extras in `LATER.md`; keep security and data invariants intact while simplifying feature surface.
- **Who I work with and what they push back on:** Student/hackathon teammates (who sometimes blur module boundaries or want quick schema shortcuts), faculty panelists/judges (who probe edge cases, security, and business viability), and org officers/advisers.

## 5. Goals for the brain
- **What I want AI to do better because of this vault:** Act as my 7-Agent Gatekeeper when building code, and remember my exact architectural, governance, and visual taste across every new project via multi-root workspaces without me repeating myself.
- **Where I want to be tested hardest:** Boundary conditions (`breaks:`) where my strict rules (append-only, two-party approval, dumb primitives, procedural 3D) collide with extreme scale, legal mandates, or deadline constraints.
- **Upcoming situations the quiz should prepare me for:** OJT technical interviews, Capstone defenses, hackathon pitches, and senior full-stack/solutions architecture reviews.
- **Things I suspect I know but cannot explain:** How my mix of org treasury/governance, video editing/3D art, game dev state machines, and relational databases combines into a single systems lens.

## 6. Quiz preferences
- **Formats I want:** Fast multiple-choice diagnostics, 7-minute micro-triggers (Artifact Archaeology, Visceral Cringe Test, Forced Trade-Off Triads).
- **Difficulty and time per session:** Realistic to hard · 5–10 minutes per session.
- **Language(s):** English.
- **Feedback style:** Concise synthesis after each round mapping choices to vault rules and `breaks:` conditions.

## 7. Materials I can provide
- `A-01` — 7-Agent Suite & MerkadoTrack bindings (`agents/*`)
- `A-02` — Dugtong OJT Unified Project Context (`docs/Dugtong_OJT_Unified_Context.md`)
- `A-03` — CITEMAS Portal System Architecture (`docs/CITEMAS_Portal_Architecture.md`)
- `A-04` — Synaptic Constellation 3D Brain (`lib/brainGraph.ts`, `public/synaptic_constellation_brain.glb`)
- `A-05` — Practitioner Resume & Project Lineage: FlexSpace Iloilo, Agrivet, Godot Roguelike (`01-identity/ABOUT-ME.md`)
