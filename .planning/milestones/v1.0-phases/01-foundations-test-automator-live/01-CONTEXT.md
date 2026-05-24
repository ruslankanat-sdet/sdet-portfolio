# Phase 1: Foundations + Test Automator Live - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Bootstrap the Next.js/Vercel/Claude foundation and ship a working Test Automator as the first interactive tool inside the IDE portfolio shell — publicly accessible at a Vercel URL, end-to-end, with rate limiting and no-persistence guarantees in place.

The "landing page" for this phase IS the IDE shell itself. Phase 1 builds the full IDE chrome (topbar, sidebar, editor area, terminal, statusbar) with README.md as the default open file and the Test Automator wired in as the first tool. There is no traditional landing page — the IDE shell is the site.

</domain>

<decisions>
## Implementation Decisions

### Site Architecture
- **D-01:** The entire site is a single IDE shell. Tools open in the editor area; bio/resume content opens as "files" in the editor. No traditional multi-page site layout — one coherent shell wraps everything.
- **D-02:** Phase 1 builds the full IDE shell structure (topbar, sidebar with file tree, editor pane, terminal, statusbar) — not a placeholder. The design handoff at `.planning/design/design_handoff_ide_portfolio/` is the canonical source of truth for all visual/layout decisions.
- **D-03:** Content from `Alex Morgan` in the design files must be replaced with Ruslan Kanatbek's real content. Resume source is at `.planning/content/resume Ruslan Kanatbek.pdf`.

### Default State (what a visitor sees on load)
- **D-04:** `README.md` is open by default in the editor area on first visit. It serves as the site intro — orients visitors before they click anything. It should explain the IDE metaphor briefly and point them to tools and the bio.
- **D-05:** The sidebar file tree has a `tools/` folder (with Test Automator as the first entry) and an `about/` folder (bio.json, experience.yaml, etc.). Tools folder is open/expanded by default.

### Test Automator Input UX
- **D-06:** Input is a single textarea with a `URL | User Story` pill toggle above it. Clicking the toggle switches the input mode and updates placeholder text and client-side validation accordingly.
- **D-07:** URL mode validates that input starts with `http://` or `https://`. User Story mode accepts any non-empty text. Server-side validates both.

### Test Automator Output UX
- **D-08:** Generated code appears as sub-tabs inside the editor area: `▶ playwright.ts` and `▶ test_suite.py`. These are language-selector tabs within the tool pane — not new IDE tabs. The active sub-tab shows the syntax-highlighted streaming code block with line numbers.
- **D-09:** Streaming targets the active sub-tab. While one language streams, the other tab shows a subtle `generating...` placeholder. Copy and download buttons appear per-tab after generation completes.
- **D-10:** Below the code output: a collapsible `# Rationale` block (markdown-style, matches IDE aesthetic) explaining selectors chosen, edge cases covered.

### Demo Fixture
- **D-11:** The "Try with example" button pre-fills a user story that tests this portfolio site itself — e.g., `"User visits the IDE portfolio, opens the Test Automator tool from the sidebar, enters a user story, and receives streaming Playwright and Pytest test code within 30 seconds."` This is intentionally meta: an SDET's portfolio tests itself. The generated code should be impressive and recruiter-memorable.
- **D-12:** The fixture pre-fills in User Story mode (not URL mode).

### Visual / Design
- **D-13:** Dark theme (`#0b1117` base, `#3ddc84` green accent) from the design handoff. JetBrains Mono for code/mono text, Inter for UI. All design tokens are in `.planning/design/design_handoff_ide_portfolio/styles.css` — port values exactly.
- **D-14:** The terminal panel at the bottom shows the "smoke test" animation (fake log entries from `SAMPLE_LOGS` in `files.js`) triggered by the Run button in the topbar. In Phase 1 this is decorative/portfolio content — it does not run real tests.
- **D-15:** Statusbar right side shows `● Available for hire` in green — always visible.

