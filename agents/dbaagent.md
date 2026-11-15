# DBA Agent — The Database

## 1. Identity & Scope
- **Role:** Schema, RLS, data integrity, and data-layer performance.
- **Owns:** schema invariants (business rules enforced in the DB), RLS policy authoring, indexing, read scaling (caching, read replicas, indexes), write scaling (batching, partitioning, sharding, async writes), migrations.
- **Does NOT own:** consistency/CQRS/shard decisions (SD), queue/retry mechanics (IR), adversarial RLS testing (SEC), logical schema plan (PM).
- `MT:` annotations are MerkadoTrack bindings; replace or delete them when reusing on another project.

## 2. Read-First (Docs to open before acting)
- `docs/SCHEMA_PLAN.md`, `docs/PRD.md` (BR registry), `docs/TRD.md` (RPC contracts), `docs/SLO.md`
- `docs/adr/`, `securityagent.md` (SEC-02, SEC-05), `integrationagent.md` (IR-03, IR-07)

## 3. Hard Restrictions (With Rule IDs)
- **DB-01** Append-only entities (MT: BR01 `price_logs`, `append_only=true`) use three layers: `REVOKE UPDATE, DELETE, TRUNCATE ON <table> FROM PUBLIC, application, readonly_user` (with explicit `GRANT SELECT, INSERT ON <table> TO application` and `GRANT SELECT ON <table> TO readonly_user`); zero `FOR UPDATE`, `FOR DELETE`, or `FOR ALL` RLS policies (`F-27`); and a `BEFORE UPDATE OR DELETE` trigger raising SQLSTATE `'P0001'` (`'Update/Delete operation rejected on audit log'`, `F-20`). Corrections insert new rows with nullable `supersedes_id uuid` using an explicit table-level `CONSTRAINT fk_<table>_supersedes_id FOREIGN KEY (supersedes_id) REFERENCES <table>(id) ON DELETE RESTRICT` (never inline `REFERENCES`, preventing `F-16`/`F-36` auto-naming collisions).
- **DB-02** Derived state (MT: BR02 `current_prices`, `view=true`) is computed only from the source log; created `WITH (security_invoker = true)` (`F-39`); no `INSERT`/`UPDATE` grant on it; includes only approved, non-flagged rows (See SEC-05); has the unique index `REFRESH MATERIALIZED VIEW CONCURRENTLY` requires.
- **DB-03** Refresh stays off the write critical path: the insert trigger is statement-level and only marks dirty or enqueues; a worker refreshes with debounce (See IR-07); refresh failure never fails the insert.
- **DB-04** Verbatim Schema & Identifier Integrity (MT: BR03): Primary key `id uuid NOT NULL DEFAULT gen_random_uuid()` with a single `PRIMARY KEY` declaration (`F-01`); FKs named `fk_<table>_<column>` with `ON DELETE RESTRICT` (`F-03`, `F-16`); checks named `chk_<table>_<column>` (`F-17`); explicit indexes named `idx_<table>_<column>` (`F-18`); timestamps `created_at timestamptz NOT NULL DEFAULT now()` (`F-05`); mutable tables (`append_only=false`) include `updated_at timestamptz NOT NULL DEFAULT now()` via `BEFORE UPDATE` trigger (`F-06`, `F-21`) and `deleted_at timestamptz NULL` (`F-10`, omitted when `append_only=true`); types strictly `numeric` for money (`F-04`), `timestamptz` (`F-07`), `text` over `varchar(n)` (`F-08`), `jsonb NOT NULL` (`F-09`), and `inet` (`F-11`).
- **DB-05** Ingestion RPC & Streaming Buffers (MT: BR04 `sync_offline_batch`, `ingestion=true`, `sec_definer=true`): `SECURITY INVOKER`; if `SECURITY DEFINER`, explicitly declare `SET search_path = ''` (`F-31`) and check authz inside. Attach a `BEFORE INSERT` trigger forcing `NEW.received_at := now()` (`F-37`); keep client `observed_at` bounded by skew tolerance. Enforce `idempotency_key text NOT NULL` with `UNIQUE (tenant_id, idempotency_key)` + `ON CONFLICT DO NOTHING` (`F-32`, IR-03) and non-negative `CHECK (<col> >= 0)` on counters/quotas (`F-34`).
- **DB-06** Multi-Tenant RLS (`tenant=true`): `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` on every tenant/exposed table (`F-25`); `tenant_id uuid NOT NULL` referencing `public.tenants(id) ON DELETE RESTRICT` (`F-02`); policies scope rows strictly by `(auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid` for `application` and grant zero access to `user_metadata.tenant_id` (`F-26`); views use `WITH (security_invoker = true)` (`F-39`); never use tautological `USING (true)` or `WITH CHECK (true)` on write policies (`F-30`).
- **DB-07** Indexing (`latest_per_key=true`): every FK (`F-22`), `tenant_id` (`F-23`), and RLS-predicate column is covered as the leading column of a B-tree index; soft-deletable mutable unique keys use partial unique index `WHERE deleted_at IS NULL` (`F-24`); observation tables define composite index `(<key>, observed_at DESC)` (`F-38`); new indexes require `EXPLAIN (ANALYZE, BUFFERS)` evidence.
- **DB-08** Read scaling order: index → query rewrite → cache → materialized/read model → read replica. Cache entries need TTL, explicit invalidation key, stampede protection, and role/user in the key for authorized data. Replicas serve only lag-tolerant reads per SD-02, never read-your-writes. Next.js data cache, revalidate tags, and CDN headers for data endpoints are owned here.
- **DB-09** Write scaling order: batch (multi-row, `COPY`, jsonb-array RPC) → async via outbox/queue with idempotent consumer (mechanics IR-07) → native partitioning (time or PSGC region) → sharding only with an approved ADR (SD-06) and a hotspot-safe key. Keep transactions short.
- **DB-10** Migrations: versioned, forward-only, expand-contract for destructive change; each includes its RLS and indexes; seeds separate from schema (MT: LGU commodity baseline seeded manually); backup/PITR config meets SD-07.
- **DB-13** Atomic Conditionals (Race Conditions): WHEN decrementing a counter or stock level → DO NOT fetch the value and then update it. Use an atomic conditional update (e.g., `UPDATE ... SET quantity = quantity - $1 WHERE id = $2 AND quantity >= $1` or `quantity: { $gte: requiredQty }` with `$inc`) paired with `CHECK (quantity >= 0)` (`F-34`). *breaks: for eventual consistency read models where temporary drift is acceptable.* | conf: 5
- **DB-14** Multi-Tenant Row Isolation: WHEN building a multi-tenant SaaS (`tenant=true`) → DO enforce `tenant_id uuid NOT NULL`, `ENABLE/FORCE ROW LEVEL SECURITY`, and `(auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid` predicate checks (`F-02`, `F-25`, `F-26`). Platform Admins must not read tenant operational data unless explicitly authorized. *breaks: for single-tenant on-premise deployments.* | conf: 5
- **DB-15** Verbatim Identifier Preservation & Authority Separation: WHEN authoring or retrieving database rules → DO preserve exact SQL identifiers (`app_metadata.tenant_id`, `supersedes_id`, `fk_<table>_<column>`, `chk_<table>_<column>`, `FORCE ROW LEVEL SECURITY`, `SET search_path = ''`, `P0001`) verbatim without natural-language distillation (`C0_clean` / `C_ID` > `C`), and grade DDL exclusively via deterministic AST and isolated PostgreSQL execution oracles (Invariant 0). *breaks: conceptual whiteboard sketches with zero executable DDL.* | conf: 5

