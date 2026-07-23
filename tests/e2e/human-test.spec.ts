import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('cada módulo principal explica su propósito y tiene una acción reconocible', async ({
  page,
}) => {
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);
  for (const route of [
    '/',
    '/products',
    '/inventory',
    '/sales',
    '/cash',
    '/control-plane/invitations',
  ]) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect(page.locator('button, a').filter({ visible: true }).first()).toBeVisible();
  }
  expectClean(audit);
});
