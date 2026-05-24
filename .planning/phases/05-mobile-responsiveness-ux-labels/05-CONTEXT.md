# Phase 5: Mobile Responsiveness & UX Labels - Context

**Gathered:** 2026-05-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the IDE-style portfolio fully usable on any device and self-explanatory to non-technical visitors. Six specific outcomes:

1. Mobile sidebar opens/closes with touch, auto-closes after file tap, has a dismissible backdrop (MOB-01)
2. Editor code scrolls horizontally rather than overflowing on small screens (MOB-02)
3. Terminal log text wraps and is readable on narrow viewports (MOB-03)
4. Header nav links remain reachable and tappable on all screen sizes (MOB-04)
5. About/resume page is fully scrollable and readable on a phone (MOB-05)
6. Each IDE pane has a persistent plain-language label so non-technical visitors understand the layout without prior developer knowledge (UX-01)

No new features, no content changes, no AI tools — purely layout, CSS, and inline labeling work.

</domain>

<decisions>
## Implementation Decisions

### Sidebar Mobile UX (MOB-01)

- **D-01:** Auto-close on file tap — after a visitor selects a file in the mobile sidebar, the sidebar closes automatically to reveal the editor. Implementation: pass `onToggleSidebar` down to `Sidebar` as a new `onSelect` callback; `fileRow`'s `onClick` / `onKeyDown` calls `onSelect()` which triggers `toggleSidebar` conditionally (only when in mobile overlay mode, i.e., `window.innerWidth <= 768`). Alternatively, pass `isMobileOverlay` boolean from IDEShell.
- **D-02:** Dark backdrop behind open sidebar on mobile — when the sidebar is open in overlay mode, a semi-transparent backdrop div renders over the main content. Tapping the backdrop calls `toggleSidebar` to close. Backdrop: `z-index: 49` (sidebar is `z-index: 50`), `background: rgba(0,0,0,0.5)`, positioned absolute/fixed over `.ideBody`. Only renders when `sidebarOpen && isMobile`.
- **D-03:** Full sidebar kept on mobile — activity bar (48px icon strip) + explorer panel (184px) stay intact as a single 232px overlay. No structural changes to `Sidebar.tsx`.

### Terminal on Mobile (MOB-03)

- **D-04:** Shorter default terminal height on mobile — initialize `termHeight` to `120` (not `220`) when `window.innerWidth <= 768`. Approach: in IDEShell's `useState` initializer, read `window.innerWidth` (same pattern already used for `sidebarOpen`). CSS `@media (max-width: 768px)` can also clamp max-height as a safety net.
- **D-05:** Hide drag-resize handle on mobile via CSS — `@media (max-width: 768px) { .resizer { display: none; } }` in `Terminal.module.css`. Terminal stays at the fixed mobile height with no resize UI.
- **D-06:** Wrap terminal log text — log entries get `white-space: pre-wrap` and `word-break: break-word` so long lines wrap within the terminal width instead of causing horizontal overflow.

### Editor Code Overflow (MOB-02)

- **D-07:** Horizontal scroll for code content — the code rendering container in `FileView.tsx` (the element wrapping the syntax-highlighted token spans) must have `overflow-x: auto` and `white-space: pre`. Tokens are rendered inline; without `overflow-x: auto` on the container, long lines push the page width. Only the code area scrolls horizontally — the surrounding layout does not.
- **D-08:** Tab bar unchanged — `EditorArea.module.css` already has `overflow-x: auto` on `.tabbar` with `white-space: nowrap`. No change needed.

### UX Pane Labels (UX-01)

- **D-09:** Persistent plain-language subtitles inline in each pane header — always visible, no interaction required, no hover needed. Non-technical visitors see the purpose immediately.
- **D-10:** Label text and placement:
  - Sidebar EXPLORER header: `EXPLORER  ·  File browser` (muted `·` separator after "EXPLORER")
  - Editor pane header (breadcrumb bar or tab bar area): `·  Code viewer` (or append to existing editor title)
  - Terminal header: `TERMINAL  ·  Test output` (inline with the existing tab label)
- **D-11:** Visual style — label suffix uses the same muted color class as `explorerMeta` in Sidebar (or a new `.paneSubtitle` class). Font size 11px, color `var(--text-faint)`. Inline, not a new row.

### Claude's Discretion

