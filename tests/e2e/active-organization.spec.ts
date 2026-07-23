import { expect, test } from '@playwright/test';
import { createCleanBusiness, loginClean } from './dynamic-context.helpers';

test('la organización nueva se convierte en el contexto activo', async ({ page }) => {
  const business = createCleanBusiness();
  await loginClean(page, business.email);
  await expect(page.locator('.guided-onboarding')).toBeVisible();
  await expect(page.evaluate(() => localStorage.getItem('nexo.active-organization'))).resolves.toBe(
    business.organizationId,
  );
});
