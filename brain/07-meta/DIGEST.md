---
type: digest
version: 3
status: active
generated: 2026-10-27
---
# Digest — How I Decide

Portable Tier 0 summary (≤ 60 lines) for any AI tool or multi-root workspace. Every line cites its active source rule (`conf ≥ 3`).

## I decide by
- **Role & Ownership First:** Lock down who submits, who reviews, who approves, and what each teammate/module is forbidden from touching before writing UI or code (`OP-01`, `BA-01`).
- **Derived Truth Over Mutable Counters:** Current balances (stock, prices, OJT hours) must be derived from append-only event/batch logs (`supersedes_id`), never overwritten in-place (`OP-06`, `SO-01`, `CS-03`).
- **Deterministic Math Before AI:** Run statistical/schema baselines (`z-score`/MAD, regex, Zod) first; keep AI strictly as a non-overlapping copilot that flags inconsistencies without overriding human judgment (`OP-13`, `OP-14`, `H-01`).
- **Usability Beats Spectacle on Constrained Hardware:** Use procedural 3D math (<50KB) and DOM-persistent video rows (`0fr → 1fr`); auto-downgrade WebGL to static SVG/blueprint when FPS < 30 or `prefers-reduced-motion` is active (`SO-04`, `UI-05`, `P-02`).
- **Pragmatic Scaling & Batch Cutoffs:** Index (`EXPLAIN ANALYZE`) → query rewrite → CDN/edge cache → materialized view → read replica (`SO-03`); validate ≤500-row / <2s CSV uploads synchronously with a pre-commit error preview, offloading larger batches to async queues (`SO-06`).
- **Role-Matched Viewports & Data-Moat GTM:** Mobile-first (375px) for field roles, desktop-first (1440px tables) for batch operators (`UI-06`); convert free 1-cycle pilots via compounding audit history and fair-exit Founding-Partner pricing (`BA-06`).
- **Emergency Truth Razor:** If an unreachable teammate's backend breaks right before a defense, isolate a minimal fix on my own branch and disclose it in the handoff log—never fake the save in UI (`H-02`).

## I always check
- **Trust, Bundle & 5-Role Matrix Boundaries:** Default-deny RLS on all tables, server-derived roles only, `service_role` isolated from client bundles, and every migration tested across all 5 roles (`anon`, `student`, `coordinator`, `supervisor`, `admin`) + cross-tenant isolation (`CS-01`, `CS-04`, `CS-06`).
- **Two-Party State Machines:** Enforce `submitter ≠ approver` and strict finite state machines (`requested → accepted | declined`); allow solo self-approval only when `active_staff_count == 1` with `solo_operator_waiver` logged (`CS-02`, `SO-02`, `P-01`).
- **Untrusted Edge Ingestion:** Server stamps `received_at = now()`, bounds client `observed_at` skew, enforces `UNIQUE` idempotency (`ON CONFLICT DO NOTHING`), and isolates per-row errors (`CS-05`, `SO-05`).
- **Zero-FOUC & WCAG AA Tokens:** Synchronous inline `<head>` theme script, semantic CSS tokens, `32/24/18/15/12px` type scale (`JetBrains Mono` for IDs/timers), and `#A5C7FF` (never `#2563EB`) on dark backgrounds (`UI-02`, `TA-03`, `TA-04`).

## Red flags I react to
- `NEXT_PUBLIC_*` containing `SERVICE_ROLE` or secret keys in client code → instant `GATE: FAIL` (`RF-01`, `CS-01`).
- `src/components/ui/` primitives importing Supabase/fetch or mutating state directly → strip to dumb props (`RF-02`, `UI-01`).
- `UPDATE`/`DELETE` on audit logs or in-place overwrites on stock/price/hour totals → block & make append-only (`RF-03`, `CS-03`).
- Firing `alert("Saved!")` or optimistic toasts before `await` confirms, or faking saves for missing backends (`RF-05`, `UI-03`).
- Neon purple-pink gradients, `scale-110` bounce, `useEffect` theme flashes, raw hex codes, or destructive `"OK"` buttons (`RF-06`, `RF-07`, `RF-08`, `UI-04`).

## I refuse
- Exposing privileged keys or disabling RLS "temporarily" for a demo (`OP-07`, `CS-01`).
- Faking a save, fabricating audit/trust data, or hiding security behind a hidden UI button (`OP-09`, `UI-03`).
- Coding unapproved scope mid-sprint without `SPEC.md` (park extras in `LATER.md`) or silently guessing when specs conflict (`OP-11`, `BA-02`, `BA-05`).

## How I like work delivered
- Linear/Stripe calm density + Premiere Pro pacing: ≤10s media hooks, ≤3m MVP demos, storyboarded as Problem → Friction → 'Aha' Action → Verified Outcome (`TA-01`, `TA-13`, `P-03`).
- Defensible specs with numbered sections, ownership matrices, Mermaid diagrams, citable rule IDs (`DB-01`, `UX-01`), and pre-empted panel attacks (`BA-03`, `TA-10`, `H-03`).
