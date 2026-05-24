# Phase 2 Research — Resume & About Layer

## 1. MDX Setup in Next.js 15 App Router

### Package requirements
```bash
pnpm add @next/mdx @mdx-js/react
pnpm add -D @types/mdx
```
- `@next/mdx` wraps Next.js config and handles `.mdx` file compilation
- `@mdx-js/react` provides the `MDXProvider` context and `useMDXComponents` hook
- `@types/mdx` provides TypeScript types for MDX module imports

No remark/rehype plugins needed for Phase 2 — the prose is structured enough
without heading anchors or autolinks (those are Phase 3 hardening scope).

### `next.config.ts` update
```ts
import type { NextConfig } from 'next';
import path from 'path';
import createMDX from '@next/mdx';

const withMDX = createMDX({
  // No remark/rehype plugins needed in Phase 2
});

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  outputFileTracingRoot: path.join(__dirname),
};

export default withMDX(nextConfig);
```

### `mdx-components.tsx` (root of project, required by Next.js)
```tsx
import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
```
This file must live at the project root (same level as `package.json`). Without
it Next.js will fail to compile MDX files.

### Content file location
**Use pattern: `src/content/resume.mdx` imported into `src/app/about/page.tsx`**
```tsx
// src/app/about/page.tsx
import Resume from '@/content/resume.mdx';
export default function AboutPage() {
  return <Resume />;
}
```
This gives full control over `export const metadata`, layout classes, and the
PDF download button placement — none of which are possible when the MDX file
IS the page (`app/about/page.mdx`).

### TypeScript path alias
Add `@/content/*` to `tsconfig.json` paths if not already covered by the
existing `@/*` catch-all pointing to `src/`.

### Known gotchas in Next.js 15
- `pageExtensions` must include `'mdx'` or MDX files won't be recognized
- `@next/mdx` v15 requires `@mdx-js/react` v3+ (avoid v2)
- Do NOT use `next-mdx-remote` — that's for runtime-fetched MDX (CMS use case).
  Static import is the right pattern here.

---

## 2. IDE Shell Height Fix (Critical Integration Risk)

### The problem
`src/app/globals.css` currently sets:
```css
html, body {
  height: 100%;
  overflow: hidden;  /* ← IDE-specific, will break /about scrolling */
}
```
This was correct for Phase 1 (full-screen IDE only). Phase 2 adds:
- A 44px `<SiteHeader>` above all content
- A 36px compact `<Footer>` below all content (landing page)
- A scrollable `/about` page that must NOT be `overflow: hidden`

### Recommended solution: Per-page overflow control via layout class

**Step 1 — Modify `globals.css`:** Remove `overflow: hidden` from `html, body`.
Change to:
```css
html {
  height: 100%;
}
body {
  height: 100%;
  /* overflow: hidden removed — controlled per-page */
}
```

**Step 2 — Root layout uses CSS grid** so header + content + footer always fill
100dvh on the landing page:
```tsx
// src/app/layout.tsx body gets a wrapper div or body itself uses flex:
<body className={`${inter.variable} ${mono.variable} site-body`}>
  <SiteHeader />
  <main className="site-main">{children}</main>
  <Footer variant="compact" />
  ...
</body>
```

In `globals.css` add:
```css
.site-body {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;   /* contains the body, prevents outer scroll */
}
.site-main {
  flex: 1;
  min-height: 0;      /* critical: allows flex child to shrink below content size */
  overflow: hidden;   /* IDE landing: no scroll on main container */
}
```

**Step 3 — Override `overflow` for `/about`** using a layout segment config or
a CSS class on `<main>`. The cleanest approach in App Router is a route-specific
layout or a `<main>` className override:

In `src/app/about/layout.tsx` (new file):
```tsx
export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```
And in `globals.css`, add:
```css
/* /about page: allow scroll */
.about-page-main {
  overflow-y: auto;
}
```
Then in `src/app/about/page.tsx` wrap content in a `<div className="about-page-main">`.

Actually the simplest approach: the `site-main` in the root layout keeps
`overflow: hidden`. The `/about` page content itself gets `overflow-y: auto`
on its content container (not `<main>` — the scrollable region is the
`<article>` inside). Since the `/about` article has `max-width: 720px` and
`padding: 48px 24px 80px`, wrapping it in a scrollable div inside `<main>` is
sufficient:
```tsx
// src/app/about/page.tsx
<div className={styles.scrollContainer}>   {/* overflow-y: auto; height: 100% */}
  <article className={styles.content}>
    <Resume />
  </article>
  <Footer variant="full" />
</div>
```

This means:
- `<main>` stays `overflow: hidden` globally (safe for IDE)
- `/about` scroll is contained in `styles.scrollContainer`
- The compact `<Footer>` in the root layout is always visible on the landing page
- The full `<Footer>` is inside `/about`'s scroll container so it scrolls with the content

