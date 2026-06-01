'use client';

import styles from './recruiter.module.css';
import { LogoMark } from '../door/LogoMark';

interface MastheadProps {
  onSwitchToIDE: () => void;
}

export function Masthead({ onSwitchToIDE }: MastheadProps) {
  return (
    <header className={styles.masthead}>
      <div className={styles.mastheadL}>
        <span className={styles.mastheadLogo}>
          <LogoMark size={16} />
        </span>
        <span className={styles.mastheadWordmark}>ruslan.kanatbek</span>
        <span className={styles.mastheadSep}>/</span>
        <span className={styles.mastheadSection}>résumé</span>
      </div>
      <button
        type="button"
        className={styles.mastheadSwitch}
        onClick={onSwitchToIDE}
        aria-label="Switch to engineer / IDE view"
      >
        <span aria-hidden="true">Engineer view</span>
        <span className={styles.arrow} aria-hidden="true">↗</span>
      </button>
    </header>
  );
}
