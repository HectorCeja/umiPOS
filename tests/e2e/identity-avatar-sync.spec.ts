import { expect, test } from '@playwright/test';
import { browserAudit, evidence, expectClean, onePixelPng, web } from './owner-corrective.helpers';
import { createCleanUser, loginClean } from './dynamic-context.helpers';

test('avatar changes immediately in the header and account menu', async ({ page }) => {
  const fixture = createCleanUser();
  await loginClean(page, fixture.email);
  await page.goto(`${web}/settings/profile`);
  const audit = browserAudit(page);
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'sync.png', mimeType: 'image/png', buffer: onePixelPng });
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await expect(page.getByText(/Perfil actualizado/)).toBeVisible();
  await expect(page.locator('.profile-trigger .avatar img')).toBeVisible();
  await page.locator('.profile-trigger').click();
  await expect(page.locator('.account-menu .avatar img')).toBeVisible();
  expect(await page.locator('.profile-trigger .avatar img').getAttribute('src')).toBe(
    await page.locator('.account-menu .avatar img').getAttribute('src'),
  );
  await evidence(page, 'identity-avatar-header-menu.png');
  expectClean(audit);
});
