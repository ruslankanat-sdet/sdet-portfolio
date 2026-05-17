# Phase 1: Foundations + Test Automator Live — Pattern Map

**Mapped:** 2026-05-16
**Files analyzed:** 22 new files (greenfield project — no existing src/)
**Analogs found:** 22 / 22 (all mapped to design handoff JSX analogs; infrastructure files noted separately)

---

## Greenfield Context

This is an entirely new project. There is no `src/` directory — only `CLAUDE.md` and `.planning/` exist in the working tree. All "analogs" are the design handoff JSX files in `.planning/design/design_handoff_ide_portfolio/`. Every pattern below is a **port instruction**: take the analog excerpt from the handoff file, apply the TypeScript/Next.js migration rules, and produce the target file.

---

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `src/app/layout.tsx` | layout | request-response | `app.jsx` lines 65–76 (App render tree) | role-match |
| `src/app/page.tsx` | page/route | request-response | `app.jsx` lines 65–76 (App renders IDEShell) | role-match |
| `src/app/globals.css` | config | — | `styles.css` (full file) | exact |
| `src/app/api/tools/test-automator/route.ts` | route-handler | streaming | RESEARCH.md Pattern 3 (no JSX analog — API-only) | no analog |
| `src/components/ide/IDEShell.tsx` | component | event-driven | `app.jsx` (full App function) | exact |
| `src/components/ide/IDEShell.module.css` | config | — | `styles.css` — `.ide-body`, `.main` selectors | exact |
| `src/components/ide/TopBar.tsx` | component | event-driven | `workspace.jsx` lines 44–92 (TopBar + StatusBadge) | exact |
| `src/components/ide/TopBar.module.css` | config | — | `styles.css` — `.topbar`, `.logo`, `.run-btn`, `.badge` | exact |
| `src/components/ide/Sidebar.tsx` | component | event-driven | `sidebar.jsx` lines 54–97 (Sidebar function) | exact |
| `src/components/ide/Sidebar.module.css` | config | — | `styles.css` — `.sidebar`, `.explorer`, `.tree`, `.activity-bar` | exact |
| `src/components/ide/EditorArea.tsx` | component | event-driven | `workspace.jsx` lines 4–41 (Editor function) | exact |
| `src/components/ide/EditorArea.module.css` | config | — | `styles.css` — `.editor-wrap`, `.tabbar`, `.tab`, `.editor`, `.breadcrumb` | exact |
| `src/components/ide/FileView.tsx` | component | transform | `workspace.jsx` lines 30–40 (gutter + pre/code) | exact |
| `src/components/ide/FileView.module.css` | config | — | `styles.css` — `.gutter`, `.ln`, `.code`, `.minimap` | exact |
| `src/components/ide/Terminal.tsx` | component | event-driven | `workspace.jsx` lines 113–168 (Terminal + LogRow) | exact |
| `src/components/ide/Terminal.module.css` | config | — | `styles.css` — `.terminal`, `.term-tabs`, `.term-body`, `.log-*` | exact |
| `src/components/ide/StatusBar.tsx` | component | request-response | `workspace.jsx` lines 171–185 (StatusStrip) | exact |
| `src/components/ide/StatusBar.module.css` | config | — | `styles.css` — `.statusbar`, `.sb-l`, `.sb-r`, `.sb-item` | exact |
| `src/components/ide/AIChat.tsx` | component | event-driven | `ai-chat.jsx` (full AIChat function) | exact |
| `src/components/ide/AIChat.module.css` | config | — | `styles.css` — `.ai-widget`, `.ai-panel`, `.ai-fab`, `.ai-bubble` | exact |
| `src/components/tools/TestAutomatorPane.tsx` | component | streaming | No JSX analog — new surface | no analog |
| `src/components/tools/TestAutomatorPane.module.css` | config | — | `styles.css` tokens only — new surface layout | partial |
| `src/lib/syntax-highlighter.ts` | utility | transform | `syntax.jsx` (full file — 173 lines) | exact |
| `src/lib/files-data.ts` | utility | — | `files.js` (full file) | exact |
| `src/lib/anthropic.ts` | utility | — | RESEARCH.md Pattern 5 (server-only singleton) | no analog |
| `src/lib/ratelimit.ts` | utility | — | RESEARCH.md Pattern 4 (Upstash setup) | no analog |
| `src/lib/schemas/test-automator.ts` | utility | — | RESEARCH.md Pattern 6 (Zod schema) | no analog |
| `src/types/ide.ts` | utility | — | Implied by `files.js` + `app.jsx` state model | role-match |
| `tests/unit/test-automator-schema.test.ts` | test | — | No analog | no analog |
| `tests/unit/syntax-highlighter.test.ts` | test | — | No analog | no analog |
| `tests/e2e/test-automator.spec.ts` | test | — | No analog | no analog |
| `.github/workflows/ci.yml` | config | — | RESEARCH.md CI grep pattern | no analog |

---

## Migration Rules (apply to every JSX → TSX port)

These rules apply universally. Do not repeat them per-file below — reference them here.

1. `const { useState: useSA, useEffect: useEA, useCallback: useCA } = React` → `import { useState, useEffect, useCallback, useRef } from 'react'`
2. `const h = React.createElement` / aliased `h(...)` → JSX (`<div className="...">`)
3. `window.FILES` → `import { FILES, TOOLS } from '@/lib/files-data'`
4. `window.tokenize` → `import { tokenize } from '@/lib/syntax-highlighter'`
5. `window.Sidebar = Sidebar` / `Object.assign(window, {...})` → named exports: `export function Sidebar(...)` / `export default function Sidebar(...)`
6. Inline SVG icons (`Icon.chevron`, `Icon.folder`, etc.) → Lucide React equivalents: `ChevronRight`, `Folder`, `FileJson2`, `FileCode2`, `FileText`, `Search`, `GitBranch`, `Play`, `X`, `Sparkles`, `Send`, `Bell`, `Sun`, `Moon`
7. Add `"use client"` at top of every component file that has `onClick`, `onChange`, `useState`, `useEffect`, or `useRef`
8. CSS class strings (`className: "tree-row" + (active ? " active" : "")`) → `clsx("tree-row", { active })` using the `cn()` helper
9. `localStorage` access → wrap in try/catch (already done in `app.jsx` lazy initializer — keep that pattern)
10. Prop types: declare explicit TypeScript interfaces above each function
11. Return type annotations: `React.ReactNode` on all components
12. No `any` type — use `unknown` + type guards or explicit union types

