---
type: index
version: 3
status: active
---
# Brain — Index

A procedural vault: it stores *how I decide*, not only what I know. Rules are single lines with IDs; AI loads by tier.

## Loading Tiers (for AI)
| Tier | When | Files |
|---|---|---|
| 0 | always | `07-meta/DIGEST.md` (fallback `01-identity/OPERATING-PRINCIPLES.md`) |
| 1 | by task domain | `02-domains/<domain>.md` |
| 2 | on judgment calls | `03-heuristics/*`, `04-models/*`, `01-identity/TASTE.md` |
| 3 | only when asked | `05-elicitation/sessions/`, `06-raw/` |

Files with `status: empty` or `draft` are skipped; only `status: active` lines count as rules (BN-05).

## Brain ↔ Agent Suite Mapping
Active rules from the brain feed directly into the execution checklists in `agents/`:
- `01-identity/OPERATING-PRINCIPLES.md` (`OP-01..14`, Tier 0) → Governs all 7 agents (`PM`, `SD`, `DB`, `IR`, `UX`, `GR`, `SEC`).
- `01-identity/TASTE.md` (`TA-01..13`) → Feeds `uiuxagent.md` (`UX`) and `growthagent.md` (`GR`).
- `02-domains/business-analysis.md` (`BA-01..05`) → Feeds `productmanageragent.md` (`PM`).
- `02-domains/solutions.md` (`SO-01..05`) → Feeds `systemsdesignagent.md` (`SD`), `dbaagent.md` (`DB`), and `integrationagent.md` (`IR`).
- `02-domains/cybersec.md` (`CS-01..05`) → Feeds `securityagent.md` (`SEC`) and `dbaagent.md` (`DB`).
- `02-domains/ui-frontend.md` (`UI-01..05`) → Feeds `uiuxagent.md` (`UX`).

## Domain Map
| Domain | Prefix | File | Active rules | Avg conf | Coverage |
|---|---|---|---|---|---|
| Cybersecurity | CS | [[cybersec]] | 5 | 4.2 | ok |
| Solutions | SO | [[solutions]] | 5 | 4.2 | ok |
| Business Analysis | BA | [[business-analysis]] | 5 | 4.6 | ok |
| UI & Frontend | UI | [[ui-frontend]] | 5 | 4.8 | ok |
| Cross-Domain Heuristics | H / P / RF | [[HEURISTICS]] · [[PATTERNS]] · [[RED-FLAGS]] | 5 H · 4 P · 8 RF | 4.8 | rich |

Counts are refreshed by GAP-FINDER. Add a domain: see [[EXTENDING]].

## Folders
- `01-identity/` who I am as a practitioner (`ABOUT-ME.md`, `OPERATING-PRINCIPLES.md`, `TASTE.md`) · `02-domains/` per-specialty rules (`CS`, `SO`, `BA`, `UI`)
- `03-heuristics/` cross-domain judgment (`HEURISTICS.md`, `PATTERNS.md`, `RED-FLAGS.md`) · `04-models/` mental models
- `05-elicitation/` fast micro-triggers, artifact archaeology, session logs · `06-raw/` candidate inbox · `07-meta/` conventions, sync, extending, digest
