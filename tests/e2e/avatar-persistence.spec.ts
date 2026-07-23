import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  expectClean,
  login,
  onePixelPng,
  web,
} from './owner-corrective.helpers';

test('one avatar remains visible in header and menu after navigation', async ({ page }) => {
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/settings/profile`);
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'owner-avatar.png', mimeType: 'image/png', buffer: onePixelPng });
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await expect(page.locator('.profile-trigger img')).toBeVisible();
  for (const route of ['/', '/products', '/inventory', '/cash']) {
    await page.goto(`${web}${route}`);
    const trigger = page.locator('.profile-trigger');
    await expect(trigger.locator('img')).toBeVisible();
    const src = await trigger.locator('img').getAttribute('src');
    await trigger.click();
    await expect(page.locator('.account-menu img')).toBeVisible();
    expect(await page.locator('.account-menu img').getAttribute('src')).toBe(src);
  }
  expectClean(audit);
});
