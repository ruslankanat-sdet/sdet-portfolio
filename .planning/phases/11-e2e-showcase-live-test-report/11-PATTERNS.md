# Phase 11: E2E Showcase & Live Test Report — Pattern Map

**Mapped:** 2026-06-01
**Files analyzed:** 9
**Analogs found:** 9 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/files-data.ts` | config/data | static | `src/lib/files-data.ts` (self) | exact — in-place content update |
| `src/components/ide/Sidebar.tsx` | component | static | `src/components/ide/Sidebar.tsx` (self) | exact — array append + OUTLINE_SYMBOLS entry |
| `src/components/ide/IDEShell.tsx` | component | event-driven, request-response | `src/components/ide/IDEShell.tsx` (self) | exact — extend `buildLogEntries()` + poll branch |
| `src/app/api/run-status/[run_id]/route.ts` | route | request-response | `src/app/api/run-status/[run_id]/route.ts` (self) | exact — add parallel fetch, extend response shape |
| `.github/workflows/ci.yml` | CI config | batch | `.github/workflows/ci.yml` (self) | exact — add job after existing `playwright-tests` job |
| `playwright.config.ts` | config | static | `playwright.config.ts` (self) | exact — one-line reporter change |
| `src/types/ide.ts` | type/model | static | `src/types/ide.ts` (self) | exact — union extension + interface field |
| `src/components/ide/Terminal.tsx` | component | event-driven | `src/components/ide/Terminal.tsx` (self) | exact — add `'link'` branch to `LogRow` |
| `e2e/ide-interactions.spec.ts` | test | request-response | `e2e/ide-interactions.spec.ts` (self) | exact — copy existing assertion pattern |

---

## Pattern Assignments

### `src/lib/files-data.ts` (config/data, static content update)

**Analog:** `src/lib/files-data.ts` lines 161–339 — existing spec file entries
**Change type:** Add `'tests/recruiter.spec.ts'` entry; refresh stale inline content for `'tests/landing.spec.ts'`, `'tests/navigation.spec.ts'`, `'tests/playwright.config.ts'`.

**Entry structure pattern** (lines 161–215, any spec entry):
```typescript
'tests/landing.spec.ts': {
  lang: 'typescript',
  path: '~/portfolio/e2e/landing.spec.ts',
  icon: 'ts',
  content: `...full file source as template literal...`,
},
```

**New entry to add** — key pattern (copy structure from any existing spec entry):
```typescript
'tests/recruiter.spec.ts': {
  lang: 'typescript',
  path: '~/portfolio/e2e/recruiter.spec.ts',
  icon: 'ts',
  content: `...inline content from e2e/recruiter.spec.ts...`,
},
```

**Stale entries to refresh** — replace `content` field only; keys, lang, path, icon stay the same:
- `'tests/landing.spec.ts'` — current inline content has 7 tests; real file (`e2e/landing.spec.ts`) has 13 tests including Door-phase additions
- `'tests/navigation.spec.ts'` — current inline content is completely stale (different test structure)
- `'tests/playwright.config.ts'` — current inline content has `reporter: process.env.CI ? 'github' : [['html'], ['line']]` which will be changed by the `playwright.config.ts` update in this same phase; refresh after that change

**Insert position:** After `'tests/ide-interactions.spec.ts'` entry (line 306), before `'tests/playwright.config.ts'` entry (line 309), to maintain alphabetical order within the tests folder.

---

### `src/components/ide/Sidebar.tsx` (component, static)

**Analog:** `src/components/ide/Sidebar.tsx` lines 36–56
**Change type:** Append to `TEST_FILES` array; append to `OUTLINE_SYMBOLS` map.

**TEST_FILES array pattern** (lines 36–42):
```typescript
const TEST_FILES = [
  'tests/landing.spec.ts',
  'tests/navigation.spec.ts',
  'tests/about.spec.ts',
  'tests/ide-interactions.spec.ts',
  'tests/playwright.config.ts',
];
```

**New entry insertion** — insert `'tests/recruiter.spec.ts'` before `'tests/playwright.config.ts'` (alphabetical within spec files, config last):
```typescript
const TEST_FILES = [
  'tests/landing.spec.ts',
  'tests/navigation.spec.ts',
  'tests/about.spec.ts',
  'tests/ide-interactions.spec.ts',
  'tests/recruiter.spec.ts',     // ADD
  'tests/playwright.config.ts',
];
```

**OUTLINE_SYMBOLS entry pattern** (lines 51–55 — existing spec entries):
```typescript
'tests/landing.spec.ts':          [{ label: 'has correct page title', kind: 'key' }, { label: 'has no WCAG AA violations', kind: 'key' }],
'tests/ide-interactions.spec.ts': [{ label: 'clicking bio.json loads editor', kind: 'key' }, { label: 'test files appear in sidebar', kind: 'key' }],
```

**New OUTLINE_SYMBOLS entry to add** (after `ide-interactions.spec.ts` line):
```typescript
'tests/recruiter.spec.ts': [{ label: 'REC-01: masthead wordmark', kind: 'key' }, { label: 'REC-02: hero CTAs', kind: 'key' }, { label: 'NAV-01: door → IDE round-trip', kind: 'key' }],
```

---

### `src/components/ide/IDEShell.tsx` (component, event-driven)

**Analog:** `src/components/ide/IDEShell.tsx` lines 13–75

**Current interface** (lines 13–30):
```typescript
interface GitHubStep {
  name: string;
  status: string;
  conclusion: string | null;
  number: number;
}

