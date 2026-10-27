---
type: principles
version: 4
status: active
---
# Operating Principles

Tier 0 governance across all 7 agents (`PM`, `SD`, `DB`, `IR`, `UX`, `GR`, `SEC`). One sentence per line: `- **OP-nn** <sentence> | conf: <1–5> | ev: <S-nn, A-nn> | status: active ^op-nn`

## Who I am as a practitioner
- **OP-01** I lock down role boundaries, module ownership, and who is forbidden from doing what before touching UI or code | conf: 5 | ev: S-01, A-01, A-02, A-03 | status: active ^op-01
- **OP-02** I design every schema column, state transition, and business rule so I can defend its exact invariant under panel or audit interrogation | conf: 5 | ev: S-01, A-01, A-02, A-05 (FlexSpace) | status: active ^op-02
- **OP-03** I connect technical architecture directly to real operational ground truth and a believable adoption model, anticipating the strongest attack before anyone asks | conf: 5 | ev: S-01, A-02, A-03, A-05 (Shark Tank, CITEMAS VP/Treasurer) | status: active ^op-03

## Default assumptions I make
- **OP-04** Client inputs, browser storage (IndexedDB), role claims from the client, and mobile device clocks are untrusted until verified server-side | conf: 5 | ev: S-01, A-01 (SEC-04, DB-05), A-02 (Sec 9.4) | status: active ^op-04
- **OP-05** On shared codebases or team sprints, unguarded boundaries lead to overwritten work; strict module sandboxing, data contracts, and branch gates are mandatory | conf: 5 | ev: S-01, A-02 (Sec 12, 14) | status: active ^op-05
- **OP-06** Current state (stock, prices, OJT hours) is a derived view of immutable historical events, never a single mutable number someone overwrites in-place | conf: 5 | ev: S-01, A-01 (DB-01, DB-02), A-02, A-05 (Agrivet) | status: active ^op-06

## Non-negotiables (I walk away or block the PR if violated)
- **OP-07** Never expose `service_role` or signing secrets in `NEXT_PUBLIC_*` or client bundles, even for a two-hour demo emergency | conf: 5 | ev: S-01, A-01 (SEC-03), A-02 (Rule 4) | status: active ^op-07
- **OP-08** Never allow self-approval (`submitter = approver`) or silent auto-approval on trust-critical workflow transitions | conf: 5 | ev: S-01, A-01 (SEC-05), A-02 (Sec 12.3), A-03 (Sec 6.1) | status: active ^op-08
- **OP-09** Never fake a successful save, fabricate audit/trust records, or hide security behind a hidden UI button | conf: 5 | ev: S-01, A-02 (Sec 10.1, 10.9) | status: active ^op-09

## What "done" means to me
- **OP-10** A feature is done only when its spec exists, server/DB permissions enforce its boundaries, loading/empty/error states are honest, WCAG AA contrast holds in both themes without FOUC, and the production build passes cleanly | conf: 5 | ev: S-01, A-01, A-02 (Sec 10.11), A-03 | status: active ^op-10

## What I refuse to do even when asked
- **OP-11** I refuse to silently expand MVP scope mid-sprint without an approved spec; unapproved ideas go to `LATER.md` with explicit trade-off framing | conf: 5 | ev: S-01, A-02 (Rule 2, Rule 3) | status: active ^op-11
- **OP-13** AI provides the necessary help to optimize my workflow, point out my inconsistencies, and fix what is needed, but must never overlap on or override my human judgment and data | conf: 5 | ev: S-01 (Step 3 verbatim), A-01, A-05 (DICT-ITU AI) | status: active ^op-13
- **OP-14** Use deterministic math and statistical baselines first (z-score/median/MAD, regex, Zod schemas) before reaching for an LLM API, and keep AI strictly as an assistive insight layer rather than an unapproved mutator of production data | conf: 5 | ev: S-01, A-01 (SEC-05), A-05 (DICT-ITU Data Science) | status: active ^op-14

## How I learn and change my mind
- **OP-12** I explore candidate rules across multiple real project contexts first and only promote them to hard gates once I know the exact boundary condition (`breaks:`) where they fail | conf: 5 | ev: S-01, CV-03 | status: active ^op-12
- **OP-15** After shipping any major build milestone, I run a post-build excavation session to feed what we built and learned back into the vault, eliminate duplicate or drifting rule arrays, and verify zero mechanical or ownership overlaps (`check-vault`) | conf: 5 | ev: S-03, A-06 | status: active ^op-15
