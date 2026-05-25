# Phase 5: Mobile Responsiveness & UX Labels - Pattern Map

**Mapped:** 2026-05-24
**Files analyzed:** 12 files (10 modified, 2 CSS-only)
**Analogs found:** 12 / 12 (all files read directly — no separate analog needed; each file IS its own analog)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/ide/IDEShell.tsx` | component (shell) | event-driven, state | Self — existing SSR-safe `useState` initializer pattern | exact |
| `src/components/ide/IDEShell.module.css` | CSS | — | Self — existing `@media (max-width: 768px)` block | exact |
| `src/components/ide/Sidebar.tsx` | component | event-driven | Self — existing `fileRow` onClick/onKeyDown pattern | exact |
| `src/components/ide/Sidebar.module.css` | CSS | — | Self — existing `@media (max-width: 768px)` overlay block | exact |
| `src/components/ide/Terminal.tsx` | component | event-driven | Self — existing `termTab` conditional render pattern | exact |
| `src/components/ide/Terminal.module.css` | CSS | — | Self — existing log row classes | exact |
| `src/components/ide/FileView.module.css` | CSS | — | Self — existing `.minimap` block | exact |
| `src/components/ide/EditorArea.tsx` | component | request-response | Self — existing breadcrumb render pattern | exact |
| `src/components/ide/EditorArea.module.css` | CSS | — | Self — existing `.breadcrumb` block | exact |
| `src/components/ide/TopBar.module.css` | CSS | — | Self — existing `@media (max-width: 920px)` hide pattern | exact |
| `src/components/layout/SiteHeader.module.css` | CSS | — | Self — existing `@media (max-width: 480px)` block | exact |
| `src/app/about/about.module.css` | CSS | — | Self — existing `.pageWrapper` block | exact |

---

## Pattern Assignments

### `src/components/ide/IDEShell.tsx` (Logic + JSX)

**Three changes needed:** (1) `termHeight` initializer, (2) `isMobile` state, (3) backdrop JSX + `onSelect` conditional prop.

**SSR-safe `useState` initializer pattern** (lines 87–90 — the existing `sidebarOpen` initializer):
```typescript
const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth > 768;
});
```
Copy this exact structure for both `isMobile` and the updated `termHeight` initializer. The `typeof window === 'undefined'` guard is mandatory — Next.js SSR runs this code without `window`.

**`termHeight` initializer to replace** (line 80 — current):
```typescript
const [termHeight, setTermHeight] = useState<number>(220);
```
Replace with lazy initializer (same pattern as `sidebarOpen`):
```typescript
const [termHeight, setTermHeight] = useState<number>(() => {
  if (typeof window === 'undefined') return 220;
  return window.innerWidth <= 768 ? 120 : 220;
});
```

**New `isMobile` state to add** (after `sidebarOpen` declaration):
```typescript
const [isMobile, setIsMobile] = useState<boolean>(() => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
});
```
Note: `isMobile` is a snapshot taken at mount time. It does not need a resize listener for v1.1 — it only gates the initial `termHeight` and the conditional `onSelect` prop. If the window is resized, a full page reload resets it.

**Backdrop JSX to add** (insert between `<Sidebar>` and `<div className={styles.main}>` inside `.ideBody`):
```tsx
{sidebarOpen && isMobile && (
  <div
    className={styles.backdrop}
    onClick={toggleSidebar}
    aria-hidden="true"
  />
)}
```
Current JSX structure at lines 201–213 for reference:
```tsx
<div className={styles.ideBody}>
  <Sidebar activeFile={activeFile} setActiveFile={setActiveFile} openTab={openTab} sidebarOpen={sidebarOpen} />
  {/* INSERT BACKDROP HERE */}
  <div className={styles.main} role="region" aria-label="Editor and terminal">
```

**`onSelect` conditional prop to add to `<Sidebar>`:**
```tsx
<Sidebar
  activeFile={activeFile}
  setActiveFile={setActiveFile}
  openTab={openTab}
  sidebarOpen={sidebarOpen}
  onSelect={isMobile ? toggleSidebar : undefined}
