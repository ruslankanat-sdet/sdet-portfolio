# Phase 1: Foundations + Test Automator Live — Research

**Researched:** 2026-05-16
**Domain:** Next.js 15 App Router, Anthropic SDK streaming, Upstash rate limiting, IDE shell porting from JSX design handoff
**Confidence:** HIGH (stack, architecture, API patterns all verified against current registry and official docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** The entire site is a single IDE shell. Tools open in the editor area; bio/resume content opens as "files" in the editor. No traditional multi-page site layout.
- **D-02:** Phase 1 builds the FULL IDE shell structure (topbar, sidebar with file tree, editor pane, terminal, statusbar) — not a placeholder. Design handoff at `.planning/design/design_handoff_ide_portfolio/` is the canonical source of truth.
- **D-03:** Content from `Alex Morgan` in the design files must be replaced with Ruslan Kanatbek's real content.
- **D-04:** `README.md` is open by default in the editor area on first visit.
- **D-05:** Sidebar file tree has a `tools/` folder (test-automator first entry) and `about/` folder. Tools folder expanded by default.
- **D-06:** Input is a single textarea with a `URL | User Story` pill toggle above it.
- **D-07:** URL mode validates `http://` or `https://`. User Story mode accepts any non-empty text. Server-side validates both.
- **D-08:** Generated code appears as sub-tabs in editor area: `▶ playwright.ts` and `▶ test_suite.py`. Language-selector tabs within the tool pane.
- **D-09:** Streaming targets the active sub-tab. Inactive tab shows `generating...` placeholder. Copy/download appear per-tab after completion.
- **D-10:** Collapsible `# Rationale` block below code output (markdown-style, IDE aesthetic).
- **D-11:** "Try with example" pre-fills a user story testing this portfolio site itself.
- **D-12:** Fixture pre-fills in User Story mode.
- **D-13:** Dark theme (#0b1117 base, #3ddc84 green accent). JetBrains Mono for code, Inter for UI. All design tokens in styles.css — port values exactly.
- **D-14:** Terminal panel shows smoke test animation (fake log entries from SAMPLE_LOGS) triggered by Run button. Decorative in Phase 1.
- **D-15:** Statusbar right side shows `● Available for hire` in green — always visible.
- **D-16:** Upstash Redis rate limiting wired in Phase 1 (not deferred). Per-IP per-tool sliding window. Rate limit headers on every 429.
- **D-17:** `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` as Vercel env vars. `import 'server-only'` on every module touching the SDK. CI grep for `sk-ant-` and `NEXT_PUBLIC_.*KEY`.

### Claude's Discretion

- File/component naming conventions within `src/components/ide/` and `src/components/tools/`
- Exact sub-path routing for the IDE (single-page SPA-style vs multi-route with shared layout)
- Shiki singleton initialization pattern (module-level cache vs route-level)
- Rate limit prefix naming convention for Upstash keys
- CI grep implementation (GitHub Actions workflow step vs pre-push hook)
- Vitest vs Playwright test split — which behaviors get unit vs E2E coverage in Phase 1

### Deferred Ideas (OUT OF SCOPE)

- AI chat widget wired to real Claude endpoint (stub with canned responses in Phase 1 is acceptable)
- Mobile layout (< 720px viewport)
- Light theme polish (toggle can exist but full light theme quality is Phase 5)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Next.js 15 App Router project initialized with TypeScript (strict), Tailwind v4 (or 3.4 fallback), shadcn/ui, ESLint, Prettier | Bootstrap sequence section covers exact command sequence |
| FOUND-02 | Repository deploys cleanly to Vercel on every push to `main`; preview deploys on PRs | Vercel deploys on git push automatically; no config needed beyond `vercel link` or GitHub integration |
| FOUND-03 | `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` configured as Vercel env vars; never exposed to client bundle (CI grep) | CI grep pattern documented in Risk Flags section |
| FOUND-04 | `import 'server-only'` enforced on every module touching the Anthropic SDK | Server-only pattern verified in Next.js docs section |
| FOUND-05 | Base layout rendered on a placeholder landing page, deployed to public Vercel URL | The IDE shell IS the landing page (D-01/D-02) |
| FOUND-06 | Vercel Analytics + Speed Insights installed (cookieless) | Standard packages, wiring pattern documented |
| FOUND-07 | Vercel spend alerts configured | Manual Vercel dashboard step, not code |
| FOUND-08 | Vercel-AI-SDK vs direct Anthropic SDK decision documented | Decision: `@anthropic-ai/sdk` direct — locked in CLAUDE.md, rationale in Architecture section |
| FRAME-01 | `Tool` TypeScript interface defined | Architecture Patterns section defines interface shape |
| FRAME-02 | Shared `<ToolLayout>` shell | The IDE editor area is the tool layout; documented in IDE porting section |
| FRAME-03 | Shared `<ToolInput>` patterns — Zod-validated form | Documented in validation section |
| FRAME-04 | Shared `<ToolOutput>` patterns — Shiki code blocks, copy/download | Shiki setup section covers this |
| FRAME-05 | Server-side `runTool` wrapper | Architecture Patterns covers the route handler wrapper |
| FRAME-06 | Per-IP per-tool rate limiting via @upstash/ratelimit (sliding window) | Rate Limiting Setup section |
| FRAME-07 | Global rate-limit backstop | Rate Limiting Setup section — second Ratelimit instance |
| FRAME-08 | Specific loading states per tool | Streaming pattern section — "Analyzing your input…" prefix |
| FRAME-09 | Distinct error states (rate-limited, model-error, timeout, malformed-input, oversized-input) | Error handling documented in Common Pitfalls |
| FRAME-10 | "No persistence" notice in every tool UI | UI-SPEC documents the copy; no research needed, implementation task |
| FRAME-11 | Input size caps (413 before LLM call) | Documented in Route Handler pattern section |
| AUTO-01 | URL or user-story input, validated client and server | Validation section covers both |
| AUTO-02 | Output streams in real time (first token ≤ 1s) | Streaming pattern section — messages.stream() → ReadableStream |
| AUTO-03 | Both Playwright (TS) and Pytest code on switchable tabs | Sub-tab architecture documented in IDE porting section |
| AUTO-04 | Short rationale block explaining approach | Prompt engineering note in Code Examples |
| AUTO-05 | Generated code syntax-highlighted, passes basic syntax check before render | Shiki server-side highlighting pattern |
| AUTO-06 | "Try with example" button populates input | D-11/D-12, implementation task |
| AUTO-07 | Tool route at `/tools/test-automator` | Next.js App Router file-system routing |
</phase_requirements>

---

## Summary

Phase 1 bootstraps a greenfield Next.js 15 project and delivers a pixel-perfect IDE shell with a working Test Automator tool that streams real Claude output. The project is entirely new — the working directory currently contains only `CLAUDE.md`. The only technically novel integration in this phase is the Anthropic SDK streaming → Next.js Route Handler → client consumption pipeline; everything else is well-understood modern Next.js.

**Critical discovery:** `next@latest` is now 16.2.6, not 15.x. The CLAUDE.md spec targets Next.js 15 (App Router, `params` as Promises, React 19). The planner must pin `next@15` explicitly (`next@15.5.18` is the latest 15.x patch) to avoid accidentally bootstrapping on Next.js 16, which has an unstable status relative to this project's locked decisions.

**Tailwind v4 + shadcn compatibility:** Tailwind v4 is GA (4.3.0 as of research date) and `shadcn@4.7.0` ships as the CLI tool. The shadcn CLI fully supports Tailwind v4. No fallback to Tailwind v3.4 is needed. However, per the UI-SPEC (D-13/D-14), Tailwind v4 is used ONLY for the Test Automator tool pane interior — the IDE chrome uses CSS Modules and globals.css with custom properties ported from styles.css.

**Primary recommendation:** Scaffold with `create-next-app`, pin Next.js to 15.x explicitly, use `@anthropic-ai/sdk` direct for streaming via `messages.stream()` → `ReadableStream` response in a Node-runtime Route Handler, and use Upstash `Ratelimit.slidingWindow()` with `Redis.fromEnv()`. Port the design handoff JSX to TypeScript components in `src/components/ide/` with CSS Modules per component.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| IDE shell layout (topbar, sidebar, editor, terminal, statusbar) | Browser / Client | Frontend Server (SSR for initial HTML) | Interactive state (tabs, running, theme) lives in React `useState`; initial HTML is server-rendered |
| Test Automator form (input, mode toggle, validation) | Browser / Client | — | Client-side validation + form state; no server dependency |
| Test Automator code generation (LLM call) | API / Backend (Node route handler) | — | Anthropic SDK runs server-side only; `import 'server-only'` enforced |
| Streaming code output | API / Backend → Browser | — | Route handler produces ReadableStream; client reads via `fetch()` with streaming reader |
| Rate limiting | API / Backend (Node route handler) | — | Upstash Redis checked in route handler before LLM call |
| Syntax highlighting (IDE file view) | Browser / Client | — | Hand-rolled tokenizer from syntax.jsx, runs client-side in React render |
| Syntax highlighting (generated code) | API / Backend | — | Shiki runs server-side in route handler; HTML returned to client |
| Fake terminal animation | Browser / Client | — | `setTimeout` loop over SAMPLE_LOGS array in React state |
| AI chat widget (stub) | Browser / Client | — | Canned responses keyed to quick-reply text, no API call |
| Design token system | Browser / Client (CSS) | — | CSS custom properties in globals.css applied to all surfaces |
| Vercel Analytics / Speed Insights | Browser / Client (SDK) | Frontend Server (reporting) | Cookieless, reports to Vercel infrastructure |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `15.5.18` (pin to 15.x) | App Router, RSC, Route Handlers, static + dynamic rendering | Project locked to v15; v16 is now the npm `latest` tag — must pin explicitly |
| `react` | `19.2.6` | UI library | Required by Next.js 15 |
| `react-dom` | `19.2.6` | DOM rendering | Required by Next.js 15 |
| `typescript` | `6.0.3` (latest) | Static typing | `"strict": true` is non-negotiable; signals craft for SDET portfolio |
| `tailwindcss` | `4.3.0` | Utility classes for tool pane only | IDE chrome uses CSS Modules; Tailwind for Test Automator interior |
| `@tailwindcss/postcss` | `4.3.0` | PostCSS plugin for Tailwind v4 | Replaces the v3 `tailwindcss` PostCSS plugin; v4 no longer needs autoprefixer |
| `@anthropic-ai/sdk` | `0.96.0` | Anthropic Claude API client | Direct SDK (NOT Vercel AI SDK) per CLAUDE.md; `messages.stream()` for streaming |
| `zod` | `4.4.3` | Runtime input validation | Validates all tool route inputs; mirrors JSON schema for Claude tool-use |
| `@upstash/ratelimit` | `2.0.8` | Per-IP sliding-window rate limiting | Serverless-safe, REST-based, works in Node runtime |
| `@upstash/redis` | `1.38.0` | Upstash Redis client | `Redis.fromEnv()` auto-wires from Vercel env vars |
| `shiki` | `4.0.2` | Syntax highlighting for LLM output | TextMate grammar (VS Code quality), restricted to `typescript`/`python` only in Phase 1 |

[VERIFIED: npm registry 2026-05-16]

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | `0.16.0` | Icon set | Replace all inline SVGs from design handoff JSX with Lucide equivalents |
| `sonner` | `2.0.7` | Toast notifications | Copy-to-clipboard confirmation, error toasts |
| `react-hook-form` | `7.76.0` | Form state | Test Automator input form (textarea, mode toggle) |
| `@hookform/resolvers` | `5.2.2` | Zod adapter for react-hook-form | Wire Zod schema to form validation |
| `clsx` | `2.1.1` | Conditional class composition | Used by the shadcn `cn()` helper |
| `tailwind-merge` | `3.6.0` | Merge Tailwind classes without conflicts | Used by the shadcn `cn()` helper |
| `@vercel/analytics` | `2.0.1` | First-party, cookieless analytics | Add to root layout |
| `@vercel/speed-insights` | `2.0.0` | Real-user Web Vitals | Add to root layout |
| `server-only` | (any) | Prevents server modules from being imported client-side | Import in every Anthropic SDK touching module |

[VERIFIED: npm registry 2026-05-16]

### Development Tools
| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| `vitest` | `4.1.6` | Unit tests | Schema tests, prompt template snapshots, tokenizer tests |
| `@playwright/test` | `1.60.0` | E2E tests | Meta touch: portfolio that generates Playwright code is tested with Playwright |
| `@axe-core/playwright` | latest | A11y assertions in E2E | WCAG AA baseline coverage |
| ESLint | `10.4.0` (as `eslint`) | Linting | `eslint-config-next` with flat config (`eslint.config.mjs`) |
| Prettier | `3.8.3` | Formatting | With `prettier-plugin-tailwindcss` for class sorting |
| pnpm | `11.1.2` (via `npx pnpm`) | Package manager | pnpm not installed globally on this machine; use `npm install -g pnpm` first or bootstrap with npm then switch |

[VERIFIED: npm registry + local environment 2026-05-16]

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@anthropic-ai/sdk` direct | Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) | AI SDK adds a useful abstraction for multi-provider but hides Anthropic-specific tool-use features. Single provider (Claude) in v1 → no benefit, one less abstraction layer |
| Route Handlers | Server Actions | Server Actions can't stream cleanly with per-IP rate limiting headers. Route Handlers give full HTTP control |
| Tailwind v4 for tool pane | Tailwind v3.4 | v4 is GA, shadcn 4.7.0 supports it. No reason to use v3 for new greenfield work |
| Hand-rolled tokenizer (IDE files) | Shiki for everything | Shiki is heavier, async, and designed for static highlighting. The hand-rolled tokenizer is synchronous and purpose-built for the IDE file view's limited language set |

**Installation:**
```bash
# Step 0: Install pnpm globally if needed
npm install -g pnpm

# Step 1: Bootstrap (see exact flags in Bootstrap Sequence section below)
npx create-next-app@latest sdet-ai-toolkit --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
cd sdet-ai-toolkit

# Step 2: Install core dependencies  
pnpm add @anthropic-ai/sdk@0.96.0 zod@4.4.3 @upstash/ratelimit@2.0.8 @upstash/redis@1.38.0 shiki@4.0.2 server-only

# Step 3: Install UI dependencies
pnpm add lucide-react sonner react-hook-form @hookform/resolvers clsx tailwind-merge @vercel/analytics @vercel/speed-insights

# Step 4: Install Tailwind v4 PostCSS plugin (create-next-app may have installed v3)
pnpm add @tailwindcss/postcss

# Step 5: Init shadcn (for Button, Textarea if used in tool pane)
npx shadcn@latest init

# Step 6: Dev tools
pnpm add -D vitest @playwright/test @axe-core/playwright prettier prettier-plugin-tailwindcss
npx playwright install --with-deps chromium
```

**Version verification:** All versions above confirmed against npm registry on 2026-05-16.

---

## Architecture Patterns

### System Architecture Diagram

```
Browser
  │
  ├── GET /  ────────────────────────────────────► Next.js App Router (SSR)
  │                                                  └── RootLayout (globals.css, fonts)
  │                                                      └── IDEShell (client component)
  │                                                          ├── TopBar
  │                                                          ├── Sidebar (file tree)
  │                                                          ├── EditorArea
  │                                                          │   ├── TabBar
  │                                                          │   ├── Breadcrumb
  │                                                          │   └── [activeFile dispatch]
  │                                                          │       ├── FileView (tokenizer)
  │                                                          │       └── TestAutomatorPane ◄─┐
  │                                                          ├── Terminal (fake logs)          │
  │                                                          ├── StatusBar                    │
  │                                                          └── AIChat (stub)                │
  │                                                                                           │
  ├── POST /api/tools/test-automator ──────────────────────► Route Handler (Node runtime)    │
  │     └── { input, mode }                                   ├── server-only guard          │
  │                                                           ├── Zod validate               │
  │                                                           ├── 413 if input > cap         │
  │                                                           ├── Upstash per-IP + global    │
  │                                                           │   rate limit check           │
  │                                                           │   └── 429 + Retry-After if   │
  │                                                           │       exceeded               │
  │                                                           ├── Anthropic messages.stream()│
  │                                                           │   (playwright tab)           │
  │                                                           └── ReadableStream response    │
  │                                                               (SSE text/event-stream)    │
  │                                                                                           │
  └── ReadableStream reader ◄─────────────────────────────────────────────────────────────────┘
        └── Chunk parsing → activeTab code block update
```

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout — imports globals.css, fonts, Analytics, SpeedInsights
│   ├── page.tsx            # Single route "/" — renders IDEShell
│   ├── globals.css         # ALL CSS custom properties from styles.css + @tailwind directives
│   └── api/
│       └── tools/
│           └── test-automator/
│               └── route.ts   # POST handler — Node runtime, streaming
├── components/
│   ├── ide/
│   │   ├── IDEShell.tsx        # Root "use client" component, all useState lives here
│   │   ├── IDEShell.module.css # .ide-body, .main layout
│   │   ├── TopBar.tsx
│   │   ├── TopBar.module.css
│   │   ├── Sidebar.tsx         # ActivityBar + Explorer + file tree
│   │   ├── Sidebar.module.css
│   │   ├── EditorArea.tsx      # TabBar + Breadcrumb + content dispatch
│   │   ├── EditorArea.module.css
│   │   ├── FileView.tsx        # Gutter + tokenized code + minimap
│   │   ├── FileView.module.css
│   │   ├── Terminal.tsx        # Resizable terminal with log animation
│   │   ├── Terminal.module.css
│   │   ├── StatusBar.tsx
│   │   └── StatusBar.module.css
│   ├── tools/
│   │   ├── TestAutomatorPane.tsx       # Full tool UI rendered inside editor area
│   │   └── TestAutomatorPane.module.css
│   └── ui/                    # shadcn components (if used), restyled to IDE tokens
├── lib/
│   ├── syntax-highlighter.ts  # Ported from syntax.jsx — TypeScript, no window globals
│   ├── files-data.ts          # Ported from files.js — Ruslan's content, typed
│   ├── anthropic.ts           # import 'server-only'; Anthropic client singleton
│   ├── ratelimit.ts           # import 'server-only'; Ratelimit + Redis instances
│   └── schemas/
│       └── test-automator.ts  # Zod schema for POST body
└── types/
    └── ide.ts                 # FileEntry, ToolEntry, TabState interfaces
```

### Pattern 1: IDE Shell Component Decomposition

**What:** The design handoff JSX uses browser globals (`window.FILES`, `window.tokenize`, `React.createElement` aliased to `h`). Port to typed TypeScript modules with proper imports.

**Key porting rules:**
- `window.FILES` → `import { FILES } from '@/lib/files-data'`
- `window.tokenize` → `import { tokenize } from '@/lib/syntax-highlighter'`
- `h(...)` calls → JSX (`<div className="...">`)
- Inline SVG icons → Lucide React equivalents (ChevronRight, Folder, FileJson2, FilePy, etc.)
- `useState: useSA` alias pattern → normal `useState` import from `'react'`
- `"use client"` directive required on IDEShell.tsx and all child components with event handlers

**Source:** `.planning/design/design_handoff_ide_portfolio/app.jsx`, `sidebar.jsx`, `workspace.jsx` [CITED]

```typescript
// src/lib/files-data.ts
// Source: ported from .planning/design/design_handoff_ide_portfolio/files.js
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
  icon: 'spark';  // or lucide icon name
}

export type WorkspaceEntry = FileEntry | ToolEntry;

export const FILES: Record<string, FileEntry> = {
  "README.md": {
    lang: "markdown",
    path: "~/portfolio/README.md",
    icon: "md",
    content: `# 👋 Hi, I'm Ruslan.\n\n...`,
  },
  // ... other files with Ruslan Kanatbek content
};

