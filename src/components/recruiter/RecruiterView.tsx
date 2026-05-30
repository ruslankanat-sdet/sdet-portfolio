'use client';

import styles from './recruiter.module.css';
import { HERO_COPY } from '@/lib/resume-content';
import { Masthead } from './Masthead';
import { Hero } from './Hero';
import { Metrics } from './Metrics';
import { Timeline } from './Timeline';
import { Skills } from './Skills';
import { AvailabilityCard } from './AvailabilityCard';
import { ContactSection } from './ContactSection';
import { RecruiterFooter } from './RecruiterFooter';

interface RecruiterViewProps {
  onSwitchToIDE: () => void;
}

export function RecruiterView({ onSwitchToIDE }: RecruiterViewProps) {
  return (
    <div className={styles.recruiterScrollRoot}>
      <article className={styles.recruiter}>
        <Masthead onSwitchToIDE={onSwitchToIDE} />
        <Hero />

        {/* §01 By the numbers */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum}>§01</span>
            <span className={styles.sectionTitle}>By the numbers</span>
            <span className={styles.sectionRule} aria-hidden="true" />
          </div>
          <Metrics />
        </section>

        {/* §02 What I'm doing now */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum}>§02</span>
            <span className={styles.sectionTitle}>What I&apos;m doing now</span>
            <span className={styles.sectionRule} aria-hidden="true" />
          </div>
          <p className={styles.now}>
            {HERO_COPY.nowLede}
          </p>
        </section>

        {/* §03 Experience */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum}>§03</span>
            <span className={styles.sectionTitle}>Experience</span>
            <span className={styles.sectionRule} aria-hidden="true" />
          </div>
          <Timeline />
        </section>

        {/* §04 Stack */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum}>§04</span>
            <span className={styles.sectionTitle}>Stack</span>
            <span className={styles.sectionRule} aria-hidden="true" />
          </div>
          <Skills />
        </section>

        {/* §05 What I'm looking for */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum}>§05</span>
            <span className={styles.sectionTitle}>What I&apos;m looking for</span>
            <span className={styles.sectionRule} aria-hidden="true" />
          </div>
          <AvailabilityCard />
        </section>

        <ContactSection />
        <RecruiterFooter onSwitchToIDE={onSwitchToIDE} />
      </article>
    </div>
  );
}