/>
```
Pass `undefined` on desktop so the prop is optional and desktop behavior is unchanged.

---

### `src/components/ide/IDEShell.module.css` (CSS)

**Existing `@media (max-width: 768px)` block** (lines 19–24 — already present):
```css
@media (max-width: 768px) {
  .ideBody {
    position: relative;
  }
}
```
Add `.backdrop` class to the **non-media** section, then add the backdrop to the existing `@media (max-width: 768px)` block as a no-op (the backdrop is conditionally rendered in JSX, so no CSS display toggle is needed):
```css
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 49;
  background: rgba(0, 0, 0, 0.5);
  opacity: 1;
  transition: opacity 0.2s ease;
}
```
The z-index hierarchy from `Sidebar.module.css` line 26: `.sidebar` at `z-index: 50`. Backdrop must be `z-index: 49`. SiteHeader is `z-index: 10` (from `SiteHeader.module.css` line 13). Backdrop at 49 sits correctly between sidebar and all other content.

---

### `src/components/ide/Sidebar.tsx` (Props + JSX)

**Existing interface** (lines 22–27):
```typescript
interface SidebarProps {
  activeFile: string;
  setActiveFile: (name: string) => void;
  openTab: (name: string) => void;
  sidebarOpen?: boolean;
}
```
Add `onSelect?: () => void` as the fifth optional prop.

**Existing `fileRow` click handler** (lines 67–86):
```tsx
const fileRow = (name: string) => {
  // ...
  return (
    <div
      key={name}
      className={cn(styles.treeRow, { [styles.active]: isActive })}
      onClick={() => { setActiveFile(name); openTab(name); }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveFile(name); openTab(name); } }}
    >
```
Update both `onClick` and `onKeyDown` to call `onSelect?.()` after the existing calls:
```tsx
onClick={() => { setActiveFile(name); openTab(name); onSelect?.(); }}
onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveFile(name); openTab(name); onSelect?.(); } }}
```

**Existing Explorer header** (lines 151–154):
```tsx
<div className={styles.explorerHeader}>
  <span>EXPLORER</span>
  <span className={styles.explorerMeta}>ruslankanat/portfolio</span>
</div>
```
Add pane subtitle after the `<span>EXPLORER</span>`, before `explorerMeta`:
```tsx
<div className={styles.explorerHeader}>
  <span>
    EXPLORER
    <span aria-hidden="true"> · </span>
    <span className={styles.paneSubtitle}>File browser</span>
  </span>
  <span className={styles.explorerMeta}>ruslankanat/portfolio</span>
</div>
```

**`explorerMeta` class** (Sidebar.module.css lines 137–143) — the pane subtitle mirrors this color/size tier but uses `var(--ui)` font instead of `var(--mono)`:
```css
.explorerMeta {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text-muted);   /* subtitle uses var(--text-faint) instead */
  letter-spacing: 0.02em;
  font-weight: 400;
}
```

---

### `src/components/ide/Sidebar.module.css` (CSS)

**Existing `@media (max-width: 768px)` block** (lines 20–42 — already handles overlay):
```css
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 50;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
    transform: translateX(0);
    opacity: 1;
  }
  .sidebarClosed {
    width: 232px;
    overflow: visible;
    border-right: 1px solid var(--border);
    transform: translateX(-100%);
    opacity: 0;
    pointer-events: none;
  }
}
```
Append to the same `@media (max-width: 768px)` block (touch target fix for file rows):
```css
  .treeRow,
  .treeFolder {
    min-height: 44px;
  }
