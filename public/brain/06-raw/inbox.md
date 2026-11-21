---
type: inbox
version: 8
status: active
---
# Inbox — Unprocessed Candidates

Candidates only (`status: candidate`). Promotion is a human act (CV-03). Format: CV-02 with `CAND-nn` IDs. Every candidate at `conf ≥ 3` must have a concrete `breaks:` condition and real project `ev:`.

## Active Candidates
- **CAND-21** (Line-Ending Normalization & Blind Inter-Rater Audit): WHEN hashing, scoring, or auditing generated code/SQL across Windows/Linux pipelines → DO normalize line endings (`LF`) before comparison and validate deterministic oracle accuracy with blind human audit Cohen's $\kappa$ + `REML+HKSJ` random-effects meta-analysis | why: CRLF vs LF mismatches skew deterministic diff checks and unblinded audits inflate agreement | breaks: single-OS ephemeral scratch scripts not persisted or compared across environments | conf: 3 | ev: Axiom (0f9b63f, 1128e05, 8e9996b, f01cb56) | status: candidate #determinism #eval-rigor ^cand-21
- **CAND-22** (Reasoning-Profile Cache Isolation): WHEN routing multiple reasoning/non-thinking model profiles (`cacheKeySuffix`) against a shared prompt-cache or artifact store → DO include the reasoning mode and profile identifier in the cache key | why: shared cache keys silently serve stale thinking/non-thinking responses across ablation conditions | breaks: single-model endpoints with immutable decoding parameters | conf: 3 | ev: Axiom (c32df6a, b17fe5e) | status: candidate #llm-routing #cache ^cand-22
- **CAND-23** (Process-Tree Cleanup & Live PID Detection): WHEN pausing, resuming, or cancelling CLI/agent subprocesses in a desktop HUD (`Tauri` / `Node`) → DO terminate the full OS process tree (`kill_process_tree`) and probe live child PIDs before spawning replacement runs | why: killing only the wrapper shell leaves orphaned `node`/`npx` workers holding locks and RAM | breaks: stateless one-shot commands with no spawned child processes | conf: 3 | ev: DinoBuds/OJTpulse (f64667e, 6ed20d8) | status: candidate #desktop #process-lifecycle ^cand-23
- **CAND-24** (Dynamic Runtime Env Resolution on Serverless Routes): WHEN reading sensitive server credentials (`process.env.SUPABASE_SERVICE_ROLE_KEY`) in Next.js App Router API routes → DO read `process.env` dynamically inside the request handler rather than caching at module top-level, and serve static 3D/image assets from `public/static/` | why: build-time module evaluation can capture `undefined` env vars on preview/edge cold starts and break static asset resolution on Vercel | breaks: purely static build-time SSG pages with zero runtime secrets | conf: 3 | ev: Public_Library (1c750f3, 7eb1dea) | status: candidate #nextjs #vercel #security ^cand-24
- **CAND-25** (Proof-of-Work Telemetry & Non-Git Work Capture): WHEN tracking engineering productivity or OJT hours (`OJTpulse`) → DO pair Git commit hashes with BSSID/lunch-break state and verifiable non-Git work logs rather than relying on commit counts alone | why: UI/research/office work outside Git otherwise goes uncounted while unverified time logs invite audit disputes | breaks: automated CI-only pipelines with zero human timesheet reporting | conf: 3 | ev: DinoBuds/OJTpulse (33f1aa3, a638d29) | status: candidate #ojt #auditability ^cand-25

## Promotion Ledger (Session S-01 — 2026-10-27)
- `CAND-01` → Promoted to **`CS-03`** (`02-domains/cybersec.md`)
- `CAND-02` → Promoted to **`CS-02`** (`02-domains/cybersec.md`)
- `CAND-03` → Promoted to **`UI-01`** (`02-domains/ui-frontend.md`)
- `CAND-04` → Promoted to **`UI-02`** (`02-domains/ui-frontend.md`)
- `CAND-05` → Promoted to **`SO-04`** & **`UI-05`** (`02-domains/solutions.md`, `ui-frontend.md`)
- `CAND-06` → Promoted to **`SO-01`** (`02-domains/solutions.md`)
- `CAND-07` → Promoted to **`SO-02`** (`02-domains/solutions.md`)
- `CAND-08` → Promoted to **`BA-01`** & **`BA-03`** (`02-domains/business-analysis.md`)
- `CAND-09` → Promoted to **`UI-05`** & **`P-02`** (`02-domains/ui-frontend.md`, `03-heuristics/PATTERNS.md`)
- `CAND-10` → Promoted to **`H-02`** (`03-heuristics/HEURISTICS.md`)
- `CAND-11` → Promoted to **`CS-02`** & **`P-01`** (`02-domains/cybersec.md`, `03-heuristics/PATTERNS.md`)
- `CAND-12` → Promoted to **`H-01`** (`03-heuristics/HEURISTICS.md`)
- `CAND-13` → Promoted to **`P-03`** (`03-heuristics/PATTERNS.md`)

## Promotion Ledger (Session S-03 — 2026-10-28 · Cortex v2.4 Journey)
- `CAND-14` → Promoted to **`UI-07`** & **`RF-09`** (`02-domains/ui-frontend.md`, `03-heuristics/RED-FLAGS.md` — Single-owner `OrbitControls` auto-rotation without manual `camera.position.lerp` snap-back)
- `CAND-15` → Promoted to **`UI-08`** & **`RF-10`** (`02-domains/ui-frontend.md`, `03-heuristics/RED-FLAGS.md` — Single destination-owned `<NeuralLoader />` gated by `isReady = isGraphReady && minTimerDone`)
- `CAND-16` → Promoted to **`UI-09`** & **`TA-14`** (`02-domains/ui-frontend.md`, `01-identity/TASTE.md` — 3-column CSS Grid `grid-cols-[1fr_auto_1fr]` header symmetry & Architectural Blueprint Light Mode `#f0f4f8`)
- `CAND-17` → Promoted to **`SO-07`** & **`P-05`** (`02-domains/solutions.md`, `03-heuristics/PATTERNS.md` — Pre-flight 7-Agent invariant `BN-00` + blank-slate `status: empty` starter fork)
- `CAND-18` → Promoted to **`SO-08`** & **`H-06`** (`02-domains/solutions.md`, `03-heuristics/HEURISTICS.md` — Live `.md` single-source-of-truth constellation generation & zero-overlap vault auditing)
- `CAND-19` → Promoted to **`CS-07`** (`02-domains/cybersec.md` — Fail-closed `HTTP 422` pre-flight API gate with sanitized relative filenames)
- `CAND-20` → Promoted to **`BA-07`** & **`OP-15`** (`02-domains/business-analysis.md`, `01-identity/OPERATING-PRINCIPLES.md` — Progressive 2-tier onboarding `/start` + `/console` and post-build vault reflection)
