---
phase: 2
slug: resume-about-layer
status: approved
created: 2026-05-20
reviewed_at: 2026-05-20
---

# Phase 2 — UI Design Contract

> Visual and interaction contract for Phase 2: Resume & About Layer.
> All new components must use existing token values from `src/app/globals.css`.
> Do not introduce new color values, font families, or border-radius values.

---

## Design System

| Property | Value |
|----------|-------|
| Token source | `src/app/globals.css` (ported from `.planning/design/design_handoff_ide_portfolio/styles.css`) |
| Icon library | `lucide-react` — use for footer icons (Mail, Github, Linkedin) |
| Font | `--font-inter` (UI/body), `--font-mono` (code labels, metadata) — already wired in `layout.tsx` |
| Component styling | CSS Modules — follow Phase 1 pattern (`SiteHeader.module.css`, `Footer.module.css`, `AboutPage.module.css`) |
| New shadcn components | None required for Phase 2 |

---

## Components to Build

### 1. `<SiteHeader>` — Thin dark nav strip

**Location:** `src/components/layout/SiteHeader.tsx` + `SiteHeader.module.css`

**Visual spec:**
- Height: `44px` fixed
- Background: `var(--bg-deep)` (`#0b1117`)
- Bottom border: `1px solid var(--border)` (`#1f2937`)
- Layout: `display: flex; align-items: center; justify-content: space-between; padding: 0 20px`

**Left slot — Identity:**
- Name: `"Ruslan Kanatbek"` — font: `var(--font-inter)`, size: `14px`, weight: `600`, color: `var(--text)` (`#e6edf3`)
- Separator: `·` — color: `var(--text-faint)` (`#5a6678`), margin: `0 6px`
- Title: `"Senior SDET"` — size: `13px`, weight: `400`, color: `var(--text-muted)` (`#8b96a8`)

**Right slot — CTA:**
- Link: `"About / Resume"` — Next.js `<Link href="/about">`
- Color: `var(--green)` (`#3ddc84`)
- Size: `13px`, weight: `500`
- Hover: `color: var(--green-bright)` + `text-decoration: underline`
- On `/about` page: link changes to `"← Back"` pointing to `/`

**Responsiveness:**
- Mobile (≤ 480px): Hide subtitle `"Senior SDET"`, keep name + CTA
- No hamburger menu needed — there are only two pages

---

### 2. `/about` Page Layout — Clean document

**Route:** `src/app/about/page.tsx` (Server Component, `force-static`)

**Page-level structure:**
```
<SiteHeader>          ← from root layout (inherited)
<main class="about-container">
  <article class="about-content">
    {MDX content}
  </article>
  <aside class="pdf-cta">  ← Download PDF button, near top
  </aside>
</main>
<Footer variant="full">
```

**Container spec:**
- `max-width: 720px`
- `margin: 0 auto`
- `padding: 48px 24px 80px`

**Background:** `var(--bg-deep)` — same dark background as IDE, not white/light

**Typography:**
| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| `h1` (name/title) | `--font-inter` | `32px` | `700` | `var(--text)` |
| `h2` (section headings) | `--font-inter` | `20px` | `600` | `var(--text)` |
| `h3` (company/role) | `--font-inter` | `15px` | `600` | `var(--text)` |
| body `p`, `li` | `--font-inter` | `15px` | `400` | `var(--text-muted)` |
| dates, metadata | `--font-mono` | `13px` | `400` | `var(--text-faint)` |
| skill tags | `--font-mono` | `12px` | `400` | `var(--green)` |

**Section dividers:** `border-top: 1px solid var(--border-soft)` + `margin: 32px 0`

**Skill tags:**
- Inline `<span>` per skill
- Background: `var(--green-soft)` (`rgba(61, 220, 132, 0.12)`)
- Border: `1px solid rgba(61, 220, 132, 0.25)`
- Border-radius: `var(--radius)` (`6px`)
- Padding: `2px 8px`
- Color: `var(--green)`

