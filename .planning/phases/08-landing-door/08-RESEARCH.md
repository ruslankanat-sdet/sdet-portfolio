# Phase 8: Landing Door — Research

**Researched:** 2026-05-27
**Domain:** Next.js 15 / React 19 client component, raw CSS animation, localStorage routing, WCAG AA keyboard accessibility
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Real name "Ruslan Kanatbek" — no placeholder copy in Phase 8
- **D-02:** Recruiter half tagline: *"A readable, single-column résumé. The career, the numbers, how to reach me."*
- **D-03:** IDE half tagline: *"Open the files, run the smoke test, ask the agent."*
- **D-04:** Wordmark: `ruslan.kanatbek`. Recruiter CTA: "Enter the résumé →". IDE CTA: "$ ./open-ide →"
- **D-05:** Component extracted to `src/components/door/DoorScreen.tsx`
- **D-06:** LogoMark inline SVG in `src/components/door/LogoMark.tsx` (18×18, lifted from recruiter.jsx)
- **D-07:** Cream/forest tokens added to `:root` in `globals.css` — same scope as IDE tokens, clearly sectioned
- **D-08:** `.door-*` utility classes in `globals.css` (no CSS Modules, no Tailwind-only)
- **D-09:** Cream tokens: `--paper`, `--paper-deep`, `--paper-soft`, `--ink`, `--ink-soft`, `--ink-muted`, `--ink-faint`, `--rule`, `--rule-soft`, `--forest`, `--forest-deep`, `--forest-soft`, `--forest-line`
- **D-10:** Newsreader weight range expanded to `['300', '400', '500', '600', '700']` in `layout.tsx`

### Claude's Discretion

- Hover animation timing and easing — use values from `resume.css` (`.55s cubic-bezier(.4,.0,.2,1)`) verbatim
- Exact padding values for door halves — use `resume.css` values (`padding: 40px 64px 48px`)
- Mobile breakpoint for vertical stacking — use 760px from the design README
- `prefers-reduced-motion` guard for animations — implement per design README

### Deferred Ideas (OUT OF SCOPE)

- Ruslan's actual recruiter-half copy — Phase 9 + Phase 10
- Print stylesheet — Phase 10
- Availability pulse dot on the Door — Phase 9
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DOOR-01 | Full-viewport split-screen door — left cream half, right dark IDE half — both clickable with hover expand animation | CSS flex-grow animation approach verified from `resume.css`; container integration with `.site-body` documented in Pitfall 1 |
| DOOR-02 | Clicking a door half sets `localStorage["resume-mode"]` and renders the appropriate view without page navigation | Storage already handled by `ResumeGateInner`; DoorScreen receives callbacks — no storage calls inside DoorScreen |
| DOOR-03 | Return visitor routed directly to previously chosen view — door not shown again | Handled by existing `readStoredMode()` in `page.tsx`; DoorScreen is only rendered when `mode === null` |
| DOOR-04 | Visitor who appends `?reset` sees the door again — stored mode cleared | Handled by existing `useEffect` in `ResumeGateInner`; `?reset` already calls `clearStoredMode()` |
</phase_requirements>

---

## Summary

Phase 8 delivers the DoorScreen component — a full-viewport split-screen landing that replaces the `mode === null` stub in `ResumeGateInner`. The ResumeGate routing shell (mode persistence, `?reset` handling, localStorage read/write) is already complete from Phase 7. This phase is purely a UI build.

The technical work divides into four areas: (1) cream/forest CSS tokens and `.door-*` utility classes appended to `globals.css`, (2) the `DoorScreen.tsx` client component with keyboard accessibility, (3) the `LogoMark.tsx` inline SVG, and (4) Newsreader font weight expansion plus existing e2e test updates.

The most significant integration pitfall is the container height mismatch: `body.site-body` uses `height: 100dvh` with `overflow: hidden` and `display: flex; flex-direction: column`, while `resume.css` uses `min-height: 100vh` for `.door`. The DoorScreen must use `height: 100%` (filling its flex-parent) rather than `min-height: 100vh`, and this adaptation belongs in `globals.css` as a project-specific override. The second critical pitfall is that all existing e2e tests that navigate to `'/'` assume IDE mode — they will break after Phase 8 ships the door. Those tests need `page.addInitScript` pre-seeding before the door is activated.

