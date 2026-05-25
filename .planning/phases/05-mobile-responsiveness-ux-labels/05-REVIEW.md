---
phase: 05-mobile-responsiveness-ux-labels
reviewed: 2026-05-25T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - src/app/about/about.module.css
  - src/components/ide/EditorArea.module.css
  - src/components/ide/EditorArea.tsx
  - src/components/ide/FileView.module.css
  - src/components/ide/IDEShell.module.css
  - src/components/ide/IDEShell.tsx
  - src/components/ide/Sidebar.module.css
  - src/components/ide/Sidebar.tsx
  - src/components/ide/Terminal.module.css
  - src/components/ide/Terminal.tsx
  - src/components/ide/TopBar.module.css
  - src/components/layout/SiteHeader.module.css
  - src/components/layout/SiteHeader.tsx
findings:
  critical: 2
  warning: 5
  info: 3
  total: 10
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-05-25T00:00:00Z
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

This phase implements mobile responsiveness and UX labels across the IDE shell and layout components. The responsive breakpoint structure is consistent and the CSS overlay pattern for the mobile sidebar is mechanically sound. However, two blockers exist: a missing CSS class causes `pass`-kind log rows to render without their intended visual style, and the `EditorArea` content pane renders stale file content after all tabs are closed instead of showing the empty state. Five additional warnings cover stale mobile state (no resize listener), orphaned polling timers, keyboard focus reaching an offscreen sidebar, a misapplied `aria-current` attribute, and the terminal resize handle having no touch event support. Three info-level items cover dead code.

---

## Critical Issues

### CR-01: `styles.logPass` class missing — pass log rows render as plain info text

**File:** `src/components/ide/Terminal.tsx:38`

**Issue:** `LogRow` for the `'pass'` kind applies `styles.logPass` as a CSS Module class:

```tsx
<div className={cn(styles.log, styles.logPass)}>
```

`Terminal.module.css` defines `.logOk`, `.logFail`, `.logInfo`, `.logWarn`, and `.logTag.pass`, but there is **no `.logPass` class**. In CSS Modules, `styles.logPass` resolves to `undefined`, so `cn()` silently drops it. The result: every `[PASS]` row uses the base `.log` style (`color: var(--text-muted)`) — identical to an `info` row — instead of any pass-specific visual treatment. The `[PASS]` tag within the row is green (via `.logTag.pass`), but the row wrapper receives no differentiation. This is a display correctness bug that breaks the visual distinction between pass and info output that the design clearly intends.

**Fix:** Add `.logPass` to `Terminal.module.css`, mirroring the pattern used by `.logOk`:

```css
/* Terminal.module.css — add after .logOk */
.logPass {
  /* row wrapper color for pass entries */
}
```

If the intent is that pass rows match `.logOk` styling, simply reuse it:

```tsx
// Terminal.tsx LogRow, 'pass' branch
return (
  <div className={cn(styles.log, styles.logOk)}>
    <span className={cn(styles.logTag, styles.pass)}>[PASS]</span>
    <span className={styles.logTest}> {log.test}</span>
    {log.detail && <span className={styles.logDetail}>  {log.detail}</span>}
  </div>
);
```

---

### CR-02: Empty state unreachable — file content renders after all tabs are closed

**File:** `src/components/ide/EditorArea.tsx:105–111`

**Issue:** The content-area render tree checks `file` truthiness before checking `tabs.length === 0`:

```tsx
{isTool ? (
  <TestAutomatorPane />
) : file ? (
  <FileView file={file} />          // ← fires when file is truthy
) : tabs.length === 0 ? (
  <div className={styles.emptyState}>No file open.</div>   // ← never reached
) : null}
```

When the user closes the last tab via `closeTab`, the `IDEShell` callback does **not** clear `activeFile` when `next.length === 0` (IDEShell.tsx:120: `if (activeFile === name && next.length) setActiveFile(...)`). So `activeFile` retains the last file's name, `file = FILES[activeFile]` remains truthy, and `FileView` continues to render even though the tab bar is empty. The `emptyState` branch is structurally unreachable in this scenario.

**Fix — option A (guard in EditorArea):** Check `tabs.length` first:

```tsx
{isTool ? (
  <TestAutomatorPane />
) : tabs.length === 0 ? (
  <div className={styles.emptyState}>No file open.</div>
) : file ? (
  <FileView file={file} />
) : null}
```

**Fix — option B (clear activeFile in IDEShell):** Update `closeTab` to clear `activeFile` when the last tab is closed:

```ts
const closeTab = useCallback((name: string) => {
  setTabs(t => {
    const next = t.filter(x => x !== name);
    if (activeFile === name) {
      setActiveFile(next.length ? next[next.length - 1] : '');
    }
    return next;
  });
}, [activeFile]);
```

