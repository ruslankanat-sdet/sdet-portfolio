// Ported from .planning/design/design_handoff_ide_portfolio/syntax.jsx
// Changes from original:
//  - TypeScript types (TokenClass union, ReactNode return type)
//  - import { createElement } from 'react' (no global h alias)
//  - Named export `tokenize` (no window globals)
//  - No DOM dependencies — safe in server + client contexts
//  - Added tokenizeTypeScript (new — required for Phase 3 Playwright .ts test files)
//  - Removed window.tokenize assignment

import { createElement, ReactNode } from 'react';

type TokenClass =
  | 'key' | 'str' | 'num' | 'kw' | 'cmt' | 'punct' | 'fn' | 'type' | 'dec'
  | 'md-h' | 'md-quote' | 'md-table' | 'md-em' | 'md-b' | 'md-code';

const T = (cls: TokenClass, text: string, key: string | number): ReactNode =>
  createElement('span', { className: `tk-${cls}`, key }, text);

export function tokenize(src: string, lang: string): ReactNode[] {
  switch (lang) {
    case 'typescript': return tokenizeTypeScript(src);
    case 'json':       return tokenizeJSON(src);
    case 'python':     return tokenizePython(src);
    case 'markdown':   return tokenizeMarkdown(src);
    case 'yaml':       return tokenizeYaml(src);
    case 'toml':       return tokenizeToml(src);
    default:           return [src];
  }
}

// ─── TypeScript tokenizer ──────────────────────────────────────────────────
// New — not in original syntax.jsx. Required for Phase 3 Playwright test files.

