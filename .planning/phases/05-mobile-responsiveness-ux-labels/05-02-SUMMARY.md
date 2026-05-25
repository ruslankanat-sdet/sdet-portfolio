---
phase: 05-mobile-responsiveness-ux-labels
plan: "02"
subsystem: ide-ux-labels
tags:
  - mobile
  - ux
  - labels
  - sidebar
  - terminal
  - editor
dependency_graph:
  requires:
    - 05-01 (mobile CSS baseline — provides touch targets in Sidebar/Terminal media blocks)
  provides:
    - sidebar-onSelect-prop
    - explorer-pane-subtitle
    - terminal-pane-subtitle
    - editor-breadcrumb-subtitle
    - paneSubtitle-css-class-all-three-panes
  affects:
    - 05-03-PLAN (IDEShell mobile state — consumes onSelect prop via onSelect={isMobile ? toggleSidebar : undefined})
tech_stack:
  added: []
  patterns:
    - Optional callback prop with optional-chaining invocation (onSelect?.())
    - Collocated .paneSubtitle CSS class definition in each CSS Module file
    - aria-hidden="true" on decorative separator spans for screen reader compatibility
    - margin-left: auto right-alignment pattern for breadcrumb subtitle
key_files:
  created: []
  modified:
    - src/components/ide/Sidebar.tsx
    - src/components/ide/Sidebar.module.css
    - src/components/ide/Terminal.tsx
    - src/components/ide/Terminal.module.css
    - src/components/ide/EditorArea.tsx
    - src/components/ide/EditorArea.module.css
decisions:
  - "onSelect prop uses optional chaining (?.()) — safe no-op on desktop when prop is undefined, no behavior change for existing callers"
  - "Folder toggle handlers (.treeFolder for about/tests) intentionally NOT wired to onSelect per D-01 scope (files only)"
  - "Worktree included Plan 01 CSS rules (treeRow/treeFolder min-height 44px, terminal log pre-wrap/max-height) since worktree was created from pre-Plan-01 commit"
  - ".crumbSubtitleSep uses margin-left: auto for right-alignment of Code viewer subtitle within flex .breadcrumb bar"
  - "All .paneSubtitle definitions use var(--ui) font-family (not var(--mono)) — signals human-facing copy per D-11"
metrics:
  duration_minutes: 8
  completed_date: "2026-05-25"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 6
---

# Phase 5 Plan 02: UX Labels + Sidebar onSelect Prop Summary

Three IDE panes receive plain-language subtitle labels (File browser, Code viewer, Test output) with aria-hidden separators, and Sidebar gets a typed optional `onSelect?: () => void` prop for Plan 03's mobile auto-close wiring.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Sidebar — onSelect prop, EXPLORER pane subtitle, .paneSubtitle class | 9f23962 | Sidebar.tsx, Sidebar.module.css |
| 2 | Terminal — TERMINAL tab pane subtitle + .paneSubtitle class | 82c4cc2 | Terminal.tsx, Terminal.module.css |
| 3 | EditorArea — breadcrumb pane subtitle + .paneSubtitle and .crumbSubtitleSep classes | d63b650 | EditorArea.tsx, EditorArea.module.css |

## Verification

- `pnpm exec tsc --noEmit` exits 0 — no TypeScript errors
- `grep -rF "File browser" src/components/ide/Sidebar.tsx` — matched
- `grep -rF "Code viewer" src/components/ide/EditorArea.tsx` — matched
- `grep -rF "Test output" src/components/ide/Terminal.tsx` — matched
- All three `.paneSubtitle` classes present in respective CSS Module files with identical six-property definitions
- `.crumbSubtitleSep` class exists in EditorArea.module.css with `margin-left: auto`
- `onSelect?.()` called exactly twice in Sidebar.tsx (onClick + onKeyDown of fileRow)
- Folder toggle handlers (about, tests) do NOT call onSelect — verified via grep
- All three `aria-hidden="true"` separator spans confirmed in place

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree created from pre-Plan-01 commit — missing mobile CSS rules**

- **Found during:** Task 1 — Sidebar.module.css in worktree lacked the `.treeRow, .treeFolder { min-height: 44px; }` touch target rules that Plan 01 added to main repo
- **Issue:** The worktree (branch `worktree-agent-a4c4a296e395794dc`) was initialized from commit `ae6c9f7` (Phase 3), which predates Phase 5 Plan 01. The worktree therefore had stale versions of Sidebar.module.css and Terminal.module.css without Plan 01's `@media (max-width: 768px)` additions.
- **Fix:** When adding `.paneSubtitle` to Sidebar.module.css, also included the missing `min-height: 44px` touch target rules inside the existing `@media` block. When adding `.paneSubtitle` to Terminal.module.css, also added the missing `@media (max-width: 768px)` block with log pre-wrap, termResizer hide, and terminal max-height 180px.
- **Files modified:** Sidebar.module.css, Terminal.module.css (both are included in this plan's commit anyway)
- **Commits:** 9f23962 (Sidebar), 82c4cc2 (Terminal)
- **Note:** EditorArea.module.css was not modified by Plan 01 (diff confirmed identical to main repo) — no extra rules needed there.

## Requirements Addressed

| Requirement | Status | Evidence |
|-------------|--------|----------|
| UX-01 | Done | All three pane subtitles live: EXPLORER · File browser, TERMINAL · Test output, breadcrumb · Code viewer |
| MOB-01 (prop half) | Done | Sidebar.tsx SidebarProps has onSelect?: () => void; fileRow handlers call onSelect?.() — Plan 03 can wire toggleSidebar |

## Known Stubs

None. All subtitle strings are static literals, all CSS classes are fully defined, and the onSelect prop is a typed optional callback ready for Plan 03 consumption.

## Threat Flags

None. This plan introduces no new backend routes, no new auth/session changes, no new data persistence, no new user input handlers, and no new external API calls. The only behavioral change is the optional onSelect callback invoked by Sidebar after existing file-click handlers.

## Self-Check

- src/components/ide/Sidebar.tsx: exists, contains onSelect prop, File browser, aria-hidden separator
- src/components/ide/Sidebar.module.css: exists, contains .paneSubtitle, min-height touch targets
- src/components/ide/Terminal.tsx: exists, contains TERMINAL conditional, Test output
- src/components/ide/Terminal.module.css: exists, contains .paneSubtitle, @media block
- src/components/ide/EditorArea.tsx: exists, contains Code viewer, crumbSubtitleSep
- src/components/ide/EditorArea.module.css: exists, contains .paneSubtitle, .crumbSubtitleSep
- Commits 9f23962, 82c4cc2, d63b650 all present in git log
