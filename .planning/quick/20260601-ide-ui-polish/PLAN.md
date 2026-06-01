---
slug: ide-ui-polish
status: complete
---

# IDE UI Polish

Four quick UX fixes to the IDE view.

## Changes

1. **Remove non-functional activity bar buttons** — Removed Search, GitBranch, Play, Boxes, User, Settings from Sidebar activity bar. Only Explorer (Folder) icon remains. Also removed corresponding unused imports.

2. **Remove non-functional terminal tabs** — Reduced TERM_TABS from 4 to just ['TERMINAL']. Removed PROBLEMS, OUTPUT, DEBUG CONSOLE tabs and associated badge/dot logic. Updated TerminalTab type to `'TERMINAL'` only.

3. **README.md pinned tab** — No close button rendered for README.md in EditorArea. Guard in IDEShell.closeTab returns early if name === 'README.md'. README is always visible as the welcome document.

4. **Mobile code text fix** — Added `-webkit-text-size-adjust: 100%` to pre.code on mobile to prevent iOS Safari auto-scaling. Slightly smaller font-size (12px/11px) and tighter padding on ≤768px.

5. **Green hamburger button** — Added green border, gradient background, and green-bright color to .menuBtn at ≤768px breakpoint, matching the Run Smoke Test button aesthetic.

## Files Changed

- `src/types/ide.ts`
- `src/components/ide/Sidebar.tsx`
- `src/components/ide/Terminal.tsx`
- `src/components/ide/EditorArea.tsx`
- `src/components/ide/IDEShell.tsx`
- `src/components/ide/FileView.module.css`
- `src/components/ide/TopBar.module.css`
