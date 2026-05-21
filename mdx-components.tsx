import type { MDXComponents } from 'mdx/types';
import styles from './src/app/about/about.module.css';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: ({ children }) => <h1 className={styles.proseH1}>{children}</h1>,
    h2: ({ children }) => <h2 className={styles.proseH2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.proseH3}>{children}</h3>,
    p: ({ children }) => <p className={styles.proseP}>{children}</p>,
    ul: ({ children }) => <ul className={styles.proseUl}>{children}</ul>,
    code: ({ children }) => <code className={styles.proseCode}>{children}</code>,
    hr: () => <hr className={styles.proseHr} />,
    a: ({ href, children }) => (
      <a href={href} className={styles.proseA}>
        {children}
      </a>
    ),
  };
}
