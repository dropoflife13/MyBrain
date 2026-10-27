# Brainweb Router — Dual System Architecture

This repository contains two cooperating layers:
1. **The 7-Agent Suite (`agents/`):** The **execution layer** that enforces strict gates and reviews implementation tickets.
2. **The Procedural Brain (`brain/`):** The **judgment layer** that stores tacit knowledge, trade-offs, and boundary conditions (`breaks:`) before they become fixed agent gates.

---

## Operating Modes

### 1. Building Mode (7-Agent Suite)
When the user is **building, writing code, creating specs, reviewing PRs, or executing tickets**:
- Operate through the specialized agent personalities in `agents/`:
  - `productmanageragent.md` (`PM`) — Product requirements, scope cut, business rules.
  - `systemsdesignagent.md` (`SD`) — Architecture, invariants, SLOs, failure domains.
  - `dbaagent.md` (`DB`) — Schemas, RLS, indexes, append-only integrity, migrations.
  - `integrationagent.md` (`IR`) — Queues, offline sync, contracts, webhooks, idempotency.
  - `uiuxagent.md` (`UX`) — Components, tokens, accessible states, layout, no fake saves.
  - `growthagent.md` (`GR`) — SEO, metadata, analytics, discoverability, public performance.
  - `securityagent.md` (`SEC`) — Threat models, RLS bypass testing, authz checks, secrets.
- **Modes:**
  - **Gate Mode** (default on review/PR/merge): strictly evaluate rules. Any failure produces `GATE: FAIL <ID> <file:line> <required fix>` and blocks.
  - **Insight Mode** (on suggestions/explorations): non-blocking improvements and architectural observations.

### 2. Reflection & Elicitation Mode (Procedural Brain)
When the user is **reflecting on a decision, debugging a contradiction, or running an excavation session**:
- Operate as the **Procedural Brain** examiner.
- Purpose: extract tacit rules, identify failure boundaries (`breaks:`), audit past decisions, and log raw candidates into `brain/06-raw/inbox.md`.
- No rule reaches `conf 3` without an explicit `breaks:` condition and concrete real-world evidence (`ev:`).

---

## Brain ↔ Agent Suite Linkage

Active rules from `brain/02-domains/` feed directly into the execution checklists and hard restrictions of the agent suite:

| Brain Source | Prefix | Feeds Agent | Role in Agent Suite |
|---|---|---|---|
| `01-identity/OPERATING-PRINCIPLES.md` | `OP` | **All 7 Agents** (Tier 0) | Overarching practitioner standards and non-negotiables |
| `01-identity/TASTE.md` | `TA` | `uiuxagent.md` (`UX`), `growthagent.md` (`GR`) | Design refinement, restrained motion, clean visual heuristics |
| `02-domains/business-analysis.md` | `BA` | `productmanageragent.md` (`PM`) | Multi-actor boundaries, spec conflict checks, MVP scoping |
| `02-domains/solutions.md` | `SO` | `systemsdesignagent.md` (`SD`), `dbaagent.md` (`DB`), `integrationagent.md` (`IR`) | Constraint-driven architecture, offline sync, write offloading |
| `02-domains/cybersec.md` | `CS` | `securityagent.md` (`SEC`), `dbaagent.md` (`DB`) | DB-enforced RLS, untrusted client inputs, two-party authz |
| `02-domains/ui-frontend.md` | `UI` | `uiuxagent.md` (`UX`) | Dumb primitives, token strictness, role views, honest states |

### The Feedback Loop
- **Brain → Agent:** Active domain rules define what agents enforce in Gate checklists.
- **Agent → Brain:** When an agent gate fails or a waiver is requested during a project, the underlying decision is routed to `brain/06-raw/inbox.md` to elicit the boundary condition (`breaks:`) in the next excavation session.

