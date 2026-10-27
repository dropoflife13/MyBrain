---
type: gap-finder
version: 3
status: active
---
# Gap Finder

Owns coverage scoring, Self-Map deltas, next-session choice, and the contradiction queue.

## Coverage matrix (Updated after S-02 Gap Closure)
| Domain | Active rules | Sub-area coverage | Red flags | Patterns | Avg conf | Status |
|---|---|---|---|---|---|---|
| cybersec (CS) | 6 (`CS-01..06`) | 6 / 6 (100%) | 4 (`RF-01, 03, 04`) | 1 (`P-01`) | 4.2 | ok |
| solutions (SO) | 6 (`SO-01..06`) | 6 / 6 (100%) | 1 (`RF-03`) | 1 (`P-02`) | 4.2 | ok |
| business-analysis (BA) | 6 (`BA-01..06`) | 6 / 6 (100%) | 1 (`RF-04`) | 2 (`P-01, 03`) | 4.7 | ok |
| ui-frontend (UI) | 6 (`UI-01..06`) | 6 / 6 (100%) | 5 (`RF-02, 05..08`) | 2 (`P-02, 03`) | 4.8 | ok |
| cross (H / OP / TA) | 5 `H` + 14 `OP` + 13 `TA` | — | 8 total `RF` | 4 total `P` | 4.8 | rich |

Thresholds: **thin** < 5 active rules or avg conf < 3 · **ok** 5–12 rules and avg ≥ 3 · **rich** > 12 rules, avg ≥ 4, ≥ 2 red flags.

## Self-Map deltas
_All 24 domain sub-areas (6 per domain × 4 domains) are now calibrated at `Self: 3 | Demonstrated: 3` (`S-01`, `S-02`, `A-01..A-05`)._

## Open gaps for future sessions
_All initial gaps closed in `S-02`. Next trigger: log new candidates (`CAND-14+`) into `06-raw/inbox.md` when encountering a novel bug, waiver, or architectural trade-off in a live project._

## Contradiction queue
Format: `- **X-nn** <rule A> vs <rule B>: <conflict> | opened: S-nn | status: open|resolved`
- **X-01** `TA-02` (Studio 3D/Video Spectacle) vs `UX-13` (Low-End Mobile 60fps Usability) | opened: S-01 | status: resolved (`UI-05` / `P-02`: `UX-13` wins; auto-downgrade WebGL when FPS < 30 or reduced-motion).
- **X-02** `OP-05` (Strict Module Sandboxing) vs `OP-02` (Defensible Working MVP) | opened: S-01 | status: resolved (`H-02`: under unreachable-teammate emergency 30m before defense, isolate minimal fix on own branch and disclose in handoff log; never fake save).
- **X-03** `OP-08` (`submitter ≠ approver`) vs Solo Pilot Day-1 Onboarding (`active_staff_count == 1`) | opened: S-01 | status: resolved (`CS-02` / `P-01`: allow self-approval only while `active_staff_count == 1` with `approval_mode: solo_operator_waiver` logged in append-only audit trail).
