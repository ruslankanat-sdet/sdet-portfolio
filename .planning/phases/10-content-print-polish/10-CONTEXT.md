# Phase 10: Content, Print & Polish — Context

**Gathered:** 2026-05-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace all prototype placeholder copy in the recruiter view with Ruslan Kanatbek's real data, consolidate content into a single `src/lib/resume-content.ts` source-of-truth file, and complete the print stylesheet so `window.print()` produces a clean, professional PDF (2 pages max).

**IDE About page (`src/content/resume.mdx`) is already real — no changes needed there.**

**Phase 9 boundary:** recruiter view structure is complete. This phase is content-only + print polish.

</domain>

<decisions>
## Implementation Decisions

### Content Architecture
- **D-01:** Extract all recruiter content to `src/lib/resume-content.ts` — a single source-of-truth file with named exports: `HERO_COPY`, `METRICS`, `JOBS`, `SKILL_GROUPS`, `AVAIL_ROWS`. Components become purely presentational — they import from this file rather than defining their own `const` arrays.
- **D-02:** `src/content/resume.mdx` is the accuracy reference. Cross-check recruiter content against it when writing `resume-content.ts`.
- **D-03:** Scope is recruiter view only. No changes to `resume.mdx`, `about/page.tsx`, or IDE-side components.

### Hero Section (`src/components/recruiter/Hero.tsx`)
- **D-04:** Headline (`<h1>`): `"Senior SDET & Quality Architect — AI-Augmented Testing at Scale"` (factual title style, not editorial)
- **D-05:** Eyebrow line: `"Open to opportunities · Q3 start"` / `"Fremont, CA (Hybrid or Remote)"` / `"Senior / Lead / Principal"`
- **D-06:** Pitch paragraph (exact copy):
  > For the past decade, I have engineered high-scale quality infrastructure for mission-critical platforms—spanning mobile applications, trading systems, and HIPAA-compliant cloud architectures. Currently, as a Senior SDET at ResMed, I lead the automated testing strategy protecting the 16M+ user myAir ecosystem. By pioneering AI-augmented engineering via custom Copilot workflows and local MCP servers, I've compressed release cycles by 30% while maximizing developer velocity.
- **D-07:** Email CTA stays `ruslankanat.b@gmail.com` (already real — no change needed)

### §02 "What I'm Doing Now" Lede (`RecruiterView.tsx` inline paragraph)
- **D-08:** Lede paragraph (exact copy — drop-cap applies to first letter of "As"):
  > As a Senior SDET at ResMed, I architect and execute the automated testing strategy for the myAir ecosystem, a medical SaaS platform serving over 16 million CPAP therapy users. My work ensures comprehensive coverage across mobile (Kotlin/Espresso and Swift/XCUITest), web (TypeScript/Cypress), and GraphQL microservices via a scalable Python/Behave backend framework. Right now, my core technical focus is scaling AI-augmented engineering—deploying custom GitHub Copilot rulesets and local MCP server assistants to aggressively accelerate QA cycles without sacrificing system rigor.

### §01 Metrics (`src/components/recruiter/Metrics.tsx`)
- **D-09:** Four stat tiles:
  ```
  { num: '10', unit: 'yrs', label: 'Building test\ninfrastructure' }
  { num: '80', unit: '%',   label: 'Defect reduction\nat ResMed' }
  { num: '30', unit: '%',   label: 'Faster QA cycles\nwith AI tools' }
  { num: '16', unit: 'M+',  label: 'Users on myAir\nprotected' }
  ```

### §03 Experience Timeline (`src/components/recruiter/Timeline.tsx`)
- **D-10:** Show 3 most recent jobs only. Add an "Earlier career" footnote below the timeline list (not a job card):
  > Earlier: QA Automation Engineer · Veridian IT Staffing (Citibank · Cisco · Health First) · 2015–2020