---

## Pattern Assignments

### `src/app/layout.tsx` (layout, request-response)

**Analog:** `app.jsx` lines 65–76 (the render tree structure) + RESEARCH.md Pattern 2

**Imports pattern:**
```typescript
import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
```

**Core pattern** — font loading + html wrapper:
```typescript
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Metadata pattern:**
```typescript
export const metadata: Metadata = {
  title: 'Ruslan Kanatbek — SDET AI Toolkit',
  description: 'Free AI-powered tools for SDET/QA engineers. Test code generation, test data synthesis, API test generation.',
};
```

---

### `src/app/page.tsx` (page/route, request-response)

**Analog:** `app.jsx` line 79 (`ReactDOM.createRoot(...).render(h(App))`)

**Core pattern** — thin page that renders the IDE shell:
```typescript
import { IDEShell } from '@/components/ide/IDEShell';

export default function Home() {
  return <IDEShell />;
}
```

**Note:** No `"use client"` here — page is a Server Component that delegates to the Client Component `IDEShell`.

---

### `src/app/globals.css` (config)

**Analog:** `.planning/design/design_handoff_ide_portfolio/styles.css` — port ALL `:root` custom properties exactly.

**Structure (port in this order):**
1. `@import "tailwindcss"` — Tailwind v4 single-line import (line 1)
2. `:root, :root[data-theme="dark"]` block — all `--bg-*`, `--border-*`, `--text-*`, `--green-*`, `--amber`, `--blue`, `--pink`, `--red`, `--syn-*`, `--hover`, `--surface`, `--surface-2`, `--glass-*`, `--mono`, `--ui`, `--radius`
3. Global resets: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`
4. `html, body { height: 100%; overflow: hidden; background: var(--bg-deepest); font-family: var(--ui); font-size: 13px; color: var(--text); }`
5. Root background gradient (radial-gradient with green and blue overlays)
6. Syntax token classes: `.tk-key`, `.tk-str`, `.tk-num`, `.tk-kw`, `.tk-cmt`, `.tk-punct`, `.tk-fn`, `.tk-type`, `.tk-dec`, `.tk-md-h`, `.tk-md-quote`, `.tk-md-table`, `.tk-md-em`, `.tk-md-b`, `.tk-md-code`
7. Keyframe animations: `pulse-dot`, `log-in`, `msg-in`, `panel-in`, `btn-pulse`, `typ`, `blink`

**Key token values (extract from RESEARCH.md Pattern 2 or styles.css directly):**
```css
:root, :root[data-theme="dark"] {
  --bg-deepest:   #06090e;
  --bg-deep:      #0b1117;
  --bg-panel:     #0f1620;
  --bg-elevated:  #141c28;
  --bg-tab:       #0b1117;
  --bg-tab-active: #141c28;
  --bg-hover:     #1a2433;
  --border:        #1f2937;
  --border-soft:   #182230;
  --border-strong: #2a3849;
  --text:          #e6edf3;
  --text-muted:    #8b96a8;
  --text-faint:    #5a6678;
  --green:         #3ddc84;
  --green-bright:  #4dff95;
  --green-rgb:     61, 220, 132;
  --green-glow:    rgba(61, 220, 132, 0.55);
  --green-soft:    rgba(61, 220, 132, 0.12);
  --amber:         #ffb547;
  --blue:          #79b8ff;
  --pink:          #ff7eb6;
  --red:           #ff6b6b;
  --syn-key:    #79b8ff;
  --syn-str:    #c9d178;
  --syn-num:    #ffab70;
  --syn-kw:     #ff7eb6;
  --syn-cmt:    #5a6678;
  --syn-punct:  #8b96a8;
  --syn-fn:     #d2a8ff;
  --syn-type:   #ffab70;
  --syn-dec:    #f97583;
  --mono: "JetBrains Mono", "Fira Code", "SF Mono", ui-monospace, Menlo, Consolas, monospace;
  --ui:   "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --radius: 6px;
}
```

**Do NOT use `@apply` in globals.css** — Tailwind v4 CSS Modules isolation breaks it. Use `var(--color-*)` directly.

---

### `src/components/ide/IDEShell.tsx` (component, event-driven)

**Analog:** `app.jsx` — full `App` function (lines 1–79)

**"use client"** — required (contains all useState, useEffect, useCallback, keyboard listener)

**Imports pattern:**
```typescript
"use client";
import { useState, useEffect, useCallback } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { EditorArea } from './EditorArea';
import { Terminal } from './Terminal';
import { StatusBar } from './StatusBar';
import { AIChat } from './AIChat';
import { SAMPLE_LOGS } from '@/lib/files-data';
import type { LogEntry, TabName } from '@/types/ide';
import styles from './IDEShell.module.css';
```

**State model** (direct port from `app.jsx` lines 4–13, typed):
```typescript
const [activeFile, setActiveFile] = useState<string>("README.md");  // D-04: README.md default
const [tabs, setTabs] = useState<string[]>(["README.md"]);
const [termHeight, setTermHeight] = useState<number>(220);
const [termTab, setTermTab] = useState<string>("TERMINAL");
const [running, setRunning] = useState<boolean>(false);
const [logs, setLogs] = useState<LogEntry[]>(SAMPLE_LOGS.slice(0, 8));
const [lastRun, setLastRun] = useState<string>("3m ago");
const [theme, setTheme] = useState<"dark" | "light">(() => {
  try { return (localStorage.getItem("portfolio-theme") as "dark" | "light") || "dark"; }
  catch { return "dark"; }
});
```

