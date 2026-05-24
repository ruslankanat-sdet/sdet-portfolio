---
phase: 04-tech-debt-sweep
plan: "02"
subsystem: ide-topbar
tags:
  - ci-badge
  - github-api
  - topbar
  - api-route
dependency_graph:
  requires:
    - "src/app/api/run-status/[run_id]/route.ts (auth pattern analog)"
    - "src/components/ide/TopBar.tsx (existing StatusBadge component)"
    - "src/app/globals.css (--red CSS custom property)"
  provides:
    - "src/app/api/ci-status/route.ts: GET /api/ci-status -> { passing: boolean }"
    - "TopBar CI badge: live GitHub Actions status with green-fallback on error"
    - "StatusBadge tone='red': new red tone CSS block in TopBar.module.css"
  affects:
    - "src/components/ide/TopBar.tsx (StatusBadgeProps interface, state, render)"
    - "src/components/ide/TopBar.module.css (new .toneRed block)"
tech_stack:
  added: []
  patterns:
    - "ISR revalidate=300 on parameterless GET route handler"
    - "mount-only useEffect fetch with silent .catch fallback (D-02)"
    - "CSS tone block 4-selector structure: root, .badgeDot, .badgeValue, .badgeLabel"
key_files:
  created:
    - src/app/api/ci-status/route.ts
  modified:
    - src/components/ide/TopBar.tsx
    - src/components/ide/TopBar.module.css
decisions:
  - "D-01: mount-only fetch (no polling) per plan context"
  - "D-02: silent green fallback on any /api/ci-status error"
  - "D-03: only CI badge becomes live; Coverage and Tests stay static"
  - "D-04: revalidate=300 (5 minutes) to protect GitHub API quota"
metrics:
  duration: "~12 minutes"
  completed: "2026-05-24"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 3
---

# Phase 4 Plan 2: Live CI Badge for TopBar Summary

**One-liner:** Replaced hardcoded green CI badge with live GitHub Actions status via a new ISR-cached `/api/ci-status` route, adding red tone CSS and a silent green fallback on errors.

## What Was Built

### Task 1: /api/ci-status route handler (commit bddd76c)

New file `src/app/api/ci-status/route.ts`:

```typescript
export const runtime = 'nodejs';
export const revalidate = 300; // 5 minutes — GitHub Actions run cadence (D-04)

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

  // Response body is exactly { passing: boolean } — no token, no env vars, no raw GitHub fields (T-04-05)
  return Response.json({ passing });
}
```

Key properties:
- `export const runtime = 'nodejs'` — Node runtime (not Edge)
- `export const revalidate = 300` — 5-minute ISR cache prevents GitHub API quota exhaustion
- 503 with `{ error: 'CI trigger not configured' }` when any env var is missing
- Success body is exactly `{ passing: boolean }` — no token, env vars, or raw GitHub fields leaked
- No console.log/warn/error referencing GITHUB_TOKEN or the token local

### Task 2: TopBar.tsx and TopBar.module.css changes (commit f1a1ae2)

**TopBar.tsx diff (lines changed):**

1. StatusBadgeProps tone union extended (line 19):
   ```tsx
   // Before:
   tone: 'green' | 'blue';
   // After:
   tone: 'green' | 'blue' | 'red';
   ```

2. New state hook added after existing `time` state:
   ```tsx
   // Fallback: keep "Passing" / green as the loading and error state (D-02)
   const [ciPassing, setCiPassing] = useState<boolean>(true);
   ```

3. New useEffect added:
   ```tsx
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

4. First StatusBadge inside statusRail modified to data-driven:
   ```tsx
   // Before:
   <StatusBadge tone="green" label="CI" value="Passing" pulse hideClass="badgeRail1" />
   // After:
   <StatusBadge
     tone={ciPassing ? 'green' : 'red'}
     label="CI"
     value={ciPassing ? 'Passing' : 'Failing'}
     pulse={ciPassing}
     hideClass="badgeRail1"
   />
   ```

5. Second and third StatusBadge calls (Coverage, Tests) are UNCHANGED.

**TopBar.module.css: new .toneRed block (inserted after .toneBlue, before responsive hiding comment):**

```css
/* Tone: red */
.toneRed {
  border-color: rgba(255, 107, 107, 0.3);
  background: linear-gradient(180deg, rgba(255, 107, 107, 0.08), rgba(255, 107, 107, 0.04));
  box-shadow: 0 0 0 1px rgba(255, 107, 107, 0.04), 0 0 18px -8px rgba(255, 107, 107, 0.4);
}

.toneRed .badgeDot {
  background: var(--red);
  box-shadow: 0 0 8px var(--red), 0 0 14px rgba(255, 107, 107, 0.4);
}

.toneRed .badgeValue {
  color: var(--red);
}

.toneRed .badgeLabel {
  color: rgba(255, 107, 107, 0.75);
}
```

Uses `var(--red)` for theme-aware dot fill (`#ff6b6b` dark, `#cf222e` light). `.toneGreen` and `.toneBlue` blocks are untouched.

## Static Checks

| Check | Result |
|-------|--------|
| `pnpm typecheck` | Exit 0 |
| `pnpm lint` | Exit 0 |
| `pnpm build` | Exit 0 |

Build output confirms `/api/ci-status` compiles as a server-rendered route handler.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | bddd76c | feat(04-02): add /api/ci-status route handler with Node runtime and ISR revalidate=300 |
| Task 2 | f1a1ae2 | feat(04-02): wire TopBar CI badge to /api/ci-status with green fallback and red tone CSS |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

The `ciPassing` state defaults to `true` on mount (green "CI · Passing" shown while fetching). This is intentional per D-02 and documented in the plan as the loading and error fallback, not a stub. The badge becomes live immediately after the first successful `/api/ci-status` response.

## Threat Flags

No new threat surfaces beyond what is documented in the plan's threat model (T-04-05 through T-04-11). All mitigations are implemented as required.

## Self-Check: PASSED
