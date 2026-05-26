---
phase: 06-vitest-unit-tests
reviewed: 2026-05-26T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - .github/workflows/ci.yml
  - package.json
  - src/components/ide/__tests__/Sidebar.test.tsx
  - src/lib/__tests__/files-data.test.ts
  - src/lib/__tests__/syntax-highlighter.test.ts
  - src/test/setup.ts
  - vitest.config.ts
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 06: Code Review Report

**Reviewed:** 2026-05-26T00:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Seven files were reviewed covering the Vitest unit test suite, its configuration, and the CI pipeline that gates it. The test files themselves are well-structured: mocks are properly isolated with `beforeEach(() => { vi.clearAllMocks(); })`, the Sidebar tests use realistic a11y queries, and the `files-data` and `syntax-highlighter` tests correctly validate shape contracts rather than relying on snapshot fragility.

One blocker was found in the CI pipeline: `vitest@4.1.7` pulls in `vite@8.0.14` and `rolldown@1.0.2`, both of which require Node `>=20.19.0`. The workflow specifies `node-version: 20` without a minimum patch, creating a window where CI can resolve to Node 20.18.x and fail at startup before running a single test. Three warnings cover a misleading test assertion pattern, a missing `engines` declaration, and an untested surface area in the tokenizer. Two info items address redundant code.

---

## Critical Issues

### CR-01: CI `node-version: 20` can resolve below the vite 8 / rolldown minimum

**File:** `.github/workflows/ci.yml:32` (and `:67` in the playwright-tests job)

**Issue:** `vitest@4.1.7` depends on `vite@8.0.14` and `rolldown@1.0.2`. Both packages declare `"engines": { "node": "^20.19.0 || >=22.12.0" }`. The workflow pins `node-version: 20`, which `actions/setup-node@v4` resolves to the latest 20.x available in its version manifest at run time. If the manifest serves 20.18.x (e.g., immediately after a new ubuntu-latest image ships before the manifest is refreshed), both jobs crash before any code runs — the rolldown ESM module fails to load `node:util`'s `styleText` export. This was reproduced locally against Node 18 with the exact error `SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'`. The same failure occurs on any 20.x below 20.19.

**Fix:** Pin to the minimum-safe minor version in both job steps:
```yaml
# quality-gate (line 32) and playwright-tests (line 67)
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: '20.19'   # minimum for vite 8 / rolldown 1.x
    cache: pnpm
