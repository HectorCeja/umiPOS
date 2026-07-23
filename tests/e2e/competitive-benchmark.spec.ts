import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('benchmark uses all eight official reference principles and every NEXO screen', async () => {
  const report = await readFile('artifacts/premium-ux-part-4a/COMPETITIVE_ANALYSIS.md', 'utf8');
  for (const product of [
    'Apple',
    'Linear',
    'Stripe',
    'Notion',
    'Arc',
    'Raycast',
    'Framer',
    'Vercel',
  ])
    expect(report).toContain(product);
  expect(report.match(/https:\/\//gu)?.length ?? 0).toBeGreaterThanOrEqual(8);
  const best = await readFile('artifacts/premium-ux-part-4a/BEST_IN_CLASS_REPORT.md', 'utf8');
  for (const screen of [
    'Login',
    'Onboarding',
    'Dashboard',
    'Ventas',
    'Caja',
    'Productos',
    'Inventario',
    'Equipo',
    'Clientes',
    'Configuración',
    'Perfil',
    'Reportes',
    'Flutter POS',
    'Centro de Ayuda',
  ])
    expect(best).toContain(`| ${screen} |`);
});
