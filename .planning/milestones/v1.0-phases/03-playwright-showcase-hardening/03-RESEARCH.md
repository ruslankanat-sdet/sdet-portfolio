# Phase 3: Playwright Showcase + Hardening — Research

**Researched:** 2026-05-21
**Domain:** Playwright E2E testing, GitHub Actions API, Next.js OG images, WCAG AA, static SEO
**Confidence:** HIGH (all major claims verified against official docs or npm registry)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- D-01: Tests live at `e2e/` at the repo root; `playwright.config.ts` at repo root
- D-02: Test files: `e2e/landing.spec.ts`, `e2e/navigation.spec.ts`, `e2e/about.spec.ts`, `e2e/ide-interactions.spec.ts` at minimum
- D-03: `playwright.config.ts` lives at the repo root
- D-04: IDE sidebar displays all `.spec.ts` files + `playwright.config.ts` under a `tests/` folder label
- D-05: Clicking a test file loads TypeScript source into the editor (TypeScript lang already supported)
- D-06: `playwright.config.ts` included in sidebar
- D-07: "Run Tests" trigger in TopBar (existing `runBtn` pattern)
- D-08: API route `app/api/run-tests/route.ts` (Node runtime) calls GitHub Actions `workflow_dispatch` API
- D-09: Terminal polls GitHub Actions API for run status every 5s; renders LogEntry rows
- D-10: Static initial terminal state shows last CI run result (hardcoded after first run or build-time fetch)
- D-11: `GITHUB_TOKEN` in Vercel env vars; fine-grained PAT with `actions:read` + `actions:write` scopes
- D-12: Playwright job added to `.github/workflows/ci.yml` (separate job or new step — planner decides)
- D-13: Chromium only in CI
- D-14: `@axe-core/playwright` added; `checkA11y()` on every page; zero violations = CI pass
- D-15: Focus indicators verified by axe-core scan
- D-16: LCP verified via Vercel Speed Insights (already installed); no new perf library
- D-17: HARD-02 is a verification task, not a build task — landing is already statically rendered
- D-18: OG image via `next/og` ImageResponse at `app/og/route.tsx`; 1200×630
- D-19: OG tags via `generateMetadata` in `app/layout.tsx` + page-level overrides for `/about`
- D-20: Static `public/robots.txt` + `public/sitemap.xml`; no library needed

### Claude's Discretion

- Exact Playwright job placement in ci.yml (separate job vs new step)
- Polling UX details — loading spinner, LogEntry styling for in-progress vs done states
- Whether `checkA11y()` lives in each spec file or a shared helper
- Exact `playwright.config.ts` configuration (base URL from env, retries: 1 in CI, 0 locally)
- OG image design details (layout, colors — use existing design tokens)
- `sitemap.xml` lastmod dates and changefreq values

### Deferred Ideas (OUT OF SCOPE)

- Real-time log streaming via SSE
- Firefox + WebKit CI coverage
- Lighthouse CI in GitHub Actions
- Visual regression testing
- Live test execution against a demo site

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHOW-01 | Real TypeScript Playwright E2E tests for key flows | Playwright 1.60 installed; test patterns documented |
| SHOW-02 | Test files listed in IDE sidebar; clicking shows TS source | `FILES` Record + Sidebar integration pattern documented |
| SHOW-03 | CI last-run status surfaced in terminal pane | GitHub Actions API + dispatch + poll pattern documented |
| HARD-01 | WCAG AA verified via axe-core; zero violations | `@axe-core/playwright` 4.11.3 AxeBuilder pattern documented |
| HARD-02 | LCP < 2s on 4G; landing statically rendered | Verification-only task; Speed Insights already installed |
| HARD-03 | OG + Twitter Card meta on landing and About | `next/og` ImageResponse + `generateMetadata` patterns documented |
| HARD-04 | robots.txt + sitemap.xml generated and accessible | Static file approach confirmed; no library needed |
| HARD-05 | Playwright suite runs in CI on every push to main | CI job structure documented; pnpm + chromium install command confirmed |

</phase_requirements>

---

## Summary

Phase 3 has three independent workstreams that can be planned and executed in parallel: (1) writing the Playwright specs and wiring them into the IDE sidebar, (2) connecting the "Run Smoke Test" button to the real GitHub Actions API, and (3) hardening the site for launch (a11y, OG, robots/sitemap). None of these workstreams blocks the others at the code level, though the CI job (HARD-05) must exist before the run-tests button can poll a real run.

The key technical facts are all confirmed against official sources. `@playwright/test@1.60.0` and `@axe-core/playwright@4.11.3` are current, legitimate packages. The GitHub Actions `workflow_dispatch` API added a `return_run_details: true` parameter in February 2026 (GA) that eliminates the need for polling-with-unique-identifier workarounds — the API now returns the `workflow_run_id` directly in the response body when the parameter is set. The `next/og` `ImageResponse` pattern is stable and well-documented for Next.js 15; it defaults to 1200×630. CSS variables from design tokens cannot be used inside `ImageResponse` — hard-coded hex values from `styles.css` must be inlined into the JSX.

