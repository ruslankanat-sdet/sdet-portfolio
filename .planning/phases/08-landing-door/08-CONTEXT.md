# Phase 8: Landing Door — Context

**Gathered:** 2026-05-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the `mode === null` stub in `ResumeGateInner` (`src/app/page.tsx`) with the full split-screen Door component — cream left half + dark IDE right half — with flex-grow hover expand animation, keyboard accessibility, localStorage persistence, and `?reset` support. The ResumeGate routing shell and localStorage logic are already implemented; this phase delivers the Door UI only.

**Phase 9 boundary:** RecruiterView replaces the `mode === 'recruiter'` stub. Door routes to it but does not implement it.

</domain>

<decisions>
## Implementation Decisions

### Content
- **D-01:** Use Ruslan Kanatbek's real name in Phase 8 — no "Alex Morgan" placeholder in production. The door is visitor-facing and the site is live while actively applying.
- **D-02:** Recruiter half (cream) tagline: *"A readable, single-column résumé. The career, the numbers, how to reach me."*
- **D-03:** IDE half (dark) tagline: *"Open the files, run the smoke test, ask the agent."*
- **D-04:** Wordmark pattern follows the design: `ruslan.kanatbek` (adapts `alex.morgan` from prototype). Recruiter CTA: "Enter the résumé →". IDE CTA: "$ ./open-ide →".

### Component Structure
- **D-05:** Extract Door to `src/components/door/DoorScreen.tsx` — follows the project's component-directory pattern (`src/components/ide/`, `src/components/layout/`). `page.tsx` stays slim; DoorScreen is importable in Phase 9 for the back-link.
- **D-06:** Implement LogoMark as `src/components/door/LogoMark.tsx` — inline SVG (18×18 viewBox: angular arrow path + circle, drawn in `currentColor`). Co-located in `door/` so Phase 9's Masthead can import it from the same location without duplication.

### CSS Approach
- **D-07:** Add cream/forest design tokens to `:root` in `src/app/globals.css` alongside existing IDE tokens. No separate layer or block — same `:root` scope, clearly sectioned with a comment.
- **D-08:** Add `.door-*` utility classes to `globals.css` (following the `site-body`/`site-main` pattern). No CSS Modules (not used anywhere in the codebase) and no Tailwind-only approach (the oklch forest values and flex-grow animation need raw CSS).
- **D-09:** Cream tokens to add: `--paper`, `--paper-deep`, `--paper-soft`, `--ink`, `--ink-soft`, `--ink-muted`, `--ink-faint`, `--rule`, `--rule-soft`, `--forest`, `--forest-deep`, `--forest-soft`, `--forest-line`. Source of truth: `resume.css` in the design handoff.

### Fonts
- **D-10:** Expand Newsreader weight range in `src/app/layout.tsx` from `['400', '500']` to `['300', '400', '500', '600', '700']`. Both italic and normal styles already loaded. Phase 9's hero headline needs heavier weights too — load once now.

### Claude's Discretion
- Hover animation timing and easing — use values from `resume.css` (`.55s cubic-bezier(.4,.0,.2,1)`) verbatim.
- Exact padding values for door halves — use `resume.css` values (`padding: 40px 64px 48px`).
- Mobile breakpoint for vertical stacking — use 760px from the design README.
- `prefers-reduced-motion` guard for animations — implement per design README ("gate them behind `prefers-reduced-motion: no-preference`").

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design handoff (primary source of truth for Phase 8)
- `.planning/design/design_handoff_resume_v1/README.md` — Full design spec: layout, interactions, tokens, typography, assets. Section "Screens / Views → 1. Landing — The Door" is the Phase 8 spec.
- `.planning/design/design_handoff_resume_v1/resume.css` — Complete CSS including: cream/forest token values, `.door` + `.door-half` layout, flex-grow hover animation (`.door:hover .door-half { flex-grow: 0.85 }` → `:hover { flex-grow: 1.3 }`), keyframes, mobile stacking at 760px, `@media print` block.
- `.planning/design/design_handoff_resume_v1/resume-app.jsx` — `Door` component prototype with `DoorIdentity`, keyboard handlers (`Enter`/`Space`), `role="button"` + `tabIndex={0}` pattern, `chooseRecruiter`/`chooseIDE` logic.
- `.planning/design/design_handoff_resume_v1/recruiter.jsx` — Contains `LogoMark` SVG definition (search `function LogoMark`) — lift as-is into `src/components/door/LogoMark.tsx`.

