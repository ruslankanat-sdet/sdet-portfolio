"use client";

import { GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FILES } from '@/lib/files-data';
import styles from './StatusBar.module.css';

interface StatusBarProps {
  activeFile: string;
  running: boolean;
}

export function StatusBar({ activeFile, running }: StatusBarProps) {
  const f = FILES[activeFile];
  const lines = f ? f.content.split('\n').length : 0;
  const lang = f ? f.lang.toUpperCase() : '';

  return (
    <footer className={styles.statusbar}>
      <div className={styles.sbL}>
        <div className={cn(styles.sbItem, styles.green)}>
          <GitBranch size={11} />
          <span>main</span>
        </div>
        <div className={styles.sbItem}>
          {running ? '● running' : '✓ ready'}
        </div>
      </div>
      <div className={styles.sbR}>
        {f && (
          <>
            <div className={styles.sbItem}>Ln 1, Col 1</div>
            <div className={cn(styles.sbItem, styles.lang)}>{lang}</div>
            <div className={styles.sbItem}>{lines} lines</div>
          </>
        )}
        {/* D-15: always visible, never truncated, never conditional */}
        <div className={cn(styles.sbItem, styles.hireCta)}>● Available for hire</div>
      </div>
    </footer>
  );
}
