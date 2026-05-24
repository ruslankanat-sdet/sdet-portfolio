# Phase 2: Resume & About Layer — Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the "who built this" path in one click from the IDE shell. Specifically:
- A thin header nav strip visible on every page (CONT-01, CONT-04)
- `/about` page rendering full resume content from MDX (CONT-02)
- A downloadable static PDF linked from About (CONT-03)
- A two-variant footer consistent on all pages (CONT-05)

This phase adds no new tools, no AI features, no backend services. It is pure
content + layout work built on top of the Phase 1 IDE shell.

</domain>

<decisions>
## Implementation Decisions

### Navigation (CONT-01, CONT-04)

- **D-01:** Primary nav is a **thin dark header strip** rendered above the IDE chrome on the landing page and above the content on `/about`. Left side: candidate name + title ("Ruslan Kanatbek · Senior SDET"). Right side: "About / Resume" link. This strip is the shared layout element that gives every page consistent one-click access to the resume. Implemented as a Server Component in the root layout (`src/app/layout.tsx`) so it inherits automatically without repeating per-page.

### About Page Layout (CONT-02)

- **D-02:** `/about` is a **clean document page** — dark background using the existing design tokens (`--color-bg`, `--color-surface`, etc.), max-width prose container (no wider than ~720px), no IDE sidebar or terminal panes. It should feel like a polished resume site, not an IDE. Recruiter-friendly reading is the priority. Use the same font vars (`--font-inter` for body, `--font-mono` for code/labels) and color tokens already in `globals.css` — no new design values.

### MDX Content Structure (CONT-02)

- **D-03:** Narrative-first section order in the MDX file:
  1. **Short bio / summary** — 2–3 sentences in first person. Who I am, what I build, what I'm looking for.
  2. **What I build** — A focused paragraph or short list of the kinds of systems/tools I deliver (self-healing suites, LLM eval pipelines, CI infrastructure). This is the SDET value prop before listing jobs.
  3. **Experience** — Reverse chronological. Each role: company, title, dates, 3–5 bullet achievements. Pull from `.planning/content/resume Ruslan Kanatbek.pdf` directly.
  4. **Skills & Tools** — Grouped by category (Languages, Test Frameworks, CI/CD, Cloud/Infra). Concise, no ratings/bars.
  5. **Projects** — 2–4 notable projects with a 1-sentence description and tech stack tag line.
  6. **Contact** — Email, GitHub, LinkedIn. Clean links, no form.

### PDF Resume (CONT-03)

- **D-04:** **Static PDF** at `public/resume.pdf`. The existing `.planning/content/resume Ruslan Kanatbek.pdf` is copied to `public/resume.pdf` during Phase 2. It is linked from the About page with `download` attribute. No build-time generation — manually re-upload when the PDF changes. This is explicitly a "ship fast" choice; auto-generation is a v1.5 upgrade.

### Footer (CONT-05)

- **D-05:** Two footer variants, both rendered from a single `<Footer>` Server Component with a `variant` prop:
  - **`variant="compact"` (IDE landing page):** 1-line bar at the very bottom of the viewport. Contains: email address as a `mailto:` link, GitHub icon link, LinkedIn icon link, and a brief "no tracking" note (e.g., "No cookies. No tracking."). Icon-first, minimal text.
  - **`variant="full"` (`/about` and future document pages):** Full footer with labeled links (Email, GitHub, LinkedIn), the "no tracking" note written out as a sentence (e.g., "This site uses no cookies, collects no personal data, and has no third-party trackers."), and a copyright line.
  - Both variants use design tokens — no new colors. Icons from `lucide-react` (already in CLAUDE.md stack).

### the agent's Discretion

The following are left to the planner/executor to decide:

- MDX configuration details (`@next/mdx` setup, `next.config.ts` changes, types)
- `rehype`/`remark` plugins, if any (e.g., for heading anchors)
- The exact Tailwind/CSS classes for the prose container on `/about` (use design tokens, not arbitrary values)
- Whether the header strip uses `<header>` in the root layout or a separate `<SiteHeader>` component — either is fine
- Route segment config for `/about` (static preferred — `export const dynamic = 'force-static'`)
- OG metadata for `/about` (title, description) — use sensible defaults from `src/app/layout.tsx` pattern

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design — Source of Truth
- `.planning/design/design_handoff_ide_portfolio/styles.css` — Canonical design tokens. Phase 2 must use existing token values only — no new colors, no new font scales.
- `.planning/design/design_handoff_ide_portfolio/README.md` — Full layout spec. Phase 2 adds a header strip and document layout that must be consistent with the IDE chrome visual language.