The largest implementation risk is the `Sidebar.tsx` change: the sidebar currently has hardcoded `ABOUT_FILES` and `ROOT_FILES` arrays; adding a `tests/` folder requires a new collapsible folder group and `OUTLINE_SYMBOLS` entries for each spec file. This is medium-complexity but well-understood given the existing folder pattern.

**Primary recommendation:** Implement workstreams in this order — (W1) Playwright specs + sidebar, (W2) CI job extension, (W3) API route + polling, (W4) OG + meta + robots/sitemap. W2 must precede W3 because the run-tests button calls a workflow that must exist in CI.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Playwright spec files (SHOW-01) | Static files / `e2e/` | — | Tests are static TypeScript files at build time; no server rendering needed |
| IDE sidebar test file display (SHOW-02) | Browser / Client | — | `Sidebar.tsx` is `"use client"`; `FILES` Record is a module-level constant |
| Run-tests API trigger (SHOW-03 trigger) | API / Backend (Route Handler) | — | Must keep GITHUB_TOKEN server-side; Node runtime required |
| CI status polling (SHOW-03 poll) | Browser / Client | API / Backend | Client polls `/api/run-status` proxy; proxy forwards to GitHub API with server-side token |
| Playwright CI job (HARD-05) | CI (GitHub Actions) | — | Runs `playwright test` in ubuntu-latest job |
| WCAG AA verification (HARD-01) | CI (Playwright spec) | — | `@axe-core/playwright` runs server-side within the Playwright test process |
| LCP verification (HARD-02) | External (Vercel) | — | Verification via Speed Insights dashboard; no code changes |
| OG image generation (HARD-03) | API / Backend (Route Handler) | — | `ImageResponse` runs at request time in a Node route handler |
| OG metadata tags (HARD-03) | Frontend Server (SSR/static) | — | `generateMetadata` in Server Components; statically rendered |
| robots.txt + sitemap.xml (HARD-04) | CDN / Static | — | Static files in `public/`; served directly by Next.js/Vercel |

---

## Standard Stack

### Core (already installed — no new installs required except Playwright)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@playwright/test` | `1.60.0` | E2E test runner + browser automation | Official Playwright test runner; bundled with browser APIs, `expect`, and reporters |
| `@axe-core/playwright` | `4.11.3` | WCAG accessibility scanning in Playwright | Official Deque package; integrates axe-core directly into Playwright via `AxeBuilder` |
| `next/og` | (bundled with `next@15.5.18`) | OG image generation | Built into Next.js; `ImageResponse` renders JSX to PNG at 1200×630 |

**Version verification:**
```bash
npm view @playwright/test version   # → 1.60.0 (verified 2026-05-21)
npm view @axe-core/playwright version  # → 4.11.3 (verified 2026-05-21)
```

### Supporting (no new installs)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next` (built-in) | `15.5.18` | `generateMetadata`, `ImageResponse` | OG meta tags and OG image route |
| `@vercel/speed-insights` | `2.0.0` (installed) | LCP verification | Already installed; no code changes for HARD-02 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@axe-core/playwright` | `axe-playwright` (community pkg) | `axe-playwright` has `checkA11y()` convenience wrapper but is a third-party community package; official `@axe-core/playwright` from Deque is the authoritative package |
| Static `public/robots.txt` | `next-sitemap` library | `next-sitemap` autogenerates both files but adds a dev dependency for a 2-page site — overkill |
| Route handler OG image | `app/opengraph-image.tsx` file convention | File convention autogenerates metadata entries but the route handler approach gives more explicit control over the path and headers |

**Installation (new packages only):**
```bash
pnpm add -D @playwright/test @axe-core/playwright
pnpm exec playwright install --with-deps chromium
```

---

## Package Legitimacy Audit

| Package | Registry | Age | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-------------|-----------|-------------|
| `@playwright/test` | npm | ~6 yrs (2020-09-24) | github.com/microsoft/playwright | [OK] | Approved |
| `@axe-core/playwright` | npm | ~5 yrs (2021-06-02) | github.com/dequelabs/axe-core-npm | [OK] | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** none

No postinstall scripts found on either package. Both pass slopcheck verification.

[VERIFIED: npm registry] — `@playwright/test` version confirmed via `npm view @playwright/test version`
[VERIFIED: npm registry] — `@axe-core/playwright` version confirmed via `npm view @axe-core/playwright version`

---

## Architecture Patterns

### System Architecture Diagram

```
Visitor browser
  │
  ├─► Landing page (static SSR) ──► IDE Shell (client)
  │     │                                │
  │     │                         Sidebar.tsx
  │     │                         FILES Record (module const)
  │     │                         ┌────────────────────────────┐
  │     │                         │ about/ folder (existing)   │
  │     │                         │ tests/ folder (NEW phase 3)│
  │     │                         │  landing.spec.ts           │
  │     │                         │  navigation.spec.ts        │
  │     │                         │  about.spec.ts             │
  │     │                         │  ide-interactions.spec.ts  │
  │     │                         │  accessibility.spec.ts     │
  │     │                         │  playwright.config.ts      │
  │     │                         └────────────────────────────┘
  │     │                                │
  │     │                         "Run Smoke Test" button (TopBar)
  │     │                                │
  │     │                    POST /api/run-tests (Node route)
  │     │                                │
  │     │              GitHub Actions workflow_dispatch API
  │     │              POST .../ci.yml/dispatches?return_run_details=true
  │     │                                │
  │     │                    ◄── { workflow_run_id, run_url }
  │     │                                │
  │     │              poll /api/run-status?run_id=N (every 5s)
  │     │                                │
  │     │              GET /repos/.../runs/{run_id}/jobs (GitHub API)
  │     │                                │
  │     │              Terminal LogEntry rows (in-progress → done)
  │     │
  │     └─► OG image route /og (Node route, ImageResponse)
  │
  ├─► /about page (static)
  │     └─► OG metadata override (generateMetadata)
  │
  └─► /robots.txt, /sitemap.xml (static files in public/)

