# Architecture Research

**Domain:** AI-powered SDET/QA toolkit + portfolio (Next.js App Router on Vercel, stateless, Anthropic Claude)
**Researched:** 2026-05-14
**Confidence:** HIGH (Next.js routing/runtime/RSC patterns verified against official docs v16.2.6); MEDIUM (Vercel AI SDK streaming pattern verified by official streaming example in Next.js docs; specific SDK ergonomics from training data)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│ Browser (Client Components, "use client" only at leaves)             │
│                                                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │ ToolForm     │ │ ToolOutput   │ │ Copy / DL    │ │ Resume MDX  │  │
│  │ (input UI,   │ │ (streaming   │ │ primitives   │ │ (server-    │  │
│  │  Zod schema) │ │  text/code)  │ │ (clipboard,  │ │  rendered,  │  │
│  └──────┬───────┘ └──────┬───────┘ │  blob save)  │ │  static)    │  │
│         │ fetch/POST     │ SSE/    └──────────────┘ └─────────────┘  │
│         │                │ readable                                  │
├─────────┼────────────────┼───────────────────────────────────────────┤
│ Edge (Vercel Edge Functions) — proxy / middleware                    │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ middleware.ts: rate limiter (IP+route key) → @upstash/ratelimit│  │
│  │                + bot/abuse heuristics + size cap pre-check     │  │
│  └────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│ Node.js runtime — App Router Route Handlers (per-tool API)           │
│                                                                       │
│  /app/api/tools/test-automator/route.ts                              │
│  /app/api/tools/test-data-generator/route.ts                         │
│  /app/api/tools/api-test-generator/route.ts                          │
│                                                                       │
│  Each handler:  validate (Zod) → buildPrompt → streamText (AI SDK)   │
│                  → toTextStreamResponse() / toDataStreamResponse()   │
├──────────────────────────────────────────────────────────────────────┤
│ Shared Server Libraries (lib/, ai/) — server-only                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │ ai/client    │ │ ai/prompts   │ │ lib/rate-    │ │ lib/         │  │
│  │ (Anthropic   │ │ (per-tool    │ │ limit        │ │ telemetry    │  │
│  │  provider)   │ │  system+     │ │ (Upstash     │ │ (Vercel      │  │
│  │              │ │  user tmpl)  │ │  Redis)      │ │  Analytics)  │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│ External Services                                                    │
│  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────────┐   │
│  │ Anthropic API    │ │ Upstash Redis    │ │ Vercel Analytics    │   │
│  │ (Claude Sonnet,  │ │ (rate-limit      │ │ (privacy-first      │   │
│  │  streaming)      │ │  counters only)  │ │  pageviews/events)  │   │
│  └──────────────────┘ └──────────────────┘ └─────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `app/(marketing)/` route group | Landing, About, Resume — statically rendered, MDX-driven, zero LLM dependency | RSC + MDX + `generateStaticParams` |
| `app/tools/[slug]/page.tsx` | Per-tool page shell (heading, copy, embeds `<ToolRunner>`) | Server Component that imports tool's registry entry |
| `app/api/tools/[tool]/route.ts` | Per-tool POST endpoint: validate → call LLM (stream) → return text stream | Route Handler, `runtime = 'nodejs'`, `maxDuration = 60` |
| `components/tool/ToolLayout.tsx` | Shared 2-pane layout (input left, output right; stacked on mobile) | Server Component, accepts `children` slots |
| `components/tool/ToolForm.tsx` | Generic form: renders fields from a tool's Zod schema, handles submit, exposes pending state | Client Component, uses `useChat`/`useCompletion` from `ai/react` |
| `components/tool/ToolOutput.tsx` | Streams text into syntax-highlighted code block with copy/download | Client Component (Shiki on server for static highlight; or client renderer for stream) |
| `lib/tools/registry.ts` | Single source of truth: list of all tools, each conforming to `Tool` interface | Plain TS module; tree-shakable per-tool imports |
| `ai/anthropic.ts` | Provider singleton (env-loaded), shared by all tool handlers | `createAnthropic({ apiKey: env.ANTHROPIC_API_KEY })` |
| `ai/prompts/<tool>.ts` | Per-tool system prompt + user prompt builder; pure functions, unit-testable | Co-located with tool's registry entry |
| `lib/rate-limit.ts` | IP + route-keyed sliding-window limiter, returns `{ ok, remaining, reset }` | `@upstash/ratelimit` + `@upstash/redis` |
| `middleware.ts` | Pre-handler rate-limit short-circuit on `/api/tools/*`; sets `RateLimit-*` response headers | Edge runtime (must be Edge — Next.js requirement) |
| `lib/content/` | MDX loader for resume/about; reads from `content/` at build time | `next-mdx-remote` or `@content-collections/next` |
| `components/ui/` | Primitive components (Button, Card, CodeBlock, CopyButton, DownloadButton) | shadcn/ui-style, Tailwind + Radix |

## Recommended Project Structure