**Primary recommendation:** Implement the CSS layer first (tokens + `.door-*` classes in globals.css), verify the container height works correctly, then build `DoorScreen.tsx` against those classes, lift `LogoMark.tsx`, and close with e2e test updates and new Door-specific tests.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Mode persistence (localStorage) | Browser / Client | — | `localStorage` is client-only; already implemented in `ResumeGateInner` — DoorScreen receives callbacks only |
| Door routing (`?reset` handling) | Browser / Client | — | `useSearchParams` in `ResumeGateInner` already handles this |
| Door UI rendering | Browser / Client | — | Purely presentational component; `'use client'` for onClick/onKeyDown |
| CSS tokens and layout classes | Static (globals.css) | — | Raw CSS custom properties and class rules; no runtime cost |
| Font loading (Newsreader weights) | Frontend Server (SSR) | — | `next/font/google` generates optimized `@font-face` at build time |

---

## Standard Stack

### No New Packages Required

Phase 8 installs zero new packages. All required dependencies are already present:

| Dependency | Already In | Purpose |
|------------|-----------|---------|
| `react@19.1.0` | `dependencies` | `useState`, `useEffect`, `onClick`, `onKeyDown` |
| `next@15.5.18` | `dependencies` | `next/font/google` Newsreader weight expansion |
| `tailwindcss@4.3.0` | `dependencies` | Raw `@import "tailwindcss"` import; CSS custom properties coexist with `@theme` |
| `@testing-library/react@16.x` | `devDependencies` | Component unit tests |
| `@testing-library/user-event@14.x` | `devDependencies` | Keyboard interaction tests |
| `vitest@4.1.7` | `devDependencies` | Test runner (jsdom environment) |
| `@playwright/test@1.60.0` | `devDependencies` | E2E tests for door routing |

[VERIFIED: npm registry] — all packages confirmed present in `package.json` and `node_modules/`.

---

## Package Legitimacy Audit

> Phase 8 installs NO new packages. This section is intentionally empty.

**Packages added this phase:** None.
**Packages removed due to slopcheck:** None.

---

## Architecture Patterns

### System Architecture Diagram

```
Browser (first visit)
        |
        v
body.site-body (height:100dvh, overflow:hidden, flex-column)
        |
        v
ResumeGate [Suspense wrapper]
        |
        v
ResumeGateInner ['use client']
  - reads localStorage on mount
  - handles ?reset
  - mode state: null | 'recruiter' | 'ide'
        |
  mode === null
        |
        v
DoorScreen (props: onChooseRecruiter, onChooseIDE)
  [no localStorage reads — callbacks only]
        |
  ┌─────────────────────────────────────┐
  │ .door (height:100%, flex-row)       │
  │                                     │
  │  .door-half-recruiter    .door-half-ide  │
  │  [role=button, tabIndex=0]  [role=button, tabIndex=0] │
  │  onClick → onChooseRecruiter  onClick → onChooseIDE   │
  └─────────────────────────────────────┘
        |
  onClick/Enter/Space
        |
        v
ResumeGateInner sets mode → 'recruiter' | 'ide'
  writes localStorage["resume-mode"]
  re-renders RecruiterView stub | IDEShell
```

### Recommended Project Structure (additions only)

```
src/components/door/
├── DoorScreen.tsx       # Full split-screen door component
└── LogoMark.tsx         # Inline SVG glyph (18×18)

src/app/
├── globals.css          # Append cream/forest tokens + .door-* classes
└── layout.tsx           # Expand Newsreader weight array
```

No changes needed to `page.tsx` beyond replacing the `mode === null` stub return with `<DoorScreen onChooseRecruiter=... onChooseIDE=... />`.

---

### Pattern 1: Container Height Adaptation

**What:** `resume.css` uses `min-height: 100vh` for `.door`. Inside `body.site-body` (which is a `height: 100dvh`, `overflow: hidden` flex container), the door must fill the parent rather than set its own viewport height. Use `height: 100%` in the project's CSS class override.

**Why:** `min-height: 100vh` on a flex child of a `height: 100dvh` container creates a height discrepancy on mobile Safari (where `100vh` != `100dvh` due to browser chrome). The result is a thin visible slice of the door's dark background below the door edge on iOS.

