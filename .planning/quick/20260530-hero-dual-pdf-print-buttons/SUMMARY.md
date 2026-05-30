---
status: complete
date: 2026-05-30
slug: hero-dual-pdf-print-buttons
---

# Quick Task: Hero Dual PDF/Print Buttons

Split the single "Download PDF" button into two CTAs:

- **Download PDF** — `<a href="/resume.pdf" download>` (primary, direct file download)
- **Print** — `<button onClick={() => window.print()}>` (secondary, browser print preview)

## Files Changed

- `src/components/recruiter/Hero.tsx` — button → link + new Print button
- `src/components/recruiter/__tests__/RecruiterView.test.tsx` — updated REC-02 tests
- `e2e/recruiter.spec.ts` — updated REC-02 hero assertion

## Commit

`56db254` feat(10): split hero CTA into Download PDF link and Print button