```
resume-website/
├── app/
│   ├── (marketing)/                  # Route group — no segment in URL, isolates layout
│   │   ├── layout.tsx                # Marketing nav (Tools, Resume, About)
│   │   ├── page.tsx                  # Landing — tool cards, hero, "coming soon" shelf
│   │   ├── resume/
│   │   │   └── page.tsx              # Renders content/resume.mdx
│   │   └── about/
│   │       └── page.tsx              # Renders content/about.mdx
│   ├── tools/
│   │   ├── layout.tsx                # Tool nav (sidebar list of v1 tools)
│   │   ├── page.tsx                  # /tools — index of all tools
│   │   └── [slug]/
│   │       └── page.tsx              # Dynamic tool page; reads from registry
│   ├── api/
│   │   └── tools/
│   │       ├── test-automator/
│   │       │   └── route.ts          # POST handler
│   │       ├── test-data-generator/
│   │       │   └── route.ts
│   │       └── api-test-generator/
│   │           └── route.ts
│   ├── layout.tsx                    # Root layout: <html>, fonts, ThemeProvider, Analytics
│   ├── error.tsx                     # Global error boundary
│   ├── not-found.tsx
│   └── globals.css                   # Tailwind directives + CSS variables
│
├── components/
│   ├── ui/                           # Primitives (shadcn-style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── code-block.tsx            # Server-rendered Shiki highlight
│   │   ├── copy-button.tsx           # Client: clipboard.writeText
│   │   ├── download-button.tsx       # Client: Blob + URL.createObjectURL
│   │   └── textarea.tsx
│   ├── tool/                         # Tool-framework components
│   │   ├── tool-layout.tsx           # 2-pane shell
│   │   ├── tool-form.tsx             # Schema-driven form
│   │   ├── tool-output.tsx           # Streaming output renderer
│   │   ├── tool-runner.tsx           # Wires form ↔ output via useCompletion
│   │   └── tool-card.tsx             # Landing-page tool teaser
│   ├── layout/
│   │   ├── nav.tsx
│   │   ├── footer.tsx
│   │   └── coming-soon-shelf.tsx
│   └── content/
│       └── mdx-components.tsx        # MDX component overrides (links, headings, code)
│
├── lib/                              # Server-only utilities (import 'server-only')
│   ├── tools/
│   │   ├── registry.ts               # Tool[] array, single source of truth
│   │   ├── types.ts                  # Tool interface (see below)
│   │   ├── test-automator.ts         # Tool definition
│   │   ├── test-data-generator.ts
│   │   └── api-test-generator.ts
│   ├── rate-limit.ts                 # Upstash wrapper
│   ├── env.ts                        # Zod-validated process.env
│   ├── errors.ts                     # Typed error classes + user-facing messages
│   ├── content/
│   │   ├── resume.ts                 # MDX loader for resume
│   │   └── about.ts
│   └── telemetry.ts                  # track('tool_run', { tool, ms, ok })
│
├── ai/                               # AI primitives, server-only
│   ├── anthropic.ts                  # Provider singleton
│   ├── stream.ts                     # Shared streamText wrapper w/ logging+timeouts
│   ├── prompts/
│   │   ├── test-automator.ts         # system + buildUserPrompt(input)
│   │   ├── test-data-generator.ts
│   │   └── api-test-generator.ts
│   └── schemas/
│       ├── test-automator.ts         # Zod input/output schemas
│       ├── test-data-generator.ts
│       └── api-test-generator.ts
│
├── content/                          # MDX source for resume/about
│   ├── resume.mdx
│   ├── about.mdx
│   └── skills.json                   # Structured data referenced by MDX
│
├── public/
│   ├── resume.pdf                    # Static download
│   ├── og/                           # Open Graph images (v1.5)
│   └── favicon.ico
│
├── middleware.ts                     # Edge: rate-limit /api/tools/* + headers
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Structure Rationale

- **`app/(marketing)/` route group:** Keeps Resume/About on a separate layout (different nav, possibly different typography) without polluting URLs. Landing stays at `/`.
- **`app/tools/[slug]/`:** Dynamic route driven by `lib/tools/registry.ts`. Adding a new tool is a registry entry + handler — no new page file required for the basic case. (See "Routing convention" trade-off below.)
- **`app/api/tools/<tool>/route.ts` (one folder per tool, not `[tool]`):** Per-tool runtime / `maxDuration` / `preferredRegion` config (e.g., Test Automator needs 60s; API Test Generator may need more). A single `[tool]` route file can't vary segment config per tool.
- **`lib/` vs `ai/`:** `lib/` is general server utilities; `ai/` isolates LLM-adjacent code (provider, prompts, schemas). This makes prompt-quality iteration a focused diff and lets prompts be unit-tested without touching infra.
- **`components/ui/` vs `components/tool/`:** UI primitives (Button, CodeBlock) are domain-agnostic; tool components encode the "tool framework" (ToolLayout, ToolForm, ToolOutput). The latter only exist because we have multiple tools — the abstraction earns its keep at N=3 and pays compounding dividends at N=7+.
- **`content/` outside `app/`:** MDX is data, not routes. Importing `content/resume.mdx` from `app/(marketing)/resume/page.tsx` keeps the content edit-vs-code-edit boundary clear.
- **`middleware.ts` at root:** Required location for Next.js middleware; runs at Edge before any handler. Rate-limit must short-circuit before the expensive Node handler boots.

## The "Tool" Abstraction

This is the load-bearing pattern of the entire codebase. Get it right and adding a new tool is ~150 LOC.

### Tool interface

```typescript
// lib/tools/types.ts
import type { z, ZodTypeAny } from 'zod'
import type { LanguageModel } from 'ai'

