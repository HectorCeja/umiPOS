import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';
test('select base reserva inset para chevron con zoom', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/inventory`);
  const select = page.getByRole('combobox').first();
  await expect(select).toBeVisible();
  const style = await select.evaluate((node) => {
    const s = getComputedStyle(node);
    return { padding: s.paddingRight };
  });
  expect(parseFloat(style.padding)).toBeGreaterThanOrEqual(16);
  const [trigger, chevron] = await Promise.all([
    select.boundingBox(),
    select.locator(':scope > svg').boundingBox(),
  ]);
  expect(trigger!.x + trigger!.width - (chevron!.x + chevron!.width)).toBeGreaterThanOrEqual(12);
});
