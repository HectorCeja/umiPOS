import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('technical detail is available but visually subordinate', async () => {
  const [sales, cash, styles] = await Promise.all([
    readFile('packages/ui/src/sales.tsx', 'utf8'),
    readFile('apps/web/src/app/cash/cash-console.tsx', 'utf8'),
    readFile('apps/web/src/app/styles.css', 'utf8'),
  ]);
  expect(sales).toContain('<details');
  expect(sales).toContain('Ver diagnóstico técnico');
  expect(cash).toContain('Ver diagnóstico avanzado');
  expect(styles).toContain('Progressive disclosure');
  expect(styles).toContain('main details:not(.nexo-popover)');
});
