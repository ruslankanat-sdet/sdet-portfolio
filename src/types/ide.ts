export type FileEntryLang = 'typescript' | 'json' | 'python' | 'markdown' | 'yaml';
export type FileEntryIcon = 'ts' | 'json' | 'py' | 'md' | 'yaml';

export interface FileEntry {
  lang: FileEntryLang;
  path: string;
  icon: FileEntryIcon;
  content: string;
}

export type LogKind = 'info' | 'warn' | 'ok' | 'pass' | 'fail';

export interface LogEntry {
  kind: LogKind;
  text?: string;
  test?: string;
  detail?: string;
}

export type Theme = 'dark' | 'light';

export type TerminalTab = 'TERMINAL';
