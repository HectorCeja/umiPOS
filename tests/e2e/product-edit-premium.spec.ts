import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('editor usa superficie premium y layout responsive', async () => {
  const css = await readFile('apps/web/src/app/styles.css', 'utf8');
  expect(css).toContain('width: min(68rem');
  expect(css).toContain('.product-edit-form');
  expect(css).toContain('grid-template-columns: repeat(2');
  expect(css).toContain('height: 100dvh');
});
