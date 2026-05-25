import { NavLink } from './NavLink';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  return (
    <header className={styles.header} role="banner">
      <div className={styles.identity}>
        <span className={styles.name}>Ruslan Kanatbek</span>
        <span className={styles.separator} aria-hidden="true">·</span>
        <span className={styles.title}>Senior SDET / QA Automation Engineer</span>
      </div>
      <nav className={styles.mainNav} aria-label="Main navigation">
        <NavLink />
      </nav>
    </header>
  );
}
