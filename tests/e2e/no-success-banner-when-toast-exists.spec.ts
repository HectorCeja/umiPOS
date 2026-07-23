import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('éxito persistente no combina toast con banner o educación duplicada', async () => {
  const [products, sales] = await Promise.all([
    readFile('apps/web/src/app/products/page.tsx', 'utf8'),
    readFile('apps/web/src/app/sales/sales-administration-console.tsx', 'utf8'),
  ]);
  expect(products).not.toContain('<SuccessEducation');
  expect(products).not.toContain('<NextStepRecommendation');
  expect(sales).toContain('<PremiumToastPortal');
  expect(sales).not.toContain('<Alert title="Operación completada"');
});
