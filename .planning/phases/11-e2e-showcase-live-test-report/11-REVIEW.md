---
phase: 11-e2e-showcase-live-test-report
reviewed: 2026-06-02T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - .github/workflows/ci.yml
  - e2e/ide-interactions.spec.ts
  - playwright.config.ts
  - src/app/api/run-status/[run_id]/route.ts
  - src/components/ide/IDEShell.tsx
  - src/components/ide/Sidebar.tsx
  - src/components/ide/Terminal.module.css
  - src/components/ide/Terminal.tsx
  - src/components/ide/__tests__/buildLogEntries.test.ts
  - src/lib/files-data.ts
  - src/types/ide.ts
findings:
  critical: 3
  warning: 4
  info: 2
  total: 9
status: issues_found
---

# Phase 11: Code Review Report

**Reviewed:** 2026-06-02T00:00:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Phase 11 implements a live CI showcase — triggering a GitHub Actions run from the IDE shell, polling its status, and displaying results in the terminal panel. It also adds a `deploy-report` CI job to publish the Playwright HTML report to GitHub Pages and adds a "View Report" link in the terminal on success.

Three blockers were found. The most impactful is a silent rendering bug: when a CI run ends with failures, the terminal summary row is invisible because `buildLogEntries` emits a `kind:'fail'` entry using the `text` field, but `Terminal.LogRow` for the `fail` branch renders `log.test` (not `log.text`). The recruiter sees `[FAIL]` followed by nothing. The unit test for this state passes because it checks the data object, not what the DOM renders — a gap in test coverage that allowed the bug through.

The second blocker is a CI pipeline correctness issue: `deploy-report` has `needs: playwright-tests` and `if: !cancelled()`. When `quality-gate` fails, `playwright-tests` is **skipped** (not cancelled), and `!cancelled()` evaluates to true for a skipped job, so `deploy-report` runs and immediately fails on `download-artifact` because no artifact was uploaded. This breaks every build where `quality-gate` fails.

The third blocker is a run-ID race condition in `run-tests/route.ts`: after dispatching a workflow, it waits 2 seconds and fetches the most recently queued `workflow_dispatch` run. If two dispatches happen within 2 seconds, or if the new run takes longer than 2 seconds to appear in the API, polling attaches to the wrong run.

---

## Critical Issues

### CR-01: Fail summary row renders blank — `log.text` silently dropped by `LogRow` for `kind:'fail'`

**File:** `src/components/ide/IDEShell.tsx:89-94` and `src/components/ide/Terminal.tsx:28-35`

**Issue:** `buildLogEntries` emits the jobs-complete failure summary as:
```ts
{ kind: 'fail', text: 'Jobs: 1/2 passed · 1m 30s' }
```
`Terminal.LogRow` for `kind === 'fail'` renders `log.test` and `log.detail`, not `log.text`. Since `test` is `undefined` on the summary entry, the row renders as `[FAIL]  ` with no text — the summary message is completely invisible. The unit test in `buildLogEntries.test.ts` tests the data structure, not the render, so it passes while the UI bug persists.

**Fix:** Either make `LogRow` fall back to `log.text` when `log.test` is absent, or emit the summary as a dedicated kind (e.g., `ok`/`warn` already work via `log.text`). The minimal fix:
```tsx
// Terminal.tsx — LogRow fail branch
if (log.kind === 'fail') {
  // Summary entries (no test field) fall through to text display
  if (!log.test) {
    return <div className={cn(styles.log, styles.logFail)}>{log.text}</div>;
  }
  return (
    <div className={cn(styles.log, styles.logFail)}>
      <span className={cn(styles.logTag, styles.fail)}>[FAIL]</span>
      <span className={styles.logTest}> {log.test}</span>
      {log.detail && <span className={styles.logDetail}>  {log.detail}</span>}
    </div>
  );
}
```

---

### CR-02: `deploy-report` runs (and fails) when `playwright-tests` is skipped due to `quality-gate` failure

**File:** `.github/workflows/ci.yml:89-119`

