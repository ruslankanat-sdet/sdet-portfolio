# Phase 8: Landing Door — Pattern Map

**Mapped:** 2026-05-27
**Files analyzed:** 7
**Analogs found:** 6 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/door/DoorScreen.tsx` | component | event-driven | `src/components/ide/TopBar.tsx` | role-match |
| `src/components/door/LogoMark.tsx` | component | transform | `src/components/ide/TopBar.tsx` (inline SVG block lines 82-85) | exact (same SVG path) |
| `src/app/globals.css` | config | transform | `src/app/globals.css` `:root` block lines 8-69 (IDE tokens) | exact (same file, append pattern) |
| `src/app/layout.tsx` | config | transform | `src/app/layout.tsx` lines 12-18 (Newsreader declaration) | exact (one-line change) |
| `src/app/page.tsx` | component | event-driven | `src/app/page.tsx` lines 76-93 (mode===null stub) | exact (insertion point) |
| `e2e/*.spec.ts` | test | request-response | `e2e/ide-interactions.spec.ts` + `e2e/landing.spec.ts` | role-match |
| `src/components/door/__tests__/DoorScreen.test.tsx` | test | event-driven | `src/components/ide/__tests__/Sidebar.test.tsx` | exact |

---

## Pattern Assignments

### `src/components/door/DoorScreen.tsx` (component, event-driven)

**Analog:** `src/components/ide/TopBar.tsx` (client component with event handlers and CSS-variable-driven classes)

**Imports pattern** (`TopBar.tsx` lines 1-8):
```typescript
"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types/ide';
import styles from './TopBar.module.css';
```

DoorScreen adaptation — no CSS Modules (D-08 mandates globals.css classes), no cn() needed:
```typescript
'use client';

import { LogoMark } from './LogoMark';
```

**'use client' directive placement** (`page.tsx` line 1):
```typescript
'use client';
```
Always the very first line of the file, before any imports.

**Core component pattern** — props interface + named export (`TopBar.tsx` lines 9-37):
```typescript
interface TopBarProps {
  onRun: () => void;
  running: boolean;
  theme: Theme;
  toggleTheme: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function TopBar({ onRun, running, theme, toggleTheme, onToggleSidebar, sidebarOpen }: TopBarProps) {
  // ...
}
```

DoorScreen adaptation:
```typescript
interface DoorScreenProps {
  onChooseRecruiter: () => void;
  onChooseIDE: () => void;
}

export function DoorScreen({ onChooseRecruiter, onChooseIDE }: DoorScreenProps) {
  // purely presentational — no state, no effects, no localStorage
}
```

**Keyboard accessibility + div-as-button pattern** (design prototype `resume-app.jsx` lines 76-81, adapted to TSX):
```tsx
<div
  className="door-half door-half-recruiter"
  role="button"
  tabIndex={0}
  onClick={onChooseRecruiter}
  onKeyDown={(e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // prevent Space scrolling
      onChooseRecruiter();
    }
  }}
>
```
This pattern satisfies `jsx-a11y/click-events-have-key-events` and `jsx-a11y/interactive-supports-focus` — both enforced by `next/core-web-vitals` ESLint config.

**CSS-variable reference via className (not inline style)** (established pattern from `page.tsx` lines 45-53):
```tsx
// CORRECT — reference tokens via class names defined in globals.css
<main className="site-main">

// WRONG — never reference CSS vars via inline style objects
<div style={{ color: 'var(--forest)' }}>
```
DoorScreen must use `.door-half-recruiter`, `.door-half-ide`, `.door-body`, `.door-name` etc. as class names only.

**Inline SVG aria pattern** (`TopBar.tsx` lines 82-85):
```tsx
<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M2 9L6 5L8 7L12 3M12 3H15M12 3V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  <circle cx="14" cy="13" r="2" stroke="currentColor" strokeWidth="1.5" />
</svg>
```
Note: `aria-hidden="true"` is added when the SVG is decorative (set on the `<svg>` element itself).

---

### `src/components/door/LogoMark.tsx` (component, transform)

**Analog:** `src/components/ide/TopBar.tsx` lines 82-85 — the *same* SVG glyph is already rendered inline in TopBar's logoMark div.

**Exact SVG to lift** (from `recruiter.jsx` lines 34-44, adapted to TypeScript JSX):
```tsx
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
This is a pure presentational function — no `'use client'` directive needed (no event handlers, no hooks).

---

### `src/app/globals.css` (config, transform — append only)

**Analog:** `src/app/globals.css` lines 8-69 — the existing IDE `:root` token block. New cream/forest tokens follow the exact same `:root` + comment-section pattern.

**Existing `:root` pattern to copy structure from** (`globals.css` lines 3-69):
```css
/* ─────────────────────────────────────────────────────────────
   IDE Portfolio — Ruslan Kanatbek
   Design tokens ported verbatim from styles.css
   ───────────────────────────────────────────────────────────── */

