---
type: workflow
version: 2.0.0
status: active
name: The Golden Path Pipeline
tags: [workflow, sdlc, golden-path, pipeline]
---

# The Golden Path Pipeline (The 8 Commands)

The "Golden Path" AI-assisted Software Factory workflow. Rather than unconstrained stochastic code generation, Cortex executes a sequential SDLC pipeline that enforces the 8-Agent execution gate suite and deterministic sandbox validation at every step:

1. **/grill [idea]**: Read `productmanageragent.md`. Interrogate the problem, uncover edge cases, challenge assumptions, and cut 30% scope. Formulate strict Acceptance Criteria before writing any code.
2. **/pitch [idea]**: Read `growthagent.md` and `productmanageragent.md`. Synthesize the core value proposition, market positioning, and write a crisp 3-minute pitch.
3. **/to-spec [context]**: Read `systemsdesignagent.md`, `dbaagent.md`, and `authorization.md`. Author the Technical Requirements Document (TRD), data model, failure domains, and authorization policy (PDP/PEP).
4. **/to-tickets [spec]**: Read `productmanageragent.md` and `systemsdesignagent.md`. Decompose the TRD into sequential, atomic implementation tickets with explicit dependencies.
5. **/implement [ticket]**: Read `dbaagent.md`, `securityagent.md`, and `integrationagent.md`. Write code verified by the 3-Stage Deterministic Compiler (extraction -> lexical static gate -> isolated sandbox unit test run).
6. **/review [target]**: Read `securityagent.md` and `systemsdesignagent.md`. Execute a rigorous STRIDE security review, invariant verification, and pre-flight check against `BN-00` rules.
7. **/harden [target]**: Read `dbaagent.md`, `securityagent.md`, and `authorization.md`. Run an adversarial audit: attack RLS policies, probe race conditions on counters/stock (`DB-13`), multi-tenant isolation (`DB-14`), server-side redaction (`SEC-14`), and cache-control headers (`SEC-15`).
8. **/research [topic]**: Read `agents/researchagent.md`. Enforces epistemologist rules (`RS-01` to `RS-04` and `ARB-07`): verify primary sources, triangulate citations, ground in first principles, and halt with "WARNING: I do not have verified data for this. Hallucination risk is high. Please provide a source." when context is missing.
9. **/retro [session]**: Post-implementation excavation: record tacit lessons, failure edges (`breaks:`), update brain vault staging (`brain/06-raw/inbox.md`), and verify zero rule drift.
