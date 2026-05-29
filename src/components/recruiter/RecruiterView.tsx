'use client';

import styles from './recruiter.module.css';
import { Masthead } from './Masthead';
import { Hero } from './Hero';

interface RecruiterViewProps {
  onSwitchToIDE: () => void;
}

export function RecruiterView({ onSwitchToIDE }: RecruiterViewProps) {
  return (
    <div className={styles.recruiterScrollRoot}>
      <article className={styles.recruiter}>
        <Masthead onSwitchToIDE={onSwitchToIDE} />
        <Hero />
        {/* Sections, contact, footer added in Plan 02 */}
      </article>
    </div>
  );
}
