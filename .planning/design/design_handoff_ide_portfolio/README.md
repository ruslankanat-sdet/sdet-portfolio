# Handoff: IDE Portfolio — Alex Morgan (SDET & AI Automation Engineer)

## Overview
A personal portfolio site styled as a code editor / IDE. The visitor "explores" the candidate's bio, projects, skills, and writing the same way they'd browse a real codebase: file tree on the left, syntax-highlighted "code" content in the editor, a fake terminal that runs a "smoke test suite" against the candidate's experience, and a floating AI assistant that answers questions about them.

Target audience: hiring managers and engineering leads who'll appreciate a developer-native interface. The whole thing is interactive but content-driven — no real code execution, just thematically-presented portfolio content.

## About the Design Files
The files in this bundle are **design references created in HTML/JSX (via Babel-in-browser)** — a high-fidelity prototype showing intended look and behavior, not production code to ship as-is.

Your task: **recreate this design in a real codebase**. If a target codebase already exists, use its conventions and component library. Otherwise, the recommended stack is:

- **Next.js (App Router) + TypeScript** for routing + SSR + good Lighthouse scores
- **CSS Modules or vanilla CSS with custom properties** — the existing `styles.css` is well-structured around CSS variables and ports cleanly; do not reach for Tailwind unless the user requests it
- **Lucide React** for icons (the inline SVGs in the prototype are Lucide-style; swap to the real package)
- **No state library** — local React state is sufficient; persist theme to `localStorage`

Build it as a static-export-friendly site so it can deploy to Vercel/Netlify/Cloudflare Pages.

## Fidelity
**High-fidelity.** Pixel-perfect mock with final colors, typography, spacing, animations, and interactions. The CSS variables, type ramp, and component sizing in `styles.css` are the source of truth — port the values exactly. The JSX files show the intended component decomposition; mirror it.

## Screens / Views

This is a **single-page application** with one primary view (the IDE shell). Different "screens" are different files opened in the editor pane.

### 1. IDE Shell (root layout)

**Purpose:** Persistent chrome around the editor area. Always visible.

**Layout (top to bottom):**
- `.topbar` — fixed 56px tall, full width
- `.ide-body` — flex row, fills remaining vertical space
  - `.sidebar` — 232px wide, left
  - `.main` — flex column, fills remaining horizontal space
    - `.editor-wrap` — flex column, fills available height
      - `.tabbar` — 36px tall row of open file tabs
      - `.breadcrumb` — ~28px tall path display
      - `.editor` — code area + minimap, fills remaining height
    - `.terminal` — resizable bottom panel, default 220px, min 120px
- `.statusbar` — fixed 26px tall, bottom

**Body is `overflow: hidden`; the only scrolling is inside the editor, terminal, and file tree.**

### 2. Top Bar (`.topbar`)

**Components, left to right:**
- **Logo mark** — 34×34 rounded square (`8px` radius), green-tinted background `var(--green-soft)`, contains a terminal/code glyph in `var(--green)`.
- **Logo text** — two lines:
  - `alex.morgan` — JetBrains Mono, 13px, weight 600
  - `SDET · AI Automation` — JetBrains Mono, 10px, `var(--text-faint)`, letter-spacing `0.04em`
- **Vertical divider** — 1px × 24px in `var(--border)`
- **Branch indicator** — git-branch icon + `main` + meta text `· up to date`. Styled like `.branch` in CSS.
- **Status rail** (`.status-rail`) — centered, flex row of pill badges (`.badge`). Each badge has:
  - Colored dot (7×7, glowing)
  - Label (muted) · separator · value (bright)
  - Tones: `tone-green` (pulsing dot), `tone-amber`, `tone-blue`, `tone-ghost`
  - Suggested badges: `CI ● passing`, `Coverage ● 94%`, `Tests ● 312`, `Status ● available`
  - Responsive: badges `.badge-rail-3`, `.badge-rail-2`, `.badge-rail-1` hide at 1380/1200/1060px respectively
- **Clock** (`.clock`) — live time HH:MM + timezone label, monospace
- **Theme toggle** (`.icon-btn`) — 34×34, sun/moon icon, toggles `data-theme` on `<html>`, persists to `localStorage` key `portfolio-theme`
- **Run button** (`.run-btn`) — green, prominent. Label: `Run smoke tests` + kbd `⌘↵`. Pulses while running. Triggers the terminal log animation.

