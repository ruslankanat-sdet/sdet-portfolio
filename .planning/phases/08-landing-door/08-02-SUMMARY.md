---
phase: 08-landing-door
plan: "02"
subsystem: e2e-tests
tags:
  - playwright
  - accessibility
  - door
  - e2e
dependency_graph:
  requires:
    - 08-01  # DoorScreen wired into page.tsx
  provides:
    - e2e coverage for DOOR-01, DOOR-03, DOOR-04
  affects:
    - e2e/landing.spec.ts
    - e2e/ide-interactions.spec.ts
    - e2e/navigation.spec.ts
tech_stack:
  added: []
  patterns:
    - "page.addInitScript() for pre-navigation localStorage seeding in Playwright"
    - "test.beforeEach for shared setup across describe-scoped tests"
key_files:
  modified:
    - e2e/landing.spec.ts
    - e2e/ide-interactions.spec.ts
    - e2e/navigation.spec.ts
    - src/components/ide/Sidebar.module.css
    - src/components/ide/EditorArea.module.css
    - src/components/ide/Terminal.module.css
    - src/components/ide/FileView.tsx
decisions:
  - "Used test.beforeEach + page.addInitScript to seed localStorage before every test.goto that expects IDE chrome — addInitScript runs before navigation so ResumeGate reads the seeded value on mount"
  - "Bumped --text-faint (#5a6678) to --text-muted (#8b96a8) for all paneSubtitle/termTab/termMeta/logDetail elements — text-faint fails WCAG AA 4.5:1 threshold on all IDE backgrounds"
  - "Removed Terminal logIn keyframe animation — opacity:0 at animation start caused axe-core to compute near-zero contrast for log row text at scan time"
  - "Added tabIndex={0} to FileView <pre> to satisfy WCAG 2.1.1 scrollable-region-focusable rule"
metrics:
  duration: "~35 minutes"
  completed: "2026-05-27T22:47:57Z"
  tasks_completed: 2
  files_changed: 7
---

# Phase 08 Plan 02: E2E Gate for DoorScreen — Summary

Playwright e2e suite updated with beforeEach IDE-mode seeding and 4 new Landing door tests covering DOOR-01/DOOR-03/DOOR-04; all 19 tests pass after fixing surfaced WCAG AA violations.

## What Was Built

### Task 1 + Task 2 (combined into one commit)

Both tasks modified `e2e/landing.spec.ts` before the context resumed, so they were committed together:

**Task 1 — Pre-seed IDE mode in existing specs:**
- `e2e/landing.spec.ts`: added `test.beforeEach` with `page.addInitScript(() => localStorage.setItem('resume-mode', 'ide'))` inside the `Landing page` describe block
- `e2e/ide-interactions.spec.ts`: same `test.beforeEach` inside `IDE interactions` describe
- `e2e/navigation.spec.ts`: same `test.beforeEach` inside `Navigation` describe

**Task 2 — New Landing door describe block:**
- Appended `test.describe('Landing door', ...)` to `e2e/landing.spec.ts` with 4 tests:
  - `DOOR-01: shows door at / with no stored mode` — verifies both CTAs visible
  - `DOOR-03 same-session: clicking recruiter half re-renders without navigation` — URL stays `/`, recruiter stub visible
  - `DOOR-03 return-visit: pre-seeded ide mode skips the door` — IDE sidebar visible, door CTAs absent
  - `DOOR-04: ?reset clears stored mode and re-shows the door` — door returns after reset param

## Commits

| Hash | Type | Description |
|------|------|-------------|
| `c75360c` | test | add beforeEach IDE mode seed to existing specs + DOOR tests + Rule 1 fixes |

## Test Results

`pnpm playwright test` — **19 passed, 0 failed**

| Spec file | Tests | Result |
|-----------|-------|--------|
| e2e/landing.spec.ts — Landing page | 7 | all pass |
| e2e/landing.spec.ts — Landing door | 4 | all pass |
| e2e/ide-interactions.spec.ts | 3 | all pass |
| e2e/navigation.spec.ts | 2 | all pass |
| e2e/about.spec.ts | 3 | all pass |