**Verified source:** `globals.css` `.site-body` (lines 155–160) — `height: 100dvh; overflow: hidden; display: flex; flex-direction: column`. The door div is a direct flex child.

```css
/* In globals.css — project override for the door inside site-body */
.door {
  position: relative;
  height: 100%;           /* fills flex-parent (site-body = 100dvh) */
  width: 100%;
  display: flex;
  overflow: hidden;
  background: #000;
}
/* NOT min-height: 100vh (from resume.css) */
```

[VERIFIED: codebase] — `src/app/globals.css` `.site-body` structure confirmed.

---

### Pattern 2: CSS Token Appending in Tailwind v4

**What:** Tailwind v4 uses `@theme` for design tokens that map to utility classes. Plain CSS custom properties on `:root` coexist cleanly — they do not conflict with `@theme` declarations.

**When to use:** Add cream/forest tokens to `:root` in `globals.css` after the IDE token block. No `@theme` wrapper needed because these tokens will only be used by `.door-*` classes in the same file, not as Tailwind utilities.

**Source:** [CITED: tailwindcss.com/blog/tailwindcss-v4] — "Use `@theme` when you want a design token to map directly to a utility class, and use `:root` for defining regular CSS variables that shouldn't have corresponding utility classes."

```css
/* ─────────────────────────────────────────────────────────────
   Door / recruiter editorial tokens — cream + forest green
   ───────────────────────────────────────────────────────────── */
:root {
  --paper:        #f4ecdc;
  --paper-deep:   #ede4d0;
  --paper-soft:   #faf4e6;
  --ink:          #1a1f1c;
  --ink-soft:     #3a3f3a;
  --ink-muted:    #6e6a5e;
  --ink-faint:    #9b9486;
  --rule:         #d8d0bd;
  --rule-soft:    #e4ddca;
  /* oklch values — browser support 93%+ (Safari 15.4+, Chrome 111+, Firefox 113+) */
  --forest:        oklch(0.40 0.09 152);
  --forest-deep:   oklch(0.30 0.08 152);
  --forest-soft:   oklch(0.40 0.09 152 / 0.08);
  --forest-line:   oklch(0.40 0.09 152 / 0.20);
  --ide-green:     #3ddc84;
}
```

[VERIFIED: codebase] — existing `globals.css` `:root` block pattern confirmed; tokens are appended after `--radius`.

---

### Pattern 3: Keyboard Accessible Door Half

**What:** Each door half uses `role="button"`, `tabIndex={0}`, and `onKeyDown` handling `Enter` and `Space`. This pattern is required for WCAG 2.1 SC 2.1.1 (keyboard accessible).

**ESLint gate:** `next/core-web-vitals` includes `eslint-plugin-jsx-a11y`. The rule `interactive-supports-focus` requires that `role="button"` elements have `tabIndex={0}` — this is already in the prototype. The rule `click-events-have-key-events` requires an `onKeyDown` alongside `onClick` on non-interactive elements — also in the prototype.

```tsx
// Source: .planning/design/design_handoff_resume_v1/resume-app.jsx (lines 76-81)
<div
  className="door-half door-half-recruiter"
  onClick={onChooseRecruiter}
  role="button"
  tabIndex={0}
  onKeyDown={(e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // prevent Space from scrolling
      onChooseRecruiter();
    }
  }}
>
```

Note: `e.preventDefault()` on Space is important — without it, Space scrolls the page before triggering the handler.

[VERIFIED: codebase] — `eslint.config.mjs` extends `next/core-web-vitals` which includes `jsx-a11y`.

---

### Pattern 4: Flex-Grow Hover Animation

**What:** The expand-on-hover effect shrinks both halves to `flex-grow: 0.85` on `.door:hover`, then expands the hovered half to `flex-grow: 1.3`. The transition runs on `flex-grow` only.

**Browser support:** [ASSUMED] — `flex-grow` is spec-defined as animatable (animation type: number). Chrome, Firefox, and Edge animate it smoothly. Safari's behavior on `flex-grow` transitions has historically been abrupt (instant jump) rather than smooth, though this has improved in recent WebKit versions. The caniuse page for `mdn-css_properties_flex-grow_less_than_zero_animate` shows ~79% global coverage, suggesting Safari is not fully consistent.

