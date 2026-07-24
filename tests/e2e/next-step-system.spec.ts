import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('important product creation success recommends a useful next step', async () => {
  const [products, help] = await Promise.all([
    readFile('apps/web/src/app/products/page.tsx', 'utf8'),
    readFile('apps/web/src/app/contextual-help.tsx', 'utf8'),
  ]);
  expect(products).toContain('<SaveStatus state={mutation}');
  expect(help).toContain('NextStepRecommendation');
  expect(help).toContain('Agrega existencias para dejarlo listo para vender.');
});
