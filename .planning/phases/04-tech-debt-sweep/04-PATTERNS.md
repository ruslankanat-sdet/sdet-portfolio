# Phase 4: Tech Debt Sweep - Pattern Map

**Mapped:** 2026-05-24
**Files analyzed:** 6 (1 new, 5 modified)
**Analogs found:** 5 / 6

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/components/layout/SiteHeader.tsx` | component | — (static text only) | `src/components/layout/Footer.tsx` | role-match |
| `src/components/layout/Footer.tsx` | component | — (verify only, no code change) | self | — |
| `src/components/ide/TopBar.tsx` | component | request-response (useEffect fetch) | `src/app/api/run-tests/route.ts` (fetch pattern) + self | exact (self-modify) |
| `src/components/ide/TopBar.module.css` | config/style | — (CSS addition) | self (existing toneGreen / toneBlue) | exact (self-modify) |
| `src/app/api/ci-status/route.ts` | route handler | request-response (GitHub API proxy) | `src/app/api/run-status/[run_id]/route.ts` | exact |
| `src/lib/files-data.ts` | utility/data | — (content sync) | self (existing entry shape) | exact (self-modify) |

---

## Pattern Assignments

### `src/components/layout/SiteHeader.tsx` (component, static)

**Change:** DEBT-01 — text-only update, line 10.

**Analog:** `src/components/layout/SiteHeader.tsx` (self)

**Current line to change** (line 10):
```tsx
<span className={styles.title}>Senior SDET</span>
```

**Target state** (same structure, longer string):
```tsx
<span className={styles.title}>Senior SDET / QA Automation Engineer</span>
```

No import changes. No CSS changes in this phase (responsive deferral per CONTEXT.md Deferred section). Check `SiteHeader.module.css` for `white-space: nowrap` if the longer title wraps unexpectedly, but do not add responsive logic — that is Phase 5.

---

### `src/components/layout/Footer.tsx` (component, verify-only)

**Change:** DEBT-02 — verification pass, no code edit expected.

**Finding from read:** Line 84 already contains:
```tsx
<p className={styles.copyright}>© 2026 Ruslan Kanatbek</p>
```

DEBT-02 is already satisfied. Mark closed with no code change. Planner action: read Footer.tsx line 84, assert the string is present, close the task.

---

### `src/components/ide/TopBar.tsx` (component, request-response)

**Change:** DEBT-03 — add `useEffect` fetch of `/api/ci-status` and wire result into the CI `StatusBadge`.

**Analog:** `src/components/ide/TopBar.tsx` (self — the `useEffect` clock pattern at lines 43-50 is the model for the new fetch effect).

**Existing useEffect pattern to mirror** (lines 43-50):
```tsx
useEffect(() => {
  const tick = () => {
    const now = new Date();
    setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
  };
  const id = setInterval(tick, 30000);
  return () => clearInterval(id);
}, []);
```

**Existing useState pattern to mirror** (lines 38-41):
```tsx
const [time, setTime] = useState<string>(() => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
});
```

**Pattern for new CI state** — add alongside existing state:
```tsx
// Fallback: keep "Passing" / green as the loading and error state (CONTEXT.md D-02)
const [ciPassing, setCiPassing] = useState<boolean>(true);

useEffect(() => {
  fetch('/api/ci-status')
    .then((r) => r.json())
    .then((data: { passing: boolean }) => {
      setCiPassing(data.passing);
    })
    .catch(() => {
      // silently keep the green fallback (D-02)
    });
}, []); // fire once on mount, no polling (D-01)
```

**Existing StatusBadge usage to modify** (lines 88-92):
```tsx
<div className={cn(styles.statusRail)} role="status">
  <StatusBadge tone="green" label="CI" value="Passing" pulse hideClass="badgeRail1" />
  <StatusBadge tone="green" label="Coverage" value="98%" hideClass="badgeRail2" />
  <StatusBadge tone="blue" label="Tests" value="312" hideClass="badgeRail3" />
</div>
```

**Target state** — CI badge becomes data-driven; Coverage and Tests remain static:
```tsx
<div className={cn(styles.statusRail)} role="status">
  <StatusBadge
    tone={ciPassing ? 'green' : 'red'}
    label="CI"
    value={ciPassing ? 'Passing' : 'Failing'}
    pulse={ciPassing}
    hideClass="badgeRail1"
  />
  <StatusBadge tone="green" label="Coverage" value="98%" hideClass="badgeRail2" />
  <StatusBadge tone="blue" label="Tests" value="312" hideClass="badgeRail3" />