export type OutputFormat = 'typescript' | 'python' | 'json' | 'sql' | 'csv' | 'markdown' | 'plain'

export interface ToolMeta {
  slug: string                   // URL slug + registry key, e.g. 'test-automator'
  name: string                   // Display name
  tagline: string                // 1-line for tool cards
  description: string            // Paragraph for the tool page
  icon: string                   // Lucide icon name or local asset
  status: 'live' | 'coming-soon'
  category: 'e2e' | 'data' | 'api' | 'review'
  // Output formats user can pick (drives tabs on output panel)
  outputFormats: OutputFormat[]
}

export interface ToolDefinition<TInput extends ZodTypeAny> {
  meta: ToolMeta

  // Input contract — used by ToolForm to render fields AND by the route handler to validate
  inputSchema: TInput

  // Pure prompt builders — easy to test
  systemPrompt: string
  buildUserPrompt: (input: z.infer<TInput>) => string

  // Model config (per-tool override of defaults)
  model?: {
    name?: string                // default: 'claude-sonnet-4-5'
    maxTokens?: number           // default: 4096
    temperature?: number         // default: 0.2 for code, 0.7 for data
  }

  // Runtime knobs
  runtime?: {
    maxDurationSeconds?: number  // default: 60
    rateLimit?: { rpm: number; rph: number } // default: 5/min, 30/hour per IP
  }

  // Optional post-processing of the streamed text before display (e.g. strip fences)
  postProcess?: (raw: string, format: OutputFormat) => string

  // Render hints for ToolForm (which Zod fields become textarea vs select vs file)
  ui?: {
    submitLabel?: string         // default: 'Generate'
    inputHints?: Record<string, { kind: 'textarea' | 'input' | 'select' | 'file'; rows?: number; placeholder?: string }>
  }
}
```

### A concrete tool

```typescript
// lib/tools/test-automator.ts
import { z } from 'zod'
import type { ToolDefinition } from './types'

const inputSchema = z.object({
  source: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('url'), value: z.string().url() }),
    z.object({ kind: z.literal('story'), value: z.string().min(20).max(4000) }),
  ]),
  framework: z.enum(['playwright-ts', 'pytest']),
})

export const testAutomator: ToolDefinition<typeof inputSchema> = {
  meta: {
    slug: 'test-automator',
    name: 'Test Automator',
    tagline: 'URL or user story → working Playwright / Pytest test',
    description: '...',
    icon: 'play-circle',
    status: 'live',
    category: 'e2e',
    outputFormats: ['typescript', 'python'],
  },
  inputSchema,
  systemPrompt: `You are an expert SDET who writes ...`,
  buildUserPrompt: (input) => `Generate a ${input.framework} test for ...`,
  model: { temperature: 0.2, maxTokens: 4096 },
  runtime: { maxDurationSeconds: 60 },
  ui: {
    submitLabel: 'Generate test',
    inputHints: {
      'source.value': { kind: 'textarea', rows: 6, placeholder: 'Paste a URL or user story...' },
    },
  },
}
```

### Registry + route handler

```typescript
// lib/tools/registry.ts
import { testAutomator } from './test-automator'
import { testDataGenerator } from './test-data-generator'
import { apiTestGenerator } from './api-test-generator'

export const tools = [testAutomator, testDataGenerator, apiTestGenerator] as const
export const toolsBySlug = Object.fromEntries(tools.map((t) => [t.meta.slug, t]))
```

```typescript
// app/api/tools/test-automator/route.ts
import { testAutomator } from '@/lib/tools/test-automator'
import { runToolStream } from '@/ai/stream'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: Request) {
  return runToolStream(testAutomator, req)
}
```

```typescript
// ai/stream.ts — the only place that knows how to talk to Anthropic
import { streamText } from 'ai'
import { anthropic } from './anthropic'
import { checkRateLimit } from '@/lib/rate-limit'
import type { ToolDefinition } from '@/lib/tools/types'
import { ZodError, ZodTypeAny } from 'zod'