### Infrastructure
- **D-16:** Upstash Redis rate limiting wired in Phase 1 (not deferred). Per-IP per-tool sliding window. Rate limit headers (`Retry-After`, `X-RateLimit-*`) on every 429 response.
- **D-17:** `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` as Vercel env vars. `import 'server-only'` on every module touching the SDK. CI grep for `sk-ant-` and `NEXT_PUBLIC_.*KEY` to verify no leakage.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design — Source of Truth
- `.planning/design/design_handoff_ide_portfolio/README.md` — Full layout spec: every screen, every component, interactions, animations, breakpoints. Read this first.
- `.planning/design/design_handoff_ide_portfolio/styles.css` — Canonical design tokens (colors, typography, spacing, radius, shadows, animations). Port values exactly — do not invent new values.
- `.planning/design/design_handoff_ide_portfolio/app.jsx` — Root component, state model, keyboard shortcuts. Use as component decomposition reference.
- `.planning/design/design_handoff_ide_portfolio/sidebar.jsx` — Activity bar + file tree + outline component reference.
- `.planning/design/design_handoff_ide_portfolio/workspace.jsx` — Tab bar, breadcrumb, editor, terminal, topbar, statusbar reference.
- `.planning/design/design_handoff_ide_portfolio/ai-chat.jsx` — Floating AI widget reference (Phase 1 can stub or fully implement).
- `.planning/design/design_handoff_ide_portfolio/syntax.jsx` — Hand-rolled tokenizer for syntax highlighting content. Port to TypeScript.
- `.planning/design/design_handoff_ide_portfolio/files.js` — File tree structure and content data model. Replace Alex Morgan content with Ruslan Kanatbek content.

### Content
- `.planning/content/resume Ruslan Kanatbek.pdf` — Real resume. Use for bio.json, experience.yaml, skills content in the IDE file tree.

### Requirements & Roadmap
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, and full requirements list (FOUND-01–08, FRAME-01–11, AUTO-01–07).
- `.planning/REQUIREMENTS.md` — Detailed requirement definitions for all Phase 1 REQ-IDs.

### Stack
- `CLAUDE.md` — Full stack spec: Next.js 15 App Router, @anthropic-ai/sdk direct, Route Handlers for tool calls, Node runtime (not Edge), Zod validation, @upstash/ratelimit + Upstash Redis. Read the "What NOT to Use" section to avoid wrong choices.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. No existing components to reuse.

### Established Patterns
- The design handoff JSX files show the intended component decomposition. Mirror the structure: `App` (root state), `Sidebar`, `Workspace` (editor + terminal), `AIChat`. Port to TypeScript React components in `src/components/ide/`.
- The `styles.css` in the design handoff is structured around CSS custom properties — port to either CSS Modules (per-component) or a single `globals.css` with the token definitions plus component-scoped styles. Do not reach for Tailwind for the IDE chrome — the existing CSS is well-structured and ports cleanly.
- The hand-rolled tokenizer in `syntax.jsx` should be ported to TypeScript as `src/lib/syntax-highlighter.ts`. Do not replace it with Shiki for IDE file content — Shiki is for the generated tool output only.

### Integration Points
- Test Automator tool UI renders inside the IDE editor pane. The editor area needs a render slot that switches between: (a) syntax-highlighted file content, (b) tool UI component. Route this via `activeFile` state — when `activeFile` is a tool entry, render the tool component instead of the code view.
- Tool API route: `app/api/tools/test-automator/route.ts` — Node runtime, streaming via `@anthropic-ai/sdk` `messages.stream()`, Zod input validation, Upstash rate limiting.

</code_context>

<specifics>
## Specific Ideas

- **Meta demo fixture:** The "Try with example" content tests the portfolio site itself. This is intentional — an SDET who tests their own portfolio is a strong signal. The generated tests should look real and impressive (good selector strategy, proper assertions, clear test names).
- **IDE shell is Phase 1 scope:** The full IDE chrome must be built in Phase 1 — not deferred to Phase 4. The tools need the shell to live in, and the shell is the "placeholder landing page" referenced in FOUND-05.
- **Alex Morgan → Ruslan Kanatbek:** All placeholder names, emails, GitHub/LinkedIn links, and metrics in `files.js` must be replaced. Real contact: ruslankanat.b@gmail.com. Real title: Senior SDET. Real metrics from resume (9+ yrs, Resmed/Gemini/Google experience, Playwright/Pytest/Cypress expertise).
- **Terminal smoke tests:** The fake terminal log animation runs against Ruslan's own bio content — e.g., log lines like `PASS  test_experience.py::test_resmed_sdet`, `PASS  test_skills.py::test_playwright_expertise`. Makes it personal and on-brand.

</specifics>

<deferred>
## Deferred Ideas

- **AI chat widget wired to real Claude endpoint:** The floating AI assistant can be stubbed with canned responses in Phase 1 if time is short. Full AI wiring (system prompt with resume context, real Claude API calls) is a strong candidate for Phase 4 or v1.5.
- **Mobile layout:** The design handoff explicitly notes mobile was not designed. Responsive/mobile layout for the IDE shell is Phase 5 (Hardening) scope, not Phase 1.
- **Light theme:** Design handoff includes a light theme. Toggle can be present in Phase 1 but full light theme polish is deferred.

</deferred>

---

*Phase: 1-Foundations + Test Automator Live*
*Context gathered: 2026-05-16*
