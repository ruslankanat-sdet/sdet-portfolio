'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SiteHeader.module.css';

export function NavLink() {
  const pathname = usePathname();
  const isAbout = pathname === '/about';

  return (
    <Link
      href={isAbout ? '/' : '/about'}
      className={styles.navLink}
      aria-current={isAbout ? 'page' : undefined}
    >
      {isAbout ? '← Back' : 'About / Resume'}
    </Link>
  );
}
