---
phase: 09-recruiter-view
plan: 02
subsystem: ui
tags: [recruiter, css-modules, camelCase, mobile-responsive, editorial-layout, e2e, vitest, playwright, a11y]

# Dependency graph
requires:
  - phase: 09-01
    provides: "RecruiterView scaffold, Masthead, Hero, DoorScreen integration, recruiter.module.css base styles"

provides:
  - "§01 four-tile metrics grid (Metrics.tsx)"
  - "§02 now lede paragraph with drop-cap first letter"
  - "§03 three-job timeline (Timeline.tsx) with forest year accent"
  - "§04 four skill groups + serif pills (Skills.tsx)"
  - "§05 six-row availability spec card (AvailabilityCard.tsx)"
  - "Contact section with email + 3-col GitHub/LinkedIn grid (ContactSection.tsx)"
  - "Footer with copyright + Open the IDE button (RecruiterFooter.tsx)"
  - "Full mobile breakpoint matrix at 375px and 540px"
  - "Full @media print block in globals.css"
  - "14 unit tests passing (REC-01 through REC-08)"
  - "9 E2E tests passing (REC-01 through REC-10 + A11Y)"

affects: [10-print-pdf, future-recruiter-data, ci-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS Modules class names MUST be camelCase — Next.js does NOT auto-convert kebab-case (.section-head exports as 'section-head', not 'sectionHead')"
    - "CSS Modules cannot contain bare body{} selector in @media print — move to globals.css"
    - "TypeScript interface preferred over 'as const' array when discriminated union causes property access errors"
    - "E2E button locators: use regex + .first() when two buttons share text (masthead + footer)"

key-files:
  created:
    - src/components/recruiter/Metrics.tsx
    - src/components/recruiter/Timeline.tsx
    - src/components/recruiter/Skills.tsx
    - src/components/recruiter/AvailabilityCard.tsx
    - src/components/recruiter/ContactSection.tsx
    - src/components/recruiter/RecruiterFooter.tsx
  modified:
    - src/components/recruiter/recruiter.module.css
    - src/components/recruiter/RecruiterView.tsx
    - src/components/recruiter/__tests__/RecruiterView.test.tsx
    - e2e/recruiter.spec.ts
    - src/app/globals.css

key-decisions:
  - "All CSS Module class names converted from kebab-case to camelCase (critical fix: Next.js exports them as-written)"
  - "body{} in @media print moved to globals.css — CSS Modules rejects non-pure selectors"
  - "TypeScript interface{} used instead of as-const arrays for Timeline and AvailabilityCard row types"
  - "E2E tests use .first() + regex for ambiguous button locators when masthead and footer share text"

patterns-established:
  - "Pattern: CSS Modules — always write class names as camelCase, not kebab-case"
  - "Pattern: Print styles for scoped components — use globals.css for body{} rules in @media print"
  - "Pattern: E2E strict mode — use .first() or exact name when two elements match a role+name combo"

requirements-completed: [REC-03, REC-04, REC-05, REC-06, REC-07, REC-08, REC-10]

# Metrics
duration: 90min
completed: 2026-05-28
---

# Phase 09 Plan 02: Recruiter View Full Content Sections Summary

**Six editorial content components (Metrics, Timeline, Skills, AvailabilityCard, ContactSection, RecruiterFooter) with full mobile breakpoint matrix, 14 unit tests, and 9 E2E tests all green**

## Performance

- **Duration:** ~90 min
- **Started:** 2026-05-28T20:30:00Z
- **Completed:** 2026-05-28T23:10:00Z
- **Tasks:** 4 (CSS extension, 6 components, test expansion, CSS camelCase fix)
- **Files modified:** 10

## Accomplishments

- Created 6 new recruiter components composing the full editorial resume layout (§01–§05 + Contact + Footer)
- Extended `recruiter.module.css` with all section selectors, mobile breakpoints (375px, 540px), and print styles
- Expanded test suite to 14 unit tests (Vitest) and 9 E2E tests (Playwright) — all passing
- Discovered and fixed a critical CSS Modules misconception: Next.js does NOT auto-camelCase class names, requiring a full rename pass on all 30+ class names from kebab-case to camelCase
- All external links (GitHub, LinkedIn) have `rel="noopener noreferrer"` per security requirement T-09-02

## Task Commits

1. **CSS extension — section selectors + mobile + print** - `f694603` (feat)
2. **6 recruiter components + RecruiterView composition** - `467120b` (feat)
3. **Unit tests (14) + E2E spec (9) expansion** - `4bce187` (test)
4. **CSS camelCase rename + globals.css print + E2E locator fixes** - `276e569` (fix)

## Files Created/Modified

- `src/components/recruiter/Metrics.tsx` - Four-tile stat grid (9 yrs / 0.4% / 98.2% / 1,247)
- `src/components/recruiter/Timeline.tsx` - Three-job experience list with date-span + body grid
- `src/components/recruiter/Skills.tsx` - Four skill groups (Automation / AI+ML / Infra / Languages) + serif pills
- `src/components/recruiter/AvailabilityCard.tsx` - Six-row availability spec card with Status forest accent
- `src/components/recruiter/ContactSection.tsx` - Email + 3-col GitHub/LinkedIn grid with noopener rel
- `src/components/recruiter/RecruiterFooter.tsx` - Footer copyright + "Open the IDE" switch button
- `src/components/recruiter/RecruiterView.tsx` - Composes all 6 new sections under article
- `src/components/recruiter/recruiter.module.css` - All class names converted to camelCase; full mobile + print rules added
- `src/components/recruiter/__tests__/RecruiterView.test.tsx` - 14 tests covering REC-01 through REC-08
- `e2e/recruiter.spec.ts` - 9 E2E tests covering REC-01 through REC-10 + WCAG AA
- `src/app/globals.css` - Added `@media print { body { ... } }` (moved from CSS Module)

## Decisions Made

- **CSS Modules camelCase enforcement:** Discovered that `.section-head` in a CSS Module exports as the key `"section-head"`, not `"sectionHead"`. `styles.sectionHead` was `undefined` in JSX, causing all hyphenated-class elements to render without class attributes (invisible styling). Fixed by renaming all 30+ class names to camelCase.
- **Print body styles in globals.css:** CSS Modules enforces "pure" selectors — bare `body {}` is rejected. Moved to `globals.css` which is a global stylesheet with no purity constraint.
- **TypeScript interface over as-const:** `as const` arrays with optional fields (`current?`, `span?`) create union types where TypeScript can't verify property access. Used explicit `interface` typing instead.
- **E2E regex + .first() for button locators:** The masthead "Engineer view ↗" button and the footer "Prefer the engineer view? Open the IDE →" button both match `/Engineer view/i`. Used `.first()` to select the masthead button specifically.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] CSS Module class names all undefined due to kebab-case naming**
- **Found during:** Task 3 (E2E test expansion — tests failing with element-not-found errors)
- **Issue:** All CSS class names written as kebab-case (`.section-head`, `.metrics-grid`, etc.). Next.js CSS Modules does NOT perform camelCase conversion — the exported keys match exactly what's in the CSS file. So `styles.sectionHead` was `undefined` at runtime, causing every element to render without any CSS class attribute.
- **Fix:** Renamed all 30+ CSS class names from kebab-case to camelCase across `recruiter.module.css` and updated all consuming components (`RecruiterView.tsx`, `Masthead.tsx`, `Hero.tsx`, and the 6 new components)
- **Files modified:** `src/components/recruiter/recruiter.module.css` (primary rename), all component files already used camelCase names in JSX — only the CSS file needed updating
- **Verification:** `pnpm build` clean; DOM inspection showed correct hashed class names (e.g., `recruiter_metricsGrid__roGQo`); all 9 E2E tests pass
- **Committed in:** `276e569`

