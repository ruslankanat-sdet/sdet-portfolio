# Stack Research

**Domain:** Next.js + Vercel site hosting multiple stateless Anthropic-Claude-backed AI tools (SDET/QA toolkit + personal portfolio, single author, ship-in-days)
**Researched:** 2026-05-14
**Confidence:** MEDIUM-HIGH overall

> **Verification caveat (read first).** This sandbox blocked web search, web fetch, Context7, and shell access during research, so I could not pull live npm/registry metadata on 2026-05-14. Versions below come from my training data (cutoff January 2026) and the well-known release cadence of these projects. **The CHOICE of library is HIGH confidence** for almost every item — these are the obvious 2026 picks. **The exact PATCH version is MEDIUM confidence**; pin to "latest" of the named major during `npm install` and accept whatever resolves. Where I flag a version as LOW confidence, double-check before committing to it.

---

## TL;DR — The Stack in One Page

- **Framework:** Next.js 15 (App Router) on Node 20 LTS runtime — *not* Edge for tool routes.
- **UI:** Tailwind CSS v4 + shadcn/ui (Radix primitives, copy-paste components) + `lucide-react` icons.
- **LLM:** `@anthropic-ai/sdk` directly (NOT Vercel AI SDK) — `claude-sonnet-4-5` for tools, `claude-haiku-4-5` as the cheap fallback. Streaming via the SDK's native `messages.stream()`.
- **Transport:** Route Handlers (`app/api/.../route.ts`) for the tool calls — *not* Server Actions. Streaming responses need a real HTTP boundary.
- **Validation:** Zod 3 for input schemas + Anthropic tool-use JSON output validation.
- **Rate limiting:** `@upstash/ratelimit` + Upstash Redis (via Vercel Marketplace integration). Sliding-window per-IP.
- **OpenAPI parsing:** `@apidevtools/swagger-parser` (deref + validate) + `openapi-types` for typing.
- **File uploads:** Multipart parsing in a Node-runtime route handler. Hard cap 1 MB body, reject larger with 413. No Vercel Blob in v1.
- **Markdown:** MDX via `@next/mdx` for the resume/About page. Static.
- **Syntax highlighting:** `shiki` (build-time for static pages; runtime in a Node route for generated code blocks). Compile with `bundledLanguages` restricted to ts/python/json/yaml/sql/bash to keep the bundle slim.
- **Analytics:** Vercel Analytics + Vercel Speed Insights (cookieless, no consent banner needed).
- **Dev tooling:** TypeScript 5.6+, ESLint 9 (flat config) with `eslint-config-next`, Prettier 3, Vitest 2 for unit tests, Playwright 1.49+ for E2E on the site itself (meta touch for SDET portfolio).
- **Package manager:** pnpm 9 (Vercel auto-detects; faster installs, deterministic).

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | `15.x` (App Router) | React framework, routing, RSC, route handlers, static + dynamic rendering, edge-or-node runtime per route | The default Vercel target; App Router is GA-stable in 15 with `unstable_cache`, partial prerendering and stable Server Actions. v15 also resolved most of the React 19 RSC issues that plagued v14. Required for `searchParams`/`params` now being Promises (v15 breaking change) — flag for any code copied from v14 tutorials. **Confidence: HIGH** on Next 15. |
| **React** | `19.x` | UI library (pinned by Next 15) | Next 15 requires React 19. Use Server Components by default; only mark client components with `"use client"` when interactive. **Confidence: HIGH** |
| **TypeScript** | `5.6+` | Static typing, end-to-end | Non-negotiable for an SDET portfolio (signals craft). Use `"strict": true`. **Confidence: HIGH** |
| **Tailwind CSS** | `4.x` | Utility-first styling | Tailwind v4 ships zero-config via the `@tailwindcss/postcss` plugin (or the dedicated Vite/Next integration). Massively faster builds than v3, CSS-first config via `@theme`. Confirm shadcn/ui has a v4-ready preset before adopting — if the preset is still v3-only at install time, use Tailwind 3.4. **Confidence: MEDIUM** on the v4 vs v3.4 call — make the final decision at install time based on the shadcn registry README. |
| **shadcn/ui** | `latest` (registry, not a versioned package) | Copy-in component library on Radix primitives | Not an npm package — you `npx shadcn@latest add button card …`. Owns its source in your repo, so you can tweak/style freely. Pairs perfectly with Tailwind. The de facto 2026 default for "I need decent components in an afternoon." Use components: `button`, `card`, `tabs`, `textarea`, `input`, `select`, `dialog`, `toast` (Sonner), `skeleton`, `dropdown-menu`, `sheet`, `separator`, `badge`. **Confidence: HIGH** |
| **Radix UI** | (transitive via shadcn) | Unstyled accessible primitives | Pulled in automatically by shadcn components. WCAG AA out of the box — covers your accessibility requirement for dialogs, dropdowns, tabs. **Confidence: HIGH** |
| **`@anthropic-ai/sdk`** | `0.30.x` or newer (likely `0.3x`-`0.4x` series in May 2026) | Anthropic Claude API client | Official SDK. Direct usage gives you full access to tool use, streaming, prompt caching, and the latest model IDs the moment Anthropic ships them. Avoid Vercel AI SDK abstraction for tool routes — see "What NOT to Use" below. **Confidence: HIGH** on the choice; MEDIUM on the exact version — pin to `^0.30.0` or whatever resolves at install time. |

