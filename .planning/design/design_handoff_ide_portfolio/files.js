// File contents for the IDE workspace

const FILES = {
  "bio.json": {
    lang: "json",
    path: "~/portfolio/bio.json",
    icon: "json",
    content: `{
  "engineer": {
    "name": "Alex Morgan",
    "role": "Senior SDET & AI Automation Engineer",
    "location": "Remote — UTC-5",
    "available": true,
    "yearsOfExperience": 9
  },
  "summary": [
    "Builds self-healing test frameworks that catch regressions",
    "before they ship. Specializes in LLM-driven test generation,",
    "Playwright pipelines, and observability at scale."
  ],
  "expertise": {
    "automation": ["Playwright", "Cypress", "Pytest", "Appium"],
    "ai_ml": ["LangChain", "LlamaIndex", "RAG", "Evals"],
    "infra":   ["GitHub Actions", "Kubernetes", "Terraform"],
    "languages": ["Python", "TypeScript", "Go", "Rust"]
  },
  "metrics": {
    "flakeRate":     "0.4%",
    "testCoverage":  "98.2%",
    "p95Runtime":    "4m 12s",
    "bugsCaughtYTD": 1247
  },
  "contact": {
    "email":   "alex@morgan.dev",
    "github":  "github.com/amorgan",
    "linkedin":"in/amorgan-sdet"
  }
}`,
  },

  "test_suites.py": {
    lang: "python",
    path: "~/portfolio/test_suites.py",
    icon: "py",
    content: `# ─────────────────────────────────────────────────────────
# Production test suites I architect & maintain.
# All suites run on every PR + nightly against prod mirror.
# ─────────────────────────────────────────────────────────

from framework import Suite, tag, parallel


@tag("smoke", "critical")
@parallel(workers=12)
class CheckoutSuite(Suite):
    """End-to-end checkout flow across 14 markets."""
    coverage  = 0.984
    avg_runtime = "3m 42s"
    flake_rate  = 0.003


@tag("ai", "regression")
class LLMResponseSuite(Suite):
    """Semantic eval of agent responses against
    a golden dataset of 4,200 prompts."""
    eval_model = "claude-haiku-4-5"
    threshold  = 0.92


@tag("perf", "nightly")
class LoadSuite(Suite):
    """k6-driven load tests, 50k RPS sustained,
    auto-rollback on p95 > 800ms."""
    target_rps = 50_000
    sla_p95    = "800ms"


# 47 more suites — see /suites for the full registry.
`,
  },

  "ai_architectures.md": {
    lang: "markdown",
    path: "~/portfolio/ai_architectures.md",
    icon: "md",
    content: `# AI Architectures I've Shipped

## 1. Self-Healing Selector Agent
A LangGraph agent that watches Playwright failures, diffs the
DOM, proposes new selectors, and opens a PR with the fix.

> Reduced selector-related flakes by **94%** in 6 months.

## 2. RAG-Powered Test Generation
Ingests product specs + Jira tickets into a vector store.
Generates Pytest cases on PR-open, reviewed by a senior eval model.

| Metric              | Before | After   |
|---------------------|--------|---------|
| Spec-to-test time   | 4 days | 11 min  |
| Coverage delta / PR | +0.3%  | +2.1%   |

## 3. Observability Copilot
Streaming agent over OpenTelemetry traces — answers
"why did checkout p99 spike at 14:32 UTC?" in plain English.

---

*Full case studies available on request.*
`,
  },

  "experience.yaml": {
    lang: "yaml",
    path: "~/portfolio/experience.yaml",
    icon: "yaml",
    content: `# Career timeline — most recent first

- company: Lumen Systems
  role:    Staff SDET, AI Platform
  span:    2023 — present
  scope:   |
    Lead a team of 6 building eval infra for
    production LLM agents. Shipped self-healing
    selector agent now used across 4 product lines.
  stack: [Python, TypeScript, LangGraph, Playwright]

- company: Northwind Robotics
  role:    Senior SDET
  span:    2020 — 2023
  scope:   |
    Owned QA for the autonomous-pick fulfillment
    platform. Built nightly perf harness sustaining
    50k RPS against a prod-mirror cluster.
  stack: [Go, k6, Grafana, Kubernetes]

- company: Helix Health
  role:    Automation Engineer
  span:    2017 — 2020
  scope:   |
    HIPAA-compliant test pipelines for a patient
    portal serving 2M+ users.
  stack: [Java, Selenium, Jenkins]
`,
  },

  "stack.toml": {
    lang: "toml",
    path: "~/portfolio/stack.toml",
    icon: "toml",
    content: `# Tools I reach for every day.

[languages]
primary   = ["Python", "TypeScript"]
secondary = ["Go", "Rust"]
learning  = ["Zig"]

[testing]
e2e       = "Playwright"
api       = "Pytest + httpx"
load      = "k6"
contract  = "Pact"

[ai]
orchestration = "LangGraph"
evals         = "Braintrust"
vector_store  = "Qdrant"
inference     = ["Anthropic", "OpenAI", "vLLM (self-hosted)"]

[infra]
ci    = "GitHub Actions"
cd    = "ArgoCD"
iac   = "Terraform + Pulumi"
cloud = ["AWS", "GCP"]
`,
  },

  "README.md": {
    lang: "markdown",
    path: "~/portfolio/README.md",
    icon: "md",
    content: `# 👋 Hi, I'm Alex.

I build the test infrastructure that keeps AI products honest.

**Currently:** Staff SDET on the AI Platform team at Lumen Systems.
**Previously:** Northwind Robotics, Helix Health.

Open to staff-level roles where automation, AI, and product
quality intersect. Reach me at \`alex@morgan.dev\`.
`,
  },
};

window.FILES = FILES;