```

**New `.paneSubtitle` class to add** (non-media section):
```css
.paneSubtitle {
  font-size: 10.5px;
  font-weight: 400;
  color: var(--text-faint);
  letter-spacing: 0.02em;
  font-family: var(--ui);
  margin-left: 4px;
}
```

**CSS Modules class naming convention** (observed in this file): kebab-case words joined into camelCase — e.g., `explorerHeader`, `explorerMeta`, `treeFolder`, `treeRow`, `actBtn`, `outlineHeader`. New class `paneSubtitle` follows the same pattern.

---

### `src/components/ide/Terminal.tsx` (JSX only)

**Existing tab render pattern** (lines 81–95 — the `TERM_TABS.map` block):
```tsx
{TERM_TABS.map(t => (
  <div
    key={t}
    className={cn(styles.termTab, { [styles.active]: tab === t })}
    onClick={() => setTab(t)}
    role="button"
    tabIndex={0}
    aria-pressed={tab === t}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTab(t); } }}
  >
    {t}
    {t === 'PROBLEMS' && <span className={styles.termTabBadge}>0</span>}
    {t === 'DEBUG CONSOLE' && running && <span className={styles.termTabDot} />}
  </div>
))}
```
Add the subtitle inline when `t === 'TERMINAL'`, copying the conditional render pattern already used for `PROBLEMS` and `DEBUG CONSOLE`:
```tsx
{t}
{t === 'TERMINAL' && (
  <>
    <span aria-hidden="true"> · </span>
    <span className={styles.paneSubtitle}>Test output</span>
  </>
)}
{t === 'PROBLEMS' && <span className={styles.termTabBadge}>0</span>}
{t === 'DEBUG CONSOLE' && running && <span className={styles.termTabDot} />}
```

---

### `src/components/ide/Terminal.module.css` (CSS)

**Existing log class** (lines 130–135):
```css
.log {
  display: block;
  padding: 1px 0;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  animation: logIn 0.2s ease-out;
}
```

**Existing `.termResizer`** (lines 13–21):
```css
.termResizer {
  position: absolute;
  top: -3px;
  left: 0;
  right: 0;
  height: 6px;
  cursor: ns-resize;
  z-index: 5;
}
```

**Existing `.terminal`** (lines 3–11):
```css
.terminal {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-deepest);
  border-top: 1px solid var(--border);
  position: relative;
  min-height: 120px;
}
```

Add a new `@media (max-width: 768px)` block at the bottom of the file:
```css
@media (max-width: 768px) {
  .log {
    white-space: pre-wrap;
    word-break: break-word;
  }
  .termResizer {
    display: none;
  }
  .terminal {
    max-height: 180px;
  }
}
```
Plus new `.paneSubtitle` class (same definition as in Sidebar.module.css — collocated per the UI-SPEC preference):
```css
.paneSubtitle {
  font-size: 10.5px;
  font-weight: 400;
  color: var(--text-faint);
  letter-spacing: 0.02em;
  font-family: var(--ui);
  margin-left: 4px;
}
```

**Important:** `.logTag.pass` and `.logTag.fail` spans (lines 174–184) are inline children of `.log`. `white-space: pre-wrap` on the `.log` parent allows line wrapping between tokens but the `[PASS]` / `[FAIL]` tag text inside `.logTag` spans will remain intact as inline elements. No change to `.logTag` is needed.

---

### `src/components/ide/FileView.module.css` (CSS only)

**Existing `.minimap`** (lines 72–82):
```css
.minimap {
  width: 70px;
  padding: 16px 8px;
  background: var(--bg-elevated);
  border-left: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
  overflow: hidden;
}
```

**Existing `.editorInner`** (lines 3–10):
```css
.editorInner {
  flex: 1;
  display: flex;
  min-height: 0;
  background: var(--bg-elevated);
  position: relative;
  overflow: hidden;
}
```

**Existing `.code`** (lines 36–47 — already has `overflow: auto; white-space: pre`):
```css
.code {
  flex: 1;
  margin: 0;
  padding: 16px 24px;
  font-family: var(--mono);
  font-size: 13px;
  line-height: 1.65;
  color: var(--text);
  overflow: auto;
  white-space: pre;
  tab-size: 2;
  min-width: 0;
}
```
D-07 (horizontal scroll) is already satisfied: `.code` has `overflow: auto` and `white-space: pre`. The only remaining action is to confirm `.editorInner`'s `overflow: hidden` does not clip the `.code` scrollbar — and to hide the minimap. Add one `@media` block:
```css
@media (max-width: 768px) {
  .minimap {
    display: none;
  }
}
```
If testing shows the `.code` scrollbar is clipped by `.editorInner`'s `overflow: hidden`, also add inside the same block:
```css
  .editorInner {
    overflow: visible;
  }
