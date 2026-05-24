# Phase 2: Resume & About Layer — Discussion Log

*For human reference only. Not consumed by downstream agents.*

**Phase:** 2 — Resume & About Layer
**Date:** 2026-05-20
**Mode:** Default (all areas selected)

---

## Areas Discussed

### 1. Nav Integration
**Question:** Where does the primary nav live given the IDE shell fills the viewport?
**Options presented:**
1. Minimal header strip above the IDE
2. Nav link added to existing IDE TopBar
3. Floating fixed-position pill

**Selected:** Option 1 — Minimal header strip above the IDE
**Notes:** Doesn't disrupt full-screen IDE aesthetic. Name/title left, About/Resume link right.

---

### 2. About Page Visual Treatment
**Question:** What does the /about page feel like to a recruiter?
**Options presented:**
1. Clean document page — dark bg, max-width prose, no IDE chrome
2. IDE chrome wrapper — content loads inside editor pane
3. Hybrid — IDE-inspired but document-readable, centered column

**Selected:** Option 1 — Clean document page
**Notes:** Recruiter-friendly reading. No sidebar or terminal panes.

---

### 3. MDX Content Structure
**Question:** How should /about order its sections?
**Options presented:**
1. Standard resume order (Summary → Experience → Skills → Projects → Education → Contact)
2. SDET-forward order (Skills first, then Experience)
3. Narrative-first order (Bio → What I build → Experience → Skills → Projects → Contact)

**Selected:** Option 3 — Narrative-first order
**Notes:** More personal, story-driven. Closer to personal site than classic resume.

---

### 4. PDF Strategy
**Question:** How should the downloadable PDF resume be produced?
**Options presented:**
1. Static file — upload existing PDF to /public/resume.pdf
2. Generated at build time from MDX content
3. Static now, generated later (v1.5 upgrade)

**Selected:** Option 1 — Static file
**Notes:** Simple, fast, zero build complexity. Manually re-upload when PDF changes.

---

### 5. Footer Scope
**Question:** Where should the footer with email, GitHub, LinkedIn, and "no tracking" appear?
**Options presented:**
1. About page only
2. Every page including IDE
3. All pages with ultra-minimal variant on IDE, full variant on /about

**Selected:** Option 3 — All pages, two variants
**Notes:** IDE gets 1-line compact bar (icons + "no tracking"); /about gets labeled full footer.

---

## Deferred Ideas

- Auto-generated PDF from MDX (v1.5)
- Light theme for /about (Phase 3 / v1.5)
- Contact form (future — mailto links in v1)
- OG card for /about (Phase 3, HARD-04)
