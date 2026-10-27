---
type: protocol
version: 2
status: active
---
# Artifact Archaeology

Mines habits from work already made: specs, diagrams, code structure, prompts, agent files, proposals, commit messages. Output: candidates with pointers and boundary probes. Session type F / Micro-Trigger 1.

## Rules
- **AA-01** Register every artifact below as A-nn before mining. Sanitize first (CV-09).
- **AA-02** Every observation cites a location (file, section, line).
- **AA-03** One artifact yields conf ≤ 2; a candidate needs ≥ 2 independent artifacts plus an explicit `breaks:` condition for conf 3 (CV-03).
- **AA-04** Describe what is there; never infer motive. Motive comes from asking the owner.
- **AA-05** Boundary Probe: *"When would this choice be wrong or break (`breaks:`), and what is the exact trigger where you would waive it?"*

## Artifact registry
| ID | Type | Location | Date | Sanitized |
|---|---|---|---|---|
| A-01 | Agent Suite & Bindings (MerkadoTrack) | `agents/*` | 2026-10-25 | yes |
| A-02 | Product & Technical Spec (Dugtong OJT) | `docs/Dugtong_OJT_Unified_Context.md` | 2026-10-26 | yes |
| A-03 | Creative Studio Spec (CITEMAS Portal) | `docs/CITEMAS_Portal_Architecture.md` | 2026-10-27 | yes |
| A-04 | 3D Synaptic Brain (Procedural Graph & GLB) | `lib/brainGraph.ts`, `public/synaptic_constellation_brain.glb` | 2026-10-27 | yes |
