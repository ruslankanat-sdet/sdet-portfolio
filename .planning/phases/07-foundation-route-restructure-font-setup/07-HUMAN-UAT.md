---
status: partial
phase: 07-foundation-route-restructure-font-setup
source: [07-VERIFICATION.md]
started: 2026-05-27T00:00:00Z
updated: 2026-05-27T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Root route renders door stub — no SiteHeader

Open `http://localhost:3000/` in incognito (or clear localStorage first). Confirm:
- Dark background (`#06090e`) fills full viewport
- "Landing door — coming in Phase 8" text visible
- No SiteHeader in the DOM (no nav bar at top)

expected: Full-viewport dark stub with no SiteHeader
result: [pending]

### 2. IDE mode branch renders SiteHeader + IDEShell

In DevTools console: `localStorage.setItem('resume-mode', 'ide')` then hard-refresh. Confirm:
- SiteHeader visible at top
- IDEShell (file explorer, editor, terminal panes) renders below it

expected: SiteHeader + IDEShell layout identical to pre-Phase-7 behavior
result: [pending]

### 3. ?reset clears localStorage and shows door stub

With `localStorage['resume-mode'] = 'ide'` set, navigate to `http://localhost:3000/?reset`. Confirm:
- Door stub (dark background) renders — no SiteHeader, no IDE
- `localStorage.getItem('resume-mode')` returns null in DevTools

expected: mode cleared, door stub visible, localStorage key absent
result: [pending]

### 4. /about page renders SiteHeader + resume content

Navigate to `http://localhost:3000/about`. Confirm:
- SiteHeader renders at the top (from `(ide)` group layout)
- MDX resume content loads below it
- No visual regressions vs pre-Phase-7

expected: SiteHeader + full resume page identical to pre-Phase-7 behavior
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