### Existing code to integrate with
- `src/app/page.tsx` — ResumeGate shell. The `mode === null` branch in `ResumeGateInner` is the Door insertion point. `readStoredMode`, `clearStoredMode`, `mode`, `setMode` are already implemented — DoorScreen receives callbacks, does not manage storage itself.
- `src/app/layout.tsx` — Root layout; Newsreader font declaration needs weight expansion (D-10).
- `src/app/globals.css` — IDE token pattern; cream tokens go here (D-07, D-08, D-09).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ResumeGate` / `ResumeGateInner` (`src/app/page.tsx`): Mode logic is complete. Door replaces the `mode === null` return only. DoorScreen receives `onChooseRecruiter` and `onChooseIDE` callbacks — no localStorage calls inside DoorScreen.
- `IDEShell` (`src/components/ide/IDEShell.tsx`): Already rendered inline when `mode === 'ide'`. No changes needed.
- `pulse-dot` keyframe in `globals.css`: Exists but uses IDE green (`--green-rgb`). The door's recruiter half needs a forest-green variant for the status availability dot (Phase 9 concern — Phase 8's Door doesn't show the pulse dot).

### Established Patterns
- `'use client'` directive: Required; `DoorScreen.tsx` uses `onClick`/`onKeyDown` event handlers.
- Mount guard (`mounted` state + `useEffect`): Already in `ResumeGateInner` — DoorScreen itself is purely presentational (no localStorage reads), so no mount guard needed inside DoorScreen.
- CSS custom property usage: globals.css defines vars, components reference them via `className` (not inline `style={{ color: 'var(--x)' }}`). Follow this pattern in DoorScreen.
- No Tailwind for animated values: Tailwind v4 supports `@theme` extensions but the flex-grow animation and oklch forest values are easier as raw CSS in globals.css — consistent with how IDE animations are done.

### Integration Points
- `src/app/page.tsx` line 76: `// Phase 8 will replace this stub with the full Door component` — this is the insertion point.
- `src/app/layout.tsx` line 13: `Newsreader({ ... weight: ['400', '500'], ... })` — change to `['300', '400', '500', '600', '700']`.
- `src/app/globals.css` `:root` block (lines 8–69): Append cream/forest tokens after the existing IDE tokens.

</code_context>

<specifics>
## Specific Ideas

- The hover expand animation is flex-grow based, not scale or shadow: when cursor is anywhere on `.door`, both halves shrink to `flex-grow: 0.85`; the hovered half grows to `1.3`. This creates the "other half recedes" effect without JS.
- The right half has a subtle corner glow (IDE green, very faint) — referenced in the design README as "very faint IDE green glow in a corner". Implemented in `resume.css` as a `::before` or `::after` pseudo-element. Lift from `resume.css` verbatim.
- Keyboard accessibility: each half needs `role="button"`, `tabIndex={0}`, and `onKeyDown` handling `Enter` and `Space` keys — prototype in `resume-app.jsx` shows the pattern.
- CTA caption on recruiter half: small mono text "≈ 90 sec read" to the right of the "Enter the résumé →" button — included in the design.

</specifics>

<deferred>
## Deferred Ideas

- Ruslan's actual recruiter-half copy (pitch paragraph, metrics, experience, stack) — Phase 9 + Phase 10 scope.
- Print stylesheet — Phase 10 scope.
- Availability status pulse dot on the Door — the pulse dot is part of the recruiter Hero section, not the Door itself. Phase 9 scope.

</deferred>

---

*Phase: 8-landing-door*
*Context gathered: 2026-05-27*
