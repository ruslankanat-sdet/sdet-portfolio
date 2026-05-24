# Phase 3: Playwright Showcase + Hardening — Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 14 new/modified files
**Analogs found:** 12 / 14

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `playwright.config.ts` | config | batch | `next.config.ts` (build config pattern) | role-match |
| `e2e/landing.spec.ts` | test | request-response | no E2E tests yet — use RESEARCH.md patterns | no analog |
| `e2e/navigation.spec.ts` | test | request-response | no E2E tests yet — use RESEARCH.md patterns | no analog |
| `e2e/about.spec.ts` | test | request-response | `e2e/landing.spec.ts` (sibling) | sibling-copy |
| `e2e/ide-interactions.spec.ts` | test | request-response | `e2e/landing.spec.ts` (sibling) | sibling-copy |
| `e2e/accessibility.spec.ts` | test | request-response | inline in each spec per RESEARCH.md D-15 guidance | sibling-copy |
| `app/api/run-tests/route.ts` | route-handler | request-response | `app/api/run-status/route.ts` (sibling, same pattern) | sibling-copy |
| `app/og/route.tsx` | route-handler | request-response | `app/api/run-tests/route.ts` (sibling) | role-match |
| `public/robots.txt` | config | — | static file — no code pattern needed | static |
| `public/sitemap.xml` | config | — | static file — no code pattern needed | static |
| `src/lib/files-data.ts` | utility | transform | `src/lib/files-data.ts` itself (modification) | exact |
| `src/components/ide/IDEShell.tsx` | component | event-driven | `src/components/ide/IDEShell.tsx` itself (modification) | exact |
| `src/components/ide/Sidebar.tsx` | component | event-driven | `src/components/ide/Sidebar.tsx` itself (modification) | exact |
| `src/app/layout.tsx` | config | request-response | `src/app/about/page.tsx` (metadata pattern) | role-match |
| `src/app/about/page.tsx` | component | request-response | `src/app/layout.tsx` (metadata pattern) | role-match |
| `.github/workflows/ci.yml` | config | batch | `.github/workflows/ci.yml` itself (modification) | exact |

---

## Pattern Assignments

### `playwright.config.ts` (config, batch)

**Analog:** No direct existing config in the repo; the RESEARCH.md pattern is the primary reference.

**Core pattern from RESEARCH.md Pattern 1:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

**No CSS Modules — no imports from `@/`** — config lives at repo root, only `@playwright/test` import.

---

### `e2e/landing.spec.ts` (test, request-response)

**Analog:** No existing E2E tests in the repo. Use RESEARCH.md Pattern 2 + Code Examples as the canonical starting point.

**Imports pattern (from RESEARCH.md):**
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
```

**Core test structure (covers SHOW-01, HARD-01, HARD-03, HARD-04):**
```typescript
test.describe('Landing page', () => {
  test('renders IDE chrome with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Ruslan Kanatbek/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('sidebar file entries are clickable', async ({ page }) => {
    await page.goto('/');
    const readmeRow = page.getByRole('button', { name: /README\.md/ });
    await readmeRow.click();
    await expect(page.locator('pre code')).toContainText("Hi, I'm Ruslan");
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('User-agent');
  });

  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
  });

  test('OG meta tags are present', async ({ page }) => {
    await page.goto('/');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
  });

  test('has no WCAG AA violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
```

**AxeBuilder critical facts:**
- Default export: `import AxeBuilder from '@axe-core/playwright'` (not named)
- No `injectAxe()` call — auto-injects on `.analyze()`
- Tags: `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']` for WCAG 2.1 AA
- `results.violations` is the array to assert against

---

### `e2e/navigation.spec.ts` (test, request-response)

**Analog:** Copy structure from `e2e/landing.spec.ts` (sibling).

**Core test pattern:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('About link navigates to /about', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /About/i }).click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('logo/home link returns to /', async ({ page }) => {
    await page.goto('/about');
    await page.getByRole('link', { name: /ruslan/i }).click();
    await expect(page).toHaveURL('/');
  });
});
```

---

### `e2e/about.spec.ts` (test, request-response)

**Analog:** `e2e/landing.spec.ts` sibling structure.

**Core test pattern:**
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('About page', () => {
  test('renders work history section', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('PDF download link is present', async ({ page }) => {
    await page.goto('/about');
    const link = page.getByRole('link', { name: /Download PDF Resume/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('download');
  });

  test('has no WCAG AA violations', async ({ page }) => {
    await page.goto('/about');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
```

