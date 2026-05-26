import { FILES, SAMPLE_LOGS } from '../files-data';
import type { FileEntry, LogEntry } from '@/types/ide';

const VALID_LANGS: FileEntry['lang'][] = ['typescript', 'json', 'python', 'markdown', 'yaml'];
const VALID_ICONS: FileEntry['icon'][] = ['ts', 'json', 'py', 'md', 'yaml'];
const VALID_KINDS: LogEntry['kind'][] = ['info', 'warn', 'ok', 'pass', 'fail'];

describe('FILES — shape validation', () => {
  it('has at least one entry', () => {
    expect(Object.keys(FILES).length).toBeGreaterThan(0);
  });

  it('every entry has required fields', () => {
    for (const [key, entry] of Object.entries(FILES)) {
      expect(VALID_LANGS, `${key}: lang must be a valid FileEntryLang`).toContain(entry.lang);
      expect(typeof entry.path, `${key}: path must be a string`).toBe('string');
      expect(entry.path.length, `${key}: path must be non-empty`).toBeGreaterThan(0);
      expect(VALID_ICONS, `${key}: icon must be a valid FileEntryIcon`).toContain(entry.icon);
      expect(typeof entry.content, `${key}: content must be a string`).toBe('string');
      expect(entry.content.length, `${key}: content must be non-empty`).toBeGreaterThan(0);
    }
  });

  it('README.md entry exists with markdown lang', () => {
    expect(FILES['README.md']).toBeDefined();
    expect(FILES['README.md'].lang).toBe('markdown');
  });

  it('bio.json entry exists with json lang', () => {
    expect(FILES['bio.json']).toBeDefined();
    expect(FILES['bio.json'].lang).toBe('json');
  });

  it('tests/landing.spec.ts entry exists with typescript lang', () => {
    expect(FILES['tests/landing.spec.ts']).toBeDefined();
    expect(FILES['tests/landing.spec.ts'].lang).toBe('typescript');
  });
});

describe('SAMPLE_LOGS — shape validation', () => {
  it('is a non-empty array', () => {
    expect(SAMPLE_LOGS.length).toBeGreaterThan(0);
  });

  it('every entry has a valid kind', () => {
    for (const entry of SAMPLE_LOGS) {
      expect(VALID_KINDS).toContain(entry.kind);
    }
  });

  it('contains at least one pass entry', () => {
    expect(SAMPLE_LOGS.some(e => e.kind === 'pass')).toBe(true);
  });
});
