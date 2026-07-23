import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('every module has a justified launch-quality decision', async () => {
  const report = await readFile('artifacts/premium-ux-part-4b/PRODUCT_EXCELLENCE.md', 'utf8');
  for (const module of [
    'Login',
    'Registro',
    'Onboarding',
    'Dashboard',
    'Productos',
    'Inventario',
    'Ventas',
    'Caja',
    'Equipo',
    'Configuración',
    'Perfil',
    'Centro de Ayuda',
    'Clientes',
    'Flutter POS',
  ])
    expect(report).toContain(`| ${module} |`);
  expect(report).toContain('No como módulo funcional');
});