export async function runToolStream<S extends ZodTypeAny>(
  tool: ToolDefinition<S>,
  req: Request,
): Promise<Response> {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon'
  const { ok, retryAfter } = await checkRateLimit(`${tool.meta.slug}:${ip}`, tool.runtime?.rateLimit)
  if (!ok) return new Response('Rate limit', { status: 429, headers: { 'Retry-After': String(retryAfter) } })

  let input: unknown
  try {
    input = tool.inputSchema.parse(await req.json())
  } catch (e) {
    const msg = e instanceof ZodError ? e.flatten() : 'Bad request'
    return Response.json({ error: msg }, { status: 400 })
  }

  const result = await streamText({
    model: anthropic(tool.model?.name ?? 'claude-sonnet-4-5'),
    system: tool.systemPrompt,
    prompt: tool.buildUserPrompt(input as any),
    maxTokens: tool.model?.maxTokens ?? 4096,
    temperature: tool.model?.temperature ?? 0.2,
  })
  return result.toTextStreamResponse()
}
```

**Cost to add tool #4 (e.g., Flaky Test Diagnoser):** one file in `lib/tools/`, one folder + route in `app/api/tools/`, one registry import. The page at `/tools/flaky-test-diagnoser` materializes for free from `app/tools/[slug]/page.tsx`.

## Architectural Patterns

### Pattern 1: Registry-driven dynamic route + opt-in custom page

**What:** A single `app/tools/[slug]/page.tsx` reads the tool from `toolsBySlug[slug]` and renders `<ToolRunner tool={tool} />`. For tools that need bespoke UI (e.g., file upload, multi-step wizard, real-time preview), drop in `app/tools/<slug>/page.tsx` instead — Next.js prefers the static segment over the dynamic one.

**When to use:** All v1 tools share a common UX (paste input → generate → see output) and should ride the dynamic route. v1.5+ tools that need unusual UX get a custom page without breaking the convention.

**Trade-offs:** Saves ~50 LOC per tool. Cost: a custom-page tool is a one-way door — once you eject, you typically don't go back. That's fine.

```typescript
// app/tools/[slug]/page.tsx
import { toolsBySlug } from '@/lib/tools/registry'
import { ToolRunner } from '@/components/tool/tool-runner'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return Object.keys(toolsBySlug).map((slug) => ({ slug }))
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = toolsBySlug[slug]
  if (!tool || tool.meta.status !== 'live') notFound()
  return <ToolRunner tool={tool} />
}
```

### Pattern 2: Server-rendered shell + Client-rendered runner ("island" the interactivity)

**What:** The page (`page.tsx`) is a Server Component that renders headings, marketing copy, and the SSR'd input form skeleton. A small Client Component (`ToolRunner`) wraps only the parts that need state and fetch.

**When to use:** Always. This is the canonical RSC pattern: keep the bundle small by putting `'use client'` at the leaf, not the root.

**Trade-offs:** Requires passing tool metadata as serializable props (no functions). The `buildUserPrompt` and `inputSchema` must stay server-side; only `meta` and a serialized version of the schema (`zod-to-json-schema`) cross the boundary if the client needs it for form rendering.

```typescript
// components/tool/tool-runner.tsx
'use client'
import { useCompletion } from 'ai/react'
import type { ToolMeta } from '@/lib/tools/types'

export function ToolRunner({ meta, fieldHints }: { meta: ToolMeta; fieldHints: SerializedFieldHints }) {
  const { complete, completion, isLoading, error, stop } = useCompletion({
    api: `/api/tools/${meta.slug}`,
  })
  // render <ToolForm onSubmit={complete}/> + <ToolOutput text={completion} loading={isLoading} onStop={stop} />
}
```

### Pattern 3: Streaming text response (default for all v1 tools)

**What:** The route handler returns `result.toTextStreamResponse()` from Vercel AI SDK. The client renders tokens as they arrive into a syntax-highlighted code block. User sees first token in <1s, full output over 5-30s.

**When to use:**
- **Test Automator (long code generation):** STREAM — perceived latency dominates UX; user can start reading the test while it's still being written.
- **Test Data Generator (JSON/CSV/SQL):** STREAM the textual form, then parse client-side once `isLoading` flips to false (don't try to incrementally parse JSON — partial JSON is invalid). For non-text outputs (e.g., a downloadable file), still stream the text representation; "Download" button activates on completion.
- **API Test Generator (long suite):** STREAM — outputs are 200-800 lines of code, recruiter-killer if they stare at a spinner for 25s.

**Rule:** If the response could take longer than ~2s, stream. The only reason not to is when the entire response must be validated before it's useful (e.g., a tool that returns strict JSON for the UI to render as form fields). None of the v1 tools fall into that bucket.

**Trade-offs:** Streaming adds error-handling complexity (the connection can drop mid-stream); the AI SDK's `useCompletion` handles this cleanly but you still need a "regenerate" button and a partial-output state.

```typescript
// Server (already shown in runToolStream): return result.toTextStreamResponse()
// Client (already shown in ToolRunner): useCompletion({ api: '/api/tools/...' })
```

### Pattern 4: Zod-everywhere contract

**What:** Each tool's `inputSchema` is the source of truth. It validates on the server (in the route handler) and drives the form on the client (via `zod-to-json-schema` or a thin `zodToFormFields` helper). Output is also Zod-typed when structured.

**When to use:** Always. This collapses the input-validation/form-rendering/type-safety triangle into one definition.

**Trade-offs:** You will be tempted to express UI-only concerns in the schema. Resist — keep UI hints in `tool.ui.inputHints` (a separate object) so the schema stays a pure contract.

### Pattern 5: Provider-and-prompt-only AI module

**What:** The `ai/` folder exports exactly two things to the rest of the app: a configured model provider and the per-tool prompt builders. Everything else (`streamText`, headers, response shaping) lives in `ai/stream.ts` and is invoked by route handlers via `runToolStream(tool, req)`.

**When to use:** From day one. The biggest mistake in AI apps is sprinkling `streamText` calls across handlers; the second biggest is hard-coding the model name in 12 places.

**Trade-offs:** One indirection. Worth it.

## Data Flow

### Request Flow (one tool invocation)

```
User submits ToolForm
    │
    ▼
[Client: 'use client'] useCompletion({ api: '/api/tools/<slug>' })
    │  POST { ...input } (Content-Type: application/json)
    ▼
[Edge: middleware.ts] rate-limit IP+route → 429 or pass
    │
    ▼
[Node: route.ts] runtime='nodejs', maxDuration=60
    │
    ▼
[ai/stream.ts] runToolStream(tool, req)
    │   1. checkRateLimit (Upstash) — fine-grained per-tool
    │   2. tool.inputSchema.parse(body) — 400 on error
    │   3. streamText({ model, system: tool.systemPrompt, prompt: tool.buildUserPrompt(input) })
    │   4. result.toTextStreamResponse()
    │
    ▼
