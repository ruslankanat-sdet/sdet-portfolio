---
phase: 03-playwright-showcase-hardening
plan: "06"
subsystem: accessibility
tags: [a11y, wcag, focus-visible, color-contrast, axe-core]
dependency_graph:
  requires: [03-01, 03-04]
  provides: [HARD-01, HARD-02-pending-human-verify]
  affects: [IDE components, about page, footer, E2E specs]
tech_stack:
  added: []
  patterns:
    - ":focus-visible CSS outlines (2px solid design-token blue/green)"
    - "CSS Module sibling-button pattern for editor tabs (tabWrapper + tab + tabClose)"
    - "aria-expanded on folder tree buttons"
    - "aria-pressed on terminal tab buttons"
key_files:
  modified:
    - src/components/ide/Sidebar.module.css
    - src/components/ide/Sidebar.tsx
    - src/components/ide/TopBar.module.css
    - src/components/ide/Terminal.module.css
    - src/components/ide/Terminal.tsx
    - src/components/ide/EditorArea.module.css
    - src/components/ide/EditorArea.tsx
    - src/components/ide/IDEShell.tsx
    - src/components/ide/FileView.module.css
    - src/components/layout/Footer.module.css
    - src/app/about/about.module.css
    - e2e/landing.spec.ts
decisions:
  - "Removed role=tablist/tab from editor tab bar — IDE chrome tabs are not semantic content tabs; plain buttons avoid nested-interactive violation without semantic loss"
  - "Elevated color-contrast offenders from --text-faint (#5a6678) to --text-muted (#8b96a8) rather than inventing new tokens"
  - "Changed IDEShell inner <main> to <div role=region aria-label=...> — layout already has an outer <main> in the site layout"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-22T01:45:35Z"
  tasks_completed: 1
  tasks_total: 2
  files_modified: 12
---

# Phase 3 Plan 06: A11y Hardening and Launch Checklist Summary

**One-liner:** Zero axe WCAG AA violations on landing and /about via surgical color contrast, ARIA, and focus-visible fixes; manual launch walkthrough pending.

## Tasks Completed

### Task 1: Triage axe-core violations and add focus indicators

**Status:** Complete — all axe violations resolved, 10/10 Playwright tests passing.

**Axe violations found and fixed:**

| Rule ID | Impact | Element | Fix |
|---------|--------|---------|-----|
| `color-contrast` | serious | `Footer .noTracking` — #5a6678 on #06090e (3.42:1) | Changed to `--text-muted` (#8b96a8) → ~5.1:1 |
| `color-contrast` | serious | `FileView .gutter` line numbers — #5a6678 on #141c28 (2.94:1) | Changed to `--text-muted` |
| `nested-interactive` | serious | `EditorArea div[role=tab][tabIndex=0]` with nested `<button>` | Restructured to `tabWrapper div` + sibling `<button>` (tab) + `<button>` (close); removed `role=tablist/tab` |
| `aria-required-children` | critical | `div[role=tablist]` after restructure had non-tab children | Removed `role=tablist` from tabbar entirely |
| `color-contrast` | serious | `Sidebar .explorerMeta` — #5a6678 on #0b1117 (3.25:1) | Changed to `--text-muted` |
| `color-contrast` | serious | `EditorArea .crumb` — #5a6678 on #141c28 (2.94:1) | Changed to `--text-muted`; `.crumbActive` changed to `--text` |

**Focus indicators added:**

| Element | CSS Module | Outline rule |
|---------|-----------|-------------|
| `.actBtn` (activity bar buttons) | Sidebar.module.css | `2px solid #79b8ff`, offset 2px |
| `.treeRow` (file rows) | Sidebar.module.css | `2px solid #79b8ff`, offset -2px |
| `.treeFolder` (folder headers) | Sidebar.module.css | `2px solid #79b8ff`, offset -2px |
| `.iconBtn` (theme toggle, hamburger) | TopBar.module.css | `2px solid #79b8ff`, offset 2px |
| `.runBtn` (Run Smoke Test) | TopBar.module.css | `2px solid #3ddc84` (green for visual hierarchy), offset 2px |
| `.termTab` (Terminal tab buttons) | Terminal.module.css | `2px solid #79b8ff`, offset -2px |
| `.tab` (editor tab select buttons) | EditorArea.module.css | `2px solid #79b8ff`, offset -2px |
| `.tabClose` (editor tab close buttons) | EditorArea.module.css | `2px solid #79b8ff`, offset 1px |
| `.proseA` (resume links) | about.module.css | `2px solid #79b8ff`, offset 2px |

