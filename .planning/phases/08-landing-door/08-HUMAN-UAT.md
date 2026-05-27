---
status: partial
phase: 08-landing-door
source: [08-VERIFICATION.md]
started: 2026-05-27T23:08:29Z
updated: 2026-05-27T23:08:29Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Hover animation is smooth on desktop
expected: Each door half expands smoothly with flex-grow transition on hover; opposite half contracts. No jank on Chrome or Safari.
result: [pending]

### 2. Door stacks vertically on <=760px mobile
expected: Both halves render as vertically stacked panels with padding 32px 28px. flex-direction:column applies.
result: [pending]

### 3. prefers-reduced-motion disables the flex-grow transition
expected: When OS reduce-motion is enabled, door halves show without animation on hover.
result: [pending]

### 4. DoorScreen has no WCAG AA violations (axe scan on the door itself)
expected: Zero axe violations at WCAG 2.1 AA level when the door renders at / with no stored localStorage mode. Note: CR-01 from 08-REVIEW.md identified two <h1> elements in DoorScreen.tsx (lines 50 and 84) which axe will flag under heading-order rules — this is a real defect requiring fix before full axe-pass.
result: [pending]

### 5. Clicking the IDE half stores mode='ide' and renders IDEShell without page navigation
expected: Clicking '$ ./open-ide' writes localStorage['resume-mode']='ide', renders IDEShell (sidebar + editor), URL stays at '/'. WR-04 from 08-REVIEW.md: no automated e2e assertion for this path.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
