'use client';

import styles from './recruiter.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-label="Introduction">
      <div className={styles.eyebrow}>
        <span className={styles.avail}>
          <span className={styles.availDot} aria-hidden="true" />
          <span className={styles.availLabel}>Status</span>
          <span className={styles.availSep}>:</span>
          <span className={styles.availValue}>Available · Q3 start</span>
        </span>
        <span className={styles.ghost}>Remote · UTC-5</span>
        <span className={styles.sep}>·</span>
        <span className={styles.ghost}>Staff / Principal IC</span>
      </div>
      <h1 className={styles.headline}>
        I build the test infrastructure that keeps{' '}
        <em>AI products</em> honest in production.
      </h1>
      <p className={styles.pitch}>
        Nine years writing self-healing test frameworks, LLM evals, and the
        observability that catches regressions before they ship. Currently{' '}
        <strong>Staff SDET on the AI Platform team at Lumen Systems</strong> —
        open to staff or principal roles where automation, AI, and product
        quality intersect.
      </p>
      <div className={styles.ctas}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={(e) => {
            e.preventDefault();
            window.print();
          }}
        >
          <span>Download PDF</span>
          <span>↓</span>
        </button>
        <a className={styles.btnSecondary} href="mailto:alex@morgan.dev">
          <span>alex@morgan.dev</span>
          <span>→</span>
        </a>
      </div>
    </section>
  );
}
