---
phase: 08-landing-door
reviewed: 2026-05-27T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - e2e/ide-interactions.spec.ts
  - e2e/landing.spec.ts
  - e2e/navigation.spec.ts
  - src/app/globals.css
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/components/door/DoorScreen.tsx
  - src/components/door/LogoMark.tsx
  - src/components/door/__tests__/DoorScreen.test.tsx
  - src/components/ide/EditorArea.module.css
  - src/components/ide/FileView.tsx
  - src/components/ide/Sidebar.module.css
  - src/components/ide/Terminal.module.css
findings:
  critical: 2
  warning: 6
  info: 3
  total: 11
status: issues_found
---

# Phase 08: Code Review Report

**Reviewed:** 2026-05-27
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

Phase 08 introduces the landing "door" split-screen (cream recruiter half / dark IDE half), the `DoorScreen` component, `LogoMark` SVG, CSS tokens for the door UI, and E2E tests for the new gating flow. The routing shell in `page.tsx` is clean. The visual implementation is complete. Two critical issues were found: the DoorScreen renders two `<h1>` elements on a single page (WCAG heading structure violation) and the WCAG axe-core E2E scan never reaches the DoorScreen (the only test that calls `.analyze()` pre-seeds `ide` mode via `beforeEach`, so the door is always bypassed). Six warnings cover a silent CSS class miss in `FileView.tsx`, next/font variables not being wired into the CSS token layer, the `?reset` URL persisting in the address bar, a missing E2E test for the DOOR-02 click-to-store flow, and two dead keyframe definitions. Three info items cover test hygiene.

---

## Critical Issues

### CR-01: Two `<h1>` elements on the same page violates WCAG 1.3.1

