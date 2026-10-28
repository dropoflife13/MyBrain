# Cognitive Stats Engine (v1)

How we calculate the user's "Cortex Level" and Agent Mastery.

## Rules
- **Target Cap:** 20 rules per Agent is considered "100% Mastery".
- **Overclocking:** If a user exceeds 20 rules (e.g., 30 UX rules), the bar stays at 100% but glows Purple to indicate "Overclocked".
- **Grouped Dimensions:** (e.g., Empathy = PM + UX). Calculated by combining the totals of the grouped agents.
- **Gap Analysis:** Any Agent or Dimension below 30% is flagged as a "Blind Spot" requiring immediate attention.

## Architecture & Calculation Specifications
- **Implementation Source of Truth:** `lib/stats.ts` (`calculateCortexStats`)
- **Telemetry Endpoints:** `app/api/stats/route.ts` (`GET /api/stats`)
- **Client Surfaces:**
  - `app/console/page.tsx` (Left Sidebar Knowledge Bars)
  - `app/profile/page.tsx` (Cortex Profile Assessment Tracker & Hexagonal Radar)

### Standardized Dimensions & Targets
| Dimension | Key | Owning Agents | Prefixes Included | Target |
|---|---|---|---|---|
| **Security** | `security` | SEC (Security Agent) | `SEC`, `CS` | 20 (1 agent × 20) |
| **Systems** | `systems` | SD + DB | `SD`, `SO`, `DB` | 40 (2 agents × 20) |
| **Empathy** | `empathy` | PM + UX | `PM`, `BA`, `OP`, `EP`, `UX`, `UI`, `TA` | 40 (2 agents × 20) |
| **Execution** | `execution` | IR + GR | `IR`, `RF`, `H`, `P`, `GR` | 40 (2 agents × 20) |
| **Capacity** | `capacity` | All 7 Agents | All Vault Rules | 140 (7 agents × 20) |

### Arithmetic Safety & Visual Hierarchy
1. **Fraction Capping:** Display fractions are strictly formatted as `displayCount / target` where `displayCount = Math.min(count, target)` to eliminate impossible fractions like `22 / 20` or `262 / 180`.
2. **Overclocking Threshold:** When `count > target`, `isOverclocked` becomes true, the percentage renders as `100%+`, and visual elements switch from standard cyan to vibrant cyber-purple (`text-purple-400`, `bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.7)]`).
3. **Gap Analysis:** Any metric with percentage `< 30%` generates a high-priority diagnostic card routing the operator to the corresponding agent markdown file.

## Cross-Agent Governance Rules
- Enforced by Product Manager: `PM-16` (`agents/productmanageragent.md`)
- Enforced by UI/UX: `UX-16` (`agents/uiuxagent.md`)

