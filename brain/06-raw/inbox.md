---
type: inbox
version: 3
status: active
---
# Inbox — Unprocessed Candidates

Candidates only (`status: candidate`). Promotion is a human act (CV-03). Format: CV-02 with `CAND-nn` IDs. Every candidate at `conf ≥ 3` must have a concrete `breaks:` condition and real project `ev:`.

## Active Candidates (Extracted from A-01, A-02, A-03, A-04, A-05 & S-01)

- **CAND-01** WHEN storing critical domain entities (prices, attendance, financial ledgers, grades, audit logs) → DO revoke UPDATE/DELETE/TRUNCATE at DB level and record revisions as new rows with supersedes_id and timestamp | why: non-repudiation and audit integrity | breaks: high-frequency streaming telemetry exceeding write-scaling budget (>10k writes/sec without log compaction) OR statutory right-to-be-forgotten deletion mandates where cryptographic shredding is disallowed | conf: 3 | ev: A-01 (DB-01), A-02 (Sec 9.4, 12.3), A-05 (CITEMAS Treasurer) | status: candidate #append-only ^cand-01

- **CAND-02** WHEN high-impact status transitions occur (price outlier approval, partnership activation, intern journal signoff, adviser verification) → DO enforce submitter ≠ approver and restrict approval action exclusively to recipient or elevated role | why: eliminate self-approval fraud and single-actor collusion | breaks: single-operator / solo pilot deployments with zero redundant personnel OR emergency break-glass procedures where waiting for a second party causes catastrophic downtime | conf: 3 | ev: A-01 (SEC-05), A-02 (Sec 12.3), A-03 (Sec 6.1), A-05 (CITEMAS VP/Treasurer) | status: candidate #two-party ^cand-02

- **CAND-03** WHEN authoring reusable UI primitives (buttons, tables, cards, dialogs, badges) → DO keep them pure, data-driven, and prop-controlled with zero DB, Supabase, or fetch logic and never fake saves | why: strict separation of concerns, testability, and honest data states | breaks: self-contained encapsulated widget micro-apps (e.g. standalone 3D interactive viewer canvas, embeddable feedback tools) where prop-drilling through deep trees creates severe coupling overhead | conf: 3 | ev: A-01 (UX-07), A-02 (Sec 10.1, 12.3.1), A-05 (Godot data-driven systems) | status: candidate #dumb-primitives ^cand-03

- **CAND-04** WHEN implementing dark/light dual-theme engines → DO inject an uncompiled synchronous script in <head> to read storage and set class before initial paint | why: eliminate blinding white flashes (FOUC) on dark mode users | breaks: non-browser SSR pipelines without client storage (PDF generators, email rendering) OR hyper-strict CSP environments that reject all inline scripts without nonce/hash pipelines | conf: 3 | ev: A-01 (UX-01), A-02 (Sec 10.4), A-03 (Sec 4.4) | status: candidate #zero-fouc ^cand-04

- **CAND-05** WHEN rendering interactive 3D web centerpieces or hover video reels under bandwidth constraints → DO use procedural code/math geometry (<50KB) or DOM-persistent preloaded containers (`grid-rows-[0fr]` → `[1fr]`) rather than heavy on-demand network mounts | why: instant 60fps first-paint and zero black-flash rebuffering | breaks: visual designs requiring photorealistic PBR surface texturing, skinned skeletal character animations, or long-form streaming video (>60s) where DOM preloading exhausts memory | conf: 3 | ev: A-03 (Sec 2.1, Sec 3), A-04 (brainGraph.ts) | status: candidate #procedural-3d ^cand-05

- **CAND-06** WHEN displaying current operational balances (retail stock, current market prices, total approved OJT hours) → DO compute or materialize them exclusively from verified batch/transaction logs rather than overwriting a mutable summary integer in-place | why: prevents silent stock/hour drift and preserves expiration/audit lineage | breaks: non-auditable high-velocity ephemeral counters (e.g. live pageview tickers) where batch lineage has zero business value | conf: 3 | ev: A-05 (Agrivet), A-01 (DB-02), A-02 (Sec 12.3.1) | status: candidate #derived-state ^cand-06

- **CAND-07** WHEN modeling multi-actor workflow lifecycles (partnership requests, org applications, offline sync queues) → DO enforce a strict finite state machine of canonical states (`requested → accepted | declined`) and reject arbitrary status strings or unauthorized jumps | why: eliminates impossible intermediate states and happy-path-only bugs | breaks: user-customizable kanban/workflow builders where end-users define ad-hoc stages at runtime | conf: 3 | ev: A-05 (Godot state machines), A-01 (IR-04), A-02 (Sec 12.3), A-03 (Sec 6) | status: candidate #state-machine ^cand-07

- **CAND-08** WHEN kicking off a multi-contributor build or preparing a system for panel/judge defense → DO lock a module ownership matrix ("Owns" vs "Must not independently change") and build the mitigation for the panel's hardest attack directly into the MVP flow | why: prevents shared-codebase overwrites and pre-empts panel interrogation | breaks: solo 2-hour throwaway prototypes that will never be merged or defended | conf: 3 | ev: A-05 (FlexSpace Capstone, Shark Tank), A-01, A-02 (Sec 12, 14) | status: candidate #defense-preemption ^cand-08
