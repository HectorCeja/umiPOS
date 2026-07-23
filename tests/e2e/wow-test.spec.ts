import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('wow and five-second judgments define observable evidence', async () => {
  const report = await readFile('artifacts/premium-ux-part-4a/WOW_TEST.md', 'utf8');
  expect(report).toContain('test de 15 segundos');
  expect(report).toContain('Recuerdo a 5 segundos');
  expect(report).toContain('claridad inmediata');
  expect(report).not.toContain('Todo es wow');
});
