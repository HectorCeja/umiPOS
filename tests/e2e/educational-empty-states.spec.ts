import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('empty states teach the next valid action without exposing technical language', async ({
  page,
}) => {
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);

  await page.goto(`${web}/inventory`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Selecciona producto y ubicación')).toBeVisible();
  await expect(page.locator('.inventory-availability .human-empty')).toContainText(
    'En mano es el total físico',
  );

  await page.goto(`${web}/sales`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.contextual-help')).toContainText('Cada venta cuenta una historia');
  await expect(page.locator('body')).not.toContainText(/No data|undefined|null|\{\s*"/);

  await page.goto(`${web}/control-plane/invitations`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.contextual-help')).toContainText('Invita con claridad y control');

  expectClean(audit);
});
