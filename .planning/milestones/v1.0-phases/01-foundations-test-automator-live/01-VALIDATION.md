---
phase: 1
slug: foundations-test-automator-live
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-16
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x (unit) + Playwright 1.60+ (E2E) |
| **Config file** | `vitest.config.ts` — Wave 0 gap; `playwright.config.ts` — Wave 0 gap |
| **Quick run command** | `pnpm vitest run` |
| **Full suite command** | `pnpm vitest run && pnpm playwright test` |
| **Estimated runtime** | ~15s (unit) + ~60s (E2E) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run` (schema + unit tests, <5s)
- **After every plan wave:** Run `pnpm vitest run && pnpm playwright test` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds (unit only), 75 seconds (full)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| FOUND-03 | bootstrap | 0 | FOUND-03 | T-1-01 | `sk-ant-` not in .next/static | CI grep | `grep -r "sk-ant-" .next/static/ 2>/dev/null \|\| true` | ❌ W0 (`.github/workflows/ci.yml`) | ⬜ pending |
| FOUND-04 | bootstrap | 0 | FOUND-04 | T-1-02 | Build fails if server-only violated | build | `pnpm build` | ❌ implicit | ⬜ pending |
| FRAME-01 | framework | 1 | FRAME-01 | — | Tool interface shape is correct | unit | `pnpm vitest run tests/unit/tool-interface.test.ts` | ❌ W0 | ⬜ pending |
| FRAME-05 | framework | 1 | FRAME-05 | — | Validation runs before LLM call | unit | `pnpm vitest run tests/unit/test-automator-schema.test.ts` | ❌ W0 | ⬜ pending |
| FRAME-06 | rate-limit | 2 | FRAME-06 | T-1-03 | 11th req returns 429 + Retry-After | integration | Manual (requires Upstash Redis) | ❌ W0 | ⬜ pending |
| FRAME-09 | ide-shell | 2 | FRAME-09 | — | Error messages are non-generic | E2E | `pnpm playwright test tests/e2e/test-automator.spec.ts` | ❌ W0 | ⬜ pending |
| FRAME-11 | framework | 1 | FRAME-11 | T-1-04 | >4000 chars returns 413, no LLM call | unit | `pnpm vitest run tests/unit/test-automator-schema.test.ts` | ❌ W0 | ⬜ pending |
| AUTO-01 | test-automator | 2 | AUTO-01 | — | URL without http(s) is rejected inline | unit | `pnpm vitest run tests/unit/test-automator-schema.test.ts` | ❌ W0 | ⬜ pending |
| AUTO-02 | test-automator | 2 | AUTO-02 | — | First token visible within ~1s | E2E | `pnpm playwright test tests/e2e/test-automator.spec.ts` | ❌ W0 | ⬜ pending |
| AUTO-06 | test-automator | 2 | AUTO-06 | — | Example fixture pre-fills textarea | E2E | `pnpm playwright test tests/e2e/test-automator.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — unit runner config
- [ ] `playwright.config.ts` — E2E config pointing to `http://localhost:3000`
- [ ] `tests/unit/test-automator-schema.test.ts` — covers FRAME-05, FRAME-11, AUTO-01 (Zod schema validation)
- [ ] `tests/unit/tool-interface.test.ts` — covers FRAME-01 (TypeScript interface shape)
- [ ] `tests/unit/syntax-highlighter.test.ts` — covers tokenizer port correctness
- [ ] `tests/e2e/test-automator.spec.ts` — covers AUTO-02, AUTO-06, FRAME-09
- [ ] `.github/workflows/ci.yml` — lint + typecheck + `pnpm vitest run` + CI grep for `sk-ant-`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Rate limit 429 with real Redis | FRAME-06 | Requires live Upstash Redis in staging; cannot mock sliding-window behavior reliably | Make 11 rapid POST /api/tools/test-automator requests from same IP; 11th must return 429 with Retry-After header |
| Streaming first token <1s | AUTO-02 | Timing depends on Claude API latency; automated test is flaky | Manually submit user story, verify code appears in <2s with network throttling at "Fast 3G" in DevTools |
| Vercel env vars not in bundle | FOUND-03 | Requires deployed .next/static to grep | Run CI grep in GitHub Actions against built output |
| No persistence after request | FRAME-10 | No server-side storage to inspect — behavioral guarantee | Confirm no DB/KV writes; no files saved; inspect request logs |

---

## Security Verification (ASVS Level 1)

| ASVS Category | Applies | Verification | Command |
|---------------|---------|--------------|---------|
| V5 Input Validation | Yes | Zod rejects oversized/malformed inputs before LLM | Unit: `tests/unit/test-automator-schema.test.ts` |
| V7 Error Handling | Yes | Stack traces never reach client response | Manual: inspect network response body on 5xx |
| V8 Data Protection | Yes | `server-only` enforced; no persistence | Build: `pnpm build` fails if violated |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s (unit), < 75s (full)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
