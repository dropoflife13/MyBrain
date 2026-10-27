# Dugtong OJT — Unified Project Context

> Consolidated product, workshop, technical, role-ownership, design-system, security, and Git guidance for the shared project laptop. Read the root `CLAUDE.md`, this file, the approved `docs/SPEC.md`, and the active ticket before feature work. This file does not override `CLAUDE.md` or team-approved specs.

**Product:** Dugtong OJT
**Type:** Multi-tenant SaaS + marketplace
**Market:** Philippine colleges, universities, and technical schools with OJT requirements
**Team:** Neil Mar (UI/UX and frontend), Khent (security/accounts/student protection), Josiah (marketplace/evaluations/admin dashboard), Arwin (school-side OJT tracking)
**Hackathon:** [Event Name]
**Date:** October 14, 2026
**Unified context consolidated:** October 15, 2026

# PHINMA AI Builder Workshop — Project Rules

These rules govern how the team and coding agents build, change, test, and ship Dugtong OJT. Read them before implementation. If a rule conflicts with a suggested shortcut, follow these rules and explain the blocker plainly.

## Pinned stack — do not change

- **Frontend:** Next.js App Router, React, and TypeScript, using the versions already installed in the repository (the documented target is Next.js 15 and React 19).
- **Styling:** the existing Tailwind CSS setup and the design tokens in Section 10 of this unified context.
- **UI components:** reuse the existing shadcn/ui components in `src/components/ui/`. Extend them consistently; do not introduce a second component or CSS library.
- **Backend:** the existing **hosted Supabase project only** for database, authentication, and storage where configured. Never run Supabase locally.
- **Hosting:** Vercel. Every push to `main` deploys production; only the team leader manages `main` and production merges.
- **Environment:** never require Docker. Do not introduce another framework, database, hosting provider, CSS library, or paid service. If the project genuinely needs something outside this stack, stop, explain the need in plain English, and wait for team approval.

## The five workshop rules

1. **Deploy first.** Confirm the existing app is live on Vercel before feature work. After each completed ticket, commit and push only according to Section 14, then have the team open the available live/preview URL. Neil must never push to `main`; if production deployment or first-time setup requires a `main` operation, report it to the team leader.
2. **No spec, no feature code.** Before implementing a feature, check whether `docs/SPEC.md` exists. If it does not, do not write feature code. Tell the team to run `/grill-with-docs`, then `/to-spec`. Repository inspection and documentation needed to identify this blocker are allowed.
3. **MVP discipline.** Implement the one user type and one core job defined by the approved `docs/SPEC.md`; aim for a demoable flow of about three minutes. Do not expand scope silently. Suggest recording additional ideas in `docs/LATER.md` and wait for approval before adding them.
4. **Security baseline — mandatory even for demos.** RLS must be enabled with explicit policies on every Supabase table. Never disable, weaken, or bypass RLS. No Supabase `service_role` key or `sb_secret_` key may be added to source files or exposed to the browser. Only the Supabase URL and publishable/anon key may use `NEXT_PUBLIC_` variables. Never commit `.env.local`; never expose secrets in client code.
5. **Teach as you go.** After each change, explain in two or three plain-English sentences what changed and why. Define technical jargon the first time it appears. Keep the tone respectful and make it safe for beginners to ask questions.

## Working with this team

- Many contributors use Windows. Give commands that work in PowerShell and Git Bash; prefer existing `npm run` scripts over shell-specific tricks.
- If the same error occurs twice, stop. Explain what was tried and the likely cause; do not attempt a third variation without discussing the issue.
- Finish one ticket, report what changed and how it was checked, then wait unless the team explicitly asks you to continue.
- `npm audit` may report issues in the ESLint development toolchain. Do not run an automatic audit fix that downgrades the project. Explain the finding and leave it unchanged unless the team specifically authorizes a safe fix.

---

## 1. What We Are Building
Dugtong OJT is an **On-the-Job Training management platform** with a **built-in marketplace** that connects Philippine schools to verified partner companies.
- **Marketplace:** verified companies post OJT slots, schools request partnerships.
- **Management tool:** schools track student hours, journals, evaluations, and MOAs from a single dashboard.

---

## 4. Who Uses It
Four roles: Coordinator (school, paying customer), Supervisor (company, free/trust score), Student (free, browse/hours/journals/reports), Dugtong Admin (verification, trust scores, moderation).

---

## 9. Technical Architecture & Security Baseline
- Multi-tenant architecture with Row Level Security (RLS) enabled on every Supabase table.
- Strict server-side verification: role checks and student account provisioning occur on the server.
- No `service_role` key in client code. Public client only exposes URL and anon key.
- Audit logs are append-only. Actor, action, timestamp, old/new values.

---

## 10. Design System and Frontend Standards
- Dumb prop-driven primitives: components in `src/components/ui/` do not fetch data or know about Supabase.
- Strict design tokens: `--color-bg`, `--color-surface`, `--color-text`, `--color-primary`, status colors with accessible contrast (WCAG AA).
- Restrained interaction: solid-color darkening on hover, no bouncy transitions, no gradients, no raw hex in components.
- Honest data states: skeletons match final layout, clear empty/error states, zero fake saves or simulated mutations.

---

## 12. Team Ownership & Handoff Rules
- **Neil Mar:** UI/UX, design tokens, shared dumb components, public browsing, search/filter UI, certificate/report templates. Must not change DB schema, RLS, auth, or backend logic.
- **Khent:** Security, auth integration, RLS review, student protection, server-side account creation, append-only audit mechanism, scope acknowledgment, student reports/appeals.
- **Josiah:** Marketplace, company listings, school partner requests, partnership decisions (`requested`, `accepted`, `declined`), supervisor evaluation, admin dashboard.
- **Arwin:** Student upload (CSV/Excel server validation), deployments (only for accepted partnerships), attendance calculation, hour totals.
- **Two-Party Rule:** Partnership requests can only be accepted/declined by the receiving party; sender cannot accept their own request. Coordinator approves journals; Supervisor logs attendance and evaluates.

