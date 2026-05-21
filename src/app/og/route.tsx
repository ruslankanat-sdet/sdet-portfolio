import { ImageResponse } from 'next/og';

// Node runtime per CLAUDE.md convention (not Edge) — Node gets 60s maxDuration vs Edge's 25s
export const runtime = 'nodejs';

// 24h cache — do NOT use force-static (conflicts with ImageResponse at request time)
export const revalidate = 86400;

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          // CRITICAL: CSS variables do NOT work inside ImageResponse (Satori does not evaluate
          // CSS custom properties). All hex values are taken directly from
          // .planning/design/design_handoff_ide_portfolio/styles.css — update both when tokens change.
          backgroundColor: '#0b1117', // --bg-deep
          color: '#e2e8f0',           // --text-primary (key_technical_facts #3 override)
          fontFamily: 'monospace',
        }}
      >
        {/* Candidate name — token: --green (#3ddc84) */}
        <div style={{ fontSize: 72, fontWeight: 700, color: '#3ddc84' }}>
          Ruslan Kanatbek
        </div>

        {/* Role tagline — token: --text-muted (#8b96a8) */}
        <div style={{ fontSize: 32, marginTop: 24, color: '#8b96a8' }}>
          Senior SDET · Playwright · TypeScript
        </div>

        {/* Site URL — token: --blue (#79b8ff) */}
        <div style={{ fontSize: 24, marginTop: 40, color: '#79b8ff' }}>
          ruslankanat.dev
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
