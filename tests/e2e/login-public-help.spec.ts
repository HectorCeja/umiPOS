import { expect, test } from '@playwright/test';
import { browserAudit, expectClean, web } from './owner-corrective.helpers';
test('Login ofrece ayuda editorial sin CTA', async ({ page }) => {
  const audit = browserAudit(page);
  await page.goto(web);
  await page.evaluate(() => localStorage.removeItem('nexo.help.v2.login'));
  await page.reload();
  const help = page.getByRole('complementary', { name: 'Ayuda de Cómo iniciar sesión' });
  await expect(help).toBeVisible();
  const panel = help.locator('.contextual-help__panel');
  await expect(panel.getByRole('link')).toHaveCount(0);
  await expect(panel.getByRole('button')).toHaveCount(1);
  expectClean(audit);
});