CI (GitHub Actions)
  ├─ quality-gate job (existing): lint / typecheck / build / vitest
  └─ playwright job (NEW): install chromium → next build → next start → playwright test
```

### Recommended Project Structure

```
e2e/                          ← new Phase 3 (D-01)
├── landing.spec.ts
├── navigation.spec.ts
├── about.spec.ts
├── ide-interactions.spec.ts
└── accessibility.spec.ts     ← or inline in each spec (Claude's discretion)
playwright.config.ts          ← new Phase 3 (D-03), repo root
src/
├── app/
│   ├── api/
│   │   ├── run-tests/
│   │   │   └── route.ts      ← new Phase 3 (D-08)
│   │   └── run-status/
│   │       └── route.ts      ← new Phase 3 (D-09 server proxy for token)
│   ├── og/
│   │   └── route.tsx         ← new Phase 3 (D-18)
│   └── layout.tsx            ← extend generateMetadata (D-19)
├── lib/
│   └── files-data.ts         ← extend FILES + replace SAMPLE_LOGS (D-04)
└── components/ide/
    └── Sidebar.tsx           ← add tests/ folder group (D-04)
public/
├── robots.txt                ← new Phase 3 (D-20)
└── sitemap.xml               ← new Phase 3 (D-20)
.github/workflows/
└── ci.yml                    ← extend with playwright job (D-12)
```

---

### Pattern 1: playwright.config.ts

**What:** Configuration for Playwright E2E suite — single chromium project, webServer auto-start, retries in CI

**When to use:** Repo root; imported automatically by `pnpm exec playwright test`

```typescript
// Source: https://playwright.dev/docs/test-configuration (verified 2026-05-21)
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

**Note on webServer command:** In CI, `pnpm build && pnpm start` builds then starts the production server. Locally, `reuseExistingServer: true` avoids rebuilding if `next dev` is already running.

---

### Pattern 2: AxeBuilder Accessibility Test

**What:** WCAG AA scan of a page using `@axe-core/playwright`; auto-injects axe into all frames

**When to use:** In each page spec, or in a shared helper called from each spec

```typescript
// Source: https://playwright.dev/docs/accessibility-testing (verified 2026-05-21)
// Source: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing page has no WCAG AA violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

**Key API facts:**
- `AxeBuilder` is the default export from `@axe-core/playwright` — import as `import AxeBuilder from '@axe-core/playwright'`
- NO `injectAxe()` needed — `AxeBuilder` auto-injects axe-core into all frames on `.analyze()`
- `.withTags()` constrains which WCAG criteria to check; use `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']` for WCAG 2.1 AA
- `.analyze()` returns `Promise<axe.Results>`; violations are in `results.violations`
- The `checkA11y()` function is from `axe-playwright` (community package), NOT from `@axe-core/playwright` — do not use it

**Shared helper vs inline:** Put the axe check at the bottom of each page spec (e.g., `landing.spec.ts` ends with `'landing page has no WCAG AA violations'`). This keeps each spec file self-contained for display in the IDE sidebar — a visitor clicking `accessibility.spec.ts` should see one clear file. A shared helper file is valid but adds a file not shown in the sidebar.

---

### Pattern 3: GitHub Actions workflow_dispatch with return_run_details

**What:** Trigger a workflow_dispatch and get the run ID back in the same response (no polling needed to find the run ID)

**When to use:** `app/api/run-tests/route.ts` (Node runtime, server-side only)

```typescript
// Source: https://github.blog/changelog/2026-02-19-workflow-dispatch-api-now-returns-run-ids/
// Source: https://docs.github.com/en/rest/actions/workflows (verified 2026-05-21)
// POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches
const response = await fetch(
  `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/ci.yml/dispatches`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: 'main',
      return_run_details: true,   // GA as of 2026-02-19 — returns 200 + run ID
    }),
  }
);
// response status: 200 (with return_run_details) or 204 (without)
// response body: { workflow_run_id, run_url, html_url }
const { workflow_run_id, html_url } = await response.json();
```

**Key facts:**
- `workflow_id` can be the filename: `ci.yml` (the API accepts filename, not just numeric ID)
- With `return_run_details: true` → HTTP 200 + JSON body with `workflow_run_id`
- Without `return_run_details` → HTTP 204 No Content (old behavior, requires poll-by-unique-input workaround)
- Token scope required: `repo` scope for classic PAT; `actions: write` for fine-grained PAT
- This is GA as of 2026-02-19; no beta header needed

---

### Pattern 4: Polling Run Job Status

**What:** After getting the `workflow_run_id`, poll job steps to render terminal output

**When to use:** Client-side polling after the "Run Smoke Test" button triggers the API route

```typescript
// Source: https://docs.github.com/en/rest/actions/workflow-jobs (verified 2026-05-21)
// GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs
const jobsResponse = await fetch(
  `https://api.github.com/repos/${OWNER}/${REPO}/actions/runs/${runId}/jobs`,
  {
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  }
);
const { jobs } = await jobsResponse.json();
// Each job: { name, status, conclusion, steps: [{ name, status, conclusion, number }] }
// status: 'queued' | 'in_progress' | 'completed'
// conclusion: 'success' | 'failure' | 'cancelled' | null (if still running)
```

**Client-side polling pattern (IDEShell or a custom hook):**
```typescript
// Poll every 5s using recursive setTimeout (not setInterval — avoids overlap if response is slow)
const poll = async (runId: number) => {
  const res = await fetch(`/api/run-status?run_id=${runId}`);
  const data = await res.json();
  setLogs(buildLogEntries(data)); // map job steps → LogEntry[]
  if (data.status !== 'completed') {
    setTimeout(() => poll(runId), 5000);
  }
};
```

**Server proxy required:** The client must not call GitHub API directly (would expose GITHUB_TOKEN). Route handler `/api/run-status` proxies the request server-side.

---

### Pattern 5: Next.js OG Image Route

**What:** Dynamic OG image generation at `/og` using `ImageResponse`

**When to use:** `app/og/route.tsx` (Node runtime recommended for font loading)

```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/image-response (verified 2026-05-21)
import { ImageResponse } from 'next/og';

