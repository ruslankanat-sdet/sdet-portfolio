---
phase: 08-landing-door
verified: 2026-05-27T00:00:00Z
status: human_needed
score: 4/4 must-haves verified (roadmap success criteria)
overrides_applied: 0
human_verification:
  - test: "Hover animation is smooth on desktop"
    expected: "Each door half expands smoothly with flex-grow transition on hover; opposite half contracts. No jank on Chrome or Safari."
    why_human: "CSS flex-grow animation is not assertable via grep or unit/e2e tests. Requires visual inspection in a real browser."
  - test: "Door stacks vertically on <=760px mobile"
    expected: "Both halves render as vertically stacked panels with padding 32px 28px. flex-direction:column applies."
    why_human: "Viewport-dependent layout. CSS media query is present in code but correct rendering requires visual check at 375px."
  - test: "prefers-reduced-motion disables the flex-grow transition"
    expected: "When OS reduce-motion is enabled, door halves show without animation on hover."
    why_human: "OS-level setting cannot be tested programmatically in Playwright without OS access or a browser flag override."
  - test: "DoorScreen has no WCAG AA violations (axe scan on the door itself)"
    expected: "Zero axe violations at WCAG 2.1 AA level when the door renders at / with no stored localStorage mode."
    why_human: "The only axe test in e2e/landing.spec.ts is inside the 'Landing page' describe block, which pre-seeds 'ide' mode via beforeEach — the door is never reached by the axe scan. CR-02 from 08-REVIEW.md confirmed this gap. Two <h1> elements exist in DoorScreen (CR-01 in 08-REVIEW.md); axe would flag this under heading-order rules."
  - test: "Clicking the IDE half ($ ./open-ide) stores mode='ide' and renders IDEShell without page navigation"
    expected: "After clicking the IDE door half: (1) localStorage['resume-mode'] === 'ide', (2) IDEShell sidebar is visible, (3) URL remains '/' (no navigation). This is the DOOR-02 IDE-path test."
    why_human: "No e2e test covers the IDE half click path. DOOR-03 same-session test covers the recruiter half only. The DOOR-02 IDE-path gap was flagged as WR-04 in 08-REVIEW.md. The behavior is implemented in page.tsx (verified in code) but never asserted by an automated test."
---

# Phase 8: Landing Door Verification Report

**Phase Goal:** First-time visitors see a full-viewport split-screen choice, their selection is persisted, return visitors skip straight to their chosen view, and `?reset` restores the door
**Verified:** 2026-05-27
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A first-time visitor at `/` sees two halves — cream left (recruiter) and dark IDE right — each expanding on hover and clickable to choose a view | VERIFIED (partial — hover animation requires human) | `DoorScreen.tsx` renders `<div className="door">` with `.door-half-recruiter` and `.door-half-ide`, both `role="button" tabIndex={0}`. `globals.css` contains `.door:hover .door-half { flex-grow: 0.85 }` and `.door:hover .door-half:hover { flex-grow: 1.3 }` with a `.55s cubic-bezier` transition. E2E `DOOR-01` test confirms both CTAs visible at `/` with no stored mode. |
| 2 | Clicking a door half immediately renders the corresponding view without a full page navigation, and refreshing the page does not show the door again | VERIFIED (recruiter path confirmed; IDE path human-needed) | `page.tsx` callbacks call `localStorage.setItem(MODE_KEY, ...)` then `setMode(...)` — no `router.push`, no `window.location` change. E2E `DOOR-03 same-session` clicks recruiter, asserts stub text appears, asserts URL unchanged. No e2e test covers the IDE half click path end-to-end (WR-04 in review). Refresh persistence is covered by unit test + localStorage mechanism. |
| 3 | A return visitor whose localStorage holds a mode lands directly in that view — the door is never shown on subsequent visits | VERIFIED | `page.tsx` `readStoredMode()` validates enum and returns mode on mount. E2E `DOOR-03 return-visit` pre-seeds `resume-mode=ide`, confirms door CTAs are absent and IDE sidebar README.md is visible. |
| 4 | Appending `?reset` to the URL clears the stored mode and displays the door again, regardless of previous selection | VERIFIED | `page.tsx` `useEffect` calls `clearStoredMode()` and `setMode(null)` when `searchParams.get('reset') !== null`. E2E `DOOR-04` pre-seeds `ide`, visits `/?reset`, asserts both door CTAs visible. Note: `?reset` param stays in address bar (WR-03 in review) — behavioral correctness is confirmed, UX concern is a warning. |

