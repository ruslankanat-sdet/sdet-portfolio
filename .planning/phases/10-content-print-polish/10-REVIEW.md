---
phase: 10-content-print-polish
reviewed: 2026-05-30T00:00:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - src/lib/resume-content.ts
  - src/components/recruiter/Hero.tsx
  - src/components/recruiter/Metrics.tsx
  - src/components/recruiter/Timeline.tsx
  - src/components/recruiter/Skills.tsx
  - src/components/recruiter/AvailabilityCard.tsx
  - src/components/recruiter/RecruiterView.tsx
  - src/components/recruiter/recruiter.module.css
  - src/components/recruiter/__tests__/RecruiterView.test.tsx
  - e2e/recruiter.spec.ts
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 10: Code Review Report

**Reviewed:** 2026-05-30T00:00:00Z
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

Phase 10 delivered two coherent workstreams: replacing all prototype content with real resume data via `src/lib/resume-content.ts`, and completing the print stylesheet. The security posture is clean — no `dangerouslySetInnerHTML`, no hardcoded secrets, no eval, no XSS vectors. TypeScript types are sound and compile clean.

Four warnings and four info items were found. The most significant is a CSS print conflict where `.section { page-break-inside: avoid; }` applies to the §03 Experience section (which spans multiple pages), suppressing the per-job `page-break-inside: avoid` that was the intended fix. Two E2E test assertions on a known-duplicate text string use bare `getByText()` without `.first()`, which is fragile. Contact details (email, GitHub, LinkedIn) are hardcoded in components rather than exported from the single-source-of-truth module. Several `type` imports are unused in component files.

---

## Warnings

### WR-01: `page-break-inside: avoid` on `.section` suppresses per-job page-break control in Experience

**File:** `src/components/recruiter/recruiter.module.css:351`
**Issue:** The print block applies `page-break-inside: avoid` to every `.section` element. The §03 Experience `<section>` carries both `.section` and `.sectionExperience` class names, making it subject to this rule. The §03 section contains three jobs with long scope paragraphs; its content far exceeds one Letter page. When a container with `page-break-inside: avoid` overflows a page, browsers must break inside it — but the directive tells the browser not to try breaking between child `.timelineJob` elements either. The result is browser-dependent: Chromium/Blink typically ignores the ancestor `avoid` when content overflows and respects the child rule, but this is not guaranteed by spec. The §04 Stack and §05 Availability sections are short and unaffected.

**Fix:** Scope `page-break-inside: avoid` to sections that actually fit on one page. Either remove it from the universal `.section` rule and apply it explicitly to `.section:not(.sectionExperience)`, or add an override that resets the value for the experience section:

```css
/* In @media print block */
.section {
  margin-bottom: 24pt;
  page-break-inside: avoid;   /* safe for short sections */
}

/* Override for the multi-page experience section */
.sectionExperience {
  page-break-before: always;
  page-break-inside: auto;    /* allow browser to break between jobs */
}
```

---

### WR-02: E2E test `getByText('Open to opportunities · Q3 start')` matches two visible elements without `.first()`

**File:** `e2e/recruiter.spec.ts:31` and `e2e/recruiter.spec.ts:73`
**Issue:** Both `Hero` (via `HERO_COPY.availValue`) and `AvailabilityCard` (via `AVAIL_ROWS[0].value`) render the identical string `'Open to opportunities · Q3 start'` simultaneously. The unit tests were already fixed to use `getAllByText()` (per the phase 10-01 deviation log). The E2E spec was not updated. In Playwright 1.49+, `expect(page.getByText(...)).toBeVisible()` does not throw on multiple matches — it evaluates the first matched element. This means the assertion at line 73 (REC-07) is silently passing on the Hero eyebrow element rather than verifying the AvailabilityCard row, which is the stated intent of REC-07.

**Fix:**

```typescript
// REC-02 (line 31): hero availability pill — use first() and confirm it's inside .avail
await expect(
  page.locator('[class*="avail"]').getByText('Open to opportunities · Q3 start').first()
).toBeVisible();

// REC-07 (line 73): availability card row — pin to the card context
await expect(
  page.locator('[class*="availCard"]').getByText('Open to opportunities · Q3 start')
).toBeVisible();
```

---

### WR-03: Contact details hardcoded in components, not exported from `resume-content.ts`

**File:** `src/components/recruiter/Hero.tsx:39-40` and `src/components/recruiter/ContactSection.tsx:11,16-17`
**Issue:** The email address `ruslankanat.b@gmail.com` appears three times across two component files, and the GitHub/LinkedIn URLs appear once each in `ContactSection.tsx`. None of these are exported from `src/lib/resume-content.ts`, which was explicitly created as the single source of truth for all recruiter content. If the candidate's email changes, it must be updated in at least two files — with risk of a missed occurrence. This also contradicts the verified completion criterion in the 10-01 SUMMARY ("All recruiter content sourced from resume-content.ts").

