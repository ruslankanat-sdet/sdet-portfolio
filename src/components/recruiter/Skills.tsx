'use client';

import styles from './recruiter.module.css';
import { SKILL_GROUPS } from '@/lib/resume-content';

export function Skills() {
  return (
    <div className={styles.skillsList}>
      {SKILL_GROUPS.map((group) => (
        <div key={group.cat} className={styles.skillGroup}>
          <div className={styles.skillCat}>{group.cat}</div>
          <div className={styles.skillPills}>
            {group.items.map((item) => (
              <span key={item} className={styles.skillPill}>
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
