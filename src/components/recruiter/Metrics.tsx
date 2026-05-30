'use client';

import styles from './recruiter.module.css';
import { METRICS } from '@/lib/resume-content';

export function Metrics() {
  return (
    <div className={styles.metricsGrid}>
      {METRICS.map((m) => (
        <div key={m.label} className={styles.metricTile}>
          <div className={styles.metricNum}>
            {m.num}
            {m.unit && <span className={styles.unit}>{m.unit}</span>}
          </div>
          <div className={styles.metricLabel}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}
