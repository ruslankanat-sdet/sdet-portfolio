/**
 * Single source-of-truth for all recruiter-view content.
 * Pure data module — no React imports, no 'use client' directive.
 * Components import named exports from here instead of defining local const arrays.
 */

export const HERO_COPY = {
  availValue: 'Open to opportunities · Q3 start',
  location: 'Fremont, CA (Hybrid or Remote)',
  level: 'Senior / Lead / Principal',
  headline: 'Senior SDET & Quality Architect — AI-Augmented Testing at Scale',
  pitch:
    'For the past decade, I have engineered high-scale quality infrastructure for mission-critical platforms—spanning mobile applications, trading systems, and HIPAA-compliant cloud architectures. Currently, as a Senior SDET at ResMed, I lead the automated testing strategy protecting the 16M+ user myAir ecosystem. By pioneering AI-augmented engineering via custom Copilot workflows and local MCP servers, I’ve compressed release cycles by 30% while maximizing developer velocity.',
  nowLede:
    'As a Senior SDET at ResMed, I architect and execute the automated testing strategy for the myAir ecosystem, a medical SaaS platform serving over 16 million CPAP therapy users. My work ensures comprehensive coverage across mobile (Kotlin/Espresso and Swift/XCUITest), web (TypeScript/Cypress), and GraphQL microservices via a scalable Python/Behave backend framework. Right now, my core technical focus is scaling AI-augmented engineering—deploying custom GitHub Copilot rulesets and local MCP server assistants to aggressively accelerate QA cycles without sacrificing system rigor.',
} as const;

export const METRICS = [
  { num: '10', unit: 'yrs', label: 'Building test\ninfrastructure' },
  { num: '80', unit: '%', label: 'Defect reduction\nat ResMed' },
  { num: '30', unit: '%', label: 'Faster QA cycles\nwith AI tools' },
  { num: '16', unit: 'M+', label: 'Users on myAir\nprotected' },
] as const;

export interface Job {
  current?: boolean;
  span?: string;
  role: string;
  company: string;
  scope: string;
  stack: readonly string[];
}

export const JOBS: Job[] = [
  {
    span: '2022 — Now',
    role: 'Senior SDET (AWS/Mobile/Web)',
    company: 'ResMed',
    scope: 'Architected and led the end-to-end quality strategy for a core team within the myAir app ecosystem serving over 16 million users, driving an 80% reduction in production defects through early-stage integration testing. Built automated mobile test flows using Kotlin/Espresso and Swift/XCUITest, migrated the web stack to TypeScript/Cypress, and engineered a scalable Python/Behave framework for AWS GraphQL microservices. Pioneered AI-augmented engineering by introducing custom GitHub Copilot rules and local MCP assistant servers, accelerating QA cycles by 30%.',
    stack: [
      'Python',
      'TypeScript',
      'Kotlin',
      'Swift',
      'Cypress',
      'Espresso',
      'XCUITest',
      'Behave',
      'AWS Lambda',
      'AppSync',
      'GraphQL',
      'GitHub Copilot',
      'MCP',
      'Datadog',
    ],
  },
  {
    span: '2021 — 2022',
    role: 'SDET / Software Engineer',
    company: 'Gemini',
    scope: 'Architected a high-concurrency Python/Pytest automation framework for critical trading modules, expanding automated coverage from 0% to 80%. Optimized backend testing efficiency by upgrading Selenium suites and improving PostgreSQL data validation. Engineered core Scala backend components for institutional trading platforms and trained cross-functional software developers on modern QA ownership.',
    stack: ['Python', 'Scala', 'Pytest', 'Selenium', 'PostgreSQL'],
  },
  {
    span: '2021',
    role: 'QA Tester (Mobile)',
    company: 'TCS (Client: Google)',
    scope: 'Spearheaded mobile quality initiatives for Google Shopping on Android and iOS by deploying automated smoke and regression suites to maximize build stability. Served as the Google Workspace Test Lead during high-profile product launches, coordinating on-call operations for 24/7 blocker mitigation. Developed sophisticated functional and visual automation workflows using Java, Appium, and Bazel.',
    stack: ['Java', 'Appium', 'Bazel', 'Android', 'iOS'],
  },
];

export const SKILL_GROUPS = [
  {
    cat: 'Automation',
    items: [
      'Selenium',
      'Playwright',
      'Appium',
      'Pytest',
      'TestNG',
      'Cypress',
      'Cucumber (BDD)',
      'Behave',
      'REST-assured',
      'JUnit',
    ],
  },
  {
    cat: 'AI / ML',
    items: [
      'GitHub Copilot (Custom Rule Sets)',
      'Claude Code',
      'MCP (Model Context Protocol) Server Engineering',
    ],
  },
  {
    cat: 'Infra',
    items: [
      'AWS (Lambda, DynamoDB, AppSync)',
      'GitHub Actions',
      'Firebase',
      'Jenkins',
      'Docker',
      'Terraform',
      'Bazel',
    ],
  },
  {
    cat: 'Languages',
    items: ['Python', 'Java', 'SQL', 'Ruby', 'TypeScript', 'Scala'],
  },
] as const;

export interface AvailRow {
  label: string;
  value: string;
  good?: boolean;
}

export const AVAIL_ROWS: AvailRow[] = [
  { label: 'Status', value: 'Open to opportunities · Q3 start', good: true },
  { label: 'Location', value: 'Fremont, CA / SF Bay Area (Hybrid or Local) / Remote' },
  { label: 'Level', value: 'Senior / Lead / Principal' },
  {
    label: 'Best fit',
    value:
      'Fintech, Health Tech, or enterprise SaaS — scaling automation, optimizing CI/CD, introducing AI-assisted testing efficiencies',
  },
  { label: 'Comp', value: 'Range available on request' },
  { label: 'Visa', value: 'Authorized to work in the US (details on request)' },
];

export const EARLIER_CAREERS =
  'Earlier: QA Automation Engineer · Veridian IT Staffing (Citibank · Cisco · Health First) · 2015–2020';
