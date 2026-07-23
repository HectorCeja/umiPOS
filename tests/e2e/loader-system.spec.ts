import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('visible loaders describe their work instead of saying Loading', async () => {
  const [dashboard, primitive] = await Promise.all([
    readFile('apps/web/src/app/product-experience.tsx', 'utf8'),
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
  ]);
  for (const copy of [
    'Preparando ventas…',
    'Calculando ingresos…',
    'Verificando caja…',
    'Sincronizando operación…',
  ])
    expect(dashboard).toContain(copy);
  expect(primitive).toContain("label = 'Preparando contenido'");
  expect(dashboard).not.toContain("'Cargando…'");
});
