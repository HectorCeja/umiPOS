import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('business surfaces translate domain events and avoid raw HTTP copy', async () => {
  const [sales, web] = await Promise.all([
    readFile('packages/ui/src/sales.tsx', 'utf8'),
    readFile('apps/web/src/app/sales/sales-administration-console.tsx', 'utf8'),
  ]);
  expect(sales).toContain("SaleCompleted: 'Venta completada'");
  expect(sales).toContain("InventoryReservationRequested: 'Inventario reservado'");
  expect(web).not.toMatch(/>\s*(409 Conflict|500 Internal Server Error|SaleCompleted)\s*</);
});