### IDEShell.tsx — no changes needed
`IDEShell.module.css` already uses `flex: 1; min-height: 0` on `.ideBody`.
With `<main>` being `flex: 1; min-height: 0; overflow: hidden`, the IDE shell
fills `<main>` correctly without needing `height: 100vh` anywhere.

The IDEShell renders a fragment `<>...</>` — the TopBar + ideBody + StatusBar
fill `<main>`'s flex space naturally.

---

## 3. Static PDF Serving

### File placement
```bash
cp ".planning/content/resume Ruslan Kanatbek.pdf" "public/resume.pdf"
```
Served at `/resume.pdf` (Next.js serves `public/` at root automatically).

### Download link HTML
```tsx
<a
  href="/resume.pdf"
  download="Ruslan-Kanatbek-Resume.pdf"
  aria-label="Download PDF resume"
>
  <Download size={16} />
  Download PDF Resume
</a>
```
The `download` attribute with a filename sets the suggested save-as name.

### Verification
```bash
# File exists
test -f public/resume.pdf && echo "PDF present"
# HTTP 200 (after deploy / local dev)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/resume.pdf
```

---

## 4. CSS Modules vs globals.css for Layout Components

**Decision: CSS Modules for `SiteHeader` and `Footer`** — same as Phase 1 pattern.

Rationale:
- Keeps component styles co-located and scoped (no accidental global leakage)
- Consistent with `IDEShell.module.css`, `Sidebar.module.css`, etc.
- Only `globals.css` gets the two new utility classes: `.site-body`, `.site-main`
  (because they're applied to `<body>` and `<main>` in the root layout — those
  can't use CSS Modules since they're in `layout.tsx` body/main elements)

Files to create:
- `src/components/layout/SiteHeader.module.css`
- `src/components/layout/Footer.module.css`
- `src/app/about/about.module.css` (for the scroll container and prose styles)

---

## 5. Active Nav Link Detection

**Problem:** `SiteHeader` must show "About / Resume" on landing, "← Back" on `/about`.
Server Components can't use `usePathname()` (client hook).

**Recommended pattern: Client wrapper for nav link only**

```tsx
// src/components/layout/NavLink.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLink() {
  const pathname = usePathname();
  const isAbout = pathname === '/about';
  return (
    <Link href={isAbout ? '/' : '/about'} aria-current={isAbout ? 'page' : undefined}>
      {isAbout ? '← Back' : 'About / Resume'}
    </Link>
  );
}
```

`SiteHeader` itself stays a Server Component; only the `<NavLink>` child is
`'use client'`. This is the standard Next.js pattern — minimal client JS
surface for a single interactive element.

---

## 6. Validation Architecture

| Requirement | Check Method |
|-------------|-------------|
| **CONT-01** Header visible with name/title | `grep -r "Ruslan Kanatbek" src/components/layout/SiteHeader.tsx` returns match; `grep "Senior SDET" src/components/layout/SiteHeader.tsx` returns match |
| **CONT-02** /about renders MDX sections | `grep -l "resume.mdx" src/app/about/` — file exists; `pnpm build` exits 0 (MDX compiles); manual browser check of `/about` heading hierarchy |
| **CONT-03** PDF downloadable | `test -f public/resume.pdf && echo ok`; `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/resume.pdf` returns 200; link has `download` attribute: `grep 'download=' src/app/about/page.tsx` |
| **CONT-04** One-click recruiter path | `grep 'href="/about"' src/components/layout/SiteHeader.tsx` (or NavLink); `grep 'href="/"' src/components/layout/NavLink.tsx` |
| **CONT-05** Footer has required links | `grep "mailto:ruslankanat.b@gmail.com" src/components/layout/Footer.tsx`; `grep "github.com" src/components/layout/Footer.tsx`; `grep "linkedin.com" src/components/layout/Footer.tsx`; `grep -i "no.*track\|no.*cookie" src/components/layout/Footer.tsx` |
| **TypeScript** | `pnpm typecheck` exits 0 |
| **Lint** | `pnpm lint` exits 0 |
| **Build** | `pnpm build` exits 0 |

---

## 7. Dependency List

### New packages to install
```bash
pnpm add @next/mdx @mdx-js/react
pnpm add -D @types/mdx
```

### Already installed (no action needed)
- `lucide-react` ✓ — footer icons (Mail, Github, Linkedin, Download)
- `next` 15.5.18 ✓
- `react` 19.1.0 ✓
- `tailwindcss` 4.3.0 ✓ (but Phase 2 layout uses CSS Modules, not Tailwind utility classes)

### Explicitly NOT adding
- `next-mdx-remote` — wrong pattern (for CMS/runtime MDX)
- `rehype-slug`, `rehype-autolink-headings` — deferred to Phase 3
- `@react-pdf/renderer` — PDF generation deferred (static file in v1)
- Any ORM, auth, or state library — no backend in v1

---

## RESEARCH COMPLETE
