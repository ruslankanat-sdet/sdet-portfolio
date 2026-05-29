'use client';

import styles from './recruiter.module.css';

interface AvailRow {
  label: string;
  value: string;
  good?: boolean;
}

const ROWS: AvailRow[] = [
  { label: 'Status', value: 'Open to offers · Q3 start', good: true },
  { label: 'Location', value: 'Remote · UTC-5 (occasional travel ok)' },
  { label: 'Level', value: 'Staff or Principal IC' },
  { label: 'Best fit', value: 'AI platform, dev tools, infra-shaped teams' },
  { label: 'Comp', value: 'Range available on request' },
  { label: 'Visa', value: 'US citizen — no sponsorship needed' },
];

export function AvailabilityCard() {
  return (
    <div className={styles.availCard}>
      {ROWS.map((row) => (
        <div key={row.label} className={styles.availRow}>
          <div className={styles.availLabelCard}>{row.label}</div>
          <div
            className={`${styles.availValueCard}${row.good ? ` ${styles.good}` : ''}`}
          >
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}
