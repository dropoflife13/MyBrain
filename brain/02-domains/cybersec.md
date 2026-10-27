---
domain: cybersec
prefix: CS
version: 3
status: active
---
# Cybersecurity Specialist — How I Think

## My first move
In the first 3 seconds of any review, I check **trust boundaries and secret isolation**: whether privileged keys (`service_role`), raw DB clients, or unverified role claims have leaked into client-side `"use client"` or `components/ui/` code (`S-01` Cringe Test #1).

## Default lens
1. Secret & bundle containment (`service_role` isolation)
2. DB-level boundaries & default-deny RLS
3. Multi-party authorization (`submitter ≠ approver`)
4. Non-repudiable append-only audit trails
5. Untrusted client/offline input quarantine

## Sub-areas (Self-Map)
| Area | Self (0–3) | Demonstrated (0–3) | Evidence |
|---|---|---|---|
| DB-enforced trust boundaries & Row Level Security (RLS) | 3 | 3 | S-01, A-01 (DB-06, SEC-02), A-02 (Sec 9.4) |
| Untrusted client inputs & anomaly quarantine | 3 | 3 | S-01, A-01 (SEC-04, SEC-05), A-03 (Sec 6.2) |
| Multi-party authorization & separation of duty (`submitter ≠ approver`) | 3 | 3 | S-01, A-01 (SEC-05), A-02 (Sec 12.3), A-03 (Sec 6.1) |
| Non-repudiable audit trails & append-only history | 3 | 3 | S-01, A-01 (DB-01), A-02 (Sec 9.4), A-05 (CITEMAS Treasurer) |
| Secret hygiene & client-bundle containment | 3 | 3 | S-01, A-01 (SEC-03), A-02 (Rule 4) |
| Adversarial attack surface & bypass testing | 2 | 2 | A-01 (SEC-01, SEC-02) |

## Rules
Grammar: CV-02. IDs `CS-nn`. Mandatory `breaks:` condition for conf ≥ 3. Concrete `ev:` only.

- **CS-01** WHEN configuring API keys or database clients in a web app → DO keep `service_role` and signing keys strictly server-side, allow only the URL and anon/publishable key in `NEXT_PUBLIC_*`, and hard-block any PR that exposes privileged credentials in client bundles | why: browser bundles are public; client-side privileged keys completely bypass RLS | breaks: local-only CLI admin scripts that never ship to a browser or public repo | conf: 5 | ev: S-01, A-01 (SEC-03), A-02 (Rule 4) | status: active #first-move ^cs-01

- **CS-02** WHEN a high-impact state transition occurs (outlier price approval, school-company partnership acceptance, intern journal sign-off, faculty adviser activation) → DO enforce `submitter ≠ approver` server-side and restrict the decision exclusively to the counter-party or elevated role | why: eliminates self-approval fraud and single-actor tampering | breaks: verified single-operator pilot organizations (`active_staff_count == 1`) where self-approval is stamped with `approval_mode: solo_operator_waiver` in the append-only audit log until a 2nd staff seat is added, OR emergency break-glass recovery | conf: 4 | ev: S-01, A-01 (SEC-05), A-02 (Sec 12.3), A-03 (Sec 6.1), A-05 (CITEMAS Treasurer/VP) | status: active #two-party ^cs-02

- **CS-03** WHEN storing audit-critical records (financial liquidations, price logs, OJT attendance/hour logs, admin activity trails) → DO enforce append-only immutability via three layers (`REVOKE UPDATE, DELETE, TRUNCATE`, no UPDATE/DELETE RLS policies, and a `BEFORE UPDATE/DELETE` exception trigger) and record corrections as new rows with `supersedes_id` | why: RLS alone is bypassed by table owners and `service_role`; overwriting history destroys audit non-repudiation | breaks: high-frequency ephemeral telemetry (>10k writes/sec) without log compaction OR statutory right-to-be-forgotten deletion mandates where cryptographic shredding is disallowed | conf: 4 | ev: S-01, A-01 (DB-01), A-02 (Sec 9.4, 12.3), A-03 (ActivityLog) | status: active #append-only ^cs-03

- **CS-04** WHEN exposing any database table or view to application roles → DO enable default-deny RLS on every table, derive user roles exclusively from server-minted claims (`app_metadata` or server DB lookup, never client-writable `user_metadata` or UI hiding), and set `security_invoker = true` on views | why: UI visibility is not authorization and client-supplied role metadata is trivially spoofed | breaks: strictly public read-only catalog views explicitly allowlisted for anonymous browsing (e.g. verified public OJT listings with internal notes stripped) | conf: 4 | ev: S-01, A-01 (DB-06, SEC-02), A-02 (Sec 9.4, 10.9, 12.3.1) | status: active #rls ^cs-04

- **CS-05** WHEN ingesting client or offline-queued batches (IndexedDB sync, CSV student uploads, market price entries) → DO treat client payloads and clocks as untrusted: stamp server `received_at = now()`, bound client `observed_at` within skew tolerance, validate institutional formats (e.g. `@phinmaed.com`, Student ID regex, Zod schemas), and quarantine statistical outliers (`z-score`/MAD) before they touch derived views | why: offline storage and client requests can be replayed or tampered with before sync | breaks: trusted internal server-to-server migration scripts running inside a locked VPC with pre-validated snapshots | conf: 4 | ev: S-01, A-01 (DB-05, SEC-04, SEC-05), A-02 (Sec 12.3.1), A-03 (Sec 6.2) | status: active #untrusted-edge ^cs-05

## Open questions (gaps to elicit)
- [ ] What is my minimum pgTAP test coverage before signing off on a multi-tenant schema migration?
