import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('help microcopy answers context, first action and next action', async () => {
  const source = await readFile('apps/web/src/app/contextual-help.tsx', 'utf8');
  for (const phrase of [
    'Empieza aquí:',
    'Después:',
    'SIGUIENTE PASO',
    'Se ocultará cuando termines de leer',
  ])
    expect(source).toContain(phrase);
  expect(source).not.toContain('Dashboard genérico');
});