:root,
:root[data-theme='dark'] {
  --bg-deepest: #06090e;
  /* ... more tokens ... */
  --radius: 6px;
}
```

**Token block to append** (source of truth: `resume.css` lines 6-28):
```css
/* ─────────────────────────────────────────────────────────────
   Door / recruiter editorial tokens — cream + forest green
   ───────────────────────────────────────────────────────────── */
:root {
  --paper:       #f4ecdc;
  --paper-deep:  #ede4d0;
  --paper-soft:  #faf4e6;
  --ink:         #1a1f1c;
  --ink-soft:    #3a3f3a;
  --ink-muted:   #6e6a5e;
  --ink-faint:   #9b9486;
  --rule:        #d8d0bd;
  --rule-soft:   #e4ddca;
  --forest:        oklch(0.40 0.09 152);
  --forest-deep:   oklch(0.30 0.08 152);
  --forest-soft:   oklch(0.40 0.09 152 / 0.08);
  --forest-line:   oklch(0.40 0.09 152 / 0.20);
  --ide-green:     #3ddc84;
}
```

**`.site-body` / `.site-main` class pattern to copy for `.door-*` classes** (`globals.css` lines 154-168):
```css
.site-body {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}

.site-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
```

**`.door` height fix** — do NOT copy `min-height: 100vh` from `resume.css` line 53. Use `height: 100%` because `.door` is a direct flex child of `.site-body`:
```css
.door {
  position: relative;
  height: 100%;        /* fills flex-parent (.site-body = 100dvh) */
  width: 100%;
  display: flex;
  overflow: hidden;
  background: #000;
}
```

**Keyframe pattern to follow** (`globals.css` lines 249-321 — `pulse-dot`, `log-in`, `msg-in`):
```css
@keyframes door-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```
Keyframes go in the same `globals.css` file, after the utility class blocks.

**`@media (prefers-reduced-motion)` placement pattern** — co-located with the affected classes (see `resume.css` pattern; mirrors how responsive overrides appear immediately after the classes they modify):
```css
.door-half {
  transition: flex-grow .55s cubic-bezier(.4,.0,.2,1), padding .55s cubic-bezier(.4,.0,.2,1);
}

@media (prefers-reduced-motion: reduce) {
  .door-half { transition: none; }
}
```

---

### `src/app/layout.tsx` (config, transform — one-line change)

**Analog:** `src/app/layout.tsx` lines 12-18 — the Newsreader declaration itself.

**Current state** (`layout.tsx` line 17):
```typescript
weight: ['400', '500'],
```

**Target state** (D-10):
```typescript
weight: ['300', '400', '500', '600', '700'],
```

**Full Newsreader block for context** (`layout.tsx` lines 12-18):
```typescript
const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500'],  // change to ['300', '400', '500', '600', '700']
});
```
No other changes to `layout.tsx`.

---

### `src/app/page.tsx` (component, event-driven — insertion point)

**Analog:** `src/app/page.tsx` itself — the stub at lines 76-93 is the insertion point.

**Current stub to replace** (`page.tsx` lines 76-93):
```typescript
// mode === null: Phase 8 will replace this stub with the full Door component
return (
  <div
    style={{
      background: '#06090e',
      height: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-mono, monospace)',
      fontSize: '0.9rem',
      color: '#3ddc84',
    }}
  >
    Landing door — coming in Phase 8
  </div>
);
```

**Import to add** (follow the existing import block at lines 1-6):
```typescript
import { DoorScreen } from '@/components/door/DoorScreen';
```

**Replacement return** — callbacks inline in `page.tsx`, storage write via `MODE_KEY` constant (already defined at line 8):
```typescript
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

