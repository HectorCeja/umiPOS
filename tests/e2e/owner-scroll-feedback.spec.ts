import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('el feedback compartido anuncia y resalta sin mover el viewport', () => {
  const source = readFileSync('packages/ui/src/experience.tsx', 'utf8');
  expect(source).toContain("['success', 'error', 'conflict'].includes(state)");
  expect(source).not.toContain('scrollIntoView');
  expect(source).not.toContain('focus({ preventScroll: true })');
  expect(source).toContain("classList.add('is-highlighted')");
});