**Theme sync effect** (port from `app.jsx` lines 15–18):
```typescript
useEffect(() => {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("portfolio-theme", theme); } catch {}
}, [theme]);
```

**Tab management callbacks** (port from `app.jsx` lines 22–32):
```typescript
const openTab = useCallback((name: string) => {
  setTabs(t => t.includes(name) ? t : [...t, name]);
}, []);

const closeTab = useCallback((name: string) => {
  setTabs(t => {
    const next = t.filter(x => x !== name);
    if (activeFile === name && next.length) setActiveFile(next[next.length - 1]);
    return next;
  });
}, [activeFile]);
```

**Smoke test runner** (port from `app.jsx` lines 34–51, update prompt/host strings):
```typescript
const runSmoke = useCallback(() => {
  if (running) return;
  setRunning(true);
  setLogs([]);
  setTermTab("TERMINAL");
  let i = 0;
  const tick = () => {
    if (i >= SAMPLE_LOGS.length) {
      setRunning(false);
      setLastRun("just now");
      return;
    }
    setLogs(prev => [...prev, SAMPLE_LOGS[i]]);
    i++;
    setTimeout(tick, 280 + Math.random() * 260);  // jitter 280–540ms per UI-SPEC
  };
  setTimeout(tick, 300);
}, [running]);
```

**Keyboard shortcut effect** (port from `app.jsx` lines 53–63):
```typescript
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      runSmoke();
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [runSmoke]);
```

**Render structure** (port from `app.jsx` lines 65–77):
```typescript
return (
  <>
    <TopBar onRun={runSmoke} running={running} theme={theme} toggleTheme={toggleTheme} />
    <div className={styles.ideBody}>
      <Sidebar activeFile={activeFile} setActiveFile={setActiveFile} openTab={openTab} />
      <main className={styles.main}>
        <EditorArea tabs={tabs} activeFile={activeFile} setActiveFile={setActiveFile} closeTab={closeTab} />
        <Terminal logs={logs} running={running} height={termHeight} setHeight={setTermHeight} tab={termTab} setTab={setTermTab} />
      </main>
    </div>
    <StatusBar activeFile={activeFile} running={running} />
    <AIChat />
  </>
);
```

---

### `src/components/ide/TopBar.tsx` (component, event-driven)

**Analog:** `workspace.jsx` lines 44–92 (TopBar + StatusBadge functions)

**"use client"** — required (onClick handlers, disabled state)

**Props interface:**
```typescript
interface TopBarProps {
  onRun: () => void;
  running: boolean;
  theme: "dark" | "light";
  toggleTheme: () => void;
}
```

**StatusBadge sub-component** (port from `workspace.jsx` lines 85–92):
```typescript
interface StatusBadgeProps {
  tone: "green" | "blue";
  label: string;
  value: string;
  pulse?: boolean;
  hideAt?: string;  // CSS class name for responsive hiding
}
```

**Key content substitutions** (from UI-SPEC content section):
- `"alex.morgan"` → `"ruslan.kanatbek"` (logo-name)
- `"SDET · AI Automation"` (logo-sub, new — not in original)
- Badge labels: `"CI · Passing"`, `"Coverage · 98%"`, `"Tests · 312"`

**Run button pattern** (from `workspace.jsx` lines 72–82):
```typescript
<button
  className={cn(styles.runBtn, { [styles.running]: running })}
  onClick={onRun}
  disabled={running}
  aria-label={running ? "Running smoke test" : "Run smoke test"}
>
  <span className={styles.runGlow} />
  <Play size={11} />
  <span className={styles.runLabel}>{running ? "Running…" : "Run Smoke Test"}</span>
  {!running && <span className={styles.runShortcut}>⌘↵</span>}
</button>
```

---

### `src/components/ide/Sidebar.tsx` (component, event-driven)

**Analog:** `sidebar.jsx` lines 54–97 (Sidebar function)

**"use client"** — required (folder open/close state, click handlers)

**Props interface:**
```typescript
interface SidebarProps {
  activeFile: string;
  setActiveFile: (name: string) => void;
  openTab: (name: string) => void;
}
```

**Folder open state** (port from `sidebar.jsx` line 55):
```typescript
// D-05: tools/ expanded, about/ collapsed by default
const [open, setOpen] = useState({ tools: true, about: false });
```

**File tree structure** (Phase 1 — replace `portfolio` folder with `tools/` + `about/` per D-05):
```typescript
// tools/ folder contains ToolEntry items (not FileEntry)
// about/ folder contains: bio.json, experience.yaml, skills.toml
// Root-level: README.md (default open), contact.json
```

**Icon mapping** (Lucide replacements for inline SVGs):
```typescript
import { ChevronRight, Folder, FileJson2, FileCode2, FileText, Sparkles } from 'lucide-react';

const ICONS_FOR_FILE: Record<string, React.ComponentType<{ size?: number }>> = {
  json: FileJson2,
  py: FileCode2,
  md: FileText,
  yaml: FileText,
  toml: FileText,
};
```

**File row pattern** (port from `sidebar.jsx` lines 57–69):
```typescript
const fileRow = (name: string) => {
  const f = FILES[name];
  if (!f) return null;
  const FileIcon = ICONS_FOR_FILE[f.icon] ?? FileText;
  const active = activeFile === name;
  return (
    <div
      key={name}
      className={cn(styles.treeRow, { [styles.active]: active })}
      onClick={() => { setActiveFile(name); openTab(name); }}
      role="button"
      tabIndex={0}
    >
      <span className={styles.treeIndent} />
      <FileIcon size={14} />
      <span className={styles.treeLabel}>{name}</span>
    </div>
  );
};
```

**Tool row pattern** (new — for `test-automator` in tools/ folder):
```typescript
const toolRow = (id: string) => {
  const active = activeFile === id;
  return (
    <div
      key={id}
      className={cn(styles.treeRow, { [styles.active]: active })}
      onClick={() => { setActiveFile(id); openTab(id); }}
      role="button"
      tabIndex={0}
    >
      <span className={styles.treeIndent} />
      <Sparkles size={14} style={{ color: 'var(--green)' }} />
      <span className={styles.treeLabel}>{id}</span>
    </div>
  );
};
```

