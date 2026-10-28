---
type: inbox
version: 7
status: active
---
# Inbox — Unprocessed Candidates

Candidates only (`status: candidate`). Promotion is a human act (CV-03). Format: CV-02 with `CAND-nn` IDs. Every candidate at `conf ≥ 3` must have a concrete `breaks:` condition and real project `ev:`.

## Active Candidates
_Inbox clear. All initial candidates (`CAND-01..13`) and Cortex v2.4 post-build candidates (`CAND-14..20`) have been promoted to `status: active`. Append new discoveries from future projects below starting at `CAND-21`._

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
