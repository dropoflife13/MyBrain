---
type: taste
version: 3
status: active
---
# Taste — What I Call Good Work

Feeds `uiuxagent.md` (`UX`) and `growthagent.md` (`GR`). Format: `- **TA-nn** <sentence> | conf: <1–5> | ev: <S-nn, A-nn> | status: active ^ta-nn`

## Good work looks like
- **TA-01** Calm, high-trust data density with Linear-level clarity and Stripe-level consistency: solid surface hierarchy, subtle border contrast, and restrained solid-color hover darkening | conf: 5 | ev: S-01, A-02 (Sec 10), A-03 | status: active ^ta-01
- **TA-02** Studio-grade spatial and video experiences engineered for zero jank: procedural Three.js geometry over bloated downloads, and DOM-persistent preloaded media (`grid-rows-[0fr]` → `[1fr]`) with zero black flash on hover | conf: 5 | ev: S-01, A-03 (Sec 2, Sec 3), A-04 | status: active ^ta-02
- **TA-03** Strict typographic rhythm: defined scale (32/24/18/15/12px), geometric headings (Satoshi/Inter Tight), clean UI body (Inter), and monospace (`JetBrains Mono`) for IDs, timers, and numeric telemetry | conf: 5 | ev: S-01, A-02 (Sec 10.5), A-03 (Sec 3, Sec 4) | status: active ^ta-03
- **TA-04** Flash-free dual theming: synchronous inline `<head>` script sets dark/light state before first paint, paired with WCAG AA verified contrast tokens in both themes | conf: 5 | ev: S-01, A-01 (UX-01), A-02 (Sec 10.4), A-03 (Sec 4.4) | status: active ^ta-04
- **TA-13** Video-editor pacing and storyboarding: enforce the 10-second rule (cut dead air, deliver the hook/payoff immediately like CITEMAS's 10s reel cut and Dugtong's 3-minute MVP flow) and structure every user flow as a storyboarded timeline (Problem → Friction → 'Aha' Action → Verified Outcome) | conf: 5 | ev: S-01 (Step 3), A-02 (Rule 3), A-03 (Sec 3), A-05 (Premiere Pro/CapCut) | status: active ^ta-13

## Bad work smells like
- **TA-05** Generic "AI dashboard slop": purple/neon gradients, glowing borders, bouncy hover scaling (`scale-105`), and oversized decorative cards | conf: 5 | ev: S-01, A-02 (Sec 10) | status: active ^ta-05
- **TA-06** Broken contrast and color-only states: raw `#2563EB` blue text on dark backgrounds, pale teal on white, or status pills without readable text labels | conf: 5 | ev: S-01, A-02 (Sec 10.4) | status: active ^ta-06
- **TA-07** Arbitrary font sizes (11px, 13px, 44px), all-caps sentences, misaligned table numerics, and layout shift (CLS) when skeletons or media swap in | conf: 5 | ev: S-01, A-01 (UX-05), A-02 (Sec 10.5, 10.7) | status: active ^ta-07
- **TA-08** Dead controls, decorative filters, fake sorting, or optimistic "fake saves" that lie about backend state | conf: 5 | ev: S-01, A-02 (Sec 10.1, 10.10) | status: active ^ta-08

## Style defaults (docs, diagrams, naming, structure, code)
- **TA-09** Composable, dumb prop-driven UI primitives (`shadcn/ui` foundation) cleanly separated from data-fetching containers and server contracts | conf: 5 | ev: S-01, A-02 (Sec 10.2, 12.3.1), A-05 (Godot data-driven systems) | status: active ^ta-09
- **TA-10** Specs use numbered sections, explicit role-ownership tables ("Owns" vs "Must not independently change"), Mermaid flow/sequence diagrams, and stable rule IDs (`DB-01`, `UX-01`) | conf: 5 | ev: A-01, A-02, A-03 | status: active ^ta-10

## Work I admire, and why (cite A-nn)
- **TA-11** Linear & Stripe interfaces for calm density, keyboard-first ergonomics, and disciplined token hierarchy (`A-02` Sec 10) | conf: 5 | ev: A-02 | status: active ^ta-11
- **TA-12** Premiere Pro / studio telemetry HUDs and tactical game UIs for frame-accurate feedback (`00:0X / 00:10S CUT`, corner reticles, ScrollSpine gauges) (`A-03` Sec 3–4, `A-05`) | conf: 5 | ev: A-03, A-05 | status: active ^ta-12
