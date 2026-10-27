---
type: inbox
version: 2
status: active
---
# Inbox — Unprocessed Candidates

Candidates only (`status: candidate`). Promotion is a human act (CV-03). Format: CV-02 with `CAND-nn` IDs. Every candidate at `conf ≥ 3` must have a concrete `breaks:` condition and real project `ev:`.

## Active Candidates (Extracted from A-01, A-02, A-03, A-04)

- **CAND-01** WHEN storing critical domain entities (prices, attendance, financial ledgers, grades, audit logs) → DO revoke UPDATE/DELETE/TRUNCATE at DB level and record revisions as new rows with supersedes_id and timestamp | why: non-repudiation and audit integrity | breaks: high-frequency streaming telemetry exceeding write-scaling budget (>10k writes/sec without log compaction) OR statutory right-to-be-forgotten deletion mandates where cryptographic shredding is disallowed | conf: 3 | ev: A-01 (DB-01), A-02 (Sec 9.4, 12.3) | status: candidate #append-only ^cand-01

- **CAND-02** WHEN high-impact status transitions occur (price outlier approval, partnership activation, intern journal signoff, adviser verification) → DO enforce submitter ≠ approver and restrict approval action exclusively to recipient or elevated role | why: eliminate self-approval fraud and single-actor collusion | breaks: single-operator / solo pilot deployments with zero redundant personnel OR emergency break-glass procedures where waiting for a second party causes catastrophic downtime | conf: 3 | ev: A-01 (SEC-05), A-02 (Sec 12.3), A-03 (Sec 5) | status: candidate #two-party ^cand-02

- **CAND-03** WHEN authoring reusable UI primitives (buttons, tables, cards, dialogs, badges) → DO keep them pure and prop-driven with zero DB, Supabase, or fetch logic and never fake saves | why: strict separation of concerns, testability, and honest data states | breaks: self-contained encapsulated widget micro-apps (e.g. standalone 3D interactive viewer canvas, embeddable feedback tools) where prop-drilling through deep trees creates severe coupling overhead | conf: 3 | ev: A-01 (UX-07), A-02 (Sec 10.1, 12.3.1) | status: candidate #dumb-primitives ^cand-03

- **CAND-04** WHEN implementing dark/light dual-theme engines → DO inject an uncompiled synchronous script in <head> to read storage and set class before initial paint | why: eliminate blinding white flashes (FOUC) on dark mode users | breaks: non-browser SSR pipelines without client storage (PDF generators, email rendering) OR hyper-strict CSP environments that reject all inline scripts without nonce/hash pipelines | conf: 3 | ev: A-01 (UX-01), A-02 (Sec 10.4), A-03 (Sec 4.4) | status: candidate #zero-fouc ^cand-04

- **CAND-05** WHEN rendering interactive 3D web centerpieces under bandwidth or latency constraints → DO generate geometry procedurally via code/splines or mathematical point clouds rather than shipping multi-megabyte GLTF/GLB models | why: instant 60fps first-paint without network buffering or multi-megabyte asset downloads | breaks: visual designs requiring photorealistic PBR surface texturing, lightmaps, skinned/rigged skeletal character animations, or complex CAD manufacturing geometry | conf: 3 | ev: A-03 (Sec 2.1), A-04 (brainGraph.ts) | status: candidate #procedural-3d ^cand-05`
