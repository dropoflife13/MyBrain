---
type: workflow
version: 2
status: active
---
# Cognitive Stats Engine Workflow (Weighted Scoring v2)

## Overview
The Cortex **Cognitive Stats Engine** (`lib/stats.ts`) evaluates knowledge mastery across the 7 Specialized Agents and 5 Cognitive Dimensions using a **Confidence-Weighted Scoring Model (Quality > Quantity)** rather than simple line counts.

---

## 1. Confidence Weighting (`conf: X`)

Every rule in `brain/` and `agents/` is weighted by its inline `| conf: X` metadata tag:

| Metadata Tag | Weight | Meaning |
| :--- | :---: | :--- |
| `conf: 1` *(or omitted)* | **1 pt** | Initial hypothesis / unverified rule |
| `conf: 2` | **2 pts** | Observed pattern (1–2 occurrences) |
| `conf: 3` | **3 pts** | Validated rule across multiple tasks |
| `conf: 4` | **4 pts** | Battle-tested production invariant |
| `conf: 5` | **5 pts** | Core architectural law with proven receipts |

> **Design Principle:** Rules are weighted by evidence, not volume. A proven `conf: 5` rule is worth 5 unproven guesses (`conf: 1`).

---

## 2. Mastery Target & Formulas

- **Single Agent Mastery Target (`TARGET_WEIGHTED_SCORE_PER_AGENT`):** **`60` weighted points** (e.g., twelve `conf: 5` rules or twenty `conf: 3` rules).
- **Agent Mastery Percentage:**
  $$\text{Percentage} = \min\left(100, \text{round}\left(\frac{\text{weightedScore}}{60} \times 100\right)\right)$$
- **Display Score Cap:** Capped at `Math.min(weightedScore, targetScore)` (`60 / 60 pts`), while preserving raw `weightedScore` and `count` in metadata and hover tooltips.
- **5 Grouped Cognitive Dimensions:**
  - **Security (`SEC`):** `60` weighted pts target
  - **Systems (`SD + DB`):** `120` weighted pts target (`2 × 60`)
  - **Empathy (`PM + UX`):** `120` weighted pts target (`2 × 60`)
  - **Execution (`IR + GR`):** `120` weighted pts target (`2 × 60`)
  - **Capacity (Vault Total):** `420` weighted pts target (`7 × 60`)

---

## 3. Visual States & Verification Badges

1. **High Confidence (`weightedScore > targetScore`):**
   - Triggers a glowing purple bar (`from-purple-600 via-fuchsia-500 to-purple-400`) and a **`⚡ High Confidence`** badge.
2. **Unverified State (`count >= 10` and `avgConfidence < 2.0`):**
   - Triggers an amber **`⚠️ Unverified`** badge and amber progress bar when an Agent has many rules (`>= 10`) but low average confidence (`< 2.0`).
   - Surfaces an **Unverified Knowledge** warning in the **Blind Spots & Gap Analysis** panel:
     > *"You have many rules for [Agent], but they lack evidence. Link them to sessions or projects to prove them."*
3. **Low Mastery Blind Spot (`percentage < 30%`):**
   - Highlighted in rose/red in the **Blind Spots & Gap Analysis** panel so the architect knows which domain needs new rules next.

---

## Related
- [[M-02]] — Cognitive Stats & Mastery Model
- [[ARCHITECTURE]] — Cortex 4-Layer Architecture
- `agents/productmanageragent.md` (`PM-16`) & `agents/uiuxagent.md` (`UX-16`)

