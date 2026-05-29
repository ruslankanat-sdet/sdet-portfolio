---
phase: 09-recruiter-view
reviewed: 2026-05-28T23:45:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - src/components/recruiter/recruiter.module.css
  - src/components/recruiter/RecruiterView.tsx
  - src/components/recruiter/Masthead.tsx
  - src/components/recruiter/Hero.tsx
  - src/components/recruiter/Metrics.tsx
  - src/components/recruiter/Timeline.tsx
  - src/components/recruiter/Skills.tsx
  - src/components/recruiter/AvailabilityCard.tsx
  - src/components/recruiter/ContactSection.tsx
  - src/components/recruiter/RecruiterFooter.tsx
  - src/components/recruiter/__tests__/RecruiterView.test.tsx
  - src/app/page.tsx
  - e2e/recruiter.spec.ts
  - e2e/landing.spec.ts
  - src/app/globals.css
findings:
  critical: 0
  warning: 5
  info: 5
  total: 10
status: issues_found
---

# Phase 09: Code Review Report

**Reviewed:** 2026-05-28T23:45:00Z
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

Phase 9 delivers the recruiter editorial view: sticky masthead, hero, four content sections (Metrics, Timeline, Skills, AvailabilityCard), ContactSection, and RecruiterFooter. The implementation is overall structurally sound — no `dangerouslySetInnerHTML`, external links carry `rel="noopener noreferrer"`, `'use client'` directives are present on all interactive components, and CSS Module class names are correctly camelCased.

Five warnings were found, none of which are data-loss or security blockers. The most impactful are: a flaky unit test assertion (`getByText('9')` will not match a text node inside a div whose full text content is `"9yrs"`), a `window.print` mock that will throw a `TypeError` on the second `beforeEach` invocation because `Object.defineProperty` is called without `configurable: true`, and missing `:focus-visible` styles on interactive buttons. Five informational items cover placeholder content, semantic HTML choices, and hardcoded values.

## Warnings

### WR-01: `window.print` mock will throw `TypeError` on second and subsequent test runs

**File:** `src/components/recruiter/__tests__/RecruiterView.test.tsx:13`
**Issue:** `Object.defineProperty(window, 'print', { value: vi.fn(), writable: true })` is called in `beforeEach`, which runs before every test. The first call succeeds because jsdom's initial `window.print` property descriptor includes `configurable: true`. However, the descriptor written by `Object.defineProperty` does **not** set `configurable: true` — it defaults to `false`. On the second `beforeEach` invocation, attempting to redefine a non-configurable property throws:
```
TypeError: Cannot redefine property: print
```
If the test suite currently passes, it is because the jsdom version in use happens to keep `configurable: true` on the initial descriptor, and the first `Object.defineProperty` call (which writes `configurable: false`) is the one that breaks subsequent runs. This is a latent flake: any jsdom or vitest upgrade that changes initial property descriptor behaviour will cause all tests after the first to throw.

**Fix:**
```ts
// In beforeEach — always set configurable: true so subsequent calls can redefine
Object.defineProperty(window, 'print', {
  value: vi.fn(),
  writable: true,
  configurable: true,
});
```

---

### WR-02: `getByText('9')` in REC-03 test will not match the metric number element

**File:** `src/components/recruiter/__tests__/RecruiterView.test.tsx:92`
**Issue:** The `Metrics` component renders the "9 yrs" metric as:
```tsx
<div className={styles.metricNum}>
  9
  <span className={styles.unit}>yrs</span>
</div>
```
The `div`'s full normalized text content is `"9yrs"`, not `"9"`. React Testing Library's `getByText('9')` with its default `exact: true` looks for an element whose accessible text normalizes to exactly `"9"`. No such element exists — the closest is the text node `"9"` inside the `div`, but RTL matches against element text content, not raw text nodes. The assertion will silently pass only if another element on the page happens to contain exactly the text `"9"`, which is fragile. `getByText('0.4')`, `getByText('98.2')`, and `getByText('1,247')` have the same problem for `%`, `%`, and `""` units respectively — though `0.4%` and `98.2%` will fail in the same way since the `%` span is a child.

