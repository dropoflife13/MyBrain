---
type: extending
version: 1
status: active
---
# Extending the Vault

Every extension follows the same pattern: copy a template, take the next free ID, register it, run one session.

## Add a domain
1. Copy `02-domains/_TEMPLATE.md` → `02-domains/<name>.md`; take a prefix from the free pool and register it (CV-07).
2. List its sub-areas in the Self-Map table.
3. Add a row to the Domain Map in `00-INDEX.md` and the matrix in `GAP-FINDER.md`.
4. Add ≥ 5 flash scenarios, 1 flaw hunt, 6 compliant-but-wrong items to `SCENARIO-BANK.md` and ≥ 5 questions to `QUESTION-BANK.md` (launcher L-10 drafts them from `ABOUT-ME.md`).
5. Run a domain session with launcher L-03.

## Add a test module
Define `Tn` in `THE-TEST.md` with a time-box, input bank, probe, and output. List it in launcher L-02.

## Add a scenario or question
Take the next ID in its series (FL-<PREFIX>-n, FH-, CW-, RK-, PRE-, Q-nn). Flaw hunts and compliant-but-wrong items need a key.

## Add a mental model
Copy `04-models/_TEMPLATE.md` → `04-models/M-nn.md`; link it from the rules that use it.

## Add a launcher
Append `L-nn` to `LAUNCHERS.md`; one purpose per launcher.

## Link a new agent or project
Add its prefix to the registry (CV-07) and its link mechanism to `SYNC-PROTOCOL.md`.

## Retire or replace
Follow CV-05. Nothing is deleted.

## Keep files loadable
When a registry passes ~150 lines, split it by theme (`HEURISTICS-<theme>.md`), keep all IDs, and list both files in the Tier table of `00-INDEX.md`.