interface GitHubJob {
  name: string;
  status: string;
  conclusion: string | null;
  steps?: GitHubStep[];
}

interface GitHubJobsPayload {
  jobs?: GitHubJob[];
}
```

**Extended payload interface** — add timing fields to `GitHubJobsPayload`:
```typescript
interface GitHubJobsPayload {
  jobs?: GitHubJob[];
  run_started_at?: string | null;
  updated_at?: string | null;
}
```

**Current `buildLogEntries()` signature and summary block** (lines 31–75):
```typescript
function buildLogEntries(data: GitHubJobsPayload): LogEntry[] {
  // ...job status rows...
  const allComplete = jobs.length > 0 && jobs.every(j => j.status === 'completed');
  if (allComplete) {
    const passed = jobs.filter(j => j.conclusion === 'success').length;
    const failed = jobs.filter(j => j.conclusion !== 'success').length;
    const total = jobs.length;
    const summaryKind: LogKind = failed === 0 ? 'ok' : 'fail';
    entries.push({
      kind: summaryKind,
      text: `Summary: ${passed} passed, ${failed} failed, ${total} total`,
    });
  }
  return entries;
}
```

**Target shape for `buildLogEntries()`** — add `reportUrl` param, duration helper, enriched queued/in_progress messages, "View Report" link entry:

Duration helper (new top-level function, before `buildLogEntries`):
```typescript
function formatDuration(startedAt: string | null | undefined, completedAt: string | null | undefined): string {
  if (!startedAt || !completedAt) return '';
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
}
```

Updated summary and link block (replaces lines 62–72):
```typescript
const allComplete = jobs.length > 0 && jobs.every(j => j.status === 'completed');
if (allComplete) {
  const passed = jobs.filter(j => j.conclusion === 'success').length;
  const failed = jobs.filter(j => j.conclusion !== 'success').length;
  const total = jobs.length;
  const duration = formatDuration(data.run_started_at, data.updated_at);
  const summaryKind: LogKind = failed === 0 ? 'ok' : 'fail';
  entries.push({
    kind: summaryKind,
    text: `Jobs: ${passed}/${total} passed${duration ? ` · ${duration}` : ''}`,
  });
  if (failed === 0) {
    entries.push({ kind: 'link', text: 'View Report →', href: REPORT_URL });
  }
}
```

**REPORT_URL constant** — add as module-level constant above `buildLogEntries`:
```typescript
// Stable URL — GitHub Pages replaces on every CI run.
// Pattern: https://{github-user}.github.io/{repo-name}/
// Verify: git remote get-url origin → confirms repo slug.
const REPORT_URL = 'https://ruslankanat-sdet.github.io/sdet-portfolio/';
```

**Enriched queued/in_progress messages** — update the two `else if` branches inside the `for (const job of jobs)` loop (lines 46–49):
```typescript
} else if (job.status === 'in_progress') {
  entries.push({ kind: 'info', text: `▶ Running: ${job.name}` });
} else if (job.status === 'queued') {
  entries.push({ kind: 'info', text: `⏳ Queued: ${job.name}` });
}
```

**Poll branch type update** (line 181) — `statusData` type must include timing fields:
```typescript
const statusData: GitHubJobsPayload = await statusRes.json();
// GitHubJobsPayload already extended above — no other change needed here
```

---

### `src/app/api/run-status/[run_id]/route.ts` (route, request-response)

**Analog:** `src/app/api/run-status/[run_id]/route.ts` lines 1–49

**Current single fetch pattern** (lines 30–48):
```typescript
const res = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run_id}/jobs`,
  {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  }
);
if (!res.ok) {
  return Response.json({ error: 'Status fetch failed' }, { status: res.status });
}
const data = await res.json();
return Response.json(data);
```