export const runtime = 'edge'; // edge works for ImageResponse; Node also works
export const dynamic = 'force-static'; // cache the image

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
          // CRITICAL: CSS variables DO NOT work here — must use resolved hex values
          backgroundColor: '#0b1117',  // --bg-deep from design tokens
          color: '#e6edf3',            // --text from design tokens
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

**Critical constraint:** CSS custom properties (`var(--color-*)`) are NOT evaluated inside `ImageResponse` — only inline styles with literal values work. Use hex values from `styles.css` directly.

---

### Pattern 6: generateMetadata with metadataBase and OG tags

**What:** Add OG + Twitter Card meta to layout and about page

**When to use:** `app/layout.tsx` (global) and `app/about/page.tsx` (page-level override)

```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata (verified 2026-05-21)
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ruslankanat.vercel.app'
  ),
  title: 'Ruslan Kanatbek — SDET Portfolio',
  description: 'Portfolio of Ruslan Kanatbek, Senior SDET/QA Automation Engineer.',
  openGraph: {
    title: 'Ruslan Kanatbek — SDET Portfolio',
    description: 'Portfolio of Ruslan Kanatbek, Senior SDET/QA Automation Engineer.',
    url: '/',
    siteName: 'Ruslan Kanatbek — SDET Portfolio',
    images: [{ url: '/og', width: 1200, height: 630 }], // relative — resolved via metadataBase
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

**`metadataBase` requirement:** Without `metadataBase`, relative OG image URLs (`/og`) cause a build error. Set it in `layout.tsx` to the production URL. Use `NEXT_PUBLIC_SITE_URL` env var so it works on both Vercel preview URLs and the canonical domain.

---

### Pattern 7: Sidebar Extension for tests/ folder

**What:** Add a `tests/` collapsible folder group to `Sidebar.tsx` following the existing `about/` pattern

**When to use:** `src/components/ide/Sidebar.tsx` modification

Key changes required:
1. `files-data.ts`: add entries for each test file with `lang: 'typescript'`, `icon: 'ts'`; replace `SAMPLE_LOGS` with real TypeScript Playwright-style log entries
2. `Sidebar.tsx`: add `TEST_FILES` array, add `tests` to the `open` state object, add folder group JSX block following the `about/` pattern
3. `OUTLINE_SYMBOLS`: add entries for each test file (e.g., `landing.spec.ts → [{ label: 'has correct title', kind: 'key' }]`)

**IMPORTANT — `FileEntryIcon` type:** `'ts'` is already in `FileEntryIcon` (`src/types/ide.ts` line 1). `FileEntryLang: 'typescript'` is also already defined. No type changes needed.

**SAMPLE_LOGS replacement:** The current `SAMPLE_LOGS` has Python-style test names (`test_resmed_sdet.py::test_device_monitoring_flow`). Phase 3 replaces these with real TypeScript Playwright names:
```typescript
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
```

---

### Pattern 8: CI Playwright Job

**What:** Separate `playwright` job in `ci.yml` that runs after `quality-gate`

**Recommended structure:** Separate job (not a new step in `quality-gate`) so it shows as its own job in the GitHub Actions UI — better for the "CI status is surfaced" UX (SHOW-03).

```yaml
# Source: https://playwright.dev/docs/ci-intro (verified 2026-05-21)
# .github/workflows/ci.yml — add after quality-gate job
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

