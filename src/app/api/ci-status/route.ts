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
