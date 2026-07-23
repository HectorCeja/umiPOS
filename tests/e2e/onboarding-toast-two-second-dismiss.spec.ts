import { expect, test } from '@playwright/test';
import { openCatalog } from './last-two-blockers.helpers';

test('toast simple de onboarding usa la duración global de cuatro segundos', async ({ page }) => {
  await openCatalog(page);
  await page.getByRole('button', { name: 'Continuar' }).click();
  const toast = page.locator('body > .nexo-toast-region .nexo-premium-toast');
  await expect(toast).toBeVisible();
  await page.waitForTimeout(2500);
  await expect(toast).toBeVisible();
  await expect(toast).toHaveCount(0, { timeout: 2000 });
});
