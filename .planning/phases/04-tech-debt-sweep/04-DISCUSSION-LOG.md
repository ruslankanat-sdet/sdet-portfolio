# Phase 4: Tech Debt Sweep - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-24
**Phase:** 4-tech-debt-sweep
**Areas discussed:** CI badge live data

---

## CI Badge Live Data (DEBT-03)

### Q1: Fetch approach

| Option | Description | Selected |
|--------|-------------|----------|
| New server route + ISR | /api/ci-status route, Next.js ISR revalidate every 5 min, TopBar fetches once on mount | ✓ |
| Client polling | useEffect on mount + poll every 60-120s | |
| GitHub badge image | shields.io/GitHub Actions SVG embedded as <img> | |

**User's choice:** New server route + ISR (recommended)
**Notes:** Keeps client code simple; ISR handles caching server-side.

---

### Q2: Fallback / loading state

| Option | Description | Selected |
|--------|-------------|----------|
| Keep current hardcoded display | Show "CI · Passing" green as loading/error fallback | ✓ |
| Show "CI · Unknown" neutral badge | Gray badge while loading and on error | |
| Hide CI badge until loaded | Omit badge until fetch resolves | |

**User's choice:** Keep current hardcoded display (recommended)
**Notes:** Avoids header layout shift; covers the passing-CI baseline well.

---

### Q3: Badge scope

| Option | Description | Selected |
|--------|-------------|----------|
| CI badge only | Only "CI · Passing/Failing" goes live; Coverage and Tests stay static | ✓ |
| All three from GitHub API | Fetch test count and coverage from CI artifacts | |

**User's choice:** CI badge only (recommended)
**Notes:** Coverage/test-count are decorative portfolio signals in v1. Kept static.

---

### Q4: ISR revalidation interval

| Option | Description | Selected |
|--------|-------------|----------|
| 5 minutes | revalidate: 300 — matches CI run duration, conserves API quota | ✓ |
| 1 minute | More responsive, burns more API quota | |
| 15 minutes | Too slow for recruiter who triggers a run | |

**User's choice:** 5 minutes (recommended)
**Notes:** Portfolio traffic is low; cache hit rate will be very high.

---

## Claude's Discretion

- Exact GitHub API endpoint for latest completed run on main branch
- Red/failing badge rendering (tone, pulse, label text)
- Whether to add a `red` CSS tone class to TopBar.module.css or use an existing pattern

## Deferred Ideas

- Responsive handling for longer SiteHeader title → Phase 5
- Automated drift-prevention for sidebar files-data.ts → Phase 6 (TEST-02 covers shape validation)
- Live "Coverage" and "Tests" badge values → deferred, decorative in v1
