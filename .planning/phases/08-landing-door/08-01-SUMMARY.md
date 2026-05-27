---
phase: 08-landing-door
plan: "01"
subsystem: door-ui
tags: [door, split-screen, css-tokens, keyboard-a11y, unit-tests, newsreader]
dependency_graph:
  requires: []
  provides:
    - DoorScreen component (src/components/door/DoorScreen.tsx)
    - LogoMark SVG component (src/components/door/LogoMark.tsx)
    - Cream/forest CSS tokens in globals.css
    - .door-* utility classes in globals.css
    - Newsreader weights 300/400/500/600/700
  affects:
    - src/app/page.tsx (ResumeGateInner mode===null branch)
    - src/app/globals.css (token and class additions)
    - src/app/layout.tsx (font weight expansion)
tech_stack:
  added: []
  patterns:
    - "'use client' directive on event-handler components"
    - "role=button + tabIndex=0 + onKeyDown for div-as-button keyboard accessibility"
    - "e.preventDefault() on Space keydown to prevent page scroll"
    - "CSS custom properties in :root for always-on design tokens"
    - "height: 100% on door flex child (not min-height: 100vh)"
    - "RTL + userEvent.setup() + user.tab() + user.keyboard() pattern for keyboard tests"
key_files:
  created:
    - src/components/door/LogoMark.tsx
    - src/components/door/DoorScreen.tsx
    - src/components/door/__tests__/DoorScreen.test.tsx
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
decisions:
  - "Use height: 100% (not min-height: 100vh) on .door to fill .site-body flex parent (Pitfall 1)"
  - "Remove explicit JSX.Element return type annotations — not used in this codebase (auto-fixed TSC error)"
  - "Replace oklch IDE green references with var(--green) and rgba() equivalents per plan spec"
metrics:
  duration: "4 minutes"
  completed: "2026-05-27T21:15:48Z"
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 3
---

# Phase 8 Plan 01: DoorScreen UI + Tokens + Font Expansion Summary

**One-liner:** Full-viewport cream/dark split-screen Door with flex-grow animation, LogoMark SVG, keyboard accessibility, 9 Vitest tests, cream/forest CSS tokens, and Newsreader weight expansion 300-700.

## What Was Built

### Task 1: Cream/forest tokens and .door-* classes in globals.css
Appended three CSS blocks to `src/app/globals.css` after the `:root[data-theme='light']` block:
- **Block 1:** 13 cream/forest design tokens on `:root` (--paper, --paper-deep, --paper-soft, --ink family, --rule family, --forest/forest-deep/forest-soft/forest-line)
- **Block 2:** All .door-* layout classes ported verbatim from resume.css with project adaptation: `.door` uses `height: 100%` instead of `min-height: 100vh`, IDE green oklch values replaced with `var(--green)` and `rgba(61, 220, 132, ...)` equivalents, `.door-half` flex-grow transition (`.55s cubic-bezier(.4,.0,.2,1)`), `.door:hover .door-half { flex-grow: 0.85 }` and `:hover { flex-grow: 1.3 }`, plus identity stripe, eyebrow, body, CTA, foot, bg-pattern rules
- **Block 3:** `prefers-reduced-motion: reduce` gate + 760px mobile breakpoint (column layout, reset flex-grow)

### Task 2: Newsreader weight expansion in layout.tsx
Changed Newsreader weight array from `['400', '500']` to `['300', '400', '500', '600', '700']` — satisfying D-10 for Phase 9 hero headline needs.