**Fix:** Target a container that wraps both the number and the unit and use `getByText` with `exact: false`, or locate by the label text:
```ts
// Option A: use exact:false scoped to the metricNum container
expect(screen.getByText(/^9/, { exact: false })).toBeInTheDocument();

// Option B: locate by label and check the sibling number (more robust)
const tile = screen.getByText('Building test infrastructure').closest('[class*="metricTile"]');
expect(tile).toHaveTextContent('9');
```

---

### WR-03: No `:focus-visible` styles on interactive buttons

**File:** `src/components/recruiter/recruiter.module.css` (entire file)
**Issue:** `.mastheadSwitch`, `.btnPrimary`, `.btnSecondary`, and `.footerSwitch` define `:hover` styles but no `:focus-visible` styles. Keyboard users navigating with Tab will see the browser's default outline removed (or overridden by a global reset) with no custom indicator. This violates WCAG 2.1 AA Success Criterion 2.4.7 (Focus Visible). The axe scan in `REC-A11Y` may or may not catch this depending on whether the default outline has been suppressed by a global CSS reset.

**Fix:** Add focus-visible rings to all interactive recruiter elements:
```css
.mastheadSwitch:focus-visible,
.btnPrimary:focus-visible,
.btnSecondary:focus-visible,
.footerSwitch:focus-visible {
  outline: 2px solid var(--forest);
  outline-offset: 2px;
}
```

---

### WR-04: `<section>` elements in `Hero` and `ContactSection` have no accessible name

**File:** `src/components/recruiter/Hero.tsx:7`, `src/components/recruiter/ContactSection.tsx:7`
**Issue:** Both `Hero` and `ContactSection` use `<section>` as their root element. Per the HTML spec, a `<section>` element is a landmark (`region`) **only when it has an accessible name** (via `aria-label` or `aria-labelledby`). Without a name, it degrades to a generic container — which is benign — but if a screen reader user relies on landmark navigation, these sections are invisible to landmark traversal. `ContactSection` in particular acts as a distinct "Get in touch" region that benefits from being discoverable as a landmark. The `<div className={styles.contactPre}>Get in touch</div>` is styled text, not a heading, so it cannot serve as `aria-labelledby`.

**Fix for `ContactSection`:**
```tsx
// Option A: add aria-label
<section className={styles.contactSection} aria-label="Get in touch">

// Option B: promote contactPre to a heading and use aria-labelledby
<section className={styles.contactSection} aria-labelledby="contact-heading">
  <h2 id="contact-heading" className={styles.contactPre}>Get in touch</h2>
```
`Hero` can remain as a generic section or receive `aria-label="Introduction"`.

---

### WR-05: `Timeline` renders a list of jobs as `<div>` elements, not a semantic list

**File:** `src/components/recruiter/Timeline.tsx:43-69`
**Issue:** The experience timeline is a repeated sequence of job entries, which is semantically a list. The container is `<div className={styles.timelineList}>` and each item is `<div className={styles.timelineJob}>`. Screen readers will not announce item count or position (`"item 2 of 3"`). A `<ul>` / `<li>` structure (with `list-style: none` in CSS) conveys the correct semantics at no visual cost, and axe-core 4.x does flag missing list roles in certain context checks.

**Fix:**
```tsx
// Timeline.tsx
<ul className={styles.timelineList} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
  {JOBS.map((job) => (
    <li key={job.role} className={styles.timelineJob}>
      ...
    </li>
  ))}
</ul>
```
Alternatively, add `role="list"` to the existing `<div>` if you want to avoid changing the element type.

---

## Info

### IN-01: Placeholder contact details shipped as production content

