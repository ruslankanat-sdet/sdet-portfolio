/// <reference types="vitest/globals" />
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

  it('classifies a decorator as tk-dec', () => {
    const tokens = tokenize('@Component', 'typescript');
    const decs = findTokens(tokens, 'dec');
    expect(decs).toHaveLength(1);
    expect(tokenText(decs[0])).toBe('@Component');
  });

  it('classifies a PascalCase name as tk-type', () => {
    const tokens = tokenize('MyClass', 'typescript');
    const types = findTokens(tokens, 'type');
    expect(types.length).toBeGreaterThanOrEqual(1);
    const typeTexts = types.map(tokenText);
    expect(typeTexts).toContain('MyClass');
  });

  it('classifies a function call identifier as tk-fn (without the open paren)', () => {
    const tokens = tokenize('describe(', 'typescript');
    const fns = findTokens(tokens, 'fn');
    expect(fns.length).toBeGreaterThanOrEqual(1);
    expect(tokenText(fns[0])).toBe('describe');
  });

  it('correctly tokenizes a real TS import line with multiple token types', () => {
    const src = "import { test, expect } from '@playwright/test';";
    const tokens = tokenize(src, 'typescript');

    const kwTexts = findTokens(tokens, 'kw').map(tokenText);
    expect(kwTexts).toContain('import');
    expect(kwTexts).toContain('from');

    const strTexts = findTokens(tokens, 'str').map(tokenText);
    expect(strTexts).toContain("'@playwright/test'");

    const puncts = findTokens(tokens, 'punct');
    expect(puncts.length).toBeGreaterThanOrEqual(1);
  });
});

describe('tokenize — dispatcher', () => {
  it('returns the source as a plain string for unknown languages', () => {
    const result = tokenize('hello world', 'plaintext');
    expect(result).toHaveLength(1);
    expect(isValidElement(result[0])).toBe(false);
    expect(result[0]).toBe('hello world');
  });

  it('routes json lang to the JSON tokenizer (produces tk-key tokens)', () => {
    const result = tokenize('{"key": "value"}', 'json');
    const keys = findTokens(result, 'key');
    expect(keys.length).toBeGreaterThanOrEqual(1);
  });

  it('routes python lang to the Python tokenizer (produces tk-kw token for def)', () => {
    const result = tokenize('def foo():', 'python');
    const kws = findTokens(result, 'kw');
    const kwTexts = kws.map(tokenText);
    expect(kwTexts).toContain('def');
  });
});
