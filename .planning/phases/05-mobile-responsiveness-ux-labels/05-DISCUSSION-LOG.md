# Phase 5: Mobile Responsiveness & UX Labels - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-24
**Phase:** 5-mobile-responsiveness-ux-labels
**Areas discussed:** Sidebar mobile UX, Terminal on mobile, Editor code overflow, UX pane labels

---

## Sidebar Mobile UX

### File tap behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-close on file tap | Sidebar closes after selecting a file — editor revealed immediately. Natural mobile drawer pattern. | ✓ |
| Stay open after file tap | Sidebar stays open, user must tap hamburger again to dismiss. | |
| You decide | Claude picks standard mobile drawer pattern. | |

**User's choice:** Auto-close on file tap

---

### Backdrop behind sidebar

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — add a backdrop | Dark overlay covers editor when sidebar is open. Tap to close. Standard mobile drawer UX. | ✓ |
| No backdrop | Sidebar slides in with no backdrop. Hamburger is the only dismiss trigger. | |
| You decide | Claude adds backdrop (standard pattern). | |

**User's choice:** Yes — add a backdrop

---

### Activity bar on mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Keep the activity bar | Full sidebar (activity bar + explorer) slides in as one unit. Keeps IDE metaphor intact. | ✓ |
| Hide activity bar on mobile | Only explorer panel slides in. Saves 48px, more room for file names. | |
| You decide | Claude keeps full sidebar — IDE metaphor is the point. | |

**User's choice:** Keep the activity bar

---

## Terminal on Mobile

### Default terminal height

| Option | Description | Selected |
|--------|-------------|----------|
| Shorter fixed height ~120px | Override on ≤768px viewports. Shows 4-5 log lines, leaves ~200px for editor. | ✓ |
| Collapse to header only | Terminal shows only title bar (~32px), tap to expand. Maximum editor space. | |
| Keep 220px | Consistent with desktop, but editor is very tight on mobile. | |

**User's choice:** Shorter fixed height ~120px

---

### Drag handle on mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Hide the drag handle on mobile | CSS `display: none` on resizer below 768px. Clean, no non-functional UI. | ✓ |
| Keep handle, add touch events | Wire touchstart/touchmove/touchend for mobile drag. More complex. | |
| You decide | Claude hides handle on mobile. | |

**User's choice:** Hide the drag handle on mobile

---

### Log text overflow

| Option | Description | Selected |
|--------|-------------|----------|
| Wrap log text | `white-space: pre-wrap` for log entries. Readable without horizontal scrolling. | ✓ |
| Horizontal scroll for logs | `overflow-x: auto` on terminal body. Preserves single-line format, requires horizontal swiping. | |
| You decide | Claude wraps log text. | |

**User's choice:** Wrap log text

---

## Editor Code Overflow

### Code line overflow handling

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal scroll | `overflow-x: auto` on code container. Lines stay on one line, preserves formatting and syntax highlighting. | ✓ |
| Soft-wrap at viewport edge | `white-space: pre-wrap`. Easier to read, but wrapping mid-token looks odd. | |
| You decide | Claude uses horizontal scroll — preserves code fidelity. | |

**User's choice:** Horizontal scroll

---

### Tab bar behavior

| Option | Description | Selected |
|--------|-------------|----------|
| No limit — tabs scroll horizontally | Current behavior. Works fine on mobile, no code change needed. | ✓ |
| Limit to 1 tab on mobile | Replace rather than add on narrow viewports. Prevents clutter but loses multi-tab metaphor. | |
| You decide | Claude keeps unlimited tabs with horizontal scroll. | |

**User's choice:** No limit — tabs scroll horizontally

---

## UX Pane Labels

### Non-technical visitor orientation

| Option | Description | Selected |
|--------|-------------|----------|
| Persistent plain-language subtitles in pane headers | Always visible inline subtitles: "File browser", "Code viewer", "Test output". | ✓ |
| Tooltip-only on hover | `title` attributes. Invisible on mobile, requires discovery. | |
| Intro banner at top of IDE | Dismissible one-liner explaining the layout. Persistent until dismissed. | |

**User's choice:** Persistent plain-language subtitles in pane headers

---

### Label tone

| Option | Description | Selected |
|--------|-------------|----------|
| Functional: "File browser" / "Code viewer" / "Test output" | Straightforward and descriptive. | ✓ |
| Descriptive: "Test files" / "Source code" / "CI run output" | More specific to actual content. | |
| You decide | Claude picks "Test files" / "Source code" / "Run output". | |

**User's choice:** Functional labels ("File browser" / "Code viewer" / "Test output")

---

### Subtitle placement

| Option | Description | Selected |
|--------|-------------|----------|
| Inline in existing pane header next to panel name | e.g., "EXPLORER  ·  File browser". Same header bar, muted color separator. | ✓ |
| Below the pane header as a separate line | Second line under title bar. More prominent, uses 6-8px vertical space. | |
| You decide | Claude puts it inline — least intrusive. | |

**User's choice:** Inline in existing pane header

---

## Claude's Discretion

- SiteHeader title overflow at 481px–768px — handle via `overflow: hidden; text-overflow: ellipsis` or graceful wrap
- About page MDX tables — add `overflow-x: auto` wrapper
- TopBar crowding at ≤375px — hide decorative elements (branch label, static coverage/tests badges)
- Backdrop render gate — SSR-safe `typeof window !== 'undefined'` guard

## Deferred Ideas

- Touch-drag resize for terminal — deferred; hide handle is sufficient for v1.1
- Tab limiting on mobile (replace not add) — deferred; horizontal scroll already works
- Persistent intro banner explaining the IDE concept — potential v1.2 addition