**Existing localStorage try/catch pattern** (`page.tsx` lines 12-19) — the error swallowing idiom to copy for callback bodies:
```typescript
function readStoredMode(): Mode {
  try {
    const val = localStorage.getItem(MODE_KEY);
    if (val === 'recruiter' || val === 'ide') return val;
    return null;
  } catch {
    return null;
  }
}

function clearStoredMode(): void {
  try { localStorage.removeItem(MODE_KEY); } catch {}
}
```

---

### `e2e/*.spec.ts` (test, request-response — update existing)

**Analog:** `e2e/ide-interactions.spec.ts` lines 1-32 — same test file structure and `page.goto('/')` call pattern.

**Affected tests requiring `addInitScript` pre-seeding:**
- `e2e/landing.spec.ts` — 5 tests call `page.goto('/')` and expect IDE chrome or neutral features
- `e2e/navigation.spec.ts` line 5 — `page.goto('/')` expects `SiteHeader` (only visible in IDE mode)
- `e2e/ide-interactions.spec.ts` lines 5, 13, 23 — all three tests `page.goto('/')` and immediately interact with sidebar

**`test.beforeEach` localStorage pre-seeding pattern** (new pattern, no existing analog — copy from RESEARCH.md Pitfall 2):
```typescript
import { test, expect } from '@playwright/test';

test.describe('IDE interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('resume-mode', 'ide');
    });
  });

  test('clicking bio.json loads editor with bio content', async ({ page }) => {
    await page.goto('/');
    // test body unchanged
  });
});
```

**Existing `test.describe` wrapper pattern** (`landing.spec.ts` lines 4-50):
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Landing page', () => {
  test('has correct page title', async ({ page }) => {
    await page.goto('/');
    // ...
  });
});
```

**New door-specific tests pattern** — add to `e2e/landing.spec.ts` as a separate `test.describe` block (no `beforeEach` seeding — these tests need a fresh localStorage):
```typescript
test.describe('Landing door', () => {
  // NO beforeEach seed — door requires no localStorage["resume-mode"]

  test('shows door at / with no stored mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Enter the résumé/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /open-ide/i })).toBeVisible();
  });

  test('clicking recruiter half bypasses door', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Enter the résumé/i }).click();
    await expect(page.getByRole('button', { name: /Enter the résumé/i })).not.toBeVisible();
  });

  test('?reset shows door again after prior mode stored', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('resume-mode', 'ide');
    });
    await page.goto('/?reset');
    await expect(page.getByRole('button', { name: /Enter the résumé/i })).toBeVisible();
  });
});
```

---

### `src/components/door/__tests__/DoorScreen.test.tsx` (test, event-driven)

**Analog:** `src/components/ide/__tests__/Sidebar.test.tsx` — RTL + userEvent unit test pattern.

**Reference file header** (`Sidebar.test.tsx` lines 1-16):
```typescript
/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Sidebar } from '../Sidebar';

const defaultProps = {
  activeFile: 'README.md',
  setActiveFile: vi.fn(),
  openTab: vi.fn(),
  sidebarOpen: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});
```

DoorScreen adaptation:
```typescript
/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DoorScreen } from '../DoorScreen';

const defaultProps = {
  onChooseRecruiter: vi.fn(),
  onChooseIDE: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});
```

**`describe` + `it` structure** (`Sidebar.test.tsx` lines 18-86):
```typescript
describe('Sidebar — root file rendering', () => {
  it('renders README.md as a button', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /README\.md/ })).toBeInTheDocument();
  });
});

