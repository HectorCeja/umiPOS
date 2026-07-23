import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('every requested screen has an explicit delight assessment', async () => {
  const report = await readFile('artifacts/premium-ux-part-3b/OWNER_DELIGHT_SCORE.md', 'utf8');
  for (const screen of [
    'Dashboard',
    'Productos',
    'Inventario',
    'Ventas',
    'Caja',
    'Equipo',
    'Configuración',
    'Perfil',
    'Reportes',
    'Onboarding',
    'Login',
    'Flutter POS',
  ])
    expect(report).toContain(`| ${screen} |`);
  expect(report).toContain('Fortalezas');
  expect(report).toContain('Para llegar al máximo');
});
