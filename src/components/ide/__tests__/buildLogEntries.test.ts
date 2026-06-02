import { describe, it, expect } from 'vitest';
import { buildLogEntries } from '../IDEShell';

// REPORT_URL constant from IDEShell (added in Task 2)
const EXPECTED_REPORT_URL = 'https://ruslankanat-sdet.github.io/sdet-portfolio/';

describe('buildLogEntries()', () => {
  it('State 1 — queued: emits info entry with "⏳ Queued:" prefix', () => {
    const data = {
      jobs: [
        { name: 'quality-gate', status: 'queued', conclusion: null },
      ],
    };
    const entries = buildLogEntries(data);

    const infoEntries = entries.filter(e => e.kind === 'info');
    const queuedEntry = infoEntries.find(e => e.text?.startsWith('⏳ Queued:'));
    expect(queuedEntry).toBeDefined();
    expect(queuedEntry?.text).toContain('quality-gate');

    // No ok, fail, or link entries while queued
    expect(entries.some(e => e.kind === 'ok')).toBe(false);
    expect(entries.some(e => e.kind === 'fail')).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(entries.some(e => (e as any).kind === 'link')).toBe(false);
  });

  it('State 2 — in_progress: emits info entry with "▶ Running:" prefix', () => {
    const data = {
      jobs: [
        { name: 'playwright-tests', status: 'in_progress', conclusion: null },
      ],
    };
    const entries = buildLogEntries(data);

    const runningEntry = entries.find(
      e => e.kind === 'info' && e.text?.startsWith('▶ Running:')
    );
    expect(runningEntry).toBeDefined();
    expect(runningEntry?.text).toContain('playwright-tests');

    // No summary or link entries while in progress
    expect(entries.some(e => e.kind === 'ok')).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(entries.some(e => (e as any).kind === 'link')).toBe(false);
  });

  it('State 3 — all complete, all passed: emits ok summary with jobs count + duration and link entry', () => {
    const data = {
      jobs: [
        { name: 'quality-gate', status: 'completed', conclusion: 'success' },
        { name: 'playwright-tests', status: 'completed', conclusion: 'success' },
      ],
      run_started_at: '2026-06-01T10:00:00Z',
      updated_at: '2026-06-01T10:01:30Z', // 90 seconds later → "1m 30s"
    };
    const entries = buildLogEntries(data);

    // Assert ok summary entry
    const okEntry = entries.find(e => e.kind === 'ok');
    expect(okEntry).toBeDefined();
    expect(okEntry?.text).toMatch(/Jobs: 2\/2 passed/);

    // Assert duration is included in summary
    expect(okEntry?.text).toContain('1m 30s');

    // Assert link entry exists with correct text and href
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const linkEntry = entries.find(e => (e as any).kind === 'link');
    expect(linkEntry).toBeDefined();
    expect(linkEntry?.text).toBe('View Report →');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((linkEntry as any)?.href).toBe(EXPECTED_REPORT_URL);
  });

  it('State 4 — all complete, one failed: emits fail summary with jobs count and NO link entry', () => {
    const data = {
      jobs: [
        { name: 'quality-gate', status: 'completed', conclusion: 'success' },
        { name: 'playwright-tests', status: 'completed', conclusion: 'failure' },
      ],
      run_started_at: '2026-06-01T10:00:00Z',
      updated_at: '2026-06-01T10:01:30Z',
    };
    const entries = buildLogEntries(data);

    // Assert fail summary entry
    const failEntry = entries.find(e => e.kind === 'fail' && e.text?.match(/Jobs:/));
    expect(failEntry).toBeDefined();
    expect(failEntry?.text).toMatch(/Jobs: 1\/2 passed/);

    // Assert NO link entry when there are failures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(entries.some(e => (e as any).kind === 'link')).toBe(false);
  });
});