**File:** `src/components/door/DoorScreen.tsx:50,84`
**Issue:** Both door halves use `<h1 className="door-name">`. A single page must have at most one `<h1>` per WCAG 1.3.1 (Info and Relationships) and is a level-A failure that axe-core flags under `page-has-heading-one` / heading-order rules. Screen readers announce a confusing dual landmark. The WCAG requirement in CLAUDE.md is "WCAG AA minimum across all pages."
**Fix:** Demote one or both to `<h2>` (or `<p>` styled identically). The canonical approach for a decorative split screen is to wrap the page in a single visually hidden `<h1>` for screen readers and use `<p>` or `<h2>` inside each half:
```tsx
// Option A — single hidden h1 + decorative p elements:
// Add above .door div:
<h1 className="sr-only">Ruslan Kanatbek — SDET Portfolio</h1>

// Change both instances to:
<p className="door-name">...</p>
```
Add `.sr-only` to globals.css (the standard visually-hidden utility):
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
```

### CR-02: WCAG axe scan never covers the DoorScreen

**File:** `e2e/landing.spec.ts:5-8,49-55`
**Issue:** The only `AxeBuilder.analyze()` call lives inside the `Landing page` describe block, which has a `beforeEach` that seeds `localStorage.setItem('resume-mode', 'ide')` before every test. As a result, `page.goto('/')` in the axe test renders the IDE shell, not the DoorScreen. The DoorScreen — a new interactive component introduced in this phase — has never been tested against WCAG AA rules. The two `<h1>` defect (CR-01) would not be caught by CI, and any other a11y regressions in future door changes are permanently invisible.
**Fix:** Add a dedicated axe test in the `Landing door` describe block (which has no `beforeEach`, so the door renders by default):
```typescript
test('DOOR-A11Y: DoorScreen has no WCAG AA violations', async ({ page }) => {
  await page.goto('/');
  // Confirm the door is visible (no stored mode)
  await expect(page.getByRole('button', { name: /Enter the résumé/i })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

---

## Warnings

### WR-01: `styles[\`lang-${file.lang}\`]` always resolves to `undefined` — lang-specific code styling is dead

**File:** `src/components/ide/FileView.tsx:34`
**Issue:** The expression `styles[\`lang-${file.lang}\`]` looks up a CSS Module class named e.g. `lang-typescript` or `lang-json` in `FileView.module.css`. No such classes exist in that file — the lookup always returns `undefined`, which `cn()` ignores. The feature is silently inert: no lang-aware styling is applied to the `<pre>` element. If future work adds `lang-*` classes expecting this hook to work, the binding will activate correctly — but as committed, the code gives a false impression that per-language styling is in place.
**Fix:** Either add the intended `lang-*` class definitions to `FileView.module.css`, or remove the dead expression until the feature is implemented:
```tsx
// Remove until lang-specific overrides are ready:
<pre className={styles.code} tabIndex={0}>
```

### WR-02: `--mono` and `--ui` CSS tokens bypass next/font-injected variables, breaking font optimization

**File:** `src/app/globals.css:62-63`
**Issue:** `layout.tsx` registers JetBrains Mono with `variable: '--font-mono'` and Inter with `variable: '--font-inter'`. These inject optimized `@font-face` rules and expose the font family via those CSS custom properties. However, `globals.css` defines:
```css
--mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
--ui:   'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```
These hardcode the font name as a bare string rather than referencing `var(--font-mono)` / `var(--font-inter)`. Every element using `var(--mono)` or `var(--ui)` bypasses next/font's font-face URL and falls back to whatever the OS has installed. The font still loads (if present system-wide), but next/font's self-hosted URL, preload `<link>`, `size-adjust`, and `font-display: swap` benefits are lost. Note: `--serif: var(--font-newsreader)` is correctly wired.
**Fix:**
```css
--mono: var(--font-mono), 'JetBrains Mono', 'Fira Code', 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
--ui:   var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

### WR-03: `?reset` URL parameter stays in the browser address bar after being handled

**File:** `src/app/page.tsx:32-34`
**Issue:** When a visitor loads `/?reset`, the `useEffect` clears `localStorage` and sets `mode` to `null` (showing the door). However, neither `router.replace('/')` nor `window.history.replaceState` is called, so `?reset` remains visible in the address bar for the duration of the session. This means: (1) sharing the URL from the address bar propagates `?reset` to other people, re-clearing their stored mode; (2) refreshing the page also re-triggers the reset.
**Fix:**
```tsx
import { useRouter } from 'next/navigation';
// Inside ResumeGateInner:
const router = useRouter();

useEffect(() => {
  if (searchParams.get('reset') !== null) {
    clearStoredMode();
    setMode(null);
    router.replace('/');   // strip ?reset from address bar
  } else {
    setMode(readStoredMode());
  }
  setMounted(true);
}, [searchParams, router]);
```

### WR-04: No E2E test exercises the DOOR-02 click-to-store-mode flow end-to-end

**File:** `e2e/landing.spec.ts:58-91`
**Issue:** DOOR-02 requires that clicking a door half writes `localStorage["resume-mode"]` and renders the corresponding view without a page navigation. The existing tests bypass this entirely: `DOOR-03 return-visit` and the `Landing page` group use `addInitScript` to pre-seed the mode before navigation, so they never click through the door. `DOOR-03 same-session` clicks the recruiter half and checks the stub text appears — this does exercise the recruiter click path. However, there is no test that (a) clicks the IDE half (`$ ./open-ide`) and then verifies the IDE shell appears, nor (b) verifies `localStorage["resume-mode"]` is written to `"ide"`. The click-to-ide path is the primary happy path for technical visitors and is untested.
**Fix:** Add to the `Landing door` describe block:
```typescript
test('DOOR-02: clicking IDE half stores mode and renders IDE shell', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /\$ \.\/open-ide/i }).click();
  // IDE shell should appear (sidebar with README.md)
  await expect(page.getByRole('button', { name: /README\.md/ }).first()).toBeVisible();
  // Verify localStorage was written
  const stored = await page.evaluate(() => localStorage.getItem('resume-mode'));
  expect(stored).toBe('ide');
});
```

### WR-05: `door-fade-in` and `pulse-dot` keyframes defined in `globals.css` are never referenced

**File:** `src/app/globals.css:332-335,478-490`
**Issue:** `@keyframes door-fade-in` (lines 332-335) and `@keyframes pulse-dot` (lines 478-490) are defined but not used by any `animation:` or `animation-name:` declaration anywhere in the codebase. The Terminal module defines its own `pulseDot` (camelCase) locally. Dead keyframes add noise to the global stylesheet and risk confusion when future developers see `door-fade-in` and assume it is wired up.
**Fix:** Remove both unused keyframes, or add the intended `animation: door-fade-in 0.3s ease` declaration to `.door` if fade-in was the design intent.

### WR-06: `paneSubtitle` block copy-pasted identically across three CSS modules

**File:** `src/components/ide/EditorArea.module.css:157-163`, `src/components/ide/Sidebar.module.css:19-26`, `src/components/ide/Terminal.module.css:212-219`
**Issue:** All three modules define an identical `.paneSubtitle` block (same 6 declarations). CSS Modules scope the class names, so the duplication causes no runtime conflict, but any future style change requires three coordinated edits. A single missed update will create a visual inconsistency across panes.
**Fix:** Extract to a shared CSS Module (e.g., `src/components/ide/ide-shared.module.css`) and import via CSS Module composition:
```css
/* ide-shared.module.css */
.paneSubtitle {
  font-size: 10.5px;
  font-weight: 400;
  color: var(--text-muted);
  letter-spacing: 0.02em;
  font-family: var(--ui);
}
```
Then in each module:
```css
.paneSubtitle {
  composes: paneSubtitle from './ide-shared.module.css';
  /* margin-left stays per-module if it differs */
}
```

---

## Info

### IN-01: `navigation.spec.ts:21` hardcodes `http://localhost:3000/` instead of using baseURL