</div>
```

**StatusBadgeProps interface to extend** (lines 18-24):
```tsx
interface StatusBadgeProps {
  tone: 'green' | 'blue';   // add 'red' here
  label: string;
  value: string;
  pulse?: boolean;
  hideClass?: string;
}
```

Change to:
```tsx
interface StatusBadgeProps {
  tone: 'green' | 'blue' | 'red';
  label: string;
  value: string;
  pulse?: boolean;
  hideClass?: string;
}
```

The `cn(styles[`tone${tone.charAt(0).toUpperCase() + tone.slice(1)}`])` interpolation on line 28 already handles `toneRed` dynamically — no change needed to the StatusBadge render function itself.

---

### `src/components/ide/TopBar.module.css` (style, CSS addition)

**Change:** DEBT-03 — add `.toneRed` and its child selectors, mirroring `.toneGreen` and `.toneBlue` structure.

**Analog:** `src/components/ide/TopBar.module.css` (self — toneGreen lines 151-169, toneBlue lines 171-183)

**toneGreen pattern to mirror** (lines 151-169):
```css
/* Tone: green */
.toneGreen {
  border-color: rgba(61, 220, 132, 0.3);
  background: linear-gradient(180deg, rgba(61, 220, 132, 0.08), rgba(61, 220, 132, 0.04));
  box-shadow: 0 0 0 1px rgba(61, 220, 132, 0.04), 0 0 18px -8px var(--green-glow);
}

.toneGreen .badgeDot {
  background: var(--green);
  box-shadow: 0 0 8px var(--green), 0 0 14px var(--green-glow);
}

.toneGreen .badgeValue {
  color: var(--green-bright);
}

.toneGreen .badgeLabel {
  color: rgba(61, 220, 132, 0.7);
}
```

**toneBlue pattern to mirror** (lines 171-183):
```css
/* Tone: blue */
.toneBlue {
  border-color: rgba(121, 184, 255, 0.25);
  background: rgba(121, 184, 255, 0.13);
}

.toneBlue .badgeDot {
  background: var(--blue);
  box-shadow: 0 0 6px var(--blue);
}

.toneBlue .badgeValue {
  color: var(--blue);
}
```

**New toneRed block to append** — use `--red` CSS custom property (or inline rgba fallback if the var is not in globals.css; check `src/app/globals.css` before assuming). No pulse on failing state (CONTEXT.md: "red tone, no pulse"):
```css
/* Tone: red */
.toneRed {
  border-color: rgba(255, 85, 85, 0.3);
  background: linear-gradient(180deg, rgba(255, 85, 85, 0.08), rgba(255, 85, 85, 0.04));
  box-shadow: 0 0 0 1px rgba(255, 85, 85, 0.04), 0 0 18px -8px rgba(255, 85, 85, 0.4);
}

.toneRed .badgeDot {
  background: #ff5555;
  box-shadow: 0 0 8px #ff5555, 0 0 14px rgba(255, 85, 85, 0.4);
}

.toneRed .badgeValue {
  color: #ff7070;
}

.toneRed .badgeLabel {
  color: rgba(255, 85, 85, 0.7);
}
```

Insert after line 183 (after `.toneBlue` block), before the `/* Badge responsive hiding */` comment at line 186.

---

### `src/app/api/ci-status/route.ts` (route handler, request-response)

**Change:** DEBT-03 — NEW file. Proxies GitHub Actions API to return `{ passing: boolean }` with ISR `revalidate: 300`.

**Analog:** `src/app/api/run-status/[run_id]/route.ts` (exact match — same runtime, same env vars, same GitHub API auth headers)

**Runtime declaration to copy** (line 1):
```typescript
export const runtime = 'nodejs';
```

**ISR revalidation to add** (new — not in the analog, but required per CONTEXT.md D-01):
```typescript
export const revalidate = 300; // 5 minutes — GitHub Actions run cadence
```

**Env var pattern to copy** (lines 19-28 of analog):
```typescript
const token = process.env.GITHUB_TOKEN;
if (!token) {
  return Response.json({ error: 'CI trigger not configured' }, { status: 503 });
}

const owner = process.env.GH_OWNER;
const repo = process.env.GH_REPO;
if (!owner || !repo) {
  return Response.json({ error: 'CI trigger not configured' }, { status: 503 });
}
```

**GitHub API fetch pattern to copy** (lines 30-40 of analog):
```typescript
const res = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/actions/runs?branch=main&status=completed&per_page=1`,
  {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  }
);
```

Note: the URL differs from the analog. Use the runs list endpoint (per CONTEXT.md D-01 discretion item): `GET /repos/{owner}/{repo}/actions/runs?branch=main&status=completed&per_page=1`. The `conclusion` field on `workflow_runs[0]` is `'success'` for passing, anything else (including `'failure'`, `'cancelled'`, `'timed_out'`) for failing.

**Error / success response pattern to copy** (lines 42-48 of analog):
```typescript
if (!res.ok) {
  return Response.json({ error: 'Status fetch failed' }, { status: res.status });
}

const data = await res.json();
return Response.json(data);
```

**Full shape of the new route** (assembling analog pieces with new business logic):
```typescript
export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json({ error: 'CI trigger not configured' }, { status: 503 });
  }

  const owner = process.env.GH_OWNER;
  const repo = process.env.GH_REPO;
  if (!owner || !repo) {
    return Response.json({ error: 'CI trigger not configured' }, { status: 503 });
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/runs?branch=main&status=completed&per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (!res.ok) {
    return Response.json({ error: 'Status fetch failed' }, { status: res.status });
  }

  const data = await res.json() as { workflow_runs?: { conclusion: string | null }[] };
  const conclusion = data.workflow_runs?.[0]?.conclusion ?? null;
  const passing = conclusion === 'success';

  return Response.json({ passing });
}
```