[Anthropic API] streaming response
    │
    ▼ (SSE / chunked transfer back through Vercel)
[Client] useCompletion's `completion` string grows token-by-token
    │
    ▼
[ToolOutput] re-renders with Shiki-highlighted code (debounced for perf)
    │
    ▼
On finish: Copy button + Download button activate; telemetry.track('tool_run')
```

### State Management

**Per-tool client state lives in `useCompletion`.** No global store needed for v1.

```
useCompletion({ api })
  │
  ├── completion: string         (streamed output)
  ├── isLoading: boolean         (drives spinner, disables submit)
  ├── error: Error | undefined   (drives error banner)
  ├── stop(): void               (drives "Stop" button)
  └── complete(input): Promise   (called from form submit)
```

**Cross-cutting state (theme, analytics consent):** React Context, providers mounted in `app/layout.tsx`. Never used to share *tool* state.

**Persistence (v1):** None. v1.5 introduces `localStorage` for "save my outputs" — keep that strictly client-side, never round-trip to server.

### Key Data Flows

1. **Tool invocation:** Input → Zod validate → prompt build → Anthropic stream → text response → client renders. ~5-25s end-to-end, first token <1s.
2. **Landing page render:** Build-time static. Tools listed from `tools` registry → `<ToolCard>` per entry → Server-rendered HTML. Zero client JS until user interacts with nav.
3. **Resume page render:** Build-time static from `content/resume.mdx`. MDX components (`<Section>`, `<JobEntry>`) defined in `components/content/`. Downloadable PDF is a static asset at `public/resume.pdf`.
4. **Rate-limit check:** Browser → Edge middleware → Upstash Redis (`INCR` + TTL) → response with `X-RateLimit-*` headers or 429.

## Server vs Client Boundary (per layer)

| Layer | Server (RSC / Node) | Client ('use client') |
|-------|---------------------|-----------------------|
| Root layout | yes | — |
| Marketing layout + pages | yes (all MDX) | — |
| Tool index page (`/tools`) | yes | — |
| Tool page (`/tools/[slug]`) | yes (shell) | `<ToolRunner>` only |
| Tool form | — | yes (form state, submit) |
| Tool output | render shell on server | streaming text on client |
| Copy/Download buttons | — | yes (clipboard, Blob) |
| Code highlighting | Shiki on server for static snippets in MDX | Shiki/Highlight.js on client for streaming output (or use `shiki/bundle/web` for smaller bundle) |
| Theme provider | mounted from root layout, but `'use client'` itself | yes |
| Analytics | `<Analytics/>` from `@vercel/analytics/next` | yes |

**Anti-pattern to avoid:** Don't put `'use client'` on `app/tools/[slug]/page.tsx`. That pulls the whole page (and your registry) into the client bundle and leaks any incidental server imports. Keep pages as RSCs and island the interactivity.

## Routing Convention

### Recommended: `/tools/[slug]` (dynamic) with `generateStaticParams`

**Rationale:**
- Registry-driven — adding a tool needs no new page file in the common case.
- `generateStaticParams` makes each tool's page statically rendered at build time (no runtime cost for the shell; only the API route is dynamic).
- URLs are predictable and SEO-friendly (`/tools/test-automator`, `/tools/test-data-generator`).
- Aligns with the planned scale (3 → 7 → 10+ tools).

**Trade-offs vs `/test-automator` (flat, dedicated routes):**

| Dimension | `/tools/[slug]` | `/test-automator` |
|-----------|-----------------|--------------------|
| Adding a tool | registry entry only | new folder + page file |
| Per-tool customization | requires "eject" to custom page | trivial |
| Shared layout (sidebar nav) | natural via `app/tools/layout.tsx` | requires route groups or duplication |
| URL aesthetics | `/tools/test-automator` (clear category) | `/test-automator` (shorter, less hierarchical) |
| SEO | both fine | both fine |
| Refactor cost | low (single point of change) | high (touch each tool's file) |

**Verdict:** Use `/tools/[slug]`. The marginal URL-length savings of flat routes are not worth losing the registry pattern. If a tool ever earns a vanity URL, add a redirect.

### Route group layout

```
app/
├── (marketing)/                # group — no URL segment
│   ├── layout.tsx              # marketing nav
│   ├── page.tsx                # /
│   ├── resume/page.tsx         # /resume
│   └── about/page.tsx          # /about
└── tools/
    ├── layout.tsx              # tool sidebar
    ├── page.tsx                # /tools  (tool index)
    └── [slug]/page.tsx         # /tools/<slug>