**Claude model selection (HIGH confidence on names, MEDIUM on which is "latest"):**
- **Primary:** `claude-sonnet-4-5` (model ID literal: `claude-sonnet-4-5-20250929` or newer dated release). Strong code generation, structured tool use, ~200K context, sub-30s on most tool prompts. Use as default for Test Automator, API Test Generator.
- **Fallback / cheap path:** `claude-haiku-4-5` (or whatever the current cheap Haiku is). Use for Test Data Generator where reasoning is light — saves ~3-5× on tokens.
- **Avoid in v1:** `claude-opus-4-x` — too slow and too expensive for free public tools; reserve for v2 if you ever offer a "deep mode."
- **Read model ID from env, not hard-coded:** `process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929"`. Lets you swap without redeploy.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **`zod`** | `3.23+` | Runtime input validation, type inference | Validate every tool's HTTP request body. Also validate the JSON Claude returns via tool use (`tools[].input_schema` should be the Zod JSON-schema equivalent — use `zod-to-json-schema` or hand-write the JSON schema and mirror it in Zod for parsing the response). **Confidence: HIGH** |
| **`zod-to-json-schema`** | `3.x` | Convert Zod schemas → JSON Schema for Claude tool-use definitions | Eliminates schema duplication: define once in Zod, emit JSON Schema for the Anthropic `tools[].input_schema` field. **Confidence: HIGH** |
| **`@upstash/ratelimit`** | `2.x` | Sliding-window rate limiter | Per-IP rate limiting on each tool route. Pairs with Upstash Redis. **Confidence: HIGH** |
| **`@upstash/redis`** | `1.34+` | Serverless Redis client (REST-based, works in any runtime) | Backing store for `@upstash/ratelimit`. Free tier covers a personal portfolio easily. **Confidence: HIGH** |
| **`@apidevtools/swagger-parser`** | `10.x` | Parse, validate, dereference OpenAPI 2/3 specs | Required by the API Test Generator tool. Handles `$ref` resolution (critical — most real-world specs have refs). Validates against the OpenAPI meta-schema before you waste a Claude call on garbage input. **Confidence: HIGH** |
| **`openapi-types`** | `12.x` | TypeScript types for OpenAPI documents | Use to type the parsed spec inside your tool logic. **Confidence: HIGH** |
| **`shiki`** | `1.x` (likely `1.20+` in mid-2026) | Syntax highlighting | TextMate-grammar-based, server-renderable, no client JS required for static pages. For LLM-generated code blocks: highlight server-side in the route handler before returning HTML, OR ship the highlighter on the client (~50–100 KB gz when restricted to a few languages). Use `createHighlighter({ langs: ['typescript', 'python', 'json', 'yaml', 'sql', 'bash'], themes: ['github-dark'] })`. **Confidence: HIGH** |
| **`@next/mdx`** | matches Next 15 | MDX support for the resume/About page | Lets you write the resume in Markdown with embedded React components (e.g., `<Skill>`, `<Job>` blocks). Statically rendered, zero LLM cost. **Confidence: HIGH** |
| **`remark-gfm`** | `4.x` | GitHub-flavored Markdown (tables, strikethrough, task lists) | Plug into the MDX pipeline. **Confidence: HIGH** |
| **`rehype-shiki`** or **`@shikijs/rehype`** | latest | Build-time syntax highlighting in MDX | Use for code blocks in the resume's markdown so you never ship a client-side highlighter for static content. **Confidence: HIGH** |
| **`lucide-react`** | `0.4xx+` | Icon set | shadcn/ui default. Tree-shakeable, MIT, sane SVGs. **Confidence: HIGH** |
| **`sonner`** | `1.x` | Toast notifications | Used by shadcn's `toast` component now (preferred over the legacy custom toast). Use for "Copied!" and error toasts. **Confidence: HIGH** |
| **`react-hook-form`** | `7.5x+` | Form state + validation | Wire to Zod via `@hookform/resolvers`. Three tool forms in v1 all benefit. **Confidence: HIGH** |
| **`@hookform/resolvers`** | `3.x` | Zod adapter for react-hook-form | **Confidence: HIGH** |
| **`clsx`** + **`tailwind-merge`** (or `cva`) | latest | Conditional class composition | shadcn/ui ships a `cn()` helper that wraps these. Standard. **Confidence: HIGH** |
| **`@vercel/analytics`** | `1.4+` | First-party analytics | Cookieless. Free hobby tier. No consent banner needed under GDPR for purely aggregate, no-identifiers analytics — confirm with current Vercel docs. **Confidence: HIGH** on library choice; **MEDIUM** on the "no consent banner" claim (verify with Vercel's GDPR page before launch). |
| **`@vercel/speed-insights`** | `1.x` | Real-user Web Vitals | Free, cookieless. Helps prove "LCP < 2s on 4G" claim. **Confidence: HIGH** |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **pnpm** `9.x` | Package manager | Vercel auto-detects from `pnpm-lock.yaml`. Faster than npm/yarn, strict by default. **Confidence: HIGH** |
| **ESLint** `9.x` (flat config) | Linting | Use `eslint-config-next` (Next.js maintains it). Note: Next 15 + ESLint 9 needs flat config (`eslint.config.mjs`); old `.eslintrc.json` is deprecated. **Confidence: MEDIUM** — Next.js 15 supports both; check the create-next-app output and follow it. |
| **Prettier** `3.x` | Formatting | With `prettier-plugin-tailwindcss` for class sorting. **Confidence: HIGH** |
| **Vitest** `2.x` | Unit tests | Faster than Jest, Vite-powered, TS-native. Use for: prompt template snapshots, Zod schema tests, OpenAPI parser wrapper tests, rate-limit logic tests. **Confidence: HIGH** |
| **Playwright** `1.49+` | E2E tests | **Meta touch for SDET portfolio: the site that generates Playwright code is itself tested with Playwright.** Run against `next dev` in CI. Cover: landing page renders, each tool form submits, error states show, accessibility (axe). **Confidence: HIGH** |
| **`@axe-core/playwright`** | A11y assertions in E2E | Backs the WCAG AA requirement with proof. **Confidence: HIGH** |
| **`@playwright/test`** | Test runner | Bundled with Playwright. **Confidence: HIGH** |
| **GitHub Actions** | CI | Lint + typecheck + Vitest + Playwright on every PR. Vercel handles deploy. **Confidence: HIGH** |

---

## Installation

```bash
# Bootstrap (App Router, TS, Tailwind, ESLint, src/ dir, no /pages, with import alias)
pnpm create next-app@latest sdet-toolkit \
  --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"

cd sdet-toolkit

# shadcn/ui init
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card tabs textarea input select dialog \
  dropdown-menu sheet badge separator skeleton sonner

# LLM + validation
pnpm add @anthropic-ai/sdk zod zod-to-json-schema

# Rate limiting
pnpm add @upstash/ratelimit @upstash/redis

# OpenAPI tooling (API Test Generator)
pnpm add @apidevtools/swagger-parser openapi-types

# Forms
pnpm add react-hook-form @hookform/resolvers

# MDX (resume / About page)
pnpm add @next/mdx @mdx-js/loader @mdx-js/react remark-gfm @shikijs/rehype shiki

# Analytics
pnpm add @vercel/analytics @vercel/speed-insights

# Icons + toasts
pnpm add lucide-react sonner

# Dev: testing + a11y
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom \
  @playwright/test @axe-core/playwright \
  prettier prettier-plugin-tailwindcss \
  @types/node

# Install Playwright browsers
pnpm exec playwright install --with-deps chromium
```

---

## Architectural Patterns (the prescriptive part)

### 1. Server Actions vs API Route Handlers — **use Route Handlers for tool calls**

| Concern | Server Actions | Route Handlers (`app/api/.../route.ts`) |
|---------|----------------|------------------------------------------|
| Streaming responses | Awkward — possible via `useActionState` but constrained | Native: return a `Response` wrapping the Anthropic SDK stream |
| Per-IP rate limiting | Hard — no clean access to the request before action runs | Trivial — `Ratelimit.limit(ip)` in the handler |
| Public POST from non-React clients (curl, future API) | No | Yes |
| Form-only mutations on the same page | Ideal | Overkill |
| Cacheable error semantics, idempotency keys | Limited | Full HTTP control |

**Decision: Route Handlers for every tool.** Server Actions are great for things like "subscribe to newsletter" — none of which exist in v1. Don't fight the framework.

```ts
// app/api/tools/test-automator/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

export const runtime = "nodejs"; // NOT "edge" — see below
export const maxDuration = 60;   // Vercel hobby caps at 60s; tools target ~30s

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "rl:tool:test-automator",
});

const Input = z.object({
  source: z.enum(["url", "userStory"]),
  content: z.string().min(10).max(8_000),
  language: z.enum(["typescript", "python"]),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);
  if (!success) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
      },
    });
  }

  const parsed = Input.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  // Streaming response — SSE-style passthrough
  const stream = await anthropic.messages.stream({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(parsed.data) }],
  });

  return new Response(stream.toReadableStream(), {
    headers: { "Content-Type": "text/event-stream" },
  });
}
```

### 2. Streaming vs single-response — **stream the code-generation tools, single-shot the JSON tools**

- **Stream:** Test Automator (code output, users want to see it appear), Flaky Diagnoser (long-form prose), Bug Report Polisher.
- **Single-shot:** Test Data Generator (you need the full JSON before you can render/validate), API Test Generator (multi-block structured output benefits from one validate-then-render pass).
- For single-shot, still use `messages.create()` with `stream: false`. Add a client-side skeleton/progress indicator — *perceived* speed beats actual streaming for sub-15-second responses.

### 3. Tool use / structured output — **Anthropic native tool use, NOT prompt-and-pray JSON**

For tools that must return structured data (Test Data Generator, API Test Generator):

```ts
const tools = [
  {
    name: "emit_test_data",
    description: "Return synthetic test data matching the schema",
    input_schema: zodToJsonSchema(TestDataSchema) as Anthropic.Messages.Tool.InputSchema,
  },
];

const response = await anthropic.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 8192,
  tools,
  tool_choice: { type: "tool", name: "emit_test_data" }, // force the tool call
  messages: [{ role: "user", content: userPrompt }],
});

const toolUse = response.content.find((b) => b.type === "tool_use");
if (!toolUse || toolUse.name !== "emit_test_data") throw new Error("model_did_not_emit");
const validated = TestDataSchema.parse(toolUse.input); // Zod validates Claude's output
```

This pattern eliminates the entire class of "the model wrapped JSON in markdown fences" bugs.

### 4. Edge vs Node runtime — **Node, not Edge, for tool routes**

| Reason | Detail |
|--------|--------|
| Anthropic SDK | Officially supports both, but Node gets the most testing. Node is the safe default. |
| OpenAPI parser | `@apidevtools/swagger-parser` uses Node `fs` paths internally for some flows — Edge incompatible. |
| `maxDuration` | Node functions get 60s on Hobby, 300s on Pro. Edge is 25s. Critical for 30s+ tool calls. |
| File uploads | Multipart parsing in Edge is painful; Node has the established middleware. |
| Cold starts | A handful of ms slower than Edge, but irrelevant for a 5-15s LLM call. |

**Set `export const runtime = "nodejs"` explicitly on every tool route.** Set `export const runtime = "edge"` only on truly static, low-latency paths (e.g., a future health-check endpoint).

### 5. File upload handling — **strict caps, Node runtime, in-memory only**

```ts
export const runtime = "nodejs";

export async function POST(req: Request) {
  // Hard cap before parsing
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > 1_000_000) return new Response("Payload too large", { status: 413 });

  const form = await req.formData();
  const file = form.get("spec");
  if (!(file instanceof File)) return new Response("Bad request", { status: 400 });
  if (file.size > 1_000_000) return new Response("Payload too large", { status: 413 });
  if (!/^(application\/(json|x-yaml|yaml)|text\/(yaml|plain))$/.test(file.type)) {
    return new Response("Unsupported media type", { status: 415 });
  }

  const text = await file.text(); // never write to disk
  // → parse with swagger-parser, then hand to Claude
}
```

- **v1 cap:** 1 MB. OpenAPI specs that exceed this are rare and rejected with a clear message.
- **Vercel hard cap:** Hobby plan body-size limits apply to route handlers (~4.5 MB). Stay well under.
- **No Vercel Blob, no S3 in v1.** Inputs are processed in-request and discarded — matches the "no persistence" promise.

### 6. Rate limiting — **per-IP, per-tool, sliding window**

| Layer | Limit | Why |
|-------|-------|-----|
| Per-IP, per-tool | 10 requests / 60s sliding window | Stops a single tab from burning your budget |
| Per-IP, global (across all tools) | 30 requests / 60s | Backstop against an attacker hitting every endpoint |
| Per-deployment global (optional) | 1000 requests / hour | "Recruiter HN'd me" panic brake |

Implement with `@upstash/ratelimit`; deploy Upstash Redis via the **Vercel Marketplace integration** (auto-wires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` into env vars). Free tier easily covers a portfolio.

Always set `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` so the client can render a friendly "try again in N seconds" UI.

### 7. Copy-to-clipboard UX

Use the native `navigator.clipboard.writeText()` inside a client component. Fire a `sonner` toast (`"Copied!"`). No library needed. Wrap with `lucide-react`'s `Copy` / `Check` icons; swap icons for 1.5s on success — visual feedback is what users actually notice.

### 8. Syntax highlighting — Shiki, two modes

- **Static (resume/About page MDX code blocks):** `@shikijs/rehype` in the MDX pipeline. Highlighting happens at build time. **Zero runtime cost, zero client JS for highlighting.**
- **Dynamic (LLM-generated code in tool output):** Pre-highlight in the route handler before streaming back HTML, OR ship a slim client highlighter with `langs: ['typescript', 'python', 'json', 'yaml', 'sql', 'bash']` only. Restrict bundled langs aggressively — full Shiki is ~6 MB; restricted is ~80-120 KB gz.

### 9. Analytics — no consent banner needed

- **`@vercel/analytics`** + **`@vercel/speed-insights`** are cookieless and aggregate-only. Under GDPR these typically don't require a consent banner — **verify with Vercel's current privacy docs before launch** (this is the one area where regulations shift faster than my training data; LOW confidence on the legal interpretation, HIGH confidence on the technical claim that the libraries themselves are cookieless).
- **Alternative if Vercel's terms have shifted:** Plausible (self-hosted or cloud) — also cookieless, also banner-free in most EU jurisdictions, paid.

### 10. Markdown / MDX strategy for resume

```
src/content/
├── resume.mdx          ← long-form resume; MDX with custom <Job>, <Skill> components
├── about.mdx           ← shorter bio
└── tools/
    ├── test-automator.mdx     ← copy describing each tool
    └── ...
```

Render with `@next/mdx`. Statically generated → LCP < 2s requirement is trivially met. Download PDF button → generate the PDF at build time via Playwright print-to-PDF (yes, again: SDET portfolio meta-flex), OR keep a hand-maintained PDF in `/public`.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `@anthropic-ai/sdk` direct | **Vercel AI SDK (`ai` package + `@ai-sdk/anthropic`)** | You want a unified streaming/UI abstraction across multiple LLM providers, or you want React hooks like `useChat`/`useCompletion` for free. Skipped here because: (a) you're single-provider (Claude), (b) Anthropic tool-use semantics are richer than the AI SDK's generic abstraction in places, (c) one less abstraction layer = one less version to track. **Reconsider when you add a second model provider.** |
| Route Handlers | **Server Actions** | Mutations that don't need streaming/rate-limit headers, e.g., a contact-form submission. None in v1 scope. |
| Zod | **Valibot** / **ArkType** | Valibot wins on bundle size; ArkType on TS inference perf. Neither has the ecosystem of Zod yet (`@hookform/resolvers`, `zod-to-json-schema`, AI SDK adapters all default to Zod). Stick with Zod. |
| shadcn/ui | **Mantine** / **Chakra** / **MUI** | If you wanted out-of-the-box theming and didn't want to own component source. shadcn wins for an SDET portfolio because: ownership of source = customization is trivial = the site doesn't look like every other component-library demo. |
| Upstash Redis + `@upstash/ratelimit` | **Vercel KV** | Vercel KV is now powered by Upstash under the hood (since the 2024 marketplace consolidation), but `@upstash/ratelimit` works with both. Upstash Redis (via marketplace) gives slightly more flexible pricing. Either is fine — `@upstash/ratelimit` abstracts the connection. **Confidence: MEDIUM** on the consolidation history; outcome is the same regardless. |
| Shiki | **Prism.js** / **highlight.js** | Prism and highlight.js are smaller out-of-the-box, but Shiki uses real TextMate grammars (same as VS Code) → vastly better fidelity for the *generated* code you're showing recruiters. The bundle hit is worth it when "the code looks like code" is core to your value prop. |
| Vitest | **Jest** | Jest if your team already has a Jest config to inherit. Greenfield → Vitest every time. |
| Playwright | **Cypress** / **Puppeteer** | Playwright is also the test framework you're generating code *for* in the Test Automator tool — eating your own dogfood is the meta point. |
| `@apidevtools/swagger-parser` | **`openapi-zod-client`** / **`@redocly/openapi-core`** | Redocly is heavier-weight but better if you want linting too. `openapi-zod-client` generates a typed client — not what you need; you only need to *parse* the spec to feed Claude. swagger-parser is the lightest correct choice. |
| Next.js 15 App Router | **Astro** / **Remix** / **SvelteKit** | Astro for content-heavy sites with islands; Remix for nested-route-heavy apps. Next + Vercel is the path of least resistance for AI-backed tools — every example in the Anthropic and Vercel docs assumes this stack. Save the framework debate for v3. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **An ORM (Prisma, Drizzle, Kysely)** | No database in v1. An ORM adds 100KB+ of cold-start weight and a migration system for zero value. | Nothing. Statelessness is a feature. |
| **NextAuth.js / Auth.js / Clerk / Lucia** | No accounts in v1. Even "just in case" auth adds a session table, env vars, redirect pages, and OAuth provider setup. | Nothing. |
| **tRPC** | Brilliant when you have a typed client+server boundary in the same monorepo with rich data fetching. For three POST endpoints that each take a string and return a stream, it's overkill. Server Components + Route Handlers + Zod cover the safety story without a runtime. | Route Handlers + Zod request validation. |
| **GraphQL (Apollo / urql / Yoga)** | Three POST endpoints with stable shapes. GraphQL would add hundreds of KB and a schema-first workflow you don't need. | REST POST endpoints. |
| **Redux / Zustand / Jotai (global state)** | Each tool is a self-contained page with a form and an output area. No cross-page state. | Local `useState` + URL search params for shareable links. |
| **A heavy chart library (recharts/visx) in v1** | None of the v1 tools render charts. Adds bundle weight. | Add only when v2 metrics dashboard ships. |
| **Vercel AI SDK (`ai` package)** in v1 | See "Alternatives Considered." Adds an abstraction over an SDK you're only calling for one provider, and partially hides Anthropic-specific features (tool use, prompt caching) behind a generic interface. | `@anthropic-ai/sdk` directly. Revisit if/when you add OpenAI/Gemini. |
| **Edge Runtime** for tool routes | 25-second wall clock + spotty native-module support + opaque OpenAPI parser failures. | `runtime = "nodejs"` on every tool route. |
| **`dangerouslySetInnerHTML`** for LLM output | Prompt injection → XSS escalation in 30 lines of code. Even though it's "just code text," never trust LLM output as HTML. | Render as `<pre><code>{text}</code></pre>` with Shiki's safe HTML output, or as a textarea/copyable block. |
| **`fetch`-ing the Anthropic API by hand** | The SDK handles retries, streaming primitives, error class hierarchy (`Anthropic.APIError`, `RateLimitError`, etc.) and version pinning. Rolling your own loses all of that. | `@anthropic-ai/sdk`. |
| **Sentry / DataDog / paid APM** in v1 | Cost + complexity. You're trying to ship in days. | Vercel's built-in logs + `console.error` with structured JSON. Add Sentry in v1.5 if needed. |
| **Storybook** in v1 | You have 5-10 components and you're the only dev. Storybook is a week of yak-shaving for no v1 visitor value. | Build components in the actual pages. Add Storybook in v2 if the component library grows. |
| **A CMS (Sanity, Contentful, Payload)** | Single-author site with markdown content. CMS adds API calls, build webhooks, content-modeling overhead. Explicitly out of scope in PROJECT.md. | MDX files in `src/content/`. |

---

## Stack Patterns by Variant

**If you start receiving real recruiter traffic and the free tier strains:**
- Upgrade Vercel Hobby → Pro ($20/mo). Unlocks 300s `maxDuration`, more bandwidth, team analytics.
- Move rate-limit thresholds *down* before *up* — protect the budget.
- Add Anthropic prompt caching for the system prompts (the Anthropic SDK supports `cache_control: { type: "ephemeral" }`). Cuts ~80% of system-prompt cost on repeated tool runs.

**If you add a second LLM provider in v1.5/v2:**
- *Then* consider Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/openai`). The unified streaming + tool-call interface starts paying for itself.
- Keep `@anthropic-ai/sdk` direct for any Anthropic-specific feature (prompt caching, certain beta tool-use features) that's not yet in the AI SDK.

**If you decide to add user-saved outputs (v1.5):**
- Stay client-side: `localStorage` + JSON export/import. Still no DB.
- Only escalate to server-side persistence (Vercel KV / Postgres) if you add accounts — which PROJECT.md says you won't.

**If you add SEO/social cards (v1.5):**
- Use Next.js `generateMetadata` + the built-in OG image generation (`ImageResponse` from `next/og`) — no extra libraries.

---

## Version Compatibility & Gotchas

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@15` | `react@19`, `react-dom@19`, Node `>=18.18` (Node 20 recommended) | Next 15 **requires** React 19. Don't mix with React 18 packages. |
| `next@15` App Router | `params` / `searchParams` are now `Promise`-wrapped | Breaking change from v14: `export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; }`. Most online tutorials are still pre-v15 — verify any pasted code. |
| `tailwindcss@4` | shadcn/ui registry | Confirm shadcn has shipped a v4-compatible registry at install time. If still v3, use `tailwindcss@3.4` — it's not worth fighting a half-migrated component library. **Re-verify on install day.** |
| `eslint@9` | `eslint-config-next@15` | Requires flat config (`eslint.config.mjs`). The Next.js installer scaffolds this correctly for v15 — keep what it generates. |
| `@anthropic-ai/sdk` | Node `>=18` | Uses native `fetch` and `ReadableStream`. Works in both Node and Edge runtimes; recommend Node (see above). |
| `@upstash/ratelimit@2` + `@upstash/redis@1.34+` | Any runtime (Node + Edge) | REST-based, no TCP — works everywhere. Use `Redis.fromEnv()` to auto-wire from Vercel env vars. |
| `shiki@1.x` | ESM-only | If you have any CommonJS holdouts in your toolchain (unlikely with Next 15), this bites. Next 15 + ESM is the default — fine. |
| `playwright` E2E in CI | GitHub Actions `ubuntu-latest` | Use `microsoft/playwright-github-action` or run `pnpm exec playwright install --with-deps chromium` in the workflow. Pin Playwright version in CI to match local. |

---

## Environment Variables

Set in Vercel project settings (and `.env.local` for dev):

```bash
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929  # swap without redeploy
UPSTASH_REDIS_REST_URL=https://...           # auto-set by Vercel marketplace integration
UPSTASH_REDIS_REST_TOKEN=...                 # auto-set by Vercel marketplace integration

