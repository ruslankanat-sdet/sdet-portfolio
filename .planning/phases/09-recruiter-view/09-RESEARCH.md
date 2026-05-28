# Phase 9: Recruiter View — Research

**Researched:** 2026-05-28
**Domain:** Next.js App Router, CSS Modules, static editorial layout, sticky positioning, CSS animation, E2E testing
**Confidence:** HIGH — all findings are grounded in the actual codebase (verified by direct file reads)

---

## Summary

Phase 9 builds the complete recruiter-facing editorial resume view. The design is fully locked in `09-UI-SPEC.md` and the design handoff files — zero visual decisions remain open. The technical domain is straightforward: static React components, CSS Modules referencing global tokens, and wiring into the existing `ResumeGateInner` stub in `src/app/page.tsx`.

All CSS tokens (`--paper-*`, `--ink-*`, `--forest-*`, `--rule-*`) are already declared in `globals.css` (lines 127–141). The `--serif` variable (pointing to `--font-newsreader`) is already declared (line 66). Newsreader is loaded in `layout.tsx` at all required weights (300/400/500/600/700, normal + italic). `LogoMark.tsx` already exists at `src/components/door/LogoMark.tsx` and must be imported — not duplicated.

The single non-trivial technical challenge is scroll containment: `.site-body` has `overflow: hidden; height: 100dvh` (globals.css lines 394–399), which prevents the body from scrolling. The recruiter view is a long editorial page and needs its own scroll context, following the exact pattern established by `/about`: the outermost recruiter wrapper element needs `overflow-y: auto; height: 100%` in `recruiter.module.css` so it scrolls inside the flex-shrinking site-body.

One E2E regression must be addressed: `landing.spec.ts` line 86 asserts the stub text `"Recruiter view — coming in Phase 9"` in the `DOOR-03 same-session` test. Once the real `RecruiterView` renders, that assertion must be updated to target a real element from the new component.

**Primary recommendation:** Build the nine recruiter components in a single `src/components/recruiter/` folder + one `recruiter.module.css`. Replace the stub in `page.tsx`. Fix the one breaking E2E test. Add recruiter-specific E2E coverage.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Recruiter view rendering | Browser / Client | — | `page.tsx` is already `"use client"` (ResumeGate); RecruiterView is a pure client component tree — no server data needed |
| CSS token layer | Browser / Client | — | All tokens already in globals.css; RecruiterView scoped styles in recruiter.module.css |
| Mode switching (masthead + footer) | Browser / Client | — | Calls `localStorage.setItem` + parent state setter via `onSwitchToIDE` prop — same pattern as DoorScreen |
| `window.print()` for PDF | Browser / Client | — | Download CTA calls `window.print()` directly — no server involvement |
| Sticky masthead | Browser / Client | — | CSS `position: sticky; top: 0` inside a scroll container |
| Scroll containment | Browser / Client | — | RecruiterView wrapper needs `overflow-y: auto; height: 100%` to scroll inside site-body |
| Animation (avail-pulse) | Browser / Client | — | CSS `@keyframes avail-pulse` in recruiter.module.css; gated by `prefers-reduced-motion: no-preference` |

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REC-01 | Sticky masthead — wordmark, LogoMark, "Engineer view ↗" pill that switches to IDE | `Masthead.tsx` + `position: sticky; top: 0` in CSS Module; `onSwitchToIDE` prop wired from `ResumeGateInner` |
| REC-02 | Hero — availability pill, editorial headline, pitch paragraph, Download PDF + email CTAs | `Hero.tsx`; `window.print()` on click; all copy locked in UI-SPEC copywriting contract |
| REC-03 | §01 "By the numbers" — four stat tiles, large serif numbers, mono labels | `Metrics.tsx`; 4-col grid collapsing to 2-col at ≤600px |
| REC-04 | §02 "What I'm doing now" — drop-cap first letter | `r-now` paragraph in `RecruiterView.tsx`; `::first-letter` pseudo-element in CSS |
| REC-05 | §03 "Experience" — three-job timeline with date-span column | `Timeline.tsx`; `grid-template-columns: 120px 1fr` collapsing to 1-col at ≤600px |
| REC-06 | §04 "Stack" — four skill groups, category labels, serif pill items | `Skills.tsx`; same 120px/1fr grid pattern |
| REC-07 | §05 "What I'm looking for" — two-column 6-row spec-sheet card | `AvailabilityCard.tsx`; `grid-template-columns: 1fr 1fr` collapsing at ≤540px |
| REC-08 | Contact section — large email display + 3-col social grid; footer with IDE switch | `ContactSection.tsx` + `RecruiterFooter.tsx`; `onSwitchToIDE` prop |
| REC-10 | Mobile responsiveness ≤600px: metrics 2-col, timeline 1-col, availability 1-col | All breakpoints already specified in UI-SPEC; applied via `@media (max-width: 600px)` in recruiter.module.css |
</phase_requirements>