**Mitigation already in design:** The design README mandates gating animations behind `prefers-reduced-motion: no-preference`. For Safari users who would see an abrupt jump, this means: the layout is always correct (50/50 split, one half clicks), the smoothness is the only thing that degrades. This is acceptable — the animation is cosmetic enhancement, not functional.

**Mobile:** The 760px breakpoint resets `flex-grow` to `1` on both halves inside media query, effectively disabling the animation at narrow viewports.

```css
/* Source: resume.css lines 69-75, adapted with project height fix */
.door-half {
  position: relative;
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  padding: 40px 64px 48px;
  cursor: pointer;
  transition: flex-grow .55s cubic-bezier(.4,.0,.2,1), padding .55s cubic-bezier(.4,.0,.2,1);
  overflow: hidden;
  min-width: 0;
}
.door-half > .door-body { margin: auto 0; }
.door:hover .door-half { flex-grow: 0.85; }
.door:hover .door-half:hover { flex-grow: 1.3; }

@media (prefers-reduced-motion: reduce) {
  .door-half { transition: none; }
}

@media (max-width: 760px) {
  .door { flex-direction: column; }
  .door:hover .door-half,
  .door:hover .door-half:hover { flex-grow: 1; }
}
```

[CITED: .planning/design/design_handoff_resume_v1/resume.css] — verbatim from design source.

---

### Pattern 5: Newsreader Font Weight Expansion

**What:** Newsreader is a variable font (`wght` axis: 200–800). Expanding the weight array in `next/font` from `['400', '500']` to `['300', '400', '500', '600', '700']` is valid and requires only the one-line change in `layout.tsx`.

**Verified:** `node_modules/next/dist/compiled/@next/font/dist/google/font-data.json` confirms Newsreader has `wght` axis min=200, max=800 and lists discrete weights: 200, 300, 400, 500, 600, 700, 800, variable.

```tsx
// Source: src/app/layout.tsx line 12 — change weight array
const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['300', '400', '500', '600', '700'],  // was: ['400', '500']
});
```

[VERIFIED: codebase] — font-data.json inspected directly.

---

### Pattern 6: `'use client'` Import Chain

**What:** `page.tsx` is already `'use client'`. Importing `DoorScreen` from it does NOT require a separate `'use client'` directive in `DoorScreen.tsx` — it is pulled into the client bundle automatically as part of the module graph.

**Recommendation:** Still add `'use client'` to `DoorScreen.tsx` explicitly. Reason: DoorScreen uses `onClick` and `onKeyDown` event handlers. Making the directive explicit aids code review, grep-ability, and prevents surprises if DoorScreen is later imported from a Server Component context.

[CITED: nextjs.org/docs/app/api-reference/directives/use-client] — "Once a file is marked with 'use client', all of its imports and the components it directly renders are included in the client bundle."

---

### Anti-Patterns to Avoid

- **`min-height: 100vh` on `.door`:** Use `height: 100%` in the project's globals.css. The `resume.css` prototype was standalone (no parent container) — the project's `body.site-body` is a `100dvh` bounded flex parent. `min-height: 100vh` will cause visible overflow on mobile Safari. [VERIFIED: codebase]
- **oklch values without hex fallback:** Not needed for this project — target browsers (2025 portfolio site, recruiter audience on modern Macs) have 93%+ oklch coverage. The design prototype uses oklch directly. If a fallback is desired for very old browsers, add the hex equivalent before the oklch declaration; older browsers use the first valid value.
- **`dangerouslySetInnerHTML` for door copy:** Not applicable — door content is static JSX strings.
- **Inline `style={{ color: 'var(--forest)' }}`:** The project pattern is to reference CSS variables via className only (confirmed in CONTEXT.md). DoorScreen must use class names from globals.css, not inline style objects with var() references.
- **CSS Modules for DoorScreen:** Not used anywhere in the codebase for this type of layout. Use globals.css classes per D-08.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading with self-hosting | Custom `@font-face` | `next/font/google` | Already used in layout.tsx; next/font handles subsetting, preload hints, CLS-prevention |
| CSS animation library for flex-grow | JS-driven width animation | Pure CSS `transition: flex-grow` | The design is CSS-only; adding a JS animation lib (Framer Motion etc.) would add bundle weight and contradict CLAUDE.md's "no unnecessary libs" policy |
| localStorage wrapper | Custom typed abstraction | Existing `readStoredMode()` / `clearStoredMode()` in `page.tsx` | Already implemented in Phase 7; DoorScreen receives callbacks |

