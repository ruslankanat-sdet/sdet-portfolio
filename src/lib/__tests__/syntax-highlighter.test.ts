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