- **D-11:** Three jobs:
  ```
  Job 1 (current):
    span: '2022 — Now'
    role: 'Senior SDET (AWS/Mobile/Web)'
    company: 'ResMed'
    scope: 'Architected and led the end-to-end quality strategy for a core team within the
            myAir app ecosystem serving over 16 million users, driving an 80% reduction in
            production defects through early-stage integration testing. Built automated mobile
            test flows using Kotlin/Espresso and Swift/XCUITest, migrated the web stack to
            TypeScript/Cypress, and engineered a scalable Python/Behave framework for AWS
            GraphQL microservices. Pioneered AI-augmented engineering by introducing custom
            GitHub Copilot rules and local MCP assistant servers, accelerating QA cycles by 30%.'
    stack: ['Python', 'TypeScript', 'Kotlin', 'Swift', 'Cypress', 'Espresso',
            'XCUITest', 'Behave', 'AWS Lambda', 'AppSync', 'GraphQL', 'GitHub Copilot', 'MCP', 'Datadog']

  Job 2:
    span: '2021 — 2022'
    role: 'SDET / Software Engineer'
    company: 'Gemini'
    scope: 'Architected a high-concurrency Python/Pytest automation framework for critical
            trading modules, expanding automated coverage from 0% to 80%. Optimized backend
            testing efficiency by upgrading Selenium suites and improving PostgreSQL data
            validation. Engineered core Scala backend components for institutional trading
            platforms and trained cross-functional software developers on modern QA ownership.'
    stack: ['Python', 'Scala', 'Pytest', 'Selenium', 'PostgreSQL']

  Job 3:
    span: '2021'
    role: 'QA Tester (Mobile)'
    company: 'TCS (Client: Google)'
    scope: 'Spearheaded mobile quality initiatives for Google Shopping on Android and iOS by
            deploying automated smoke and regression suites to maximize build stability. Served
            as the Google Workspace Test Lead during high-profile product launches, coordinating
            on-call operations for 24/7 blocker mitigation. Developed sophisticated functional
            and visual automation workflows using Java, Appium, and Bazel.'
    stack: ['Java', 'Appium', 'Bazel', 'Android', 'iOS']
  ```

### §04 Stack (`src/components/recruiter/Skills.tsx`)
- **D-12:** Four skill groups (replacing current placeholder):
  ```
  Automation: Selenium, Playwright, Appium, Pytest, TestNG, Cypress,
              Cucumber (BDD), Behave, REST-assured, JUnit
  AI / ML:    GitHub Copilot (Custom Rule Sets), Claude Code,
              MCP (Model Context Protocol) Server Engineering
  Infra:      AWS (Lambda, DynamoDB, AppSync), GitHub Actions, Firebase,
              Jenkins, Docker, Terraform, Bazel
  Languages:  Python, Java, SQL, Ruby, TypeScript, Scala
  ```

### §05 Availability Card (`src/components/recruiter/AvailabilityCard.tsx`)
- **D-13:** Six rows:
  ```
  Status:    'Open to opportunities · Q3 start'            (good: true)
  Location:  'Fremont, CA / SF Bay Area (Hybrid or Local) / Remote'
  Level:     'Senior / Lead / Principal'
  Best fit:  'Fintech, Health Tech, or enterprise SaaS — scaling automation,
              optimizing CI/CD, introducing AI-assisted testing efficiencies'
  Comp:      'Range available on request'
  Visa:      'Authorized to work in the US (details on request)'
  ```

### Print Stylesheet
- **D-14:** Target: 2 clean pages max (not aggressive single-page shrink). Prioritize readability over fitting everything on one page.
- **D-15:** Add `@page { size: Letter; margin: 1in 0.75in; }` to the `@media print` block in `recruiter.module.css` (supplements the scaffold already in place).
- **D-16:** Add `page-break-before: always` on the §03 Experience section to ensure clean page break after Hero + Metrics + Now lede.
- **D-17:** "Earlier career" footnote displays in print (not hidden).
- **D-18:** Items already hidden by Phase 9 scaffold (confirmed — no re-implementation): `.mastheadSwitch`, `.footer`, `.ctas`.
- **D-19:** Plan MUST include a print-test step: developer opens browser print preview and confirms two clean pages with no overflow.