export const TOOLS: Record<string, ToolEntry> = {
  "test-automator": {
    type: "tool",
    id: "test-automator",
    label: "test-automator",
    icon: "spark",
  },
};
```

**IDE shell state model** (lives in `IDEShell.tsx`):
```typescript
"use client";
// All the state from app.jsx, typed:
const [activeFile, setActiveFile] = useState<string>("README.md");
const [tabs, setTabs] = useState<string[]>(["README.md"]);
const [termHeight, setTermHeight] = useState<number>(220);
const [running, setRunning] = useState<boolean>(false);
const [logs, setLogs] = useState<LogEntry[]>(SAMPLE_LOGS.slice(0, 8));
const [theme, setTheme] = useState<"dark" | "light">(() => {
  try { return (localStorage.getItem("portfolio-theme") as "dark" | "light") || "dark"; }
  catch { return "dark"; }
});
```

### Pattern 2: CSS Strategy — Two Coexisting Systems

**What:** Two CSS systems coexist in the same Next.js app.

| Surface | CSS Approach | Reason |
|---------|-------------|--------|
| IDE chrome (topbar, sidebar, editor, terminal, statusbar) | CSS Modules + globals.css | Pixel-perfect port of design handoff `styles.css` — exact token values, no Tailwind mapping |
| Test Automator tool pane interior | Tailwind v4 utility classes | Tool pane is built fresh, benefits from rapid iteration; Tailwind v4 CSS variables coexist with IDE custom properties |

**Implementation:**
1. Copy all `:root` CSS custom properties from `styles.css` into `src/app/globals.css`
2. Add `@import "tailwindcss"` at top of globals.css (Tailwind v4 single-line import)
3. Per-component `.module.css` files reference custom properties directly: `background: var(--bg-deep);`
4. Tailwind utilities (`className="flex flex-col gap-4"`) work normally in tool pane components
5. Do NOT use `@apply` in CSS Modules (Tailwind v4 requires `@reference` for that; avoid the complexity — use `var(--color-*)` or regular CSS in modules)

[CITED: tailwindcss.com/docs/compatibility — CSS Modules isolation in v4]

**Root layout CSS import:**
```typescript
// src/app/layout.tsx
import './globals.css'; // IDE tokens + Tailwind directives
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

