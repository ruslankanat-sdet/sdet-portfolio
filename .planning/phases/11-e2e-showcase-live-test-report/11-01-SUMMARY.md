---
phase: 11-e2e-showcase-live-test-report
plan: "01"
subsystem: ide-sidebar
tags: [files-data, sidebar, e2e, playwright, recruiter-spec]
dependency_graph:
  requires: []
  provides:
    - "tests/recruiter.spec.ts entry in FILES record"
    - "recruiter.spec.ts in TEST_FILES and OUTLINE_SYMBOLS"
    - "E2E assertions E2E-01 and E2E-02 for recruiter.spec.ts"
  affects:
    - src/lib/files-data.ts
    - src/components/ide/Sidebar.tsx
    - e2e/ide-interactions.spec.ts
tech_stack:
  added: []
  patterns:
    - "FILES record extended with verbatim e2e source inlining pattern"
    - "TEST_FILES array + OUTLINE_SYMBOLS map kept in sync for each spec entry"
key_files:
  created: []
  modified:
    - src/lib/files-data.ts
    - src/components/ide/Sidebar.tsx
    - e2e/ide-interactions.spec.ts
decisions:
  - "Inlined recruiter.spec.ts verbatim with backslash-escaping for special chars in template literals"
  - "Refreshed landing.spec.ts content: added beforeEach ide seed, Landing door describe with 6 DOOR-* tests"
  - "Refreshed navigation.spec.ts content: replaced /about link tests with IDE/recruiter view switch tests"
  - "Did not refresh playwright.config.ts inline content — deferred to Wave 3 when the real file changes"
metrics:
  duration: "35m 41s"
  completed: "2026-06-02"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 3
---

# Phase 11 Plan 01: Sync IDE Sidebar to Real E2E Test Suite Summary

**One-liner:** Added `recruiter.spec.ts` to the IDE sidebar and refreshed stale inline content for `landing.spec.ts` and `navigation.spec.ts`, then proved both entries work with 5 passing Playwright assertions.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add recruiter.spec.ts entry and refresh stale entries in files-data.ts | aaa8dd2 | src/lib/files-data.ts |
| 2 | Add recruiter.spec.ts to Sidebar.tsx TEST_FILES and OUTLINE_SYMBOLS | d57a730 | src/components/ide/Sidebar.tsx |
| 3 | Add E2E assertions for recruiter.spec.ts sidebar visibility and click-to-load | 78f22de | e2e/ide-interactions.spec.ts |

## Verification Results

| Check | Result |
|-------|--------|
| `grep -c "tests/recruiter.spec.ts" src/lib/files-data.ts` | 1 (correct) |
| `grep -n "Landing door"` in files-data.ts | Found at line 223 |
| `grep -n "IDE → Recruiter view switch"` in files-data.ts | Found at line 285 |
| `grep -c "recruiter.spec.ts" src/components/ide/Sidebar.tsx` | 2 (TEST_FILES + OUTLINE_SYMBOLS) |
| `pnpm test` (Vitest, 59 tests) | All pass |
| `pnpm typecheck` | Clean (no errors) |
| `pnpm exec playwright test e2e/ide-interactions.spec.ts --project=chromium` | 5/5 pass (19.6s) |

## Acceptance Criteria

- [x] src/lib/files-data.ts contains exactly one key 'tests/recruiter.spec.ts' in the FILES record
- [x] The recruiter.spec.ts entry has lang: 'typescript', icon: 'ts', path: '~/portfolio/e2e/recruiter.spec.ts'
- [x] The recruiter.spec.ts content field contains the string "REC-01: shows masthead wordmark" (confirmed at line 400)
- [x] The tests/landing.spec.ts content field contains the string "Landing door" (confirmed at line 223)
- [x] The tests/navigation.spec.ts content field contains the string "IDE → Recruiter view switch" (confirmed at line 285)
- [x] pnpm test exits 0 with no failures (59 tests pass)
- [x] Sidebar.tsx TEST_FILES array contains 'tests/recruiter.spec.ts' as the 5th element (before 'tests/playwright.config.ts')
- [x] Sidebar.tsx OUTLINE_SYMBOLS contains key 'tests/recruiter.spec.ts' with a 3-element array including { label: 'REC-01: masthead wordmark', kind: 'key' }
- [x] e2e/ide-interactions.spec.ts contains exactly 5 test() calls in one 'IDE interactions' describe block
- [x] All 5 Playwright tests in ide-interactions.spec.ts pass locally

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None introduced in this plan.

## Threat Flags

None — all changes are static build-time strings from the repo's own e2e/ files with no runtime injection surface.

## Self-Check: PASSED

- [x] src/lib/files-data.ts exists and contains tests/recruiter.spec.ts key
- [x] src/components/ide/Sidebar.tsx exists and contains 2 occurrences of recruiter.spec.ts
- [x] e2e/ide-interactions.spec.ts exists and contains 5 test() calls
- [x] Commits aaa8dd2, d57a730, 78f22de all exist in git log
