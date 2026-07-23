import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('depósito usa stepper responsive', async () => {
  const [tsx, css] = await Promise.all([
    readFile('packages/ui/src/cash.tsx', 'utf8'),
    readFile('packages/ui/src/styles.css', 'utf8'),
  ]);
  expect(tsx).toContain('nexo-stepper');
  expect(css).toContain('grid-template-columns: repeat(3');
  expect(css).toMatch(/\.nexo-stepper\s*\{\s*grid-template-columns:\s*1fr/u);
});
