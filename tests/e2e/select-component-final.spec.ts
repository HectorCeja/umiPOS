import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('Select base conserva padding editorial y un único chevron', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/inventory`);
  const select = page.getByLabel('Producto o presentación');
  const style = await select.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      left: parseFloat(computed.paddingLeft),
      right: parseFloat(computed.paddingRight),
    };
  });
  expect(style.left).toBeGreaterThanOrEqual(16);
  expect(style.right).toBeGreaterThanOrEqual(16);
  await expect(select.locator(':scope > svg')).toHaveCount(1);
});
