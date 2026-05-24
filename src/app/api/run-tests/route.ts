// NOTE: This endpoint has no rate limiting in v1 — Upstash Redis was cut from scope.
// A visitor can spam the button and trigger many CI runs, burning GitHub Actions minutes.
// Acceptable risk for a low-traffic portfolio. See 03-CONTEXT.md decision to defer rate limiting.

export const runtime = 'nodejs';

export async function POST() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json({ error: 'CI trigger not configured' }, { status: 503 });
  }

  const owner = process.env.GH_OWNER;
  const repo = process.env.GH_REPO;
  if (!owner || !repo) {
    return Response.json({ error: 'CI trigger not configured' }, { status: 503 });
  }

  // Trigger the workflow — returns 204 No Content (no body to parse)
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/ci.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main' }),
    }
  );

  if (!res.ok) {
    return Response.json({ error: 'Dispatch failed' }, { status: res.status });
  }

  // GitHub returns 204 No Content — wait briefly for the run to be queued,
  // then fetch the most recent workflow_dispatch run to get its ID for polling.
  await new Promise(r => setTimeout(r, 2000));

  const runsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/runs?event=workflow_dispatch&branch=main&per_page=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (!runsRes.ok) {
    // Dispatch succeeded but we can't resolve the run ID yet — return partial success.
    // IDEShell handles runId: null by logging dispatch success without polling.
    return Response.json({ runId: null, url: null });
  }

  const runsData = await runsRes.json() as { workflow_runs?: { id: number; html_url: string }[] };
  const latestRun = runsData.workflow_runs?.[0];
  return Response.json({
    runId: latestRun?.id ?? null,
    url: latestRun?.html_url ?? null,
  });
}