**Key insight:** Everything in Phase 8 is CSS and JSX composition. The design handoff provides the complete CSS. Lift, adapt, don't rebuild.

---

## Common Pitfalls

### Pitfall 1: Container Height Conflict — `min-height:100vh` vs `height:100dvh`

**What goes wrong:** Door half appears clipped at the bottom on mobile Safari and iOS Chrome. The door extends below the visible viewport by roughly the height of the browser address bar.

**Why it happens:** `body.site-body` is `height: 100dvh; overflow: hidden`. The door div is its direct flex child. Setting `min-height: 100vh` on the door creates a taller element than its container (since `100vh` on iOS includes the space behind the retracted address bar, while `100dvh` is the currently visible area). The `overflow: hidden` clips it.

**How to avoid:** In globals.css, set `.door { height: 100%; }` (fills the flex-parent which is already `100dvh`). Do not copy `min-height: 100vh` from `resume.css`.

**Warning signs:** Door appears fine on desktop but has a dark band below it on iOS simulator or real device.

[VERIFIED: codebase] — confirmed by reading `globals.css` `.site-body` structure and `page.tsx` `div style={{ height: '100dvh' }}` stubs.

---

### Pitfall 2: Existing E2E Tests Break at `/`

**What goes wrong:** After Phase 8 ships, `e2e/landing.spec.ts`, `e2e/navigation.spec.ts`, and `e2e/ide-interactions.spec.ts` all fail because `page.goto('/')` now shows the Door instead of the IDE.

**Why it happens:** These tests were written when `'/'` always showed the IDE (the Phase 7 stub skipped the door and showed IDE mode directly). After Phase 8, a fresh browser has no `localStorage["resume-mode"]`, so it gets the Door.

**How to avoid:** Before the Phase 8 door is activated, update every e2e test that navigates to `'/'` and expects IDE chrome to pre-seed localStorage:

```typescript
// Pattern for IDE-mode e2e tests
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('resume-mode', 'ide');
  });
});
```

**Affected tests (9 goto('/') calls across 3 files):**
- `e2e/landing.spec.ts` — 5 tests assume IDE chrome or neutral page features
- `e2e/navigation.spec.ts` — 1 test (`About link navigates to /about` expects `SiteHeader` which is only in IDE mode)
- `e2e/ide-interactions.spec.ts` — 3 tests navigate to `'/'` and immediately expect sidebar/editor

**Warning signs:** CI turns red on all `goto('/')` tests the moment the door component is wired into `page.tsx`.

[VERIFIED: codebase] — confirmed by `grep -n "goto.*'/'" e2e/*.spec.ts`.

---

### Pitfall 3: Space Key Scrolls Before Triggering Handler

**What goes wrong:** Pressing Space on a focused door half scrolls the page instead of triggering the choice.

**Why it happens:** Space is the browser's default page-scroll key. On non-native-button elements with `role="button"`, the default action is not suppressed automatically.

**How to avoid:** Call `e.preventDefault()` in the `onKeyDown` handler before invoking the callback:

```tsx
onKeyDown={(e: React.KeyboardEvent) => {
  if (e.key === ' ') {
    e.preventDefault(); // stop page scroll
    onChooseRecruiter();
  }
  if (e.key === 'Enter') {
    onChooseRecruiter();
  }
}}
```

**Warning signs:** Keyboard navigation works for Enter but not Space, or Space scrolls AND triggers (double-firing).

---

### Pitfall 4: `flex-grow` Transition Abruptness on Older Safari

**What goes wrong:** On Safari (particularly older WebKit versions), the flex-grow transition appears as an instant jump rather than smooth animation.

**Why it happens:** WebKit has historically had incomplete support for animating flex-grow. Caniuse records ~79% global coverage for `mdn-css_properties_flex-grow_less_than_zero_animate`.

**How to avoid:** The design README already mandates `prefers-reduced-motion: no-preference` gating. This is the correct mitigation — the animation is cosmetic. Add a `@media (prefers-reduced-motion: reduce) { .door-half { transition: none; } }` block. Safari users who have motion reduction enabled will see no animation; those without it set may see an instant jump on older Safari — still functional, just less polished.

