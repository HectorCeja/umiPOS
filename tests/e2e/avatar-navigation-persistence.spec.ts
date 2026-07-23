import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  evidence,
  expectClean,
  login,
  onePixelPng,
  web,
} from './owner-corrective.helpers';

test('header and account menu retain the same avatar across routes', async ({ page }) => {
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/settings/profile`);
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'navigation-avatar.png', mimeType: 'image/png', buffer: onePixelPng });
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await expect(
    page.getByText('Perfil guardado. Verás los cambios al actualizar la navegación.'),
  ).toBeVisible();
  await expect(page.locator('.profile-trigger img')).toBeVisible();
  for (const path of ['/', '/products', '/inventory', '/sales']) {
    await page.goto(`${web}${path}`);
    const trigger = page.locator('.profile-trigger');
    await expect(trigger).toBeVisible();
    const headerSource = await trigger.locator('img').getAttribute('src');
    await expect(trigger.locator('img')).toBeVisible();
    await trigger.click();
    const menuSource = await page.locator('.account-menu img').getAttribute('src');
    expect(headerSource).toBe(menuSource);
    await evidence(page, `avatar-${path === '/' ? 'home' : path.slice(1)}.png`);
  }
  expectClean(audit);
});
