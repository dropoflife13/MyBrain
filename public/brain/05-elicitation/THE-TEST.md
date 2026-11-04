---
type: test
version: 3
status: active
---
# The Test — Diagnostic Excavation Modules

Purpose: surface tacit judgment, trade-off boundaries, and failure points (`breaks:`) without marathon sessions. Evaluates models and human practitioners across software engineering and the 29-Domain Global Knowledge Graph.

---

## The 10 Diagnostic Test Modules (T1 to T10)

### T1 — Flash Judgment (≤ 30 Seconds)
- **Format:** Immediate one-line decision under high time pressure.
- **Probe:** *"What is your first move, and what is your one-line reason?"*
- **Domains Covered:** Core Engineering (`CS`, `SO`, `BA`, `UI`), plus Global Domains (`LAW`, `FIN`, `PSY`).

### T2 — Flaw Hunt
- **Format:** Present a realistic, seemingly complete architecture or policy document with subtle, lethal omissions.
- **Probe:** *"Identify every architectural flaw, hidden vulnerability, or unhandled edge case in order of severity."*

### T3 — Compliant-but-Wrong
- **Format:** A solution that satisfies surface compliance (e.g. SOC 2 or regulatory checkboxes) but fails real operational invariants.
- **Probe:** *"This passes standard regulatory review; explain why it is operationally or structurally flawed."*

### T4 — Priority Ranking
- **Format:** Forced ranking of 3–5 conflicting priorities under resource famine or active attack.
- **Probe:** *"Rank these actions from 1 to 4; justify what you sacrifice first."*

### T5 — Artifact Archaeology
- **Format:** Comparison of two historical artifacts or code repositories across projects (`A-01` through `A-06`).
- **Probe:** *"What invariant was carried over, and what was completely inverted based on learned failure boundaries?"*

### T6 — Boundary Hunter (`breaks:`)
- **Format:** Take a stated high-confidence rule (`conf: 5`) and demand its falsification condition.
- **Probe:** *"Describe the exact real-world scenario where following this rule results in catastrophic failure or must be waived."*

### T7 — The Visceral Cringe Test (3 Minutes)
- **Format:** Fast aesthetic, architectural, and ethical smell-test.
- **Probe:** *"Which anti-pattern or visual/code slop did you notice first, and why does it break high-craft standards?"*

### T8 — Cross-Pollination & Domain Synthesis
- **Format:** Evaluating a deliverable in one domain using the lens of an opposing domain.
- **Probe:** *"Review this Business Analysis specification using a pure Cybersecurity lens (`CS`), or review this UI workflow using Cognitive Psychology (`PSY`). What does it flag?"*

### T9 — Memory Excavation
- **Format:** Retrieval of battle-tested heuristics from real-world project deployments.
- **Probe:** *"When did you last say 'this will fail' and turn out right? What exact signal tipped you off?"*

### T10 — Global Domain Benchmark
- **Format:** Direct probing of non-software domains across the 4 Clusters:
  - **Humanities:** Epistemic grounding in Philosophy (`PHI-01`), behavioral biases in Psychology (`PSY-01`), classical rhetoric framing (`RHE-01`).
  - **Global & Society:** Contractual liability under Law (`LAW-01`), monetary dynamics in Economy (`ECO-01`), cryptographic consensus in Crypto (`CRY-01`).
  - **Science:** Clinical evidence hierarchies in Medicine (`MED-01`), empirical falsifiability in Science (`SCI-01`).
- **Probe:** *"Explain the first-principles invariant governing this situation outside software engineering."*

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