### Pattern 3: Streaming Route Handler

**What:** The Test Automator route handler calls Anthropic SDK `messages.stream()`, wraps the text delta stream in a Web `ReadableStream`, and returns it as a `text/event-stream` response. The client uses `fetch()` with `response.body` reader.

**Server side** (`app/api/tools/test-automator/route.ts`):
```typescript
// Source: Anthropic SDK docs + Next.js streaming route handler docs [VERIFIED]
import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { ratelimitPerTool, ratelimitGlobal } from '@/lib/ratelimit';
import { testAutomatorSchema } from '@/lib/schemas/test-automator';

export const runtime = 'nodejs';
export const maxDuration = 60; // Vercel Hobby: 60s for Node functions

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  // 1. Parse + validate input
  let body: unknown;
  try { body = await req.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  
  const parsed = testAutomatorSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  
  const { input, mode } = parsed.data;
  
  // 2. Input size cap (before LLM call — FRAME-11)
  const INPUT_CHAR_LIMIT = 4000;
  if (input.length > INPUT_CHAR_LIMIT) {
    return Response.json(
      { error: `Input exceeds the ${INPUT_CHAR_LIMIT} character limit.` },
      { status: 413 }
    );
  }
  
  // 3. Rate limiting (FRAME-06/FRAME-07)
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '127.0.0.1';
  const identifier = `test-automator:${ip}`;
  
  const [perToolResult, globalResult] = await Promise.all([
    ratelimitPerTool.limit(identifier),
    ratelimitGlobal.limit(ip),
  ]);
  
  if (!perToolResult.success || !globalResult.success) {
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
  }
  
  // 4. Stream LLM response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const anthropicStream = client.messages.stream({
          model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5-20250929',
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
      } catch (err) {
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
}
```

