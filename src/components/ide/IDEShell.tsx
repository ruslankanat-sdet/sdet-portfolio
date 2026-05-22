"use client";

import { useState, useEffect, useCallback } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { EditorArea } from './EditorArea';
import { Terminal } from './Terminal';
import { StatusBar } from './StatusBar';
import { SAMPLE_LOGS } from '@/lib/files-data';
import type { LogEntry, Theme, TerminalTab } from '@/types/ide';
import styles from './IDEShell.module.css';

export function IDEShell() {
  const [activeFile, setActiveFile] = useState<string>("README.md");
  const [tabs, setTabs] = useState<string[]>(["README.md"]);
  const [termHeight, setTermHeight] = useState<number>(220);
  const [termTab, setTermTab] = useState<TerminalTab>("TERMINAL");
  const [running, setRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>(SAMPLE_LOGS.slice(0, 8));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastRun, setLastRun] = useState<string>("3m ago"); // future: pass to TopBar for "last run" display
  // On narrow viewports, sidebar starts closed (overlay mode). On wide, starts open.
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth > 768;
  });
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (localStorage.getItem("portfolio-theme") as Theme) || "dark"; }
    catch { return "dark"; }
  });

  // Theme sync effect
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("portfolio-theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(t => t === "dark" ? "light" : "dark"), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(o => !o), []);

  const openTab = useCallback((name: string) => {
    setTabs(t => t.includes(name) ? t : [...t, name]);
  }, []);

  const closeTab = useCallback((name: string) => {
    setTabs(t => {
      const next = t.filter(x => x !== name);
      if (activeFile === name && next.length) setActiveFile(next[next.length - 1]);
      return next;
    });
  }, [activeFile]);

  const runSmoke = useCallback(() => {
    if (running) return;
    setRunning(true);
    setLogs([]);
    setTermTab("TERMINAL");
    let i = 0;
    const tick = () => {
      if (i >= SAMPLE_LOGS.length) {
        setRunning(false);
        setLastRun("just now");
        return;
      }
      setLogs(prev => [...prev, SAMPLE_LOGS[i]]);
      i++;
      setTimeout(tick, 280 + Math.random() * 260);
    };
    setTimeout(tick, 300);
  }, [running]);

  // Keyboard shortcut: ⌘↵ / Ctrl+↵
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runSmoke();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runSmoke]);

  return (
    <>
      <TopBar onRun={runSmoke} running={running} theme={theme} toggleTheme={toggleTheme} onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <div className={styles.ideBody}>
        <Sidebar activeFile={activeFile} setActiveFile={setActiveFile} openTab={openTab} sidebarOpen={sidebarOpen} />
        <div className={styles.main} role="region" aria-label="Editor and terminal">
          <EditorArea tabs={tabs} activeFile={activeFile} setActiveFile={setActiveFile} closeTab={closeTab} />
          <Terminal logs={logs} running={running} height={termHeight} setHeight={setTermHeight} tab={termTab} setTab={setTermTab} />
        </div>
      </div>
      <StatusBar activeFile={activeFile} running={running} />
    </>
  );
}