**Why separate job:** (a) Keeps `quality-gate` fast (lint/typecheck/build); (b) Playwright failures show as a distinct job in the GitHub Actions UI, making it easier to surface in SHOW-03 polling; (c) `needs: quality-gate` ensures we don't waste browser minutes on a broken build.

**`pnpm exec playwright test` vs `npx playwright test`:** Use `pnpm exec playwright test` to pick up the locally installed version from `node_modules/.bin` rather than downloading from npx. [ASSUMED] — pnpm exec is the standard for pnpm projects.

---

### Anti-Patterns to Avoid

- **CSS variables in ImageResponse:** `var(--green)` does not work inside `ImageResponse` JSX — use hex literals from `styles.css`.
- **Exposing GITHUB_TOKEN to the client:** Never include the token in a response body or in a `NEXT_PUBLIC_*` env var. All GitHub API calls must go through a server-side Route Handler.
- **Calling `injectAxe()` separately:** `@axe-core/playwright` auto-injects — calling `injectAxe()` is a pattern from `axe-playwright` (different package).
- **Using old 204-based workflow_dispatch polling:** The `return_run_details: true` parameter (GA since 2026-02-19) returns the `workflow_run_id` directly — no need for the unique-input-polling workaround.
- **Putting axe scan in a separate `accessibility.spec.ts` that only has axe tests:** Axe scans should run at the end of each page's spec file. A standalone `accessibility.spec.ts` is an alternative (Claude's discretion) but means the accessibility coverage isn't visible per-page in the sidebar.
- **`export const dynamic = 'force-static'` on the OG route:** The OG route should be cached but `force-static` may conflict with request-time rendering. Use `export const revalidate = 86400` (24h cache) instead, or omit for edge-cached behavior.
- **Not setting `metadataBase` in layout.tsx:** Without it, relative OG image paths (`/og`) trigger a Next.js build error. Required.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WCAG accessibility scanning | Custom DOM walker / contrast checker | `@axe-core/playwright` + `AxeBuilder` | axe-core covers 57+ rules; hand-rolled checks miss ARIA, focus management, color contrast edge cases |
| OG image as PNG file | Photoshop/Figma export → `/public/og.png` | `next/og` ImageResponse route | Static PNG goes stale; dynamic route always reflects current content/branding |
| Workflow run ID tracking after dispatch | Unique-input polling workaround | `return_run_details: true` parameter | GA since 2026-02-19; eliminates race conditions and retry complexity |
| robots.txt generation | `next-sitemap` library | Static `public/robots.txt` | 2-page site; library adds a dependency + build step for zero benefit |

---

## Common Pitfalls

### Pitfall 1: CSS Variables in ImageResponse
**What goes wrong:** `backgroundColor: 'var(--bg-deep)'` renders as a transparent/wrong color — OG image looks broken.
**Why it happens:** `ImageResponse` uses Satori (a JSX→SVG→PNG pipeline) that does not evaluate CSS custom properties; it only understands CSS literal values.
**How to avoid:** Copy hex values directly from `styles.css` into the OG route. Keep a comment referencing the CSS variable name so future updates are traceable.
**Warning signs:** Black background or missing colors in the OG preview at `https://og-playground.vercel.app`.

### Pitfall 2: GITHUB_TOKEN Scope Mismatch
**What goes wrong:** `workflow_dispatch` returns 403 or 404 despite correct repo/workflow path.
**Why it happens:** Fine-grained PATs need `Actions: Read and Write` (not just read). Classic PATs need `workflow` scope (a subset of `repo`). Using `actions:read`-only allows listing runs but NOT triggering.
**How to avoid:** When creating the fine-grained PAT in GitHub → Settings → Developer Settings → Fine-grained tokens: check "Actions" with read AND write. Scope the token to only this repository.
**Warning signs:** HTTP 403 from the dispatch endpoint; HTTP 404 if the workflow filename in the URL is wrong.