**Client side** (inside `TestAutomatorPane.tsx`):
```typescript
// Source: Next.js streaming docs + Anthropic SDK patterns [VERIFIED]
async function generate(input: string, mode: 'url' | 'story') {
  setGenerating(true);
  setCode({ playwright: '', pytest: '' });
  
  const response = await fetch('/api/tools/test-automator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, mode }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      setError(`Rate limit reached — try again in ${retryAfter}s.`);
    } else if (response.status === 413) {
      setError(err.error);
    } else {
      setError('Claude returned an error. Try again — your input was not charged.');
    }
    setGenerating(false);
    return;
  }
  
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    // Parse SSE data: lines
    for (const line of chunk.split('\n')) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') { setGenerating(false); return; }
        const parsed = JSON.parse(data);
        if (parsed.text) {
          // Route to active tab (playwright or pytest based on delimiters in response)
          setCode(prev => ({ ...prev, [activeTab]: prev[activeTab] + parsed.text }));
        }
      }
    }
  }
  setGenerating(false);
}
```

[VERIFIED: Anthropic SDK docs context7/anthropics/anthropic-sdk-typescript; Next.js streaming docs context7/vercel/next.js]

### Pattern 4: Rate Limiting Setup

**What:** Two `Ratelimit` instances — one per-tool, one global backstop.

```typescript
// src/lib/ratelimit.ts
// Source: Upstash ratelimit docs [VERIFIED: context7/websites/upstash_redis_sdks_ratelimit-]
import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv(); // reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN

// Per-IP per-tool: 10 requests / 60 seconds
export const ratelimitPerTool = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix: 'rl:tool',
  analytics: false, // Keep simple in Phase 1
});

// Global backstop across all tools: 30 requests / 60 seconds per IP
export const ratelimitGlobal = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '60 s'),
  prefix: 'rl:global',
  analytics: false,
});
```

**`RatelimitResponse` shape** (from Upstash docs):
- `success`: `boolean` — whether request is allowed
- `limit`: max requests in window
- `remaining`: requests left
- `reset`: Unix timestamp (ms) when window resets
- `pending`: `Promise<unknown>` — analytics sync (safe to ignore on Node runtime)

**Env vars required:**
- `UPSTASH_REDIS_REST_URL` — from Vercel Marketplace (Upstash Redis integration)
- `UPSTASH_REDIS_REST_TOKEN` — from Vercel Marketplace

[VERIFIED: Upstash docs 2026-05-16]

### Pattern 5: `server-only` Module Guard

**What:** Every module that imports `@anthropic-ai/sdk` or `@upstash/redis` must start with `import 'server-only'`. Next.js will throw a build error if a server-only module is accidentally imported into a Client Component.

```typescript
// src/lib/anthropic.ts
import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

// Singleton for reuse across route handlers
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

[VERIFIED: Next.js docs context7/vercel/next.js — "Protect server-only code with server-only package"]

### Pattern 6: Input Validation Schema

```typescript
// src/lib/schemas/test-automator.ts
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

[VERIFIED: Zod v4 docs — API is stable, z.refine() for cross-field validation]

### Pattern 7: Next.js 15 — Async `params` Requirement

**Critical:** In Next.js 15, `params` and `searchParams` in page components are Promise-wrapped. Any code copied from Next.js 14 tutorials will break silently.

```typescript
// CORRECT for Next.js 15:
export default async function Page(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params;
  const { slug } = params;
  // ...
}

// WRONG (Next.js 14 pattern — causes runtime errors in Next.js 15):
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params; // will be a Promise, not the value
}
```

[VERIFIED: Next.js docs context7/vercel/next.js — "Update Next.js Async Page & Metadata params and searchParams Access"]

**Note:** Phase 1 has only one route (`/`) with no dynamic segments. This pitfall matters for `app/tools/test-automator/page.tsx` if it is a separate page (vs rendering the tool pane inside the root IDE shell). Since D-01 says the site is a single IDE shell, there is no `/tools/test-automator` page route — the tool is rendered in the editor area of the root route. AUTO-07 ("accessible at `/tools/test-automator`") may need resolution: either a redirect or a shallow URL state update (e.g., `history.pushState`) when the tool tab is active. [ASSUMED: URL-state approach needs planner decision]

### Pattern 8: Shiki Server-Side Code Highlighting

**What:** Shiki highlights LLM-generated TypeScript and Python code server-side in the Route Handler, returning pre-highlighted HTML to the client. For Phase 1, only `typescript` and `python` languages are loaded.

**Critical warning on Shiki output rendering:** Shiki returns HTML strings. The Shiki docs show `dangerouslySetInnerHTML={{ __html: out }}` in RSC examples. Since LLM output is involved, this is an XSS risk per CLAUDE.md. The safer approach is to use `codeToHast` and render via `hast-util-to-jsx-runtime` (returns React elements, no HTML injection). Alternatively, render the raw text stream client-side and apply a simple `<pre><code>` display, adding Shiki highlighting only after streaming completes.

**Recommended Phase 1 approach:** Stream raw text to the client, display in `<pre><code>` during streaming (with CSS token classes from the hand-rolled approach), then after `[DONE]` make a second request to a `/api/highlight` endpoint or use client-side Shiki with the JavaScript regex engine (no WASM, ~50KB gz for `typescript`/`python`).

**If using server-side Shiki for final highlight:**
```typescript
// Source: shiki/shiki docs [VERIFIED: context7/shikijs/shiki]
import { createHighlighter } from 'shiki';

// Create once (module level, cached across invocations in warm container)
let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

export async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark'],
      langs: ['typescript', 'python'],
    });
  }
  return highlighterPromise;
}
```

**XSS mitigation:** Use `codeToHast` → `hast-util-to-jsx-runtime` in a React Server Component, or use `codeToTokensBase` to get a token array and render `<span>` elements manually. The `dangerouslySetInnerHTML` approach is banned per CLAUDE.md.

[VERIFIED: Shiki docs; CITED: CLAUDE.md "What NOT to Use" — dangerouslySetInnerHTML]

### Pattern 9: Syntax Highlighter Port (IDE File View)

**What:** The `syntax.jsx` hand-rolled tokenizer must be ported to TypeScript. It uses `React.createElement` aliased as `h` and returns arrays of React elements. Port changes:

