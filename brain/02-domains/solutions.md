---
domain: solutions
prefix: SO
version: 2
status: draft
---
# Solutions Specialist — How I Think

## My first move
_What I do in the first 10 minutes on an architecture blank page or stack constraint._

## Default lens
_Rank and keep the order: real-world constraints · data invariants · async write offloading · offline/sync reconciliation · failure blast radius._

## Sub-areas (Self-Map)
Self: 0 never touched · 1 aware · 2 can do with reference · 3 can teach or do unaided.
Demonstrated (set by the examiner, cite S-nn): 0 none · 1 mentioned · 2 applied correctly once · 3 applied repeatedly with conditions.

| Area | Self (0–3) | Demonstrated (0–3) | Evidence |
|---|---|---|---|
| Constraint-driven architecture (low-cost, no-Docker, pinned stacks) | | | |
| Offline-first & sync reconciliation (outbox, idempotency, clock skew) | | | |
| Append-only storage & materialized read views | | | |
| Asynchronous processing & write offloading (debounced triggers, queues) | | | |
| Integration boundaries & strict RPC contracts | | | |
| Pragmatic scale limits (simple early vs breaking at 10×) | | | |

## Rules
Grammar: CV-02. IDs `SO-nn`. Mandatory `breaks:` condition for conf ≥ 3. Concrete `ev:` only.
_None yet._

## Open questions (gaps to elicit)
- [ ] When does an append-only table cause unsustainable storage or query bloat?
- [ ] How do I resolve clock skew between client `observed_at` and server `received_at`?
- [ ] What is the signal to transition from synchronous write to outbox queue?