**Activity bar** (not in `sidebar.jsx` — must be added, per UI-SPEC):
- 7 buttons: Explorer, Search, Git, Run, Extensions (top), Profile, Settings (bottom)
- Each: `aria-label` + `title` with same value per UI-SPEC accessibility section
- Active button has `position: absolute; left: -10px` green glow bar

---

### `src/components/ide/EditorArea.tsx` (component, event-driven)

**Analog:** `workspace.jsx` lines 4–41 (Editor function)

**"use client"** — required (tab click/close handlers)

**Props interface:**
```typescript
interface EditorAreaProps {
  tabs: string[];
  activeFile: string;
  setActiveFile: (name: string) => void;
  closeTab: (name: string) => void;
}
```

**Content dispatch** (extends `workspace.jsx` line 6 — adds tool rendering branch):
```typescript
// workspace.jsx line 6: const file = window.FILES[activeFile];
// Port: check if activeFile is a tool entry first
import { FILES, TOOLS } from '@/lib/files-data';
import { FileView } from './FileView';
import { TestAutomatorPane } from '@/components/tools/TestAutomatorPane';

// Inside render:
const isTool = activeFile in TOOLS;
const file = !isTool ? FILES[activeFile] : null;

// Content area:
{isTool
  ? <TestAutomatorPane />
  : file && <FileView file={file} />
}
```

**Tab bar** (port from `workspace.jsx` lines 11–29):
```typescript
<div className={styles.tabbar}>
  {tabs.map(name => {
    const f = FILES[name] ?? TOOLS[name];
    const active = name === activeFile;
    const FileIcon = f && 'icon' in f ? ICONS_FOR_FILE[f.icon] : Sparkles;
    return (
      <div
        key={name}
        className={cn(styles.tab, { [styles.active]: active })}
        onClick={() => setActiveFile(name)}
        role="tab"
        aria-selected={active}
      >
        {FileIcon && <FileIcon size={12} />}
        <span className={styles.tabName}>{name}</span>
        <button
          className={styles.tabClose}
          onClick={(e) => { e.stopPropagation(); closeTab(name); }}
          aria-label={`Close ${name}`}
        >
          <X size={10} />
        </button>
      </div>
    );
  })}
  <div className={styles.tabSpacer} />
</div>
```

**Breadcrumb** (not in `workspace.jsx` — add per UI-SPEC):
```typescript
// Path: ruslankanat › {folder} › {filename}
const breadcrumbParts = file?.path.split('/').filter(Boolean) ?? [activeFile];
```

---

### `src/components/ide/FileView.tsx` (component, transform)

**Analog:** `workspace.jsx` lines 30–40 (gutter + pre/code render in Editor)

**"use client"** — required (rendered with tokenizer output which is dynamic)

**Props interface:**
```typescript
interface FileViewProps {
  file: FileEntry;  // from @/types/ide
}
```

**Core render pattern** (port from `workspace.jsx` lines 30–40):
```typescript
import { tokenize } from '@/lib/syntax-highlighter';

export function FileView({ file }: FileViewProps) {
  const tokens = tokenize(file.content, file.lang);
  const lines = file.content.split("\n");

  return (
    <div className={styles.editorInner}>
      <div className={styles.gutter}>
        {lines.map((_, i) => (
          <div key={i} className={cn(styles.ln, { [styles.active]: i === 0 })}>
            {i + 1}
          </div>
        ))}
      </div>
      <pre className={cn(styles.code, styles[`lang-${file.lang}`])}>
        <code>{tokens}</code>
      </pre>
      <div className={styles.minimap} aria-hidden="true" />
    </div>
  );
}
```

**Note:** `tokens` is `ReactNode[]` returned by `tokenize()` — spread directly as children of `<code>`. This is safe because `tokenize()` returns `createElement("span", ...)` nodes, not raw HTML strings.

---

### `src/components/ide/Terminal.tsx` (component, event-driven)

**Analog:** `workspace.jsx` lines 113–168 (Terminal + LogRow functions)

**"use client"** — required (drag resize, auto-scroll, dynamic log rendering)

**Props interface:**
```typescript
interface TerminalProps {
  logs: LogEntry[];
  running: boolean;
  height: number;
  setHeight: (h: number) => void;
  tab: string;
  setTab: (t: string) => void;
}
```

**Drag-to-resize pattern** (port from `workspace.jsx` lines 121–129):
```typescript
const onDrag = (e: React.MouseEvent) => {
  e.preventDefault();
  const startY = e.clientY;
  const startH = height;
  const move = (ev: MouseEvent) =>
    setHeight(Math.max(120, Math.min(500, startH - (ev.clientY - startY))));
  const up = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
};
```

**Auto-scroll effect** (port from `workspace.jsx` lines 116–118):
```typescript
const termBodyRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (termBodyRef.current) termBodyRef.current.scrollTop = termBodyRef.current.scrollHeight;
}, [logs]);
```

**Log row pattern** (port from `workspace.jsx` lines 153–168):
```typescript
function LogRow({ log }: { log: LogEntry }) {
  if (log.kind === "info") return <div className={cn(styles.log, styles.logInfo)}>{log.text}</div>;
  if (log.kind === "warn") return <div className={cn(styles.log, styles.logWarn)}>{log.text}</div>;
  if (log.kind === "ok")   return <div className={cn(styles.log, styles.logOk)}>{log.text}</div>;
  if (log.kind === "fail") return (
    <div className={cn(styles.log, styles.logFail)}>
      <span className={cn(styles.logTag, styles.fail)}>[FAIL]</span>
      <span className={styles.logTest}> {log.test}</span>
      {log.detail && <span className={styles.logDetail}>  {log.detail}</span>}
    </div>
  );
  // pass
  return (
    <div className={cn(styles.log, styles.logPass)}>
      <span className={cn(styles.logTag, styles.pass)}>[PASS]</span>
      <span className={styles.logTest}> {log.test}</span>
      {log.detail && <span className={styles.logDetail}>  {log.detail}</span>}
    </div>
  );
}
```

