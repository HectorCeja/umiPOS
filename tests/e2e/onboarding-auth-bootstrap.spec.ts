import { expect, test } from '@playwright/test';
import { browserAudit, evidence, expectClean, web } from './owner-corrective.helpers';

test('signed-out onboarding bootstrap does not probe protected endpoints', async ({ page }) => {
  const audit = browserAudit(page);
  await page.context().clearCookies();
  await page.goto(web);
  await expect(page.getByRole('button', { name: 'Entrar a NEXO' })).toBeVisible();
  await evidence(page, 'onboarding-signed-out-no-401.png');
  expectClean(audit);
});