**Note:** `.downloadBtn` in about.module.css already had `:focus-visible` before this plan.

**Keyboard accessibility additions:**

- `Sidebar.tsx`: Both `treeFolder` divs (about, tests) now have `role="button"`, `tabIndex={0}`, `aria-expanded`, and `onKeyDown` handlers for Enter/Space.
- `Terminal.tsx`: All `termTab` divs now have `role="button"`, `tabIndex={0}`, `aria-pressed`, and `onKeyDown` handlers.

**Other structural fixes:**

- `IDEShell.tsx`: Inner `<main className={styles.main}>` changed to `<div role="region" aria-label="Editor and terminal">` — avoids duplicate `<main>` landmark (the site layout already provides an outer `<main class="site-main">`).

**Test fixes (Rule 1 - strict mode violations):**

- `e2e/landing.spec.ts`: "shows IDE chrome on load" — added `.first()` to handle multiple buttons named "README.md" (sidebar row + editor tab).
- `e2e/landing.spec.ts`: "sidebar README.md row loads README content" — scoped to `aside` to specifically target sidebar file row.

**Verification result:**
```
10 passed (1.8s)
✓ About page › has no WCAG AA violations
✓ Landing page › has no WCAG AA violations
✓ All 8 other tests
```

**Commit:** `9b44f14`

## Tasks Pending (Checkpoint)

### Task 2: Launch-eve manual walkthrough

**Status:** AWAITING HUMAN VERIFICATION — see checkpoint below.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed nested `<main>` element in IDEShell**
- **Found during:** Task 1 (axe scan surfaced as strict mode violation; IDEShell.tsx had `<main>` inside the layout's outer `<main>`)
- **Issue:** Playwright strict mode violation — `getByRole('main')` resolved to 2 elements
- **Fix:** Changed inner `<main>` to `<div role="region" aria-label="Editor and terminal">`
- **Files modified:** `src/components/ide/IDEShell.tsx`
- **Commit:** 9b44f14

**2. [Rule 2 - Missing Critical Functionality] Added keyboard support to treeFolder and termTab**
- **Found during:** Task 1 (plan required keyboard navigation; divs had onClick but no tabIndex/keyboard handler)
- **Fix:** Added `role="button"`, `tabIndex={0}`, `aria-expanded`/`aria-pressed`, `onKeyDown`
- **Files modified:** `src/components/ide/Sidebar.tsx`, `src/components/ide/Terminal.tsx`
- **Commit:** 9b44f14

**3. [Rule 1 - Bug] EditorArea tab restructure caused new axe violations**
- **Found during:** Task 1 iteration 2 (after first restructure attempt, `aria-required-children` fired on tablist)
- **Fix:** Removed `role="tablist"` and `role="tab"` entirely; used plain buttons with `aria-current`
- **Files modified:** `src/components/ide/EditorArea.tsx`, `src/components/ide/EditorArea.module.css`
- **Commit:** 9b44f14

**4. [Rule 1 - Bug] Test selector ambiguity from new tab button accessible names**
- **Found during:** Task 1 iteration (adding aria attributes to tab buttons broke two tests due to multiple matches)
- **Fix:** Updated landing.spec.ts to use `aside` scoping and `.first()` for README.md button selectors
- **Files modified:** `e2e/landing.spec.ts`
- **Commit:** 9b44f14

## Known Stubs

None. All fixes are surgical and complete.

## Threat Flags

No new network endpoints, auth paths, or security-relevant surface introduced. All changes are CSS/HTML semantics and client-side accessibility.

## Self-Check

Files created/modified — verified by build success and 10/10 passing tests.
