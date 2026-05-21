---
phase: 03-playwright-showcase-hardening
plan: 02
subsystem: seo-og-meta
tags: [og-image, metadata, robots, sitemap, hardening, seo]
dependency_graph:
  requires: []
  provides:
    - /og ImageResponse route at 1200x630
    - metadataBase + openGraph + Twitter Card meta on landing and /about
    - public/robots.txt with canonical sitemap pointer
    - public/sitemap.xml with two-URL map (landing + about)
  affects:
    - src/app/layout.tsx (metadataBase inheritance for all pages)
    - src/app/about/page.tsx (page-level OG override)
tech_stack:
  added:
    - next/og ImageResponse (bundled with next@15.5.18)
  patterns:
    - Route handler returning ImageResponse at /og
    - generateMetadata with metadataBase + openGraph + twitter fields
    - Static public/ SEO files (no next-sitemap dependency)
key_files:
  created:
    - src/app/og/route.tsx
    - public/robots.txt
    - public/sitemap.xml
  modified:
    - src/app/layout.tsx
    - src/app/about/page.tsx
decisions:
  - "Canonical URL fallback set to https://ruslankanat.dev per key_technical_facts #4 (overrides RESEARCH.md ruslankanat.vercel.app)"
  - "Node runtime on /og route per CLAUDE.md convention (not Edge)"
  - "revalidate=86400 instead of force-static to avoid ImageResponse conflict"
  - "No lastmod tags in sitemap.xml — hand-maintained dates go stale; absence preferred"
  - "Static robots.txt + sitemap.xml (no next-sitemap library) — 2-page site, zero benefit from a library"
metrics:
  duration: "~8 minutes"
  completed: "2026-05-21"
  tasks_completed: 3
  files_changed: 5
---

# Phase 3 Plan 2: OG Image + Social Meta + SEO Files Summary

OG image route at /og (1200x630 PNG) with design-token hex colors, full openGraph + Twitter Card tags on landing and /about pages, and static robots.txt + sitemap.xml for launch readiness.

## What Was Built

### Task 1: /og Route Handler (HARD-03)

Created `src/app/og/route.tsx` — a Node runtime Route Handler that returns an `ImageResponse` sized 1200x630. The card renders three text layers using design-token hex values inlined as literals (CSS variables are not evaluated inside Satori/ImageResponse):

| Layer | Text | Font size | Hex color | Token |
|-------|------|-----------|-----------|-------|
| Name | Ruslan Kanatbek | 72px / bold | `#3ddc84` | `--green` |
| Title | Senior SDET · Playwright · TypeScript | 32px | `#8b96a8` | `--text-muted` |
| URL | ruslankanat.dev | 24px | `#79b8ff` | `--blue` |

Background: `#0b1117` (`--bg-deep`), body color: `#e2e8f0` (`--text-primary`). Runtime is `nodejs`, revalidate is `86400` (24h CDN cache).

### Task 2: metadataBase + OG + Twitter Card Tags (HARD-03)

Extended `src/app/layout.tsx` metadata export with:
- `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ruslankanat.dev')` — required to resolve `/og` relative URL without a build error
- `openGraph` block: title, description, url `/`, siteName, images `[{ url: '/og', width: 1200, height: 630 }]`, locale `en_US`, type `website`
- `twitter` block: card `summary_large_image`, title, description, images `['/og']`

Extended `src/app/about/page.tsx` metadata export with:
- `openGraph`: title, description, url `/about`, images pointing to `/og`
- `twitter`: card `summary_large_image`, title, images `['/og']`
- No `metadataBase` on the about page — it inherits from layout (no redundancy)

### Task 3: robots.txt + sitemap.xml (HARD-04)

Created two static files in `public/`:

**robots.txt:**
```
User-agent: *
Allow: /

Sitemap: https://ruslankanat.dev/sitemap.xml
```

**sitemap.xml:** Standard XML sitemap with two `<url>` entries:
- `https://ruslankanat.dev/` — changefreq: weekly, priority: 1.0
- `https://ruslankanat.dev/about` — changefreq: monthly, priority: 0.8

Both use the literal canonical domain `https://ruslankanat.dev` — robots.txt is a static file with no runtime env-var expansion.

## Canonical URL Decision

The plan's `key_technical_facts #4` specifies `ruslankanat.dev` as the authoritative fallback domain (overriding the RESEARCH.md suggestion of `ruslankanat.vercel.app`). All three locations that embed the canonical URL use this value:

1. `layout.tsx` → `process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ruslankanat.dev'`
2. `public/robots.txt` → `Sitemap: https://ruslankanat.dev/sitemap.xml`
3. `public/sitemap.xml` → `<loc>https://ruslankanat.dev/...</loc>`

When `NEXT_PUBLIC_SITE_URL` is set in Vercel project settings, `metadataBase` uses it; the static files will still show `ruslankanat.dev` (acceptable since DNS will point there).

## OG Image Preview

After `pnpm dev`, visit `http://localhost:3000/og` to see the 1200x630 PNG. The route is cached at the CDN layer for 24 hours on subsequent requests.

## Verification Results

- `pnpm typecheck` — exits 0
- `pnpm build` — completes with no metadataBase warnings; `/og` route shows `Revalidate: 1d`
- All verification assertions in the plan passed:
  - `src/app/og/route.tsx` exists with correct hex values and exports
  - `src/app/layout.tsx` contains metadataBase, openGraph, twitter blocks
  - `src/app/about/page.tsx` contains page-level openGraph (with `/about` url) and twitter blocks
  - `public/robots.txt` contains User-agent and Sitemap lines
  - `public/sitemap.xml` contains both URL entries

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 22010e3 | feat(03-02): add /og route handler with ImageResponse (HARD-03) |
| 2 | 285b3c7 | feat(03-02): wire metadataBase + OG + Twitter Card tags (HARD-03) |
| 3 | e780bc5 | feat(03-02): add public/robots.txt and public/sitemap.xml (HARD-04) |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all files are fully functional. The OG image renders real candidate information. The metadata tags point to the live `/og` route. The SEO files contain the actual canonical domain.

## Threat Flags

None. The /og route renders static hardcoded strings only (T-03-02: Information Disclosure → accepted). The 24h revalidate cache mitigates the DoS compute cost (T-03-02b). The canonical URL fallback prevents broken OG links on preview deploys (T-03-02c).

## Self-Check: PASSED

Files confirmed to exist:
- `src/app/og/route.tsx` — FOUND
- `src/app/layout.tsx` (modified) — FOUND
- `src/app/about/page.tsx` (modified) — FOUND
- `public/robots.txt` — FOUND
- `public/sitemap.xml` — FOUND

Commits confirmed:
- 22010e3 — FOUND
- 285b3c7 — FOUND
- e780bc5 — FOUND