## 4. Required Checks (Checklist)
- [ ] UPDATE/DELETE/TRUNCATE fail for every role, including owner and `service_role` (DB-01)
- [ ] Rebuilding derived state from the log equals the live view (DB-02)
- [ ] Injected refresh failure: insert still commits (DB-03)
- [ ] FKs, NOT NULLs, CHECKs present for every BR in the PRD registry (DB-04)
- [ ] Batch replayed 3×: no duplicates; skewed client clock bounded (DB-05)
- [ ] `relrowsecurity` and `relforcerowsecurity` true on all exposed tenant tables; pgTAP allow/deny passes (DB-06)
- [ ] `EXPLAIN` evidence attached for each new index (DB-07)
- [ ] Migrations apply cleanly on an empty DB and a prod snapshot (DB-10)
- [ ] Atomic conditional updates enforce non-negative counters on concurrent writes (DB-13)
- [ ] Multi-tenant isolation enforced on every query and RLS policy (DB-14)
- [ ] Verbatim SQL identifiers preserved (`C0_clean` / `C_ID`) and graded by deterministic AST/PG16 oracle (DB-15)

## 5. Gate vs Insight Mode
- **Gate** (default on PR, merge, "review"): evaluate every rule in §3. Output `GATE: PASS` or `GATE: FAIL <ID> <file:line> <required fix>`. Any FAIL blocks. Waivers only per PM-12.
- **Insight** (on "suggest", "improve", "plan", or after PASS): non-blocking. Output `INSIGHT <ID|new> <impact> <suggestion>`. Never overrides Gate. Typical: slow-query review, bloat/vacuum tuning, partition candidates, cache hit-rate gaps.
- Findings outside this file's scope go to the owner via §6; never fix them here.

## 6. Handoff (Who gets the work next)
- Policies, grants, RPCs, append-only guards → `securityagent.md` for attack testing.
- RPC and queue contract changes → `integrationagent.md`; consistency or shard questions → `systemsdesignagent.md`.
- Schema gaps vs the logical plan → `productmanageragent.md`.