```

---

### `src/components/ide/EditorArea.tsx` (JSX only)

**Existing breadcrumb render** (lines 92–99):
```tsx
<div className={styles.breadcrumb}>
  {breadcrumb.split(' › ').map((part, i, arr) => (
    <span key={i}>
      <span className={cn(styles.crumb, { [styles.crumbActive]: i === arr.length - 1 })}>{part}</span>
      {i < arr.length - 1 && <span className={styles.crumbSep}> › </span>}
    </span>
  ))}
</div>
```
Add pane subtitle after the breadcrumb loop (trailing right side via `margin-left: auto`):
```tsx
<div className={styles.breadcrumb}>
  {breadcrumb.split(' › ').map((part, i, arr) => (
    <span key={i}>
      <span className={cn(styles.crumb, { [styles.crumbActive]: i === arr.length - 1 })}>{part}</span>
      {i < arr.length - 1 && <span className={styles.crumbSep}> › </span>}
    </span>
  ))}
  <span aria-hidden="true" className={styles.crumbSubtitleSep}> · </span>
  <span className={styles.paneSubtitle}>Code viewer</span>
</div>
```
The breadcrumb bar already uses `display: flex; align-items: center; gap: 6px` (EditorArea.module.css lines 132–143), so the new spans flow naturally inline after the last crumb. No `margin-left: auto` is needed unless the subtitle should be pushed to the right edge — the UI-SPEC says "append to the breadcrumb `<div>` trailing right side using `margin-left: auto`" as an option; use `margin-left: auto` on the separator span if right-alignment is preferred.

---

### `src/components/ide/EditorArea.module.css` (CSS)

**Existing `.breadcrumb` block** (lines 131–143):
```css
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text-faint);
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-soft);
  flex-shrink: 0;
  height: 28px;
}
```

Add `.paneSubtitle` class (same definition, collocated):
```css
.paneSubtitle {
  font-size: 10.5px;
  font-weight: 400;
  color: var(--text-faint);
  letter-spacing: 0.02em;
  font-family: var(--ui);
  margin-left: 4px;
}

.crumbSubtitleSep {
  color: var(--text-faint);
  margin-left: auto;  /* pushes to right edge if right-alignment chosen */
}
```
If the subtitle should appear immediately after the last crumb (inline, not right-aligned), omit `margin-left: auto` from `.crumbSubtitleSep`.

---

### `src/components/ide/TopBar.module.css` (CSS)

**Existing `@media (max-width: 920px)` block** (lines 241–251 — the hide pattern to mirror):
```css
@media (max-width: 920px) {
  .logoText {
    display: none;
  }
  .branch {
    display: none;
  }
  .clock {
    display: none;
  }
}
```

**Existing `.menuBtn`** (lines 322–331 — already shown at ≤768px via `display: grid`):
```css
.menuBtn {
  display: none;
}

@media (max-width: 768px) {
  .menuBtn {
    display: grid;
    flex-shrink: 0;
  }
}
```

**Existing `.iconBtn`** (lines 296–318 — currently 34×34px):
```css
.iconBtn {
  width: 34px;
  height: 34px;
  /* ... */
}
```

**Existing `.runBtn`** (lines 334–351 — currently `padding: 9px 14px` ~38px tall):
```css
.runBtn {
  padding: 9px 14px 9px 12px;
  /* ... */
}
```

**Existing `.runShortcut`** (lines 405–417 — the `⌘↵` badge):
```css
.runShortcut {
  display: inline-flex;
  /* ... */
}
```

**Existing `.tabDivider`** (lines 81–84):
```css
.tabDivider {
  width: 1px;
  height: 24px;
  background: var(--border);
}
```

Add two new `@media` blocks following the existing breakpoint pattern:
```css
@media (max-width: 768px) {
  .menuBtn {
    width: 44px;
    height: 44px;
  }
  .iconBtn {
    width: 44px;
    height: 44px;
  }
  .runBtn {
    min-height: 44px;
  }
}

