"use client";

import { useState, useEffect } from 'react';
import { GitBranch, Play, Sun, Moon, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types/ide';
import styles from './TopBar.module.css';

interface TopBarProps {
  onRun: () => void;
  running: boolean;
  theme: Theme;
  toggleTheme: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onSwitchToRecruiter?: () => void;
}

interface StatusBadgeProps {
  tone: 'green' | 'blue' | 'red';
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

export function TopBar({ onRun, running, theme, toggleTheme, onToggleSidebar, sidebarOpen, onSwitchToRecruiter }: TopBarProps) {
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

  // Fallback: keep "Passing" / green as the loading and error state (D-02)
  const [ciPassing, setCiPassing] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/ci-status')
      .then((r) => r.json())
      .then((data: { passing: boolean }) => {
        setCiPassing(data.passing);
      })
      .catch(() => {
        // silently keep the green fallback (D-02)
      });
  }, []); // fire once on mount, no polling (D-01)

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarL}>
        {/* Hamburger — visible only on narrow viewports (SHELL-05) */}
        <button
          className={cn(styles.iconBtn, styles.menuBtn)}
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={sidebarOpen}
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu size={16} />
        </button>

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
        <StatusBadge
          tone={ciPassing ? 'green' : 'red'}
          label="CI"
          value={ciPassing ? 'Passing' : 'Failing'}
          pulse={ciPassing}
          hideClass="badgeRail1"
        />
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

        {onSwitchToRecruiter && (
          <button
            type="button"
            className={styles.viewSwitchBtn}
            onClick={onSwitchToRecruiter}
            aria-label="Switch to recruiter view"
          >
            <span>Recruiter view</span>
            <span className={styles.switchArrow}>↗</span>
          </button>
        )}

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
