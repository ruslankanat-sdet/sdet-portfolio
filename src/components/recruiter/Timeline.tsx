'use client';

import styles from './recruiter.module.css';
import { JOBS, EARLIER_CAREERS, type Job } from '@/lib/resume-content';

export function Timeline() {
  return (
    <>
      <ul className={styles.timelineList} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {JOBS.map((job) => (
          <li key={job.role} className={styles.timelineJob}>
            <div className={styles.spanCol}>
              {job.span}
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
          </li>
        ))}
      </ul>
      <p className={styles.earlierCareers}>{EARLIER_CAREERS}</p>
    </>
  );
}