---

### `e2e/ide-interactions.spec.ts` (test, event-driven)

**Analog:** `e2e/landing.spec.ts` sibling structure. Must verify SHOW-02 (test files visible in sidebar) and SHOW-01 (file-click-to-editor).

**Core test pattern:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('IDE interactions', () => {
  test('clicking bio.json loads editor', async ({ page }) => {
    await page.goto('/');
    // Open the about/ folder first
    await page.getByRole('button', { name: /about/i }).first().click();
    await page.getByRole('button', { name: /bio\.json/ }).click();
    await expect(page.locator('pre code')).toContainText('Ruslan Kanatbek');
  });

  test('test files appear in sidebar under tests/ folder', async ({ page }) => {
    // Covers SHOW-02: sidebar displays Playwright spec files
    await page.goto('/');
    // The tests/ folder group should be present
    await expect(page.getByRole('button', { name: /tests/i })).toBeVisible();
    // Expand it
    await page.getByRole('button', { name: /tests/i }).click();
    await expect(page.getByRole('button', { name: /landing\.spec\.ts/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /playwright\.config\.ts/ })).toBeVisible();
  });

  test('clicking a spec file loads its TypeScript source in editor', async ({ page }) => {
    // Covers SHOW-02: editor renders the spec file content
    await page.goto('/');
    await page.getByRole('button', { name: /tests/i }).click();
    await page.getByRole('button', { name: /landing\.spec\.ts/ }).click();
    await expect(page.locator('pre code')).toContainText('playwright/test');
  });
});
```

---

### `app/api/run-tests/route.ts` (route-handler, request-response)

**Analog:** No existing API routes in the codebase yet. Use RESEARCH.md Pattern 3 as canonical. The pattern follows CLAUDE.md's Route Handler conventions.

**Full pattern (lines from RESEARCH.md Code Examples):**

**Imports + runtime declaration:**
```typescript
// app/api/run-tests/route.ts
export const runtime = 'nodejs';
```

**Core handler — POST, GitHub Actions workflow_dispatch:**
```typescript
export async function POST() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return Response.json({ error: 'Not configured' }, { status: 503 });

  const res = await fetch(
    `https://api.github.com/repos/${process.env.GH_OWNER}/${process.env.GH_REPO}/actions/workflows/ci.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main', return_run_details: true }),
    }
  );

  if (!res.ok) return Response.json({ error: 'Dispatch failed' }, { status: res.status });

  const { workflow_run_id, html_url } = await res.json();
  return Response.json({ runId: workflow_run_id, url: html_url });
}
```

**Error handling pattern:** Check `!token` (503) before any fetch. Check `!res.ok` (pass through `res.status`) after the fetch. Use `Response.json()` for all responses — no `NextResponse`.

**Required env vars:** `GITHUB_TOKEN`, `GH_OWNER=ruslankanat-sdet`, `GH_REPO=sdet-portfolio`.

**No rate limiting in v1** — documented as known gap in RESEARCH.md Security section.

---

### `app/api/run-status/route.ts` (route-handler, request-response)

**Analog:** `app/api/run-tests/route.ts` sibling (same Node runtime + fetch pattern).

**Core pattern (from RESEARCH.md Code Examples):**
```typescript
// app/api/run-status/route.ts
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('run_id');
  if (!runId || !/^\d+$/.test(runId)) {
    return Response.json({ error: 'run_id must be a positive integer' }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) return Response.json({ error: 'Not configured' }, { status: 503 });

  const res = await fetch(
    `https://api.github.com/repos/${process.env.GH_OWNER}/${process.env.GH_REPO}/actions/runs/${runId}/jobs`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );
  const data = await res.json();
  return Response.json(data);
}
```

**Input validation:** `run_id` must be numeric (`/^\d+$/`) before embedding in the URL — RESEARCH.md ASVS V5 requirement.

---

### `app/og/route.tsx` (route-handler, request-response)

**Analog:** `app/api/run-tests/route.ts` (same route handler role). OG-specific pattern from RESEARCH.md Pattern 5.

**Imports + runtime:**
```typescript
// app/og/route.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const revalidate = 86400; // 24h cache — do NOT use force-static (conflicts with ImageResponse)
```

**Core handler:**
```typescript
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          // CRITICAL: CSS variables DO NOT work here — use hex from styles.css
          backgroundColor: '#0b1117',  // --bg-deep
          color: '#e6edf3',            // --text
          fontFamily: 'monospace',
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 700, color: '#3ddc84' /* --green */ }}>
          Ruslan Kanatbek
        </div>
        <div style={{ fontSize: 28, marginTop: 16, color: '#8b96a8' /* --text-muted */ }}>
          Senior SDET · Playwright · TypeScript · AI Automation
        </div>
        <div style={{ fontSize: 20, marginTop: 32, color: '#79b8ff' /* --blue */ }}>
          ruslankanat.dev
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

