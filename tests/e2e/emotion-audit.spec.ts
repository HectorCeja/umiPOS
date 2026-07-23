import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('every owner surface has an explicit emotional intent', async () => {
  const source = await readFile('apps/web/src/app/contextual-help.tsx', 'utf8');
  for (const emotion of [
    'Control',
    'Velocidad',
    'Seguridad',
    'Orden',
    'Creatividad',
    'Colaboración',
    'Confianza',
    'Identidad',
    'Ilusión',
    'Bienvenida',
  ])
    expect(source).toContain(`'${emotion}'`);
});
