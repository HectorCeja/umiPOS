import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  expectClean,
  login,
  onePixelPng,
  web,
} from './owner-corrective.helpers';

test('una sola identidad conserva el avatar durante todo el recorrido del owner', async ({
  page,
}) => {
  await login(page);
  await completeOnboarding(page);
  await page.goto(`${web}/settings/profile`);
  const audit = browserAudit(page);
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'owner-final.png', mimeType: 'image/png', buffer: onePixelPng });
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await expect(page.getByText(/Perfil actualizado/)).toBeVisible();
  await expect(page.locator('.profile-trigger .avatar img.is-loaded')).toBeVisible();
  for (const path of [
    '/',
    '/products',
    '/inventory',
    '/sales',
    '/cash',
    '/control-plane/invitations',
    '/control-plane/settings',
    '/settings/profile',
  ]) {
    await page.goto(`${web}${path}`);
    const header = page.locator('.profile-trigger .avatar img');
    await expect(header).toHaveClass(/is-loaded/);
    await page.locator('.profile-trigger').click();
    const menu = page.locator('.account-menu .avatar img');
    await expect(menu).toHaveClass(/is-loaded/);
    expect(await header.getAttribute('src')).toBe(await menu.getAttribute('src'));
  }
  expectClean(audit);
});