**Fix:** Add a `CONTACT` export to `src/lib/resume-content.ts`:

```typescript
export const CONTACT = {
  email: 'ruslankanat.b@gmail.com',
  github: 'https://github.com/ruslankanat-sdet',
  githubLabel: 'github.com/ruslankanat-sdet',
  linkedin: 'https://linkedin.com/in/ruslan-kanatbek',
  linkedinLabel: 'in/ruslan-kanatbek',
} as const;
```

Then import and use `CONTACT.email` in `Hero.tsx` and all three usages in `ContactSection.tsx`.

---

### WR-04: Duplicate test IDs break traceability — `REC-01` used 3 times, `REC-02` used 6 times

**File:** `src/components/recruiter/__tests__/RecruiterView.test.tsx:21,26,73` (REC-01) and `src/components/recruiter/__tests__/RecruiterView.test.tsx:34,41,48,55,63,82` (REC-02)
**Issue:** Test IDs are used as traceability tokens linking unit tests to requirements. Having `REC-01` on three distinct tests (wordmark render, pill button render, pill button click) and `REC-02` on six tests (availability value, headline, pitch, CTAs, mailto link, Print interaction) makes CI failure reports ambiguous — the failing `REC-01` doesn't identify which of the three tests failed without reading the full description. The E2E spec does not share this problem.

**Fix:** Assign unique IDs to each test case. The `REC-NN` namespace has gaps (`REC-04`, `REC-06`, `REC-09` are unused). Assign the overflow cases into those slots:

```typescript
// Replace duplicates:
it('REC-04: masthead Engineer view pill button is present', ...)   // was second REC-01
it('REC-06: Download PDF and Print CTAs render', ...)              // was fourth REC-02
it('REC-09: Print button calls window.print()', ...)               // was second REC-08
```

---

## Info

### IN-01: `type Job` imported but never used in `Timeline.tsx` body

**File:** `src/components/recruiter/Timeline.tsx:4`
**Issue:** `import { JOBS, EARLIER_CAREERS, type Job } from '@/lib/resume-content'` includes `type Job` but the component never annotates a variable with that type. `JOBS` is typed as `Job[]` at its declaration site; the import-only type usage provides no runtime or compile-time value here.

**Fix:** Remove `type Job` from the import:
```typescript
import { JOBS, EARLIER_CAREERS } from '@/lib/resume-content';
```

---

### IN-02: `type AvailRow` imported but never used in `AvailabilityCard.tsx` body

**File:** `src/components/recruiter/AvailabilityCard.tsx:4`
**Issue:** Same pattern as IN-01. `type AvailRow` is imported but no variable in `AvailabilityCard.tsx` is annotated with it. The array `AVAIL_ROWS` is already typed at its declaration.

**Fix:** Remove `type AvailRow` from the import:
```typescript
import { AVAIL_ROWS } from '@/lib/resume-content';
```

---

### IN-03: `§01`–`§05` section landmarks have no accessible name

**File:** `src/components/recruiter/RecruiterView.tsx:26,36,48,58,68`
**Issue:** All five content `<section>` elements lack `aria-label` or `aria-labelledby`. Screen readers announce them as unnamed landmark regions. The prior phase (09) fixed `Hero` and `ContactSection` but the five body sections were not addressed. The `<span class="sectionTitle">` text inside each is not semantically linked as a label. The existing axe-core E2E test (`REC-A11Y`) may or may not flag this depending on the axe rule version — the `region` rule requires a section to have an accessible name only when it contains a heading, so this may pass axe while still being suboptimal for screen reader navigation.

**Fix:** Add `aria-label` matching the section title text:
```tsx
<section className={styles.section} aria-label="By the numbers">
<section className={styles.section} aria-label="What I'm doing now">
<section className={`${styles.section} ${styles.sectionExperience}`} aria-label="Experience">
<section className={styles.section} aria-label="Stack">
<section className={styles.section} aria-label="What I'm looking for">
```

---

### IN-04: `'use client'` directive is redundant on purely data-rendering components

**File:** `src/components/recruiter/Metrics.tsx:1`, `src/components/recruiter/Skills.tsx:1`, `src/components/recruiter/AvailabilityCard.tsx:1`
**Issue:** These three components render only static data from `resume-content.ts` with no hooks, event handlers, or browser APIs. They do not need `'use client'`. Because they are imported from `RecruiterView.tsx` (which is already `'use client'`), they are automatically treated as client components and the directive is a no-op. This is not harmful — but it signals a misunderstanding of the directive's role and would prevent converting the root layout to a RSC boundary later if desired.

**Fix:** Remove `'use client'` from `Metrics.tsx`, `Skills.tsx`, and `AvailabilityCard.tsx`. The components will continue to work correctly as leaf nodes in the client component tree established by `RecruiterView.tsx`.

---

_Reviewed: 2026-05-30T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
