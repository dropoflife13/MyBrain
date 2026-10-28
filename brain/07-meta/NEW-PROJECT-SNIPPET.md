---
type: snippet
version: 1
status: active
---
# Global Brain Context

You are connected to Neil's Central Brain Vault.
Before writing any code, read the following files from the absolute path: `C:/Users/neil/brain-web/brain/` (or your local vault repository path)

1. Read `07-meta/DIGEST.md` (Tier 0 Principles)
2. Read `02-domains/cybersec.md` (Security Rules)
3. Read `02-domains/solutions.md` (Architecture Rules)

## Hard Rules
- Obey all `SEC-*`, `SD-*`, and `DB-*` rules.
- If you write a database schema, check `dbaagent.md` for append-only invariants.
- If you write an API route, check `securityagent.md` for rate limits and RLS.

If the Brain Vault path is not found, halt immediately and tell me: "GATE: FAIL BN-00 — Central Brain disconnected."