**Issue:** `deploy-report` declares `needs: playwright-tests` and `if: ${{ !cancelled() }}`. In GitHub Actions, when `quality-gate` fails, `playwright-tests` has status `skipped` — not `cancelled`. The `!cancelled()` expression returns `true` for a skipped dependency. As a result `deploy-report` starts, hits `actions/download-artifact@v4` with artifact name `playwright-report`, finds nothing (no report was uploaded during a skipped playwright job), and fails. This causes every `quality-gate` failure to produce two job failures in the CI summary instead of one.

**Fix:** Add `success()` to the condition so the deploy only runs when the upstream job actually ran and succeeded:
```yaml
deploy-report:
  needs: playwright-tests
  if: ${{ success() }}   # only when playwright-tests passed, not skipped/failed
```
Or use `needs.playwright-tests.result == 'success'` for explicitness.

---

### CR-03: Race condition in `run-tests/route.ts` — wrong run ID returned when dispatch is slow or concurrent

**File:** `src/app/api/run-tests/route.ts:40-62`

**Issue:** After dispatching the workflow (which returns `204 No Content`), the handler sleeps 2 seconds then fetches `?event=workflow_dispatch&branch=main&per_page=5` and returns `workflow_runs[0]` (the most recent). Two failure modes:

1. **Concurrency:** A second visitor triggers a run within the 2-second window. The first visitor's poller attaches to the second visitor's run ID.
2. **Latency:** GitHub's run registration occasionally takes longer than 2 seconds. The handler returns the ID of the **previous** run, and the UI polls a completed (stale) run, immediately shows its results, and marks the button as not-running — giving false feedback.

There is no reliable fix that stays within the GitHub `workflow_dispatch` API (it deliberately does not return a run ID). Mitigations:

```ts
// Option A: document the limitation explicitly and return null, letting the UI
// fall back to "Check GitHub Actions" — which is already handled at line 193-196.
// Remove the 2s sleep + list-runs fetch entirely and always return { runId: null }.

// Option B: keep the heuristic but record the dispatch timestamp and filter runs
// created AFTER that timestamp:
const dispatchedAt = new Date().toISOString();
await new Promise(r => setTimeout(r, 3000));
const runs = runsData.workflow_runs ?? [];
const newRun = runs.find(r => r.created_at > dispatchedAt);
return Response.json({ runId: newRun?.id ?? null, url: newRun?.html_url ?? null });
```

---

## Warnings

### WR-01: Missing `logPass` CSS class — `pass` rows have no row-level style

**File:** `src/components/ide/Terminal.tsx:52` and `src/components/ide/Terminal.module.css`

**Issue:** `LogRow` for `kind === 'pass'` applies `styles.logPass` as the row class (line 52), but `Terminal.module.css` defines no `.logPass` rule. The `.logTag.pass` rule exists (line 178 of CSS) and colours the `[PASS]` badge, but the row container has no dedicated colour. The `SAMPLE_LOGS` pass rows therefore render with the default `var(--text-muted)` colour (from `.log`) instead of whatever green tint was intended. This is a visual regression.

**Fix:** Add the missing rule to `Terminal.module.css`:
```css
.logPass {
  color: var(--text); /* or var(--green-soft) for a tinted row */
}
```

---

### WR-02: `deploy-report` runs on test failure — stale/failing report deployed to GitHub Pages

**File:** `.github/workflows/ci.yml:83-87` (artifact upload) and `89-119` (deploy)

**Issue:** The `Upload Playwright report` step has `if: ${{ !cancelled() }}`, which uploads the report even when tests fail. `deploy-report` (once CR-02 is fixed to `if: success()`) will then deploy a failing report to the public GitHub Pages URL (`REPORT_URL`), which is the same URL linked from the IDE terminal. Visitors who click "View Report →" see a red report from a different run than the one that generated the link. This is a UX/trust issue: the live link should only be surfaced when the report is fresh and green.

**Fix:** The current logic already gates the `link` entry on `failed === 0` in `buildLogEntries`, which is correct. The remaining risk is stale reports from previous failing runs being served at `REPORT_URL`. This is inherent to a single-URL Pages deployment and is acceptable for a portfolio, but should be noted. No code change required beyond CR-02.

---

### WR-03: Closed sidebar keyboard-accessible despite `aria-hidden="true"` — focus trap on desktop

**File:** `src/components/ide/Sidebar.tsx:88` and `src/components/ide/Sidebar.module.css:13-17`