**Design token hex values for use in ImageResponse** (from `styles.css` lines 6-59):
- `--bg-deep` → `#0b1117`
- `--text` → `#e6edf3`
- `--text-muted` → `#8b96a8`
- `--green` → `#3ddc84`
- `--blue` → `#79b8ff`
- `--border` → `#1f2937`

---

### `src/lib/files-data.ts` (utility, transform — modification)

**Analog:** The file itself. Read its current structure (lines 1-164 above) and add new entries following the exact same pattern.

**Existing import block (lines 1-10) — copy exactly:**
```typescript
// src/lib/files-data.ts — lines 1-10
import type { FileEntry, LogEntry } from '@/types/ide';

export const FILES: Record<string, FileEntry> = {
  // ... existing entries
};
```

**New FileEntry shape to copy from existing entries (e.g., bio.json, lines 36-64):**
```typescript
  'tests/landing.spec.ts': {
    lang: 'typescript',    // FileEntryLang — 'typescript' already valid
    path: '~/portfolio/e2e/landing.spec.ts',
    icon: 'ts',            // FileEntryIcon — 'ts' already valid (types/ide.ts line 2)
    content: `// actual spec file content here`,
  },
```

**Existing SAMPLE_LOGS shape (lines 149-164) — replace entirely with Playwright-style entries per RESEARCH.md Pattern 7:**
```typescript
export const SAMPLE_LOGS: LogEntry[] = [
  { kind: 'info', text: '$ pnpm exec playwright test --project=chromium --reporter=line' },
  { kind: 'info', text: 'Running 12 tests using 4 workers' },
  { kind: 'pass', test: 'landing.spec.ts > has correct page title', detail: '312ms' },
  { kind: 'pass', test: 'landing.spec.ts > shows IDE chrome on load', detail: '188ms' },
  { kind: 'pass', test: 'navigation.spec.ts > About link navigates to /about', detail: '241ms' },
  { kind: 'pass', test: 'about.spec.ts > renders work history section', detail: '156ms' },
  { kind: 'pass', test: 'ide-interactions.spec.ts > clicking bio.json loads editor', detail: '298ms' },
  { kind: 'pass', test: 'accessibility.spec.ts > landing page has 0 WCAG AA violations', detail: '892ms' },
  { kind: 'pass', test: 'accessibility.spec.ts > about page has 0 WCAG AA violations', detail: '743ms' },
  { kind: 'info', text: '───────────────────────────────────────────────────────' },
  { kind: 'ok',   text: '✓ 12 passed (4.2s)  ·  0 failed  ·  0 flaky' },
];
```

**LogKind values from `src/types/ide.ts` line 11:** `'info' | 'warn' | 'ok' | 'pass' | 'fail'` — no new kinds needed. Map `in_progress` GitHub status → `info` with spinner prefix.

---

### `src/components/ide/IDEShell.tsx` (component, event-driven — modification)

**Analog:** The file itself (`src/components/ide/IDEShell.tsx` lines 1-97 above).

**Existing `runSmoke` pattern (lines 53-70) — replace with API-calling version:**
```typescript
// Current pattern to replace (lines 53-70):
const runSmoke = useCallback(() => {
  if (running) return;
  setRunning(true);
  setLogs([]);
  setTermTab("TERMINAL");
  let i = 0;
  const tick = () => { /* animates SAMPLE_LOGS */ };
  setTimeout(tick, 300);
}, [running]);

