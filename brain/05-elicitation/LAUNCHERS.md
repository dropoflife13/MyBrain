---
type: launchers
version: 1
status: active
---
# Launchers

Paste-ready prompts. Attach or load the listed files first. One purpose per launcher; add new ones as `L-nn`.

## L-01 Full test
```text
You are the examiner for The Test in my brain vault.
Load: 00-INDEX.md, 05-elicitation/THE-TEST.md, SCENARIO-BANK.md, QUESTION-BANK.md, ELICITATION-PROTOCOL.md, 07-meta/CONVENTIONS.md, and the domain files for: <cybersec, solutions, business-analysis>.
Run modules T0 to T10 in order. Obey TE-01…TE-08 and EP-01…EP-08.
Never show a key before its module ends. Never promote anything.
After each module, save my verbatim answers and the tacit signals you caught.
At the end, write the session file (sessions/_TEMPLATE.md) with the Report from THE-TEST.md, and list candidates in CV-02 format for 06-raw/inbox.md.
Begin with T0.
```

## L-02 One module
```text
You are the examiner for The Test. Load THE-TEST.md, SCENARIO-BANK.md, QUESTION-BANK.md, and the domain file for <domain>.
Run only module <T0–T9> for <domain>. Obey TE-01…TE-08. End with candidates and gaps; promote nothing.
```

## L-03 Domain session
```text
Run an elicitation session. Load ELICITATION-PROTOCOL.md, QUESTION-BANK.md, SCENARIO-BANK.md, 02-domains/<domain>.md, 03-heuristics/*.
Type: <A|B|C|D|E>. Use 6 questions or scenarios with no matching active rule. Obey EP-01…EP-08.
Output a session file (sessions/_TEMPLATE.md) and candidates in CV-02 format. Promote nothing.
```

## L-04 Artifact archaeology
```text
Mine the attached artifacts. Load ARTIFACT-ARCHAEOLOGY.md and CONVENTIONS.md.
Follow AA-01…AA-05 and the procedure. Register each artifact as an A-nn row, cite locations, and present each candidate as the AA-05 question.
After my answers, output candidates in CV-02 format for 06-raw/inbox.md.
```

## L-05 Weekly review
```text
Load 00-INDEX.md, 05-elicitation/GAP-FINDER.md, 06-raw/inbox.md, all active domain files, and 03-heuristics/*.
Recompute the coverage matrix, Self-Map deltas, and the Domain Map counts. List open contradictions. Propose the next session (type, domain, 5 prompts). Edit nothing until I confirm.
```

## L-06 Promotion review
```text
Load 06-raw/inbox.md and 07-meta/CONVENTIONS.md.
For each candidate show: WHEN → DO, evidence count, proposed conf per the CV-03 table, and the target file. Ask me accept / reject / needs-evidence one at a time.
For accepted items output the final CV-02 line (status: active) and the file to append it to. Do not edit files yourself.
```

## L-07 Digest regeneration
```text
Load 00-INDEX.md and all files with status: active.
Write 07-meta/DIGEST.md (≤ 60 lines) from active rules with conf ≥ 3 only (BN-10). Use its five headings. Cite the source ID on every line. Output the file; I will save it.
```

## L-08 Use the brain in a project
```text
Load 07-meta/DIGEST.md and 02-domains/<domain>.md (Tier 0/1 only). Obey 07-meta/brainagent.md.
Task: <describe>. Give advice from active rules and cite IDs. Mark anything else "generic, not from the brain". List gaps where no rule applies. Advice is advisory and never overrides the project's agent Gate IDs.
```

## L-09 Intake interview
```text
Load 01-identity/ABOUT-ME.md, 07-meta/CONVENTIONS.md, 07-meta/EXTENDING.md.
Interview me to fill ABOUT-ME.md, one section at a time, 2–3 questions per turn. Follow up on vague answers (EP-01). After each section, output the filled text for me to confirm.
Never invent anything; unknown stays "unknown". Do not create or promote rules. Start with section 1.
```

## L-10 Generate a quiz from About Me
```text
Load 01-identity/ABOUT-ME.md (status: active), 02-domains/<domain>.md, 05-elicitation/THE-TEST.md, SCENARIO-BANK.md, QUESTION-BANK.md, 07-meta/CONVENTIONS.md, 07-meta/EXTENDING.md.
Write new items for <domain> in the bank formats: ≥ 5 FL, 1 FH with key, 6 CW with keys, 1 RK with 3 pivots, 1 PRE, ≥ 5 Q, and the Sub-areas rows. Take the next free IDs.
Ground every item in a project, tool, or context stated in ABOUT-ME and cite which. Mark any assumption. If the domain is new, first propose a prefix from the free pool (CV-07) and a Sub-areas list for me to approve.
Output ready-to-append markdown per target file. Do not edit files.
```