Option A is simpler and keeps `activeFile` as a non-empty hint for restoration.

---

## Warnings

### WR-01: Closed mobile sidebar is keyboard-reachable (focus trap / WCAG 2.1 failure)

**File:** `src/components/ide/Sidebar.module.css:43–55`, `src/components/ide/Sidebar.tsx:92`

**Issue:** When the sidebar is closed on mobile, `.sidebarClosed` applies `transform: translateX(-100%)`, `opacity: 0`, and `pointer-events: none`. The element also receives `aria-hidden="true"` (Sidebar.tsx:92). However, `aria-hidden` only hides the element from the accessibility tree — it does **not** prevent keyboard focus from reaching the interactive elements inside (buttons, `tabIndex={0}` divs). Any keyboard user who tabs through the page will cycle through the activity bar buttons and tree rows even when the sidebar is visually offscreen. This violates WCAG 2.4.3 (Focus Order) and WCAG 2.1.2 (No Keyboard Trap in its inverse form — focus is being directed into invisible content).

On desktop, `.sidebarClosed` uses `width: 0; overflow: hidden`, which similarly fails to prevent focus from reaching zero-sized focusable children in most browsers.

**Fix:** Add the HTML `inert` attribute when the sidebar is closed. React 19 supports `inert` natively:

```tsx
// Sidebar.tsx
<aside
  className={cn(styles.sidebar, { [styles.sidebarClosed]: !sidebarOpen })}
  aria-hidden={!sidebarOpen}
  inert={!sidebarOpen ? true : undefined}
>
```

The `inert` attribute blocks all focus, pointer, and find-in-page interactions within the element, which is exactly the correct semantics for an offscreen panel.

---

### WR-02: `isMobile` state never updated on viewport resize — stale mobile detection

**File:** `src/components/ide/IDEShell.tsx:90–98`

**Issue:** `isMobile` and `sidebarOpen` are initialized from `window.innerWidth` in `useState` lazy initializers and are never updated when the viewport is resized:

```ts
const [isMobile, setIsMobile] = useState<boolean>(() => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
});
```

`setIsMobile` is suppressed by an `// eslint-disable-next-line @typescript-eslint/no-unused-vars` comment because it is never called after mount. If a user opens the page in a narrow window and resizes to wide (or vice versa), `isMobile` is wrong for the rest of the session. The consequences: the sidebar `onSelect` callback (which closes the sidebar on file click) is only passed on mobile (`onSelect={isMobile ? toggleSidebar : undefined}`), so on a resized-to-wide window the mobile close-on-select callback remains active. The backdrop overlay check (`sidebarOpen && isMobile`) also uses the stale value.

**Fix:** Add a resize observer or `matchMedia` listener in a `useEffect`:

```ts
useEffect(() => {
  const mql = window.matchMedia('(max-width: 768px)');
  const handler = (e: MediaQueryListEvent) => {
    setIsMobile(e.matches);
    setSidebarOpen(!e.matches);
  };
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}, []);
```

---

### WR-03: CI polling `setTimeout` has no cleanup — orphaned fetch calls on unmount

**File:** `src/components/ide/IDEShell.tsx:164–189`

**Issue:** The `runSmoke` callback starts a recursive polling loop via `setTimeout(poll, 5000)`. The timer ID is never stored and there is no cleanup mechanism (no `useRef`, no `useEffect` cleanup function). If the component unmounts while a poll is in flight (the user navigates away during a CI run), the `setTimeout` fires after unmount, calling `fetch('/api/run-status/${runId}')`, then calling `setLogs`/`setRunning` on the unmounted component. While React 18 no longer warns on this, the fetch calls continue to fire on the Vercel serverless endpoint, wasting cost-sensitive API quota against the CI status endpoint. In a longer CI run (several minutes), many orphaned polls can accumulate.

**Fix:** Track the timer with a `useRef` and cancel it in a cleanup effect:

```ts
const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// Inside poll():
pollTimerRef.current = setTimeout(poll, 5000);

// In a useEffect that covers the running state:
useEffect(() => {
  return () => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
  };
}, []);
```

---

### WR-04: `aria-current="page"` misapplied on "Back" navigation link

**File:** `src/components/layout/NavLink.tsx:14–16`

**Issue:** When the user is on `/about`, `NavLink` renders:

```tsx
<Link href="/" aria-current="page">← Back</Link>
```

`aria-current="page"` is defined in ARIA 1.1 as indicating the element that represents the **current page** in a navigation set. The Back link points to `/` (the home page), not `/about` (the current page). Applying `aria-current="page"` to a link whose `href` does not match the current URL is semantically incorrect; screen readers will announce the Home link as the current page. The correct value, if any distinction is needed, would be omitting `aria-current` entirely on the Back link (it is navigation, not a page indicator).