**File:** `src/components/recruiter/Hero.tsx:42`, `src/components/recruiter/ContactSection.tsx:11,16`, `src/components/recruiter/RecruiterFooter.tsx:12`
**Issue:** All contact information is placeholder data from the design fixture, not the owner's real details:
- Email: `alex@morgan.dev` (appears 4 times across Hero and ContactSection)
- GitHub: `https://github.com/amorgan`
- LinkedIn: `https://linkedin.com/in/amorgan-sdet`
- Copyright: `© 2026 Alex Morgan`

The owner's email (from project memory) is `kuruslan27@gmail.com`. If this page ships as-is, recruiters who click the email CTA will reach a non-existent or wrong mailbox.

**Fix:** Replace all placeholder values with real contact details before any external review or deployment.

---

### IN-02: `window.print` mock pattern is fragile — prefer `vi.spyOn`

**File:** `src/components/recruiter/__tests__/RecruiterView.test.tsx:13`
**Issue:** `Object.defineProperty` is a low-level mechanism for mocking browser globals. `vi.spyOn(window, 'print')` is idiomatic Vitest and handles cleanup automatically via `vi.restoreAllMocks()`. Using `spyOn` also avoids the `configurable` edge case described in WR-01.

**Fix:**
```ts
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, 'print').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

---

### IN-03: `Metrics` component uses `\n` in label strings for visual line breaks

**File:** `src/components/recruiter/Metrics.tsx:6-9`
**Issue:** Label strings embed literal `\n` characters (`'Building test\ninfrastructure'`), which are then rendered via `white-space: pre-line` in `.metricLabel`. This is a coupling between data and CSS rendering mode. If the CSS class is ever changed (e.g., for print), the `\n` characters will render as spaces or be invisible. It also makes the label strings awkward to reuse outside this CSS context.

**Fix:** Use `<br />` explicitly in JSX, or split into two `<span>` elements, removing the `white-space: pre-line` CSS dependency:
```tsx
{ num: '9', unit: 'yrs', label: ['Building test', 'infrastructure'] },
// then render: label.map((l, i) => <span key={i}>{l}</span>)
```

---

### IN-04: `AvailabilityCard` uses CSS `nth-child` rules that depend on exact DOM order

**File:** `src/components/recruiter/recruiter.module.css:567-573`
**Issue:** `.availRow:nth-child(even)` removes the right border, and `.availRow:nth-last-child(-n+2)` removes the bottom border on the last two rows. These selectors are tightly coupled to 6 rows in a 2-column grid layout. Adding or removing a row from `ROWS` in `AvailabilityCard.tsx` will silently break the border layout without any TypeScript or lint error.

**Fix:** Document the 6-row constraint with a comment in both the CSS and the data array, or use explicit `border-right: none` / `border-bottom: none` on a `className` driven by an `isEven` / `isLastRow` prop pattern.

---

### IN-05: `ContactSection` `<a>` inside `<p>` (`.contactLine`) lacks descriptive link text for screen readers

**File:** `src/components/recruiter/ContactSection.tsx:11`
**Issue:** The contact paragraph reads: `"The fastest way to reach me is alex@morgan.dev. I reply within a day."` The anchor text is the raw email address. While email addresses are technically meaningful as link text, WCAG 2.4.6 advises that link purpose should be clear from the link text alone. When a screen reader lists all links on the page, two links with identical text `"alex@morgan.dev"` appear (the paragraph link and the contact grid link), offering no differentiation. Adding `aria-label` to the contact grid version distinguishes them.

**Fix:**
```tsx
// ContactSection.tsx — contact grid email link
<a
  className={styles.contactItemValue}
  href="mailto:alex@morgan.dev"
  aria-label="Email alex@morgan.dev (contact grid)"
>
  alex@morgan.dev
</a>
```
Or consolidate to a single mailto link in the section.

---

_Reviewed: 2026-05-28T23:45:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
