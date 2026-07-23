import { expect, test } from '@playwright/test';
import { completeOnboarding, login, web } from './owner-corrective.helpers';

test('mutating owner forms expose explicit accessible feedback regions', async ({ page }) => {
  await login(page);
  await completeOnboarding(page);
  await page.goto(`${web}/settings/profile`);
  await expect(page.getByLabel('Nombre visible')).not.toHaveValue('');
  if ((await page.getByLabel('Apellidos').inputValue()).trim().length === 0) {
    await page.getByLabel('Apellidos').fill('Owner');
  }
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await expect(
    page.getByText('Perfil actualizado. Tu nombre y tu foto ya te representan en todo NEXO.'),
  ).toBeVisible();
  await page.goto(`${web}/cash`);
  await expect(page.locator('#cash-feedback')).toHaveCount(1);
});
