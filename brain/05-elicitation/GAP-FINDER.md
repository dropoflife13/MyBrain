---
type: gap-finder
version: 4
status: active
---
# Gap Finder

Owns coverage scoring, Self-Map deltas, next-session choice, and the contradiction queue.

## Coverage matrix (Updated after S-03 Cortex v2.4 Excavation)
| Domain | Active rules | Sub-area coverage | Red flags | Patterns | Avg conf | Status |
|---|---|---|---|---|---|---|
| cybersec (CS) | 7 (`CS-01..07`) | 6 / 6 (100%) | 4 (`RF-01, 03, 04`) | 1 (`P-01`) | 4.3 | ok |
| solutions (SO) | 8 (`SO-01..08`) | 6 / 6 (100%) | 1 (`RF-03`) | 2 (`P-02, 05`) | 4.4 | ok |
| business-analysis (BA) | 7 (`BA-01..07`) | 6 / 6 (100%) | 1 (`RF-04`) | 3 (`P-01, 03, 05`) | 4.7 | ok |
| ui-frontend (UI) | 9 (`UI-01..09`) | 6 / 6 (100%) | 7 (`RF-02, 05..10`) | 2 (`P-02, 03`) | 4.9 | ok |
| cross (H / OP / TA) | 6 `H` + 15 `OP` + 14 `TA` | — | 10 total `RF` | 5 total `P` | 4.9 | rich |

Thresholds: **thin** < 5 active rules or avg conf < 3 · **ok** 5–12 rules and avg ≥ 3 · **rich** > 12 rules, avg ≥ 4, ≥ 2 red flags.

## Self-Map deltas
_All 24 domain sub-areas (6 per domain × 4 domains) plus Cortex v2.4 WebGL/Gate invariants are calibrated at `Self: 3 | Demonstrated: 3` (`S-01`, `S-02`, `S-03`, `A-01..A-06`)._

## Open gaps for future sessions
_All initial and Cortex v2.4 post-build gaps closed in `S-03`. Next trigger: log new candidates (`CAND-21+`) into `06-raw/inbox.md` when encountering a novel bug, waiver, or architectural trade-off in a live project._

## Contradiction queue
Format: `- **X-nn** <rule A> vs <rule B>: <conflict> | opened: S-nn | state: open|resolved ^x-nn`
- **X-01** `TA-02` (Studio 3D/Video Spectacle) vs `UX-13` (Low-End Mobile 60fps Usability) | opened: S-01 | state: resolved (`UI-05` / `P-02`: `UX-13` wins; auto-downgrade WebGL when FPS < 30 or reduced-motion) ^x-01
- **X-02** `OP-05` (Strict Module Sandboxing) vs `OP-02` (Defensible Working MVP) | opened: S-01 | state: resolved (`H-02`: under unreachable-teammate emergency 30m before defense, isolate minimal fix on own branch and disclose in handoff log; never fake save) ^x-02
- **X-03** `OP-08` (`submitter ≠ approver`) vs Solo Pilot Day-1 Onboarding (`active_staff_count == 1`) | opened: S-01 | state: resolved (`CS-02` / `P-01`: allow self-approval only while `active_staff_count == 1` with `approval_mode: solo_operator_waiver` logged in append-only audit trail) ^x-03
- **X-04** Manual `camera.position.lerp()` Focus Framing vs `OrbitControls.autoRotate` Continuous Spin | opened: S-03 | state: resolved (`UI-07` / `RF-09`: `OrbitControls` exclusively owns continuous 360° orbit; `camera.position.lerp()` runs only while `autoRotate` is paused on a locked node) ^x-04
- **X-05** Ready-to-Use Open-Source Fork vs Authentic Personal Judgment (`BN-01`) | opened: S-03 | state: resolved (`SO-07` / `P-05`: ship all 7 Agent Gatekeepers intact so `BN-00` passes, but strip personal rules to `0` in blank-slate mode so every adopter earns their own rules via `THE-TEST.md`) ^x-05
