# Phase 8: Landing Door — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-27
**Phase:** 8-landing-door
**Areas discussed:** Content, Component structure, CSS approach, Newsreader font weights

---

## Content

| Option | Description | Selected |
|--------|-------------|----------|
| Ruslan's real name + real tagline now | Use actual name + pitch in Phase 8; Phase 10 handles remaining placeholder copy elsewhere. No Alex Morgan ever lands in production. | ✓ |
| Alex Morgan placeholder — clean up in Phase 10 | Build exactly to design prototype text. Means recruiters see wrong name until Phase 10 ships. | |
| Name real, tagline placeholder | "Ruslan Kanatbek" displays correctly; taglines remain TODO for Phase 10. | |

**User's choice:** Ruslan's real name + real tagline now
**Notes:** Site is live and candidate is actively applying — visible production placeholder is a liability.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Design copy for recruiter tagline | "A readable, single-column résumé. The career, the numbers, how to reach me." | ✓ |
| Something shorter — user types it | Custom tagline. | |

**User's choice:** Design copy as-is.

---

| Option | Description | Selected |
|--------|-------------|----------|
| IDE half tagline as prototype | "Open the files, run the smoke test, ask the agent." | ✓ |
| Something shorter — user types it | Custom version. | |

**User's choice:** Keep prototype copy — accurate and punchy.

---

## Component Structure

| Option | Description | Selected |
|--------|-------------|----------|
| src/components/door/DoorScreen.tsx | Follows project pattern (src/components/ide/, src/components/layout/). page.tsx stays slim. | ✓ |
| Inline in src/app/page.tsx | Simple but page.tsx already 100 lines; Door adds ~150 more. | |

**User's choice:** Separate component directory.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Include LogoMark in src/components/door/LogoMark.tsx | Small inline SVG, reused by Phase 9 Masthead. | ✓ |
| Skip — text wordmark only | Phase 9 would need to add it anyway. | |

**User's choice:** Include LogoMark now — Phase 9 will import from same location.

---

## CSS Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Cream tokens + .door-* classes in globals.css | Follows site-body/site-main pattern. Phase 9 reuses cream palette. | ✓ |
| Tailwind utilities + inline styles for animations | Stays in component. Requires arbitrary oklch values for forest tokens. | |
| CSS Module (DoorScreen.module.css) | Scoped styles. Not currently used in codebase — new pattern. | |

**User's choice:** globals.css additions — consistent with existing pattern.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Add cream tokens to :root alongside IDE tokens | Simple — --paper, --forest etc. alongside --bg-deepest, --green. Component classes scope them. | ✓ |
| Separate :root block or @layer for recruiter tokens | Cleaner on paper but premature abstraction. | |

**User's choice:** Same :root block, clearly commented.

---

## Newsreader Font Weights

| Option | Description | Selected |
|--------|-------------|----------|
| Expand to 300–700 | Design uses full range. At 140px display size, weight matters. Phase 9 also needs heavier weights — load once. | ✓ |
| Keep 400+500 for now | Works but 400 at 140px is less impactful. | |

**User's choice:** Expand to ['300', '400', '500', '600', '700'] now.

---

## Claude's Discretion

- Hover animation timing/easing — use resume.css values verbatim (`.55s cubic-bezier(.4,.0,.2,1)`)
- Exact padding values — use resume.css values (`40px 64px 48px`)
- Mobile breakpoint — 760px per design README
- `prefers-reduced-motion` guard — implement per design README

## Deferred Ideas

- Ruslan's actual recruiter-half content (pitch paragraph, metrics, experience, stack) — Phase 9 + Phase 10
- Print stylesheet — Phase 10
- Availability status pulse dot — part of Phase 9 Hero section, not Phase 8 Door