**Cursor prompt** — update `alex@ci` to `ruslan@portfolio` (per UI-SPEC):
```typescript
{running && (
  <div className={styles.termCursor}>
    <span className={styles.termPrompt}>ruslan</span>
    <span className={styles.termPromptSep}>@</span>
    <span className={styles.termPromptHost}>portfolio</span>
    <span className={styles.termPromptArrow}>❯</span>
    <span className={styles.blink}>▌</span>
  </div>
)}
```

**Terminal accessibility:**
```typescript
<div className={styles.termBody} ref={termBodyRef} aria-live="polite" aria-label="Test output log">
```

---

### `src/components/ide/StatusBar.tsx` (component, request-response)

**Analog:** `workspace.jsx` lines 171–185 (StatusStrip function)

**"use client"** — required (reads activeFile prop, derives from FILES)

**Props interface:**
```typescript
interface StatusBarProps {
  activeFile: string;
  running: boolean;
}
```

**Core render pattern** (port from `workspace.jsx` lines 171–185, add hire CTA):
```typescript
export function StatusBar({ activeFile, running }: StatusBarProps) {
  const f = FILES[activeFile];
  const lines = f ? f.content.split("\n").length : 0;
  const lang = f ? f.lang.toUpperCase() : '';

  return (
    <footer className={styles.statusbar}>
      <div className={styles.sbL}>
        <div className={cn(styles.sbItem, styles.green)}>
          <GitBranch size={11} /> main
        </div>
        <div className={styles.sbItem}>
          {running ? "● running" : "✓ ready"}
        </div>
      </div>
      <div className={styles.sbR}>
        {f && (
          <>
            <div className={styles.sbItem}>Ln 1, Col 1</div>
            <div className={cn(styles.sbItem, styles.lang)}>{lang}</div>
            <div className={styles.sbItem}>{lines} lines</div>
          </>
        )}
        {/* D-15: always visible, never truncated */}
        <div className={cn(styles.sbItem, styles.hireCta)}>● Available for hire</div>
      </div>
    </footer>
  );
}
```

---

### `src/components/ide/AIChat.tsx` (component, event-driven)

**Analog:** `ai-chat.jsx` (full AIChat function — lines 1–101)

**"use client"** — required (useState, useRef, useEffect, form submission)

**Props:** none (self-contained)

**State model** (port from `ai-chat.jsx` lines 6–11):
```typescript
const [open, setOpen] = useState(false);
const [messages, setMessages] = useState<Message[]>([
  { role: "ai", text: "Hi — I'm Ruslan's portfolio assistant. Ask me about test strategy, AI eval pipelines, or why you should hire him." },
]);
const [input, setInput] = useState("");
const [busy, setBusy] = useState(false);
const inputRef = useRef<HTMLInputElement>(null);
const bodyRef = useRef<HTMLDivElement>(null);
```

**Phase 1 stub pattern** — replace `window.claude.complete(...)` with canned responses (no real API call, per CONTEXT.md deferred section):
```typescript
const CANNED_RESPONSES: Record<string, string> = {
  "Walk me through your eval pipeline": "I run LLM evals with Braintrust against a golden dataset of 4,200 prompts, scoring semantic match above 0.92. Every model update triggers a CI eval gate before promotion to production.",
  "How do you keep flake rate under 1%?": "Self-healing selectors: a LangGraph agent watches Playwright failures, diffs the DOM, proposes new locators, and opens a PR with the fix automatically. Flake rate is now 0.4%.",
  "Are you open to staff roles?": "Actively looking for staff-level roles where automation, AI, and product quality intersect. Remote-first preferred. Reach me at ruslankanat.b@gmail.com.",
};

const send = async (q?: string) => {
  const text = (q ?? input).trim();
  if (!text || busy) return;
  setInput("");
  setMessages(m => [...m, { role: "user", text }]);
  setBusy(true);
  await new Promise(r => setTimeout(r, 600 + Math.random() * 400)); // fake latency
  const reply = CANNED_RESPONSES[text] ??
    "Great question — I can speak to test architecture, AI eval pipelines, or Ruslan's background. What specifically would you like to know?";
  setMessages(m => [...m, { role: "ai", text: reply }]);
  setBusy(false);
};
```

**FAB pattern** (port from `ai-chat.jsx` lines 93–97):
```typescript
<button
  className={styles.aiFab}
  onClick={() => setOpen(true)}
  aria-label="Ask my AI Assistant"
  aria-expanded={open}
>
  <span className={styles.aiFabGlow} />
  <Sparkles size={20} />
</button>
```

**System prompt content** (update from Alex Morgan → Ruslan Kanatbek for when real API is wired in Phase 4):
```
You are the AI assistant on the portfolio site of Ruslan Kanatbek — a Senior SDET / QA Automation Engineer with 9+ years of experience. Ruslan specializes in: Playwright/Pytest test frameworks, self-healing selector agents, LLM eval pipelines, and AI-powered test generation. Previously at Resmed, Gemini, Google, and Citi. Stack: Python, TypeScript, Playwright, Pytest, Cypress, GitHub Actions. Open to senior/staff SDET roles. Reply in 2-4 short sentences, confident and technical.
```

---

### `src/lib/syntax-highlighter.ts` (utility, transform)

**Analog:** `syntax.jsx` — full file (lines 1–173)

**No "use client"** — pure utility, runs in both client and server context. Import it in Client Components that need it.

**Exact port with TypeScript additions:**

