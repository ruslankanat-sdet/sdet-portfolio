---
phase: 04-tech-debt-sweep
plan: "01"
subsystem: content-accuracy
tags:
  - content
  - header
  - footer
  - sidebar
  - files-data
dependency_graph:
  requires: []
  provides:
    - SiteHeader with full candidate title
    - files-data.ts entries synced to actual e2e/ specs
  affects:
    - src/components/layout/SiteHeader.tsx
    - src/lib/files-data.ts
tech_stack:
  added: []
  patterns:
    - Verbatim template-literal content sync with double-backslash regex-escape convention
key_files:
  created: []
  modified:
    - src/components/layout/SiteHeader.tsx
    - src/lib/files-data.ts
decisions:
  - "DEBT-01: Text-only SiteHeader change; no responsive logic, no CSS, per decision D-05"
  - "DEBT-02: Verified Footer.tsx already shows copyright 2026 — closed with no code change"
  - "DEBT-04: One-time verbatim sync of 5 FILES entries; 2 stale, 3 already correct; double-backslash escape convention preserved per D-06"
metrics:
  duration: "~8 minutes"
  completed: "2026-05-24"
  tasks_completed: 3
  files_changed: 1
---

# Phase 4 Plan 1: Content Accuracy (DEBT-01, DEBT-02, DEBT-04) Summary

Fixed three independent content-accuracy debts — full SiteHeader title, copyright verification, and IDE sidebar source resync.

## What Was Built

### Task 1: SiteHeader title updated to full role string (DEBT-01)

**File:** `src/components/layout/SiteHeader.tsx`
**Line changed:** Line 10
**Commit:** fd39c7c

Before:
```tsx
<span className={styles.title}>Senior SDET</span>
```

After:
```tsx
<span className={styles.title}>Senior SDET / QA Automation Engineer</span>
```

Single-character insertion — no new imports, no CSS changes, no responsive logic. Decision D-05 explicitly defers responsive handling to Phase 5.

### Task 2: Footer copyright verified — DEBT-02 closed (no code change)

**File:** `src/components/layout/Footer.tsx`
**Action:** Verify-only — no edit made.

Confirmed line 84 of Footer.tsx contains:
```tsx
<p className={styles.copyright}>© 2026 Ruslan Kanatbek</p>
```

Confirmed no `© 2024` substring is present. DEBT-02 closed as already-done from the q02 quick-task. Zero diff against pre-task state.

### Task 3: files-data.ts resync against actual e2e/ specs (DEBT-04)

**File:** `src/lib/files-data.ts`
**Commit:** 1d5b291

Five entries verified/updated:

| FILES key | Stale? | Change summary |
|-----------|--------|----------------|
| `tests/landing.spec.ts` | YES | Added `.first()` on getByRole; added `page.locator('aside')` scoping on click; added inline comment explaining `.first()` |
| `tests/ide-interactions.spec.ts` | YES | Added two-line "This test will FAIL until plan 03 ships..." gating comments on tests 2 and 3 |
| `tests/navigation.spec.ts` | No | Verified match — no change needed |
| `tests/about.spec.ts` | No | Verified match — no change needed |
| `tests/playwright.config.ts` | No | Verified match — no change needed |

All `lang`, `path`, and `icon` fields remain unchanged. No non-test FILES entry modified.

## Verification

- `pnpm typecheck` exits 0 — both before and after each task
- `pnpm lint` exits 0 — no new ESLint violations
- `grep -F "Senior SDET / QA Automation Engineer" src/components/layout/SiteHeader.tsx` matches
- `grep -F "© 2026 Ruslan Kanatbek" src/components/layout/Footer.tsx` matches
- `grep -F "page.locator('aside').getByRole" src/lib/files-data.ts` matches
- `grep -F "This test will FAIL until plan 03 ships" src/lib/files-data.ts` matches (2 occurrences)
- `grep -F "page.getByRole('button', { name: /README\\.md/ }).first()" src/lib/files-data.ts` matches
- `pnpm exec playwright test e2e/ide-interactions.spec.ts e2e/landing.spec.ts --reporter=line` — 10/10 passed

## Commits

| Task | Commit | Message |
|------|--------|---------|
| Task 1 — DEBT-01 | fd39c7c | fix(04-01): update SiteHeader title to full role string (DEBT-01) |
| Task 2 — DEBT-02 | n/a (verify only) | No commit — no file change |
| Task 3 — DEBT-04 | 1d5b291 | fix(04-01): resync files-data.ts test entries against actual e2e/ specs (DEBT-04) |

## Deviations from Plan

None — plan executed exactly as written.

Task 2 was a verify-only task by design; Footer.tsx was already correct from the quick task 260523-q02. DEBT-02 closed as confirmed with no code change, as the plan anticipated.

## Known Stubs

None. All content fields are now synced to actual on-disk source files. No placeholder, hardcoded empty, or TODO values were introduced.

## Threat Flags

No new security-relevant surface introduced. All changes are pure static content edits:
- SiteHeader.tsx: public role string (same data as LinkedIn/resume)
- files-data.ts: renders content inside `<pre><code>` as text — no `dangerouslySetInnerHTML`; follows CLAUDE.md prohibition on unsafe HTML rendering

## Self-Check: PASSED

- [x] `src/components/layout/SiteHeader.tsx` exists and contains "Senior SDET / QA Automation Engineer"
- [x] `src/lib/files-data.ts` exists and contains all required key strings
- [x] Commit fd39c7c exists: `git log --oneline | grep fd39c7c` — confirmed
- [x] Commit 1d5b291 exists: `git log --oneline | grep 1d5b291` — confirmed
- [x] Footer.tsx unchanged: no diff in working tree
- [x] E2E suite: 10/10 passed
