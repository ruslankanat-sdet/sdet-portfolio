"use client";

import {
  FileJson2,
  FileCode2,
  FileText,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FILES } from '@/lib/files-data';
import { FileView } from './FileView';
import { TestAutomatorPane } from '@/components/tools/TestAutomatorPane';
import styles from './EditorArea.module.css';

interface EditorAreaProps {
  tabs: string[];
  activeFile: string;
  setActiveFile: (name: string) => void;
  closeTab: (name: string) => void;
}

const ICONS_FOR_FILE: Record<string, React.ComponentType<{ size?: number }>> = {
  json: FileJson2,
  py: FileCode2,
  md: FileText,
  yaml: FileText,
  toml: FileText,
  ts: FileCode2,
};

// Tool IDs that render the TestAutomatorPane instead of a file
const TOOL_IDS = new Set(['test-automator']);

function getBreadcrumb(activeFile: string): string {
  const f = FILES[activeFile];
  if (!f) {
    if (TOOL_IDS.has(activeFile)) return `ruslankanat › tools › ${activeFile}`;
    return `ruslankanat › ${activeFile}`;
  }
  // path is like ~/portfolio/about/bio.json or ~/portfolio/README.md
  const parts = f.path.replace('~/portfolio/', '').split('/');
  if (parts.length > 1) {
    return `ruslankanat › ${parts.join(' › ')}`;
  }
  return `ruslankanat › ${activeFile}`;
}

export function EditorArea({ tabs, activeFile, setActiveFile, closeTab }: EditorAreaProps) {
  const isTool = TOOL_IDS.has(activeFile);
  const file = !isTool ? FILES[activeFile] : null;

  const breadcrumb = getBreadcrumb(activeFile);

  return (
    <div className={styles.editorWrap}>
      {/* Tab bar */}
      <div className={styles.tabbar} role="tablist">
        {tabs.map(name => {
          const f = FILES[name];
          const isActive = name === activeFile;
          const isTool_ = TOOL_IDS.has(name);
          const FileIcon = f ? (ICONS_FOR_FILE[f.icon] ?? FileText) : (isTool_ ? Sparkles : FileText);

          return (
            <div
              key={name}
              className={cn(styles.tab, { [styles.active]: isActive })}
              onClick={() => setActiveFile(name)}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveFile(name); }}
            >
              <span className={styles.tabIcon}><FileIcon size={12} /></span>
              <span className={styles.tabName}>{name}</span>
              <button
                className={styles.tabClose}
                onClick={(e) => { e.stopPropagation(); closeTab(name); }}
                aria-label={`Close ${name}`}
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
        <div className={styles.tabSpacer} />
      </div>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        {breadcrumb.split(' › ').map((part, i, arr) => (
          <span key={i}>
            <span className={cn(styles.crumb, { [styles.crumbActive]: i === arr.length - 1 })}>{part}</span>
            {i < arr.length - 1 && <span className={styles.crumbSep}> › </span>}
          </span>
        ))}
      </div>

      {/* Content area */}
      <div className={styles.editorContent}>
        {isTool ? (
          <TestAutomatorPane />
        ) : file ? (
          <FileView file={file} />
        ) : tabs.length === 0 ? (
          <div className={styles.emptyState}>No file open.</div>
        ) : null}
      </div>
    </div>
  );
}