### Task 3: LogoMark, DoorScreen, tests, and page.tsx wiring
- **LogoMark.tsx:** Pure presentational SVG function (no `'use client'`), parameterized `size` prop defaulting to 18, `aria-hidden="true"`, the project's glyph (path + circle from recruiter.jsx)
- **DoorScreen.tsx:** `'use client'` client component with two `role="button"` halves, keyboard handlers for Enter (invoke callback) and Space (e.preventDefault() first, then callback), all styling via globals.css class names
- **DoorScreen.test.tsx:** 9 tests covering DOOR-01 (rendering) and DOOR-02 (click + keyboard interactions) — all passing
- **page.tsx:** Added DoorScreen import, replaced 18-line stub with `<DoorScreen onChooseRecruiter=... onChooseIDE=... />` where callbacks use the existing `MODE_KEY` constant and the project's try/catch localStorage idiom

## Tests Added

| Test | Description | Pass |
|------|-------------|------|
| renders two role=button halves | DOOR-01: two button roles present | PASS |
| recruiter half shows D-02 tagline and Enter CTA | DOOR-01: correct copy | PASS |
| IDE half shows D-03 tagline and open-ide CTA | DOOR-01: correct copy | PASS |
| wordmark ruslan.kanatbek appears twice | DOOR-01: identity on both halves | PASS |
| clicking recruiter half calls onChooseRecruiter | DOOR-02: click interaction | PASS |
| clicking IDE half calls onChooseIDE | DOOR-02: click interaction | PASS |
| Enter on focused recruiter half calls onChooseRecruiter | DOOR-02: keyboard Enter | PASS |
| Space on focused recruiter half calls onChooseRecruiter | DOOR-02: keyboard Space | PASS |
| Enter on focused IDE half calls onChooseIDE | DOOR-02: keyboard Enter on second half | PASS |

**Total: 9 tests passing** (`pnpm vitest run src/components/door` exits 0)

## Verification Results

| Command | Result |
|---------|--------|
| `pnpm tsc --noEmit` | PASS |
| `pnpm lint` | PASS — no warnings or errors |
| `pnpm vitest run src/components/door` | PASS — 9/9 tests |
| `pnpm next build` | PASS — clean build, `/` route 24.9 kB |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | c4148fc | feat(08-01): add cream/forest tokens and .door-* utility classes to globals.css |
| Task 2 | 0210c13 | feat(08-01): expand Newsreader weight array to 300/400/500/600/700 |
| Task 3 | 8c3aaf5 | feat(08-01): add LogoMark, DoorScreen components and wire into ResumeGate |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript error: Cannot find namespace 'JSX'**
- **Found during:** Task 3 — after creating LogoMark.tsx and DoorScreen.tsx with explicit `: JSX.Element` return type annotations
- **Issue:** The project's tsconfig does not resolve the global `JSX` namespace directly; existing components in this codebase omit explicit return types
- **Fix:** Removed explicit `: JSX.Element` return type annotations from both `LogoMark` and `DoorScreen` functions — idiomatic TypeScript React and consistent with existing codebase patterns
- **Files modified:** `src/components/door/LogoMark.tsx`, `src/components/door/DoorScreen.tsx`
- **Commit:** 8c3aaf5 (same task commit)

## Known Stubs

None. The DoorScreen component renders production copy (Ruslan Kanatbek's name, real taglines per D-01 through D-04). The `mode === 'recruiter'` stub in page.tsx predates this plan (Phase 9 scope) and is unchanged by design.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. Phase 8 is purely UI — CSS tokens, React components, localStorage write via existing MODE_KEY constant. The localStorage write is guarded by the existing try/catch pattern and the read-side enum validation (T-08-01/T-08-02 in plan threat model) was already in place from Phase 7.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| src/components/door/LogoMark.tsx | FOUND |
| src/components/door/DoorScreen.tsx | FOUND |
| src/components/door/__tests__/DoorScreen.test.tsx | FOUND |
| .planning/phases/08-landing-door/08-01-SUMMARY.md | FOUND |
| Commit c4148fc (Task 1 — globals.css tokens) | FOUND |
| Commit 0210c13 (Task 2 — Newsreader weights) | FOUND |
| Commit 8c3aaf5 (Task 3 — components + tests) | FOUND |
