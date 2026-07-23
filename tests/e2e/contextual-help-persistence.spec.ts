import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('dismissed help persists and can be reopened', async ({ page }) => {
  await login(page);
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('nexo.help.v2.')) localStorage.removeItem(key);
  });
  await page.goto(`${web}/inventory`);
  const help = page.getByRole('complementary', {
    name: /Ayuda de Conoce lo que realmente puedes vender/,
  });
  await expect(help.locator('.contextual-help__panel')).toBeVisible();
  await help.getByRole('button', { name: /Cerrar ayuda/ }).click();
  await page.reload();
  await expect(help.locator('.contextual-help__panel')).toHaveCount(0);
  await page.getByRole('button', { name: /Ver guía/ }).click();
  await expect(help.locator('.contextual-help__panel')).toBeVisible();
});
