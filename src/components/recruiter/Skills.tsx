'use client';

import styles from './recruiter.module.css';

const SKILL_GROUPS = [
  {
    cat: 'Automation',
    items: ['Playwright', 'Cypress', 'Pytest', 'Appium', 'k6', 'Pact'],
  },
  {
    cat: 'AI / ML',
    items: ['LangGraph', 'LangChain', 'LlamaIndex', 'RAG', 'Evals', 'Braintrust', 'Qdrant'],
  },
  {
    cat: 'Infra',
    items: ['GitHub Actions', 'ArgoCD', 'Kubernetes', 'Terraform', 'Pulumi', 'AWS', 'GCP'],
  },
  {
    cat: 'Languages',
    items: ['Python', 'TypeScript', 'Go', 'Rust'],
  },
] as const;

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
