import { isValidElement, ReactNode } from 'react';
import { tokenize } from '../syntax-highlighter';

function findTokens(nodes: ReactNode[], cls: string): ReactNode[] {
  return nodes.filter(
    (node) => isValidElement(node) && (node.props as { className?: string }).className === `tk-${cls}`
  );
}

function tokenText(node: ReactNode): string {
  if (isValidElement(node)) {
    return String((node.props as { children?: unknown }).children ?? '');
  }
  return String(node);
}

describe('tokenize — TypeScript', () => {
  it('classifies a single-line comment as tk-cmt', () => {
    const tokens = tokenize('// hello world', 'typescript');
    const cmts = findTokens(tokens, 'cmt');
    expect(cmts).toHaveLength(1);
    expect(tokenText(cmts[0])).toBe('// hello world');
  });

  it('classifies const as tk-kw', () => {
    const tokens = tokenize('const x = 1', 'typescript');
    const kws = findTokens(tokens, 'kw');
    const kwTexts = kws.map(tokenText);
    expect(kwTexts).toContain('const');
  });

  it('classifies import and from as tk-kw', () => {
    const tokens = tokenize('import { test } from "lib"', 'typescript');
    const kws = findTokens(tokens, 'kw');
    const kwTexts = kws.map(tokenText);
    expect(kwTexts).toContain('import');
    expect(kwTexts).toContain('from');
  });

  it('classifies a double-quoted string as tk-str', () => {
    const tokens = tokenize('"hello"', 'typescript');
    const strs = findTokens(tokens, 'str');
    expect(strs).toHaveLength(1);
    expect(tokenText(strs[0])).toBe('"hello"');
  });

  it('classifies a single-quoted string as tk-str', () => {
    const tokens = tokenize("'hello'", 'typescript');
    const strs = findTokens(tokens, 'str');
    expect(strs).toHaveLength(1);
    expect(tokenText(strs[0])).toBe("'hello'");
  });

  it('classifies a template literal as tk-str starting with backtick', () => {
    const tokens = tokenize('`hello ${name}`', 'typescript');
    const strs = findTokens(tokens, 'str');
    expect(strs).toHaveLength(1);
    expect(tokenText(strs[0])).toMatch(/^`/);
  });

  it('classifies a positive integer as tk-num', () => {
    const tokens = tokenize('42', 'typescript');
    const nums = findTokens(tokens, 'num');
    expect(nums).toHaveLength(1);
    expect(tokenText(nums[0])).toBe('42');
  });

  it('classifies a negative integer as tk-num', () => {
    const tokens = tokenize('-1', 'typescript');
    const nums = findTokens(tokens, 'num');
    expect(nums).toHaveLength(1);
    expect(tokenText(nums[0])).toBe('-1');
  });
});