**Warning signs:** Testing on iOS Simulator shows abrupt snap instead of smooth expansion. No functional regression, cosmetic only.

---

### Pitfall 5: ESLint `jsx-a11y` Violations on Div-with-Role

**What goes wrong:** ESLint fails with `jsx-a11y/interactive-supports-focus` or `jsx-a11y/click-events-have-key-events`.

**Why it happens:** `next/core-web-vitals` extends `eslint-plugin-jsx-a11y`. The door halves are `<div>` elements with `onClick` — these are non-interactive elements by default, requiring explicit accessibility attributes.

**How to avoid:** Include all three: `role="button"`, `tabIndex={0}`, and `onKeyDown`. All three are already in the prototype in `resume-app.jsx`. This is the established pattern; follow it exactly.

**Warning signs:** `pnpm lint` fails with `jsx-a11y/interactive-supports-focus` or `jsx-a11y/click-events-have-key-events` during task commit.

[VERIFIED: codebase] — `eslint.config.mjs` extends `next/core-web-vitals`; `node_modules/eslint-config-next/index.js` confirms `jsx-a11y` plugin is included.

---

## Code Examples

### LogoMark SVG (lift verbatim from recruiter.jsx)

```tsx
// Source: .planning/design/design_handoff_resume_v1/recruiter.jsx lines 34-44
// Adapt to TypeScript JSX
export function LogoMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M2 9L6 5L8 7L12 3M12 3H15M12 3V6"
        stroke="currentColor"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={14} cy={13} r={2} stroke="currentColor" strokeWidth={1.5} fill="none" />
    </svg>
  );
}
```

### DoorScreen skeleton

```tsx
// Source: .planning/design/design_handoff_resume_v1/resume-app.jsx, adapted
'use client';

interface DoorScreenProps {
  onChooseRecruiter: () => void;
  onChooseIDE: () => void;
}

export function DoorScreen({ onChooseRecruiter, onChooseIDE }: DoorScreenProps) {
  return (
    <div className="door">
      <div
        className="door-half door-half-recruiter"
        role="button"
        tabIndex={0}
        onClick={onChooseRecruiter}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChooseRecruiter(); }
        }}
      >
        <div className="door-bg-pattern" aria-hidden="true" />
        <div className="door-id">
          <span className="door-id-mark"><LogoMark size={16} /></span>
          <span className="door-id-wordmark">ruslan.kanatbek</span>
        </div>
        {/* eyebrow, body (name + tagline), foot (CTA) */}
      </div>
      <div
        className="door-half door-half-ide"
        role="button"
        tabIndex={0}
        onClick={onChooseIDE}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChooseIDE(); }
        }}
      >
        {/* identity, eyebrow, body, foot */}
      </div>
    </div>
  );
}
```

### page.tsx — replace stub

```tsx
// src/app/page.tsx — replace the mode === null return (line 76)
// Add import at top: import { DoorScreen } from '@/components/door/DoorScreen';

// Replace:
return (
  <div style={{ background: '#06090e', height: '100dvh', ... }}>
    Landing door — coming in Phase 8
  </div>
);

// With:
return (
  <DoorScreen
    onChooseRecruiter={() => {
      try { localStorage.setItem(MODE_KEY, 'recruiter'); } catch {}
      setMode('recruiter');
    }}
    onChooseIDE={() => {
      try { localStorage.setItem(MODE_KEY, 'ide'); } catch {}
      setMode('ide');
    }}
  />
);
```

