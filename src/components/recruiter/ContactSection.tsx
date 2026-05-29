'use client';

import styles from './recruiter.module.css';

export function ContactSection() {
  return (
    <section className={styles.contactSection}>
      <div className={styles.contactPre}>Get in touch</div>
      <p className={styles.contactLine}>
        The fastest way to reach me is{' '}
        <a href="mailto:alex@morgan.dev">alex@morgan.dev</a>. I reply within a day.
      </p>
      <div className={styles.contactGrid}>
        <div className={styles.contactItem}>
          <div className={styles.contactItemLabel}>Email</div>
          <a className={styles.contactItemValue} href="mailto:alex@morgan.dev">
            alex@morgan.dev
          </a>
        </div>
        <div className={styles.contactItem}>
          <div className={styles.contactItemLabel}>GitHub</div>
          <a
            className={styles.contactItemValue}
            href="https://github.com/amorgan"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/amorgan
          </a>
        </div>
        <div className={styles.contactItem}>
          <div className={styles.contactItemLabel}>LinkedIn</div>
          <a
            className={styles.contactItemValue}
            href="https://linkedin.com/in/amorgan-sdet"
            target="_blank"
            rel="noopener noreferrer"
          >
            in/amorgan-sdet
          </a>
        </div>
      </div>
    </section>
  );
}