1. Replace `const T = (cls, text, key) => h("span", ...)` with proper TypeScript
2. Remove `window.tokenize` global — export as named function
3. Add return types: `ReactNode[]`
4. Port all five tokenizers: `tokenizeJSON`, `tokenizePython`, `tokenizeMarkdown`, `tokenizeYaml`, `tokenizeToml`

```typescript
// src/lib/syntax-highlighter.ts
import { createElement, ReactNode } from 'react';

type TokenClass = 'key' | 'str' | 'num' | 'kw' | 'cmt' | 'punct' | 'fn' | 'type' | 'dec' | 'md-h' | 'md-quote' | 'md-table' | 'md-em' | 'md-b' | 'md-code';

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
// ... tokenizer implementations (direct ports from syntax.jsx)
```

[CITED: `.planning/design/design_handoff_ide_portfolio/syntax.jsx`]

### Anti-Patterns to Avoid

- **Using `dangerouslySetInnerHTML` for LLM output:** Banned per CLAUDE.md. Even for code text — use `<pre><code>` with safe Shiki HAST rendering or token spans.
- **Using Edge runtime for tool routes:** `@anthropic-ai/sdk` works in Edge but `maxDuration` is 25s on Vercel Hobby (insufficient for LLM calls). Always `export const runtime = 'nodejs'`.
- **Mixing Tailwind utilities on IDE chrome components:** The IDE shell CSS must come exclusively from CSS Modules referencing custom properties. Tailwind on `.topbar`, `.sidebar`, `.terminal` will fight the design token values.
- **Importing rate-limiting or Anthropic SDK in Client Components:** `import 'server-only'` enforces this at build time; don't try to work around it.
- **Hard-coding the Anthropic model ID:** Always `process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5-20250929'`. Allows swapping without redeploy.
- **Using `NEXT_PUBLIC_` prefix on any secret:** CI grep enforces `NEXT_PUBLIC_.*KEY` pattern detection.
- **Using `npm` instead of `pnpm` after bootstrap:** Vercel auto-detects pnpm from `pnpm-lock.yaml`. Once `pnpm-lock.yaml` is committed, always use pnpm locally to avoid lock file conflicts.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limiting | Custom IP tracking with Redis incr/expire | `@upstash/ratelimit` with `Ratelimit.slidingWindow()` | Sliding window algorithm is non-trivial; Upstash handles atomic Redis operations, reset calculations, and the `pending` async flush |
| Form validation | Manual `onChange` + error state | `react-hook-form` + `@hookform/resolvers` + Zod | Focus management, dirty/touched state, schema-driven validation are all handled |
| Streaming text decoding | Custom SSE parser | Standard `ReadableStream` reader with `TextDecoder` + line splitting | The browser spec handles chunked delivery correctly; custom parsers miss edge cases (chunk boundaries mid-line) |
| Syntax highlighting (generated code) | Regex-based highlighter for generated TypeScript/Python | Shiki with TextMate grammars | LLM-generated code uses any language feature; regex tokenizers miss edge cases (template literals, multiline strings, decorators) |
| Retry logic on Anthropic calls | Manual retry loop | `@anthropic-ai/sdk` built-in retry with exponential backoff | SDK handles `RateLimitError`, `APIError`, network failures with proper backoff |
| IP extraction | Manual `req.headers` parsing | Standard pattern: `req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '127.0.0.1'` | Vercel sets `x-forwarded-for` reliably; fallback handles local dev |

**Key insight:** The streaming + rate-limiting pipeline has 4 independent failure modes (network, rate limit, LLM error, timeout). Hand-rolling any of these adds maintenance surface without solving correctness problems the libraries already handle.

---

## Runtime State Inventory

Step 2.5 SKIPPED — Phase 1 is greenfield. No existing runtime state, stored data, live service config, OS-registered state, secrets, or build artifacts from prior deployment exist. The project directory currently contains only `CLAUDE.md`.

---

## Common Pitfalls

### Pitfall 1: Bootstrapping on Next.js 16 Instead of 15

**What goes wrong:** `npx create-next-app@latest` installs `next@16.2.6` (current npm `latest` tag). The project is architecturally tested against Next.js 15. Next.js 16 may have further breaking changes.

**Why it happens:** npm `latest` tag was updated when Next.js 16 went GA. The CLAUDE.md spec references Next.js 15 explicitly.

**How to avoid:** Pass explicit version: `npx create-next-app@15` or `npx create-next-app@">=15.0.0 <16.0.0"`. Alternatively: bootstrap normally, then `pnpm add next@15.5.18 react@19.2.6 react-dom@19.2.6`.

**Warning signs:** `package.json` shows `"next": "^16.x"` after bootstrap.

[VERIFIED: npm registry 2026-05-16]

### Pitfall 2: `params` / `searchParams` Not Awaited

**What goes wrong:** If any dynamic route pages are added later (e.g., `/tools/[slug]`), destructuring `params` directly without `await` returns a Promise object, not the slug value. Causes silent runtime failures.

**Why it happens:** Next.js 15 changed `params` and `searchParams` from synchronous objects to Promises. Most Stack Overflow answers and tutorials target Next.js 14.

**How to avoid:** Always `const params = await props.params;` in async page components. TypeScript will show the type as `Promise<...>` which makes the bug visible.

**Warning signs:** `params.slug` is `"[object Promise]"` when rendered.

[VERIFIED: Next.js docs]

### Pitfall 3: Tailwind v4 CSS Modules `@apply` Breakage

**What goes wrong:** Using `@apply text-green-500` inside a CSS Module file throws an error in Tailwind v4 because CSS Modules are processed in isolation without access to the `@theme`.

**Why it happens:** Tailwind v4 changed how theme variables are scoped. CSS Modules don't automatically inherit the global `@theme`.

**How to avoid:** In IDE chrome CSS Modules, use `var(--green)` directly instead of `@apply`. For tool pane components, use Tailwind utility classes in `className` attributes (not in CSS files). If `@apply` is truly needed in a module, add `@reference "../app/globals.css";` at the top.

**Warning signs:** Build error: `Cannot apply unknown utility class` or similar Tailwind module isolation error.

[VERIFIED: Tailwind v4 compatibility docs]

### Pitfall 4: SSE Chunking at Client — Partial JSON Lines

**What goes wrong:** When parsing SSE lines client-side, a `ReadableStream` chunk may arrive mid-SSE-line. Splitting on `\n` and trying to `JSON.parse` each line fails when a line is split across two chunks.

**Why it happens:** The network stack delivers data in arbitrary byte chunks that don't align with logical line boundaries.

**How to avoid:** Buffer incomplete lines across `read()` calls. Maintain a `buffer` string, append each decoded chunk, split on `\n\n` (SSE double-newline message boundary), and only parse complete messages.

```typescript
let buffer = '';
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const messages = buffer.split('\n\n');
  buffer = messages.pop() ?? ''; // keep the incomplete last segment
  for (const msg of messages) {
    const line = msg.trim();
    if (line.startsWith('data: ')) {
      // safe to parse
    }
  }
}
```

**Warning signs:** Intermittent `JSON.parse` errors in the browser console during streaming.

[ASSUMED: Based on SSE specification and common fetch streaming patterns]

### Pitfall 5: Shiki WASM in Edge Runtime or Cold Start Size

**What goes wrong:** Shiki's default engine uses WASM (`oniguruma`). In certain serverless environments, WASM loading fails or adds 1-3s to cold starts.

**Why it happens:** The default Shiki engine bundles `oniguruma.wasm`.

**How to avoid:** Use the JavaScript regex engine for Phase 1 (no WASM, adequate for TypeScript/Python):

```typescript
import { createHighlighter } from 'shiki';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const highlighter = await createHighlighter({
  themes: ['github-dark'],
  langs: ['typescript', 'python'],
  engine: createJavaScriptRegexEngine(),
});
```

