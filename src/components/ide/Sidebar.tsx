"use client";

import { useState } from 'react';
import {
  ChevronRight,
  Folder,
  FileJson2,
  FileCode2,
  FileText,
  Search,
  GitBranch,
  Play,
  Settings,
  User,
  Boxes,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FILES } from '@/lib/files-data';
import type { FileEntry } from '@/types/ide';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activeFile: string;
  setActiveFile: (name: string) => void;
  openTab: (name: string) => void;
  sidebarOpen?: boolean;
}

const ICONS_FOR_FILE: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  json: FileJson2,
  py: FileCode2,
  md: FileText,
  yaml: FileText,
  toml: FileText,
  ts: FileCode2,
};

// File tree structure per D-05 (no tools/ folder in v1)
const ABOUT_FILES = ['bio.json', 'experience.yaml', 'skills.yaml'];
const ROOT_FILES = ['README.md', 'contact.json'];
const TEST_FILES = [
  'tests/landing.spec.ts',
  'tests/navigation.spec.ts',
  'tests/about.spec.ts',
  'tests/ide-interactions.spec.ts',
  'tests/playwright.config.ts',
];

// Outline symbols derived from active file (decorative in Phase 1)
const OUTLINE_SYMBOLS: Record<string, Array<{ label: string; kind: 'key' | 'str' | 'num' }>> = {
  'README.md':       [{ label: 'Introduction', kind: 'key' }, { label: 'What this site is', kind: 'key' }],
  'bio.json':        [{ label: '"engineer"', kind: 'key' }, { label: '"expertise"', kind: 'key' }, { label: '"contact"', kind: 'key' }],
  'experience.yaml': [{ label: 'Resmed', kind: 'str' }, { label: 'Gemini', kind: 'str' }, { label: 'Google', kind: 'str' }, { label: 'Citi', kind: 'str' }],
  'skills.yaml':     [{ label: 'languages', kind: 'key' }, { label: 'testing', kind: 'key' }, { label: 'ai_automation', kind: 'key' }],
  'contact.json':    [{ label: '"email"', kind: 'key' }, { label: '"github"', kind: 'key' }, { label: '"linkedin"', kind: 'key' }],
  'tests/landing.spec.ts':          [{ label: 'has correct page title', kind: 'key' }, { label: 'has no WCAG AA violations', kind: 'key' }],
  'tests/navigation.spec.ts':       [{ label: 'About link navigates to /about', kind: 'key' }],
  'tests/about.spec.ts':            [{ label: 'renders work history section', kind: 'key' }, { label: 'has no WCAG AA violations', kind: 'key' }],
  'tests/ide-interactions.spec.ts': [{ label: 'clicking bio.json loads editor', kind: 'key' }, { label: 'test files appear in sidebar', kind: 'key' }],
  'tests/playwright.config.ts':     [{ label: 'testDir', kind: 'key' }, { label: 'projects', kind: 'key' }, { label: 'webServer', kind: 'key' }],
};

export function Sidebar({ activeFile, setActiveFile, openTab, sidebarOpen = true }: SidebarProps) {
  const [open, setOpen] = useState({ about: false, tests: false });
  const [activePanel] = useState<'explorer'>('explorer');

  const fileRow = (name: string) => {
    const f = FILES[name] as FileEntry | undefined;
    if (!f) return null;
    const FileIcon = ICONS_FOR_FILE[f.icon] ?? FileText;
    const isActive = activeFile === name;
    return (
      <div
        key={name}
        className={cn(styles.treeRow, { [styles.active]: isActive })}
        onClick={() => { setActiveFile(name); openTab(name); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveFile(name); openTab(name); } }}
      >
        <span className={styles.treeIndent} />
        <FileIcon size={14} />
        <span className={styles.treeLabel}>{name}</span>
      </div>
    );
  };

  const symbols = OUTLINE_SYMBOLS[activeFile] ?? [];

  return (
    <aside className={cn(styles.sidebar, { [styles.sidebarClosed]: !sidebarOpen })} aria-hidden={!sidebarOpen}>
      {/* Activity Bar */}
      <nav className={styles.activityBar} aria-label="Activity bar">
        <div className={styles.actBtnGroup}>
          <button
            className={cn(styles.actBtn, { [styles.active]: activePanel === 'explorer' })}
            aria-label="Explorer"
            title="Explorer"
          >
            <Folder size={20} />
          </button>
          <button
            className={styles.actBtn}
            aria-label="Search"
            title="Search"
          >
            <Search size={20} />
          </button>
          <button
            className={styles.actBtn}
            aria-label="Source Control"
            title="Source Control"
          >
            <GitBranch size={20} />
          </button>
          <button
            className={styles.actBtn}
            aria-label="Run and Debug"
            title="Run and Debug"
          >
            <Play size={20} />
          </button>
          <button
            className={styles.actBtn}
            aria-label="Extensions"
            title="Extensions"
          >
            <Boxes size={20} />
          </button>
        </div>
        <div className={styles.actBtnGroupBottom}>
          <button
            className={styles.actBtn}
            aria-label="Profile"
            title="Profile"
          >
            <User size={20} />
          </button>
          <button
            className={styles.actBtn}
            aria-label="Settings"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </nav>

      {/* Explorer Panel */}
      <div className={styles.explorer}>
        <div className={styles.explorerHeader}>
          <span>EXPLORER</span>
          <span className={styles.explorerMeta}>ruslankanat/portfolio</span>
        </div>

        <div className={styles.tree}>
          {/* about/ folder */}
          <div className={styles.treeGroup}>
            <div
              className={styles.treeFolder}
              onClick={() => setOpen(s => ({ ...s, about: !s.about }))}
            >
              <span className={styles.treeChev}>
                <ChevronRight
                  size={10}
                  style={{ transform: open.about ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
                />
              </span>
              <Folder size={14} />
              <span className={cn(styles.treeLabel, styles.bold)}>about</span>
            </div>
            {open.about && (
              <div className={styles.treeChildren}>
                {ABOUT_FILES.map(name => fileRow(name))}
              </div>
            )}
          </div>

          {/* tests/ folder */}
          <div className={styles.treeGroup}>
            <div
              className={styles.treeFolder}
              onClick={() => setOpen(s => ({ ...s, tests: !s.tests }))}
            >
              <span className={styles.treeChev}>
                <ChevronRight
                  size={10}
                  style={{ transform: open.tests ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
                />
              </span>
              <Folder size={14} />
              <span className={cn(styles.treeLabel, styles.bold)}>tests</span>
            </div>
            {open.tests && (
              <div className={styles.treeChildren}>
                {TEST_FILES.map(name => fileRow(name))}
              </div>
            )}
          </div>

          {/* Root-level files */}
          <div className={styles.treeGroup}>
            {ROOT_FILES.map(name => fileRow(name))}
          </div>
        </div>

        {/* Outline panel (decorative) */}
        {symbols.length > 0 && (
          <div className={styles.outline}>
            <div className={styles.outlineHeader}>OUTLINE</div>
            {symbols.map((sym, i) => (
              <div key={i} className={styles.outlineRow}>
                <span className={cn(styles.outDot, styles[sym.kind])} />
                <span>{sym.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
