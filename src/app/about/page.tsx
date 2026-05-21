import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import Resume from '@/content/resume.mdx';
import { Footer } from '@/components/layout/Footer';
import styles from './about.module.css';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'About — Ruslan Kanatbek',
  description:
    'Senior SDET / QA Automation Engineer. Work history, projects, skills, and contact information for Ruslan Kanatbek.',
};

export default function AboutPage() {
  return (
    <div className={styles.scrollContainer}>
      <div className={styles.pageWrapper}>
        <a
          href="/resume.pdf"
          download="Ruslan-Kanatbek-Resume.pdf"
          className={styles.downloadBtn}
          aria-label="Download PDF resume"
        >
          <Download size={16} aria-hidden="true" />
          Download PDF Resume
        </a>
        <Resume />
      </div>
      <Footer variant="full" />
    </div>
  );
}
