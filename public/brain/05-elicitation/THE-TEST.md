---
type: test
version: 2
status: active
---
# The Test — Fast Excavation Modes

Purpose: surface tacit judgment, trade-off boundaries, and failure points (`breaks:`) without marathon sessions.
Replaces the 100-minute test with **three 7-minute micro-triggers**.

---

## The 3 Fast Excavation Micro-Triggers

### 1. Artifact Archaeology (7 Minutes) — Multi-Project Pattern & Boundary Probe
- **Goal:** Uncover recurring technical choices across independent projects and determine their exact breaking point.
- **Trigger:** Compare two real specs/schemas written across different projects (e.g. MerkadoTrack `A-01` vs Dugtong OJT `A-02`).
- **Probe:** Identify the recurring pattern, then demand:
  > *"When would this choice be wrong or break (`breaks:`), and what is the exact trigger where you would waive it?"*
- **Output:** Candidates for `inbox.md` with `conf: 3`, concrete `ev:`, and an explicit `breaks:` condition.

### 2. The Visceral Cringe Test (3 Minutes) — Taste & Red Flag Excavation
- **Goal:** Surface unconscious visual, architectural, and security standards.
- **Trigger:** Present a flawed code snippet, schema design, or UI component.
- **Rules:** The practitioner has 3 minutes to call out every red flag in the order noticed.
- **Probes:**
  - *"Which flaw did you notice first, and why?"*
  - *"What standard or invariant was violated?"*
  - *"Is this a hard security/data violation (`RF-`), or an aesthetic/craft violation (`TASTE.md`)?"*
- **Output:** Direct entries into `01-identity/TASTE.md` or `03-heuristics/RED-FLAGS.md`.

### 3. Forced Trade-Off Triads (30-Second Snap Decision) — Razor Excavation
- **Goal:** Determine priority hierarchies when two valid principles collide under real-world pressure.
- **Trigger:** Pit two stated principles against each other under an extreme constraint (e.g., tight deadline, degraded network, strict budget).
- **Rules:**
  - Practitioner must choose Option A or Option B in **30 seconds**. No "it depends" allowed initially.
  - Examiner immediately probes: *"What factor would make you flip your choice?"*
- **Output:** Extracts decision razors and priority weightings for `03-heuristics/PATTERNS.md` and `04-models/`.

---

## Examiner Invariants (TE-01 to TE-08)
- **TE-01** The examiner runs excavation modules in strict sequence without skipping pre-flight checks.
- **TE-02** Do not show an evaluation key before the module ends.
- **TE-03** Time limits are strict (7m archaeology, 3m cringe, 30s triads); halt filibustering.
- **TE-04** The examiner records verbatim quotes and tacit signals without coaching or correcting.
- **TE-05** Every candidate rule must include an explicit WHEN trigger, DO action, and breaks: waiver.
- **TE-06** When answers are vague, probe for the exact tipping factor (EP-01).
- **TE-07** Evaluation keys are diagnostic signals, not school answers; hunt the underlying razor.
- **TE-08** Never promote rules during test execution; all extractions route to inbox.md.