**2. [Rule 1 - Bug] CSS Modules rejects bare `body {}` selector in `@media print`**
- **Found during:** Task 1 (CSS extension)
- **Issue:** CSS Modules requires all selectors to be "pure" (scoped to the module). `body {}` is a global selector; the Next.js CSS Module compiler rejects it with "Selector 'body' is not pure (pure selectors must be local)". `:global(body)` also failed inside `@media` rules.
- **Fix:** Removed `body {}` from the CSS Module's `@media print` block; added `@media print { body { background: white; font-size: 11pt; } }` to `src/app/globals.css`
- **Files modified:** `src/app/globals.css`
- **Verification:** `pnpm build` succeeds; globals.css change confirmed at file bottom
- **Committed in:** `276e569`

**3. [Rule 1 - Bug] TypeScript error on as-const arrays with optional discriminated properties**
- **Found during:** Task 2 (component creation)
- **Issue:** `Timeline.tsx` and `AvailabilityCard.tsx` initially used `as const` arrays. TypeScript inferred union types, causing "Property 'current' does not exist on type '...' | '...'" errors because not every union member had the optional properties.
- **Fix:** Changed from `as const` to explicitly typed arrays using `interface Job` and `interface AvailRow`
- **Files modified:** `src/components/recruiter/Timeline.tsx`, `src/components/recruiter/AvailabilityCard.tsx`
- **Verification:** `pnpm build` type-checks clean
- **Committed in:** `4bce187`