**Target shape — parallel fetch, merged response** (replaces lines 30–49):
```typescript
const base = `https://api.github.com/repos/${owner}/${repo}`;
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

const [jobsRes, runRes] = await Promise.all([
  fetch(`${base}/actions/runs/${run_id}/jobs`, { method: 'GET', headers }),
  fetch(`${base}/actions/runs/${run_id}`, { method: 'GET', headers }),
]);

if (!jobsRes.ok) {
  return Response.json({ error: 'Status fetch failed' }, { status: jobsRes.status });
}

const jobsData = await jobsRes.json();
// run endpoint: best-effort — timing fields are enrichment, not critical
const runData = runRes.ok ? await runRes.json() : {};

// Pure proxy — GITHUB_TOKEN is server-side only, never echoed (T-03-01).
return Response.json({
  jobs: jobsData.jobs,
  run_started_at: runData.run_started_at ?? null,
  updated_at: runData.updated_at ?? null,
});
```

**Keep unchanged:** `runtime = 'nodejs'` declaration (line 1), `RUN_ID_RE` validation (lines 4–12), env var checks (lines 14–28).

---

### `.github/workflows/ci.yml` (CI config, batch)

**Analog:** `.github/workflows/ci.yml` lines 16–88 — existing job structure

**Existing job structure pattern** (lines 50–88):
```yaml
playwright-tests:
  runs-on: ubuntu-latest
  needs: quality-gate
  timeout-minutes: 15
  steps:
    - name: Checkout
      uses: actions/checkout@v4
    # ... setup pnpm, node, install ...
    - name: Upload Playwright report
      uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 7
```

**New job to append** after the `playwright-tests` job (after line 88):
```yaml
deploy-report:
  needs: playwright-tests
  if: ${{ !cancelled() }}
  runs-on: ubuntu-latest
  permissions:
    pages: write
    id-token: write
  concurrency:
    group: pages
    cancel-in-progress: false
  environment:
    name: github-pages
    url: ${{ steps.deployment.outputs.page_url }}
  steps:
    - name: Download Playwright report
      uses: actions/download-artifact@v4
      with:
        name: playwright-report
        path: playwright-report/

    - name: Configure Pages
      uses: actions/configure-pages@v4

    - name: Upload to Pages
      uses: actions/upload-pages-artifact@v3
      with:
        path: playwright-report/

    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

**Important:** The existing top-level `concurrency` block (lines 12–14) uses `cancel-in-progress: true`. The `deploy-report` job overrides this with its own `concurrency: group: pages, cancel-in-progress: false` to prevent report deployments from being cancelled by a subsequent push.

**Required one-time human action:** Repository Settings → Pages → Source must be set to "GitHub Actions" before the first `deploy-report` run. Without this, the job will succeed but the page returns 404.

---

### `playwright.config.ts` (config, static)

**Analog:** `playwright.config.ts` line 9 — reporter field

**Current value** (line 9):
```typescript
reporter: process.env.CI ? 'github' : [['html'], ['line']],
```

**Target value** — enable HTML reporter in CI so `playwright-report/` artifact has content:
```typescript
reporter: process.env.CI ? [['html'], ['github']] : [['html'], ['line']],
```

No other changes to this file in Phase 11.

---

### `src/types/ide.ts` (type/model, static)

**Analog:** `src/types/ide.ts` lines 11–18

**Current `LogKind` and `LogEntry`** (lines 11–18):
```typescript
export type LogKind = 'info' | 'warn' | 'ok' | 'pass' | 'fail';

export interface LogEntry {
  kind: LogKind;
  text?: string;
  test?: string;
  detail?: string;
}
```

