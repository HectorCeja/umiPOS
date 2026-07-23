import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('producto y variante centinela sobreviven prepare', async () => {
  const after = JSON.parse(
    await readFile(
      'artifacts/owner-final-acceptance-master-part-2c/logs/owner-data-after.json',
      'utf8',
    ),
  ) as { sentinel_product: boolean; products: number; variants: number };
  expect(after.sentinel_product).toBe(true);
  expect(after.products).toBeGreaterThanOrEqual(1);
  expect(after.variants).toBeGreaterThanOrEqual(1);
});