```typescript
// src/lib/syntax-highlighter.ts
// Port of .planning/design/design_handoff_ide_portfolio/syntax.jsx
// Changes: typed, named exports, no window globals, createElement from react

import { createElement, ReactNode } from 'react';

type TokenClass =
  | 'key' | 'str' | 'num' | 'kw' | 'cmt' | 'punct' | 'fn' | 'type' | 'dec'
  | 'md-h' | 'md-quote' | 'md-table' | 'md-em' | 'md-b' | 'md-code';

const T = (cls: TokenClass, text: string, key: string | number): ReactNode =>
  createElement('span', { className: `tk-${cls}`, key }, text);

export function tokenize(src: string, lang: string): ReactNode[] {
  switch (lang) {
    case 'json':     return tokenizeJSON(src);
    case 'python':   return tokenizePython(src);
    case 'markdown': return tokenizeMarkdown(src);
    case 'yaml':     return tokenizeYaml(src);
    case 'toml':     return tokenizeToml(src);
    default:         return [src];
  }
}
```

**`tokenizeJSON`** — port lines 8–31 directly. The regex and logic are unchanged; only add `const out: ReactNode[] = []` typing.

**`tokenizePython`** — port lines 33–76 directly. Add `const parts: ReactNode[] = []` and `const KW = /\b(...)\b/` typing.

**`tokenizeMarkdown`** — port lines 78–109 directly.

**`tokenizeYaml`** — port lines 111–138 directly.

**`tokenizeToml`** — port lines 141–162 directly.

**Critical note:** `tokenizePython` uses `lines.flatMap(...)` which returns `(string | ReactNode)[]`. TypeScript will complain. Cast the return type: `return lines.flatMap(...) as ReactNode[]`. Alternatively, type `parts` as `(string | ReactNode)[]` and cast at the `return tokenizePython` call site.

---

### `src/lib/files-data.ts` (utility)

**Analog:** `files.js` — full file (lines 1–196)

**No "use client"** — data module, used in both server and client contexts.

**Type definitions** (new — implied by `files.js` structure):
```typescript
export interface FileEntry {
  lang: 'json' | 'python' | 'markdown' | 'yaml' | 'toml';
  path: string;
  icon: 'json' | 'py' | 'md' | 'yaml' | 'toml';
  content: string;
}

export interface ToolEntry {
  type: 'tool';
  id: string;
  label: string;
}

export type LogKind = 'info' | 'warn' | 'ok' | 'pass' | 'fail';

export interface LogEntry {
  kind: LogKind;
  text?: string;   // for info/warn/ok
  test?: string;   // for pass/fail
  detail?: string; // optional detail for pass/fail
}
```

**FILES record** — port from `files.js`, replace ALL Alex Morgan content with Ruslan Kanatbek. Files to include:
- `"README.md"` — D-04 default open file; Ruslan intro content
- `"bio.json"` — from UI-SPEC content substitutions table
- `"experience.yaml"` — Resmed/Gemini/Google/Citi (not Lumen/Northwind/Helix)
- `"skills.toml"` — rename from `stack.toml`; update content with real stack
- `"contact.json"` — new file not in original `files.js`

**TOOLS record** (new):
```typescript
export const TOOLS: Record<string, ToolEntry> = {
  "test-automator": {
    type: "tool",
    id: "test-automator",
    label: "test-automator",
  },
};
```

**SAMPLE_LOGS** — port from `workspace.jsx` lines 95–111, replace with Ruslan-specific test names per UI-SPEC terminal section:
```typescript
export const SAMPLE_LOGS: LogEntry[] = [
  { kind: "info", text: "$ npx playwright test --grep smoke --reporter=line" },
  { kind: "info", text: "Running 12 tests using 6 workers" },
  { kind: "pass", test: "test_resmed_sdet.py::test_device_monitoring_flow", detail: "142ms" },
  { kind: "pass", test: "test_resmed_sdet.py::test_data_integrity_pipeline", detail: "318ms" },
  { kind: "pass", test: "test_playwright_expertise.py::test_cross_browser_e2e", detail: "412ms" },
  { kind: "pass", test: "test_playwright_expertise.py::test_visual_regression", detail: "624ms" },
  { kind: "pass", test: "test_api_coverage.py::test_health_endpoints_200", detail: "41ms" },
  { kind: "pass", test: "test_ai_toolkit.py::test_automator_streaming", detail: "891ms" },
  { kind: "warn", text: "⚠ Self-healing selector rewrote `#submit` → `[data-testid=submit]` (auto-PR #4821)" },
  { kind: "pass", test: "test_ai_toolkit.py::test_rate_limiting_429_returned", detail: "156ms" },
  { kind: "pass", test: "test_perf.py::test_lcp_under_2s", detail: "742ms  budget 800ms" },
  { kind: "pass", test: "test_a11y.py::test_wcag_aa_contrast", detail: "0 violations" },
  { kind: "info", text: "─────────────────────────────────────────────────────────────" },
  { kind: "ok",   text: "✓ 10 passed (6.2s)  ·  0 failed  ·  0 flaky" },
];
```

---

### `src/lib/anthropic.ts` (utility, server-only)

**Analog:** RESEARCH.md Pattern 5

**No design handoff analog** — server infrastructure file.

```typescript
import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5-20250929';
```

---

### `src/lib/ratelimit.ts` (utility, server-only)

**Analog:** RESEARCH.md Pattern 4

**No design handoff analog** — server infrastructure file.

```typescript
import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const ratelimitPerTool = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix: 'rl:tool',
  analytics: false,
});

export const ratelimitGlobal = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '60 s'),
  prefix: 'rl:global',
  analytics: false,
});
```

---

### `src/lib/schemas/test-automator.ts` (utility)

**Analog:** RESEARCH.md Pattern 6

**No design handoff analog** — validation schema.

```typescript
import { z } from 'zod';

export const testAutomatorSchema = z.object({
  input: z.string().min(1, 'Input is required').max(4000),
  mode: z.enum(['url', 'story']),
}).refine((data) => {
  if (data.mode === 'url') {
    return data.input.startsWith('http://') || data.input.startsWith('https://');
  }
  return true;
}, {
  message: 'Must start with http:// or https://',
  path: ['input'],
});