**4. [Rule 1 - Bug] E2E REC-01 button locator ambiguity in strict mode**
- **Found during:** Task 3 (E2E test expansion)
- **Issue:** `getByRole('button', { name: 'Engineer view↗' })` failed because (a) the button inner text has a newline (`"Engineer view\n↗"`) so the accessible name is "Engineer view ↗" not "Engineer view↗", and (b) the footer button "Prefer the engineer view? Open the IDE →" also contains "engineer view" — two matches in strict mode
- **Fix:** Changed to `getByRole('button', { name: /Engineer view/ }).first()` using regex match and `.first()` to pick the masthead button
- **Files modified:** `e2e/recruiter.spec.ts`
- **Verification:** Both REC-01 tests pass; 9/9 E2E green
- **Committed in:** `276e569`

---

**Total deviations:** 4 auto-fixed (Rule 1 bugs)
**Impact on plan:** All fixes required for correctness. No scope creep. Root cause (CSS Modules kebab-case) was a framework misconception that affected the entire component tree.

## Issues Encountered

- CSS Modules kebab-case class name trap: the most impactful issue. All elements appeared to render correctly from a React/JSX perspective but had no CSS class attributes in the DOM, so visual layout was invisible. Root cause identified via DOM inspection with a Playwright debug script that showed `getAttribute('class') === null` for all hyphenated-class elements.

## User Setup Required

None — no external service configuration required.

## Known Stubs

None — all sections render real content wired to static data constants in each component.

## Threat Flags

None — no new network endpoints, auth paths, or file access patterns introduced. External links (GitHub, LinkedIn) already have `rel="noopener noreferrer"` per T-09-02.

## Next Phase Readiness

- Full recruiter view is live and testable at `localhost:3000` with `localStorage.setItem('resume-mode', 'recruiter')`
- Phase 10 (print/PDF) can consume the `@media print` foundation from `globals.css` and extend with page-break rules
- All 9 E2E tests + 14 unit tests are green; CI gate is met
- The `metricNum`, `spanYearCurrent`, and `good` CSS classes are available for Phase 10 print overrides

---
*Phase: 09-recruiter-view*
*Completed: 2026-05-28*

## Self-Check: PASSED

Files verified to exist:
- src/components/recruiter/Metrics.tsx: FOUND
- src/components/recruiter/Timeline.tsx: FOUND
- src/components/recruiter/Skills.tsx: FOUND
- src/components/recruiter/AvailabilityCard.tsx: FOUND
- src/components/recruiter/ContactSection.tsx: FOUND
- src/components/recruiter/RecruiterFooter.tsx: FOUND
- e2e/recruiter.spec.ts: FOUND (9 tests)
- src/components/recruiter/__tests__/RecruiterView.test.tsx: FOUND (14 tests)

Commits verified:
- f694603: feat(09-02): extend recruiter.module.css — FOUND
- 467120b: feat(09-02): create 6 recruiter content components — FOUND
- 4bce187: test(09-02): expand unit tests + E2E spec — FOUND
- 276e569: fix(09-02): rename CSS Module classes to camelCase — FOUND
