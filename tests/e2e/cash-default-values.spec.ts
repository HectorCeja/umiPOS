import { expect, test } from '@playwright/test';
import {
  chooseCustomNexoSelect,
  chooseNexoSelect,
  completeOnboarding,
  login,
  web,
} from './owner-corrective.helpers';

test('Cash offers intelligent presets and preserves custom entry', async ({ page }) => {
  await login(page);
  await completeOnboarding(page);
  await page.goto(`${web}/cash`);
  await page.getByText('Configurar puntos de cobro').click();
  const name = page.getByRole('combobox', { name: 'Nombre' });
  await expect(name).toHaveAttribute('data-value', /Caja|Mostrador|Punto/i);
  for (const preset of [
    'Caja principal',
    'Caja secundaria',
    'Mostrador',
    'Caja express',
    'Caja delivery',
    'Caja terraza',
    'Punto principal',
  ])
    await chooseNexoSelect(page, 'Nombre', preset);
  await chooseCustomNexoSelect(page, 'Nombre', 'Caja personalizada Owner');
  await expect(name).toHaveAttribute('data-value', 'Caja personalizada Owner');
});
