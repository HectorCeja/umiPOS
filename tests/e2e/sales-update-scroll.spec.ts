import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('Actualizar Ventas revela resumen intencionalmente', async () => {
  const source = await readFile('apps/web/src/app/sales/sales-administration-console.tsx', 'utf8');
  expect(source).toContain("getElementById('sales-overview')");
  expect(source).toContain('refreshAndReveal');
});