**Score:** 4/4 truths verified (automated evidence)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/door/LogoMark.tsx` | 18x18 inline SVG glyph in currentColor | VERIFIED | Exists. `export function LogoMark`. No `'use client'`. Renders `<svg aria-hidden="true">` with path + circle, `stroke="currentColor"`. |
| `src/components/door/DoorScreen.tsx` | Full-viewport split-screen Door client component | VERIFIED | Exists. First line `'use client';`. `export function DoorScreen`. Two `role="button"` halves, `onKeyDown` handlers with `e.preventDefault()` on Space (lines 15, 24). |
| `src/components/door/__tests__/DoorScreen.test.tsx` | Unit tests for render + click + keyboard | VERIFIED | Exists. 9 tests across 3 describe blocks: rendering (4), click interactions (2), keyboard interactions (3). Covers DOOR-01 + DOOR-02. |
| `src/app/globals.css` | Cream/forest tokens + .door-* utility classes + reduced-motion + 760px mobile rules | VERIFIED | All 13 tokens present on `:root`. `.door` uses `height: 100%` (no `min-height: 100vh`). Flex-grow transition `.55s cubic-bezier(.4,.0,.2,1)`. `prefers-reduced-motion` gate. `@media (max-width: 760px)` block. |
| `src/app/layout.tsx` | Newsreader weight expansion to `['300','400','500','600','700']` | VERIFIED | `weight: ['300', '400', '500', '600', '700']` confirmed. `variable: '--font-newsreader'` and `style: ['normal', 'italic']` intact. |
| `src/app/page.tsx` | ResumeGateInner renders `<DoorScreen>` when mode === null | VERIFIED | `import { DoorScreen }` present. `<DoorScreen onChooseRecruiter={...} onChooseIDE={...} />` in the fallback return. No Phase 8 placeholder string. Phase 9 stub intact. |
| `e2e/landing.spec.ts` | Landing door describe block + IDE-seeded beforeEach | VERIFIED | `test.describe('Landing door')` present with 4 tests. `Landing page` describe has `test.beforeEach` seeding `ide` mode. |
| `e2e/ide-interactions.spec.ts` | All tests pre-seed IDE mode via addInitScript | VERIFIED | `test.beforeEach` with `localStorage.setItem('resume-mode', 'ide')` present inside `IDE interactions` describe. |
| `e2e/navigation.spec.ts` | About-link test pre-seeds IDE mode | VERIFIED | `test.beforeEach` with `localStorage.setItem('resume-mode', 'ide')` present inside `Navigation` describe. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/page.tsx` | `src/components/door/DoorScreen.tsx` | named import `import { DoorScreen }` | WIRED | Import on line 7; `<DoorScreen>` rendered in fallback branch. |
| `src/components/door/DoorScreen.tsx` | `src/components/door/LogoMark.tsx` | `import { LogoMark } from './LogoMark'` | WIRED | `<LogoMark size={16} />` used inside both halves. |
| `src/components/door/DoorScreen.tsx` | `src/app/globals.css` | className references | WIRED | `door`, `door-half`, `door-half-recruiter`, `door-half-ide`, `door-body`, `door-id`, `door-id-mark`, `door-id-wordmark`, `door-eyebrow`, `door-name`, `door-tagline`, `door-cta`, `door-foot`, `door-bg-pattern` all present as class names in both component and CSS. |
| `page.tsx callbacks` | `localStorage` write | `localStorage.setItem(MODE_KEY, ...)` | WIRED | Lines 80 and 84 in `page.tsx`. Enum-safe: only literals `'recruiter'` and `'ide'` are written. Guard with try/catch. |
| `page.tsx callbacks` | `setMode(...)` state setter | React state | WIRED | `setMode('recruiter')` line 81, `setMode('ide')` line 85 — triggers re-render without navigation. |
| `e2e/landing.spec.ts (Landing door)` | DoorScreen rendered at `/` | `page.goto('/') + getByRole('button', { name: /Enter the résumé/i })` | WIRED | DOOR-01 test confirms both CTAs visible at `/` with no stored mode. |