Note: The storage write happens in `ResumeGateInner` via the callback, not inside `DoorScreen`. This keeps `DoorScreen` purely presentational (testable without mocking localStorage).

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `100vh` for full-viewport height | `100dvh` (dynamic viewport height) | Safari 15.4+ / Chrome 108+ | Fixes the classic iOS address-bar height bug; `dvh` resizes as browser UI shows/hides |
| `min-height: 100vh` for door | `height: 100%` when inside bounded flex parent | N/A (context-dependent) | Prevents overflow/clip inside `site-body` |
| Hand-rolled `@font-face` for Google Fonts | `next/font/google` | Next.js 13+ | Self-hosts fonts, generates optimal preload hints, eliminates CLS from font swap |
| Separate CSS file for component styles | `:root` tokens + global utility classes in `globals.css` | This project's convention | Consistent with how IDE styles are organized; no CSS Modules for this layer |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Safari flex-grow animation may be abrupt (not smooth) on older WebKit | Pitfall 4 | Risk LOW — the layout is always correct; only the smoothness degrades. prefers-reduced-motion gate covers the graceful fallback. |
| A2 | `next/core-web-vitals` ESLint config will flag div+onClick without role/tabIndex/onKeyDown | Pitfall 5 | Risk LOW — confirmed jsx-a11y plugin is included; standard pattern from prototype addresses it |

---

## Open Questions

1. **Should the callbacks for `onChooseRecruiter` / `onChooseIDE` be inlined in `page.tsx` or extracted as named functions?**
   - What we know: `ResumeGateInner` already has `readStoredMode` and `clearStoredMode` as named functions
   - What's unclear: Whether the CONTEXT.md's "DoorScreen receives callbacks, does not manage storage itself" means the callbacks must be inline closures or could be named utilities
   - Recommendation: Inline closures in `page.tsx` are fine for two callbacks; extract only if Phase 9 needs to share the same write logic

2. **ARIA label for the door halves?**
   - What we know: `role="button"` with visible text content ("Enter the résumé →") satisfies WCAG 4.1.2 Name, Role, Value
   - What's unclear: Whether the axe-core playwright test in the existing `landing.spec.ts` WCAG AA scan will flag the door halves for anything beyond role/tabIndex
   - Recommendation: The eyebrow text + CTA text gives each half an accessible name via button text content — no explicit `aria-label` needed. Verify in Wave 0 Vitest axe snapshot.

---

## Environment Availability

All required tools are available — no external services or runtimes beyond what is already installed.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js dev server | ✓ | v20+ | — |
| pnpm | Package install | ✓ | 9.x | — |
| next/font (Google Fonts) | Newsreader weight expansion | ✓ | bundled with next@15.5.18 | — |
| @testing-library/react | Component unit tests | ✓ | 16.3.2 | — |
| @testing-library/user-event | Keyboard interaction tests | ✓ | 14.6.1 | — |
| vitest | Unit test runner | ✓ | 4.1.7 | — |
| @playwright/test | E2E tests | ✓ | 1.60.0 | — |