function tokenizeTypeScript(src: string): ReactNode[] {
  const KW = /\b(import|export|from|const|let|var|function|async|await|return|if|else|for|while|do|class|interface|type|extends|implements|new|this|super|typeof|instanceof|in|of|try|catch|finally|throw|void|null|undefined|true|false|default|case|switch|break|continue|readonly|private|public|protected|static|abstract|declare|namespace|enum|keyof|as|satisfies)\b/;

  const lines = src.split('\n');
  // Cast needed: flatMap produces (string | ReactNode)[] which TypeScript cannot
  // automatically widen to ReactNode[] without explicit assertion.
  return lines.flatMap((line, li) => {
    const parts: (string | ReactNode)[] = [];
    let rest = line;
    let k = 0;

    while (rest.length) {
      // single-line comment
      let m = rest.match(/^\/\/[^\n]*/);
      if (m) { parts.push(T('cmt', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // decorator
      m = rest.match(/^@[\w.]+/);
      if (m) { parts.push(T('dec', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // template literal (backtick string)
      m = rest.match(/^`(?:[^`\\]|\\.)*`/);
      if (m) { parts.push(T('str', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // double-quoted string
      m = rest.match(/^"(?:\\.|[^"\\])*"/);
      if (m) { parts.push(T('str', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // single-quoted string
      m = rest.match(/^'(?:\\.|[^'\\])*'/);
      if (m) { parts.push(T('str', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // number
      m = rest.match(/^-?\d[\d_.]*/);
      if (m) { parts.push(T('num', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // keyword
      m = rest.match(KW);
      if (m && m.index === 0) { parts.push(T('kw', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // PascalCase type/class name
      m = rest.match(/^[A-Z][\w]*/);
      if (m) { parts.push(T('type', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // function call (identifier followed by open paren)
      m = rest.match(/^[a-z_]\w*(?=\()/);
      if (m) { parts.push(T('fn', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // plain identifier — emit as text (no token color)
      m = rest.match(/^[a-zA-Z_$][\w$]*/);
      if (m) { parts.push(m[0]); rest = rest.slice(m[0].length); continue; }

      // whitespace
      m = rest.match(/^\s+/);
      if (m) { parts.push(m[0]); rest = rest.slice(m[0].length); continue; }

      // punctuation (single char fallthrough)
      parts.push(T('punct', rest[0], `${li}:${k++}`));
      rest = rest.slice(1);
    }

    if (li < lines.length - 1) parts.push('\n');
    return parts;
  }) as ReactNode[];
}

// ─── JSON tokenizer ────────────────────────────────────────────────────────
// Ported verbatim from syntax.jsx lines 8–31.

function tokenizeJSON(src: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|(true|false|null)|(-?\d+(?:\.\d+)?)|(\/\/[^\n]*)|([{}\[\],])|(\s+)|([^\s]+)/g;
  let m: RegExpExecArray | null;
  let i = 0;
  let k = 0;
  while ((m = re.exec(src))) {
    if (m.index > i) out.push(src.slice(i, m.index));
    if (m[1]) {
      if (m[2]) {
        out.push(T('key', m[1], k++));
        out.push(T('punct', m[2], k++));
      } else {
        out.push(T('str', m[1], k++));
      }
    } else if (m[3]) out.push(T('kw', m[3], k++));
    else if (m[4]) out.push(T('num', m[4], k++));
    else if (m[5]) out.push(T('cmt', m[5], k++));
    else if (m[6]) out.push(T('punct', m[6], k++));
    else if (m[7]) out.push(m[7]);
    else out.push(m[8]);
    i = re.lastIndex;
  }
  if (i < src.length) out.push(src.slice(i));
  return out;
}

// ─── Python tokenizer ──────────────────────────────────────────────────────
// Ported verbatim from syntax.jsx lines 33–76.

function tokenizePython(src: string): ReactNode[] {
  const KW = /\b(class|def|return|import|from|if|else|elif|for|while|in|not|and|or|None|True|False|self|lambda|with|as|try|except|raise|yield|pass)\b/;
  const lines = src.split('\n');
  // flatMap callback returns (string | ReactNode)[] — cast required for ReactNode[] compatibility.
  return lines.flatMap((line, li) => {
    const parts: (string | ReactNode)[] = [];
    let rest = line;
    let k = 0;

    while (rest.length) {
      // comment
      let m = rest.match(/^#[^\n]*/);
      if (m) { parts.push(T('cmt', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // decorator
      m = rest.match(/^@[\w.]+/);
      if (m) { parts.push(T('dec', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // triple string
      m = rest.match(/^"""[\s\S]*?"""/);
      if (m) { parts.push(T('str', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // string
      m = rest.match(/^"(?:\\.|[^"\\])*"/);
      if (m) { parts.push(T('str', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // number
      m = rest.match(/^-?\d[\d_.]*/);
      if (m) { parts.push(T('num', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // keyword
      m = rest.match(KW);
      if (m && m.index === 0) { parts.push(T('kw', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // PascalCase type/class name
      m = rest.match(/^[A-Z][\w]*/);
      if (m) { parts.push(T('type', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // function call (identifier followed by open paren)
      m = rest.match(/^[a-z_]\w*(?=\()/);
      if (m) { parts.push(T('fn', m[0], `${li}:${k++}`)); rest = rest.slice(m[0].length); continue; }

      // plain identifier
      m = rest.match(/^[a-zA-Z_]\w*/);
      if (m) { parts.push(m[0]); rest = rest.slice(m[0].length); continue; }

      // whitespace + punctuation
      m = rest.match(/^\s+/);
      if (m) { parts.push(m[0]); rest = rest.slice(m[0].length); continue; }

      parts.push(T('punct', rest[0], `${li}:${k++}`));
      rest = rest.slice(1);
    }

    if (li < lines.length - 1) parts.push('\n');
    return parts;
  }) as ReactNode[];
}

// ─── Markdown tokenizer ────────────────────────────────────────────────────
// Ported verbatim from syntax.jsx lines 78–109.

function tokenizeMarkdown(src: string): ReactNode[] {
  return src.split('\n').flatMap((line, li) => {
    const parts: ReactNode[] = [];
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#+)\s+(.*)$/))) {
      parts.push(T('md-h', m[1] + ' ' + m[2], li));
    } else if ((m = line.match(/^>\s+(.*)$/))) {
      parts.push(T('md-quote', '> ' + m[1], li));
    } else if (line.startsWith('|')) {
      parts.push(T('md-table', line, li));
    } else if ((m = line.match(/^---+$/))) {
      parts.push(T('punct', line, li));
    } else if (line.startsWith('*') && line.endsWith('*') && line.length > 2) {
      parts.push(T('md-em', line, li));
    } else {
      // inline bold + code
      let rest = line;
      let k = 0;
      while (rest.length) {
        const bm = rest.match(/\*\*[^*]+\*\*/);
        const cm = rest.match(/`[^`]+`/);
        const candidates = ([bm, cm] as (RegExpMatchArray | null)[])
          .filter((x): x is RegExpMatchArray => x !== null)
          .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
        if (!candidates.length) { parts.push(rest); break; }
        const first = candidates[0];
        if ((first.index ?? 0) > 0) parts.push(rest.slice(0, first.index));
        parts.push(T(first[0].startsWith('`') ? 'md-code' : 'md-b', first[0], `${li}:${k++}`));
        rest = rest.slice((first.index ?? 0) + first[0].length);
      }
    }
    parts.push('\n');
    return parts;
  });
}

// ─── YAML tokenizer ────────────────────────────────────────────────────────
// Ported verbatim from syntax.jsx lines 111–138.

function tokenizeYaml(src: string): ReactNode[] {
  return src.split('\n').flatMap((line, li) => {
    const parts: ReactNode[] = [];
    const m = line.match(/^(\s*-?\s*)([A-Za-z_][\w]*)(:)(.*)$/);
    if (line.trim().startsWith('#')) {
      parts.push(T('cmt', line, li));
    } else if (m) {
      parts.push(m[1]);
      parts.push(T('key', m[2], `${li}:k`));
      parts.push(T('punct', m[3], `${li}:c`));
      const val = m[4];
      const vm = val.match(/^\s*(\d+)\s*$/);
      const vs = val.match(/^(\s*)(.+)$/);
      if (vm) {
        if (vs) parts.push(vs[1]);
        parts.push(T('num', vm[1], `${li}:n`));
      } else if (vs && vs[2]) {
        parts.push(vs[1]);
        parts.push(T('str', vs[2], `${li}:s`));
      } else {
        parts.push(val);
      }
    } else {
      parts.push(line);
    }
    parts.push('\n');
    return parts;
  });
}

// ─── TOML tokenizer ────────────────────────────────────────────────────────
// Ported verbatim from syntax.jsx lines 141–162.

function tokenizeToml(src: string): ReactNode[] {
  return src.split('\n').flatMap((line, li) => {
    const parts: ReactNode[] = [];
    if (line.trim().startsWith('#')) {
      parts.push(T('cmt', line, li));
    } else if (line.match(/^\[.+\]$/)) {
      parts.push(T('type', line, li));
    } else {
      const m = line.match(/^(\s*)([\w_]+)(\s*=\s*)(.*)$/);
      if (m) {
        parts.push(m[1]);
        parts.push(T('key', m[2], `${li}:k`));
        parts.push(T('punct', m[3], `${li}:eq`));
        parts.push(T('str', m[4], `${li}:v`));
      } else {
        parts.push(line);
      }
    }
    parts.push('\n');
    return parts;
  });
}