**Warning signs:** Cold start > 2s on first request; WASM loading errors in Vercel function logs.

[VERIFIED: Shiki docs — JavaScript regex engine option]

### Pitfall 6: `window.localStorage` Access in Server Component or SSR

**What goes wrong:** The theme initialization in `app.jsx` uses `localStorage.getItem("portfolio-theme")`. If this runs during SSR, it throws `ReferenceError: window is not defined`.

**Why it happens:** Next.js renders components on the server first. `window` doesn't exist server-side.

**How to avoid:** Wrap in a lazy initializer with try/catch (already done in the design handoff's `useState(() => { try { ... } catch { return 'dark'; } })`). Additionally, set `data-theme="dark"` as default on the `<html>` element server-side to avoid flash of unstyled content. The client hydrates and may switch to `'light'` if localStorage says so.

**Warning signs:** Hydration mismatch warning in console; theme flashing on load.

[VERIFIED: Next.js docs — client-only state]

### Pitfall 7: `export const runtime = 'nodejs'` Missing on Tool Routes

**What goes wrong:** Without explicitly setting the runtime, Next.js 15 defaults to... Node.js for Route Handlers. However, the default may change and the Anthropic SDK timeout behavior differs between runtimes.

**Why it matters:** Vercel Hobby: Node runtime gets 60s `maxDuration`, Edge gets 25s. LLM calls easily exceed 25s.

**How to avoid:** Always explicitly set:
```typescript
export const runtime = 'nodejs';
export const maxDuration = 60;
```

**Warning signs:** 504 Gateway Timeout errors mid-stream on longer LLM responses.

[CITED: CLAUDE.md — Edge vs Node runtime section]

---

## Code Examples

### Bootstrap Sequence

```bash
# Install pnpm if not present (pnpm not found locally — see Environment Availability)
npm install -g pnpm

# Scaffold — pin to Next.js 15 explicitly
npx create-next-app@15 sdet-ai-toolkit \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

cd sdet-ai-toolkit

# Verify pinned versions (check package.json after scaffold)
# If next@16 was installed anyway, force-reinstall:
# pnpm add next@15.5.18 react@19.2.6 react-dom@19.2.6

# Core tool dependencies
pnpm add @anthropic-ai/sdk@0.96.0 zod@4.4.3 server-only
pnpm add @upstash/ratelimit@2.0.8 @upstash/redis@1.38.0

# Shiki (JS regex engine to avoid WASM)
pnpm add shiki@4.0.2

# UI / forms / analytics
pnpm add lucide-react sonner react-hook-form @hookform/resolvers
pnpm add clsx tailwind-merge
pnpm add @vercel/analytics @vercel/speed-insights

# Tailwind v4 PostCSS plugin (replace v3 if create-next-app installed it)
pnpm add @tailwindcss/postcss

# Dev dependencies
pnpm add -D vitest @playwright/test @axe-core/playwright
pnpm add -D prettier prettier-plugin-tailwindcss

# shadcn (if using Button/Textarea in tool pane)
npx shadcn@latest init

# Playwright browsers
npx playwright install --with-deps chromium
```

### Tailwind v4 PostCSS Config

```javascript
// postcss.config.mjs — replaces v3 config
// Source: Tailwind v4 docs [VERIFIED]
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### globals.css Structure

```css
/* src/app/globals.css */
/* Source: Tailwind v4 import syntax + design handoff styles.css [VERIFIED] */

/* 1. Tailwind v4 single-line import (replaces @tailwind base/components/utilities) */
@import "tailwindcss";

/* 2. IDE design tokens — ported exactly from styles.css :root */
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
  --hover:        rgba(255,255,255,0.04);
  --surface:      rgba(255,255,255,0.025);
  --surface-2:    rgba(255,255,255,0.08);
  --glass-a:      rgba(20, 28, 40, 0.85);
  --glass-b:      rgba(12, 18, 26, 0.92);
  --glass-border: rgba(255,255,255,0.08);
  --mono: "JetBrains Mono", "Fira Code", "SF Mono", ui-monospace, Menlo, Consolas, monospace;
  --ui:   "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --radius: 6px;
}

/* 3. Global resets + body */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  overflow: hidden; /* IDE body is the scroll container */
  background: var(--bg-deepest);
  font-family: var(--ui);
  font-size: 13px;
  color: var(--text);
}

/* 4. Root background gradient (port exactly from styles.css) */
#root, body > main {
  background:
    radial-gradient(ellipse 1200px 600px at 80% -20%, rgba(61,220,132,0.06), transparent 60%),
    radial-gradient(ellipse 800px 500px at -10% 110%, rgba(121,184,255,0.04), transparent 60%),
    var(--bg-deepest);
  min-height: 100dvh;
}

/* 5. Syntax token classes (used by hand-rolled tokenizer output) */
.tk-key   { color: var(--syn-key); }
.tk-str   { color: var(--syn-str); }
.tk-num   { color: var(--syn-num); }
.tk-kw    { color: var(--syn-kw); font-style: italic; }
.tk-cmt   { color: var(--syn-cmt); }
.tk-punct { color: var(--syn-punct); }
.tk-fn    { color: var(--syn-fn); }
.tk-type  { color: var(--syn-type); }
.tk-dec   { color: var(--syn-dec); }
.tk-md-h  { color: var(--green-bright); font-weight: 600; }
.tk-md-quote { color: var(--text-muted); }
.tk-md-table { color: var(--blue); }
.tk-md-em   { color: var(--text-muted); font-style: italic; }
.tk-md-b    { color: var(--text); font-weight: 600; }
.tk-md-code { color: var(--syn-str); }

/* 6. Keyframe animations (port from styles.css) */
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes log-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes blink { 50% { opacity: 0; } }
@keyframes btn-pulse { 0%, 100% { box-shadow: 0 0 0 0 var(--green-glow); } 50% { box-shadow: 0 0 0 6px transparent; } }
@keyframes panel-in { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: none; } }
```

### CI Security Grep (GitHub Actions)

```yaml
# .github/workflows/ci.yml
- name: Security — grep for exposed API keys
  run: |
    # Check built output (after next build)
    if grep -r "sk-ant-" .next/static/ 2>/dev/null; then
      echo "ERROR: Anthropic API key found in bundle!"
      exit 1
    fi
    if grep -rE "NEXT_PUBLIC_.*KEY" src/ 2>/dev/null; then
      echo "ERROR: API key exposed via NEXT_PUBLIC_ prefix!"
      exit 1
    fi
    echo "Key exposure check passed."
