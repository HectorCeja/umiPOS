import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('five-second test records purpose and primary action for every screen', async () => {
  const report = await readFile('artifacts/premium-ux-part-4a/KEYNOTE_TEST.md', 'utf8');
  expect(report).toContain('Qué se entiende en 5 segundos');
  expect(report).toContain('Acción principal');
  expect(report).toContain('Crear producto');
  expect(report).toContain('Elegir producto y ubicación');
});