**Issue:** When `sidebarOpen` is `false`, the sidebar has `aria-hidden={!sidebarOpen}` applied to the `<aside>` and CSS `width: 0; overflow: hidden` on desktop. The `aria-hidden` attribute hides the sidebar from screen readers, but does **not** remove interactive elements from the tab order. The three elements with `tabIndex={0}` (folder headers and file rows) remain reachable via the keyboard `Tab` key even when the sidebar is visually collapsed. A keyboard user pressing Tab will focus invisible elements.

On mobile, `pointer-events: none` is added but again does not affect keyboard focus.

**Fix:** Add the `inert` attribute to the closed sidebar, or set `tabIndex={-1}` on all focusable elements inside when closed:
```tsx
<aside
  className={cn(styles.sidebar, { [styles.sidebarClosed]: !sidebarOpen })}
  aria-hidden={!sidebarOpen}
  // inert is now baseline across modern browsers (2023+):
  {...(!sidebarOpen ? { inert: '' } : {})}
>
```

---

### WR-04: `run-status` proxies raw GitHub API `jobs` array without validation or field-stripping

**File:** `src/app/api/run-status/[run_id]/route.ts:47-57`

**Issue:** `jobsData.jobs` is forwarded directly from the GitHub API without runtime validation. If the GitHub API changes its jobs schema or returns an error body that doesn't include `jobs`, `jobsData.jobs` will be `undefined`. `IDEShell` defensively handles this with `data.jobs ?? []`, so there's no crash — but the raw GitHub jobs objects also expose fields not needed by the client (`runner_id`, `runner_name`, `check_run_url`, etc.), which unnecessarily increases payload size and couples the client to the GitHub API shape.

**Fix:** Strip the jobs array to only the fields consumed by `buildLogEntries`:
```ts
const stripped = (jobsData.jobs ?? []).map((j: GitHubJob) => ({
  name: j.name,
  status: j.status,
  conclusion: j.conclusion,
  steps: j.steps?.map((s: GitHubStep) => ({
    name: s.name,
    status: s.status,
    conclusion: s.conclusion,
  })),
}));
return Response.json({
  jobs: stripped,
  run_started_at: runData.run_started_at ?? null,
  updated_at: runData.updated_at ?? null,
});
```

---

## Info

### IN-01: Displayed spec content in `files-data.ts` is out of sync with the real `e2e/ide-interactions.spec.ts`

**File:** `src/lib/files-data.ts:349-383`

**Issue:** The `content` field for `tests/ide-interactions.spec.ts` in `FILES` is missing the `test.beforeEach` block that exists in the real `e2e/ide-interactions.spec.ts` (lines 4-8). The displayed code also uses double-escaped regex literals (`\\.` instead of `\.`) which is correct for the template literal, but the real file and the two new tests (`recruiter.spec.ts is visible...`, `clicking recruiter.spec.ts loads...`) are entirely absent from the displayed content. A recruiter clicking `tests/ide-interactions.spec.ts` in the sidebar sees an outdated version of the spec.

**Fix:** Update the `content` string to match the current `e2e/ide-interactions.spec.ts` exactly (including `beforeEach`, the two recruiter tests, and the updated describe body).

---

### IN-02: `cancelled` jobs counted as failures in `buildLogEntries` summary — misleading pass/fail ratio

**File:** `src/components/ide/IDEShell.tsx:87`

**Issue:** The `failed` variable is computed as `jobs.filter(j => j.conclusion !== 'success').length`. This counts jobs with `conclusion === 'cancelled'` as failures. A cancelled run therefore shows e.g. `Jobs: 1/2 passed` and `kind:'fail'` (no report link), even though the individual cancelled job was already displayed as a `warn` entry. The variable name `failed` is misleading — it actually means "non-success" and includes cancellations. For a portfolio this is cosmetic but could confuse a recruiter watching a manually-cancelled run.

**Fix:** Either rename the variable to `nonSuccess` for clarity, or explicitly exclude `cancelled` jobs from the count:
```ts
const failed = jobs.filter(
  j => j.conclusion !== 'success' && j.conclusion !== 'cancelled'
).length;
```

---

_Reviewed: 2026-06-02T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
