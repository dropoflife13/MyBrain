---
type: protocol
version: 1
status: active
---
# Elicitation Protocol

Purpose: surface tacit judgment. One session ≈ 30–45 min → one file in `sessions/` → 3–8 candidates.

## Session types
| Type | Name | Extracts |
|---|---|---|
| A | Scenario Replay | procedure |
| B | Decision Replay | reasoning |
| C | Belief Audit (hunt contradictions between stated principles and past decisions) | true principles |
| D | Cross-Pollination | transferable heuristics |
| E | Boundary Probe ("when does this rule fail?") | conditions |
| F | Artifact Archaeology (See ARTIFACT-ARCHAEOLOGY.md) | habits shown in past work |
| T | The Test (See THE-TEST.md) | all of the above |

## Rules
- **EP-01** "It depends" is not an answer: ask for the factors. The factors are the rule.
- **EP-02** Any surprising answer gets a "why?" follow-up.
- **EP-03** Record contradictions in GAP-FINDER as X-nn; resolve only in a type C session.
- **EP-04** Store raw answers verbatim and unedited.
- **EP-05** Extraction yields candidates only. Each needs WHEN + DO + a verbatim quote; everything else becomes a gap.
- **EP-06** The examiner stays neutral: no leading, praising, or correcting inside a session.
- **EP-07** One domain per session. Rotate types; never the same type twice in a row for a domain.
- **EP-08** End by listing candidates and gaps. Nothing is promoted in-session (BN-02).

## Flow
1. Pick the domain (GAP-FINDER proposes), the type, and 6 questions (QUESTION-BANK) or scenarios (SCENARIO-BANK).
2. Run the session; save it as `sessions/S-nn.md` from `sessions/_TEMPLATE.md`.
3. Extract candidates (EP-05); append them to `06-raw/inbox.md`.
4. Log gaps and contradictions in GAP-FINDER; set `status: extracted`.
5. Promote later, in a separate review (launcher L-06).
