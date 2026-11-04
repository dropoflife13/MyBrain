---
type: digest
version: 5
status: active
generated: 2026-11-05
---
# Digest — How I Decide

Portable Tier 0 summary (≤ 60 lines) for any AI tool or multi-root workspace. Every line cites its active source rule (`conf ≥ 3`).

## I decide by
- **Role & Ownership First:** Lock down who submits, who reviews, who approves, and what each teammate/module/agent is forbidden from touching before writing UI or code (`OP-01`, `BA-01`, `H-03`).
- **Pre-Flight Gate & Earned Judgment:** Never start Cortex without all 8 Core Agents (`BN-00`, `SO-07`, `CS-07`); ship public forks with `0 personal rules` (`status: empty`) so adopters earn every node via `THE-TEST.md` (`P-05`).
- **Derived Truth & Live Sync:** Compute balances from append-only event logs (`OP-06`, `SO-01`, `CS-03`), and generate 3D synaptic nodes directly from live `.md` files with zero duplicate IDs or static drift (`SO-08`, `H-06`, `OP-15`).
- **Deterministic-First AI Engineering:** Run lexical gates, bracket checks, and unit tests FIRST before calling an LLM to debug code (`OP-07`, `OP-15`, `H-01`); route queries through the 3-Tier Router ($0 local lookup → fast model → heavy workflow) to crush token cost (`OP-16`).
- **Autonomous Living Knowledge:** Treat the vault as a living organism; use the automated Research Radar to discover, triangulate, and stage new domain rules into `inbox.md` (`OP-17`, `RS-01..04`).
- **Single-Owner WebGL & Route Transitions:** Use procedural 3D math (<50KB), let `OrbitControls.autoRotate` own 360° spin without conflicting camera lerps (`UI-07`), and use one destination-owned `<NeuralLoader />` gated by `isReady` (`SO-04`, `UI-05`, `UI-08`, `P-02`).
- **Pragmatic Scaling & Batch Cutoffs:** Index (`EXPLAIN ANALYZE`) → query rewrite → CDN/edge cache → materialized view → read replica (`SO-03`); validate ≤500-row / <2s CSV uploads synchronously, offloading larger batches to async queues (`SO-06`).
- **Emergency Truth Razor:** If a teammate's backend breaks right before a defense, isolate a minimal fix on my own branch and disclose it in the handoff log—never fake the save in UI (`H-02`).

## I always check
- **Trust, Bundle & 5-Role Matrix Boundaries:** Default-deny RLS on all tables, server-derived roles only, `service_role` isolated from client bundles, fail-closed `422` pre-flight gates, and 5-role + cross-tenant tests (`CS-01`, `CS-04`, `CS-06`, `CS-07`, `OP-08`).
- **Two-Party State Machines:** Enforce `submitter ≠ approver` and strict finite state machines (`requested → accepted | declined`); allow solo self-approval only when `active_staff_count == 1` with `solo_operator_waiver` logged (`CS-02`, `SO-02`, `P-01`, `OP-09`).
- **Untrusted Edge Ingestion:** Server stamps `received_at = now()`, bounds client `observed_at` skew, enforces `UNIQUE` idempotency (`ON CONFLICT DO NOTHING`), and isolates per-row errors (`CS-05`, `SO-05`, `OP-04`).
- **Zero-FOUC, Blueprint Light Mode & Grid Symmetry:** Inline `<head>` theme script, `grid-cols-[1fr_auto_1fr]` `h-10` headers, Architectural Blueprint Light Mode (`#f0f4f8` / `#1e3a8a`) + Obsidian Dark Mode (`#050505`), and WCAG AA tokens (`UI-02`, `UI-09`, `TA-04`, `TA-14`).
- **Anti-Hallucination & First-Principles:** If semantic search score falls below cosine threshold, halt with "I do not know" (`OP-14`, `RS-03`, `ARB-07`).

## Red flags I react to
- `NEXT_PUBLIC_*` containing `SERVICE_ROLE` or secret keys in client code → instant `GATE: FAIL` (`RF-01`, `CS-01`, `OP-08`).
- `src/components/ui/` primitives importing Supabase/fetch or mutating state directly → strip to dumb props (`RF-02`, `UI-01`).
- `UPDATE`/`DELETE` on audit logs or in-place overwrites on stock/price/hour totals → block & make append-only (`RF-03`, `CS-03`, `OP-06`, `DB-13`).
- Firing `alert("Saved!")` or optimistic toasts before `await` confirms, or faking saves for missing backends (`RF-05`, `UI-03`, `OP-10`).
- Neon purple-pink gradients, `scale-110` bounce, `useEffect` theme flashes, raw hex codes, or destructive `"OK"` buttons (`RF-06`, `RF-07`, `RF-08`, `UI-04`, `TA-05`).
- Manual `camera.position.lerp()` fighting `OrbitControls.autoRotate`, or stacked double loaders across routes (`RF-09`, `RF-10`, `UI-07`, `UI-08`).
- Unanchored bots floating with `Math.random()` physics in isometric views (`TA-15`, `TA-19`).

## I refuse
- Exposing privileged keys, failing open when an agent gate is missing, or disabling RLS "temporarily" (`OP-08`, `CS-01`, `CS-07`).
- Faking a save, fabricating audit/trust data, or hiding security behind a hidden UI button (`OP-10`, `UI-03`).
- Coding unapproved scope mid-sprint without `SPEC.md` (park extras in `LATER.md`) or silently guessing when specs conflict (`OP-12`, `BA-02`, `BA-05`).
- Letting an AI agent mutate production data or override human judgment without deterministic gate approval (`OP-13`, `OP-15`).

## How I like work delivered
- Linear/Stripe calm density + Premiere Pro pacing: ≤10s media hooks, ≤3m MVP demos, storyboarded as Problem → Friction → 'Aha' Action → Verified Outcome (`TA-01`, `TA-13`, `P-03`).
- Defensible specs with numbered sections, ownership matrices, Mermaid diagrams, citable rule IDs (`DB-01`, `UX-01`), zero cross-file rule overlaps, and pre-empted panel attacks (`BA-03`, `TA-10`, `H-03`, `H-06`, `OP-02`).
- Post-build excavation after every major milestone to feed lessons back into the vault and eliminate drift (`OP-19`, `check-vault`).