### Pitfall 3: webServer Build Time in CI
**What goes wrong:** Playwright CI job times out because `pnpm build && pnpm start` runs a full Next.js production build before each test run.
**Why it happens:** The `playwright` job runs `pnpm build` inside `webServer.command`. In CI, the `quality-gate` job already built the app — but its build artifacts aren't shared between jobs by default.
**How to avoid:** Either (a) cache the `.next/` build output as a GitHub Actions artifact and restore it in the playwright job, or (b) accept the rebuild cost (the CI job has a 15-minute timeout; a Next.js build for this site takes ~30s). For v1, option (b) is simpler.
**Warning signs:** `timeout-minutes: 15` exhausted; Playwright never ran.

### Pitfall 4: Sidebar not showing test files for new entries
**What goes wrong:** New entries added to `FILES` in `files-data.ts` don't appear in the sidebar.
**Why it happens:** `Sidebar.tsx` has hardcoded `ABOUT_FILES` and `ROOT_FILES` arrays. New files not in those arrays are silently ignored by `fileRow()`.
**How to avoid:** Add a `TEST_FILES` array in `Sidebar.tsx` and a new `tests/` folder group JSX block. Mirror the existing `about/` folder pattern exactly.
**Warning signs:** Files appear in `FILES` but aren't visible in the IDE sidebar.

### Pitfall 5: metadataBase missing → OG image build error
**What goes wrong:** `pnpm build` fails with "metadata.openGraph.images: relative URLs require metadataBase".
**Why it happens:** Next.js requires an absolute base URL to resolve relative OG image paths like `/og`.
**How to avoid:** Add `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ruslankanat.vercel.app')` to the root `app/layout.tsx` metadata export.
**Warning signs:** Build fails on Vercel after adding `openGraph: { images: ['/og'] }`.

### Pitfall 6: LogEntry `kind` for in-progress CI states
**What goes wrong:** No visual distinction between a step that's running vs a step that passed.
**Why it happens:** The existing `LogKind` type is `'info' | 'warn' | 'ok' | 'pass' | 'fail'` — no `'running'` or `'pending'` kind.
**How to avoid:** Map `status: 'in_progress'` GitHub API jobs to `kind: 'info'` with a spinner character prefix (e.g., `'⟳ Running: install dependencies'`). Map `status: 'queued'` to `kind: 'info'` with `'⏳ Queued...'`. No type changes needed — use `info` kind.
**Warning signs:** All terminal rows look the same color during a live run.

---

## Code Examples

### Full AxeBuilder test (verified against Playwright + axe-core/playwright docs)

```typescript
// Source: https://playwright.dev/docs/accessibility-testing (verified 2026-05-21)
// e2e/landing.spec.ts — example of inline a11y at bottom of page spec
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
    // Editor should show README content
    await expect(page.locator('pre code')).toContainText("Hi, I'm Ruslan");
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

### run-tests API route (Node runtime, server-side GITHUB_TOKEN)

```typescript
// Source: https://docs.github.com/en/rest/actions/workflows (verified 2026-05-21)
// app/api/run-tests/route.ts
export const runtime = 'nodejs';

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

### run-status API route (proxies GitHub jobs API)

```typescript
// app/api/run-status/route.ts
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('run_id');
  if (!runId) return Response.json({ error: 'run_id required' }, { status: 400 });

  const token = process.env.GITHUB_TOKEN;
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

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Poll by unique workflow input to find run ID | `return_run_details: true` returns run ID directly | 2026-02-19 (GA) | Eliminates complex polling-with-unique-input workaround |
| `workflow_dispatch` returns 204 No Content | Returns 200 + JSON body when `return_run_details: true` | 2026-02-19 | Can read `workflow_run_id` from response immediately |
| `injectAxe()` + `checkA11y()` (axe-playwright community pkg) | `AxeBuilder` from `@axe-core/playwright` (official Deque pkg) | ~2021 | Official package; auto-injects; no separate inject step |

**Deprecated/outdated:**
- `axe-playwright` (community package by abhinaba-ghosh): the `checkA11y()` API is from this package, NOT from `@axe-core/playwright`. Use `@axe-core/playwright` with `AxeBuilder.analyze()` instead.
- 204-based workflow_dispatch without run ID: still works but the `return_run_details: true` approach is strictly better.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `pnpm exec playwright test` is the standard invocation for pnpm projects | CI Playwright Job pattern | Low — `npx playwright test` also works as fallback |
| A2 | `NEXT_PUBLIC_SITE_URL` is the canonical env var name for the site's base URL | generateMetadata pattern | Low — any env var name works; this is just a naming convention |
| A3 | The `playwright` CI job should have `needs: quality-gate` to gate on build success | Architecture recommendation | Low — planner can remove the dependency if faster feedback is preferred |
| A4 | LCP < 2s is already satisfied by the static rendering from Phase 1 and needs no code change | HARD-02 analysis | Medium — must be verified via Speed Insights post-deploy; if LCP is > 2s, image optimization or font preloading may be needed |

---

## Open Questions (RESOLVED)

1. **Vercel canonical domain**
   - What we know: The site is deployed to Vercel; domain is likely `ruslankanat.vercel.app` or a custom domain
   - What's unclear: The exact canonical URL to use in `metadataBase` and `sitemap.xml`
   - Recommendation: Use `process.env.NEXT_PUBLIC_SITE_URL` with a fallback of `'https://ruslankanat.vercel.app'`; document that the env var must be set in Vercel project settings
   - **RESOLVED:** Plan 02 uses `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ruslankanat.dev')` in layout.tsx; `NEXT_PUBLIC_SITE_URL` must be set in Vercel project settings (documented in Plan 02 acceptance criteria).

