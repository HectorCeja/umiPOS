import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('feedback compartido no desplaza el viewport', async () => {
  const source = await readFile('packages/ui/src/experience.tsx', 'utf8');
  expect(source).not.toContain('node.scrollIntoView');
  expect(source).toContain('aria-live="polite"');
});
