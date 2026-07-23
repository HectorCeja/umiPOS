import { expect, test } from '@playwright/test';
import { completeOnboarding, login, web } from './owner-corrective.helpers';

test('Cash offers intelligent presets and preserves custom entry', async ({ page }) => {
  await login(page);
  await completeOnboarding(page);
  await page.goto(`${web}/cash`);
  await page.getByText('Configurar puntos de cobro').click();
  const name = page.getByLabel('Nombre');
  await expect(name).toHaveValue(/Caja|Mostrador|Punto/i);
  for (const preset of [
    'Caja principal',
    'Caja secundaria',
    'Mostrador',
    'Caja express',
    'Caja delivery',
    'Caja terraza',
    'Punto principal',
  ])
    await expect(page.locator(`#cash-name-presets option[value="${preset}"]`)).toHaveCount(1);
  await name.fill('Caja personalizada Owner');
  await expect(name).toHaveValue('Caja personalizada Owner');
});
