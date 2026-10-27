---
domain: ui-frontend
prefix: UI
version: 1
status: draft
---
# UI & Frontend Specialist — How I Think

## My first move
_What I do in the first 10 minutes when building a screen, component primitive, or theme foundation._

## Default lens
_Rank and keep the order: dumb primitives · centralized tokens · role-aware views · honest states · accessibility & restrained interaction · safe feedback._

## Sub-areas (Self-Map)
Self: 0 never touched · 1 aware · 2 can do with reference · 3 can teach or do unaided.
Demonstrated (set by the examiner, cite S-nn): 0 none · 1 mentioned · 2 applied correctly once · 3 applied repeatedly with conditions.

| Area | Self (0–3) | Demonstrated (0–3) | Evidence |
|---|---|---|---|
| Centralized design tokens & theme consistency (zero raw hex in components) | | | |
| Dumb prop-driven primitives vs smart containers (zero DB/network in UI) | | | |
| Role-aware navigation & responsive shell (desktop sidebar / mobile drawer) | | | |
| Honest data states & perceived perf (skeletons matching layout, no fake saves) | | | |
| Restrained interaction & accessibility (WCAG AA, solid darkening, no bounce) | | | |
| Safe form ergonomics & destructive confirmation (dialogs, undo toasts) | | | |

## Rules
Grammar: CV-02. IDs `UI-nn`. Mandatory `breaks:` condition for conf ≥ 3. Concrete `ev:` only.
_None yet._

## Open questions (gaps to elicit)
- [ ] When is a component allowed to fetch its own data instead of receiving props?
- [ ] What is the exact boundary where an optimistic UI update is forbidden?
- [ ] When does WCAG AA compliance clash with high-density data tables, and how do I resolve it?

