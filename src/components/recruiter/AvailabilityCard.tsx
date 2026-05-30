'use client';

import styles from './recruiter.module.css';
import { AVAIL_ROWS, type AvailRow } from '@/lib/resume-content';

export function AvailabilityCard() {
  return (
    <div className={styles.availCard}>
      {AVAIL_ROWS.map((row) => (
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