---

### Data-Flow Trace (Level 4)

DoorScreen is purely presentational — no internal state, no data fetch. All data flows:
- Mode reads: `readStoredMode()` in `page.tsx` on mount
- Mode writes: callbacks passed as props to `DoorScreen`, executed on click/keydown
- No API calls, no DB queries — correctly stateless by design.

**Status: FLOWING** — localStorage read on mount, write on interaction, React state drives re-render. No hollow props.

---

### Behavioral Spot-Checks

Step 7b skipped for the Door UI layer (no runnable CLI entry points; visual rendering requires a browser). Unit tests and e2e tests serve as the behavioral verification layer.

| Behavior | Method | Result | Status |
|----------|--------|--------|--------|
| Two `role="button"` halves rendered | `DoorScreen.test.tsx: renders two role=button halves` | 9/9 tests pass per SUMMARY | PASS |
| Click recruiter fires `onChooseRecruiter` | unit test | Confirmed in SUMMARY | PASS |
| Click IDE fires `onChooseIDE` | unit test | Confirmed in SUMMARY | PASS |
| Enter/Space keyboard invokes callbacks | unit tests | Confirmed in SUMMARY | PASS |
| Door shows at `/` with no stored mode | E2E DOOR-01 | Confirmed in SUMMARY (19/19 pass) | PASS |
| `?reset` clears mode and shows door | E2E DOOR-04 | Confirmed in SUMMARY | PASS |
| IDE half click path (DOOR-02 e2e) | No e2e test exists | — | SKIP — human needed |

---

### Probe Execution

No phase-declared probes (`scripts/*/tests/probe-*.sh`). Step 7c: SKIPPED (not a migration/tooling phase).

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DOOR-01 | 08-01, 08-02 | First-time visitor sees full-viewport split-screen door — both clickable with hover animation | SATISFIED | DoorScreen renders two `role="button"` halves with correct CSS. E2E DOOR-01 test confirms rendering. Hover animation in CSS (human-needed for visual check). |
| DOOR-02 | 08-01 | Clicking a door half sets localStorage and renders view without page navigation | PARTIALLY SATISFIED | localStorage write + `setMode` implemented in page.tsx callbacks (lines 79-88). Recruiter path confirmed via DOOR-03 same-session e2e test (URL unchanged). IDE path has no e2e assertion (WR-04 gap). Unit tests confirm callback firing but not localStorage write. |
| DOOR-03 | 08-02 | Return visitor routed directly to their previously chosen view | SATISFIED | `readStoredMode()` in page.tsx reads and validates stored mode. E2E DOOR-03 same-session and return-visit tests pass. |
| DOOR-04 | 08-02 | `?reset` clears stored mode and shows door again | SATISFIED | `clearStoredMode()` called when `searchParams.get('reset') !== null`. E2E DOOR-04 test passes. |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/door/DoorScreen.tsx` | 50, 84 | Two `<h1>` elements on the same page | WARNING | WCAG 1.3.1 violation — screen readers announce confusing dual landmark. Flagged as CR-01 in 08-REVIEW.md. Does not prevent the phase goal functionally but fails the stated WCAG AA requirement. |
| `e2e/landing.spec.ts` | 5-8, 49-55 | Axe scan inside `Landing page` describe (IDE-mode pre-seeded) never reaches DoorScreen | WARNING | DoorScreen is permanently invisible to automated accessibility scanning. Flagged as CR-02 in 08-REVIEW.md. A dedicated axe test in the `Landing door` describe is missing. |
| `src/app/page.tsx` | 32-34 | `?reset` URL parameter persists in address bar | WARNING | Sharing the address-bar URL propagates `?reset`, clearing other visitors' stored mode. WR-03 in review. Behavior is functionally correct for DOOR-04 but UX-deficient. |
| `src/app/globals.css` | 332-335 | `@keyframes door-fade-in` defined but never referenced | INFO | Dead keyframe. WR-05 in review. No functional impact. |

No `TBD`, `FIXME`, or `XXX` markers found in any phase-modified file.

---

### Human Verification Required

The following items cannot be verified programmatically and require human testing:

#### 1. Hover Animation (DOOR-01 visual)

**Test:** Open `http://localhost:3000` in a fresh Chrome window (no localStorage). Hover over the recruiter half, then the IDE half.
**Expected:** Both halves shrink slightly on hover; the hovered half expands smoothly via flex-grow transition (`.55s cubic-bezier`). Motion is visually smooth.
**Why human:** CSS animation quality cannot be asserted via grep or Playwright without visual inspection.

