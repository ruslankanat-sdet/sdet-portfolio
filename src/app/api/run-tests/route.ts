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
      body: JSON.stringify({ ref: 'main', return_run_details: true }),
    }
  );

  if (!res.ok) {
    return Response.json({ error: 'Dispatch failed' }, { status: res.status });
  }

  const { workflow_run_id, html_url } = await res.json();
  return Response.json({ runId: workflow_run_id, url: html_url });
}
