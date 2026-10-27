---
type: scenarios
version: 1
status: active
---
# Scenario Bank

Examiner-only keys. Do not show a key before the module ends (TE-02). Keys are signals, not answers (TE-07). Add scenarios per EXTENDING.md.

## Flash (T1) — first move + one-line reason, ≤ 30 s
| ID | Prompt | Listen for |
|---|---|---|
| FL-CS-1 | An inspector's phone with unsynced offline data is lost. | revocation, data at rest, exposure scope, who is told first |
| FL-CS-2 | A dependency you never call has a CVSS 9.8 advisory. | reachability vs score, patch vs remove, severity logic |
| FL-CS-3 | The client asks to disable access controls "temporarily" for tomorrow's demo. | non-negotiable vs compensating control, refusal style |
| FL-CS-4 | Pentest result: 1 High, 6 Medium. Launch is Friday. | who accepts risk, ship/hold criteria |
| FL-CS-5 | A new admin asks for the service-role key "just to debug". | least privilege, alternative path |
| FL-SO-1 | The customer wants live dashboards; their connection drops daily. | offline or eventual consistency, expectation reset |
| FL-SO-2 | A SaaS product covers 80% of the need; data residency is unclear. | buy/build/adapt bias, what to verify first |
| FL-SO-3 | The prototype impressed the mayor; he wants it live in two weeks. | demo-to-production gap, scope cut, honesty |
| FL-SO-4 | A teammate proposes microservices for a 200-user app. | complexity cost vs team size |
| FL-SO-5 | The pilot worked in one office; twelve offices start next quarter. | what breaks first, rollout order |
| FL-BA-1 | The sponsor says: "We just need a dashboard." | need vs solution, first question |
| FL-BA-2 | Two departments define "active customer" differently. | definitions, ownership, who decides |
| FL-BA-3 | The key stakeholder will not attend workshops. | influence, alternatives, risk |
| FL-BA-4 | Mid-project, the sponsor's boss adds a "small" feature. | scope control, trade-off framing |
| FL-BA-5 | Staff use a private spreadsheet the process map does not show. | shadow process, As-Is accuracy, tone toward staff |

## Flaw Hunt (T2, T8)
### FH-CS-1 — Security review summary
> Passed: MFA for staff · TLS 1.2+ · quarterly pentest · encryption at rest · SOC 2 policies approved.
> Notes: stack is Next.js + Supabase. Service-role key stored as `NEXT_PUBLIC_SUPABASE_SERVICE_KEY` "for convenience". Four engineers share one admin login. Nightly backups; restore never tested. Auth logs include full JWTs. RLS enabled on 9 of 12 tables; the other 3 are "internal".

**Key:** F1 privileged key shipped to the client · F2 shared admin login, no attribution · F3 untested restore · F4 tokens in logs · F5 3 tables unprotected though exposed · F6 checklist pass treated as security.

### FH-SO-1 — Proposal "Barangay Monitor"
> 9 microservices on Kubernetes, event bus, separate database per service, GraphQL gateway, ML anomaly service. Users: 200 field staff. Team: 3 developers. Hosting: free tier. Connectivity: intermittent. Go-live: 6 weeks. Plan: build all services in parallel.

**Key:** F1 architecture sized far above team and users · F2 Kubernetes on a free tier, no operations owner · F3 no offline/sync strategy · F4 ML before any data exists · F5 parallel build, no first slice, no rollback · F6 deadline vs scope.

### FH-BA-1 — Requirements excerpt
> R1 The system shall be user-friendly. R2 The system shall be fast. R3 Admin can manage all records. R4 The dashboard shall show real-time prices. R5 Reports shall be generated as needed. R6 Inspectors shall log prices daily.

**Key:** F1 R1/R2 untestable · F2 R3 "manage" and "all" undefined · F3 R4 "real-time" undefined, offline ignored · F4 R5 no trigger or owner · F5 R6 no exceptions (closed days, holidays) · F6 no acceptance criteria or priorities.

## Compliant-but-Wrong (T3) — passes review; why is it wrong?
| ID | Item | Why wrong (key) |
|---|---|---|
| CW-CS-1 | Forced 90-day password rotation. | predictable passwords; MFA and breach checks do more |
| CW-CS-2 | WAF in front of an app with broken object-level authorization. | a WAF does not fix authorization |
| CW-CS-3 | "Encrypted at rest", with the key stored beside the data. | key custody defeats the control |
| CW-CS-4 | RLS enabled, policy `USING (true)`. | enabled is not enforced |
| CW-CS-5 | Webhook protected by an IP allowlist, no signature. | IPs are shared or spoofable; authenticity unproven |
| CW-CS-6 | Pentest passed; the API was out of scope. | scope hides the real surface |
| CW-SO-1 | Diagram labeled "highly available" with a single database. | single point of failure |
| CW-SO-2 | Vendor demo passed on sample data; no integration test. | integration risk untested |
| CW-SO-3 | Proof of concept accepted and promoted to production unchanged. | no hardening, no ownership |
| CW-SO-4 | 99.9% SLA whose exclusions cover the likeliest failures. | the guarantee is empty |
| CW-SO-5 | "Scalable" design with no load number anywhere. | unfalsifiable claim |
| CW-SO-6 | Documentation complete; nobody but the author has run the setup. | untested handover |
| CW-BA-1 | Requirements signed off by people who never read them. | approval without understanding |
| CW-BA-2 | UAT run by the authors of the requirements. | no independent check |
| CW-BA-3 | Stakeholder matrix with nobody who does the daily work. | the real users are missing |
| CW-BA-4 | Process map shows only the official path. | shadow processes and exceptions ignored |
| CW-BA-5 | Every requirement marked "High" priority. | no prioritization |
| CW-BA-6 | Success metric defined as "go-live achieved". | measures delivery, not value |

## Rank & Pivot (T5)
- **RK-1** Public-office app, 3 weeks to launch. Rank: security hardening · offline reliability · UI polish · feature completeness · documentation. Pivots: (A) a breach would be public news · (B) nobody maintains it after launch · (C) users are low-literacy on low-end phones.
- **RK-2** New analysis engagement. Rank: stakeholder alignment · requirement completeness · speed to first demo · traceability · estimate accuracy. Pivots: (A) the sponsor leaves in 2 months · (B) fixed price · (C) requirements will be audited.

## Pre-Mortem (T6)
- **PRE-1** An app you shipped for a public office is abandoned 18 months later. Headline and three causes.
- **PRE-2** A security review you signed off is followed by a breach. What did you miss?
- **PRE-3** A requirements document you wrote produced the wrong system. Where did it go wrong?