// New pattern: call /api/run-tests, then poll /api/run-status
const runSmoke = useCallback(async () => {
  if (running) return;
  setRunning(true);
  setLogs([{ kind: 'info', text: 'Triggering CI run…' }]);
  setTermTab("TERMINAL");

  const res = await fetch('/api/run-tests', { method: 'POST' });
  const { runId, url } = await res.json();

  setLogs(prev => [...prev, { kind: 'info', text: `Run #${runId} queued — ${url}` }]);

  const poll = async () => {
    const statusRes = await fetch(`/api/run-status?run_id=${runId}`);
    const data = await statusRes.json();
    // Map jobs → LogEntry[]
    const entries = buildLogEntries(data); // helper function
    setLogs(entries);
    if (data.jobs?.[0]?.status !== 'completed') {
      setTimeout(poll, 5000);
    } else {
      setRunning(false);
      setLastRun("just now");
    }
  };
  setTimeout(poll, 5000);
}, [running]);
```

**Existing imports (lines 1-11) — add nothing unless `buildLogEntries` is defined in a separate file.**

**State shape (lines 13-30) — unchanged.** The `logs` state (`LogEntry[]`) and `running` boolean already handle the new pattern.

**`TopBar` prop `onRun` (line 86)** — already wired: `<TopBar onRun={runSmoke} running={running} .../>`. No prop changes needed.

---

### `src/components/ide/Sidebar.tsx` (component, event-driven — modification)

**Analog:** The file itself (`src/components/ide/Sidebar.tsx` lines 1-188 above).

**Existing `ABOUT_FILES` + folder group pattern (lines 39-165) — copy exactly for `TEST_FILES`:**

```typescript
// Add after ROOT_FILES (line 40):
const TEST_FILES = [
  'tests/landing.spec.ts',
  'tests/navigation.spec.ts',
  'tests/about.spec.ts',
  'tests/ide-interactions.spec.ts',
  'tests/playwright.config.ts',
];
```

**Existing `open` state (line 52) — extend:**
```typescript
// line 52 — current:
const [open, setOpen] = useState({ about: false });

