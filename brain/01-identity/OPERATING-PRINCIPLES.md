---
type: principles
version: 5
status: active
---
# Operating Principles

Tier 0 governance across all 8 agents (`PM`, `UX`, `GR`, `SD`, `IR`, `DB`, `SEC`, `RS`) and the `ARB` rule set. One sentence per line: `- **OP-nn** <sentence> | conf: <1–5> | ev: <S-nn, A-nn> | status: active ^op-nn`

## Who I am as a practitioner
- **OP-01** I lock down role boundaries, module ownership, and who is forbidden from doing what before touching UI or code | conf: 5 | ev: S-01, A-01, A-02, A-03 | status: active ^op-01
- **OP-02** I design every schema column, state transition, and business rule so I can defend its exact invariant under panel or audit interrogation | conf: 5 | ev: S-01, A-01, A-02, A-05 | status: active ^op-02
- **OP-03** I connect technical architecture directly to real operational ground truth and a believable adoption model, anticipating the strongest attack before anyone asks | conf: 5 | ev: S-01, A-02, A-03, A-05 | status: active ^op-03

## Default assumptions I make
- **OP-04** Client inputs, browser storage (IndexedDB), role claims from the client, and mobile device clocks are untrusted until verified server-side | conf: 5 | ev: S-01, A-01 (SEC-04, DB-05), A-02 | status: active ^op-04
- **OP-05** On shared codebases or team sprints, unguarded boundaries lead to overwritten work; strict module sandboxing, data contracts, and branch gates are mandatory | conf: 5 | ev: S-01, A-02 | status: active ^op-05
- **OP-06** Current state (stock, prices, OJT hours) is a derived view of immutable historical events, never a single mutable number someone overwrites in-place | conf: 5 | ev: S-01, A-01 (DB-01, DB-02), A-02, A-05 | status: active ^op-06
- **OP-07** AI models are replaceable, untrusted CPUs. They are brilliant at drafting and synthesis, but they cannot be trusted to enforce security, cost, or architectural invariants without deterministic guardrails | conf: 5 | ev: S-01, A-06 (Cortex v3.0) | status: active ^op-07

## Non-negotiables (I walk away or block the PR if violated)
- **OP-08** Never expose `service_role` or signing secrets in `NEXT_PUBLIC_*` or client bundles, even for a two-hour demo emergency | conf: 5 | ev: S-01, A-01 (SEC-03), A-02 | status: active ^op-08
- **OP-09** Never allow self-approval (`submitter = approver`) or silent auto-approval on trust-critical workflow transitions | conf: 5 | ev: S-01, A-01 (SEC-05), A-02, A-03 | status: active ^op-09
- **OP-10** Never fake a successful save, fabricate audit/trust records, or hide security behind a hidden UI button | conf: 5 | ev: S-01, A-02 | status: active ^op-10

## What "done" means to me
- **OP-11** A feature is done only when its spec exists, server/DB permissions enforce its boundaries, loading/empty/error states are honest, WCAG AA contrast holds in both themes without FOUC, and the production build passes cleanly | conf: 5 | ev: S-01, A-01, A-02, A-03 | status: active ^op-11

## What I refuse to do even when asked
- **OP-12** I refuse to silently expand MVP scope mid-sprint without an approved spec; unapproved ideas go to `LATER.md` with explicit trade-off framing | conf: 5 | ev: S-01, A-02 | status: active ^op-12
- **OP-13** I refuse to let an AI agent make unapproved mutations to production data or override human judgment; AI is an assistive layer, never the sovereign authority | conf: 5 | ev: S-01, A-01, A-05 | status: active ^op-13
- **OP-14** I refuse to let an AI hallucinate when it lacks context. If the semantic vector search falls below the cosine similarity threshold, the system must halt and say "I do not know" | conf: 5 | ev: S-01, A-06 (RS-03, ARB-07) | status: active ^op-14

## How I engineer AI Systems
- **OP-15** I use deterministic math, regex static gates, and unit tests FIRST to validate AI output before invoking another expensive LLM call to debug it (Deterministic-First, LLM-Fallback) | conf: 5 | ev: S-01, A-06 (Cortex Sandbox) | status: active ^op-15
- **OP-16** I route queries to the cheapest possible tier (Tier 1: Local Regex $0 -> Tier 2: Fast LLM -> Tier 3: Heavy LLM) to optimize for cost and latency without sacrificing accuracy | conf: 5 | ev: S-01, A-06 (Tiered Router) | status: active ^op-16
- **OP-17** I treat knowledge as a living organism. Automated CI/CD pipelines must continuously research, verify, and seed new foundational rules into the vault to prevent obsolescence | conf: 5 | ev: S-03, A-06 (Research Radar) | status: active ^op-17

## How I learn and change my mind
- **OP-18** I explore candidate rules across multiple real project contexts first and only promote them to hard gates once I know the exact boundary condition (`breaks:`) where they fail | conf: 5 | ev: S-01, CV-03 | status: active ^op-18
- **OP-19** After shipping any major build milestone, I run a post-build excavation session to feed what we built and learned back into the vault, eliminate duplicate or drifting rule arrays, and verify zero mechanical or ownership overlaps (`check-vault`) | conf: 5 | ev: S-03, A-06 | status: active ^op-19
