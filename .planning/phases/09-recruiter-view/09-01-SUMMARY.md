---
phase: "09"
plan: "01"
subsystem: recruiter-view
tags: [recruiter, css-modules, sticky-header, next-app-router, react, vitest, playwright]
requirements_satisfied: [REC-01, REC-02]

dependency_graph:
  requires:
    - "src/components/door/LogoMark.tsx (imported, not duplicated)"
    - "src/app/globals.css (--paper-*, --ink-*, --forest-*, --rule-*, --serif, --mono tokens)"
    - "src/app/page.tsx (ResumeGateInner stub replaced)"
  provides:
    - "src/components/recruiter/recruiter.module.css"
    - "src/components/recruiter/RecruiterView.tsx"
    - "src/components/recruiter/Masthead.tsx"
    - "src/components/recruiter/Hero.tsx"
    - "src/components/recruiter/__tests__/RecruiterView.test.tsx"
    - "e2e/recruiter.spec.ts"
  affects:
    - "src/app/page.tsx (stub removed, RecruiterView wired)"
    - "e2e/landing.spec.ts (DOOR-03 stale assertion updated)"

tech_stack:
  added: []
  patterns:
    - "CSS Modules with locally-scoped @keyframes (avail-pulse)"
    - "Two-level scroll container: recruiterScrollRoot (height:100%;overflow-y:auto) + recruiter (max-width:720px)"
    - "position:sticky masthead inside overflow-y:auto scroll ancestor"
    - "window.print() via 'use client' boundary for Download PDF CTA"
    - "vitest + @testing-library/react + userEvent for interactive unit tests"
    - "Playwright addInitScript localStorage pre-seed for E2E"

key_files:
  created:
    - "src/components/recruiter/recruiter.module.css"
    - "src/components/recruiter/Masthead.tsx"
    - "src/components/recruiter/Hero.tsx"
    - "src/components/recruiter/RecruiterView.tsx"
    - "src/components/recruiter/__tests__/RecruiterView.test.tsx"
    - "e2e/recruiter.spec.ts"
  modified:
    - "src/app/page.tsx (import RecruiterView; replace recruiter stub)"
    - "e2e/landing.spec.ts (DOOR-03 stale assertion → 'ruslan.kanat')"

decisions:
  - "Two-level scroll structure (recruiterScrollRoot div + recruiter article) chosen over single article scroll root to cleanly separate full-bleed cream background from 720px editorial column"
  - "avail-pulse @keyframes defined in recruiter.module.css (not globals.css) per CSS Modules scoping requirement — compiler links animation name automatically"
  - "Download PDF CTA uses <button type='button'> (not <a href='#'>) per plan spec — semantically correct for non-navigation action"
  - "DOOR-03 E2E assertion updated to target masthead wordmark 'ruslan.kanat' — stable, always visible, not stub-text"

metrics:
  duration: "4m 3s"
  completed: "2026-05-29"
  tasks_completed: 3
  files_created: 6
  files_modified: 2
  tests_added: 9
  e2e_tests_added: 4
---

# Phase 9 Plan 01: Recruiter View Foundation Summary

**One-liner:** CSS Module + sticky masthead + hero with avail-pulse keyframe wired into ResumeGateInner, covering REC-01 and REC-02 with 9 unit tests and 4 E2E tests.

---

## What Was Built

### Task 1 — recruiter.module.css (commit c5236c0)

Created `src/components/recruiter/recruiter.module.css` with:
- `.recruiter-scroll-root`: `height: 100%; overflow-y: auto; background: var(--paper)` — full-bleed cream surface, scroll context for sticky masthead
- `.recruiter`: `max-width: 720px; margin: 0 auto; padding: 32px 40px 120px` editorial column using `var(--serif)` 18px/1.55
- `.masthead`: `position: sticky; top: 0; z-index: 10; background: var(--paper)` — sticks within `.recruiter-scroll-root`
- `.masthead-switch` pill: 999px radius border/bg/color with forest hover state; nested `.arrow` transitions `transform .2s` on hover
- `@keyframes avail-pulse`: locally scoped, exact box-shadow values from UI-SPEC; gated by `@media (prefers-reduced-motion: no-preference)` on `.avail-dot::before`
- `.btn-primary` / `.btn-secondary`: forest fill / transparent pill buttons; hover lift and tint
- `.section` / `.section-head` / `.section-num` / `.section-title` / `.section-rule`: section scaffold for Plan 02
- `@media print` block: resets scroll overflow/height, hides `.masthead-switch` and `.ctas`
- `@media (max-width: 600px)`: `.recruiter { padding: 24px 24px 80px }` — Plan 02 adds remaining breakpoints
- Zero token redeclaration — all `var(--paper)`, `var(--forest)`, `var(--rule)` etc. reference globals.css

### Task 2 — Components + Unit Tests + page.tsx wire-up (commit c4f286f)

**Masthead.tsx** (`'use client'`):
- `<header className={styles.masthead}>` with left cluster: LogoMark (size 16, from `../door/LogoMark`), wordmark "ruslan.kanat", "/" sep, "résumé" label
- `<button type="button" className={styles.mastheadSwitch} onClick={onSwitchToIDE}>` with "Engineer view" + arrow spans

**Hero.tsx** (`'use client'`):
- `<section className={styles.hero}>` with availability pill (dot + "Status:" + "Available · Q3 start" value in forest)
- Eyebrow ghost spans: "Remote · UTC-5" and "Staff / Principal IC"
- `<h1 className={styles.headline}>` with `<em>AI products</em>` italic forest emphasis
- Pitch paragraph with exact copy from 09-UI-SPEC.md Copywriting Contract
- `<button type="button">` "Download PDF ↓" calling `window.print()` via `onClick={(e) => { e.preventDefault(); window.print(); }}`
- `<a href="mailto:alex@morgan.dev">` "alex@morgan.dev →" secondary CTA

