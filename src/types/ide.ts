// All types consumed by IDE shell and its children.
// Ported from PATTERNS.md src/types/ide.ts section.
// Changes from original design handoff implied shape:
//  - Added 'typescript' to FileEntryLang (required for Phase 3 Playwright .ts test files)
//  - Named exports (no window globals)

export type FileEntryLang = 'typescript' | 'json' | 'python' | 'markdown' | 'yaml' | 'toml';
export type FileEntryIcon = 'ts' | 'json' | 'py' | 'md' | 'yaml' | 'toml';

export interface FileEntry {
  lang: FileEntryLang;
  path: string;
  icon: FileEntryIcon;
  content: string;
}

export interface ToolEntry {
  type: 'tool';
  id: string;
  label: string;
}

export type WorkspaceEntry = FileEntry | ToolEntry;

export type LogKind = 'info' | 'warn' | 'ok' | 'pass' | 'fail';

export interface LogEntry {
  kind: LogKind;
  text?: string;    // for info / warn / ok
  test?: string;    // for pass / fail
  detail?: string;  // optional detail for pass / fail
}

export type Theme = 'dark' | 'light';

export interface IDEState {
  activeFile: string;
  tabs: string[];
  termHeight: number;
  termTab: string;
  running: boolean;
  theme: Theme;
}