---

## Standard Stack

No new packages required for this phase. [VERIFIED: codebase inspection]

All dependencies are already present:

| Package | Version in repo | Purpose in Phase 9 |
|---------|----------------|---------------------|
| `next` | 15.5.18 | App Router, CSS Modules compilation |
| `react` | 19.1.0 | Component tree |
| `typescript` | ^5 | Type safety throughout |
| `tailwindcss` | 4.3.0 | Not used in recruiter view — CSS Modules only per UI-SPEC |

**Installation:** None required.

---

## Package Legitimacy Audit

No packages are installed in this phase. All work is file creation using existing dependencies.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
localStorage["resume-mode"] === "recruiter"
        |
        v
ResumeGateInner (src/app/page.tsx) -- "use client"
        |
        | onSwitchToIDE prop (sets mode + localStorage)
        v
RecruiterView (src/components/recruiter/RecruiterView.tsx)
  article.recruiter  [scroll container: overflow-y auto, height 100%]
        |
        +-- Masthead            [position: sticky, top: 0, z-index: 10]
        |     |-- LogoMark      [imported from src/components/door/LogoMark.tsx]
        |     +-- "Engineer view ↗" button -> onSwitchToIDE
        |
        +-- Hero
        |     |-- Availability pill  [avail-pulse keyframe animation]
        |     |-- h1 headline        [clamp(40px, 5.4vw, 64px)]
        |     |-- Pitch paragraph
        |     +-- CTAs: Download PDF (window.print()) | mailto link
        |
        +-- Section num="01"
        |     +-- Metrics  [4-col grid -> 2-col at 600px]
        |
        +-- Section num="02"
        |     +-- r-now paragraph  [drop-cap ::first-letter]
        |
        +-- Section num="03"
        |     +-- Timeline  [120px/1fr grid -> 1-col at 600px]
        |
        +-- Section num="04"
        |     +-- Skills   [120px/1fr grid -> 1-col at 600px]
        |
        +-- Section num="05"
        |     +-- AvailabilityCard  [1fr/1fr grid -> 1-col at 540px]
        |
        +-- ContactSection  [3-col grid -> 1-col at 600px]
        |
        +-- RecruiterFooter -> "Open the IDE →" button -> onSwitchToIDE
```

### Recommended Project Structure

```
src/
  components/
    door/
      LogoMark.tsx           (already exists — import, do not copy)
    recruiter/
      RecruiterView.tsx      article wrapper + section composition
      Masthead.tsx            sticky header with mode-switch pill
      Hero.tsx                eyebrow + headline + pitch + CTAs
      Metrics.tsx             §01 four-tile stat grid
      Timeline.tsx            §03 experience jobs
      Skills.tsx              §04 skill groups + pills
      AvailabilityCard.tsx    §05 spec sheet card
      ContactSection.tsx      contact line + 3-col social grid
      RecruiterFooter.tsx     footer with mode switch
      recruiter.module.css    ALL scoped recruiter styles
  app/
    page.tsx                  replace recruiter stub with <RecruiterView onSwitchToIDE={...} />
