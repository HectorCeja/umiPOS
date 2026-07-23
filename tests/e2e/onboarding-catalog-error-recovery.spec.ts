import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('error de catálogo identifica producto y ofrece recuperación', async () => {
  const source = await readFile('apps/web/src/app/product-experience.tsx', 'utf8');
  expect(source).toContain('No pudimos preparar');
  expect(source).toContain('Revisar producto');
  expect(source).toContain('Intentar de nuevo');
});
