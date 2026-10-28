---
type: index
version: 5
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

## Strict Pre-Flight Requirement (`BN-00` — All 7 Agents Required)
- **Hard Stop Rule (`BN-00`):** Anyone cloning or initializing this Brain Vault **cannot start** any self-assessment (`THE-TEST.md`), launcher (`L-01`–`L-10`), or project review unless all **7 Core Agents** (`PM`, `UX`, `GR`, `SD`, `IR`, `DB`, `SEC`) exist in `agents/` (or `brain/04-agents/`).
- If any of the 7 agent files is missing (`productmanageragent.md`, `uiuxagent.md`, `growthagent.md`, `systemsdesignagent.md`, `integrationagent.md`, `dbaagent.md`, `securityagent.md`), the AI must halt immediately with `GATE: FAIL BN-00 <missing-agent> — Restore all 7 Core Agents before starting`.

## Brain ↔ Agent Suite Mapping
Active rules from the brain feed directly into the execution checklists in `agents/`:
- `01-identity/OPERATING-PRINCIPLES.md` (`OP-01..15`, Tier 0) → Governs all 7 agents (`PM`, `SD`, `DB`, `IR`, `UX`, `GR`, `SEC`).
- `01-identity/TASTE.md` (`TA-01..14`) → Feeds `uiuxagent.md` (`UX`) and `growthagent.md` (`GR`).
- `02-domains/business-analysis.md` (`BA-01..07`) → Feeds `productmanageragent.md` (`PM`).
- `02-domains/solutions.md` (`SO-01..08`) → Feeds `systemsdesignagent.md` (`SD`), `dbaagent.md` (`DB`), and `integrationagent.md` (`IR`).
- `02-domains/cybersec.md` (`CS-01..07`) → Feeds `securityagent.md` (`SEC`) and `dbaagent.md` (`DB`).
- `02-domains/ui-frontend.md` (`UI-01..09`) → Feeds `uiuxagent.md` (`UX`).

## Domain Map
| Domain | Prefix | File | Active rules | Avg conf | Coverage |
|---|---|---|---|---|---|
| Cybersecurity | CS | [[cybersec]] | 7 (`CS-01..07`) | 4.3 | ok (6/6 sub-areas) |
| Solutions | SO | [[solutions]] | 8 (`SO-01..08`) | 4.4 | ok (6/6 sub-areas) |
| Business Analysis | BA | [[business-analysis]] | 7 (`BA-01..07`) | 4.7 | ok (6/6 sub-areas) |
| UI & Frontend | UI | [[ui-frontend]] | 9 (`UI-01..09`) | 4.9 | ok (6/6 sub-areas) |
| Cross-Domain Heuristics | H / P / RF | [[HEURISTICS]] · [[PATTERNS]] · [[RED-FLAGS]] | 6 H · 5 P · 10 RF | 4.9 | rich |

Counts are refreshed by GAP-FINDER. Add a domain: see [[EXTENDING]].

## Folders
- `01-identity/` who I am as a practitioner (`ABOUT-ME.md`, `OPERATING-PRINCIPLES.md`, `TASTE.md`) · `02-domains/` per-specialty rules (`CS`, `SO`, `BA`, `UI`)
- `03-heuristics/` cross-domain judgment (`HEURISTICS.md`, `PATTERNS.md`, `RED-FLAGS.md`) · `04-models/` mental models
- `05-elicitation/` fast micro-triggers, artifact archaeology, session logs (`S-01`, `S-02`, `S-03`) · `06-raw/` candidate inbox · `07-meta/` conventions, sync, extending, digest