// extended:
const [open, setOpen] = useState({ about: false, tests: false });
```

**Existing folder group JSX (lines 146-165) — copy for `tests/` group:**
```tsx
{/* tests/ folder — copy of about/ pattern */}
<div className={styles.treeGroup}>
  <div
    className={styles.treeFolder}
    onClick={() => setOpen(s => ({ ...s, tests: !s.tests }))}
  >
    <span className={styles.treeChev}>
      <ChevronRight
        size={10}
        style={{ transform: open.tests ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
      />
    </span>
    <Folder size={14} />
    <span className={cn(styles.treeLabel, styles.bold)}>tests</span>
  </div>
  {open.tests && (
    <div className={styles.treeChildren}>
      {TEST_FILES.map(name => fileRow(name))}
    </div>
  )}
</div>
```

**Existing `OUTLINE_SYMBOLS` (lines 43-49) — add entries for test files:**
```typescript
'tests/landing.spec.ts':          [{ label: 'has correct page title', kind: 'key' }, { label: 'has no WCAG AA violations', kind: 'key' }],
'tests/navigation.spec.ts':       [{ label: 'About link navigates to /about', kind: 'key' }],
'tests/about.spec.ts':            [{ label: 'renders work history section', kind: 'key' }, { label: 'has no WCAG AA violations', kind: 'key' }],
'tests/ide-interactions.spec.ts': [{ label: 'clicking bio.json loads editor', kind: 'key' }, { label: 'test files appear in sidebar', kind: 'key' }],
'tests/playwright.config.ts':     [{ label: 'testDir', kind: 'key' }, { label: 'projects', kind: 'key' }, { label: 'webServer', kind: 'key' }],
```

**`fileRow()` function (lines 55-74) — unchanged.** It reads from `FILES[name]` — the new test file entries in `files-data.ts` will be found automatically.

---

### `src/app/layout.tsx` (config, request-response — modification)

**Analog:** `src/app/about/page.tsx` (lines 1-13) — existing `metadata` export pattern.

**Existing metadata export (layout.tsx lines 16-20) — replace with:**
```typescript
// src/app/layout.tsx — extend existing metadata export
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ruslankanat.vercel.app'
  ),
  title: 'Ruslan Kanatbek — SDET Portfolio',
  description:
    'Portfolio of Ruslan Kanatbek, Senior SDET/QA Automation Engineer. Real Playwright and Pytest tests in an IDE-style showcase.',
  openGraph: {
    title: 'Ruslan Kanatbek — SDET Portfolio',
    description: 'Portfolio of Ruslan Kanatbek, Senior SDET/QA Automation Engineer.',
    url: '/',
    siteName: 'Ruslan Kanatbek — SDET Portfolio',
    images: [{ url: '/og', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ruslan Kanatbek — SDET Portfolio',
    description: 'Portfolio of Ruslan Kanatbek, Senior SDET/QA Automation Engineer.',
    images: ['/og'],
  },
};
```

**Critical:** `metadataBase` must be set here (layout.tsx). Without it, `'/og'` in `openGraph.images` causes a build error. The `Metadata` import from `'next'` is already present on line 2 of layout.tsx.

**No other layout.tsx changes needed** — `RootLayout` function, font loading, Analytics/SpeedInsights remain unchanged.

---

### `src/app/about/page.tsx` (component, request-response — modification)

**Analog:** The file itself (`src/app/about/page.tsx` lines 1-33 above). Also references `src/app/layout.tsx` for the metadata inheritance pattern.

**Existing `metadata` export (lines 9-13) — extend with OG fields:**
```typescript
// src/app/about/page.tsx — extend existing metadata
export const metadata: Metadata = {
  title: 'About — Ruslan Kanatbek',
  description:
    'Senior SDET / QA Automation Engineer. Work history, projects, skills, and contact information for Ruslan Kanatbek.',
  openGraph: {
    title: 'About — Ruslan Kanatbek',
    description: 'Senior SDET / QA Automation Engineer. Work history, projects, and skills.',
    url: '/about',
    images: [{ url: '/og', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About — Ruslan Kanatbek',
    images: ['/og'],
  },
};
```

**Add `Metadata` to the existing import (line 1):** `import type { Metadata } from 'next';` — already present on line 1.

**`export const dynamic = 'force-static'` (line 7) — keep unchanged.**

---

### `.github/workflows/ci.yml` (config, batch — modification)

**Analog:** The file itself (lines 1-53 above). The existing `quality-gate` job structure is the direct template.

**Existing job structure (lines 15-53) — copy for `playwright` job:**
```yaml
# Add after quality-gate job (after line 53):
  playwright:
    runs-on: ubuntu-latest
    needs: quality-gate        # runs after quality-gate passes
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Chromium
        run: pnpm exec playwright install --with-deps chromium

      - name: Build
        run: pnpm build

      - name: Run Playwright tests
        run: pnpm exec playwright test
        env:
          CI: true

      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

**Existing `quality-gate` steps to match:** `actions/checkout@v4`, `pnpm/action-setup@v4 version: 9`, `actions/setup-node@v4 node-version: 20`, `pnpm install --frozen-lockfile` — all copied verbatim. Consistent versions across jobs.

**Also fix the existing vitest step** (lines 47-52) — replace the `if [ -f vitest.config.ts ]` guard with direct `pnpm vitest run` once Playwright job is wired. The guard was a Phase 2 stub comment ("Phase 3 wires this").

---

### `public/robots.txt` (static file)

No code pattern — static text file.

**Content:**
```
User-agent: *
Allow: /

Sitemap: https://ruslankanat.vercel.app/sitemap.xml
```

---

### `public/sitemap.xml` (static file)

No code pattern — static XML file.

**Content pattern:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ruslankanat.vercel.app/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://ruslankanat.vercel.app/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## Shared Patterns

### Route Handler Runtime Declaration
**Source:** RESEARCH.md Pattern 3 + CLAUDE.md ("Node, not Edge, for tool routes")
**Apply to:** `app/api/run-tests/route.ts`, `app/api/run-status/route.ts`, `app/og/route.tsx`
```typescript
export const runtime = 'nodejs';
```
**Rationale:** Node gets 60s maxDuration (vs Edge's 25s). OpenAPI parser is Node-only. All route handlers in this project use Node runtime.

### Response Pattern — `Response.json()`
**Source:** RESEARCH.md Code Examples (run-tests + run-status routes)
**Apply to:** `app/api/run-tests/route.ts`, `app/api/run-status/route.ts`
```typescript
// No NextResponse — use native Response.json()
return Response.json({ key: value });
return Response.json({ error: 'message' }, { status: 400 });
```

### Environment Variable Guard
**Source:** RESEARCH.md Code Examples (run-tests route)
**Apply to:** Both API route handlers
```typescript
const token = process.env.GITHUB_TOKEN;
if (!token) return Response.json({ error: 'Not configured' }, { status: 503 });
```

### CSS Module Import
**Source:** `src/components/ide/Sidebar.tsx` line 20, `src/components/ide/TopBar.tsx` line 7
**Apply to:** Any new component that needs component-scoped styles
```typescript
import styles from './ComponentName.module.css';
```

### "use client" Directive
**Source:** `src/components/ide/IDEShell.tsx` line 1, `src/components/ide/Sidebar.tsx` line 1, `src/components/ide/TopBar.tsx` line 1
**Apply to:** All IDE shell components (IDEShell, Sidebar, TopBar modifications)
```typescript
"use client";
```
Server Components by default; only client components get this directive.

### Polling with `setTimeout` (not `setInterval`)
**Source:** RESEARCH.md Pattern 4
**Apply to:** `src/components/ide/IDEShell.tsx` (polling logic in `runSmoke`)
```typescript
// Use recursive setTimeout — avoids overlap if response is slow
const poll = async () => {
  const res = await fetch(`/api/run-status?run_id=${runId}`);
  const data = await res.json();
  // process data...
  if (data.jobs?.[0]?.status !== 'completed') {
    setTimeout(poll, 5000);
  }
};
```

### `cn()` Helper for Conditional Classes
**Source:** `src/components/ide/Sidebar.tsx` line 17, `src/components/ide/TopBar.tsx` line 5
**Apply to:** Any component using conditional Tailwind/CSS Module classes
```typescript
import { cn } from '@/lib/utils';
// Usage:
className={cn(styles.treeRow, { [styles.active]: isActive })}
```

### AxeBuilder Shared Pattern
**Source:** RESEARCH.md Patterns 2, Code Examples
**Apply to:** `e2e/landing.spec.ts`, `e2e/about.spec.ts` (inline at bottom of each spec)
```typescript
import AxeBuilder from '@axe-core/playwright'; // default import
// At end of test.describe block:
test('has no WCAG AA violations', async ({ page }) => {
  await page.goto('/page-path');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `playwright.config.ts` | config | batch | No Playwright config exists yet; RESEARCH.md Pattern 1 is the primary reference |
| `e2e/landing.spec.ts` | test | request-response | No E2E tests exist yet; RESEARCH.md Pattern 2 + Code Examples are primary |

*All other files either have direct analogs in the codebase or are siblings of files being created in the same phase.*

---

## Metadata

**Analog search scope:** `src/`, `.github/workflows/`, `src/types/`, `src/lib/`, `.planning/design/`
**Files scanned:** 18 TypeScript/TSX source files + 1 CI YAML + design tokens CSS
**Pattern extraction date:** 2026-05-21