```

### Walking Skeleton Definition

The thinnest end-to-end that proves the full stack works, in order:

1. `pnpm dev` → browser opens, IDE shell renders with topbar/sidebar/editor/terminal/statusbar
2. `README.md` content is visible as syntax-highlighted markdown in the editor area
3. Click `test-automator` in sidebar → editor area switches to Test Automator pane
4. Enter a user story, click Generate → POST hits `/api/tools/test-automator`
5. Rate limit passes (Upstash Redis) → Anthropic SDK `messages.stream()` called
6. First token arrives within ~1s → TypeScript code begins appearing in the playwright.ts sub-tab
7. Switch to test_suite.py tab → Pytest code visible (or `generating…` if sequential)
8. Rationale block appears after streaming completes
9. `git push` → Vercel deploys automatically → public URL accessible

**Minimum viable Walking Skeleton (Phase 1, Wave 0):**
- IDE shell renders (CSS Modules + globals.css, all design tokens, static layout)
- File view works for README.md (tokenizer port)
- Test Automator pane renders in editor area (static, no API calls)
- Route handler returns a hardcoded SSE stream (no LLM call yet — proves the streaming plumbing)
- Rate limiting wired but not blocking yet (Redis connected)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `npx create-next-app` → Next.js 15 | `npx create-next-app@latest` → Next.js 16 | 2026 | MUST pin to `@15` explicitly for this project |
| Tailwind v3 `tailwind.config.js` | Tailwind v4 `@import "tailwindcss"` in CSS + `@tailwindcss/postcss` plugin | 2025 GA | No JS config file; CSS-first; `@theme` replaces config `theme.extend` |
| `tailwindcss` as PostCSS plugin | `@tailwindcss/postcss` as the single PostCSS plugin | v4.0 | Remove `autoprefixer` from PostCSS config |
| `params` as sync object in pages | `params` as `Promise<{...}>` requiring `await` | Next.js 15 | Tutorial code from 2024 breaks silently |
| ESLint `.eslintrc.json` | ESLint flat config (`eslint.config.mjs`) | ESLint 9 | create-next-app scaffolds this correctly |
| `@upstash/ratelimit` v1.x API | v2.x API — same API surface, updated internals | 2024 | No breaking changes for `slidingWindow` usage |
| `@anthropic-ai/sdk` v0.2x | v0.9x — same streaming API | 2025 | `messages.stream()` pattern unchanged |

**Deprecated/outdated:**
- `tailwindcss` as a direct PostCSS plugin: replaced by `@tailwindcss/postcss` in v4
- `@tailwind base/components/utilities` directives: replaced by `@import "tailwindcss"` in v4
- `eslint-config-next` with `.eslintrc.json`: replaced by flat config `eslint.config.mjs`
- Next.js `pages/` router for new projects: App Router is the default and recommended approach

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | AUTO-07 ("accessible at /tools/test-automator") should be implemented as URL state update (`history.pushState`) rather than a separate Next.js page route, since D-01 says the site is a single IDE shell | Architecture Patterns — Pattern 7 | If the planner decides to make `/tools/test-automator` a real page route, the routing structure changes significantly (needs shared layout with IDE shell state) |
| A2 | Shiki SSE chunking pitfall workaround: use client-side Shiki JS engine after streaming completes rather than server-side Shiki in the route handler, to avoid the dangerouslySetInnerHTML XSS concern | Pattern 8 (Shiki) | If planner wants server-side highlighting, a safe HAST rendering approach via `hast-util-to-jsx-runtime` must be planned |
| A3 | pnpm is available via `npx pnpm` (version 11.1.2 confirmed) but not globally installed; the bootstrap assumes `npm install -g pnpm` first | Bootstrap Sequence | If global install fails, can use `npx pnpm` for all commands but lock file behavior may differ |
| A4 | Vitest and Playwright are available via `npx` without global install | Environment Availability | Should be fine; both work via npx |
| A5 | Streaming both Playwright and Pytest code from a single route handler call in sequence (one after the other) rather than parallel (two concurrent LLM calls) | Pattern 3 (Streaming) | Parallel calls would halve time-to-complete but double cost and complexity; sequential streaming with a delimiter is simpler for Phase 1 |

---

## Open Questions

1. **AUTO-07 vs D-01 conflict: `/tools/test-automator` route vs single IDE shell**
   - What we know: D-01 says the site is a single IDE shell (no multi-page layout). AUTO-07 says the tool must be "accessible at `/tools/test-automator`".
   - What's unclear: Does AUTO-07 mean a real page route, or just that the URL reflects the active tool (via `history.pushState` or `router.push` without a full page reload)?
   - Recommendation: Implement as `window.history.pushState(null, '', '/tools/test-automator')` when the tool tab is activated, and `router.push('/tools/test-automator')` for direct navigation (intercepted by a layout component that opens the correct IDE tab). Full separate page route is architecturally messy with the single-shell design.

2. **Playwright + Pytest streaming: sequential or structured JSON?**
   - What we know: AUTO-03 says both outputs appear on switchable tabs. D-09 says streaming targets the active sub-tab.
   - What's unclear: Does the LLM stream Playwright code, signal a boundary, then stream Pytest code in one request? Or are there two separate API calls (one per language)?
   - Recommendation: Single API call with a structured prompt that produces both outputs separated by a clear delimiter (e.g., `---PYTEST---`). The client routes text to the correct tab based on which delimiter has been seen. This avoids two concurrent LLM calls and double cost.

3. **Shiki XSS mitigation: HAST rendering vs streaming raw text**
   - What we know: CLAUDE.md bans `dangerouslySetInnerHTML`. Shiki docs show `dangerouslySetInnerHTML` in RSC examples for LLM output.
   - What's unclear: Is `codeToHast` + `hast-util-to-jsx-runtime` the right approach, or should we stream raw text and apply highlighting only after completion?
   - Recommendation: Stream raw text, display in `<pre><code>` with basic CSS, and apply client-side Shiki JS engine highlighting only after the `[DONE]` signal. Avoids HTML injection entirely during streaming phase.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js runtime | ✓ | v22.22.2 (LTS) | — |
| npm | Package management fallback | ✓ | 10.9.7 | — |
| pnpm | Primary package manager | ✗ (not global) | 11.1.2 via npx | `npm install -g pnpm` then use pnpm; or use npx pnpm |
| git | Version control, Vercel deploy trigger | ✓ | 2.50.1 | — |
| Vercel CLI | Optional — deploy via GitHub integration instead | ✗ | — | GitHub → Vercel integration (push to main triggers deploy) |
| Upstash Redis | Rate limiting (FRAME-06/07) | ? (cloud service) | — | Phase 1 must provision via Vercel Marketplace before testing |
| Anthropic API | LLM calls (AUTO-02 through AUTO-07) | ? (cloud service) | — | API key must be set in `ANTHROPIC_API_KEY` env var |
| Vitest | Unit tests | ✓ (via npx) | 4.1.6 | — |
| Playwright | E2E tests | ✓ (via npx) | 1.60.0 | — |

**Missing dependencies with no fallback:**
- Upstash Redis (cloud service — must be provisioned via Vercel Marketplace before rate limiting works)
- Anthropic API key (must be set before LLM calls work)

**Missing dependencies with fallback:**
- pnpm global install: `npm install -g pnpm` or use `npx pnpm` for all commands

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 (unit) + Playwright 1.60.0 (E2E) |
| Config file | `vitest.config.ts` — Wave 0 gap; `playwright.config.ts` — Wave 0 gap |
| Quick run command | `pnpm vitest run` |
| Full suite command | `pnpm vitest run && pnpm playwright test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-03 | `ANTHROPIC_API_KEY` not in bundle | CI grep (static) | `grep -r "sk-ant-" .next/static/` | ❌ Wave 0 (`.github/workflows/ci.yml`) |
| FOUND-04 | `server-only` prevents client import | Build error (automated) | `pnpm build` (fails if violated) | ❌ Implicit — no test file needed |
| FRAME-01 | Tool interface has required properties | unit | `pnpm vitest run tests/unit/tool-interface.test.ts` | ❌ Wave 0 |
| FRAME-05 | Route handler validates input before LLM call | unit | `pnpm vitest run tests/unit/test-automator-schema.test.ts` | ❌ Wave 0 |
| FRAME-06 | 11th request in 60s returns 429 with Retry-After | E2E (manual-only in dev; integration in staging) | Manual / requires Upstash Redis | ❌ Integration test — Wave 0 |
| FRAME-09 | Rate limit error shows `Retry-After` message in UI | E2E | `pnpm playwright test tests/e2e/test-automator.spec.ts` | ❌ Wave 0 |
| FRAME-11 | Input > 4000 chars returns 413 before LLM call | unit | `pnpm vitest run tests/unit/test-automator-schema.test.ts` | ❌ Wave 0 |
| AUTO-01 | URL validation rejects non-http URLs | unit | `pnpm vitest run tests/unit/test-automator-schema.test.ts` | ❌ Wave 0 |
| AUTO-02 | First token visible within ~1s | E2E | `pnpm playwright test tests/e2e/test-automator.spec.ts` | ❌ Wave 0 |
| AUTO-06 | "Try with example" pre-fills fixture | E2E | `pnpm playwright test tests/e2e/test-automator.spec.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm vitest run` (schema + unit tests only, < 5s)
- **Per wave merge:** `pnpm vitest run && pnpm playwright test` (full suite)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-automator-schema.test.ts` — covers FRAME-05, FRAME-11, AUTO-01 (Zod schema validation)
- [ ] `tests/unit/syntax-highlighter.test.ts` — covers tokenizer port correctness for all 5 languages
- [ ] `tests/unit/tool-interface.test.ts` — covers FRAME-01 (TypeScript interface shape validation)
- [ ] `tests/e2e/test-automator.spec.ts` — covers AUTO-02, AUTO-06, FRAME-09
- [ ] `playwright.config.ts` — E2E runner config pointing to `http://localhost:3000`
- [ ] `vitest.config.ts` — unit runner config
- [ ] `.github/workflows/ci.yml` — FOUND-03 CI grep + lint + typecheck + test run