```
Alternatively, add a `.nvmrc` or `.node-version` file containing `20.19` and switch to `node-version-file: '.nvmrc'` to keep it as a single source of truth.

---

## Warnings

### WR-01: `expect(promise).resolves.not.toThrow()` is a vacuously-true assertion

**File:** `src/components/ide/__tests__/Sidebar.test.tsx:83`

**Issue:** The test "does not throw when onSelect is not provided" uses the pattern:
```typescript
await expect(user.click(screen.getByRole('button', { name: /README\.md/ }))).resolves.not.toThrow();
```
`user.click()` returns `Promise<void>`. When `.resolves` unwraps it, the resolved value is `undefined`. Calling `.not.toThrow()` on `undefined` is vacuously true — `undefined` is not callable, so it can never throw, and the assertion always passes regardless of what happened during the click. The `.resolves` guard does catch promise *rejections* (which is the useful half of this line), but the `.not.toThrow()` suffix adds no additional verification and actively misleads anyone reading the test.

**Fix:** Replace with a direct await, letting Vitest catch any rejection naturally:
```typescript
it('does not throw when onSelect is not provided', async () => {
  const user = userEvent.setup();
  render(<Sidebar {...defaultProps} />);
  // If the click throws or rejects, Vitest will fail the test automatically.
  await user.click(screen.getByRole('button', { name: /README\.md/ }));
});
```

### WR-02: Missing `engines` field — Node version requirement is undeclared

**File:** `package.json`

**Issue:** `vitest@4.1.7` → `vite@8.0.14` → `rolldown@1.0.2` all require Node `>=20.19.0`. The `package.json` declares no `engines` field, so `pnpm install` succeeds on any Node version. A developer on Node 18 or Node 20.18.x will install successfully, then hit an opaque startup crash the first time they run `pnpm test`. This has already been observed in the local environment.

**Fix:**
```json
{
  "engines": {
    "node": ">=20.19.0",
    "pnpm": ">=9.0.0"
  }
}
```
Add a `.nvmrc` with `20.19` so `nvm use` / `volta` / `mise` picks it up automatically.

### WR-03: `markdown`, `yaml`, and `toml` tokenizers have no unit tests

**File:** `src/lib/__tests__/syntax-highlighter.test.ts`

**Issue:** `syntax-highlighter.ts` exports five tokenizers: TypeScript, JSON, Python, Markdown, YAML, and TOML. The test file covers TypeScript (11 cases), JSON (1 case), and Python (1 case). The `tokenizeMarkdown`, `tokenizeYaml`, and `tokenizeToml` functions — which handle the majority of the FILES content that visitors actually see (README.md, bio.json's accompanying YAML files, experience.yaml, skills.yaml) — have zero test coverage. Any regression in heading rendering, YAML key detection, or inline bold/code handling is invisible to the test suite.

**Fix:** Add at minimum one smoke-test per untested tokenizer in the existing `syntax-highlighter.test.ts`:
```typescript
describe('tokenize — markdown', () => {
  it('classifies a heading line as tk-md-h', () => {
    const tokens = tokenize('# Hello World', 'markdown');
    const headings = findTokens(tokens, 'md-h');
    expect(headings).toHaveLength(1);
    expect(tokenText(headings[0])).toBe('# Hello World');
  });
});

describe('tokenize — yaml', () => {
  it('classifies a key-value pair key as tk-key', () => {
    const tokens = tokenize('name: Ruslan', 'yaml');
    const keys = findTokens(tokens, 'key');
    expect(keys.length).toBeGreaterThanOrEqual(1);
    expect(tokenText(keys[0])).toBe('name');
  });
});

describe('tokenize — toml', () => {
  it('classifies a section header as tk-type', () => {
    const tokens = tokenize('[package]', 'toml');
    const types = findTokens(tokens, 'type');
    expect(types).toHaveLength(1);
  });
});
```

---

## Info

### IN-01: Triple-slash `/// <reference types="vitest/globals" />` is redundant

**File:** `src/components/ide/__tests__/Sidebar.test.tsx:1`, `src/lib/__tests__/files-data.test.ts:1`, `src/lib/__tests__/syntax-highlighter.test.ts:1`

**Issue:** `vitest.config.ts` sets `globals: true`, which injects `describe`, `it`, `expect`, `beforeEach`, etc. into the global scope at runtime. The triple-slash reference in each test file also pulls in the TypeScript type declarations for those globals. With `globals: true`, `tsconfig.json` should instead include `"types": ["vitest/globals"]` in the compiler options, which is the canonical way to handle this. The current triple-slash approach is per-file boilerplate that will be forgotten when new test files are added.

**Fix:** Remove the triple-slash from all three test files and add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```
Alternatively, keep the per-file reference style but document it as the project convention.

### IN-02: `packageManager` field absent — pnpm version only declared in CI

**File:** `package.json`

**Issue:** The pnpm version used in CI is `9` (via `pnpm/action-setup@v4`), but `package.json` has no `"packageManager"` field. Without it, `corepack` cannot enforce the correct pnpm version locally, and a developer using pnpm 8 (or a future pnpm 10) may get subtly different lockfile resolution.

**Fix:**
```json
{
  "packageManager": "pnpm@9.15.4"
}
```
Pin to whichever 9.x is installed at project creation time, then enable corepack (`corepack enable`) so the field is enforced.

---

_Reviewed: 2026-05-26T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
