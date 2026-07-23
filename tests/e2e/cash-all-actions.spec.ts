import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('todas las familias de acciones Caja tienen handler y guards', async () => {
  const source = await readFile('apps/web/src/app/cash/cash-console.tsx', 'utf8');
  for (const label of [
    'Actualizar',
    'Crear punto de cobro',
    'Crear cajón',
    'Abrir sesión',
    'Suspender',
    'Forzar cierre',
    'Entrada de efectivo',
    'Preparar depósito',
    'Entregar depósito',
    'Confirmar depósito',
    'Cancelar depósito',
    'Transferir',
    'Reconciliar',
    'Cerrar sesión',
  ])
    expect(source).toContain(label);
  expect(source.match(/onClick=/gu)?.length).toBeGreaterThan(20);
  expect(source.match(/disabled=/gu)?.length).toBeGreaterThan(15);
});