**Target shape** — add `'link'` to union; add optional `href` field:
```typescript
export type LogKind = 'info' | 'warn' | 'ok' | 'pass' | 'fail' | 'link';

export interface LogEntry {
  kind: LogKind;
  text?: string;
  test?: string;
  detail?: string;
  href?: string;  // only present when kind === 'link'
}
```

No other changes to this file.

---

### `src/components/ide/Terminal.tsx` (component, event-driven)

**Analog:** `src/components/ide/Terminal.tsx` lines 17–44 — `LogRow` function

**Current `LogRow` exhaustive pattern** (lines 17–44):
```typescript
function LogRow({ log }: { log: LogEntry }) {
  if (log.kind === 'info') {
    return <div className={cn(styles.log, styles.logInfo)}>{log.text}</div>;
  }
  if (log.kind === 'warn') {
    return <div className={cn(styles.log, styles.logWarn)}>{log.text}</div>;
  }
  if (log.kind === 'ok') {
    return <div className={cn(styles.log, styles.logOk)}>{log.text}</div>;
  }
  if (log.kind === 'fail') {
    return (
      <div className={cn(styles.log, styles.logFail)}>
        <span className={cn(styles.logTag, styles.fail)}>[FAIL]</span>
        <span className={styles.logTest}> {log.test}</span>
        {log.detail && <span className={styles.logDetail}>  {log.detail}</span>}
      </div>
    );
  }
  // pass
  return (
    <div className={cn(styles.log, styles.logPass)}>
      <span className={cn(styles.logTag, styles.pass)}>[PASS]</span>
      <span className={styles.logTest}> {log.test}</span>
      {log.detail && <span className={styles.logDetail}>  {log.detail}</span>}
    </div>
  );
}
```

**New branch to insert** before the final `// pass` fallback (after the `fail` block, line 35):
```typescript
if (log.kind === 'link') {
  return (
    <div className={cn(styles.log, styles.logOk)}>
      <a
        href={log.href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.logLink}
      >
        {log.text}
      </a>
    </div>
  );
}
```

**New CSS class to add** to `Terminal.module.css` (after `.logOk` block, around line 148):
```css
.logLink {
  color: var(--green-bright);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.logLink:hover {
  color: var(--text);
}

.logLink:focus-visible {
  outline: 2px solid #79b8ff;
  outline-offset: 2px;
  border-radius: 2px;
}
```

**Security note:** `href` is a hardcoded constant (`REPORT_URL`) set in `IDEShell.tsx`, not injected from the GitHub API response. No XSS risk. `target="_blank"` is safe with `rel="noopener noreferrer"`. Do NOT use `dangerouslySetInnerHTML`.

---

### `e2e/ide-interactions.spec.ts` (test, request-response)

**Analog:** `e2e/ide-interactions.spec.ts` lines 17–37 — existing sidebar and click-to-load assertions

**Pattern for sidebar visibility assertion** (lines 17–26):
```typescript
test('test files appear in sidebar under tests/ folder', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('tests', { exact: true }).first()).toBeVisible();
  await page.getByText('tests', { exact: true }).first().click();
  await expect(page.getByRole('button', { name: /landing\.spec\.ts/ })).toBeVisible();
});
```

**Pattern for click-to-load TypeScript source assertion** (lines 28–37):
```typescript
test('clicking landing.spec.ts loads its TypeScript source in editor', async ({ page }) => {
  await page.goto('/');
  await page.getByText('tests', { exact: true }).first().click();
  await page.getByRole('button', { name: /landing\.spec\.ts/ }).click();
  await expect(page.locator('pre code')).toContainText("'@playwright/test'");
});
```

**New tests to append** (copy and adapt the above patterns; keep `test.beforeEach` that sets `resume-mode: ide`):
```typescript
test('recruiter.spec.ts is visible in sidebar under tests/ folder', async ({ page }) => {
  await page.goto('/');
  await page.getByText('tests', { exact: true }).first().click();
  await expect(page.getByRole('button', { name: /recruiter\.spec\.ts/ })).toBeVisible();
});

test('clicking recruiter.spec.ts loads its TypeScript source in editor', async ({ page }) => {
  await page.goto('/');
  await page.getByText('tests', { exact: true }).first().click();
  await page.getByRole('button', { name: /recruiter\.spec\.ts/ }).click();
  await expect(page.locator('pre code')).toContainText("'@playwright/test'");
});
```

