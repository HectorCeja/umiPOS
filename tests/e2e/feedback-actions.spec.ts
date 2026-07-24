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
  const confirmation = page.getByText(
    'Perfil actualizado. Tu nombre y tu foto ya te representan en todo NEXO.',
  );
  await expect(confirmation).toBeVisible();
  const feedbackRegion = page.locator('body > .nexo-toast-region');
  await expect(feedbackRegion).toHaveCount(1);
  await expect(feedbackRegion).toContainText('Cambios guardados');
  await page.goto(`${web}/cash`);
  await expect(page.locator('#cash-feedback')).toHaveCount(0);
  await expect(page.locator('body > .nexo-toast-region')).toHaveCount(0);
});
