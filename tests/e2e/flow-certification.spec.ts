import { expect, test } from '@playwright/test';
import { browserAudit, completeOnboarding, login, web } from './owner-corrective.helpers.js';

test('launch flow stays coherent and clean from login through logout', async ({ page }) => {
  test.setTimeout(150_000);
  const audit = browserAudit(page);
  await page.goto(`${web}/login`);
  await expect(page.getByText('Bienvenido de nuevo', { exact: true })).toBeVisible();
  await login(page);
  if (
    await page
      .locator('.guided-onboarding')
      .isVisible()
      .catch(() => false)
  )
    await completeOnboarding(page);
  for (const route of [
    '/',
    '/control-plane/onboarding',
    '/products',
    '/inventory',
    '/sales',
    '/cash',
    '/control-plane/invitations',
    '/control-plane/settings',
    '/settings/profile',
    '/help',
  ]) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  }
  const [logout] = await Promise.all([
    page.waitForResponse((response) => response.url().endsWith('/v1/auth/logout')),
    page.getByRole('button', { name: 'Cerrar sesión' }).click(),
  ]);
  expect(logout.status()).toBe(204);
  await expect(page.getByText('Bienvenido de nuevo', { exact: true })).toBeVisible();
  expect(audit.consoleMessages).toEqual([]);
  expect(audit.failedRequests).toEqual([]);
  expect(audit.httpFailures).toEqual([]);
});
