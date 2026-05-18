"use client";

import { useState, useEffect } from 'react';
import { GitBranch, Play, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types/ide';
import styles from './TopBar.module.css';

interface TopBarProps {
  onRun: () => void;
  running: boolean;
  theme: Theme;
  toggleTheme: () => void;
}

interface StatusBadgeProps {
  tone: 'green' | 'blue';
  label: string;
  value: string;
  pulse?: boolean;
  hideClass?: string;
}

function StatusBadge({ tone, label, value, pulse, hideClass }: StatusBadgeProps) {
  return (
    <div className={cn(styles.badge, styles[`tone${tone.charAt(0).toUpperCase() + tone.slice(1)}`], hideClass ? styles[hideClass] : undefined)}>
      <span className={cn(styles.badgeDot, pulse ? styles.pulse : undefined)} />
      <span className={styles.badgeLabel}>{label}</span>
      <span className={styles.badgeSep}>·</span>
      <span className={styles.badgeValue}>{value}</span>
    </div>
  );
}

export function TopBar({ onRun, running, theme, toggleTheme }: TopBarProps) {
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarL}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 9L6 5L8 7L12 3M12 3H15M12 3V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="14" cy="13" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div className={styles.logoText}>
            <div className={styles.logoName}>ruslan.kanatbek</div>
            <div className={styles.logoSub}>SDET · AI Automation</div>
          </div>
        </div>

        <div className={styles.tabDivider} />

        <div className={styles.branch}>
          <GitBranch size={12} />
          <span>main</span>
          <span className={styles.branchMeta}>· up to date</span>
        </div>
      </div>

      <div className={cn(styles.statusRail)} role="status">
        <StatusBadge tone="green" label="CI" value="Passing" pulse hideClass="badgeRail1" />
        <StatusBadge tone="green" label="Coverage" value="98%" hideClass="badgeRail2" />
        <StatusBadge tone="blue" label="Tests" value="312" hideClass="badgeRail3" />
      </div>

      <div className={styles.topbarR}>
        <div className={styles.clock}>
          <span className={styles.clockDot} />
          <span>{time}</span>
          <span className={styles.clockTz}>UTC+5</span>
        </div>

        <button
          className={styles.iconBtn}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <button
          className={cn(styles.runBtn, { [styles.running]: running })}
          onClick={onRun}
          disabled={running}
          aria-label={running ? "Running smoke test" : "Run smoke test"}
        >
          <span className={styles.runGlow} />
          <span className={styles.runIcon}><Play size={11} /></span>
          <span className={styles.runLabel}>{running ? "Running…" : "Run Smoke Test"}</span>
          {!running && <span className={styles.runShortcut}>⌘↵</span>}
        </button>
      </div>
    </header>
  );
}
