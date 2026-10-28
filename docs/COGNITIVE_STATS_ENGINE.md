# Cognitive Stats Engine (v2 — Confidence-Weighted Scoring)

How we calculate the user's "Cortex Level" and Agent Mastery using **Quality > Quantity** confidence weighting.

## Core Rules
- **Confidence Weighting (`conf: X`):**
  - `conf: 1` (or no tag) = **1 pt**
  - `conf: 2` = **2 pts**
  - `conf: 3` = **3 pts**
  - `conf: 4` = **4 pts**
  - `conf: 5` = **5 pts**
- **Mastery Target:** **60 weighted points** per Agent (`TARGET_WEIGHTED_SCORE_PER_AGENT = 60`).
- **High Confidence:** Exceeding 60 weighted points triggers the purple glow and **`⚡ High Confidence`** badge (`100%+`).
- **Unverified State (`⚠️ Unverified`):** Having `>= 10` rules with an average confidence `< 2.0` triggers an amber **`⚠️ Unverified`** badge and surfaces an **Unverified Knowledge** diagnostic in Blind Spots.
- **Low Mastery Blind Spot:** Any Agent or Dimension below **30%** is flagged in the Blind Spots section.

## Architecture & Calculation Specifications
- **Implementation Source of Truth:** `lib/stats.ts` (`calculateCortexStats`)
- **Workflow Documentation:** `brain/08-workflows/STATS-ENGINE.md`
- **Telemetry Endpoints:** `app/api/stats/route.ts` (`GET /api/stats`)
- **Client Surfaces:**
  - `app/console/page.tsx` (Left Sidebar Knowledge Bars)
  - `app/profile/page.tsx` (Cortex Profile Assessment Tracker & Hexagonal Radar)

### Standardized Dimensions & Weighted Targets
| Dimension | Key | Owning Agents | Prefixes Included | Weighted Target |
|---|---|---|---|---|
| **Security** | `security` | SEC (Security Agent) | `SEC`, `CS` | **60 pts** (`1 × 60`) |
| **Systems** | `systems` | SD + DB | `SD`, `SO`, `DB` | **120 pts** (`2 × 60`) |
| **Empathy** | `empathy` | PM + UX | `PM`, `BA`, `OP`, `EP`, `UX`, `UI`, `TA` | **120 pts** (`2 × 60`) |
| **Execution** | `execution` | IR + GR | `IR`, `RF`, `H`, `P`, `GR` | **120 pts** (`2 × 60`) |
| **Capacity** | `capacity` | All 7 Agents | All Vault Rules | **420 pts** (`7 × 60`) |

## Cross-Agent Governance Rules
- Enforced by Product Manager: `PM-16` (`agents/productmanageragent.md`)
- Enforced by UI/UX: `UX-16` (`agents/uiuxagent.md`)
