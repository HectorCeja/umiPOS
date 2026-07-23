import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('important mutations explain impact and preserve confidence', async () => {
  const sources = await Promise.all([
    readFile('apps/web/src/app/cash/cash-console.tsx', 'utf8'),
    readFile('apps/web/src/app/control-plane-shell.tsx', 'utf8'),
    readFile('apps/web/src/app/settings/profile/page.tsx', 'utf8'),
  ]);
  const text = sources.join('\n');
  for (const message of [
    'El turno ya está listo para registrar ventas',
    'El conteo y la diferencia quedaron registrados',
    'Conservamos tus datos',
    'tu foto ya te representan en todo NEXO',
  ])
    expect(text).toContain(message);
});
