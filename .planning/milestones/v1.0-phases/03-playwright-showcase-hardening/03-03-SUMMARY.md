---
phase: 03-playwright-showcase-hardening
plan: 03
subsystem: ide-sidebar
tags: [ide, sidebar, files-data, playwright, tests-folder, sample-logs]
dependency_graph:
  requires: [03-01]
  provides: [tests-folder-sidebar, playwright-sample-logs]
  affects: [src/lib/files-data.ts, src/components/ide/Sidebar.tsx]
tech_stack:
  added: []
  patterns: [files-data-entry-shape, sidebar-folder-group-pattern, outline-symbols-pattern]
key_files:
  modified:
    - src/lib/files-data.ts
    - src/components/ide/Sidebar.tsx
decisions:
  - "Embed spec file content as inline string literals (not fs.readFileSync) — files-data.ts is client-bundled"
  - "Escape regex metacharacters in embedded spec content (backslash-dot in regex patterns)"
  - "Use actual test names from spec files for SAMPLE_LOGS (entry 7: 'back link returns to /' not 'logo/home link returns to /')"
metrics:
  duration: "~8 minutes"
  completed: "2026-05-21T23:27:40Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 3 Plan 3: Wire tests/ Folder into IDE Sidebar Summary

Wire the four Playwright spec files and playwright.config.ts into the IDE sidebar under a new collapsible tests/ folder group, and replace the stale Python-style SAMPLE_LOGS with Playwright-format log entries matching the actual test names in plan 01 specs.

## What Was Built

### Task 1: Extend FILES with 5 tests/ entries and replace SAMPLE_LOGS

**File:** `src/lib/files-data.ts`

Added 5 new FileEntry records to the FILES export after contact.json:

| Key | Path | Content Source |
|-----|------|----------------|
| tests/landing.spec.ts | ~/portfolio/e2e/landing.spec.ts | Verbatim e2e/landing.spec.ts |
| tests/navigation.spec.ts | ~/portfolio/e2e/navigation.spec.ts | Verbatim e2e/navigation.spec.ts |
| tests/about.spec.ts | ~/portfolio/e2e/about.spec.ts | Verbatim e2e/about.spec.ts |
| tests/ide-interactions.spec.ts | ~/portfolio/e2e/ide-interactions.spec.ts | Verbatim e2e/ide-interactions.spec.ts |
| tests/playwright.config.ts | ~/portfolio/playwright.config.ts | Verbatim playwright.config.ts |

Each entry uses lang: typescript and icon: ts (existing FileEntryLang and FileEntryIcon union members).

Replaced SAMPLE_LOGS (was 13 Python pytest entries with fictional test names) with 14 Playwright-format entries:
- 2 info lines (command + worker count)
- 10 pass lines with real test names from plan 01 spec files
- 1 info line (horizontal rule)
- 1 ok line (summary: 12 passed in 4.2s)

### Task 2: Add tests/ folder group to Sidebar.tsx

**File:** `src/components/ide/Sidebar.tsx`

Three additions plus one enhancement:

1. TEST_FILES constant — string[] array with the 5 spec file keys in display order (landing, navigation, about, ide-interactions, playwright.config)

2. Open state extended — { about: false } to { about: false, tests: false } — both folders start collapsed

3. tests/ folder JSX block — Inserted between about/ and Root-level files blocks. Mirrors about/ pattern exactly: setOpen toggles tests, ChevronRight rotates on open.tests, label text is "tests", children render TEST_FILES.map(name => fileRow(name))

4. OUTLINE_SYMBOLS additions — 5 new entries providing decorative outline labels for each test file when selected in the editor

## Sidebar Groups Now Present

| Group | Files | Starts |
|-------|-------|--------|
| about/ | bio.json, experience.yaml, skills.yaml | Collapsed |
| tests/ | landing.spec.ts, navigation.spec.ts, about.spec.ts, ide-interactions.spec.ts, playwright.config.ts | Collapsed |
| Root-level | README.md, contact.json | Always visible |

## Plan 01 Assertions Now Green

The following assertions in e2e/ide-interactions.spec.ts were intentionally deferred from plan 01 (marked with "This test will FAIL until plan 03 ships"):

- test files appear in sidebar under tests/ folder — tests label now rendered in sidebar; clicking it expands to reveal landing.spec.ts
- clicking landing.spec.ts loads its TypeScript source in editor — tests/landing.spec.ts entry now in FILES with TypeScript source content

## Deviations from Plan

### Minor Deviation: SAMPLE_LOGS entry 7 test name

**Found during:** Task 1
**Issue:** Plan specified SAMPLE_LOGS entry 7 as "navigation.spec.ts > logo/home link returns to /" but the actual test in e2e/navigation.spec.ts is named "back link returns to /". Using the plan's fictional name would violate the plan's own requirement: "All test name strings must reference real test cases."
**Fix:** Used the actual test name: navigation.spec.ts > back link returns to /
**Files modified:** src/lib/files-data.ts
**Commit:** a3d02a9

### Minor: Spec content escaping

**Found during:** Task 1
**Issue:** Spec files contain regex patterns like /README\.md/ and /bio\.json/ — the backslash-dot sequences needed to be double-escaped inside the template literal string so they render correctly in the displayed source.
**Fix:** Applied \\. escaping for regex metacharacters inside the content fields.
**Files modified:** src/lib/files-data.ts
**Commit:** a3d02a9

## Known Stubs

None. All 5 FILES entries contain verbatim source from the actual spec files on disk. The SAMPLE_LOGS entries reference real test names that exist in the committed spec files.

## Threat Flags

No new security-relevant surface introduced. Both modifications are client-side static data — no network endpoints, no auth paths, no file system access at runtime.

## Self-Check: PASSED

- src/lib/files-data.ts modified: FOUND
- src/components/ide/Sidebar.tsx modified: FOUND
- Task 1 commit a3d02a9: FOUND
- Task 2 commit 7d91391: FOUND
- pnpm typecheck exits 0: PASSED
- pnpm lint exits 0: PASSED
- No Python pytest names in files-data.ts: CONFIRMED
- SAMPLE_LOGS has exactly 14 entries: CONFIRMED
- TEST_FILES array present in Sidebar.tsx: CONFIRMED
- tests: false in open state: CONFIRMED