### 3. Sidebar (`.sidebar`)

**Two columns:**

**Activity bar** (`.activity-bar`) — 48px wide, dark background:
- Vertical stack of 36×36 icon buttons (`.act-btn`)
- Active button gets a 2px green vertical bar on its left with a glow
- Icons (top group): Explorer (active), Search, Source Control, Run/Debug, Extensions
- Icons (bottom group, with `margin-top: auto`): Profile, Settings

**Explorer** (`.explorer`) — fills remaining width:
- Header: `EXPLORER` (uppercase, 10.5px, letter-spacing `0.08em`) + meta `alex-morgan/portfolio`
- File tree (`.tree`) — folder/file rows with chevron, icon, label
  - Folders use `.tree-folder`, files use `.tree-row`
  - Active file gets green gradient highlight + 2px inset-left green border
  - Some rows have a small numeric badge (e.g. open PRs)
- Suggested tree structure:
  ```
  📁 about/
     bio.json              ← active by default
     experience.yaml
     skills.toml
  📁 projects/
     ai-test-orchestrator.md
     llm-eval-harness.md
     selfhealing-e2e.md
  📁 testing/
     test_suites.py
     coverage_report.json
  📁 writing/
     ai_architectures.md
     why-i-test-llms.md
  📄 README.md
  📄 contact.json
  ```
- **Outline** (`.outline`) at bottom — shows symbols in current file, monospace, with colored dot prefix matching syntax token type

### 4. Editor (`.editor`)

**Components:**
- **Tab bar** (`.tabbar`) — open files. Active tab has 2px green top border + lighter background. Each tab: icon + filename + close (×) button (close shows on hover/active).
- **Breadcrumb** (`.breadcrumb`) — path segments separated by `›`, e.g. `alex-morgan › about › bio.json`
- **Gutter** (`.gutter`) — line numbers, monospace, right-aligned, current line highlighted brighter
- **Code area** (`.code`) — monospace, syntax-highlighted via token classes:
  - `.tk-key` (keys/identifiers, blue)
  - `.tk-str` (strings, yellow-green)
  - `.tk-num` (numbers, orange)
  - `.tk-kw` (keywords, pink, italic)
  - `.tk-cmt` (comments, gray, italic)
  - `.tk-fn` (function names, purple)
  - `.tk-type` (types, orange)
  - `.tk-dec` (decorators, red)
  - Markdown-specific: `.tk-md-h`, `.tk-md-quote`, `.tk-md-table`, `.tk-md-em`, `.tk-md-b`, `.tk-md-code`
- **Minimap** (`.minimap`) — 70px wide, right side. Tiny colored bars (3px tall) representing the document. Decorative only.

**Content per file** — see `files.js` for the data model and example payloads. Each file should be authored as portfolio content but visually structured as that file's format (JSON, YAML, Python, Markdown, TOML).

### 5. Terminal (`.terminal`)

**Resizable** via top edge drag handle (`.term-resizer`).

**Tab strip** (`.term-tabs`):
- `TERMINAL` (active by default)
- `PROBLEMS` + numeric badge
- `OUTPUT`
- `DEBUG CONSOLE` + pulsing dot when active
- Right-aligned meta: `pytest -q · 312 passed, 0 failed · 4.21s`

**Body** (`.term-body`):
- Animated log lines (`.log`) — fade-in from left
- Variants: `.log-info`, `.log-warn`, `.log-ok`, `.log-fail`
- Pass/fail tags glow (`text-shadow` colored)
- Terminal cursor at bottom with prompt: `alex@portfolio` + `:~` + `pytest` + blinking block cursor

**Behavior:**
- Clicking **Run smoke tests** in the top bar clears logs and streams in entries from `SAMPLE_LOGS` (in `files.js`) with 280–540ms jitter between each
- `⌘↵` / `Ctrl+↵` keyboard shortcut triggers the same action
- Status flag `running` makes the Run button pulse

### 6. AI Chat Widget (`.ai-widget`)

**Floating bottom-right**, `position: fixed; right: 22px; bottom: 44px`.

**Collapsed state** — circular FAB (`.ai-fab`), 52×52, green-glowing border, AI sparkle icon. Soft outer glow via `.ai-fab-glow`.

