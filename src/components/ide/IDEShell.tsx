"use client";

import { useState, useEffect, useCallback } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { EditorArea } from './EditorArea';
import { Terminal } from './Terminal';
import { StatusBar } from './StatusBar';
import { SAMPLE_LOGS } from '@/lib/files-data';
import type { LogEntry, LogKind, Theme, TerminalTab } from '@/types/ide';
import styles from './IDEShell.module.css';

interface GitHubStep {
  name: string;
  status: string;
  conclusion: string | null;
  number: number;
}

interface GitHubJob {
  name: string;
  status: string;
  conclusion: string | null;
  steps?: GitHubStep[];
}

interface GitHubJobsPayload {
  jobs?: GitHubJob[];
}

function buildLogEntries(data: GitHubJobsPayload): LogEntry[] {
  const entries: LogEntry[] = [
    { kind: 'info', text: 'Run dispatched - polling status' },
  ];

  const jobs = data.jobs ?? [];

  for (const job of jobs) {
    if (job.status === 'completed' && job.conclusion === 'success') {
      entries.push({ kind: 'pass', test: job.name, detail: 'completed' });
    } else if (job.status === 'completed' && job.conclusion === 'failure') {
      entries.push({ kind: 'fail', test: job.name, detail: 'failed' });
    } else if (job.status === 'completed' && job.conclusion === 'cancelled') {
      entries.push({ kind: 'warn', text: `Job cancelled - ${job.name}` });
    } else if (job.status === 'in_progress') {
      entries.push({ kind: 'info', text: `> Running: ${job.name}` });
    } else if (job.status === 'queued') {
      entries.push({ kind: 'info', text: `[queued] ${job.name}` });
    }

    // Append failed steps for completed jobs to surface what broke
    if (job.status === 'completed' && job.steps) {
      for (const step of job.steps) {
        if (step.status === 'completed' && step.conclusion === 'failure') {
          entries.push({ kind: 'fail', test: step.name, detail: 'failed' });
        }
      }
    }
  }

  // Summary row once all jobs are done
  const allComplete = jobs.length > 0 && jobs.every(j => j.status === 'completed');
  if (allComplete) {
    const passed = jobs.filter(j => j.conclusion === 'success').length;
    const failed = jobs.filter(j => j.conclusion !== 'success').length;
    const total = jobs.length;
    const summaryKind: LogKind = failed === 0 ? 'ok' : 'fail';
    entries.push({
      kind: summaryKind,
      text: `Summary: ${passed} passed, ${failed} failed, ${total} total`,
    });
  }

  return entries;
}

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

  const runSmoke = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setLogs([{ kind: 'info', text: 'Triggering CI run' }]);
    setTermTab("TERMINAL");

    try {
      const dispatchRes = await fetch('/api/run-tests', { method: 'POST' });
      const dispatchData: { runId?: number | null; url?: string | null; error?: string } = await dispatchRes.json();

      if (!dispatchRes.ok || dispatchData.error) {
        if (dispatchRes.status === 503) {
          setLogs([{
            kind: 'warn',
            text: 'CI trigger not configured - set GITHUB_TOKEN in Vercel env vars',
          }]);
        } else {
          setLogs([{
            kind: 'fail',
            text: `Dispatch failed (${dispatchRes.status})`,
          }]);
        }
        setRunning(false);
        return;
      }

      const { runId, url } = dispatchData;

      if (!runId) {
        setLogs([{ kind: 'warn', text: 'Run dispatched — check GitHub Actions tab for status' }]);
        setRunning(false);
        return;
      }

      setLogs([
        { kind: 'info', text: `Run dispatched - GitHub Actions run ${runId} queued` },
        { kind: 'info', text: `View run: ${url}` },
      ]);

      // Recursive setTimeout polling — avoids setInterval overlap on slow responses (D-09: 5s interval)
      const poll = async () => {
        try {
          const statusRes = await fetch(`/api/run-status/${runId}`);
          const statusData: GitHubJobsPayload = await statusRes.json();

          setLogs(buildLogEntries(statusData));

          const jobs = statusData.jobs ?? [];
          const allComplete = jobs.length > 0 && jobs.every(j => j.status === 'completed');

          if (allComplete) {
            setRunning(false);
            setLastRun('just now');
          } else {
            setTimeout(poll, 5000);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          setLogs(prev => [...prev, { kind: 'fail', text: `Polling failed: ${message}` }]);
          setRunning(false);
        }
      };

      // First poll after 5 seconds — give Actions time to register the run
      setTimeout(poll, 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setLogs([{ kind: 'fail', text: `Dispatch failed: ${message}` }]);
      setRunning(false);
    }
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
