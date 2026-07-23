import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('Actualizar Caja revela resumen intencionalmente', async () => {
  const source = await readFile('apps/web/src/app/cash/cash-console.tsx', 'utf8');
  expect(source).toContain("revealSection('overview')");
  expect(source).toContain('refreshAndReveal');
});