## Requirement Coverage

| Requirement | Test | Status |
|-------------|------|--------|
| DOOR-01 | `DOOR-01: shows door at / with no stored mode` | covered |
| DOOR-03 | `DOOR-03 same-session: clicking recruiter half re-renders without navigation` | covered |
| DOOR-03 | `DOOR-03 return-visit: pre-seeded ide mode skips the door` | covered |
| DOOR-04 | `DOOR-04: ?reset clears stored mode and re-shows the door` | covered |

Note: DOOR-02 (recruiter view Phase 9 stub) is exercised implicitly by the same-session test asserting the Phase 9 stub text is visible, though no dedicated DOOR-02 test was specified in the plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] WCAG AA color-contrast violations surfaced by IDE mode pre-seeding**

- **Found during:** Task 1 execution — adding `beforeEach` caused the axe test to scan the IDE shell instead of the DoorScreen
- **Issue:** Multiple IDE elements used `--text-faint` (`#5a6678`) which fails the 4.5:1 WCAG AA threshold on all IDE background colors. Affected: `paneSubtitle` in Sidebar/EditorArea/Terminal, inactive `termTab` labels, `termMeta`, and `logDetail`
- **Fix:** Replaced all failing `color: var(--text-faint)` with `color: var(--text-muted)` (`#8b96a8`, which achieves 4.5:1+ on all IDE backgrounds)
- **Files modified:** `src/components/ide/Sidebar.module.css`, `src/components/ide/EditorArea.module.css`, `src/components/ide/Terminal.module.css`
- **Commit:** `c75360c`

**2. [Rule 1 - Bug] Terminal logIn animation caused near-zero axe contrast reading**

- **Found during:** Task 1 — axe reported ~1:1 contrast on Terminal log rows
- **Issue:** The `@keyframes logIn` animation started at `opacity: 0`. axe-core computed the blended foreground color at scan time while the animation was mid-frame (opacity near 0), producing near-black computed values on a dark background
- **Fix:** Removed the `logIn` keyframe animation and `animation:` property from `.log`. Terminal logs render immediately without fade-in
- **Files modified:** `src/components/ide/Terminal.module.css`
- **Commit:** `c75360c`

**3. [Rule 2 - Missing critical functionality] FileView `<pre>` not keyboard-accessible**

- **Found during:** Task 1 axe scan
- **Issue:** `FileView.tsx` `<pre>` has `overflow: auto` (scrollable) but no `tabIndex`, failing WCAG 2.1.1 scrollable-region-focusable rule
- **Fix:** Added `tabIndex={0}` to the `<pre>` element in `FileView.tsx`
- **Files modified:** `src/components/ide/FileView.tsx`
- **Commit:** `c75360c`

**4. [Structural - Tasks 1+2 combined commit]**

- Both tasks were already written into `e2e/landing.spec.ts` before the previous context window ended. On context resume, all changes were committed atomically in a single commit rather than two separate commits. The result is identical — the plan's acceptance criteria are all satisfied.

## Known Stubs

None introduced in this plan. The `Recruiter view — coming in Phase 9` text in `src/app/page.tsx` is an intentional stub from Phase 08-01 that Phase 09 will resolve.

## Threat Flags

None. This plan modifies only `e2e/` test files and IDE CSS/TSX files. No new network endpoints, auth paths, or schema changes introduced.

## Self-Check: PASSED

- `e2e/landing.spec.ts` exists with `test.describe('Landing door'`
- `e2e/ide-interactions.spec.ts` exists with `test.beforeEach`
- `e2e/navigation.spec.ts` exists with `test.beforeEach`
- `src/components/ide/FileView.tsx` exists with `tabIndex={0}` on `<pre>`
- Commit `c75360c` verified in git log
- `pnpm playwright test` exits 0 with 19 passed