**PDF download button:**
- Placed immediately after the bio/summary block
- Style: outlined button — border `1px solid var(--green)`, color `var(--green)`, bg transparent
- Hover: `background: var(--green-soft)`
- Text: `"Download PDF Resume"` + Lucide `Download` icon (16px)
- `href="/resume.pdf"` with `download` attribute

---

### 3. `<Footer>` — Two-variant footer

**Location:** `src/components/layout/Footer.tsx` + `Footer.module.css`

#### `variant="compact"` — IDE landing page

- Height: `36px`
- Background: `var(--bg-deepest)` (`#06090e`)
- Top border: `1px solid var(--border)` 
- Layout: flex row, centered, `gap: 16px`, `font-size: 12px`
- Items: `ruslankanat.b@gmail.com` (mailto link) · GitHub icon (Lucide `Github`, 14px) · LinkedIn icon (Lucide `Linkedin`, 14px) · `"No cookies. No tracking."` (color: `var(--text-faint)`)
- All links: `color: var(--text-muted)`, hover `color: var(--text)`
- Position: below the IDE shell (not fixed/sticky on desktop)

#### `variant="full"` — `/about` and document pages

- `padding: 48px 24px`
- `max-width: 720px; margin: 0 auto`
- Top border: `1px solid var(--border-soft)`
- Layout: three columns on desktop (≥ 640px), stacked on mobile
  - Col 1: Email — label + link
  - Col 2: GitHub + LinkedIn — labels + links
  - Col 3: Privacy note — `"This site uses no cookies, collects no personal data, and has no third-party trackers."`
- `font-size: 13px`, color: `var(--text-muted)`
- Links hover: `color: var(--text)`
- Copyright line below (full width): `"© 2024 Ruslan Kanatbek"` — `var(--text-faint)`, centered

---

## Root Layout Integration

**File to modify:** `src/app/layout.tsx`

After Phase 2, the root layout structure becomes:
```tsx
<html>
  <body>
    <SiteHeader />        {/* ← NEW: 44px strip, every page */}
    <main>{children}</main>
    <Footer variant="compact" />  {/* ← NEW: 36px bar, every page */}
    <Analytics />
    <SpeedInsights />
  </body>
</html>
```

**Critical integration constraint:** The IDE shell (`IDEShell.tsx`) currently uses `height: 100vh`. After the header (44px) and compact footer (36px) are added to the root layout, it must be updated to `height: calc(100vh - 44px - 36px)` or use CSS grid/flex on `<body>` to fill remaining space. This is the **primary integration risk** — plan must address it explicitly.

---

## MDX Styling

**File:** `src/app/about/page.tsx` or via `mdx-components.tsx`

MDX components map to styled HTML. Use the typography scale above. Key mappings:
- `h1` → bio/name heading
- `h2` → section headings (What I Build, Experience, Skills, Projects, Contact)
- `h3` → company/role names within Experience
- `code` → inline `<code>` with `font-family: var(--font-mono)`, `color: var(--green)`, `background: var(--green-soft)`, `padding: 1px 4px`, `border-radius: 3px`

---

## Accessibility

- `<SiteHeader>` uses semantic `<header>` element with `role="banner"`
- `<Footer>` uses semantic `<footer>` element with `role="contentinfo"`  
- External links (GitHub, LinkedIn) get `target="_blank" rel="noopener noreferrer"` + visually hidden `" (opens in new tab)"` for screen readers
- PDF download link: `aria-label="Download PDF resume"`
- Active nav link gets `aria-current="page"`
- Focus rings: inherit Phase 1's `:focus-visible` outline (`2px solid var(--green)`, `outline-offset: 2px`)

---

## Content Substitutions (Phase 2)

| Placeholder | Real value |
|-------------|-----------|
| Email | `ruslankanat.b@gmail.com` |
| GitHub | Link from resume PDF |
| LinkedIn | Link from resume PDF |
| PDF file | Copy `.planning/content/resume Ruslan Kanatbek.pdf` → `public/resume.pdf` |
| All MDX content | Derived from `.planning/content/resume Ruslan Kanatbek.pdf` — do not invent |
