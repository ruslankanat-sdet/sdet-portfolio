# Phase 4: Tech Debt Sweep - Context

**Gathered:** 2026-05-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Four accuracy fixes so visitors see correct, real data everywhere:
1. SiteHeader full title (DEBT-01)
2. Copyright year — already © 2026 in Footer.tsx, verify and close (DEBT-02)
3. TopBar CI badge reflects real GitHub Actions state for main branch (DEBT-03)
4. IDE sidebar file entries match actual e2e/ spec files in the repo (DEBT-04)

No new features, no layout overhauls, no mobile work — that is Phase 5.

</domain>

<decisions>
## Implementation Decisions

### CI Badge Live Data (DEBT-03)

- **D-01:** Fetch strategy — new `/api/ci-status` route handler that calls the GitHub API for the latest completed workflow run on `main`. Next.js ISR caches the response with `revalidate: 300` (5 minutes). TopBar fetches it once on mount via `useEffect`. No client polling.
- **D-02:** Fallback / loading state — keep the current hardcoded green display ("CI · Passing") as the loading and error fallback. No spinner, no layout shift. Covers the 99% case where CI is passing.
- **D-03:** Badge scope — only the CI badge ("CI · Passing/Failing") becomes live. "Coverage · 98%" and "Tests · 312" stay static for this phase — they are decorative portfolio signals, not live metrics.
- **D-04:** ISR interval — 5 minutes (300s). CI runs take 3-8 min anyway; more frequent revalidation wastes GitHub API quota at portfolio traffic levels.

### SiteHeader Title (DEBT-01)

- **D-05:** Simple text change: `"Senior SDET"` → `"Senior SDET / QA Automation Engineer"` in `SiteHeader.tsx`. No responsive handling added in this phase — all responsive concerns are deferred to Phase 5.

### Sidebar Sync (DEBT-04)

- **D-06:** One-time content update — diff `files-data.ts` entries against actual e2e/ files and update any stale content. Scope: the 4 spec files (`landing.spec.ts`, `navigation.spec.ts`, `about.spec.ts`, `ide-interactions.spec.ts`) plus `playwright.config.ts` (shown under `tests/` in the sidebar even though it lives at the repo root — this mapping is intentional). No automated drift-prevention mechanism in this phase.

### Claude's Discretion

- GitHub API endpoint to use: `GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs?branch=main&status=completed&per_page=1` — or the simpler `GET /repos/{owner}/{repo}/actions/runs?branch=main&per_page=1`. Planner picks the lightest call that returns conclusion (`success`/`failure`/`cancelled`).
- Exact badge rendering for "failing" state (red tone, no pulse, label "CI · Failing") — match existing `StatusBadge` component conventions.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` — DEBT-01 through DEBT-04 definitions
- `.planning/ROADMAP.md` §Phase 4 — success criteria (4 items, including the DEBT-02 already-done note)

### Affected Source Files
- `src/components/layout/SiteHeader.tsx` — DEBT-01 target (line 10: title span)
- `src/components/layout/Footer.tsx` — DEBT-02: verify © 2026 already present
- `src/components/ide/TopBar.tsx` — DEBT-03: hardcoded StatusBadge entries (lines 89-91)
- `src/lib/files-data.ts` — DEBT-04: test file entries to sync against e2e/
- `src/app/api/run-status/[run_id]/route.ts` — reference for GitHub API auth pattern (GITHUB_TOKEN, GH_OWNER, GH_REPO env vars)

### E2E Spec Files (DEBT-04 source of truth)
- `e2e/landing.spec.ts`
- `e2e/navigation.spec.ts`
- `e2e/about.spec.ts`
- `e2e/ide-interactions.spec.ts`
- `playwright.config.ts` (repo root — shown as `tests/playwright.config.ts` in sidebar)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StatusBadge` component in `TopBar.tsx` — takes `tone: 'green' | 'blue'` and `value: string`. A `'red'` tone or separate failing variant will be needed for DEBT-03 failing state.
- `src/app/api/run-status/[run_id]/route.ts` — establishes the pattern: Node runtime, GITHUB_TOKEN auth, GH_OWNER/GH_REPO from env, `fetch` to GitHub API. New `/api/ci-status` should mirror this exactly.

### Established Patterns
- All tool API routes use `export const runtime = 'nodejs'` — follow for the new `/api/ci-status` route.
- GitHub API calls use `Authorization: Bearer ${token}`, `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28` headers.
- `SiteHeader.module.css` controls title styling — the longer string may need a `white-space: nowrap` or `overflow: hidden` check but responsive treatment is deferred to Phase 5.

### Integration Points
- `TopBar.tsx` is a `"use client"` component — `useEffect` for the fetch is already the correct pattern.
- New `/api/ci-status` route: `app/api/ci-status/route.ts` with `export const revalidate = 300`.

</code_context>

<specifics>
## Specific Ideas

- DEBT-02 (© 2026) is likely already done — Footer.tsx line 69 already renders `© 2026 Ruslan Kanatbek`. Planner should verify and mark as closed with no code change needed.
- The CI badge should show a red/failing tone when `conclusion !== 'success'`. The `StatusBadge` component currently only has `green` and `blue` tones — a `red` tone CSS class may need to be added to `TopBar.module.css`.

</specifics>

<deferred>
## Deferred Ideas

- Responsive handling for the longer SiteHeader title — deferred to Phase 5 (Mobile Responsiveness & UX Labels).
- Automated sidebar drift-prevention (CI check or snapshot test) — deferred to Phase 6 (Vitest Unit Tests) where TEST-02 validates `files-data.ts` shape.
- "Coverage · 98%" and "Tests · 312" live data — deferred; these are decorative in v1.

</deferred>

---

*Phase: 4-tech-debt-sweep*
*Context gathered: 2026-05-24*