export type TestAutomatorInput = z.infer<typeof testAutomatorSchema>;
```

---

### `src/types/ide.ts` (utility)

**Analog:** Implied by `files.js` (FileEntry structure) + `app.jsx` (state model) + `workspace.jsx` (LogRow)

**No design handoff analog — but all types are derived from the handoff data shapes:**

```typescript
// All types consumed by IDE shell and its children

export type FileEntryLang = 'json' | 'python' | 'markdown' | 'yaml' | 'toml';
export type FileEntryIcon = 'json' | 'py' | 'md' | 'yaml' | 'toml';

export interface FileEntry {
  lang: FileEntryLang;
  path: string;
  icon: FileEntryIcon;
  content: string;
}

export interface ToolEntry {
  type: 'tool';
  id: string;
  label: string;
}

export type WorkspaceEntry = FileEntry | ToolEntry;

export type LogKind = 'info' | 'warn' | 'ok' | 'pass' | 'fail';

export interface LogEntry {
  kind: LogKind;
  text?: string;
  test?: string;
  detail?: string;
}

export type Theme = 'dark' | 'light';

export interface IDEState {
  activeFile: string;
  tabs: string[];
  termHeight: number;
  termTab: string;
  running: boolean;
  theme: Theme;
}
```

---

### `src/app/api/tools/test-automator/route.ts` (route-handler, streaming)

**Analog:** RESEARCH.md Pattern 3 (no JSX design handoff analog — pure API)

**No "use client"** — server-only Route Handler.

**Full pattern** (from RESEARCH.md Pattern 3 — verbatim for the planner):

```typescript
import 'server-only';
import { NextRequest } from 'next/server';
import { anthropic, MODEL } from '@/lib/anthropic';
import { ratelimitPerTool, ratelimitGlobal } from '@/lib/ratelimit';
import { testAutomatorSchema } from '@/lib/schemas/test-automator';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // 1. Parse + validate input
  // 2. Input size cap (FRAME-11): 4000 chars → 413
  // 3. Rate limiting (FRAME-06/07): per-tool + global → 429 + Retry-After
  // 4. Stream LLM response via anthropic.messages.stream() → ReadableStream
  //    SSE format: data: {"text": "..."}\n\n  and  data: [DONE]\n\n
  // 5. Two-language output: single Claude call, delimiter "---PYTEST---" splits output
}
```

**SSE stream pattern** (from RESEARCH.md Pattern 3 lines 454–485):
```typescript
const stream = new ReadableStream({
  async start(controller) {
    const encoder = new TextEncoder();
    try {
      const anthropicStream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: 4096,
        messages: [{ role: 'user', content: buildPrompt(input, mode) }],
        system: SYSTEM_PROMPT,
      });
      for await (const event of anthropicStream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    } catch {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Model error' })}\n\n`));
      controller.close();
    }
  },
});
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
});
```

**Rate limit 429 response pattern** (from RESEARCH.md Pattern 3 lines 434–451):
```typescript
const reset = Math.min(perToolResult.reset, globalResult.reset);
const retryAfter = Math.ceil((reset - Date.now()) / 1000);
return new Response(
  JSON.stringify({ error: `Rate limit reached — try again in ${retryAfter}s.` }),
  {
    status: 429,
    headers: {
      'Retry-After': String(retryAfter),
      'X-RateLimit-Limit': String(perToolResult.limit),
      'X-RateLimit-Remaining': String(perToolResult.remaining),
      'X-RateLimit-Reset': String(reset),
      'Content-Type': 'application/json',
    },
  }
);
```

---

### `src/components/tools/TestAutomatorPane.tsx` (component, streaming)

**Analog:** No JSX design handoff analog. New surface. Use RESEARCH.md Pattern 3 client-side code + UI-SPEC Test Automator section.

**"use client"** — required (form state, streaming fetch, tab switching)

**State model:**
```typescript
const [mode, setMode] = useState<'url' | 'story'>('story');  // D-12: default User Story
const [input, setInput] = useState('');
const [generating, setGenerating] = useState(false);
const [activeTab, setActiveTab] = useState<'playwright' | 'pytest'>('playwright');
const [code, setCode] = useState<{ playwright: string; pytest: string }>({ playwright: '', pytest: '' });
const [error, setError] = useState<string | null>(null);
const [rationale, setRationale] = useState('');
const [rationaleOpen, setRationaleOpen] = useState(true);
```

**"Try with example" fixture** (D-11/D-12, from UI-SPEC):
```typescript
const FIXTURE = `User visits the IDE portfolio, opens the Test Automator tool from the sidebar, enters a user story, and receives streaming Playwright and Pytest test code within 30 seconds.`;

const fillExample = () => {
  setMode('story');  // D-12: always User Story mode
  setInput(FIXTURE);
};
```

**SSE client stream pattern** (from RESEARCH.md Pattern 3 + Pitfall 4 buffer fix):
```typescript
async function generate(input: string, mode: 'url' | 'story') {
  setGenerating(true);
  setCode({ playwright: '', pytest: '' });
  setError(null);
  setRationale('');

  const response = await fetch('/api/tools/test-automator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, mode }),
  });

  if (!response.ok) {
    // error handling per UI-SPEC error states table
    setGenerating(false);
    return;
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let currentSection: 'playwright' | 'pytest' | 'rationale' = 'playwright';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const messages = buffer.split('\n\n');
    buffer = messages.pop() ?? '';
    for (const msg of messages) {
      const line = msg.trim();
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') { setGenerating(false); return; }
      const parsed = JSON.parse(data) as { text?: string; error?: string };
      if (parsed.error) { setError(parsed.error); setGenerating(false); return; }
      if (parsed.text) {
        // Route to correct section based on delimiter in stream
        if (parsed.text.includes('---PYTEST---')) { currentSection = 'pytest'; continue; }
        if (parsed.text.includes('---RATIONALE---')) { currentSection = 'rationale'; continue; }
        if (currentSection === 'playwright') {
          setCode(prev => ({ ...prev, playwright: prev.playwright + parsed.text }));
        } else if (currentSection === 'pytest') {
          setCode(prev => ({ ...prev, pytest: prev.pytest + parsed.text }));
        } else {
          setRationale(prev => prev + parsed.text);
        }
      }
    }
  }
  setGenerating(false);
}
```

**Copy pattern:**
```typescript
const [copied, setCopied] = useState<'playwright' | 'pytest' | null>(null);

