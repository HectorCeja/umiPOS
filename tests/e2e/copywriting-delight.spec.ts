import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('mutation copy is commercial, calm and specific', async () => {
  const files = [
    'apps/web/src/app/products/page.tsx',
    'apps/web/src/app/cash/cash-console.tsx',
    'apps/web/src/app/control-plane-shell.tsx',
    'apps/web/src/app/settings/profile/page.tsx',
  ];
  const text = (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n');
  expect(text).not.toContain("setNotice('Configuración guardada.')");
  expect(text).not.toContain("setNotice('La operación quedó registrada correctamente.')");
  expect(text).toContain('Ya forma parte de tu catálogo');
  expect(text).toContain('Invitación enviada');
});