**File:** `e2e/navigation.spec.ts:21`
**Issue:** `expect(page).toHaveURL('http://localhost:3000/')` will fail on any environment where the app is not running on port 3000 (e.g., a Vercel Preview deploy, a different local port, or a staging environment). All other URL assertions in the E2E suite correctly use relative patterns (`/\/about$/`).
**Fix:**
```typescript
await expect(page).toHaveURL('/');
// or using the baseURL:
await expect(page).toHaveURL(new RegExp(`^${process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000'}/?$`));
```
The simplest fix is `await expect(page).toHaveURL('/')` since Playwright resolves it against `baseURL`.

### IN-02: Two tests in `ide-interactions.spec.ts` are committed with explicit "will FAIL" comments

**File:** `e2e/ide-interactions.spec.ts:18-36`
**Issue:** Both `test files appear in sidebar under tests/ folder` and `clicking landing.spec.ts loads its TypeScript source in editor` contain comments stating "This test will FAIL until plan 03 ships." With `retries: 1` on CI, these tests will consume double the CI time on every run while always failing. There is no skip/todo marker, so they show as red test failures, not pending items.
**Fix:** Use `test.fixme()` or `test.skip()` to mark them as pending until the gating plan lands:
```typescript
test.fixme('test files appear in sidebar under tests/ folder', async ({ page }) => {
  // Gated on plan 03 — see comment
  ...
});
```
Alternatively, move them to a separate spec file guarded by an environment variable skip condition.

### IN-03: `blink` keyframe is defined twice with identical content

**File:** `src/app/globals.css:546-550`, `src/components/ide/Terminal.module.css:206-210`
**Issue:** Both files define `@keyframes blink { to { visibility: hidden; } }`. The global definition at line 546 of `globals.css` is not referenced anywhere in `globals.css` itself. The one in `Terminal.module.css` is correctly used by `.blink { animation: blink ... }` in that module. The global definition is dead weight.
**Fix:** Remove the `@keyframes blink` block from `globals.css:546-550`.

---

_Reviewed: 2026-05-27_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