2. **`GH_OWNER` and `GH_REPO` env vars**
   - What we know: The GitHub API calls need `{owner}` and `{repo}` in the path
   - What's unclear: Whether to hardcode these or read from env vars
   - Recommendation: Store as `GH_OWNER=ruslankanat-sdet` and `GH_REPO=sdet-portfolio` in Vercel env vars (alongside `GITHUB_TOKEN`); this avoids hardcoding and keeps the route handler generic
   - **RESOLVED:** Plan 05 stores `GH_OWNER` and `GH_REPO` as Vercel env vars alongside `GITHUB_TOKEN`. The `user_setup` block in Plan 05 documents the required Vercel env var configuration.

3. **Initial terminal state (D-10) sourcing**
   - What we know: D-10 says "hardcoded or build-time fetched"
   - What's unclear: Whether to fetch the last CI run at build time from GitHub API or hardcode it
   - Recommendation: Hardcode as the updated `SAMPLE_LOGS` with real Playwright-style entries; after the first real CI run completes, update `SAMPLE_LOGS` manually. Build-time fetch adds complexity and a dependency on GitHub API availability during `pnpm build`.
   - **RESOLVED:** Plan 03 replaces `SAMPLE_LOGS` with hardcoded TypeScript Playwright-format entries (e.g., `landing.spec.ts > has correct page title`). After the first real CI run completes, `SAMPLE_LOGS` is updated manually — no build-time GitHub API fetch.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Playwright, Next.js | Yes | v22.22.2 (local); v20 in CI | — |
| pnpm | Package manager | Yes | 11.1.2 (local); 9 in CI | — |
| `@playwright/test` | SHOW-01, HARD-05 | Not installed | — (1.60.0 on npm) | — |
| `@axe-core/playwright` | HARD-01 | Not installed | — (4.11.3 on npm) | — |
| Chromium browser | Playwright E2E | Not installed locally | — | `playwright install --with-deps chromium` |
| GitHub Actions | HARD-05, SHOW-03 | Yes (ci.yml exists) | ci.yml stub present | — |
| Vercel Speed Insights | HARD-02 | Yes (installed) | 2.0.0 | — |
| `GITHUB_TOKEN` env var | SHOW-03 | Not set (new) | — | None — must be created |
| `NEXT_PUBLIC_SITE_URL` env var | HARD-03 (metadataBase) | Not set (new) | — | Fallback hardcoded in code |

**Missing dependencies with no fallback:**
- `@playwright/test` and `@axe-core/playwright`: must be installed (`pnpm add -D`)
- Chromium: must be installed (`playwright install --with-deps chromium`)
- `GITHUB_TOKEN` fine-grained PAT: must be created in GitHub and added to Vercel env vars

