export const runtime = 'nodejs';

// run_id must be a positive integer — prevents path-traversal injection into the GitHub API URL (T-03-INJECT).
const RUN_ID_RE = /^\d+$/;

export async function GET(
  _request: Request,
  context: { params: Promise<{ run_id: string }> }
) {
  const { run_id } = await context.params;

  if (!RUN_ID_RE.test(run_id)) {
    return Response.json(
      { error: 'run_id must be a positive integer' },
      { status: 400 }
    );
  }

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
    `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run_id}/jobs`,
    {
      method: 'GET',
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

  const data = await res.json();
  // Pure proxy — GITHUB_TOKEN is server-side only, never echoed (T-03-01).
  return Response.json(data);
}
