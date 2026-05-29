'use client';

import styles from './recruiter.module.css';

export function ContactSection() {
  return (
    <section className={styles.contactSection} aria-label="Get in touch">
      <div className={styles.contactPre}>Get in touch</div>
      <p className={styles.contactLine}>
        The fastest way to reach me is{' '}
        <a href="mailto:ruslankanat.b@gmail.com">ruslankanat.b@gmail.com</a>. I reply within a day.
      </p>
      <div className={styles.contactGrid}>
        <div className={styles.contactItem}>
          <div className={styles.contactItemLabel}>Email</div>
          <a className={styles.contactItemValue} href="mailto:ruslankanat.b@gmail.com">
            ruslankanat.b@gmail.com
          </a>
        </div>
        <div className={styles.contactItem}>
          <div className={styles.contactItemLabel}>GitHub</div>
          <a
            className={styles.contactItemValue}
            href="https://github.com/ruslankanat-sdet"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/ruslankanat-sdet
          </a>
        </div>
        <div className={styles.contactItem}>
          <div className={styles.contactItemLabel}>LinkedIn</div>
          <a
            className={styles.contactItemValue}
            href="https://linkedin.com/in/ruslan-kanatbek"
            target="_blank"
            rel="noopener noreferrer"
          >
            in/ruslan-kanatbek
          </a>
        </div>
      </div>
    </section>
  );
}
