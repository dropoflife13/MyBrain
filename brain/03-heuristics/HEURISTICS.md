---
type: heuristics
version: 2
status: active
---
# Heuristics — Cross-Domain Judgment

Rules that apply across domains. Grammar: CV-02. Active requires conf ≥ 3 and an explicit `breaks:` condition (CV-03). IDs: `H-nn`.

## Rules

- **H-01** WHEN integrating AI or automated analytics into a product or personal workflow → DO run deterministic math and statistical baselines first (`z-score`/median/MAD, regex, Zod schemas) and restrict AI to an assistive insight/review layer that points out inconsistencies without overlapping or overriding human judgment and ground-truth data | why: deterministic rules are fast, auditable, and predictable; human judgment must own the final state | breaks: purely generative creative ideation sandboxes where no canonical operational record is mutated | conf: 5 | ev: S-01 (Step 3.1), A-01 (SEC-05), A-03 (Sec 6.2), A-05 (DICT-ITU AI/Data Science) | status: active #ai-boundary ^h-01

- **H-02** WHEN a teammate's backend endpoint breaks on the critical 3-minute MVP path right before a live defense and they are unreachable → DO isolate a minimal backend fix on your own working branch and disclose the cross-boundary intervention in the handoff log (`OP-02 > OP-05`), never faking the save in UI (`OP-09`) or force-pushing to `main` | why: real working truth beats module silos in an emergency, while branch isolation and disclosure preserve team trust | breaks: when the teammate is reachable or when the fix requires production credentials/migrations you are not authorized to run | conf: 4 | ev: S-01 (Triad 2), A-02 (Sec 10.1, 12, 14) | status: active #emergency-razor ^h-02

- **H-03** WHEN dividing responsibility across agents, documentation files, or code modules → DO give every rule or data contract a single canonical owner and reference its stable ID (`DB-01`, `SEC-05`, `CV-02`) elsewhere instead of restating or duplicating it | why: duplicated rules drift out of sync across files and cause contradictory reviews | breaks: standalone single-file handoff briefs exported for external judges who do not have access to the full repository | conf: 5 | ev: S-01, A-01, A-02, A-05 (FlexSpace Capstone) | status: active #single-owner ^h-03

- **H-04** WHEN designing a reviewing agent or quality check → DO separate blocking **Gate Mode** (hard invariants that halt PR/release on failure) from non-blocking **Insight Mode** (advisory optimizations and unexplored candidates) | why: mixing suggestions with hard blockers either causes alert fatigue or lets critical security flaws slip through | breaks: exploratory throwaway sandboxes where all checks are intentionally advisory | conf: 5 | ev: S-01, A-01 (Sec 5 across all 7 agents), CLAUDE.md | status: active #gate-vs-insight ^h-04

- **H-05** WHEN hitting the same build or runtime error twice in a row → DO stop immediately, state what was tried and the likely root cause in plain English, and align before attempting a third variation | why: blind trial-and-error loops compound technical debt and risk corrupting shared working trees | breaks: deterministic syntax/lint auto-fixes where each iteration resolves a distinct compiler line | conf: 4 | ev: A-02 (Working with this team), S-01 | status: active #stop ^h-05
