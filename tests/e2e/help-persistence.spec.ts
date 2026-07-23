import { expect, test } from '@playwright/test';
import { enterAuthenticatedApp } from './premium-ux-part1b.helpers.js';

test('dismissed help persists, history records it and reset restores guidance', async ({
  page,
}) => {
  await enterAuthenticatedApp(page);
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('nexo.help.v2.')) localStorage.removeItem(key);
  });
  await page.reload();
  await page
    .locator('.contextual-help__panel')
    .getByRole('button', { name: /Cerrar ayuda/ })
    .click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('nexo.help.v2./'))).toBe('seen');
  await page.reload();
  await expect(page.locator('.contextual-help__panel')).not.toBeVisible();
  await page.goto('http://localhost:3000/help');
  await page.getByRole('button', { name: 'Restablecer ayudas y recorridos' }).click();
  await expect(page.getByText('Ayudas y recorridos restablecidos.')).toBeVisible();
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) => key.startsWith('nexo.help.v2.')),
    ),
  ).toEqual([]);
});
