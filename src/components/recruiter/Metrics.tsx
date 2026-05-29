'use client';

import styles from './recruiter.module.css';

const METRICS = [
  { num: '9', unit: 'yrs', label: 'Building test\ninfrastructure' },
  { num: '0.4', unit: '%', label: 'Flake rate\nacross suites' },
  { num: '98.2', unit: '%', label: 'Coverage on\ncritical paths' },
  { num: '1,247', unit: '', label: 'Bugs caught\nYTD' },
] as const;

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
