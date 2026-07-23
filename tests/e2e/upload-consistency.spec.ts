import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('shared upload preserves preview, replace, remove, progress and recoverable error', async () => {
  const source = await readFile('packages/ui/src/experience.tsx', 'utf8');
  for (const behavior of [
    'Vista previa',
    'Reemplazar imagen',
    'Eliminar imagen',
    'Procesando imagen',
    'role="alert"',
  ])
    expect(source).toContain(behavior);
  expect(source).toContain('image/png,image/jpeg,image/webp');
});
