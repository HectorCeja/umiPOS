import { expect, test } from '@playwright/test';
import { completeOnboarding, login, web } from './owner-corrective.helpers';

test('Cash feedback is visible without becoming an automatic scroll destination', async ({
  page,
}) => {
  await login(page);
  await completeOnboarding(page);
  await page.goto(`${web}/cash`);
  await page.getByText('Configurar puntos de cobro', { exact: true }).click();
  const suffix = Date.now().toString();
  await page.getByRole('combobox', { name: 'Nombre', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Buscar en Nombre' }).fill(`Caja scroll ${suffix}`);
  await page.keyboard.press('Enter');
  await page.getByLabel('Código', { exact: true }).fill(`SCR-${suffix}`);
  const before = await page.evaluate(() => window.scrollY);
  await page.getByRole('button', { name: 'Crear punto de cobro' }).click();
  const target = page.locator('.nexo-toast-region .nexo-premium-toast');
  await expect(target).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});
