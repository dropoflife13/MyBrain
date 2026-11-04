---
type: index
version: 7
status: active
---
# Brain — Index

A procedural vault: it stores *how I decide*, not only what I know. Rules are single lines with IDs; AI loads by tier. Start here: [[ARCHITECTURE]] (`07-meta/ARCHITECTURE.md`) defines the 4-layer system philosophy (Architect, Vault, Agents, Model).

## Loading Tiers (for AI)
| Tier | When | Files |
|---|---|---|
| 0 | always | `01-identity/ABOUT-ME.md`, `01-identity/OPERATING-PRINCIPLES.md`, `01-identity/TASTE.md`, `07-meta/DIGEST.md`, `07-meta/ARCHITECTURE.md` |
| 1 | by task domain | `02-domains/<domain>.md` |
| 2 | on judgment calls | `03-heuristics/*`, `04-models/*` |
| 3 | only when asked | `05-elicitation/sessions/`, `06-raw/` |

Files with `status: empty` or `draft` are skipped; only `status: active` lines count as rules (BN-05).

## Strict Pre-Flight Requirement (`BN-00` — All 8 Agents Required)
- **Hard Stop Rule (`BN-00`):** Anyone cloning or initializing this Brain Vault **cannot start** any self-assessment (`THE-TEST.md`), launcher (`L-01`–`L-10`), or project review unless all **8 Core Agents** (`PM`, `UX`, `GR`, `SD`, `IR`, `DB`, `SEC`, `RS`) exist in `agents/` (or `brain/04-agents/`).
- If any of the 8 agent files is missing (`productmanageragent.md`, `uiuxagent.md`, `growthagent.md`, `systemsdesignagent.md`, `integrationagent.md`, `dbaagent.md`, `securityagent.md`, `researchagent.md`), the AI must halt immediately with `GATE: FAIL BN-00 <missing-agent> — Restore all 8 Core Agents before starting`.

## Brain ↔ Agent Suite Mapping
Active rules from the brain feed directly into the execution checklists in `agents/`:
- `01-identity/OPERATING-PRINCIPLES.md` (`OP-01..19`, Tier 0) → Governs all 8 core agents (`PM`, `SD`, `DB`, `IR`, `UX`, `GR`, `SEC`, `RS`) and the Arbiter.
- `01-identity/TASTE.md` (`TA-01..20`) → Feeds `uiuxagent.md` (`UX`) and `growthagent.md` (`GR`).
- `02-domains/business-analysis.md` (`BA-01..07`) & `02-domains/empathy-personas.md` → Feed `productmanageragent.md` (`PM`).
- `02-domains/solutions.md` (`SO-01..08`) → Feeds `systemsdesignagent.md` (`SD`), `dbaagent.md` (`DB`), and `integrationagent.md` (`IR`).
- `02-domains/cybersec.md` (`CS-01..07`) & `02-domains/authorization.md` (`AUTH-01..05`) → Feed `securityagent.md` (`SEC`), `systemsdesignagent.md` (`SD`), and `dbaagent.md` (`DB`).
- `02-domains/ui-frontend.md` (`UI-01..09`) → Feeds `uiuxagent.md` (`UX`).
- `02-domains/arbiter.md` (`ARB-01..07`) → Resolves cross-domain and cross-agent rule conflicts.
- `agents/researchagent.md` (`RS-01..04`) → Governs epistemic rigor, factual triangulation, and anti-hallucination across all domains.

## Domain Map (29 Domains in 4 Clusters)

### Cluster 1: Engineering & Governance (6 Domains + 1 Reference)
| Domain | Prefix | File | Active rules | Avg conf | Coverage |
|---|---|---|---|---|---|
| Cybersecurity | CS | [[cybersec]] | 7 (`CS-01..07`) | 4.3 | ok (6/6 sub-areas) |
| Solutions | SO | [[solutions]] | 8 (`SO-01..08`) | 4.4 | ok (6/6 sub-areas) |
| Business Analysis | BA | [[business-analysis]] | 7 (`BA-01..07`) | 4.7 | ok (6/6 sub-areas) |
| UI & Frontend | UI | [[ui-frontend]] | 9 (`UI-01..09`) | 4.9 | ok (6/6 sub-areas) |
| Authorization | AUTH | [[authorization]] | 5 (`AUTH-01..05`) | 4.0 | ok (PDP/PEP, ABAC, Policy-as-Code) |
| Judgment Arbiter | ARB | [[arbiter]] | 6 (`ARB-01..06`) | 5.0 | ok (Domain separation, conflict fallback, precaution) |
| Empathy & Personas | PM | [[empathy-personas]] | Reference framework | - | Empathy Map & Target Personas (`PM-14`, `PM-15`) |