---

### `src/lib/files-data.ts` (utility/data, content sync)

**Change:** DEBT-04 — sync the `content` strings of the 5 test-related entries against the actual e2e/ files.

**Analog:** `src/lib/files-data.ts` (self — same FileEntry shape, same string literal content pattern)

**FileEntry shape** (lines 10-12):
```typescript
import type { FileEntry, LogEntry } from '@/types/ide';

export const FILES: Record<string, FileEntry> = {
```

**Stale vs actual comparison:**

| Key in FILES | Actual file | Stale? |
|---|---|---|
| `'tests/landing.spec.ts'` | `e2e/landing.spec.ts` | YES — line 14 in files-data uses `.first()` without `locator('aside')` scoping; actual file uses `page.locator('aside').getByRole(...)` |
| `'tests/navigation.spec.ts'` | `e2e/navigation.spec.ts` | Matches — verify on read |
| `'tests/about.spec.ts'` | `e2e/about.spec.ts` | Matches — verify on read |
| `'tests/ide-interactions.spec.ts'` | `e2e/ide-interactions.spec.ts` | YES — actual file has stale-failure comments on tests 2 and 3 that files-data does not include |
| `'tests/playwright.config.ts'` | `playwright.config.ts` (repo root) | Verify on read |

**Confirmed stale content in `'tests/landing.spec.ts'`:**

files-data.ts line 169 (stale):
```typescript
await expect(page.getByRole('button', { name: /README\\.md/ })).toBeVisible();
```
```typescript
await page.getByRole('button', { name: /README\\.md/ }).click();
```

Actual `e2e/landing.spec.ts` lines 14, 21 (current):
```typescript
await expect(page.getByRole('button', { name: /README\.md/ }).first()).toBeVisible();
```
```typescript
await page.locator('aside').getByRole('button', { name: /README\.md/ }).click();
```

**Confirmed stale content in `'tests/ide-interactions.spec.ts'`:**

Actual `e2e/ide-interactions.spec.ts` lines 15-16 and 24-26 contain inline comments about expected test failures ("This test will FAIL until plan 03 ships...") that are absent from files-data.ts. The displayed source should match the real file — copy verbatim.

**Pattern for content update** — replace the full `content` string literal for each stale entry. The existing string escaping convention in files-data uses `\\.` for regex dot literals (double-escaped for JSON string context inside template literals). The actual files use `\.` (single backslash). When copying to the template literal in files-data.ts, use `\\.` to produce the correct output:

```typescript
// files-data.ts escape convention — note double backslash
content: `... /README\\.md/ ...`
// renders as: /README\.md/ — correct regex in the displayed source
```

---

## Shared Patterns

### GitHub API Auth
**Source:** `src/app/api/run-status/[run_id]/route.ts` lines 19-40
**Apply to:** `src/app/api/ci-status/route.ts`
```typescript
const token = process.env.GITHUB_TOKEN;
const owner = process.env.GH_OWNER;
const repo  = process.env.GH_REPO;
// headers:
Authorization: `Bearer ${token}`,
Accept: 'application/vnd.github+json',
'X-GitHub-Api-Version': '2022-11-28',
```

### Node Runtime Declaration
**Source:** `src/app/api/run-status/[run_id]/route.ts` line 1 and `src/app/api/run-tests/route.ts` line 5
**Apply to:** `src/app/api/ci-status/route.ts`
```typescript
export const runtime = 'nodejs';
```

### useEffect Single-Fire Fetch
**Source:** `src/components/ide/TopBar.tsx` lines 43-50 (clock interval pattern)
**Apply to:** `src/components/ide/TopBar.tsx` (new ci-status fetch effect)

Pattern: empty dependency array `[]` = fires once on mount, no cleanup needed (no interval to clear). Matches CONTEXT.md D-01 "no client polling."

### CSS Tone Block Structure
**Source:** `src/components/ide/TopBar.module.css` lines 151-183
**Apply to:** `src/components/ide/TopBar.module.css` (new `.toneRed` block)

Structure: root selector sets border-color, background, box-shadow. Child selectors `.toneX .badgeDot`, `.toneX .badgeValue`, `.toneX .badgeLabel` set colors. Follow the same 4-selector pattern.

---

## No Analog Found

None — all 6 files have either an exact or role-match analog. The one new file (`/api/ci-status/route.ts`) has an exact analog in the existing run-status route.

---

## DEBT-02 Pre-Closure Note

Footer.tsx line 84 already contains `© 2026 Ruslan Kanatbek`. DEBT-02 requires no code change. Planner should generate a verify-only action (read the line, assert the string, close) rather than an edit action.

---

## Metadata

**Analog search scope:** `src/app/api/`, `src/components/ide/`, `src/components/layout/`, `src/lib/`, `e2e/`
**Files scanned:** 8 source files + 4 e2e spec files + 1 playwright config
**Pattern extraction date:** 2026-05-24
