---
phase: 06-vitest-unit-tests
fixed_at: 2026-05-26T14:04:00Z
review_path: .planning/phases/06-vitest-unit-tests/06-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 06: Code Review Fix Report

**Fixed at:** 2026-05-26T14:04:00Z
**Source review:** .planning/phases/06-vitest-unit-tests/06-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4 (CR-01, WR-01, WR-02, WR-03)
- Fixed: 4
- Skipped: 0

## Fixed Issues

### CR-01: Pin CI node-version to 20.19

**Files modified:** `.github/workflows/ci.yml`
**Commit:** e566d5b
**Applied fix:** Changed both `node-version: 20` occurrences (quality-gate job line 32 and playwright-tests job line 67) to `node-version: '20.19'` with an explanatory comment. This pins CI to the minimum-safe minor version for vite 8 / rolldown 1.x which require `node >=20.19.0`.

---

### WR-01: Fix vacuous `.resolves.not.toThrow()` assertion

**Files modified:** `src/components/ide/__tests__/Sidebar.test.tsx`
**Commit:** 769e712
**Applied fix:** Replaced the `await expect(user.click(...)).resolves.not.toThrow()` pattern with a plain `await user.click(...)`. The vacuous assertion always passed because `.resolves` unwraps to `undefined` which is never callable. The direct await lets Vitest catch real rejections naturally. Added an explanatory comment.

---

### WR-02: Add `engines` field to package.json

**Files modified:** `package.json`, `.nvmrc` (created)
**Commit:** 0753021
**Applied fix:** Added `"engines": { "node": ">=20.19.0", "pnpm": ">=9.0.0" }` to `package.json` before the `"dependencies"` block. Created `.nvmrc` containing `20.19` at the repo root so nvm/volta/mise picks up the correct Node version automatically.

---

### WR-03: Add smoke tests for markdown, yaml, toml tokenizers

**Files modified:** `src/lib/__tests__/syntax-highlighter.test.ts`
**Commit:** 3d8e915
**Applied fix:** Appended three new `describe` blocks at the end of the test file. Verified the actual tokenizer implementation before writing tests:
- Markdown: `tokenizeMarkdown` emits `T('md-h', '# Hello World', ...)` for heading lines — class name `md-h` confirmed correct.
- YAML: `tokenizeYaml` emits `T('key', 'name', ...)` for `'name: Ruslan'` — key text is the bare key without the colon.
- TOML: `tokenizeToml` emits `T('type', '[package]', ...)` for section headers — full bracket text including brackets.

All 36 tests pass (33 original + 3 new added by this fix).

---

_Fixed: 2026-05-26T14:04:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