**RecruiterView.tsx** (`'use client'`):
- `<div className={styles.recruiterScrollRoot}><article className={styles.recruiter}>` wrapping Masthead + Hero
- JSX comment: `{/* Sections, contact, footer added in Plan 02 */}`

**RecruiterView.test.tsx** (9 tests, 2 describe blocks):
- `describe('RecruiterView — rendering')`: 7 assertions (wordmark, Engineer view button, availability value, em tag, pitch, Download PDF, mailto href)
- `describe('RecruiterView — click interactions')`: 2 assertions (onSwitchToIDE called once, window.print called once)
- `beforeEach`: `vi.clearAllMocks()` + `Object.defineProperty(window, 'print', { value: vi.fn(), writable: true })`

**page.tsx**:
- Added `import { RecruiterView } from '@/components/recruiter/RecruiterView';`
- Replaced 15-line stub with `<RecruiterView onSwitchToIDE={() => { try { localStorage.setItem(MODE_KEY, 'ide'); } catch {} setMode('ide'); }} />`

### Task 3 — e2e/recruiter.spec.ts + DOOR-03 fix (commit 1f595ad)

**e2e/recruiter.spec.ts** (4 tests in `test.describe('Recruiter view')`):
- `beforeEach`: `page.addInitScript(() => { localStorage.setItem('resume-mode', 'recruiter'); })`
- REC-01 render: masthead wordmark + Engineer view pill visible
- REC-01 click: Engineer view → IDE shell visible + `localStorage.getItem('resume-mode') === 'ide'`
- REC-02 render: availability "Available · Q3 start" + `h1 em` "AI products" + pitch + Download PDF button + mailto link href starting with `mailto:`
- REC-A11Y: AxeBuilder `withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])` — zero violations expected
- No `window.print()` call in E2E (unit tests own that coverage)

**e2e/landing.spec.ts** DOOR-03:
- Updated stale assertion from `/Recruiter view — coming in Phase 9/i` to `'ruslan.kanat'` (masthead wordmark, always visible)

---

## Requirements Satisfied

| ID | Description | Status |
|----|-------------|--------|
| REC-01 | Sticky masthead with wordmark, LogoMark, "Engineer view ↗" pill switching to IDE | SATISFIED |
| REC-02 | Hero — availability pill, editorial headline, pitch, Download PDF (window.print) + email CTAs | SATISFIED |

---

## Verification Results

- `pnpm exec tsc --noEmit`: 0 TypeScript errors
- `pnpm exec vitest run RecruiterView`: 1 test file, 9 tests, all passed
- E2E: spec file created and TypeScript-clean; requires live server for execution

---

## Threat Dispositions

| Threat ID | Disposition | Status |
|-----------|-------------|--------|
| T-09-01 | accept — window.print() only; no fetch or eval | Plan respected |
| T-09-03 | mitigate — all content hardcoded JSX; zero dangerouslySetInnerHTML | VERIFIED: `grep -rn dangerouslySetInnerHTML src/components/recruiter/` returns empty |
| T-09-05 | mitigate — `'use client'` on RecruiterView.tsx, Masthead.tsx, Hero.tsx | Applied |
| T-09-02 | defer to Plan 02 — no external links in Plan 01 scope | ContactSection in Plan 02 |

---

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Notable Execution Notes

1. **Worktree merge required**: The worktree was spawned from Phase 6 state. `git merge main` was run first to bring it up to Phase 8+ state with door components and the actual page.tsx with the recruiter stub. This is normal worktree initialization — not a plan deviation.

2. **CSS Module kebab-to-camelCase**: CSS uses kebab-case class names (`.recruiter-scroll-root`, `.masthead-l`, etc.) as required. React accesses them as camelCase via `styles.recruiterScrollRoot`, `styles.mastheadL`. This is standard CSS Modules behavior.

3. **`--serif` fallback**: The globals.css `--serif` token is `var(--font-newsreader)` which is injected by next/font at the html element. The recruiter CSS references `var(--serif)` which correctly resolves through the cascade. No special handling needed.

---

## Known Stubs

None. All recruiter components in Plan 01 scope render real content from the 09-UI-SPEC.md Copywriting Contract. The JSX comment `{/* Sections, contact, footer added in Plan 02 */}` in RecruiterView.tsx is an intentional placeholder for Plan 02 work, not a data stub — the hero section is fully functional.

---

## Threat Flags

No new security surface introduced. All recruiter content is hardcoded static JSX. No new network endpoints, auth paths, file access patterns, or schema changes.

---

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| `src/components/recruiter/recruiter.module.css` exists | FOUND |
| `src/components/recruiter/Masthead.tsx` exists | FOUND |
| `src/components/recruiter/Hero.tsx` exists | FOUND |
| `src/components/recruiter/RecruiterView.tsx` exists | FOUND |
| `src/components/recruiter/__tests__/RecruiterView.test.tsx` exists | FOUND |
| `e2e/recruiter.spec.ts` exists | FOUND |
| Commit c5236c0 (CSS module) | FOUND |
| Commit c4f286f (components + tests) | FOUND |
| Commit 1f595ad (E2E + DOOR-03 fix) | FOUND |
| `pnpm exec tsc --noEmit` exits 0 | PASSED |
| `pnpm exec vitest run RecruiterView` — 9/9 pass | PASSED |
| No `dangerouslySetInnerHTML` in recruiter/ | VERIFIED |
| LogoMark NOT duplicated in recruiter/ | VERIFIED |
