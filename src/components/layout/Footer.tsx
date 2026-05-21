import { Mail, ExternalLink } from 'lucide-react';
import styles from './Footer.module.css';

interface FooterProps {
  variant: 'compact' | 'full';
}

export function Footer({ variant }: FooterProps) {
  if (variant === 'compact') {
    return (
      <footer className={styles.compact} role="contentinfo">
        <a
          href="mailto:ruslankanat.b@gmail.com"
          className={styles.compactLink}
          aria-label="Email Ruslan Kanatbek"
        >
          <Mail size={14} aria-hidden="true" />
          ruslankanat.b@gmail.com
        </a>
        <a
          href="https://github.com/ruslankanat"
          className={styles.compactLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub profile (opens in new tab)"
        >
          <ExternalLink size={14} aria-hidden="true" />
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/ruslankanat"
          className={styles.compactLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn profile (opens in new tab)"
        >
          <ExternalLink size={14} aria-hidden="true" />
          LinkedIn
        </a>
        <span className={styles.noTracking}>No cookies. No tracking.</span>
      </footer>
    );
  }

  return (
    <footer className={styles.full} role="contentinfo">
      <div className={styles.fullGrid}>
        <div>
          <p className={styles.fullLabel}>Email</p>
          <a
            href="mailto:ruslankanat.b@gmail.com"
            className={styles.fullLink}
          >
            ruslankanat.b@gmail.com
          </a>
        </div>
        <div>
          <p className={styles.fullLabel}>Connect</p>
          <a
            href="https://github.com/ruslankanat"
            className={styles.fullLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub<span className="sr-only"> (opens in new tab)</span>
          </a>
          <a
            href="https://linkedin.com/in/ruslankanat"
            className={styles.fullLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn<span className="sr-only"> (opens in new tab)</span>
          </a>
        </div>
        <div>
          <p className={styles.fullLabel}>Privacy</p>
          <p className={styles.privacyNote}>
            This site uses no cookies, collects no personal data, and has no
            third-party trackers.
          </p>
        </div>
      </div>
      <p className={styles.copyright}>© 2024 Ruslan Kanatbek</p>
    </footer>
  );
}