- **SiteHeader title on mobile:** Phase 4 added "Senior SDET / QA Automation Engineer". Existing `@media (max-width: 480px)` already hides `.title` and `.separator`, so only "Ruslan Kanatbek" shows on very narrow screens. In the 481px–768px range, the full title renders. If it overflows at mid-widths, Claude should add `overflow: hidden; text-overflow: ellipsis` or allow the header to wrap gracefully — whichever fits better after visual inspection.
- **About page mobile:** The MDX resume likely contains tables (skills, experience). Wrap the MDX content container with `overflow-x: auto` on any table containers to prevent horizontal page overflow on small screens. Test the About page at 375px.
- **TopBar crowding:** TopBar has 6-7 elements at narrow widths (hamburger, branch label, Run Smoke Test button, CI badge, coverage/tests static labels, theme toggle). At ≤375px some elements may overlap. Claude should hide purely decorative items (branch label, static coverage/tests badges) below ~480px using CSS, keeping hamburger, Run Smoke Test, CI badge, and theme toggle always visible.
- **Backdrop render gate:** Only render the backdrop component when `window.innerWidth <= 768`. Use the same `window.innerWidth` check pattern already in IDEShell (SSR-safe: check inside `useEffect` or `useState` initializer with `typeof window !== 'undefined'` guard).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` — MOB-01 through MOB-05, UX-01 definitions
- `.planning/ROADMAP.md` §Phase 5 — success criteria (6 items)

### Key Source Files to Modify
- `src/components/ide/IDEShell.tsx` — main layout, `sidebarOpen` state, backdrop render logic, `termHeight` initializer
- `src/components/ide/IDEShell.module.css` — backdrop CSS, mobile layout overrides
- `src/components/ide/Sidebar.tsx` — file row click handler (auto-close), `onSelect` prop
- `src/components/ide/Sidebar.module.css` — no structural changes expected, verify overlay z-index
- `src/components/ide/Terminal.tsx` — no code changes expected
- `src/components/ide/Terminal.module.css` — `white-space: pre-wrap` for log entries, hide resizer on mobile
- `src/components/ide/FileView.tsx` — `overflow-x: auto` + `white-space: pre` on code container
- `src/components/ide/EditorArea.module.css` — verify editor pane label placement
- `src/components/ide/TopBar.tsx` — hide decorative elements on narrow viewports (TopBar.module.css)
- `src/components/layout/SiteHeader.module.css` — title overflow at 481px–768px
- `src/app/about/about.module.css` — overflow treatment for MDX tables

### Prior Phase Context (Carry-forwards)
- `.planning/phases/04-tech-debt-sweep/04-CONTEXT.md` §Deferred — SiteHeader title responsive handling explicitly deferred from Phase 4 to here

### Existing Mobile Scaffolding (Already Working — Do NOT Break)
- `src/components/ide/Sidebar.module.css` `@media (max-width: 768px)` block — overlay/slide-out already live (SHELL-05)
- `src/components/ide/IDEShell.tsx` lines 86-90 — sidebar starts closed on narrow viewports
- `src/components/layout/SiteHeader.module.css` `@media (max-width: 480px)` — title hidden at very narrow widths

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `styles.explorerMeta` in `Sidebar.module.css` — existing muted text style (used for "ruslankanat/portfolio" label). The new pane subtitle style should mirror this class.
- `IDEShell`'s `sidebarOpen` / `setSidebarOpen` / `toggleSidebar` — already wired through to `Sidebar` and `TopBar`. The backdrop just needs to consume the same `sidebarOpen` state and call the same `toggleSidebar`.
- `termHeight` / `setTermHeight` state in `IDEShell` — already used for drag resize. Mobile init of 120 replaces the `220` literal in the `useState` call.

### Established Patterns
- SSR-safe `window.innerWidth` checks use `typeof window === 'undefined'` guard (see IDEShell line 88: `if (typeof window === 'undefined') return true`). Follow the same pattern for the backdrop render gate and the `termHeight` initializer.
- `cn()` utility from `@/lib/utils` used throughout for conditional class names — use it for backdrop visibility toggling.
- All IDE components use CSS Modules (`*.module.css`) — add all new mobile styles to the relevant module file, not global CSS.

### Integration Points
- `Sidebar.tsx` needs a new optional prop (e.g., `onSelect?: () => void`) that `fileRow` calls after `setActiveFile` + `openTab`. IDEShell passes `toggleSidebar` conditionally (only on mobile). This avoids breaking the desktop behavior where the sidebar should NOT close on file click.
- Backdrop div in `IDEShell`'s JSX — render between `<Sidebar>` and `<div className={styles.main}>`. Needs a z-index between the sidebar (50) and the main content (1).

</code_context>

<specifics>
## Specific Ideas

- The "auto-close on mobile only" distinction is important: on desktop, clicking a file should NOT close the sidebar (it collapses, not overlays). IDEShell should pass `onSelect` only when in mobile mode, or pass a no-op on desktop.
- The `·` separator for pane labels should use `aria-hidden="true"` to avoid screen readers reading the bullet point as content.
- Terminal's `pre-wrap` fix should only apply to log text content, not to the tag spans like `[PASS]` / `[FAIL]` which already have specific styles — check that wrapping doesn't break those styled spans.

</specifics>

<deferred>
## Deferred Ideas

- Touch-drag resize for terminal (touchstart/touchmove/touchend on resizer) — deferred; hiding the handle is sufficient for v1.1.
- Tab limiting on mobile (replace-not-add) — deferred; horizontal tab scrolling already works.
- Persistent intro banner explaining "this is a real IDE showing real tests" — noted as a potential v1.2 addition if analytics show bounce rate on mobile.

</deferred>

---

*Phase: 5-mobile-responsiveness-ux-labels*
*Context gathered: 2026-05-24*