**Missing dependencies with no fallback:** None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.7 (unit) + Playwright 1.60.0 (E2E) |
| Config file | `vitest.config.ts` (unit), `playwright.config.ts` (E2E) |
| Quick run command | `pnpm vitest run src/components/door` |
| Full suite command | `pnpm vitest run && pnpm playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DOOR-01 | DoorScreen renders two halves with correct roles | unit | `pnpm vitest run src/components/door/__tests__/DoorScreen.test.tsx` | ❌ Wave 0 |
| DOOR-01 | Recruiter half has correct classes and content | unit | same | ❌ Wave 0 |
| DOOR-01 | IDE half has correct classes and content | unit | same | ❌ Wave 0 |
| DOOR-01 | E2E: door is shown at `/` with no localStorage | e2e | `pnpm playwright test e2e/landing.spec.ts` | ❌ Wave 0 (new tests needed) |
| DOOR-02 | Clicking recruiter half calls onChooseRecruiter | unit | same DoorScreen test file | ❌ Wave 0 |
| DOOR-02 | Clicking IDE half calls onChooseIDE | unit | same | ❌ Wave 0 |
| DOOR-02 | Space key triggers correct callback | unit | same | ❌ Wave 0 |
| DOOR-02 | Enter key triggers correct callback | unit | same | ❌ Wave 0 |
| DOOR-03 | E2E: return visitor bypasses door to IDE | e2e | `pnpm playwright test e2e/landing.spec.ts` | ❌ Wave 0 |
| DOOR-03 | E2E: return visitor bypasses door to recruiter | e2e | same | ❌ Wave 0 |
| DOOR-04 | E2E: `?reset` clears mode and shows door | e2e | same | ❌ Wave 0 |
| EXISTING | All existing goto('/') tests pre-seeded with ide mode | e2e | `pnpm playwright test` | ❌ needs update |

### Sampling Rate

- **Per task commit:** `pnpm vitest run src/components/door`
- **Per wave merge:** `pnpm vitest run && pnpm playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/components/door/__tests__/DoorScreen.test.tsx` — covers DOOR-01, DOOR-02 (unit)
- [ ] New `e2e/landing.spec.ts` door-specific tests — covers DOOR-01 E2E, DOOR-03, DOOR-04
- [ ] Update `e2e/landing.spec.ts`, `e2e/navigation.spec.ts`, `e2e/ide-interactions.spec.ts` — add `page.addInitScript` for localStorage seeding (DOOR-03 breakage prevention)

---

## Security Domain

Phase 8 introduces no API routes, no user input handling, no data persistence, and no LLM calls. The security surface is limited to:

### Applicable ASVS Categories (ASVS Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in v1 |
| V3 Session Management | No | localStorage only (not a session) |
| V4 Access Control | No | No protected routes |
| V5 Input Validation | No | No user input; localStorage read is a controlled enum check (`'recruiter' \| 'ide'`) |
| V6 Cryptography | No | No secrets handled |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| localStorage tampering | Tampering | Already handled: `readStoredMode()` validates against `'recruiter' \| 'ide'` enum; invalid values return `null` and show the door |
| XSS via LLM output | N/A | Phase 8 has no LLM output rendering |

No security-blocking concerns for Phase 8.

---

## Sources

### Primary (HIGH confidence)
- `.planning/design/design_handoff_resume_v1/resume.css` — complete CSS: tokens, `.door-*` classes, flex-grow animation values, mobile breakpoint
- `.planning/design/design_handoff_resume_v1/resume-app.jsx` — Door component prototype with keyboard handlers
- `.planning/design/design_handoff_resume_v1/recruiter.jsx` — LogoMark SVG definition
- `src/app/page.tsx` — insertion point, existing callbacks
- `src/app/globals.css` — existing token and class patterns (confirmed coexistence with Tailwind v4 `@import`)
- `src/app/layout.tsx` — Newsreader font declaration, confirmed weight array
- `node_modules/next/dist/compiled/@next/font/dist/google/font-data.json` — Newsreader is variable font, wght axis 200–800
- `vitest.config.ts` — jsdom environment confirmed
- `src/components/ide/__tests__/Sidebar.test.tsx` — unit test pattern (RTL + userEvent)
- `e2e/landing.spec.ts`, `e2e/navigation.spec.ts`, `e2e/ide-interactions.spec.ts` — all tests that `goto('/')` identified for e2e update

### Secondary (MEDIUM confidence)
- [oklch browser support: caniuse.com](https://caniuse.com/mdn-css_types_color_oklch) — Safari 15.4+, Chrome 111+, Firefox 113+ (~93% global coverage)
- [dvh browser support: testmuai.com](https://www.testmuai.com/learning-hub/viewport-unit-variants-browser-support/) — Safari 15.4+, Chrome 108+ (~90%+ global coverage)
- [Next.js use client docs: nextjs.org](https://nextjs.org/docs/app/api-reference/directives/use-client) — module graph client-bundling behavior confirmed
- [Tailwind v4 @theme vs :root: tailwindcss.com](https://tailwindcss.com/blog/tailwindcss-v4) — confirmed coexistence

### Tertiary (LOW confidence)
- [flex-grow animation Safari: developer.apple.com forums](https://developer.apple.com/forums/thread/131664) — historical report of abrupt flex transition in older Safari; `prefers-reduced-motion` gate is the mitigation
- [caniuse flex-grow animate](https://caniuse.com/mdn-css_properties_flex-grow_less_than_zero_animate) — ~79% global coverage; Safari shows no support for `<0` animate (design does not use <0 values, but general animatability is in question for older WebKit)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all deps verified in node_modules
- CSS token and animation approach: HIGH — design source is authoritative; container height pitfall verified from codebase
- Keyboard accessibility pattern: HIGH — verified from prototype and ESLint config
- flex-grow Safari animation smoothness: MEDIUM — functional correctness confirmed, visual smoothness uncertain on old Safari (mitigated by `prefers-reduced-motion`)
- E2E test impact: HIGH — grep verified exact line count of affected tests

**Research date:** 2026-05-27
**Valid until:** 2026-06-27 (stable stack; only risk is browser engine updates)