# Optional spend safety
RATE_LIMIT_PER_IP_PER_MIN=10
GLOBAL_RATE_LIMIT_PER_HOUR=1000
```

Add Vercel spend alerts at $5 and $20 thresholds.

---

## Sources & Confidence

This sandbox blocked external lookups. The list below is what I would have verified given access. Confidence ratings reflect my training-data familiarity with each:

- **Next.js 15 release notes** (nextjs.org/blog/next-15) — patterns and Promise-wrapped params: **HIGH** confidence (well-documented).
- **Anthropic API docs** (docs.anthropic.com) — tool use, streaming, model IDs: **HIGH** confidence on patterns; **MEDIUM** on the exact "latest" model dated suffix at 2026-05-14 — confirm at install time.
- **Vercel AI SDK docs** (sdk.vercel.ai) — for the "what we're NOT using" comparison: **HIGH** confidence.
- **shadcn/ui docs** (ui.shadcn.com) — registry components and Tailwind v4 compatibility status: **MEDIUM** confidence on v4 readiness — re-verify.
- **Upstash docs** (upstash.com/docs/redis/sdks/ratelimit) — sliding-window patterns and Vercel integration: **HIGH** confidence.
- **Shiki docs** (shiki.style) — language restriction and rehype plugin: **HIGH** confidence.
- **Tailwind CSS v4 docs** (tailwindcss.com) — zero-config setup, `@theme` CSS-first config: **MEDIUM** confidence on the install-day status (v4 was in alpha late 2024, GA expected by mid-2025 — should be solid by May 2026).
- **swagger-parser** (apidevtools.org/swagger-parser) — deref/validate APIs: **HIGH** confidence.

**Pre-install checklist (5 minutes, before writing the first line of code):**
1. `pnpm view next version` — confirm Next 15.x is current.
2. `pnpm view @anthropic-ai/sdk version` — confirm SDK version, scan changelog for 6 months back.
3. Visit docs.anthropic.com/en/docs/about-claude/models — copy the current `claude-sonnet-4-5-*` dated model ID into `ANTHROPIC_MODEL`.
4. Visit ui.shadcn.com — confirm "Tailwind v4 supported" before choosing v4 over v3.4.
5. `pnpm view tailwindcss version` — confirm v4 is the default.

---

*Stack research for: AI-powered SDET toolkit web app on Next.js + Vercel*
*Researched: 2026-05-14*