```

Two layouts, zero URL noise. Resume sits at `/resume` (not `/portfolio/resume` or `/about/resume`) — recruiters love short paths.

## Edge vs Node Runtime — Explicit Decisions

| Concern | Runtime | Reason |
|---------|---------|--------|
| `middleware.ts` (rate-limit) | **Edge (required)** | Next.js middleware only runs on Edge. Upstash Redis works over HTTPS — fine on Edge. |
| `/api/tools/<tool>/route.ts` | **Node.js** | Anthropic SDK and `ai` SDK both work on Edge, but: (a) we want `maxDuration=60s` (Hobby tier caps Edge at 25s, Node at 60s on Vercel); (b) some shared lib code (e.g., OpenAPI parser, future PDF/Markdown processing for file uploads) may use Node APIs. Pick Node by default; opt into Edge only if a specific tool measurably benefits. |
| OpenAPI parsing (API Test Generator) | **Node.js** | Parsers like `@apidevtools/swagger-parser` rely on Node APIs (`fs`, dynamic `require`). Edge-incompatible. |
| File upload handling | **Node.js** | Vercel's recommended pattern uses Node for multipart parsing; Edge supports `request.formData()` for small bodies but caps at ~4.5MB and lacks robust file-type sniffing. v1 input is text — defer real file uploads to v1.5. |
| Static pages (landing, resume, about) | **N/A (static)** | Build-time rendering, served from CDN. No runtime cost. |
| Analytics endpoint | **Edge** (Vercel-managed) | Vercel Analytics handles its own injection; no app code needed. |

**Anthropic SDK Edge note:** `@anthropic-ai/sdk` and `ai` are both Edge-compatible. We choose Node for the headroom (`maxDuration`, future Node-only deps) without giving up streaming — both runtimes stream identically on Vercel.

## Server Actions vs Route Handlers

| Concern | Winner | Why |
|---------|--------|-----|
| Streaming text response | **Route Handler** | Server Actions can return data via `useActionState` but are not designed for token streaming. The AI SDK's `useChat`/`useCompletion` hooks pair with `POST /api/...` route handlers. |
| Form submit without streaming (e.g., contact form, v1.5) | Server Action | Less boilerplate, progressive enhancement, automatic CSRF protection. |
| Per-tool rate-limit headers | Route Handler | Easier to set `X-RateLimit-*` headers on the Response. |
| File upload + LLM | Route Handler | Server Actions can take FormData but route handlers integrate more cleanly with the AI SDK streaming pipeline. |
| Webhooks (e.g., future analytics, error reporting) | Route Handler | Server Actions are not callable from external services. |

**Verdict for v1:** Every tool is a **Route Handler**. Server Actions are reserved for future non-streaming forms (contact, "subscribe to changelog", etc.).

## Resume / About Content Pipeline

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Format | **MDX** | Author in Markdown for prose, embed React components for structured sections (`<JobEntry>`, `<SkillGrid>`). |
| Loader | **`@next/mdx` or `next-mdx-remote` (RSC variant)** | `@next/mdx` for build-time imports (simplest, fastest). Use `next-mdx-remote` only if content moves out of the repo. |
| Render time | **Build-time (static)** | Resume changes weekly at most. SSG = free LCP win. |
| Components | `components/content/mdx-components.tsx` | Override default tags (h1, h2, a) and provide custom components (`<JobEntry>`). Imported via `mdx-components.tsx` at app root (Next.js convention). |
| Structured data | `content/skills.json` imported into MDX | Skills/certs/links are arrays — keep them structured, not in prose. |
| PDF | `public/resume.pdf` | Static asset, single-file. v1.5: auto-generate from MDX via `react-pdf` or a build script. |

```typescript
// app/(marketing)/resume/page.tsx
import Resume from '@/content/resume.mdx'
export default function ResumePage() {
  return <article className="prose"><Resume /></article>
}
```

## Shared Cross-Cutting Concerns

| Concern | Implementation | Location | When implemented |
|---------|---------------|----------|------------------|
| Rate limiting | `@upstash/ratelimit` + `@upstash/redis` (Redis REST over HTTPS — Edge-safe) | `middleware.ts` (global) + `lib/rate-limit.ts` (per-tool fine-grained) | Before first tool ships publicly |
| Error boundaries | `app/error.tsx`, `app/(marketing)/error.tsx`, `app/tools/[slug]/error.tsx` | Per route segment | Before first tool ships |
| Error mapping | `lib/errors.ts` — typed errors with user-safe messages | Imported by handlers + ToolOutput | With first tool |
| Input size caps | Zod `.max()` + middleware Content-Length check | Schemas + middleware | With first tool |
| Telemetry | Vercel Analytics (pageviews + custom events) | `app/layout.tsx` mounts `<Analytics/>`; events via `track()` | At launch (cheap, useful) |
| Anonymized request logs | Vercel built-in logs; never log input bodies | — | Default |
| Environment validation | `lib/env.ts` — Zod schema parsed at module load; crashes build on missing keys | Imported by handlers | First handler |
| Theme | `next-themes` + CSS variables; SSR-safe | `app/layout.tsx` | Polish phase, before launch |
| Accessibility | Radix primitives via shadcn/ui; manual audit + axe-core dev tests | — | Continuous |
| Security headers | `next.config.mjs` headers: CSP, X-Frame-Options, Referrer-Policy | next.config | Before launch |
| Output sanitization | Render LLM output as text (no `dangerouslySetInnerHTML`); pass through Shiki | ToolOutput | Day 1 of streaming |

## Build Order (maps to roadmap phases)

This is the order of implementation. Earlier items unblock later ones; reversing the order produces rework.

1. **Foundations (must come first)**
   1. Next.js App Router scaffold, Tailwind, TS strict, ESLint, Prettier.
   2. `lib/env.ts` — Zod-validated env loader (fails fast if `ANTHROPIC_API_KEY` missing).
   3. `components/ui/` primitives — Button, Card, CodeBlock, CopyButton, DownloadButton, Textarea. (shadcn-style, copy-paste from registry; ~1 day.)
   4. Root layout + global theme + fonts + `<Analytics/>`.
   *Reason: nothing else compiles or looks right without these.*

2. **Tool framework (the load-bearing abstraction)**
   1. `lib/tools/types.ts` — `Tool` interface (locked in section above).
   2. `ai/anthropic.ts`, `ai/stream.ts` — provider + `runToolStream` helper.
   3. `components/tool/tool-layout.tsx`, `tool-form.tsx`, `tool-output.tsx`, `tool-runner.tsx`.
   4. `app/tools/[slug]/page.tsx` + `app/tools/layout.tsx` + `app/api/tools/[tool]/route.ts` template.
   *Reason: build the harness once before fitting any tool to it. Doing it in reverse forces a rewrite when the second tool reveals shared patterns.*

3. **Rate limiting + error boundaries (before any public traffic)**
   1. Upstash Redis project + env wiring.
   2. `lib/rate-limit.ts` + `middleware.ts`.
   3. `app/error.tsx`, `app/tools/[slug]/error.tsx`.
   4. Input size caps in Zod schemas.
   *Reason: a single public URL with no rate limit is a budget-spike waiting to happen. This is non-negotiable before the site is shareable.*

4. **First tool end-to-end: Test Automator**
   1. Prompt iteration in `ai/prompts/test-automator.ts` (do this against real inputs, multiple times).
   2. Registry entry, route handler.
   3. Manual QA on 5 realistic inputs (URL + user story × Playwright + Pytest).
   *Reason: shipping one tool fully is more learning than starting all three at 30%.*

5. **Second + third tools (parallel-izable now that the harness is proven)**
   1. Test Data Generator (lower risk: schema → data is well-trodden territory for LLMs).
   2. API Test Generator (higher risk: OpenAPI parsing + longer outputs; do it last so prior tool feedback informs prompt).

6. **Landing page + tool index**
   1. `app/(marketing)/page.tsx` — hero, ToolCards from registry, "coming soon" shelf.
   2. `app/tools/page.tsx` — tool index page.
   *Reason: can't write good marketing copy until you know what the tools actually do.*

7. **Resume / About content**
   1. MDX wiring + `mdx-components.tsx`.
   2. `content/resume.mdx`, `content/about.mdx`, `public/resume.pdf`.
   3. Nav links to resume/about from every page.
   *Reason: content authoring is a chunk of time; deferring it to after tools work keeps momentum. Resume must be one click from any page — verify before launch.*

8. **Polish + launch hardening**
   1. Mobile responsiveness pass on every page.
   2. Accessibility audit (keyboard, screen reader, axe).
   3. Security headers in `next.config.mjs`.
   4. Vercel deploy + spend alerts + custom domain (deferred per PROJECT.md but easy).
   5. Open Graph image (v1.5).

**The rate limiter goes before the public ship.** Listed in step 3 above to keep that loud.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users/week | Default — Hobby Vercel + Upstash free tier handles this comfortably. Single-region Node functions. |
| 1k-50k users/week | Watch Anthropic token spend (per-tool budgets). Consider request-coalescing for identical inputs (Redis cache, 1h TTL, opt-in flag per tool — likely OFF for v1 because outputs are inputs-dependent). Promote to Vercel Pro for `maxDuration=300` headroom and Edge concurrency. |
| 50k+ users/week | At this point the site has earned a job; this is theoretical. Options: queue heavy generations to a background job (Vercel Cron + KV state), add per-user (cookie-based) quotas in addition to per-IP, geo-cache static pages aggressively. Adding a DB (Postgres on Neon) opens "save outputs server-side" without rewriting tools. |

### Scaling Priorities

1. **First bottleneck: Anthropic spend.** A botnet hitting `/api/tools/test-automator` even at 5 req/min burns $50/day at scale. Mitigation order: (a) Upstash rate limit per IP, (b) Cloudflare Turnstile or similar challenge on suspicious patterns, (c) input size caps, (d) hard daily spend cap that returns 503 with a friendly message.
2. **Second bottleneck: cold starts on Node functions.** Vercel keeps recent functions warm; with 3 tools each hit occasionally, cold starts will be visible. If LCP-after-click matters, move the lowest-token tool (Test Data Generator) to Edge runtime.
3. **Third bottleneck: bundle size on `/tools/[slug]`.** As tools proliferate, importing the full registry into the client (even accidentally) inflates the bundle. Keep registry server-only; pass `meta` props down. Audit with `next build --debug`.

## Anti-Patterns

### Anti-Pattern 1: Sharing one route handler `/api/tools/[tool]/route.ts` for all tools

**What people do:** A single dynamic route handler that switches on `params.tool` and dispatches.
**Why it's wrong:** Can't set per-tool `maxDuration`, `runtime`, or `preferredRegion` (Next.js segment config is per-file). All tools share a cold start. Harder to log/monitor per tool. Tighter coupling.
**Do this instead:** One folder per tool under `app/api/tools/`, each `route.ts` is 5 lines (delegating to `runToolStream(tool, req)`).

### Anti-Pattern 2: `'use client'` on the tool page itself

**What people do:** `'use client'` at the top of `app/tools/[slug]/page.tsx` so they can use `useState` for the form.
**Why it's wrong:** Pulls the whole page (and any imports, including the tool registry) into the client bundle. Forbids `params` being a server-resolved promise. Forbids `generateStaticParams`. Leaks server-only imports.
**Do this instead:** Page stays a Server Component. Render a small `<ToolRunner>` Client Component that owns the form state.

### Anti-Pattern 3: Importing the registry in client code

**What people do:** `import { tools } from '@/lib/tools/registry'` in a Client Component to render the tool cards.
**Why it's wrong:** Drags every tool's prompts, system messages, and schemas into the client bundle.
**Do this instead:** Import the registry only in Server Components. Pass a slimmed-down `ToolMeta[]` as props to client cards. Add `import 'server-only'` to `lib/tools/registry.ts` to enforce.

### Anti-Pattern 4: Hard-coding the model name across handlers

**What people do:** `streamText({ model: anthropic('claude-3-5-sonnet') })` in each route file.
**Why it's wrong:** Upgrading models = 6+ file edits. Easy to leave one stale.
**Do this instead:** Default model in `ai/anthropic.ts` (or `lib/env.ts`); per-tool overrides via `tool.model.name`.

### Anti-Pattern 5: Logging user input

**What people do:** `console.log({ input })` in route handlers "for debugging".
**Why it's wrong:** Vercel logs are persisted; the site claims "no persistence of user inputs." A single mismatch breaks the trust promise.
**Do this instead:** Log only structural metadata (`tool.slug`, input length, token count, latency, error code). Wrap logging in a `telemetry.recordRun()` helper that doesn't take the raw input.

### Anti-Pattern 6: Trying to validate streaming JSON output token-by-token

**What people do:** Stream JSON from the LLM and parse `completion` on every chunk to render a structured UI.
**Why it's wrong:** Partial JSON is invalid; you'll spam `try/catch`. Some libraries claim to do streaming-JSON-repair; the abstraction is leaky.
**Do this instead:** Stream the textual representation (which the user wants to see *as code*), parse once when `isLoading` is false, then enable "Download as JSON". Or use the AI SDK's `streamObject` for genuinely structured streaming if you need it.

### Anti-Pattern 7: Building the resume page before any tool works

**What people do:** Spend 2 days on perfect MDX components for the resume, then realize the tool harness needs a rewrite.
**Why it's wrong:** Inverts the risk order. The resume is a known unknown (we know what a resume looks like). The tool harness is an unknown unknown (depends on what the LLM actually returns).
**Do this instead:** Build order above — tools first, content second, polish third.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Anthropic Claude | `@ai-sdk/anthropic` provider, `streamText`/`generateText` | Single env var (`ANTHROPIC_API_KEY`); model name in code (or env). Streaming is HTTP/SSE, works on both Edge and Node. |
| Upstash Redis (rate limit) | `@upstash/redis` + `@upstash/ratelimit` over HTTPS | Free tier handles 10k commands/day. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. |
| Vercel Analytics | `@vercel/analytics/next` `<Analytics/>` component | Zero-config; auto-included via Vercel deployment. |
| Vercel platform | Deploy from git, env vars in dashboard | Set spend alerts; Hobby tier is fine for v1. |
| (v1.5) Plausible/Posthog | Script tag in `app/layout.tsx` | Only if Vercel Analytics insufficient. |
| (v2) GitHub | Embedded "view source" links per tool | Static links; no integration needed. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Client component ↔ Route handler | HTTP POST (JSON) with streaming text response | `useCompletion` from `ai/react`. |
| Route handler ↔ `ai/stream.ts` | Direct function call (same process, Node) | `runToolStream(tool, req)`. |
| `ai/stream.ts` ↔ Anthropic | HTTPS via `@ai-sdk/anthropic` | Streaming SSE. |
| Middleware ↔ Upstash | HTTPS Redis | Single ~10ms round trip per request. |
| MDX content ↔ pages | Build-time `import` | Static. |
| Registry ↔ pages | Server-only import (`import 'server-only'` in `registry.ts`) | Never crosses RSC boundary except as `ToolMeta` props. |

## Sources

- [Next.js Route Handlers (v16.2.6, May 2026)](https://nextjs.org/docs/app/api-reference/file-conventions/route) — HIGH confidence; verified `runtime`, `maxDuration`, streaming patterns, request/response APIs.
- [Next.js Server and Client Components (v16.2.6)](https://nextjs.org/docs/app/getting-started/server-and-client-components) — HIGH confidence; RSC ↔ Client boundary patterns, `server-only` package, interleaving.
- [Next.js Edge Runtime API (v16.2.6)](https://nextjs.org/docs/app/api-reference/edge) — HIGH confidence; explicit list of supported APIs, confirms `fs`/`require` unavailability on Edge.
- [Next.js Server Actions / Forms guide (v16.2.6)](https://nextjs.org/docs/app/guides/forms) — HIGH confidence; Server Actions limitations vs Route Handlers for streaming.
- [Vercel AI SDK docs](https://ai-sdk.dev/docs) and [streamText reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text) — MEDIUM confidence (training data + Next.js docs' own streaming example cite the SDK). Verify exact import paths and method names when implementing.
- Project context: `/Users/ruslankanat/Documents/resume-website/.planning/PROJECT.md` — stack, constraints, scope.

---
*Architecture research for: AI-tool-suite Next.js app on Vercel with Anthropic Claude*
*Researched: 2026-05-14*