```

### Pattern 1: Scroll Containment — Recruiter Wrapper

**What:** The recruiter view needs to scroll vertically. `.site-body` has `overflow: hidden; height: 100dvh`, which prevents `body`/`html` from scrolling. The scroll context must live inside the component.

**When to use:** Any full-page view rendered inside `ResumeGateInner` that is longer than the viewport.

**Established by:** The `/about` page (`about.module.css` `.scrollContainer { overflow-y: auto; }`, `page.tsx` wraps content in `<div className={styles.scrollContainer}>`).

**Implementation for Phase 9:** The top-level `article` (or a wrapping `div`) in `RecruiterView.tsx` needs these styles in `recruiter.module.css`:

```css
/* Source: established pattern from src/app/(ide)/about/about.module.css */
.recruiter {
  overflow-y: auto;
  height: 100%;         /* fills site-body flex child */
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 40px 120px;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--serif);
  font-size: 18px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

**Critical:** Without `overflow-y: auto` and `height: 100%`, the recruiter view will be clipped at the viewport bottom and the sticky masthead will not work (sticky requires a scroll ancestor).

**Why sticky masthead requires this:** `position: sticky` only sticks within its scroll ancestor. If there is no scroll happening (because `overflow: hidden` on the parent clamps everything), sticky does nothing. The `.recruiter` wrapper with `overflow-y: auto` becomes the scroll ancestor, so `position: sticky; top: 0` on `.masthead` will work correctly.

### Pattern 2: Mode Switching — onSwitchToIDE Prop

**What:** Both the masthead "Engineer view ↗" button and the footer "Open the IDE →" button call the same handler that writes localStorage and updates parent state.

**Source:** [VERIFIED: codebase — `src/app/page.tsx` lines 82–91 and `src/components/door/DoorScreen.tsx`]

**Implementation:**

```tsx
// Source: src/app/page.tsx — existing ResumeGateInner pattern
// In ResumeGateInner, replace the stub with:
if (mode === 'recruiter') {
  return (
    <RecruiterView
      onSwitchToIDE={() => {
        try { localStorage.setItem(MODE_KEY, 'ide'); } catch {}
        setMode('ide');
      }}
    />
  );
}
```

```tsx
// Source: design handoff recruiter.jsx + 09-UI-SPEC.md
// RecruiterView receives and passes down:
interface RecruiterViewProps {
  onSwitchToIDE: () => void;
}
```

### Pattern 3: CSS Module with Global Token References

**What:** The recruiter view uses scoped CSS Modules for component-specific layout + `var(--token)` references for design tokens already declared in `globals.css`.

**Established by:** Every existing component in the codebase (e.g., `DoorScreen` uses global `.door-*` classes directly; IDE components use `*.module.css` scoped styles).

**For Phase 9:** All recruiter styles go in a single `recruiter.module.css`. No global class names are added to `globals.css` — that file already has the token layer and door styles. Keep recruiter styles isolated and scoped.

**TypeScript CSS Module import pattern:**

```tsx
// Source: established by every IDE component (e.g., src/components/ide/IDEShell.tsx)
import styles from './recruiter.module.css';
// Usage:
<article className={styles.recruiter}>
```

### Pattern 4: @keyframes in CSS Module

**What:** The `avail-pulse` animation needs a `@keyframes` block. CSS Modules support `@keyframes` directly — they are scoped locally.

**Implementation in `recruiter.module.css`:**

```css
/* Source: 09-UI-SPEC.md avail-pulse keyframe spec */
@keyframes avail-pulse {
  0%, 100% {
    box-shadow: 0 0 6px var(--forest), 0 0 0 0 oklch(0.55 0.16 152 / 0.45);
  }
  50% {
    box-shadow: 0 0 10px var(--forest), 0 0 0 6px oklch(0.55 0.16 152 / 0);
  }
}

/* Applied on .availDot::before */
@media (prefers-reduced-motion: no-preference) {
  .availDot::before {
    animation: avail-pulse 1.8s ease-in-out infinite;
  }
}
```

**Note:** In CSS Modules, the `@keyframes avail-pulse` name will be locally scoped. When applied via `animation: avail-pulse ...` in the same module file, the module compiler resolves the reference correctly. No need to use `:global()` escape.

### Pattern 5: Download PDF via window.print()

**What:** The "Download PDF ↓" CTA calls `window.print()`. This is a client-side call only.

**Implementation:**

```tsx
// Source: design handoff recruiter.jsx handleDownloadPDF + 09-UI-SPEC.md
<button
  type="button"
  className={styles.btnPrimary}
  onClick={(e) => { e.preventDefault(); window.print(); }}
>
  <span>Download PDF</span>
  <span>↓</span>
</button>
```

