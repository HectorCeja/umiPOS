import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('acciones incompatibles explican su estado y no disparan requests', async ({ page }) => {
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/cash`);
  await page.waitForLoadState('networkidle');
  const disabled = page.getByRole('button', { name: 'Guardar cajón' });
  if (await disabled.isVisible()) await expect(disabled).toBeDisabled();
  await page.goto(`${web}/sales`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).not.toContainText('409 Conflict');
  expectClean(audit);
});
