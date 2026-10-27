---
domain: cybersec
prefix: CS
version: 2
status: draft
---
# Cybersecurity Specialist — How I Think

## My first move
_What I do in the first 10 minutes of any security review or threat boundary check._

## Default lens
_Rank and keep the order: DB-level boundaries · untrusted inputs · authorization & multi-party gates · append-only integrity · secret isolation._

## Sub-areas (Self-Map)
Self: 0 never touched · 1 aware · 2 can do with reference · 3 can teach or do unaided.
Demonstrated (set by the examiner, cite S-nn): 0 none · 1 mentioned · 2 applied correctly once · 3 applied repeatedly with conditions.

| Area | Self (0–3) | Demonstrated (0–3) | Evidence |
|---|---|---|---|
| DB-enforced trust boundaries & Row Level Security (RLS) | | | |
| Untrusted client inputs & anomaly quarantine | | | |
| Multi-party authorization & separation of duty (`submitter ≠ approver`) | | | |
| Non-repudiable audit trails & append-only history | | | |
| Secret hygiene & client-bundle containment | | | |
| Adversarial attack surface & bypass testing | | | |

## Rules
Grammar: CV-02. IDs `CS-nn`. Mandatory `breaks:` condition for conf ≥ 3. Concrete `ev:` only.
_None yet._

## Open questions (gaps to elicit)
- [ ] When is client-side validation useful vs when is it completely irrelevant?
- [ ] What is my non-negotiable threshold for revoking permissions on historical rows?
- [ ] When does multi-party approval become a business bottleneck that must be waived?
