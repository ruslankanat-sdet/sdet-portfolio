---
phase: 07-foundation-route-restructure-font-setup
plan: "01"
subsystem: ui
tags: [nextjs, app-router, route-groups, layout, site-header]

# Dependency graph
requires:
  - phase: 06-code-review-fixes
    provides: Working SiteHeader, about page, and MDX resume pipeline
provides:
  - "(ide) route group layout owns SiteHeader + site-main wrapper for IDE-view pages"
  - "Root layout is header-free and wrapper-free, ready for door/recruiter views"
  - "/about page relocated to src/app/(ide)/about/ — URL unchanged"
affects:
  - phase-08-door-view
  - phase-09-recruiter-view

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Next.js route groups (parentheses dirs) for layout isolation without URL segments"
    - "Shared IDE-view layout in src/app/(ide)/layout.tsx renders SiteHeader + site-main"
    - "Root layout stripped to bare essentials (fonts, metadata, analytics)"

key-files:
  created:
    - src/app/(ide)/layout.tsx
    - src/app/(ide)/about/page.tsx
    - src/app/(ide)/about/about.module.css
  modified:
    - src/app/layout.tsx
    - mdx-components.tsx

key-decisions:
  - "Route group (ide) used to isolate SiteHeader+main from root layout — URL /about unchanged"
  - "about.module.css import in mdx-components.tsx updated to new (ide) path (auto-fix Rule 1)"
  - "Root layout is now fully header-free — enables clean full-viewport door and recruiter views in Phases 8-9"

patterns-established:
  - "Route group pattern: src/app/(groupname)/layout.tsx owns shared chrome for subset of routes"
  - "mdx-components.tsx must be updated when about.module.css path changes"

requirements-completed:
  - ARCH-01

# Metrics
duration: 15min
completed: 2026-05-27
---

# Phase 7 Plan 01: Route Group Restructure — (ide) layout + /about migration Summary

**(ide) route group created to own SiteHeader and site-main wrapper, /about relocated inside it, root layout stripped header-free for Phase 8-9 door/recruiter views**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-05-27T00:00:00Z
- **Completed:** 2026-05-27T00:15:00Z
- **Tasks:** 4
- **Files modified:** 5

## Accomplishments
- Created `src/app/(ide)/layout.tsx` that renders `<SiteHeader />` and `<main className="site-main">` — all IDE-view pages share this chrome
- Moved `/about` page and CSS module into `(ide)/about/` — URL `/about` continues to return 200 with SiteHeader and resume content
- Stripped `SiteHeader` import/render and `<main className="site-main">` wrapper from root layout — root layout now passes children directly
- Fixed `mdx-components.tsx` import path pointing to old `about.module.css` location (Rule 1 auto-fix) — `pnpm build` exits 0 with all 9 pages generated

## Task Commits

Each task was committed atomically:

1. **Task 1: Create (ide)/layout.tsx** - `61d7f38` (feat)
2. **Task 2: Move /about into (ide) group** - `1a0cffd` (feat)
3. **Task 3: Strip SiteHeader from root layout** - `839a573` (feat)
4. **Task 4 + auto-fix: Fix mdx-components import + build verification** - `021ef55` (fix)

## Files Created/Modified
- `src/app/(ide)/layout.tsx` - New route group layout: SiteHeader + site-main wrapper for IDE-view pages
- `src/app/(ide)/about/page.tsx` - /about page (relocated verbatim from src/app/about/page.tsx)
- `src/app/(ide)/about/about.module.css` - About page styles (relocated verbatim)
- `src/app/layout.tsx` - Root layout stripped of SiteHeader import and site-main wrapper
- `mdx-components.tsx` - Updated import path to reflect about.module.css new location

## Decisions Made
- Used Next.js route group `(ide)` to share SiteHeader+main without adding URL segments — cleanest approach for selective layout inheritance
- Did not move `src/app/page.tsx` (the IDE page at `/`) — per plan, this is deferred to Plan 07-02 (ResumeGate)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed stale import path in mdx-components.tsx**
- **Found during:** Task 4 (smoke-test / pnpm build)
- **Issue:** `mdx-components.tsx` imported `./src/app/about/about.module.css` — this path broke after Task 2 moved the file to `src/app/(ide)/about/about.module.css`
- **Fix:** Updated import to `./src/app/(ide)/about/about.module.css`
- **Files modified:** mdx-components.tsx
- **Verification:** `pnpm build` exits 0; all 9 static pages generated including /about
- **Committed in:** `021ef55` (standalone fix commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug in import path not covered by plan)
**Impact on plan:** Necessary correctness fix. No scope creep. Build was broken without it.

## Issues Encountered
- `.next/types` cache held stale references to `src/app/about/page.tsx` after deletion; cleared with `rm -rf .next/types` — TypeScript then compiled cleanly
- Vitest 4.x requires Node >=22 but runtime is Node 18.20 — pre-existing infrastructure mismatch (not caused by this plan); documented, not fixed

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Root layout is header-free — Phases 8-9 can render full-viewport door/recruiter views without fighting an inherited header
- `(ide)` group pattern is established — any future IDE-view page (e.g., the IDE page at `/` after ResumeGate ships) slots in by being placed under `src/app/(ide)/`
- No blockers for Plan 07-02 (ResumeGate)

---
*Phase: 07-foundation-route-restructure-font-setup*
*Completed: 2026-05-27*
