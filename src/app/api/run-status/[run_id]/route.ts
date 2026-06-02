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

  const base = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Fetch jobs and run metadata in parallel for efficiency (T-11-03: strip response to only needed fields)
  const [jobsRes, runRes] = await Promise.all([
    fetch(`${base}/actions/runs/${run_id}/jobs`, { method: 'GET', headers }),
    fetch(`${base}/actions/runs/${run_id}`, { method: 'GET', headers }),
  ]);

  if (!jobsRes.ok) {
    return Response.json({ error: 'Status fetch failed' }, { status: jobsRes.status });
  }

  const jobsData = await jobsRes.json();
  // Timing data is best-effort enrichment — don't fail if run endpoint returns an error
  const runData: { run_started_at?: string | null; updated_at?: string | null } =
    runRes.ok ? await runRes.json() : {};

  // Strip response to only necessary fields — GITHUB_TOKEN never echoed (T-11-03)
  return Response.json({
    jobs: jobsData.jobs,
    run_started_at: runData.run_started_at ?? null,
    updated_at: runData.updated_at ?? null,
  });
}