**Why button not anchor:** The UI-SPEC says either `<a>` with `onClick` interceptor or `<button type="button">`. A `<button>` is semantically cleaner for a non-navigation action. Use `<a>` only if the design handoff shows it — the prototype used `<a href="#">` but the spec accepts either.

### Anti-Patterns to Avoid

- **Duplicating LogoMark:** `src/components/door/LogoMark.tsx` already exists. Import it — never create a second copy.
- **Adding recruiter global classes to globals.css:** All recruiter styles belong in `recruiter.module.css`. `globals.css` already has the token layer and door classes; adding recruiter classes there breaks the scoping convention.
- **Using `body` or `html` as scroll container:** `.site-body` has `overflow: hidden`. The recruiter `article` wrapper must be the scroll context.
- **Forgetting `height: 100%` on the recruiter wrapper:** Without it, the wrapper collapses to content height inside the flex `.site-body`, and `overflow-y: auto` will not scroll — it will just expand to fit. The wrapper needs a bounded height from which to scroll.
- **Not passing onSwitchToIDE to both Masthead and RecruiterFooter:** Both contain mode-switch buttons. Both need the prop.
- **Hardcoding `window.print()` without `"use client"` guard:** All components accessing `window` must be in the client component tree. Since `RecruiterView` is already rendered inside `ResumeGateInner` (a `"use client"` component), this is handled by the parent boundary — but Hero.tsx will also need `"use client"` if it uses the `onClick` handler directly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sticky header | Custom JS scroll listener + fixed positioning | CSS `position: sticky; top: 0` + correct scroll ancestor | CSS sticky handles edge cases (iOS rubber-band, resize) correctly with zero JS |
| PDF download | Server-side PDF generation, puppeteer, html2pdf | `window.print()` + `@media print` CSS | The design explicitly specifies this approach; browser PDF export is reliable and zero-cost |
| Font loading | Custom `<link>` tags, manual font-face declarations | Already loaded — `newsreader.variable` applied to `<html>` in `layout.tsx` | Fonts are available as `--font-newsreader` on every element; adding more loading is redundant |
| Mode switching state | Redux, Zustand, Context | `onSwitchToIDE` prop + parent `setMode` in `ResumeGateInner` | Already implemented in `page.tsx`; just wire the prop |

**Key insight:** The entire recruiter view is static presentational markup. There is no async data, no API calls, no state beyond the mode switch propagated from the parent. Every complexity-adding pattern should be rejected.

---

## Common Pitfalls

### Pitfall 1: Sticky Masthead Not Sticking

**What goes wrong:** `position: sticky; top: 0` on Masthead does nothing — the masthead scrolls with the page.

**Why it happens:** CSS sticky requires a scroll ancestor. If the nearest ancestor with `overflow` is set to `hidden` (as `.site-body` is), sticky has no scroll container and behaves like `relative`. The recruiter `article` wrapper must have `overflow-y: auto` and a defined `height` for sticky to activate.

**How to avoid:** Add `overflow-y: auto; height: 100%` to `.recruiter` in the CSS module. The masthead then sticks within the recruiter scroll container.

**Warning signs:** Masthead scrolls out of view; or masthead appears to "stick" but only because the page doesn't scroll at all (content is clipped).

### Pitfall 2: avail-pulse @keyframes Scoping

**What goes wrong:** The animation does not apply — browser console shows "unknown animation name".

**Why it happens:** CSS Modules transform class names but `@keyframes` names are also transformed. If you reference `animation: avail-pulse ...` in a property but the keyframe is defined with the same name in the same file, the module compiler links them. However, if the keyframe is defined in a separate file or in globals.css without `:global()`, the reference breaks.

**How to avoid:** Define `@keyframes avail-pulse` in the same `recruiter.module.css` file where the animation property is used. Do not put it in `globals.css`.

**Warning signs:** No animation visible on the availability dot in the browser; computed styles show `animation-name: none`.

### Pitfall 3: The DOOR-03 E2E Test Breaks

**What goes wrong:** `pnpm exec playwright test` fails on `landing.spec.ts` line 86 because the stub text `"Recruiter view — coming in Phase 9"` is no longer rendered.

