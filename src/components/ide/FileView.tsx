"use client";

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { tokenize } from '@/lib/syntax-highlighter';
import type { FileEntry } from '@/types/ide';
import styles from './FileView.module.css';

interface FileViewProps {
  file: FileEntry;
}

// Decorative minimap bars — generated once per render
// Per design handoff README: "purely decorative — ~140 random-colored bars"
const MINIMAP_BARS = Array.from({ length: 140 }, (_, i) => i);

export function FileView({ file }: FileViewProps) {
  const tokens = useMemo(() => tokenize(file.content, file.lang), [file.content, file.lang]);
  const lines = file.content.split('\n');

  return (
    <div className={styles.editorInner}>
      {/* Gutter — line numbers */}
      <div className={styles.gutter}>
        {lines.map((_, i) => (
          <div key={i} className={cn(styles.ln, { [styles.active]: i === 0 })}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code area — tokenize() returns ReactNode[], safe (no dangerouslySetInnerHTML) */}
      <pre className={cn(styles.code, styles[`lang-${file.lang}`])}>
        <code>{tokens}</code>
      </pre>

      {/* Decorative minimap */}
      <div className={styles.minimap} aria-hidden="true">
        {MINIMAP_BARS.map(i => (
          <div key={i} className={styles.mmRow} />
        ))}
      </div>
    </div>
  );
}