**Missing dependencies with fallback:**
- `NEXT_PUBLIC_SITE_URL`: hardcoded fallback in `metadataBase` covers initial deploy

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright 1.60.0 |
| Config file | `playwright.config.ts` (root — Wave 0 gap, must be created) |
| Quick run command | `pnpm exec playwright test --project=chromium --grep "@smoke"` |
| Full suite command | `pnpm exec playwright test --project=chromium` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SHOW-01 | Landing page renders correctly | e2e | `pnpm exec playwright test e2e/landing.spec.ts` | No — Wave 0 |
| SHOW-01 | Navigation between pages works | e2e | `pnpm exec playwright test e2e/navigation.spec.ts` | No — Wave 0 |
| SHOW-01 | About page renders | e2e | `pnpm exec playwright test e2e/about.spec.ts` | No — Wave 0 |
| SHOW-01 | File click loads editor content | e2e | `pnpm exec playwright test e2e/ide-interactions.spec.ts` | No — Wave 0 |
| SHOW-02 | Test files appear in sidebar | e2e (visual check) | `pnpm exec playwright test e2e/ide-interactions.spec.ts` | No — Wave 0 |
| SHOW-03 | CI status in terminal | manual verify | — (CI run required) | — |
| HARD-01 | Zero WCAG AA violations on all pages | e2e (axe) | `pnpm exec playwright test --grep "WCAG"` | No — Wave 0 |
| HARD-02 | LCP < 2s | manual verify | — (Speed Insights post-deploy) | — |
| HARD-03 | OG tags present | e2e | `pnpm exec playwright test e2e/landing.spec.ts --grep "og"` | No — Wave 0 |
| HARD-04 | robots.txt + sitemap.xml accessible | e2e | inline in `landing.spec.ts` | No — Wave 0 |
| HARD-05 | CI runs Playwright on push | CI gate | GitHub Actions (automatic) | No — Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm exec playwright test --project=chromium` (full suite; ~30s)
- **Per wave merge:** Full suite green
- **Phase gate:** Full suite green + CI job green before phase sign-off

### Wave 0 Gaps

- [ ] `playwright.config.ts` — must be created before any spec can run
- [ ] `e2e/landing.spec.ts` — covers SHOW-01, HARD-01 (a11y), HARD-03 (OG), HARD-04
- [ ] `e2e/navigation.spec.ts` — covers SHOW-01 nav flows
- [ ] `e2e/about.spec.ts` — covers SHOW-01 about render, HARD-01 a11y
- [ ] `e2e/ide-interactions.spec.ts` — covers SHOW-01 file-click, SHOW-02 sidebar display
- [ ] Framework install: `pnpm add -D @playwright/test @axe-core/playwright && pnpm exec playwright install --with-deps chromium`

---

## Security Domain

security_enforcement is enabled (not set to false in config.json). ASVS level 1.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in v1 |
| V3 Session Management | No | No sessions |
| V4 Access Control | Partial | GITHUB_TOKEN must never be exposed to client; server-side only route handler |
| V5 Input Validation | Yes | Route handlers validate `run_id` query param (must be numeric) |
| V6 Cryptography | No | No crypto operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| GITHUB_TOKEN exposure | Information Disclosure | Server-side only; env var never in `NEXT_PUBLIC_*`; Route Handler proxies all GitHub API calls |
| run_id parameter injection | Tampering | Validate that `run_id` is a positive integer before passing to GitHub API URL |
| Runaway CI triggering (abuse of run-tests button) | Denial of Service | No rate limiting in v1 (no Upstash Redis); acceptable for low-traffic portfolio; document as known gap |
| LLM prompt injection via OG route | N/A | OG route has no LLM; not applicable |

**Security gap to document in plan:** The `/api/run-tests` endpoint has no rate limiting in v1 (Upstash Redis was cut from scope). A visitor can spam the button and trigger many CI runs, burning GitHub Actions minutes. Acceptable risk for a portfolio with low traffic; plan should add a comment noting this.

---

## Sources

### Primary (HIGH confidence)

- [playwright.dev/docs/test-configuration](https://playwright.dev/docs/test-configuration) — playwright.config.ts structure, webServer, retries
- [playwright.dev/docs/accessibility-testing](https://playwright.dev/docs/accessibility-testing) — AxeBuilder API, WCAG tags, analyze() pattern
- [playwright.dev/docs/ci-intro](https://playwright.dev/docs/ci-intro) — GitHub Actions job structure for Playwright
- [nextjs.org/docs/app/api-reference/functions/image-response](https://nextjs.org/docs/app/api-reference/functions/image-response) — ImageResponse, width/height, font loading
- [nextjs.org/docs/app/api-reference/functions/generate-metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — metadataBase, openGraph, twitter fields
- [docs.github.com/en/rest/actions/workflows](https://docs.github.com/en/rest/actions/workflows) — workflow_dispatch endpoint, return_run_details, token scopes
- [docs.github.com/en/rest/actions/workflow-jobs](https://docs.github.com/en/rest/actions/workflow-jobs) — jobs endpoint, steps structure
- [github.blog/changelog/2026-02-19-workflow-dispatch-api-now-returns-run-ids/](https://github.blog/changelog/2026-02-19-workflow-dispatch-api-now-returns-run-ids/) — return_run_details GA announcement
- [github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) — AxeBuilder constructor, auto-inject behavior

### Secondary (MEDIUM confidence)

- npm registry: `@playwright/test@1.60.0` — verified 2026-05-21
- npm registry: `@axe-core/playwright@4.11.3` — verified 2026-05-21
- WebSearch cross-referenced: `axe-playwright` community package vs `@axe-core/playwright` official package distinction confirmed

### Tertiary (LOW confidence)

- A4 (LCP assumption): LCP < 2s on 4G is assumed from the static rendering of the landing page but must be verified post-deploy via Speed Insights — no programmatic check in this phase

---

## Metadata

**Confidence breakdown:**
- Playwright setup (config, specs, CI): HIGH — official docs, npm registry, confirmed versions
- GitHub Actions API: HIGH — official docs + changelog confirming return_run_details GA
- Next.js OG image: HIGH — official Next.js 15 docs (version 16.2.6 API reference, last updated 2026-05-19)
- axe-core/playwright API: HIGH — official Deque repo + Playwright accessibility docs
- SAMPLE_LOGS replacement content: MEDIUM — structure is correct; exact test names depend on spec implementation
- LCP already met assumption: LOW — must be verified post-deploy

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (30 days; all dependencies are stable; GitHub API changelog is dated)