describe('Sidebar — interactions', () => {
  it('expands about folder and shows bio.json', async () => {
    const user = userEvent.setup();
    render(<Sidebar {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /toggle about folder/i }));
    expect(screen.getByRole('button', { name: /bio\.json/ })).toBeInTheDocument();
  });

  it('clicking README.md calls setActiveFile and openTab with the filename', async () => {
    const user = userEvent.setup();
    const setActiveFile = vi.fn();
    const openTab = vi.fn();
    render(<Sidebar {...defaultProps} setActiveFile={setActiveFile} openTab={openTab} />);
    await user.click(screen.getByRole('button', { name: /README\.md/ }));
    expect(setActiveFile).toHaveBeenCalledOnce();
    expect(setActiveFile).toHaveBeenCalledWith('README.md');
  });
});
```

DoorScreen tests to cover (DOOR-01, DOOR-02):
```typescript
describe('DoorScreen — rendering', () => {
  it('renders two halves with role="button"', () => { /* getByRole x2 */ });
  it('recruiter half contains correct CTA text', () => { /* /Enter the résumé/ */ });
  it('IDE half contains correct CTA text', () => { /* /open-ide/ */ });
});

describe('DoorScreen — click interactions', () => {
  it('clicking recruiter half calls onChooseRecruiter', async () => {
    const user = userEvent.setup();
    render(<DoorScreen {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /Enter the résumé/i }));
    expect(defaultProps.onChooseRecruiter).toHaveBeenCalledOnce();
  });

  it('clicking IDE half calls onChooseIDE', async () => { /* same pattern */ });
});

describe('DoorScreen — keyboard interactions', () => {
  it('Enter on recruiter half calls onChooseRecruiter', async () => {
    const user = userEvent.setup();
    render(<DoorScreen {...defaultProps} />);
    await user.tab(); // focus first button
    await user.keyboard('{Enter}');
    expect(defaultProps.onChooseRecruiter).toHaveBeenCalledOnce();
  });

  it('Space on recruiter half calls onChooseRecruiter', async () => { /* same with ' ' */ });
});
```

---

## Shared Patterns

### `'use client'` Directive
**Source:** `src/app/page.tsx` line 1, `src/components/ide/TopBar.tsx` line 1
**Apply to:** `src/components/door/DoorScreen.tsx`
```typescript
'use client';
```
First line, before all imports. `LogoMark.tsx` does NOT need it (no event handlers, no hooks).

### CSS Custom Property Token Pattern
**Source:** `src/app/globals.css` lines 8-69
**Apply to:** New cream/forest token block appended to `globals.css`

Pattern: group tokens in a named `:root` block delimited by the `/* ───── */` comment banner. Theme-specific overrides go in `:root[data-theme='light']` below. The cream/forest tokens are always-on (no dark/light variant in Phase 8), so they go in a plain `:root` block after the existing IDE token blocks.

### localStorage Try/Catch Idiom
**Source:** `src/app/page.tsx` lines 12-23
**Apply to:** `onChooseRecruiter` / `onChooseIDE` callbacks in `page.tsx`
```typescript
try { localStorage.setItem(MODE_KEY, 'ide'); } catch {}
```
Single-line try/catch for localStorage writes — silently swallows `SecurityError` from private browsing.

### Named Export (Not Default)
**Source:** `src/components/ide/TopBar.tsx` line 37, `src/components/ide/IDEShell.tsx` line 1, `src/components/layout/SiteHeader.tsx` line 3
**Apply to:** `DoorScreen.tsx`, `LogoMark.tsx`
```typescript
export function DoorScreen(...) { }
export function LogoMark(...) { }
```
All components in `src/components/` use named exports. No default exports.

### Playwright `addInitScript` for localStorage Seeding
**Source:** No existing analog — new pattern documented in RESEARCH.md Pitfall 2
**Apply to:** All existing `test.describe` blocks in `e2e/landing.spec.ts`, `e2e/navigation.spec.ts`, `e2e/ide-interactions.spec.ts` that call `page.goto('/')` and expect IDE chrome
```typescript
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('resume-mode', 'ide');
  });
});
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/door/__tests__/DoorScreen.test.tsx` (keyboard tests) | test | event-driven | Existing `Sidebar.test.tsx` has no keyboard-with-`userEvent.keyboard()` tests — the Space/Enter key tests are a new pattern. Copy the `userEvent.setup()` + `user.tab()` + `user.keyboard()` pattern from `@testing-library/user-event` docs. |

---

## Metadata

**Analog search scope:** `src/components/`, `src/app/`, `e2e/`, `.planning/design/design_handoff_resume_v1/`
**Files scanned:** 12
**Pattern extraction date:** 2026-05-27
