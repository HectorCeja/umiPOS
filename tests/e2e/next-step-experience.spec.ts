import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('important success states offer a visible next step', async () => {
  const [products, experience, styles] = await Promise.all([
    readFile('apps/web/src/app/products/page.tsx', 'utf8'),
    readFile('apps/web/src/app/contextual-help.tsx', 'utf8'),
    readFile('apps/web/src/app/styles.css', 'utf8'),
  ]);
  expect(products).toContain(
    'Construye los artículos descriptivos que usarán Ventas e Inventario.',
  );
  expect(experience).toContain('Agrega existencias para dejarlo listo para vender.');
  expect(experience).toContain('SIGUIENTE PASO');
  expect(styles).toContain('.next-step');
});
