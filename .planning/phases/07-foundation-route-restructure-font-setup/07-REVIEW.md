---
phase: 7
phase_name: Foundation — Route Restructure & Font Setup
status: warning
files_reviewed: 6
depth: standard
findings:
  critical: 0
  warning: 1
  info: 2
  total: 3
reviewed_at: 2026-05-27
---

# Code Review — Phase 7: Foundation — Route Restructure & Font Setup

## Summary

6 files reviewed at standard depth. No critical bugs or security issues. One warning-level UX defect in `ResumeGate` where `?reset` is never cleared from the URL after processing. Two info-level notes.

---

## Findings

### WR-01 — `?reset` URL parameter persists after processing (Warning)

**File:** `src/app/page.tsx:30-38`

**Problem:**
`ResumeGateInner` reads `searchParams.get('reset')`, clears localStorage, and sets `mode = null` — but never removes the `?reset` query parameter from the URL. The address bar stays at `/?reset` indefinitely. Consequences:

1. Any user who shares or bookmarks the reset URL accidentally shares the reset behavior — a returning visitor who clicks the link has their mode preference wiped silently.
2. If Next.js re-runs the effect due to a parent re-render or future router event, the reset path fires again (idempotent, but unexpected).
3. The address bar cosmetically shows `/?reset` even after the reset is complete.

**Fix:** After clearing, call `router.replace('/', { scroll: false })` to strip the param from the URL without a navigation flash.

```tsx
import { useRouter, useSearchParams } from 'next/navigation';

function ResumeGateInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ...
  useEffect(() => {
    if (searchParams.get('reset') !== null) {
      clearStoredMode();
      setMode(null);
      router.replace('/', { scroll: false }); // clean up the URL
    } else {
      setMode(readStoredMode());
    }
    setMounted(true);
  }, [searchParams, router]);
```

**Severity:** Warning — functional but causes share/bookmark UX defect.

---

### INF-01 — `100dvh` without `100vh` fallback in stub divs (Info)

**File:** `src/app/page.tsx:42,78-93`

The door stub and SSR fallback div use `height: '100dvh'` (dynamic viewport height) without a `100vh` fallback. `dvh` is unsupported in Safari < 15.4 and Firefox < 101. For a portfolio site that recruiters might visit on corporate Safari, adding a fallback is low-cost:

```tsx
style={{ height: '100dvh', minHeight: '100vh' }}
// or via CSS:
height: 100vh;
height: 100dvh;
```

These stubs are temporary (replaced in Phases 8–9), so the risk is low. Noting for when the real components are written.

**Severity:** Info — affects a small browser population; stubs are temporary.

---

### INF-02 — `(ide)/layout.tsx` renders `<>` fragment root (Info)

**File:** `src/app/(ide)/layout.tsx:4-9`

The layout returns a React fragment (`<>`) rather than a single element. This is valid React and correct Next.js App Router pattern — the root layout provides the `<html>` and `<body>` wrappers, so child layouts can use fragments. No action needed; flagging because some linters warn on fragment-root layouts.

**Severity:** Info — no action required.

---

## Files With No Findings

| File | Status |
|------|--------|
| `src/app/layout.tsx` | Clean — Newsreader font wired correctly, metadata idiomatic |
| `src/app/(ide)/about/page.tsx` | Clean — verbatim move, no changes to logic |
| `src/app/(ide)/about/about.module.css` | Clean — verbatim move |
| `src/app/globals.css` | Clean — `--font-newsreader` comment + `--serif` alias correct |
