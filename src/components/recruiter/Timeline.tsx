'use client';

import styles from './recruiter.module.css';

interface Job {
  current?: boolean;
  span?: string;
  role: string;
  company: string;
  scope: string;
  stack: readonly string[];
}

const JOBS: Job[] = [
  {
    current: true,
    role: 'Staff SDET, AI Platform',
    company: 'Lumen Systems',
    scope:
      'Lead a team of six building eval infra for production LLM agents. Shipped a self-healing selector agent now used across four product lines; reduced selector-related flakes by 94% in six months.',
    stack: ['Python', 'TypeScript', 'LangGraph', 'Playwright', 'Braintrust'],
  },
  {
    span: '2020 — 2023',
    role: 'Senior SDET',
    company: 'Northwind Robotics',
    scope:
      'Owned QA for the autonomous-pick fulfillment platform. Built nightly perf harness sustaining 50k RPS against a prod-mirror cluster, with auto-rollback on p95 regression.',
    stack: ['Go', 'k6', 'Grafana', 'Kubernetes'],
  },
  {
    span: '2017 — 2020',
    role: 'Automation Engineer',
    company: 'Helix Health',
    scope:
      'HIPAA-compliant test pipelines for a patient portal serving 2M+ users. Cut release cycle from two weeks to two days.',
    stack: ['Java', 'Selenium', 'Jenkins'],
  },
];

export function Timeline() {
  return (
    <div className={styles.timelineList}>
      {JOBS.map((job) => (
        <div key={job.role} className={styles.timelineJob}>
          <div className={styles.spanCol}>
            {job.current ? (
              <>
                <span className={styles.spanYearCurrent}>2023</span>
                {' — Now'}
              </>
            ) : (
              job.span
            )}
          </div>
          <div>
            <h3 className={styles.jobRole}>{job.role}</h3>
            <div className={styles.jobCompany}>{job.company}</div>
            <p className={styles.jobScope}>{job.scope}</p>
            <div className={styles.jobStack}>
              {job.stack.map((s) => (
                <span key={s} className={styles.stackPill}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