---

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1` per config.json.

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in Phase 1 — stateless public tools |
| V3 Session Management | No | No sessions — stateless public tools |
| V4 Access Control | No | No access control — public tools |
| V5 Input Validation | Yes | Zod schema validation on all route handler inputs; client-side validation via react-hook-form + Zod |
| V6 Cryptography | No | No encryption needed — no stored data, no user state |
| V7 Error Handling | Yes | Never expose stack traces; map LLM errors to safe user-facing messages |
| V8 Data Protection | Yes | "No persistence" promise — inputs discarded after request; `server-only` on all API code |
| V12 File Upload | No | No file uploads in Phase 1 (API Test Generator is Phase 3) |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Prompt injection via user input | Tampering | LLM output rendered as text/code only (never HTML via `dangerouslySetInnerHTML`); output is displayed in `<pre><code>` — not executed |
| API key exfiltration | Information Disclosure | `server-only` import guard; CI grep for `sk-ant-`; no `NEXT_PUBLIC_` prefix on secrets |
| Rate limit bypass (IP spoofing) | Denial of Service | `x-forwarded-for` header checked (Vercel sets this reliably); `x-real-ip` fallback |
| Oversized input (prompt stuffing / cost attack) | Denial of Service | 4000-char input cap returns 413 before any LLM call |
| XSS via LLM output | Tampering | LLM output rendered as text only; Shiki HTML output avoided or replaced with HAST JSX rendering |
| Credential leak in client bundle | Information Disclosure | `server-only` + build-time check; CI grep on `.next/static/` |

**Phase 1 threat model note:** Phase 1 has no authentication, no stored data, no privileged tool access. The LLM is called with user-provided text that generates test code — there is no ability to exfiltrate server state through prompt injection because the LLM has no access to any server resources beyond its training data. The primary security concerns are:
1. Cost control (rate limiting prevents runaway spend)
2. Key exposure (server-only + CI grep)
3. XSS from rendered LLM output (text-only rendering)

[ASSUMED: ASVS Level 1 interpretation for public stateless tool — no compliance framework specified]

---

## Project Constraints (from CLAUDE.md)

These directives from `CLAUDE.md` constrain all planning decisions:

| Directive | Planner Must |
|-----------|-------------|
| `@anthropic-ai/sdk` DIRECT — NOT Vercel AI SDK | Use `@anthropic-ai/sdk` package; ban `ai` and `@ai-sdk/*` packages |
| Route Handlers for tool calls, NOT Server Actions | Tool API lives in `app/api/tools/*/route.ts` |
| Node runtime on tool routes, NOT Edge | `export const runtime = 'nodejs'` on every tool route handler |
| Tailwind v4 for tool panes ONLY; CSS Modules for IDE chrome | No Tailwind utilities on `.topbar`, `.sidebar`, `.terminal`, `.statusbar` |
| Zod validation on every tool route | Schema in `src/lib/schemas/`; validate before any LLM call |
| `import 'server-only'` on every SDK-touching module | All files in `src/lib/anthropic.ts`, `src/lib/ratelimit.ts` |
| No `dangerouslySetInnerHTML` for LLM output | Render as text/code; use HAST or token spans for Shiki |
| pnpm 9 (or compatible) as package manager | Use pnpm; commit `pnpm-lock.yaml` |
| TypeScript `"strict": true` | tsconfig.json strict mode; no `any` shortcuts |
| No ORM, no auth library, no global state library (Redux/Zustand), no GraphQL, no CMS | Check all `pnpm add` commands against this list |
| CI: lint + typecheck + Vitest + Playwright on every PR | GitHub Actions workflow required |
| `ANTHROPIC_MODEL` read from env, not hard-coded | `process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5-20250929'` |
| Input size cap per tool (413 before LLM call) | 4000 char cap in test-automator schema |
| Per-IP rate limit: 10 req/60s per tool; 30 req/60s global | Two Ratelimit instances in `src/lib/ratelimit.ts` |

---

## Sources

### Primary (HIGH confidence)
- [context7/anthropics/anthropic-sdk-typescript] — `messages.stream()` event API, cancellation, MessageStream interface
- [context7/vercel/next.js] — Route Handler streaming, `server-only` module guard, async `params`, CSS Modules, global CSS imports
- [context7/websites/upstash_redis_sdks_ratelimit-] — `Ratelimit.slidingWindow()`, `Redis.fromEnv()`, RatelimitResponse type
- [context7/shikijs/shiki] — `createHighlighter()`, JavaScript regex engine, RSC rendering patterns
- [context7/tailwindlabs/tailwindcss.com] — v4 PostCSS installation, CSS Modules isolation, `@reference` directive
- npm registry (2026-05-16) — All package versions verified via `npm view [package] version`

### Secondary (MEDIUM confidence)
- `.planning/design/design_handoff_ide_portfolio/styles.css` — Design token values (source of truth for IDE chrome)
- `.planning/design/design_handoff_ide_portfolio/app.jsx` — State model and component decomposition reference
- `.planning/design/design_handoff_ide_portfolio/syntax.jsx` — Tokenizer implementation to port
- `.planning/design/design_handoff_ide_portfolio/workspace.jsx` — Editor, TopBar, Terminal, StatusStrip reference
- `.planning/design/design_handoff_ide_portfolio/sidebar.jsx` — Sidebar, ActivityBar, file tree reference

### Tertiary (LOW confidence — flagged)
- SSE chunking workaround pattern (Pitfall 4) — standard SSE handling, ASSUMED based on spec behavior
- ASVS Level 1 interpretation for stateless public tools — ASSUMED, no specific compliance framework cited

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry 2026-05-16
- Architecture: HIGH — patterns verified against Context7 official docs
- Pitfalls: HIGH (5/7 verified) / LOW (2/7 assumed — SSE chunking, ASVS interpretation)
- IDE porting approach: HIGH — design files are the source of truth, decomposition is straightforward

**Research date:** 2026-05-16
**Valid until:** 2026-06-16 (30 days — stable stack)

**Key discovery:** `npm@latest` now points to Next.js 16. The planner MUST pin `next@15.5.18` explicitly. This is the single highest-impact finding of this research.
