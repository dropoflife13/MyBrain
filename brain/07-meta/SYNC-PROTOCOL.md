---
type: sync
version: 3
status: active
---
# Sync Protocol — Brain ↔ Project Agents

## Rules
- **SP-01** Project → Brain flows only through `06-raw/inbox.md`. Never edit registries directly from an active project PR or ticket.
- **SP-02** Brain → Project is normative for checklists: active domain rules feed into the execution checklists and hard gates of `agents/`. Brain rules never override an explicit project ADR or waiver.
- **SP-03** Brain rule vs agent rule conflict → escalate to the human. If the brain rule should win, record a waiver in the project citing the brain ID.
- **SP-04** The agent suite and brain are coupled via `/CLAUDE.md` at workspace root.
- **SP-05** Only Tier 0/1 files leave the vault. Sessions, raw notes, and unvetted candidates stay internal to the brain.
- **SP-06** (Global Pointer): To connect a new project to this vault, create a `CLAUDE.md` (or `.cursorrules`) file in the root of the new project.
- **SP-07** (Absolute Path): Use an absolute path to point to this vault (e.g., `C:/Users/neil/brain-web/brain/`). Do not copy the Markdown files; link to them so the project always reads your latest rules.
- **SP-08** Elicitation loop: gate failure or waiver in project → candidate logged in `06-raw/inbox.md` → fast micro-trigger excavation session → promoted rule into `02-domains/`.

## Connecting a New Project to the Cortex
- **Rule SP-06 (Global Pointer):** To connect a new project to this vault, create a `CLAUDE.md` (or `.cursorrules`) file in the root of the new project.
- **Rule SP-07 (Absolute Path):** Use an absolute path to point to this vault (e.g., `C:/Users/neil/brain-web/brain/`). Do not copy the Markdown files; link to them so the project always reads your latest rules.
- **Quick-Start Snippet:** Copy the template from `brain/07-meta/NEW-PROJECT-SNIPPET.md` into the new project's root `CLAUDE.md`.

## Brain ↔ Agent Suite Mapping
| Brain Source | Prefix | Feeds Agent | Enforced Scope |
|---|---|---|---|
| `01-identity/OPERATING-PRINCIPLES.md` | `OP` | **All 7 Agents** (Tier 0) | Core practitioner non-negotiables |
| `01-identity/TASTE.md` | `TA` | `uiuxagent.md` (`UX`), `growthagent.md` (`GR`) | Design refinement, restrained interactions, copy tone |
| `02-domains/business-analysis.md` | `BA` | `productmanageragent.md` (`PM`) | Multi-actor boundaries, spec conflict checks, MVP scoping |
| `02-domains/solutions.md` | `SO` | `systemsdesignagent.md` (`SD`), `dbaagent.md` (`DB`), `integrationagent.md` (`IR`) | Constraint-driven architecture, offline sync, write offloading |
| `02-domains/cybersec.md` | `CS` | `securityagent.md` (`SEC`), `dbaagent.md` (`DB`) | DB-enforced RLS, untrusted client inputs, two-party authz |
| `02-domains/ui-frontend.md` | `UI` | `uiuxagent.md` (`UX`) | Dumb primitives, token strictness, role views, honest data states |

## Project → Brain Triggers
- An agent Gate FAILs and reveals an undocumented judgment → candidate in `06-raw/inbox.md`.
- A design decision or architecture choice is reversed → schedule an Artifact Archaeology or Forced Triad session.
- A red flag fires in code review → candidate `RF-`.
- A waiver is granted against a brain rule → open an `X-nn` contradiction to probe boundary conditions (`breaks:`).