**Note:** The existing `test.beforeEach` at line 3–7 sets `localStorage.setItem('resume-mode', 'ide')`. The two new tests inherit this — no `beforeEach` changes needed. The new tests must be inside the existing `test.describe('IDE interactions', ...)` block.

---

## Shared Patterns

### TypeScript Runtime Guard for env vars
**Source:** `src/app/api/run-status/[run_id]/route.ts` lines 14–28
**Apply to:** Any new code path in the route extension
```typescript
const token = process.env.GITHUB_TOKEN;
if (!token) {
  return Response.json({ error: 'CI trigger not configured' }, { status: 503 });
}
const owner = process.env.GH_OWNER;
const repo = process.env.GH_REPO;
if (!owner || !repo) {
  return Response.json({ error: 'CI trigger not configured' }, { status: 503 });
}
```

### Best-effort secondary fetch pattern
**Source:** pattern derived from existing parallel fetch idiom (no existing codebase example — use Promise.all as shown in route section above)
**Apply to:** `run-status` route — the run timing endpoint (`/actions/runs/{id}`) is enrichment; jobs endpoint is primary. If run endpoint fails, return jobs data with null timing rather than failing the whole request.

### LogRow kind-dispatch pattern
**Source:** `src/components/ide/Terminal.tsx` lines 17–44
**Apply to:** Any new `LogKind` variants — follow the `if (log.kind === 'x') { return <div ...> }` exhaustive dispatch pattern. New kinds go before the final fallback `// pass` case.

### Inline spec content pattern
**Source:** `src/lib/files-data.ts` lines 161–339
**Apply to:** New `'tests/recruiter.spec.ts'` entry — copy full file source verbatim from `e2e/recruiter.spec.ts` as a template literal. Escape any backticks and `${` expressions in the source with `\`` and `\${`.

---

## No Analog Found

All 9 files have close analogs (each is a self-modification). No files require RESEARCH.md patterns as a substitute.

---

## Key Implementation Notes

### Repo slug verification (Pitfall 5 from RESEARCH.md)
Before hardcoding `REPORT_URL` in `IDEShell.tsx`, confirm the GitHub repository slug:
```bash
git remote get-url origin
# Expected: git@github.com:ruslankanat-sdet/sdet-portfolio.git
# Pages URL: https://ruslankanat-sdet.github.io/sdet-portfolio/
```

### Terminal.module.css — no new CSS classes required for `logLink` if reusing `logOk`
The simplest implementation reuses `styles.logOk` for color and adds only the underline via an inline style or a new `.logLink` class. The `.logLink` class shown above is the cleaner approach; it already follows the `.logOk` / `.logWarn` / `.logFail` naming convention in `Terminal.module.css`.

### Test count phrasing (Pitfall 4 from RESEARCH.md)
Use `"Jobs: ${passed}/${total} passed"` — not `"Tests: N passed"`. The GitHub Jobs API returns CI job results, not Playwright test case counts. Using "Jobs" is accurate regardless of test count changes.

### Wave execution order matters
1. `src/types/ide.ts` — add `'link'` kind first (unblocks Terminal.tsx and IDEShell.tsx)
2. `playwright.config.ts` — fix reporter (unblocks accurate `tests/playwright.config.ts` inline content)
3. `src/lib/files-data.ts` — content updates (after config fix, so inlined playwright.config.ts content is current)
4. `src/components/ide/Sidebar.tsx` — array/symbols update (after files-data.ts has the new key)
5. `src/app/api/run-status/[run_id]/route.ts` — extend to return timing
6. `src/components/ide/IDEShell.tsx` — extend buildLogEntries (after types and route are updated)
7. `src/components/ide/Terminal.tsx` — add link LogRow branch (after types updated)
8. `e2e/ide-interactions.spec.ts` — add assertions (after sidebar sync is complete)
9. `.github/workflows/ci.yml` — add deploy-report job (independent, can be done any time)

---

## Metadata

**Analog search scope:** `src/lib/`, `src/components/ide/`, `src/app/api/run-status/`, `src/types/`, `e2e/`, `.github/workflows/`, project root
**Files read:** 12 (files-data.ts, Sidebar.tsx, IDEShell.tsx, Terminal.tsx, Terminal.module.css, route.ts, ide.ts, ci.yml, playwright.config.ts, recruiter.spec.ts, ide-interactions.spec.ts, landing.spec.ts)
**Pattern extraction date:** 2026-06-01
