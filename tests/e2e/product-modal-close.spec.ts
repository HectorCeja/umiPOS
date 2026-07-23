import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('detalle usa IconButton oficial y una sola acción cerrar', async () => {
  const source = await readFile('apps/web/src/app/products/page.tsx', 'utf8');
  expect(source).toContain('<IconButton');
  expect(source).toContain('label="Cerrar detalle del producto"');
  expect(source).not.toContain('>Cerrar</Button>');
});