**Expanded state** — `.ai-panel`, 380×520 (max 80vh), glassmorphic panel:
- Header: 36×36 avatar with green gradient + status dot, name `Ask about Alex`, sub `AI · trained on resume`, close button
- Body: chat bubbles — AI messages on left, user on right. Animated entry. Typing indicator with three pulsing dots.
- Quick-reply chips: `What's your strongest stack?`, `Show me a recent project`, `Are you available?`, `Open to remote?`
- Input row: text field + green send button

**Behavior:**
- Quick-reply chips populate the input and send on click
- Hook the input to `window.claude.complete({ messages })` if available — system prompt should be "You are an assistant that answers questions about Alex Morgan based on this resume content: [embed bio/experience/projects as context]"
- Fall back to canned responses keyed off the quick-reply text if the helper isn't available

### 7. Status Strip (`.statusbar`)

Bottom bar, 26px tall, monospace 11px. Items separated by hover background:

**Left side (`.sb-l`):**
- ⎇ `main` (branch)
- ⊘ `0` (problems) · ⚠ `2` (warnings)
- ↻ `Sync`
- `Ln 24, Col 16` (active editor cursor — can be static)

**Right side (`.sb-r`):**
- `Spaces: 2`
- `UTF-8`
- `LF`
- `{} JSON` (current file language — pull from active file's extension)
- ⓘ `Available for hire` (green text — call to action)
- 🔔 (notification bell)

## Interactions & Behavior

- **Theme toggle** — switches `<html data-theme="dark|light">`. CSS variables flip. Persist to `localStorage["portfolio-theme"]`.
- **File tree click** — opens file as tab (adds to tabs if not present), sets as active
- **Tab click** — sets active file
- **Tab close (×)** — removes from tabs; if was active, falls back to last remaining tab
- **Run smoke tests** — clears terminal, animates log entries in over ~3 seconds, sets terminal tab to TERMINAL, sets Run button to running state
- **⌘↵ / Ctrl+↵** — global shortcut for Run smoke tests
- **AI widget FAB click** — expands panel with `panel-in` keyframe (scale + translate + fade, 220ms cubic-bezier)
- **Quick reply click** — fills input, optionally auto-sends
- **Send message** — appends user bubble, shows typing indicator, then AI response

**Animations** (all defined in `styles.css`):
- `pulse-dot` — 1.8s breath on green status dots
- `log-in` — 200ms slide+fade for new log lines
- `msg-in` — 250ms slide+fade for chat messages
- `panel-in` — 220ms cubic-bezier(.2,.9,.3,1.1) for AI panel open
- `btn-pulse` — 1.2s loop on Run button while running
- `typ` — 1.2s typing-indicator dots
- `blink` — 1s terminal cursor blink

**Responsive breakpoints** (in `styles.css`):
- ≤1380px: hide `.badge-rail-3`
- ≤1200px: hide `.badge-rail-2`
- ≤1060px: hide `.badge-rail-1`, clock timezone, branch meta
- ≤920px: hide logo text, branch indicator, clock entirely

For mobile (< 720px) the prototype was not designed. Recommend: collapse sidebar to icon-only activity bar, hide minimap, hide terminal by default with a toggle, AI widget remains accessible.

## State Management

Local React state in the root component (`App`):
- `activeFile: string`
- `tabs: string[]`
- `termHeight: number` (px)
- `termTab: 'TERMINAL' | 'PROBLEMS' | 'OUTPUT' | 'DEBUG CONSOLE'`
- `running: boolean`
- `logs: LogEntry[]`
- `lastRun: string` (relative time label)
- `theme: 'dark' | 'light'` (persisted)

AI chat keeps its own local state for messages + open/closed + input value.

## Design Tokens

### Colors — Dark (default)
| Token | Value |
|---|---|
| `--bg-deepest` | `#06090e` |
| `--bg-deep` | `#0b1117` |
| `--bg-panel` | `#0f1620` |
| `--bg-elevated` | `#141c28` |
| `--bg-hover` | `#1a2433` |
| `--border` | `#1f2937` |
| `--border-soft` | `#182230` |
| `--border-strong` | `#2a3849` |
| `--text` | `#e6edf3` |
| `--text-muted` | `#8b96a8` |
| `--text-faint` | `#5a6678` |
| `--green` (brand) | `#3ddc84` |
| `--green-bright` | `#4dff95` |
| `--amber` | `#ffb547` |
| `--blue` | `#79b8ff` |
| `--pink` | `#ff7eb6` |
| `--red` | `#ff6b6b` |

### Colors — Light
GitHub-light flavored. Full set in `styles.css` under `:root[data-theme="light"]`.

### Typography
- UI font: **Inter** (400/500/600/700) — loaded from Google Fonts
- Mono font: **JetBrains Mono** (400/500/600) — loaded from Google Fonts
- Base body size: `13px`
- Scale used: 10px (sub-labels, badges), 10.5px (status/meta), 11px (statusbar), 11.5px (badges), 12px (tree, code-adjacent), 12.5px (chat, ui-medium), 13px (logo, base), 13.5px (chat header)

### Spacing
No formal scale; uses ad-hoc values. Common: 4, 6, 8, 10, 12, 14, 16, 18, 22, 24 px. Padding inside pills is `6px 11px 6px 9px`.

### Radius
- Buttons / pills: `5–8px`
- Cards / panels: `12–14px`
- FAB / dots: `50%`
- `--radius: 6px` default

### Shadows
- `--shadow-fab: 0 8px 24px rgba(0,0,0,0.4)`
- `--shadow-panel: 0 20px 60px rgba(0,0,0,0.6)`
- Green glow: `0 0 24px -8px var(--green-glow)` for accents

## Assets
- **Fonts:** Google Fonts — Inter, JetBrains Mono
- **Icons:** Inline SVGs in the JSX files, drawn Lucide-style (1.5–2px stroke, 24×24 viewBox). When porting, swap to the **lucide-react** package — every icon used has a Lucide equivalent (Terminal, GitBranch, Sun, Moon, Play, Files, Search, GitCommit, Bug, Package, User, Settings, ChevronRight, ChevronDown, X, Send, Sparkles, Bell, AlertCircle, Check).
- **No raster images.** No logo files. The "logo mark" is a CSS-styled box containing an icon glyph.

## Content / Copy

Real content the candidate (Alex Morgan) wants to express through this site — adapt freely but maintain the IDE metaphor. See `files.js` for current draft content and the sample test logs. Major themes:
- SDET background, Python/pytest expertise
- AI automation engineering — LLM eval harnesses, self-healing E2E, test orchestration
- Available for hire / open to remote
- Writing on AI architectures, testing methodology

## Files in This Bundle

- `Portfolio.html` — entry HTML (Babel-in-browser; **do not ship as-is** — port to real build pipeline)
- `styles.css` — **canonical source of truth for design tokens, layout, animations.** Port mostly verbatim, but split into per-component CSS modules.
- `app.jsx` — root component, state, keyboard shortcuts
- `sidebar.jsx` — activity bar + file tree + outline
- `workspace.jsx` — tab bar, breadcrumb, editor (gutter + code + minimap), terminal, top bar, status strip
- `syntax.jsx` — tokenizer / syntax highlighter for the code-display content
- `ai-chat.jsx` — floating AI widget (FAB + panel)
- `files.js` — content data: file tree structure, file contents per filename, `SAMPLE_LOGS` array

## Implementation Notes for Claude Code

1. **Don't try to render arbitrary JSON/YAML/Python/MD with a real parser+highlighter.** The prototype uses a hand-rolled tokenizer that's fast and theme-friendly. Either:
   - Port the existing tokenizer in `syntax.jsx` to TS, **or**
   - Pre-author each "file" as JSX with `<span class="tk-...">` tokens already in place (better for editability and zero runtime cost)
2. **The terminal animation is fake** — it just appends pre-baked log entries from a fixed array on a timer. Don't wire it to anything real.
3. **The AI chat** should call the host's existing AI endpoint if one exists, otherwise use a small canned-response map keyed off intent. Mention the candidate's name and stack in the system prompt.
4. **Theme persistence** uses `localStorage["portfolio-theme"]`. Default to system preference via `prefers-color-scheme` on first visit, then user override wins.
5. **Accessibility:** all icon-only buttons need `aria-label`. The activity bar should be a `<nav>`. The terminal log region should be `aria-live="polite"`. Tab close buttons need accessible names. The AI FAB needs `aria-expanded`.
6. **Performance:** the minimap is purely decorative — don't compute it from real document content; just render ~140 random-colored bars.
7. **Deploy target:** static export. Next.js `output: 'export'` or any SPA bundler works.
