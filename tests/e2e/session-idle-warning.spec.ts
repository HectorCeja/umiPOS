import { expect, test } from '@playwright/test';
import { browserAudit, evidence, expectClean, login } from './owner-corrective.helpers';

test('normal activity is not logged out in thirty seconds and refresh is single-flight', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await login(page);
  const audit = browserAudit(page);
  await page.waitForTimeout(31_000);
  await expect(page.locator('.profile-trigger')).toBeVisible();
  expectClean(audit);
  const refreshRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/v1/auth/refresh')) refreshRequests.push(request.url());
  });
  await page.context().clearCookies({ name: 'nexo_session' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.profile-trigger')).toBeVisible({ timeout: 15_000 });
  expect(refreshRequests.length).toBeLessThanOrEqual(1);
  expect(refreshRequests.length).toBe(1);
});

test('idle warning is visible, actionable and preserves the session', async ({ page }) => {
  await login(page);
  await page.clock.install({ time: new Date() });
  await page.reload({ waitUntil: 'networkidle' });
  const audit = browserAudit(page);
  await page.clock.runFor(15 * 60 * 1000 + 1_000);
  const dialog = page.getByRole('alertdialog', {
    name: 'Tu sesión está por expirar por inactividad.',
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Las operaciones pendientes no se enviarán automáticamente');
  await evidence(page, 'session-idle-warning.png');
  await dialog.getByRole('button', { name: 'Mantener sesión' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('.profile-trigger')).toBeVisible();
  expectClean(audit);
});
