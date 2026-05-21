# Phase 3: Playwright Showcase + Hardening — Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the SDET portfolio genuinely launch-ready. Three parallel tracks:

1. **Playwright Showcase (SHOW-01, SHOW-02, SHOW-03):** Write real TypeScript Playwright E2E tests for the site, display those test files in the IDE shell's file explorer, and wire a "Run Tests" button that triggers a real CI run via GitHub Actions API — results stream into the terminal pane.

2. **CI Hardening (HARD-05):** Extend the existing CI workflow to run the Playwright suite on every push to `main`. The ci.yml already has a stub ("Phase 3 wires this").

3. **Pre-Launch Hardening (HARD-01, HARD-02, HARD-03, HARD-04):** WCAG AA verified via axe-core in E2E tests, LCP < 2s on 4G, OG cards on landing + About, robots.txt + sitemap.

This phase adds no new pages, no new AI features, no design changes. It is the validation + launch-readiness pass.

</domain>

<decisions>
## Implementation Decisions

### Playwright Test File Location (SHOW-01, SHOW-02)

- **D-01:** Playwright E2E tests live at `e2e/` at the repo root. This is the Playwright convention and matches what `playwright.config.ts` expects by default (`testDir: './e2e'`).
- **D-02:** Test files: `e2e/landing.spec.ts`, `e2e/navigation.spec.ts`, `e2e/about.spec.ts`, `e2e/ide-interactions.spec.ts` at minimum. The planner decides exact file names and grouping — these are the flows the ROADMAP.md success criteria describe (landing renders, nav works, About page renders, file-click-to-editor).
- **D-03:** `playwright.config.ts` lives at the repo root alongside `e2e/`.

### IDE Sidebar Display (SHOW-02)

- **D-04:** The IDE sidebar's file explorer displays **all `.spec.ts` files + `playwright.config.ts`** — no other test infrastructure files. They appear under a `tests/` folder label in the sidebar (even though they live under `e2e/` in the repo). `files-data.ts` entries map the real file content read from `e2e/` at build time (or inline if small).
- **D-05:** Clicking a test file in the sidebar loads the full TypeScript source into the editor pane with syntax highlighting (TypeScript tokenizer is already in place from Phase 1 — `FileEntryLang: 'typescript'` supported).
- **D-06:** The `playwright.config.ts` is included in the sidebar so visitors can see the full test setup (base URL, retries, reporters, CI config). This signals SDET depth.

### Test Execution via GitHub Actions (SHOW-03)

- **D-07:** A **"Run Tests"** trigger is exposed in the IDE chrome (exact placement — topbar button, terminal pane button, or status bar — left to the planner; the TopBar already has a "Run Smoke Test" reference in the README.md IDE content, so the topbar is the natural home).
- **D-08:** On click, the site calls a Next.js **API route handler** (`app/api/run-tests/route.ts`, Node runtime) which calls the **GitHub Actions workflow_dispatch API** (`POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches`) to trigger a real CI run. This requires a `GITHUB_TOKEN` env var in Vercel with `workflow` scope (a fine-grained PAT or classic token with `workflow` permission).
- **D-09:** After triggering, the terminal pane **polls the GitHub Actions API** (`GET /repos/{owner}/{repo}/actions/runs`) to detect the newly-triggered run, then polls its job status. Terminal pane renders LogEntry rows showing: "Triggering CI run…", "Run #N queued", "Job: quality-gate → in_progress", then per-step status as they complete, then final "✓ All tests passed" or "✗ Tests failed — see run #N". Polling interval: 5s. GitHub API token used server-side only (never exposed to client).
- **D-10:** The terminal pane also shows the **static last-CI-run state on initial page load** — a hardcoded or build-time-fetched set of LogEntry rows (e.g., "Last run: #42 · All tests passed · 2 min ago · [view →]"). This satisfies SHOW-03 even when the user hasn't clicked "Run Tests".
- **D-11:** `GITHUB_TOKEN` is added to Vercel project env vars (production). The planner documents the required token scope in the plan. This is a new env var (first external service token in v1).

### CI Hardening (HARD-05)

- **D-12:** The existing `.github/workflows/ci.yml` is extended to add a Playwright job (separate job from `quality-gate`, or a new step — planner decides based on job dependency). The job runs `pnpm exec playwright test` after installing browsers with `pnpm exec playwright install --with-deps chromium`. Runs on every push to `main` and on PRs.
- **D-13:** Chromium only in CI (not Firefox/WebKit) to keep install time and CI minutes low for a Hobby plan.

