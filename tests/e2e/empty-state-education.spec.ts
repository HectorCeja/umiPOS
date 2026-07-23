import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('empty states explain why and offer an actionable direction', async () => {
  const [primitive, help, products] = await Promise.all([
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
    readFile('apps/web/src/app/help/help-center-experience.tsx', 'utf8'),
    readFile('apps/web/src/app/products/page.tsx', 'utf8'),
  ]);
  expect(primitive).toContain('secondaryAction');
  expect(help).toContain('Ver todas las guías');
  expect(products).toContain('Agrega el primero para comenzar');
});
