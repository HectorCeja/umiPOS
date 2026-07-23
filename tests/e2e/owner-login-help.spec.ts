import { expect, test } from '@playwright/test';
import { browserAudit, expectClean, web } from './owner-corrective.helpers';

test('la ayuda pública de Login nunca enlaza al Centro autenticado', async ({ page }) => {
  const audit = browserAudit(page);
  await page.goto(web);
  await page.evaluate(() => localStorage.removeItem('nexo.help.v2.login'));
  await page.reload();
  await page.getByRole('button', { name: 'Ver guía' }).click();
  const help = page.getByLabel('Ayuda de Cómo iniciar sesión');
  await expect(help.getByRole('link')).toHaveCount(0);
  await expect(help.getByRole('button')).toHaveCount(1);
  expectClean(audit);
});
