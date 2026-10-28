---
type: red-flags
version: 3
status: active
---
# Red Flags

A red flag is a visceral signal that triggers an immediate block or investigation.
Format: `- **RF-nn** SIGNAL <signal> → MEANS <meaning> → DEFAULT <response> | dom: <PREFIX|*> | conf: <1–5> | ev: <S-nn, A-nn> | status: active ^rf-nn`

## Flags

- **RF-01** SIGNAL `NEXT_PUBLIC_*` containing `SERVICE_ROLE`, `SECRET`, or private keys inside client code → MEANS Complete RLS bypass and full database compromise exposed in the browser bundle → DEFAULT Hard-block PR (`GATE: FAIL CS-01`), rotate the leaked secret immediately, and move privileged logic to a Server Action or `SECURITY INVOKER` RPC | dom: CS | conf: 5 | ev: S-01 (Cringe #1), A-01 (SEC-03), A-02 (Rule 4) | status: active ^rf-01

- **RF-02** SIGNAL Shared UI component inside `src/components/ui/` importing `createClient`, `fetch`, or mutating state directly → MEANS Presentation layer is coupled to backend logic, breaking reusability and ownership boundaries → DEFAULT Strip all data/network logic out of `components/ui/`; pass data and callbacks strictly via props (`UI-01`) | dom: UI | conf: 5 | ev: S-01 (Cringe #1), A-02 (Sec 10.2, 12.3.1) | status: active ^rf-02

- **RF-03** SIGNAL `UPDATE` or `DELETE` called directly on audit logs, financial ledgers, stock balances, or attendance histories → MEANS Historical lineage is being overwritten in-place, hiding shrinkage, expired batches, or tampering → DEFAULT Block mutation; enforce append-only inserts with `supersedes_id` and compute balances via derived views (`CS-03`, `SO-01`) | dom: SO, CS | conf: 5 | ev: S-01 (Cringe #2), A-01 (DB-01, DB-02), A-05 (Agrivet) | status: active ^rf-03

- **RF-04** SIGNAL Approval action (`approve`, `accept`, `verify`) lacks a `submitter_id !== current_user_id` check or uses an ad-hoc status string (`"done_approved_final"`) → MEANS Self-approval fraud is possible and workflow state machine is broken → DEFAULT Enforce server-side counter-party check (`CS-02`) and constrain statuses to the canonical finite state machine (`SO-02`) | dom: CS, BA | conf: 5 | ev: S-01 (Cringe #2), A-01 (SEC-05), A-02 (Sec 12.3), A-03 (Sec 6.1) | status: active ^rf-04

- **RF-05** SIGNAL `alert("Saved!")` or success toast fired before `await` completes, or hardcoded mock success when backend is missing → MEANS UI is lying to the user about persistence → DEFAULT Remove fake save immediately; await server confirmation, handle error state, and report missing backend dependencies plainly (`UI-03`, `OP-09`) | dom: UI | conf: 5 | ev: S-01 (Cringe #3), A-02 (Sec 10.1, 10.9) | status: active ^rf-05

- **RF-06** SIGNAL Theme state initialized inside React `useEffect` (`setTheme(localStorage...)`) → MEANS Page will flash white (FOUC) on every dark-mode reload before hydration → DEFAULT Move theme class initialization to a synchronous uncompiled `<script>` in `<head>` (`UI-02`) | dom: UI | conf: 5 | ev: S-01 (Cringe #3), A-01 (UX-01), A-03 (Sec 4.4) | status: active ^rf-06

- **RF-07** SIGNAL Neon purple-pink gradients (`from-purple-600 to-pink-500`), glowing shadows, `hover:scale-110` bounce, or scattered raw hex codes (`p-[19px]`, `rounded-[27px]`) → MEANS Generic AI dashboard slop that destroys institutional trust → DEFAULT Replace with centralized semantic tokens, standard spacing scale (`4/8/12/16/24/32`), `8px/12px` radius, and restrained solid-color hover darkening (`UI-04`, `TA-05`) | dom: UI | conf: 5 | ev: S-01 (Cringe #3), A-02 (Sec 10.4–10.10) | status: active ^rf-07

- **RF-08** SIGNAL Raw `#2563EB` blue text on dark `#0B1220` background, `#0EA5A5` teal fill with white text, `11px`/`44px` text sizes, all-caps full sentences, or a destructive button labeled `"OK"` → MEANS WCAG AA contrast and accessibility failure plus high risk of accidental destructive clicks → DEFAULT Use accessible dark-mode tint (`#A5C7FF`), `#086A6A` on pale teal, strict type scale (`32/24/18/15/12px`), and `<AlertDialog>` naming the exact verb + object (`UI-02`, `UI-04`) | dom: UI | conf: 5 | ev: S-01 (Cringe #3), A-01 (UX-07), A-02 (Sec 10.4, 10.5) | status: active ^rf-08

- **RF-09** SIGNAL `camera.position.lerp()` or manual `camera.position.set()` running inside `requestAnimationFrame` while Three.js `OrbitControls.autoRotate = true` is active → MEANS Two competing writers are mutating the camera transform every frame, causing violent spherical snap-back jitter → DEFAULT Remove manual camera position lerping during auto-orbit; let `OrbitControls.autoRotate` own continuous rotation and only lerp `camera.position` when `autoRotate` is paused (`UI-07`) | dom: UI | conf: 5 | ev: S-03, A-06 (Brain3D.tsx) | status: active ^rf-09

- **RF-10** SIGNAL A `setTimeout` loading screen on a landing page before `router.push('/console')` followed by a second loader on the destination page, OR unmounting the loader on `isGraphReady` while the canvas fades in on a delayed `isReady` timer → MEANS Jarring double-loader UX and a multi-second blank void between unmount and fade-in → DEFAULT Navigate immediately on click and bind both loader unmount and canvas fade-in to the single `isReady` boolean (`UI-08`) | dom: UI | conf: 5 | ev: S-03, A-06 (page.tsx, console/page.tsx) | status: active ^rf-10