### WCAG AA + Accessibility (HARD-01)

- **D-14:** `@axe-core/playwright` is added to the Playwright suite. An accessibility test (`e2e/accessibility.spec.ts` or as a helper called from each page test) runs `checkA11y()` on every page. Zero violations = CI pass. This provides automated, provable WCAG AA coverage.
- **D-15:** Focus indicators and keyboard navigation — verified by the axe-core scan (catches most issues) + any remaining fixes applied inline. No manual audit needed beyond what axe-core reports.

### Performance (HARD-02)

- **D-16:** LCP < 2s verified via **Playwright with Chrome DevTools Protocol** (Playwright can capture Web Vitals via `page.evaluate` + PerformanceObserver, or via `playwright-lighthouse` integration). Alternative: trust Vercel Speed Insights post-deploy (zero CI infra). The planner picks the approach that doesn't add more than one new library — Vercel Speed Insights is already installed and sufficient for v1 (it's a MEDIUM-effort item, not blocking launch).
- **D-17:** Landing page is already statically rendered (Phase 1) — the "no blocking server calls on initial paint" constraint is already met. HARD-02 is primarily a verification task, not a build task.

### OG Meta + Social Cards (HARD-03)

- **D-18:** OG meta added to landing page and `/about`. Use **`next/og` (ImageResponse)** for dynamic OG image generation — a route handler at `app/og/route.tsx` renders a card with candidate name, title, and site tagline. No external image file to maintain. Reuses design tokens for colors/fonts.
- **D-19:** OG tags: `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, `twitter:image`. Added via `generateMetadata` in `app/layout.tsx` (global) + page-level overrides for `/about`.

### robots.txt + sitemap (HARD-04)

- **D-20:** Static `public/robots.txt` (allow all, point to sitemap) and `public/sitemap.xml` (landing + about) — two small static files, no library needed. Content is stable: 2 pages in v1.

### Claude's Discretion

- Exact Playwright job placement in ci.yml (separate job vs new step in quality-gate)
- Polling UX details — loading spinner, LogEntry styling for in-progress vs done states
- Whether `checkA11y()` lives in each spec file or a shared helper
- Exact `playwright.config.ts` configuration (base URL from env, retries: 1 in CI, 0 locally)
- OG image design details (layout, colors — use existing design tokens)
- sitemap.xml lastmod dates and changefreq values

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 + 2 Foundations
- `.planning/phases/01-foundations-test-automator-live/01-CONTEXT.md` — D-13 (design tokens), `FileEntryLang: 'typescript'` already in types, `files-data.ts` structure. Phase 3 extends `files-data.ts` with test file entries.
- `.planning/phases/02-resume-about-layer/02-CONTEXT.md` — SiteHeader, Footer, `/about` page patterns. Phase 3 adds OG meta to both pages.

### Design
- `.planning/design/design_handoff_ide_portfolio/styles.css` — Canonical design tokens. OG image route must use these colors/fonts (or their resolved values), not invent new ones.
- `.planning/design/design_handoff_ide_portfolio/README.md` — IDE chrome layout. "Run Tests" button must fit within existing TopBar/StatusBar zones.

### Stack
- `CLAUDE.md` — Stack spec: Node runtime for route handlers, `@anthropic-ai/sdk` NOT used in v1 (no AI tools). The GitHub Actions API call is a plain `fetch` with Authorization header — no SDK needed.

### Requirements
- `.planning/REQUIREMENTS.md` — SHOW-01, SHOW-02, SHOW-03, HARD-01, HARD-02, HARD-03, HARD-04, HARD-05 definitions.
- `.planning/ROADMAP.md` — Phase 3 success criteria (5 criteria to satisfy).

### Existing Code
- `src/lib/files-data.ts` — `FILES` and `LOGS` exports that drive IDE sidebar and terminal. Phase 3 adds test file entries to `FILES` and initial CI log entries to `LOGS`.
- `src/components/ide/TopBar.tsx` — "Run Tests" button goes here. Read existing structure before adding.
- `src/components/ide/Terminal.tsx` — LogEntry rendering. New CI-status log entries must match existing `LogEntry` type from `src/types/ide.ts`.
- `.github/workflows/ci.yml` — Existing CI workflow. Phase 3 adds Playwright job here.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/files-data.ts` — `FILES` Record + `LOGS` array. Phase 3 adds `'tests/landing.spec.ts'`, `'tests/about.spec.ts'`, `'tests/navigation.spec.ts'`, `'tests/ide-interactions.spec.ts'`, `'tests/playwright.config.ts'` entries to `FILES`. The `content` field holds the actual file source.
- `src/types/ide.ts` — `FileEntry` (lang, path, icon, content) and `LogEntry` (kind: info/warn/ok/pass/fail, text) types. `'typescript'` lang already in `FileEntryLang`. LogEntry `kind` values cover CI output perfectly (pass/fail/info).
- `src/components/ide/EditorArea.tsx` — Already handles syntax highlighting for TypeScript via Shiki. No changes needed for test file display.
- `src/app/layout.tsx` — `generateMetadata` export location for global OG tags.
- `src/lib/utils.ts` — `cn()` helper.

