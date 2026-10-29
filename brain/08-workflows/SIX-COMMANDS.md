---
type: workflow
version: 1.0.0
status: active
name: The Six Commands Pipeline
tags: [workflow, sdlc, golden-path, pipeline]
---

# The Six Commands Pipeline

The "Golden Path" AI-assisted Software Factory workflow. Rather than reactive questioning, Cortex executes a sequential SDLC pipeline that enforces the 7-Agent execution gate suite at every step:

1. **/grill**: Read `productmanageragent.md`. Interrogate the problem, uncover edge cases, and challenge assumptions. Ask 5 hard questions about the app idea before writing any code.
2. **/pitch**: Read `growthagent.md` and `productmanageragent.md`. Synthesize the core value proposition and write a crisp 3-minute pitch to sell the idea.
3. **/to-spec**: Read `systemsdesignagent.md`, `dbaagent.md`, and `authorization.md`. Draft the architecture, data model, and authorization strategy.
4. **/to-tickets**: Read `productmanageragent.md`. Decompose the specification into 5 sequential, atomic implementation tickets. Enforce that coding does not begin prematurely.
5. **/implement**: Read `dbaagent.md`, `securityagent.md`, and `integrationagent.md`. Write the production-ready code for Ticket 1 adhering strictly to append-only ledgers and RLS defaults.
6. **/review**: Read `securityagent.md` and `systemsdesignagent.md`. Execute a rigorous STRIDE security review, invariant verification, and check against BN-00 rules.
7. **/harden**: Read `dbaagent.md`, `securityagent.md`, and `authorization.md`. Run an enterprise security and database hardening audit. Audit the authorization strategy (checking AUTH-01 through AUTH-05), check for race conditions on counters/stock (DB-13), multi-tenant isolation (DB-14), server-side redaction (SEC-14), and cache-control headers for private data (SEC-15).
8. **/research [topic]**: Read `agents/researchagent.md`. Forces the AI to use `researchagent.md` rules (`RS-01` to `RS-04`), verify facts, cite primary sources, triangulate claims across independent references, and explicitly state "WARNING: I do not have verified data for this. Hallucination risk is high. Please provide a source." when verified data is missing.

