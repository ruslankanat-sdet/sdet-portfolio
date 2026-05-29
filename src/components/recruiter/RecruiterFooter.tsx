'use client';

import styles from './recruiter.module.css';

interface RecruiterFooterProps {
  onSwitchToIDE: () => void;
}

export function RecruiterFooter({ onSwitchToIDE }: RecruiterFooterProps) {
  return (
    <footer className={styles.footer}>
      <span className={styles.footerCopy}>© 2026 Alex Morgan</span>
      <button type="button" className={styles.footerSwitch} onClick={onSwitchToIDE}>
        Prefer the engineer view? Open the IDE →
      </button>
    </footer>
  );
}
