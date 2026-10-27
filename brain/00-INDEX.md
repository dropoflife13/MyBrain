---
type: index
version: 2
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
- `01-identity/OPERATING-PRINCIPLES.md` (Tier 0) → Governs all 7 agents (`PM`, `SD`, `DB`, `IR`, `UX`, `GR`, `SEC`).
- `01-identity/TASTE.md` → Feeds `uiuxagent.md` (`UX`) and `growthagent.md` (`GR`).
- `02-domains/business-analysis.md` (`BA`) → Feeds `productmanageragent.md` (`PM`).
- `02-domains/solutions.md` (`SO`) → Feeds `systemsdesignagent.md` (`SD`), `dbaagent.md` (`DB`), and `integrationagent.md` (`IR`).
- `02-domains/cybersec.md` (`CS`) → Feeds `securityagent.md` (`SEC`) and `dbaagent.md` (`DB`).
- `02-domains/ui-frontend.md` (`UI`) → Feeds `uiuxagent.md` (`UX`).

## Domain Map
| Domain | Prefix | File | Active rules | Avg conf | Coverage |
|---|---|---|---|---|---|
| Cybersecurity | CS | [[cybersec]] | 0 | – | thin |
| Solutions | SO | [[solutions]] | 0 | – | thin |
| Business Analysis | BA | [[business-analysis]] | 0 | – | thin |
| UI & Frontend | UI | [[ui-frontend]] | 0 | – | thin |

Counts are refreshed by GAP-FINDER. Add a domain: see [[EXTENDING]].

## Folders
- `01-identity/` who I am as a practitioner · `02-domains/` per-specialty rules · `03-heuristics/` cross-domain judgment, red flags, patterns
- `04-models/` mental models, one per file · `05-elicitation/` micro-triggers, artifact archaeology, fast diagnostics
- `06-raw/` unprocessed candidates · `07-meta/` conventions, sync, extending, digest, brain agent
