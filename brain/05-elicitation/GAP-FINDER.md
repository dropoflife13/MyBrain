---
type: gap-finder
version: 1
status: active
---
# Gap Finder

Run weekly (launcher L-05). Owns coverage scoring, Self-Map deltas, next-session choice, and the contradiction queue.

## Coverage matrix
| Domain | Active rules | Red flags | Patterns | Avg conf | Status |
|---|---|---|---|---|---|
| cybersec (CS) | 0 | 0 | 0 | – | thin |
| solutions (SO) | 0 | 0 | 0 | – | thin |
| business-analysis (BA) | 0 | 0 | 0 | – | thin |
| cross (H) | 0 | 0 | 0 | – | thin |

Thresholds: **thin** < 5 active rules or avg conf < 3 · **ok** 5–12 rules and avg ≥ 3 · **rich** > 12 rules, avg ≥ 4, ≥ 2 red flags.

## Self-Map deltas
Hidden strength: Demonstrated − Self ≥ 2. Paper strength: Self − Demonstrated ≥ 2.
| Domain | Area | Self | Demonstrated | Kind |
|---|---|---|---|---|

## Next session proposal
1. Pick the thinnest domain.
2. Pick the least-used session type there (EP-07).
3. Pull 5 questions or scenarios with no matching rule.
4. Log it as the next S-nn.

## Contradiction queue
Format: `- **X-nn** <rule A> vs <rule B>: <conflict> | opened: S-nn | status: open|resolved`
Resolve only in a type C session (EP-03).
_None yet._