### Established Patterns
- **Server Components by default.** API route for GitHub Actions trigger is a Route Handler (Node runtime, `export const runtime = 'nodejs'`). Client-side polling logic lives in a `'use client'` component (Terminal or a new RunTests hook).
- **CSS Modules** for component-scoped styles — `TopBar.module.css` for any "Run Tests" button styling.
- **Design tokens via CSS custom properties** — all new UI elements use `var(--color-*)`, `var(--font-*)`.
- **No `dangerouslySetInnerHTML`** — LLM output rule from CLAUDE.md; same applies to any rendered content.

### Integration Points
- `files-data.ts` `FILES` Record → `Sidebar.tsx` maps these to file entries → `EditorArea.tsx` displays selected file. Adding test file entries to `FILES` is the primary integration for SHOW-02.
- `files-data.ts` `LOGS` array → `Terminal.tsx` renders these. Adding static CI-status entries to `LOGS` covers the initial SHOW-03 state.
- New `app/api/run-tests/route.ts` → called by a client button in `TopBar.tsx` → response updates `LOGS` state in `IDEShell.tsx` (which manages sidebar/editor/terminal state).
- `generateMetadata` in `app/layout.tsx` + `app/about/page.tsx` → OG meta for HARD-03.

</code_context>

<specifics>
## Specific Ideas

- **"Run Tests" in TopBar:** The existing `files-data.ts` README.md content already says "**Run Smoke Test** in the topbar → watch this site test itself." The button is already mentioned in the IDE's own content — Phase 3 makes it real. The label should match: "Run Smoke Test" or "Run Tests" (planner picks the one that better fits the TopBar layout).
- **Terminal pane log format should match Playwright output style:** Pass: `✓ landing page renders`, Fail: `✗ navigation: About link missing`, Info: `Running 4 tests…`, `2 passed, 0 failed`. Use `kind: 'pass'` / `kind: 'fail'` / `kind: 'info'` LogEntry types to get correct color coding.
- **GITHUB_TOKEN scope:** The token only needs `actions:write` (to trigger workflow_dispatch) and `actions:read` (to poll run status). A fine-grained PAT scoped to this repo is preferred over a classic token.
- **Static initial terminal state:** On page load, the terminal shows the *last* CI run's result. This can be hardcoded after the first CI run completes (or fetched at build time from GitHub API and written to a JSON file).
- **OG image:** Dark background (`--color-bg`), candidate name in `--font-mono`, title "Senior SDET · Playwright · TypeScript" — matches the IDE aesthetic. Size: 1200×630 (standard).

</specifics>

<deferred>
## Deferred Ideas

- **Real-time log streaming via SSE** — GitHub Actions doesn't expose live log streaming via API (only completed job logs). True real-time streaming would require a WebSocket proxy service or GitHub's log-streaming endpoint (beta). Deferred to v1.5.
- **Firefox + WebKit CI coverage** — Chromium only in Phase 3 CI to keep Hobby-tier minutes reasonable. Multi-browser matrix is a v1.5 upgrade.
- **Lighthouse CI in GitHub Actions** — Running Lighthouse as a CI step would give a committed LCP history. Phase 3 uses Vercel Speed Insights (already installed) for LCP verification. Lighthouse CI deferred.
- **Visual regression testing** — Screenshot diffing across branches. Interesting for an SDET portfolio, but adds a pixel-comparison storage layer. Deferred to v2.
- **Live test execution against a demo site** — Running Playwright against a real target (not the portfolio itself) in a browser sandbox. Out of scope per REQUIREMENTS.md.

</deferred>

---

*Phase: 03-playwright-showcase-hardening*
*Context gathered: 2026-05-21 via /gsd-discuss-phase 3*
