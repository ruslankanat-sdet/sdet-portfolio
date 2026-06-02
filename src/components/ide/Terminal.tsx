"use client";

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { LogEntry, TerminalTab } from '@/types/ide';
import styles from './Terminal.module.css';

interface TerminalProps {
  logs: LogEntry[];
  running: boolean;
  height: number;
  setHeight: (h: number) => void;
  tab: TerminalTab;
  setTab: (t: TerminalTab) => void;
}

function LogRow({ log }: { log: LogEntry }) {
  if (log.kind === 'info') {
    return <div className={cn(styles.log, styles.logInfo)}>{log.text}</div>;
  }
  if (log.kind === 'warn') {
    return <div className={cn(styles.log, styles.logWarn)}>{log.text}</div>;
  }
  if (log.kind === 'ok') {
    return <div className={cn(styles.log, styles.logOk)}>{log.text}</div>;
  }
  if (log.kind === 'fail') {
    return (
      <div className={cn(styles.log, styles.logFail)}>
        <span className={cn(styles.logTag, styles.fail)}>[FAIL]</span>
        <span className={styles.logTest}> {log.test}</span>
        {log.detail && <span className={styles.logDetail}>  {log.detail}</span>}
      </div>
    );
  }
  if (log.kind === 'link') {
    return (
      <div className={cn(styles.log, styles.logOk)}>
        <a
          href={log.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.logLink}
        >
          {log.text}
        </a>
      </div>
    );
  }
  // pass
  return (
    <div className={cn(styles.log, styles.logPass)}>
      <span className={cn(styles.logTag, styles.pass)}>[PASS]</span>
      <span className={styles.logTest}> {log.test}</span>
      {log.detail && <span className={styles.logDetail}>  {log.detail}</span>}
    </div>
  );
}

const TERM_TABS: TerminalTab[] = ['TERMINAL'];

export function Terminal({ logs, running, height, setHeight, tab, setTab }: TerminalProps) {
  const termBodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new log entries
  useEffect(() => {
    if (termBodyRef.current) {
      termBodyRef.current.scrollTop = termBodyRef.current.scrollHeight;
    }
  }, [logs]);

  // Drag-to-resize
  const onDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = height;
    const move = (ev: MouseEvent) => {
      setHeight(Math.max(120, Math.min(500, startH - (ev.clientY - startY))));
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div className={styles.terminal} style={{ height: `${height}px` }}>
      {/* Drag handle */}
      <div className={styles.termResizer} onMouseDown={onDrag} />

      {/* Tab strip */}
      <div className={styles.termTabs}>
        {TERM_TABS.map(t => (
          <div
            key={t}
            className={cn(styles.termTab, { [styles.active]: tab === t })}
            onClick={() => setTab(t)}
            role="button"
            tabIndex={0}
            aria-pressed={tab === t}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTab(t); } }}
          >
            {t}
            <span aria-hidden="true"> · </span>
            <span className={styles.paneSubtitle}>Test output</span>
            {running && <span className={styles.termTabDot} />}
          </div>
        ))}
        <div className={styles.termSpacer} />
        <div className={styles.termMeta}>playwright</div>
      </div>

      {/* Terminal body */}
      <div
        className={styles.termBody}
        ref={termBodyRef}
        aria-live="polite"
        aria-label="Test output log"
      >
        {logs.map((log, i) => (
          <LogRow key={i} log={log} />
        ))}
        {/* Terminal prompt: ruslan@portfolio ❯ */}
        {running && (
          <div className={styles.termCursor} aria-label="ruslan@portfolio ❯">
            <span className={styles.termPrompt}>ruslan</span>
            <span className={styles.termPromptSep}>@</span>
            <span className={styles.termPromptHost}>portfolio</span>
            <span className={styles.termPromptArrow}>❯</span>
            <span className={styles.blink}>▌</span>
          </div>
        )}
      </div>
    </div>
  );
}
