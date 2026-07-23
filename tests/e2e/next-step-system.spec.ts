import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('important product creation success recommends a useful next step', async () => {
  const source = await readFile('apps/web/src/app/products/page.tsx', 'utf8');
  expect(source).toContain('<SuccessEducation');
  expect(source).toContain('<NextStepRecommendation');
  expect(source).toContain('Ir a Inventario');
});
