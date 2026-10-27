---
type: patterns
version: 3
status: active
---
# Patterns — Recurring Situations

A pattern is a situation that keeps returning and the play that works.
Format: `- **P-nn** SITUATION <situation> → PLAY <play> | breaks: <condition> | dom: <PREFIX|*> | conf: <1–5> | ev: <S-nn, A-nn> | status: active ^p-nn`

## Patterns

- **P-01** SITUATION A two-party approval rule (`submitter ≠ approver`) blocks a Day-1 pilot organization that only has a single staff member (`active_staff_count == 1`) → PLAY Permit self-approval only while `active_staff_count == 1`, stamp every self-approved row with `approval_mode: solo_operator_waiver` in the append-only audit log, and auto-enforce `submitter ≠ approver` the moment a 2nd staff seat is added | breaks: external inter-organization contracts (e.g. School ↔ Company MOA/partnership) where two distinct legal entities must always sign off | dom: CS, BA | conf: 4 | ev: S-01 (Triad 3), A-01 (SEC-05), A-02 (Sec 7, 12.3), A-05 (Agrivet) | status: active ^p-01

- **P-02** SITUATION A high-craft 3D WebGL centerpiece or hover video reel is loaded on a low-end mobile phone, weak network, or `prefers-reduced-motion` browser → PLAY Preload short video reels in DOM-persistent CSS Grid rows (`0fr → 1fr`) to avoid remount flashes, use procedural math (<50KB) over heavy `.gltf` files, and auto-downgrade WebGL to a crisp static SVG/blueprint fallback when FPS < 30 (`UX-13 > TA-02`) | breaks: standalone 3D/CAD inspection apps where manipulating the full mesh is the primary user job | dom: UI, SO | conf: 4 | ev: S-01 (Triad 1), A-01 (UX-05, UX-13), A-03 (Sec 2, 3), A-04 | status: active ^p-02

- **P-03** SITUATION Pitching an MVP to judges/panels or onboarding a busy institutional user who has zero patience for fluff → PLAY Storyboard the flow as a 4-beat timeline (Problem → Friction → 'Aha' Action → Verified Outcome), cut media previews at ≤10 seconds (`#t=0,10`), cut the live MVP demo at ≤3 minutes, and pre-empt the panel's #1 security/business objection directly inside the demo flow | breaks: exhaustive compliance audit exports or technical reference manuals | dom: BA, UI | conf: 5 | ev: S-01 (Step 3.2), A-02 (Rule 3), A-03 (Sec 3), A-05 (Shark Tank Champion, Premiere Pro) | status: active ^p-03

- **P-04** SITUATION Multi-project developer using an AI coding assistant across separate client, school, and hackathon repositories → PLAY Keep the Procedural Brain and 7-Agent Suite in one central Git repository (`brain-web`) and attach it to each project via a VS Code Multi-Root Workspace (`.code-workspace` in `.gitignore`) + a project root `CLAUDE.md` bridge file | breaks: air-gapped client machines where mounting an external local folder is prohibited (use single-file `DIGEST.md` paste instead) | dom: * | conf: 5 | ev: S-01, CLAUDE.md, SP-04 | status: active ^p-04

- **P-05** SITUATION Other developers want to fork or clone your personal AI Brain Vault to use on their own engineering projects → PLAY Ship the full 3D WebGL engine and all 7 Core Agent Gatekeepers (`PM, UX, GR, SD, IR, DB, SEC` enforced by `BN-00`) intact, but reset all personal domain/taste/principle files in the starter template (`/brain-template.zip` & Blank Preview mode) to blank-slate `empty` (`0 rules`) so every adopter must run `Launcher L-01` (`THE-TEST.md`) and earn their own synaptic nodes | breaks: team-wide shared engineering standards repositories where all team members intentionally inherit the organization's canonical rulebook | dom: SO, BA | conf: 5 | ev: S-03, A-06 (console/page.tsx, brain-parser.ts) | status: active ^p-05
