import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('buscador de NexoSelect reutiliza geometría y foco de Input NEXO', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/inventory`);
  await page.getByRole('combobox', { name: 'Producto o presentación' }).click();
  const search = page.locator('.nexo-select-search');
  const input = search.getByRole('searchbox');
  await expect(search).toBeVisible();
  const style = await search.evaluate((node) => {
    const computed = getComputedStyle(node);
    return {
      radius: Number.parseFloat(computed.borderRadius),
      height: node.getBoundingClientRect().height,
      border: computed.borderStyle,
      background: computed.backgroundColor,
    };
  });
  expect(style.radius).toBeGreaterThanOrEqual(8);
  expect(style.height).toBeGreaterThanOrEqual(42);
  expect(style.border).toBe('solid');
  expect(style.background).not.toBe('rgba(0, 0, 0, 0)');
  await input.focus();
  await expect(search).toHaveCSS('border-color', /rgb/u);
});