@media (max-width: 480px) {
  .tabDivider {
    display: none;
  }
  .runShortcut {
    display: none;
  }
}
```
Note: `.logoMark` hide at ≤480px is at Claude's discretion after visual evaluation. Pattern if needed: `@media (max-width: 480px) { .logoMark { display: none; } }`.

---

### `src/components/layout/SiteHeader.module.css` (CSS)

**Existing `@media (max-width: 480px)` block** (lines 65–70):
```css
@media (max-width: 480px) {
  .separator,
  .title {
    display: none;
  }
}
```

**Existing `.identity`** (lines 15–19):
```css
.identity {
  display: flex;
  align-items: center;
  gap: 0;
}
```

**Existing `.navLink`** (lines 44–51 — currently inline text, no explicit height):
```css
.navLink {
  font-family: var(--font-inter), var(--ui);
  font-size: 13px;
  font-weight: 500;
  color: var(--green);
  text-decoration: none;
  transition: color 0.15s ease, text-decoration-color 0.15s ease;
}
```

Add a new `@media (max-width: 768px)` block (insert before the existing `@media (max-width: 480px)` block):
```css
@media (max-width: 768px) {
  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .identity {
    flex: 1;
    min-width: 0;
  }
  nav {
    flex-shrink: 0;
  }
  .navLink {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 8px;
  }
}
```

---

### `src/app/about/about.module.css` (CSS)

**Existing `.pageWrapper`** (lines 9–13):
```css
.pageWrapper {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}
```

No existing `@media` blocks in this file. The pattern follows the same `@media (max-width: 768px)` convention used across all other module files in this codebase.

Add at the bottom of the file:
```css
@media (max-width: 768px) {
  .pageWrapper table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 480px) {
  .pageWrapper {
    padding-left: 16px;
    padding-right: 16px;
  }
}
```

---

## Shared Patterns

### SSR-Safe `window` Access
**Source:** `src/components/ide/IDEShell.tsx` lines 87–90
**Apply to:** Any new `useState` initializer that reads `window.innerWidth` (termHeight, isMobile)
```typescript
() => {
  if (typeof window === 'undefined') return <server_default>;
  return window.innerWidth <= 768 ? <mobile_value> : <desktop_value>;
}
```

### CSS Media Query Ordering Convention
**Source:** `src/components/ide/TopBar.module.css` lines 219–251
**Apply to:** All CSS module files receiving new `@media` blocks
- Breakpoints are declared in descending order: 1380px → 1200px → 1060px → 920px → 768px → 480px
- New blocks for 768px and 480px go at the bottom of existing media query sections
- Never split a breakpoint — all 768px rules go in one `@media (max-width: 768px)` block per file

### CSS Module Class Naming
**Source:** All existing `*.module.css` files
**Convention:** camelCase compound names — `explorerHeader`, `explorerMeta`, `treeFolder`, `termResizer`, `runShortcut`, `menuBtn`
**Apply to:** New classes: `paneSubtitle`, `crumbSubtitleSep`, `backdrop`

### `cn()` for Conditional Classes
**Source:** `src/components/ide/Sidebar.tsx` line 75, Terminal.tsx line 19
**Apply to:** Any new JSX that conditionally applies a CSS Module class
```typescript
import { cn } from '@/lib/utils';
className={cn(styles.base, { [styles.modifier]: condition })}
```

### `aria-hidden="true"` on Decorative Elements
**Source:** `src/components/ide/EditorArea.tsx` line 75 (`tabIcon`), WCAG AA requirement in UI-SPEC
**Apply to:** The `·` separator spans for pane subtitles, the backdrop div
```tsx
<span aria-hidden="true"> · </span>
```

### Optional Prop with `?.()` Call
**Source:** `src/components/ide/Sidebar.tsx` line 79 (existing `onKeyDown` pattern)
**Apply to:** `onSelect?.()` call in `fileRow`
```typescript
onSelect?.()  // safe call — no-op if prop is undefined (desktop case)
```

### Focus-Visible Outline
**Source:** `src/components/ide/Sidebar.module.css` lines 89–93, TopBar.module.css lines 315–319
**Apply to:** No new interactive elements added in this phase — existing focus styles remain unchanged
```css
:focus-visible {
  outline: 2px solid #79b8ff;
  outline-offset: 2px;
  border-radius: <match_element_radius>;
}
```

---

## No Analog Found

All files are existing codebase files being modified. No new files are created in this phase. No "no analog" entries apply.

---

## Metadata

**Analog search scope:** `src/components/ide/`, `src/components/layout/`, `src/app/about/`
**Files read:** 12
**Pattern extraction date:** 2026-05-24