const copyCode = async (tab: 'playwright' | 'pytest') => {
  await navigator.clipboard.writeText(code[tab]);
  setCopied(tab);
  setTimeout(() => setCopied(null), 2000);  // UI-SPEC: 2000ms then revert
};
```

**CSS approach:** Tailwind v4 utility classes inside this component (per RESEARCH.md Pattern 2 — tool pane is the Tailwind surface). Do NOT use CSS Modules here. Reference IDE tokens via `var(--green)` etc. in inline styles for brand-specific values.

---

## Shared Patterns

### Pattern: `"use client"` Boundary

**Apply to:** `IDEShell.tsx`, `TopBar.tsx`, `Sidebar.tsx`, `EditorArea.tsx`, `FileView.tsx`, `Terminal.tsx`, `StatusBar.tsx`, `AIChat.tsx`, `TestAutomatorPane.tsx`

**Rule:** First line of every interactive component file. All state, event handlers, browser APIs (localStorage, clipboard, window) must live in `"use client"` components. Pages (`page.tsx`, `layout.tsx`) are Server Components — they import Client Components.

### Pattern: `import 'server-only'`

**Apply to:** `src/lib/anthropic.ts`, `src/lib/ratelimit.ts`, `src/app/api/tools/test-automator/route.ts`

**Source:** RESEARCH.md Pattern 5

**Rule:** First import in every file that touches `@anthropic-ai/sdk` or `@upstash/redis`. Next.js throws a build error if these modules are accidentally imported in a Client Component.

### Pattern: CSS Module + global token reference

**Apply to:** All `.module.css` files for IDE chrome components

**Rule:**
```css
/* ✓ correct: reference CSS custom properties from globals.css */
.topbar {
  background: var(--bg-deep);
  border-bottom: 1px solid var(--border);
  height: 56px;
}

/* ✗ wrong: do not use @apply inside CSS Modules (Tailwind v4 isolation) */
/* ✗ wrong: do not invent new color values */
```

### Pattern: `cn()` helper for conditional classes

**Apply to:** All `.tsx` component files

**Source:** shadcn `lib/utils.ts` convention

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Usage:
```typescript
className={cn(styles.treeRow, { [styles.active]: active })}
```

### Pattern: Lucide icon substitution

**Apply to:** All IDE chrome components that use inline SVG icons from the design handoff

**Mapping:**

| Design handoff `Icon.*` | Lucide import |
|------------------------|---------------|
| `Icon.chevron` | `ChevronRight` (rotate 90° via `style={{ transform: 'rotate(90deg)' }}` when open) |
| `Icon.folder` | `Folder` |
| `Icon.fileJson` | `FileJson2` |
| `Icon.filePy` | `FileCode2` |
| `Icon.fileMd` | `FileText` |
| `Icon.fileYaml` | `FileText` (with color `var(--pink)`) |
| `Icon.fileToml` | `FileText` (with color `var(--amber)`) |
| `Icon.search` | `Search` |
| `Icon.git` | `GitBranch` |
| `Icon.play` | `Play` |
| `Icon.close` | `X` |
| `Icon.spark` | `Sparkles` |
| `Icon.send` | `Send` |
| `Icon.bell` | `Bell` |
| `Icon.sun` | `Sun` |
| `Icon.moon` | `Moon` |

Usage: `import { ChevronRight, Folder, ... } from 'lucide-react'`; use as `<ChevronRight size={10} />`

### Pattern: Error handling in route handlers

**Apply to:** `src/app/api/tools/test-automator/route.ts`

**Error response ladder** (in order — never expose stack traces):

| Condition | Status | Body |
|-----------|--------|------|
| Invalid JSON body | 400 | `{ error: 'Invalid JSON' }` |
| Zod validation fail | 422 | `{ error: parsed.error.flatten() }` |
| Input > 4000 chars | 413 | `{ error: 'Input exceeds the 4000 character limit. Please shorten your description.' }` |
| Rate limit exceeded | 429 | `{ error: 'Rate limit reached — try again in {N}s.' }` + `Retry-After` header |
| LLM/model error | SSE | `data: {"error": "Claude returned an error. Try again — your input was not charged."}\n\n` |

---

## No Analog Found

Files with no design handoff analog — planner must use RESEARCH.md patterns exclusively:

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/app/api/tools/test-automator/route.ts` | route-handler | streaming | Pure server-side API; design handoff has no backend files |
| `src/lib/anthropic.ts` | utility | — | Server infrastructure; design handoff is frontend-only |
| `src/lib/ratelimit.ts` | utility | — | Server infrastructure; design handoff is frontend-only |
| `src/lib/schemas/test-automator.ts` | utility | — | Validation schema; design handoff has no validation layer |
| `tests/unit/test-automator-schema.test.ts` | test | — | No tests in design handoff |
| `tests/unit/syntax-highlighter.test.ts` | test | — | No tests in design handoff |
| `tests/e2e/test-automator.spec.ts` | test | — | No tests in design handoff |
| `.github/workflows/ci.yml` | config | — | CI infrastructure; not in design handoff |
| `postcss.config.mjs` | config | — | Tailwind v4 PostCSS setup |
| `vitest.config.ts` | config | — | Unit test runner config |
| `playwright.config.ts` | config | — | E2E test runner config |

---

## Metadata

**Analog search scope:** `.planning/design/design_handoff_ide_portfolio/` (5 JSX files + 1 JS data file)
**Design handoff files read:** `app.jsx`, `sidebar.jsx`, `workspace.jsx`, `ai-chat.jsx`, `syntax.jsx`, `files.js`
**Pattern extraction date:** 2026-05-16
**Greenfield note:** No existing `src/` to search. All analogs are design handoff JSX → TypeScript/Next.js ports.
