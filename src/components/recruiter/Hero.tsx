'use client';

import styles from './recruiter.module.css';
import { HERO_COPY } from '@/lib/resume-content';

export function Hero() {
  return (
    <section className={styles.hero} aria-label="Introduction">
      <div className={styles.eyebrow}>
        <span className={styles.avail}>
          <span className={styles.availDot} aria-hidden="true" />
          <span className={styles.availLabel}>Status</span>
          <span className={styles.availSep}>:</span>
          <span className={styles.availValue}>{HERO_COPY.availValue}</span>
        </span>
        <span className={styles.ghost}>{HERO_COPY.location}</span>
        <span className={styles.sep}>·</span>
        <span className={styles.ghost}>{HERO_COPY.level}</span>
      </div>
      <h1 className={styles.headline}>
        {HERO_COPY.headline}
      </h1>
      <p className={styles.pitch}>
        {HERO_COPY.pitch}
      </p>
      <div className={styles.ctas}>
        <a className={styles.btnPrimary} href="/resume.pdf" download>
          <span>Download PDF</span>
          <span>↓</span>
        </a>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => window.print()}
        >
          <span>Print</span>
          <span>⎙</span>
        </button>
        <a className={styles.btnSecondary} href="mailto:ruslankanat.b@gmail.com">
          <span>ruslankanat.b@gmail.com</span>
          <span>→</span>
        </a>
      </div>
    </section>
  );
}