**Why it happens:** Phase 8 added a test that explicitly asserts the stub placeholder text to verify that clicking the recruiter door half does transition out of the door. When Phase 9 replaces the stub with real content, this assertion becomes stale.

**How to avoid:** Update `e2e/landing.spec.ts` line 86 (the `DOOR-03 same-session` test) to assert a real element that will be present in the `RecruiterView`. The masthead wordmark ("ruslan.kanat") or the hero headline text are stable candidates. This is a required E2E update in this phase.

**Warning signs:** CI fails; `expect(page.getByText(/Recruiter view — coming in Phase 9/i)).toBeVisible()` throws `locator not found`.

### Pitfall 4: Recruiter Page Background Conflicts with Body Background

**What goes wrong:** The recruiter page has a dark background flash on load, or the page outside the max-width column shows IDE dark background instead of cream.

**Why it happens:** `body` background is `var(--bg-deepest)` (#06090e — dark). The recruiter `article` has `background: var(--paper)` but is max-width 720px and centered. Areas outside the 720px column show through to the dark body background.

**How to avoid:** The recruiter scroll container should set `background: var(--paper)` at full width. Either:
1. Apply `background: var(--paper)` to the scroll container/wrapper that fills the full viewport width (not just the `article` with max-width).
2. Or apply a background on the `RecruiterView` outer wrapper before the max-width constraint. Check how the design handoff handles this: `resume.css` sets `html, body { background: var(--paper) }` — but in this project the body background is controlled globally. The safest approach is making the outermost recruiter wrapper (`height: 100%; overflow-y: auto; background: var(--paper)`) full-bleed, with the inner `max-width: 720px; margin: 0 auto` container nested inside.

**Warning signs:** Visible dark band outside the editorial column on desktop viewports wider than 720px.

### Pitfall 5: `"use client"` Boundary for window.print()

**What goes wrong:** TypeScript or runtime error: `window is not defined` during SSR.

**Why it happens:** `window.print()` is only available in the browser. If any component file in the recruiter tree is accidentally treated as a Server Component (no `"use client"` directive), accessing `window` will throw during Next.js server rendering.

**How to avoid:** `RecruiterView.tsx` is rendered from `page.tsx` which is `"use client"`, so its entire subtree is client-rendered. However, if Hero.tsx or any other component uses hooks or browser APIs directly and is imported outside the `"use client"` ancestor, add the directive explicitly. Safe approach: add `"use client"` at the top of `RecruiterView.tsx`.

---

## Code Examples

### Scroll Container + Sticky Masthead

```css
/* Source: recruiter.module.css — pattern from about.module.css + 09-UI-SPEC.md */

/* Outer scroll container — fills the site-body flex child */
.recruiterScrollRoot {
  height: 100%;
  overflow-y: auto;
  background: var(--paper);
}

/* Inner editorial column */
.recruiter {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 40px 120px;
  color: var(--ink);
  font-family: var(--serif);
  font-size: 18px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* Masthead sticks within .recruiterScrollRoot */
.masthead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--paper);
  /* ... other masthead styles */
}

@media (max-width: 600px) {
  .recruiter { padding: 24px 24px 80px; }
}
```

```tsx
/* Source: 09-UI-SPEC.md + ResumeGateInner pattern from src/app/page.tsx */
export function RecruiterView({ onSwitchToIDE }: { onSwitchToIDE: () => void }) {
  return (
    <div className={styles.recruiterScrollRoot}>
      <article className={styles.recruiter}>
        <Masthead onSwitchToIDE={onSwitchToIDE} />
        <Hero />
        <Section num="01" title="By the numbers"><Metrics /></Section>
        {/* ... remaining sections */}
        <ContactSection />
        <RecruiterFooter onSwitchToIDE={onSwitchToIDE} />
      </article>
    </div>
  );
}
```

### ResumeGateInner Wire-Up

```tsx
/* Source: src/app/page.tsx — replace lines 60–78 (the recruiter stub) */
if (mode === 'recruiter') {
  return (
    <RecruiterView
      onSwitchToIDE={() => {
        try { localStorage.setItem(MODE_KEY, 'ide'); } catch {}
        setMode('ide');
      }}
    />
  );
}
```

### E2E Test Update (DOOR-03)

```ts
/* Source: e2e/landing.spec.ts line 86 — current assertion targets stub text */
// BEFORE (stub — must be removed):
await expect(page.getByText(/Recruiter view — coming in Phase 9/i)).toBeVisible();

// AFTER (targets real recruiter content):
await expect(page.getByRole('banner')).toBeVisible();   // masthead header element
// OR:
await expect(page.getByText('ruslan.kanat')).toBeVisible();  // masthead wordmark
```

---

## Codebase Integration Points (all verified by file reads)

### What Already Exists

| Item | Location | Status | Notes |
|------|----------|--------|-------|
| `--paper`, `--ink-*`, `--forest-*`, `--rule-*` tokens | `globals.css` lines 127–141 | READY | All 14 tokens present, exact values match design handoff |
| `--serif` variable | `globals.css` line 66 | READY | `var(--font-newsreader)` — Newsreader fallback stack matches UI-SPEC |
| Newsreader loaded | `layout.tsx` lines 12–18 | READY | Weights 300/400/500/600/700 + normal + italic; `variable: '--font-newsreader'` applied to `<html>` |
| `LogoMark` component | `src/components/door/LogoMark.tsx` | READY | Exact SVG path from design handoff; `aria-hidden` correct |
| `ResumeGateInner` recruiter branch | `src/app/page.tsx` lines 60–78 | STUB | Renders placeholder div; comment says "Phase 9 will replace this" |
| `onChooseRecruiter` / `setMode('recruiter')` | `src/app/page.tsx` lines 83–87 | READY | Already calls `localStorage.setItem(MODE_KEY, 'recruiter')` and `setMode('recruiter')` |
| `MODE_KEY` constant + `Mode` type | `src/app/page.tsx` lines 9–10 | READY | Already defined |
| `.site-body` overflow constraint | `globals.css` line 398 | CONSTRAINT | `overflow: hidden; height: 100dvh` — recruiter needs own scroll container |
| DoorScreen unit test pattern | `src/components/door/__tests__/DoorScreen.test.tsx` | REFERENCE | Use as template for `RecruiterView` unit tests |
| Landing E2E tests (Door) | `e2e/landing.spec.ts` | NEEDS UPDATE | Line 86 targets stub text; must be updated to target real recruiter content |

### What Does Not Exist (Must Be Created)

| Item | Location | Notes |
|------|----------|-------|
| `src/components/recruiter/` directory | new | All 9 components + CSS module |
| `recruiter.module.css` | `src/components/recruiter/` | All scoped recruiter styles + `@keyframes avail-pulse` + `@media print` block + mobile breakpoints |
| `RecruiterView.tsx` | `src/components/recruiter/` | Article wrapper + section composition; `"use client"` |
| `Masthead.tsx` | `src/components/recruiter/` | Sticky header |
| `Hero.tsx` | `src/components/recruiter/` | Eyebrow + headline + pitch + CTAs |
| `Metrics.tsx` | `src/components/recruiter/` | §01 four-tile grid |
| `Timeline.tsx` | `src/components/recruiter/` | §03 three-job timeline |
| `Skills.tsx` | `src/components/recruiter/` | §04 skill groups |
| `AvailabilityCard.tsx` | `src/components/recruiter/` | §05 spec sheet |
| `ContactSection.tsx` | `src/components/recruiter/` | Contact + 3-col grid |
| `RecruiterFooter.tsx` | `src/components/recruiter/` | Footer with IDE switch |
| E2E test file | `e2e/recruiter.spec.ts` | New recruiter-specific E2E coverage |

---

## Print Contract (Phase 9 implements CSS, Phase 10 validates with real content)

The UI-SPEC specifies that Phase 9 must write the `@media print` block into `recruiter.module.css` even though content replacement happens in Phase 10. This is locked:

```css
/* Source: 09-UI-SPEC.md Print Contract section + resume.css @media print */
@media print {
  body { background: white; font-size: 11pt; }
  .mastheadSwitch { display: none !important; }    /* Engineer view pill */
  .footer { display: none !important; }             /* Footer */
  .ctas { display: none !important; }               /* Download PDF + email CTAs */
  .recruiter { max-width: 100%; padding: 0; }
  /* .recruiterScrollRoot needs print overrides too: overflow: visible; height: auto */
  .section { margin-bottom: 24pt; page-break-inside: avoid; }
  .headline { font-size: 28pt; }
  .pitch { font-size: 13pt; }
}
```

**Note on scroll container + print:** The `overflow-y: auto; height: 100%` on the scroll root will clip content in print mode. The `@media print` block must reset `overflow: visible; height: auto` on both the scroll root and article wrapper.

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| Separate `resume.css` stylesheet | CSS Modules (`recruiter.module.css`) | Project uses CSS Modules for all components; global sheet only for tokens + door |
| `React.createElement(...)` (prototype JSX) | Standard JSX/TSX with TypeScript | Prototype used no-bundler syntax; production uses standard React/Next.js |
| Direct `html/body` background for cream | Scoped scroll container background | Body is dark; recruiter wrapper provides the cream surface |

---

## Validation Architecture

**Test framework:** Vitest 2 (`src/**/*.test.tsx`) + Playwright 1.60.0 (`e2e/*.spec.ts`)
**Config:** `vitest.config.ts` (jsdom, globals, setupFiles: `src/test/setup.ts`); `playwright.config.ts` (chromium, localhost:3000)
**Quick run:** `pnpm test` (Vitest unit)
**E2E run:** `pnpm exec playwright test`
**Full suite:** `pnpm ci-check` (lint + typecheck + test + build)

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Command | File Exists? |
|--------|----------|-----------|---------|-------------|
| REC-01 | Masthead renders wordmark + "Engineer view ↗" pill | unit | `pnpm test -- Masthead` | No — Wave 0 |
| REC-01 | Masthead pill click calls onSwitchToIDE | unit | `pnpm test -- Masthead` | No — Wave 0 |
| REC-02 | Hero renders availability pill, headline, pitch, two CTAs | unit | `pnpm test -- Hero` | No — Wave 0 |
| REC-02 | Download PDF button calls window.print() | unit | `pnpm test -- Hero` | No — Wave 0 |
| REC-03 | Metrics renders four tiles with correct stat text | unit | `pnpm test -- Metrics` | No — Wave 0 |
| REC-05 | Timeline renders three jobs with correct roles and companies | unit | `pnpm test -- Timeline` | No — Wave 0 |
| REC-07 | AvailabilityCard renders six rows | unit | `pnpm test -- AvailabilityCard` | No — Wave 0 |
| REC-08 | Footer switch calls onSwitchToIDE | unit | `pnpm test -- RecruiterFooter` | No — Wave 0 |
| REC-01–08 | Full recruiter view visible at / with recruiter mode | E2E | `pnpm exec playwright test recruiter` | No — Wave 0 |
| REC-10 | Mobile layout renders without overflow at 375px | E2E | `pnpm exec playwright test recruiter` | No — Wave 0 |
| DOOR-03 | Clicking recruiter door half shows recruiter content | E2E (update) | `pnpm exec playwright test landing` | Yes — update line 86 |

### Sampling Rate

- Per task commit: `pnpm test` (Vitest unit suite — sub-10s)
- Per wave merge: `pnpm exec playwright test` (Playwright E2E)
- Phase gate: `pnpm ci-check` (full suite) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/components/recruiter/__tests__/RecruiterView.test.tsx` — covers REC-01 through REC-08 basic render assertions
- [ ] `e2e/recruiter.spec.ts` — covers recruiter view E2E with localStorage pre-seed

*(Existing test infrastructure is complete — no new framework install needed.)*

---

## Environment Availability

Step 2.6: No new external dependencies are required. This phase is purely code/config creation using existing toolchain.

| Dependency | Required By | Available | Version |
|------------|-------------|-----------|---------|
| Node.js | Next.js dev server | Yes | >=20.19.0 (enforced in package.json) |
| pnpm | Package manager | Yes | >=9.0.0 |
| Playwright browsers | E2E tests | Yes | Chromium via @playwright/test 1.60.0 |

---

## Security Domain

`security_enforcement: true` per `.planning/config.json`.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in this view |
| V3 Session Management | No | No session state |
| V4 Access Control | No | Public static content |
| V5 Input Validation | No | No user input in this phase — all content is static, hardcoded copy |
| V6 Cryptography | No | No crypto |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via LLM output | Not applicable | No LLM output rendered in this phase |
| dangerouslySetInnerHTML | Tampering | Do not use — all content is hardcoded JSX strings; no `dangerouslySetInnerHTML` |
| External links (GitHub, LinkedIn) | Info disclosure | Add `rel="noopener noreferrer"` to all `target="_blank"` anchor tags in ContactSection |

**Primary security note:** All content in Phase 9 is static, hardcoded copy from the design handoff. There is no user input, no API call, no data fetch. The only security checklist item is ensuring external contact links use `rel="noopener noreferrer"` per the design handoff (`recruiter.jsx` line 228 already shows this pattern).

---

## Assumptions Log

No `[ASSUMED]` claims in this research. All findings were verified by direct inspection of the codebase.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | All claims verified via codebase reads | — | — |

**Table is empty:** All claims were verified against the actual source files.

---

## Open Questions

1. **Scroll root vs article wrapper**
   - What we know: The scroll container needs `overflow-y: auto; height: 100%` and the editorial max-width column is nested inside. This is the same pattern `/about` uses.
   - What's unclear: Whether the `article` itself should be the scroll root (simpler) or a wrapping `div` should be the scroll root with the `article` inside (as the `/about` page does). The `/about` page uses a separate `.scrollContainer` div wrapping a `.pageWrapper` div.
   - Recommendation: Use a two-level structure — `.recruiterScrollRoot` div (scroll context, full-bleed cream background) containing `.recruiter` article (max-width column). This cleanly separates the viewport-filling responsibility from the editorial column constraints.

2. **Masthead sticky with max-width column**
   - What we know: The masthead is inside the `.recruiter` article which has `max-width: 720px`. `position: sticky` positions relative to the scroll ancestor's viewport.
   - What's unclear: Whether the sticky masthead will stay within the 720px column width or span the full scroll container width.
   - Recommendation: Place the masthead INSIDE the `.recruiter` article (inside the max-width column). It will stick at the top of the scroll container's viewport but only occupy the column width — which is the correct design per UI-SPEC (masthead is part of the article flow, not a full-bleed header). This matches the design handoff exactly.

---

## Sources

### Primary (HIGH confidence — verified by codebase read)

- `src/app/page.tsx` — ResumeGateInner: recruiter stub, mode switching pattern, onChooseRecruiter handler
- `src/app/globals.css` lines 62–141 — `--serif` declaration, all `--paper-*`, `--ink-*`, `--forest-*`, `--rule-*` token values
- `src/app/layout.tsx` — Newsreader font loading: weights, variable name `--font-newsreader`, html class
- `src/components/door/LogoMark.tsx` — LogoMark SVG path and props interface
- `src/components/door/DoorScreen.tsx` — `onSwitchToIDE` prop pattern, mode switching, CSS class usage
- `src/app/(ide)/about/about.module.css` + `page.tsx` — scroll container pattern (`.scrollContainer { overflow-y: auto }`)
- `e2e/landing.spec.ts` — existing DOOR-03 test that needs updating (line 86 stubs text)
- `.planning/phases/09-recruiter-view/09-UI-SPEC.md` — all visual, spacing, color, interaction decisions (locked)
- `.planning/design/design_handoff_resume_v1/recruiter.jsx` — all copy, data arrays, component architecture
- `.planning/design/design_handoff_resume_v1/resume.css` — complete reference CSS

### Secondary (MEDIUM confidence)

None required — all critical details verified from authoritative codebase sources.

---

## Metadata

**Confidence breakdown:**

- Component architecture: HIGH — design is fully locked in UI-SPEC; all integration points verified in code
- CSS token availability: HIGH — verified by reading globals.css directly
- Scroll containment pattern: HIGH — verified by reading about.module.css and globals.css overflow constraints
- E2E test update requirement: HIGH — verified by reading landing.spec.ts line 86
- Print CSS requirement: HIGH — locked in UI-SPEC Print Contract section
- No new packages required: HIGH — all dependencies verified in package.json

**Research date:** 2026-05-28
**Valid until:** 2026-06-27 (stable stack, tokens locked, 30-day horizon)
