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
3. **/to-spec**: Read `systemsdesignagent.md`. Transform the idea into a technical PRD with As-Is/To-Be architectures, failure modes, and strict non-goals.
4. **/to-tickets**: Read `productmanageragent.md`. Decompose the specification into 5 sequential, atomic implementation tickets. Enforce that coding does not begin prematurely.
5. **/implement**: Read `dbaagent.md`, `securityagent.md`, and `integrationagent.md`. Write the production-ready code for Ticket 1 adhering strictly to append-only ledgers and RLS defaults.
6. **/review**: Read `securityagent.md` and `systemsdesignagent.md`. Execute a rigorous STRIDE security review, invariant verification, and check against BN-00 rules.

