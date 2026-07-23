import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('la experiencia principal habla el idioma del negocio', async ({ page }) => {
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);
  for (const route of ['/', '/cash', '/reports', '/products', '/inventory']) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText(
      /DTO|endpoint|projection|snapshot|event sourcing|ledger/i,
    );
  }
  expectClean(audit);
});
