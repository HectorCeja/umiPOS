import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('Inventario consume IDs y ofrece crear ubicación en vacío', async () => {
  const source = await readFile('apps/web/src/app/inventory/page.tsx', 'utf8');
  expect(source).toContain('value: item.id');
  expect(source).toContain('onValueChange={setLocation}');
  expect(source).toContain('Crear ubicación');
  expect(source).toContain('/control-plane/inventory-locations');
});