### Claude's Discretion
- Font size tuning within `@media print` (aim for 10-11pt body, adjust if needed to prevent overflow)
- `page-break-inside: avoid` selectors — existing rule on `.section` is likely sufficient; add on `.timelineJob` if jobs break across pages
- Exact wording of the "Earlier career" footnote line styling (small, muted, italic)
- Skills group AI/ML items are fewer than Automation — layout balance is Claude's call
- Metrics unit suffix for `16M+` — if the current `unit` field approach doesn't support the `+`, use a different DOM structure or suffix approach

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing recruiter components (files being modified)
- `src/components/recruiter/Hero.tsx` — Hero section; headline, eyebrow, pitch, CTAs
- `src/components/recruiter/Metrics.tsx` — §01 stat tiles; `METRICS` const array
- `src/components/recruiter/Timeline.tsx` — §03 job timeline; `JOBS` const array + `<ul>` structure
- `src/components/recruiter/Skills.tsx` — §04 skill groups; `SKILL_GROUPS` const array
- `src/components/recruiter/AvailabilityCard.tsx` — §05 spec card; `ROWS` const array
- `src/components/recruiter/RecruiterView.tsx` — §02 "now" lede inline JSX (not a sub-component)
- `src/components/recruiter/recruiter.module.css` — print scaffold at bottom of file; all CSS classes

### Content source of truth (read-only reference for accuracy checking)
- `src/content/resume.mdx` — complete real work history; cross-check all recruiter content against this

### Print CSS scaffold (already shipped in Phase 9)
- `src/components/recruiter/recruiter.module.css` — existing `@media print` block (~line 400+); extends, do not duplicate
- `src/app/globals.css` — `@media print { body { background: white; font-size: 11pt; } }` (do not touch)

### Requirements
- `.planning/REQUIREMENTS.md` — REC-09 (print), CONT-RK-01 (content replacement)
- `.planning/ROADMAP.md` — Phase 10 success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/resume-content.ts` — new file to create; all existing component const arrays migrate here
- Phase 9 print scaffold in `recruiter.module.css`: hides `.mastheadSwitch`, `.footer`, `.ctas`; resets overflow; sets `page-break-inside: avoid` on `.section`; sets `.headline` to `28pt`. Extend, don't replace.
- `recruiter.module.css` CSS custom properties: `--forest`, `--paper`, `--ink`, `--ink-soft`, `--ink-muted` already defined — use for print typography if needed

### Established Patterns
- Content arrays defined as `const` in component files: `METRICS`, `JOBS`, `SKILL_GROUPS`, `ROWS` — all migrate to `resume-content.ts` with identical export shapes, then components import from there
- `'use client'` directive: all recruiter components are client components — `resume-content.ts` should be a plain module (no `'use client'`) since it's just data
- CSS Modules pattern: recruiter uses `styles.className` via `recruiter.module.css` — no Tailwind, no globals except the `:root` tokens

### Integration Points
- `src/components/recruiter/RecruiterView.tsx` §02 lede: currently inline JSX, not a component. The lede copy moves to `HERO_COPY.nowLede` in `resume-content.ts`; RecruiterView imports it.
- `src/components/recruiter/Masthead.tsx` — wordmark "ruslan.kanat" is already real (Phase 9 decision D-01). No change needed.
- `src/components/recruiter/ContactSection.tsx` — already real (`ruslankanat.b@gmail.com`, GitHub, LinkedIn). No change needed.

</code_context>

<specifics>
## Specific Ideas

- The "Earlier career" footnote under the timeline should be a single line, visually de-emphasized (small font, muted color using `--ink-muted`), not a job card. Something like: `<p className={styles.earlierCareers}>Earlier: QA Automation Engineer · Veridian IT Staffing (Citibank · Cisco · Health First) · 2015–2020</p>`
- The §02 lede starts with "As" — the `::first-letter` drop-cap already handles this via `.now::first-letter` in `recruiter.module.css`. No change needed to CSS.
- The `16M+` metric: the existing `unit` field is appended as a `<span className={styles.unit}>`. The `+` suffix needs to be part of the unit string (`'M+'`) — verify this renders cleanly at the tile's font size.
- `resume.mdx` has the full ResMed scope bulleted — the recruiter scope (D-11) is a condensed prose version of those bullets. The planner should not re-expand it.

</specifics>

<deferred>
## Deferred Ideas

- `BRAND-01`: Headshot photo in hero — deferred to v1.3
- `CONT-06`: About/bio MDX page updated with current copy (it's already real; a deeper editorial pass is v1.3)
- `SHOW-04`: Portfolio GitHub repo linked from recruiter view or IDE sidebar — v1.3

</deferred>

---

*Phase: 10-content-print-polish*
*Context gathered: 2026-05-29*