**Fix:**

```tsx
// NavLink.tsx
<Link
  href={isAbout ? '/' : '/about'}
  className={styles.navLink}
  // aria-current intentionally omitted — this is a navigational link, not a page indicator
>
  {isAbout ? '← Back' : 'About / Resume'}
</Link>
```

---

### WR-05: Terminal resize handle has no touch event support — non-functional on mobile

**File:** `src/components/ide/Terminal.tsx:59–72`, `src/components/ide/Terminal.module.css:233–244`

**Issue:** The `termResizer` div uses only `onMouseDown` to initiate drag-to-resize. Touch devices fire `touchstart`/`touchmove`/`touchend`, not mouse events. The CSS correctly hides the resizer on mobile (`@media (max-width: 768px) { .termResizer { display: none; } }`), which avoids the broken interaction at the 768px breakpoint. However, this means users on narrow viewport devices cannot resize the terminal at all — the feature is entirely absent. Given that the terminal height matters for readability on small screens, this is a functional gap rather than a crash.

**Fix — short term:** The current `display: none` suppression is acceptable for v1 if fixed-height mobile terminal is intentional. Document this explicitly:

```css
/* Terminal.module.css */
@media (max-width: 768px) {
  .termResizer {
    display: none; /* Touch drag-to-resize not implemented; terminal height is fixed on mobile */
  }
}
```

**Fix — proper:** Add `onTouchStart` parallel to `onMouseDown` using `Touch.clientY` for the same drag logic:

```tsx
const onTouchDrag = (e: React.TouchEvent) => {
  const startY = e.touches[0].clientY;
  const startH = height;
  const move = (ev: TouchEvent) => {
    setHeight(Math.max(120, Math.min(500, startH - (ev.touches[0].clientY - startY))));
  };
  const up = () => {
    window.removeEventListener('touchmove', move);
    window.removeEventListener('touchend', up);
  };
  window.addEventListener('touchmove', move, { passive: false });
  window.addEventListener('touchend', up);
};
```

---

## Info

### IN-01: `lastRun` state is computed but never consumed

**File:** `src/components/ide/IDEShell.tsx:88, 177`

**Issue:** `lastRun` state is updated (`setLastRun('just now')` at line 177) but never passed to any component. The comment acknowledges this: `// future: pass to TopBar for "last run" display`. This is dead state — the `eslint-disable-next-line` suppresses the warning for the destructured pair. Until the feature is wired up, both the state and the suppression comment add noise.

**Fix:** Either remove the state until needed, or wire it to `TopBar` (which would require a `lastRun` prop). If deferring, retain the `TODO` comment but remove the `eslint-disable` and instead rename to signal intent:

```ts
// IDEShell.tsx — remove until TopBar uses it, or add a prop to TopBar
```

---

### IN-02: `toml` icon mapping is dead code in `EditorArea` and `Sidebar`

**File:** `src/components/ide/EditorArea.tsx:28`, `src/components/ide/Sidebar.tsx:35`

**Issue:** Both `ICONS_FOR_FILE` maps include a `toml` key. The `FileEntryIcon` type is `'ts' | 'json' | 'py' | 'md' | 'yaml'` — `'toml'` is not a valid value. No `FileEntry` in the codebase can ever have `icon: 'toml'`, so these entries are unreachable.

**Fix:** Remove the `toml` entries from both `ICONS_FOR_FILE` records:

```ts
// Remove from both EditorArea.tsx and Sidebar.tsx
const ICONS_FOR_FILE = {
  json: FileJson2,
  py:   FileCode2,
  md:   FileText,
  yaml: FileText,
  ts:   FileCode2,
  // toml removed — not in FileEntryIcon type
};
```

---

### IN-03: `-webkit-overflow-scrolling: touch` is a deprecated property

**File:** `src/app/about/about.module.css:142`

**Issue:** `-webkit-overflow-scrolling: touch` was a non-standard property used on older iOS Safari (pre-iOS 13) to enable momentum scrolling. It has been deprecated since iOS 13 (2019) and is a no-op on all current iOS/Android browsers. Modern browsers enable momentum scrolling automatically for `overflow: auto` elements.

**Fix:** Remove the property. No functional change on any currently supported browser:

```css
@media (max-width: 768px) {
  .pageWrapper table {
    display: block;
    overflow-x: auto;
    /* -webkit-overflow-scrolling: touch; — deprecated since iOS 13, remove */
  }
}
```

---

_Reviewed: 2026-05-25T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