### Cluster 2: Humanities & Enterprise (8 Domains)
| Domain | Prefix | File | Active rules | Avg conf | Coverage |
|---|---|---|---|---|---|
| Psychology | PSY | [[psychology]] | 0 (draft) | - | Human behavior, cognitive biases, mental models |
| Philosophy | PHI | [[philosophy]] | 0 (draft) | - | Epistemology, ethics, dialectics |
| Rhetoric | RHE | [[rhetoric]] | 0 (draft) | - | Persuasion, classical argumentation, voice and tone |
| Literature | LIT | [[literature]] | 0 (draft) | - | Narrative structure, criticism, primary texts |
| Art & Aesthetics | ART | [[art]] | 0 (draft) | - | Visual composition, aesthetic theory, craft |
| Education | EDU | [[education]] | 0 (draft) | - | Instructional design, spaced repetition, mastery |
| Marketing | MKT | [[marketing]] | 0 (draft) | - | Brand positioning, distribution, conversion |
| Management | MGT | [[management]] | 0 (draft) | - | Organizational design, governance, operational cadence |

### Cluster 3: Global & Society (11 Domains)
| Domain | Prefix | File | Active rules | Avg conf | Coverage |
|---|---|---|---|---|---|
| Economy | ECO | [[economy]] | 0 (draft) | - | Macroeconomic cycles, monetary dynamics |
| Geopolitics | GEO | [[geopolitics]] | 0 (draft) | - | Resource flows, trade corridors, statecraft |
| Law | LAW | [[law]] | 0 (draft) | - | Statutory interpretation, regulatory compliance |
| Politics | POL | [[politics]] | 0 (draft) | - | Institutional incentives, civics, public policy |
| Environment | ENV | [[environment]] | 0 (draft) | - | Ecological systems, climate resilience, sustainability |
| History | HIS | [[history]] | 0 (draft) | - | Archival evidence, civilizational cycles |
| Crypto | CRY | [[crypto]] | 0 (draft) | - | Cryptographic primitives, distributed consensus, Web3 |
| Finance | FIN | [[finance]] | 0 (draft) | - | Valuation models, capital markets, risk-adjusted returns |
| News & Media | NWS | [[news]] | 0 (draft) | - | Media framing analysis, source attribution |
| Business | BIZ | [[business]] | 0 (draft) | - | Unit economics, competitive moats, GTM |
| Health | HLT | [[health]] | 0 (draft) | - | Longevity, metabolic health, cognitive endurance |

### Cluster 4: Frontier & Science (3 Domains)
| Domain | Prefix | File | Active rules | Avg conf | Coverage |
|---|---|---|---|---|---|
| Data Science | DS | [[data-science]] | 0 (draft) | - | Statistical inference, experimental design, modeling |
| Science | SCI | [[science]] | 0 (draft) | - | Empirical falsifiability, replication standards |
| Medicine | MED | [[medicine]] | 0 (draft) | - | Clinical evidence hierarchy, pathophysiology, safety |

### Cross-Domain Heuristics
| Collection | Prefix | File | Rule Count | Avg conf | Coverage |
|---|---|---|---|---|---|
| Heuristics & Patterns | H / P / RF | [[HEURISTICS]] · [[PATTERNS]] · [[RED-FLAGS]] | 6 H · 5 P · 10 RF | 4.9 | rich |

Counts are refreshed by [[GAP-FINDER]]. Add a domain: see [[EXTENDING]] and `02-domains/_TEMPLATE.md`.

## Folders
- `01-identity/` who I am as a practitioner (`ABOUT-ME.md`, `OPERATING-PRINCIPLES.md`, `TASTE.md`)
- `02-domains/` per-specialty rules across the 29-domain global knowledge graph
- `03-heuristics/` cross-domain judgment (`HEURISTICS.md`, `PATTERNS.md`, `RED-FLAGS.md`)
- `04-models/` mental models (`M-01.md`, `M-02.md`, `_TEMPLATE.md`)
- `05-elicitation/` protocols & triggers (`THE-TEST.md`, `ELICITATION-PROTOCOL.md`, `QUESTION-BANK.md`, `SCENARIO-BANK.md`, `ARTIFACT-ARCHAEOLOGY.md`, `GAP-FINDER.md`, `LAUNCHERS.md`), `sessions/`
- `06-raw/` candidate staging (`inbox.md`)
- `07-meta/` vault governance (`ARCHITECTURE.md`, `DIGEST.md`, `CONVENTIONS.md`, `SYNC-PROTOCOL.md`, `EXTENDING.md`, `NEW-PROJECT-SNIPPET.md`, `brainagent.md`, `check-vault.py`)
- `08-workflows/` slash-command workflows & stats spec (`SIX-COMMANDS.md`, `STATS-ENGINE.md`)