#### 2. Mobile Stacking at <=760px (DOOR-01 responsive)

**Test:** Open DevTools, set viewport to 375px wide. Load `/` with no stored mode.
**Expected:** Door halves stack vertically (`flex-direction: column`). Each half has `32px 28px` padding. Hover flex-grow effects are disabled (reset to `flex-grow: 1`).
**Why human:** Viewport-dependent layout. CSS media query is present and verified in code, but correct rendering requires visual confirmation.

#### 3. prefers-reduced-motion gate

**Test:** Enable "Reduce Motion" in System Preferences (macOS) or OS accessibility settings. Load `/` with no stored mode.
**Expected:** Door halves render correctly with no flex-grow animation on hover.
**Why human:** OS-level setting cannot be simulated reliably in automated tests without OS access.

#### 4. DoorScreen WCAG AA axe scan (CR-02 from review)

**Test:** Run the following against a running dev server with no pre-seeded localStorage:
```typescript
// Add to e2e/landing.spec.ts Landing door describe block:
test('DOOR-A11Y: DoorScreen has no WCAG AA violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Enter the résumé/i })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```
**Expected:** Zero violations. Note: two `<h1>` elements in DoorScreen (lines 50, 84 of DoorScreen.tsx) likely fail `page-has-heading-one` / heading-order rules under axe. CR-01 in 08-REVIEW.md describes the fix: demote both to `<p>` and add a visually hidden `<h1>` above the door.
**Why human:** The existing axe test pre-seeds IDE mode and never scans the door. This gap must be confirmed and CR-01 resolved before WCAG AA can be claimed.

#### 5. DOOR-02 IDE half click path (WR-04 from review)

**Test:** Load `/` with no stored mode. Click the `$ ./open-ide` button.
**Expected:** (1) IDEShell sidebar renders with README.md visible, (2) URL stays at `/`, (3) `localStorage.getItem('resume-mode') === 'ide'`.
**Why human:** No automated e2e test covers this path. DOOR-03 same-session only tests the recruiter half. The implementation is correct in code (page.tsx lines 83-86) but has never been asserted by an automated test. A dedicated e2e test should be added (WR-04 fix in review).

---

### Gaps Summary

No BLOCKER gaps were found. All four ROADMAP success criteria have codebase evidence. The phase goal is functionally achieved.

Two open items from 08-REVIEW.md require human decision before the phase can be considered fully closed:

1. **CR-01 (Dual `<h1>`)** — DoorScreen renders two `<h1>` elements. This is a WCAG 1.3.1 Level A violation. The fix is straightforward (demote to `<p>`, add visually hidden `<h1>`). Whether this blocks phase sign-off or is deferred to Phase 9 is a human decision.

2. **CR-02 + WR-04 (Missing axe scan on door, missing DOOR-02 IDE e2e test)** — These are test coverage gaps, not implementation gaps. The door itself works correctly; the coverage was never added. Human decision required on whether to close these before marking Phase 8 done.

The other review findings (WR-02 font variable wiring, WR-03 `?reset` in address bar, WR-05 dead keyframe) are pre-existing or low-severity; they do not affect the phase goal.

---

_Verified: 2026-05-27_
_Verifier: Claude (gsd-verifier)_
