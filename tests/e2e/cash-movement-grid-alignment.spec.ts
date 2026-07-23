import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';
test('campos de movimientos comparten línea base y altura', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await login(page);
  await page.goto(`${web}/cash`);
  const labels = ['Monto', 'Motivo', 'Turno que recibirá el efectivo', 'Comprobante del depósito'];
  const tops = await Promise.all(
    labels.map(async (label) => (await page.getByLabel(label).boundingBox())?.y ?? -1),
  );
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(2);
});
