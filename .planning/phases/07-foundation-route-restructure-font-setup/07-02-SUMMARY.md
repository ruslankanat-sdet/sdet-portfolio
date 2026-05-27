---
phase: 7
plan: "07-02"
subsystem: "routing / typography"
tags: ["ResumeGate", "localStorage-routing", "next/font", "Newsreader", "client-component", "Suspense"]
dependency_graph:
  requires: ["07-01"]
  provides: ["ResumeGate at root route", "--font-newsreader CSS variable", "localStorage mode branching"]
  affects: ["src/app/page.tsx", "src/app/layout.tsx", "src/app/globals.css"]
tech_stack:
  added: ["Newsreader (next/font/google)"]
  patterns: ["localStorage routing gate", "mounted-guard pattern for SSR/hydration safety", "useSearchParams in Suspense boundary"]
key_files:
  created: []
  modified:
    - "src/app/page.tsx"
    - "src/app/layout.tsx"
    - "src/app/globals.css"
decisions:
  - "Newsreader font declared with both normal and italic styles and weights 400+500 — italic needed for Phase 9 display headings"
  - "newsreader.variable applied to <html> element, not <body>, so serif font is accessible to all descendants including recruiter-view subtrees"
  - "mounted guard (useState false → true in useEffect) prevents SSR flash — localStorage is undefined server-side, so mode starts null and is only resolved after hydration"
  - "useSearchParams wrapped in Suspense as required by Next.js App Router — omitting Suspense causes build warnings and hydration errors"
  - "Door and Recruiter branches are stubs returning full-viewport divs — Phase 8 and Phase 9 will replace them respectively"
metrics:
  duration_minutes: 20
  completed_date: "2026-05-27"
  tasks_completed: 4
  files_modified: 3
---

# Phase 7 Plan 02: ResumeGate + Newsreader Font Summary

**One-liner:** Client-side localStorage gate at root route with Newsreader serif font via next/font/google, Suspense-wrapped useSearchParams, and ?reset support.

## What Was Built

### Task 1 — Newsreader font in root layout (committed 7e48592)
- `Newsreader` imported from `next/font/google` alongside `Inter` and `JetBrains_Mono`
- Constant declared with `variable: '--font-newsreader'`, `style: ['normal', 'italic']`, `weight: ['400', '500']`
- `newsreader.variable` applied to `<html className={newsreader.variable}>` — accessible to all page subtrees

### Task 2 — --font-newsreader documented in globals.css (committed 50ad369)
- Comment block added near the `:root` font token section documenting that `--font-newsreader` is injected by `next/font`
- `--serif: var(--font-newsreader)` alias added to the `:root` token block for convenience

### Task 3 — ResumeGate replaces root page.tsx (committed e0a0146)
- `src/app/page.tsx` fully replaced with `"use client"` `ResumeGate` component
- `ResumeGateInner` reads `localStorage["resume-mode"]` inside `useEffect` to avoid SSR mismatch
- `mounted` guard prevents flash: renders dark `100dvh` div until client has hydrated
- Three mode branches:
  - `mode === "ide"` → `<SiteHeader /> + <main className="site-main"><IDEShell /></main>`
  - `mode === "recruiter"` → cream full-viewport stub (Phase 9 placeholder)
  - `mode === null` → dark full-viewport stub (Phase 8 placeholder)
- `?reset` query param clears `localStorage["resume-mode"]` and forces `mode = null`
- `useSearchParams` wrapped in `<Suspense>` per Next.js App Router requirement

### Task 4 — Smoke tests (no separate commit — verification only)
- `pnpm tsc --noEmit` → exit 0
- `pnpm test` → 36/36 tests pass (3 test files)
- `pnpm build` → exit 0, all 9 static pages generated, no route conflicts

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

| Stub | File | Line | Reason |
|------|------|------|--------|
| Recruiter view stub | src/app/page.tsx | ~57 | Full RecruiterView component is Phase 9 scope |
| Landing door stub | src/app/page.tsx | ~79 | Full Door component is Phase 8 scope |

These stubs are intentional and documented in the plan. They do not block the plan's goal (wiring the gate and exposing the routing branches).

## Threat Flags

None — this plan adds no new network endpoints, auth paths, file access patterns, or schema changes. The localStorage read is client-only and handles exceptions silently.

## Self-Check: PASSED

- [x] src/app/page.tsx exists and starts with `'use client'`
- [x] Commit 7e48592 exists (Task 1 — Newsreader font)
- [x] Commit 50ad369 exists (Task 2 — globals.css)
- [x] Commit e0a0146 exists (Task 3 — ResumeGate)
- [x] pnpm tsc --noEmit exits 0
- [x] pnpm test exits 0 (36 tests)
- [x] pnpm build exits 0 (9 static pages, no errors)