### Content
- `.planning/content/resume Ruslan Kanatbek.pdf` — The real resume. All MDX content (experience, skills, projects) must come from this file. Do not invent content.

### Phase 1 Decisions (carry forward)
- `.planning/phases/01-foundations-test-automator-live/01-CONTEXT.md` — D-13 (design tokens, fonts), D-15 (statusbar "Available for hire" green). Phase 2 must not break Phase 1 styles.

### Stack
- `CLAUDE.md` — Stack spec: `@next/mdx` for MDX, `lucide-react` for icons (footer), Tailwind v4. Read "What NOT to Use" section.

### Requirements
- `.planning/REQUIREMENTS.md` — CONT-01 through CONT-05 definitions.
- `.planning/ROADMAP.md` — Phase 2 goal and success criteria.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets from Phase 1
- `src/app/layout.tsx` — Root layout with font vars wired (`--font-inter`, `--font-mono`), Analytics and SpeedInsights imported. **This is where the shared SiteHeader and compact Footer will be added.** Do not create a parallel layout.
- `src/app/globals.css` — All design tokens already defined as CSS custom properties. Phase 2 components must consume these vars, not add new ones.
- `src/components/ide/TopBar.tsx` — Existing TopBar inside the IDE shell. The new SiteHeader is **above** the IDE, not a replacement for TopBar.
- `src/lib/utils.ts` — `cn()` helper available for class merging.

### Integration Points
- The IDE shell (`IDEShell.tsx`) currently renders in `src/app/page.tsx`. After Phase 2, the root layout gains a `<SiteHeader>` above `{children}`. The IDE shell must not assume it fills 100vh anymore — it fills `calc(100vh - [header height])`. This is the primary integration risk to flag in the plan.
- `/about` is a new Next.js route: `src/app/about/page.tsx` (Server Component, static). MDX content lives at `src/content/resume.mdx` or `src/app/about/resume.mdx` — planner decides based on Next.js MDX conventions.
- Footer compact variant is added to root layout (always visible). Footer full variant is used in the About page layout or page component.

### Established Patterns
- Server Components by default. Only add `'use client'` if genuinely needed (Phase 1 IDE shell is client for interactivity; Phase 2 header/footer/about are all static server components).
- CSS Modules for component-scoped styles (Phase 1 pattern: `IDEShell.module.css`, `Sidebar.module.css`, etc.). Follow same pattern for `SiteHeader.module.css`, `Footer.module.css`.

</code_context>

<specifics>
## Specific Ideas

- **Header strip height:** Keep it tight — 40–48px. The IDE chrome is the star; the header is just wayfinding. Don't let it eat viewport height.
- **"About / Resume" CTA in header:** This single link is CONT-04's one-click recruiter path. Make it visually distinct (the green accent `--color-accent`) so it's immediately obvious.
- **MDX content authenticity:** Every bullet in the Experience section comes verbatim or lightly adapted from the PDF. Do not paraphrase or add fake achievements. The PDF is the source of truth.
- **PDF link placement on /about:** Put the "Download PDF" button near the top of the page (after the bio summary), not buried at the bottom. A recruiter who just wants the PDF should find it in 3 seconds.
- **"No tracking" note:** Keep it direct and non-defensive. "No cookies. No trackers. No ads." is better than a legal disclaimer.

</specifics>

<deferred>
## Deferred Ideas

- **Auto-generated PDF from MDX** — Build-time PDF generation from the MDX content (so it never goes stale). Noted as a v1.5 upgrade; static file ships in v1.
- **Light theme for /about** — The design handoff includes light theme tokens. Phase 2 ships dark-only (consistent with Phase 1). Theme toggle is Phase 3 / v1.5 scope.
- **Contact form** — A recruiter inquiry form on the About page. Deferred; current plan is mailto: links only (no backend needed).
- **OG card for /about** — Social preview image. CONT-01–05 don't require it; it's in Phase 3 (HARD-04).

</deferred>

---

*Phase: 02-resume-about-layer*
*Context gathered: 2026-05-20 via /gsd-discuss-phase 2*
