import { expect, test } from '@playwright/test';
import { enterAuthenticatedApp } from './premium-ux-part1b.helpers.js';

test('contextual help teaches start and next action and remains reopenable', async ({ page }) => {
  await enterAuthenticatedApp(page);
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('nexo.help.v2.')) localStorage.removeItem(key);
  });
  await page.reload();
  const panel = page.locator('.contextual-help__panel');
  await expect(panel).toBeVisible();
  await expect(panel.getByText('Empieza aquí:')).toBeVisible();
  await expect(panel.getByText('Después:')).toBeVisible();
  await panel.getByRole('button', { name: /Cerrar ayuda/ }).click();
  await page.getByRole('button', { name: /Ver guía/ }).click();
  await expect(panel).toBeVisible();
});
