---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: — Recruiter View & Dual-Audience Landing
status: executing
stopped_at: Phase 07 complete — Phase 8 Landing Door is next
last_updated: "2026-05-27T21:09:25.676Z"
last_activity: 2026-05-27 -- Phase 8 execution started
progress:
  total_phases: 7
  completed_phases: 4
  total_plans: 13
  completed_plans: 11
  percent: 57
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-26 for v1.2)

**Core value:** A recruiter opens the page and immediately sees working code — real Playwright tests, real TypeScript — and thinks "I need to interview this person."
**Current focus:** Phase 8 — landing-door

## Current Position

Phase: 8 (landing-door) — EXECUTING
Plan: 1 of 2
Status: Executing Phase 8
Last activity: 2026-05-27 -- Phase 8 execution started

## Performance Metrics

**Velocity (v1.0):**

- Total plans completed: 14
- Timeline: 9 days (2026-05-14 → 2026-05-23)

**Velocity (v1.1):**

- Total plans completed: 10
- Phases: 3 (phases 4–6)

**v1.2 — in progress (0/? phases complete)**

## Accumulated Context

### Decisions

All v1.0 and v1.1 decisions logged in PROJECT.md Key Decisions table.

Key decisions carried forward:

- IDE-style portfolio with Playwright showcase (no AI APIs in v1)
- Hand-rolled TypeScript tokenizer (client-bundled files-data.ts)
- Two-variant Footer fixed (each page renders its own)
- Next.js App Router on Vercel

v1.2 decisions:

- Route group `(ide)` owns SiteHeader + site-main; root layout is header-free for door/recruiter views
- `/about` page migrated to `src/app/(ide)/about/` — URL unchanged, layout inheritance via route group
- ResumeGate at root reads localStorage['resume-mode'] and branches to ide/recruiter/door stubs; ?reset clears stored mode
- Newsreader serif loaded via next/font as --font-newsreader on <html>; available to all descendants

### Design Handoff

High-fidelity design prototype available at `.planning/design/design_handoff_resume_v1/`:

- `README.md` — full spec, tokens, interactions
- `recruiter.jsx` — all copy (JOBS, SKILL_GROUPS, availability rows) + component structure
- `resume-app.jsx` — Door + routing logic
- `resume.css` — complete CSS (colors, typography, layout, print styles)

### Known Tech Debt Entering v1.2

- TestAutomatorPane is dead code in bundle (deferred from v1.1)
- 0/6 phases have VERIFICATION.md (gsd-verify-work skipped in v1.0 and v1.1)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260523-q01 | Fix SHOW-03: add workflow_dispatch to ci.yml + fix /api/run-tests res.json() on 204 | 2026-05-23 | 31bffb4 | [260523-q01-fix-show-03-ci-dispatch](./quick/260523-q01-fix-show-03-ci-dispatch/) |
| 260523-q02 | Fix CONT-05: remove double footer on /about | 2026-05-23 | 8918ef9 | [260523-q02-fix-cont-05-double-footer](./quick/260523-q02-fix-cont-05-double-footer/) |

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Brand assets | Headshot, logo, custom color palette | Deferred to v1.3+ | v1.2 milestone start |
| Custom domain | DNS wiring | Deferred until candidate ready | v1.1 milestone start |
| AI tools | Test Automator, Test Data Generator, API Test Generator | Deferred to v1.5 | v1.0 pivot |
| Dead code removal | TestAutomatorPane | Deferred to v1.3 | v1.1 roadmap |

## Session Continuity

Last session: 2026-05-27
Stopped at: Phase 07 complete — Phase 8 Landing Door is next
Resume file: .planning/phases/08-landing-door/ (TBD)
