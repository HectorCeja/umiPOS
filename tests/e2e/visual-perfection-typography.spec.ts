import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('labels de iconos de Producto conservan palabras completas', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/products`);
  const buttons = page.locator('.product-icon-picker button');
  await expect(buttons.first()).toBeVisible();
  for (const button of await buttons.all()) {
    const metrics = await button.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        scrollWidth: node.scrollWidth,
        clientWidth: node.clientWidth,
        wordBreak: style.wordBreak,
        hyphens: style.hyphens,
        fontSize: Number.parseFloat(style.fontSize),
      };
    });
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.wordBreak).not.toBe('break-all');
    expect(metrics.hyphens).toBe('none');
    expect(metrics.fontSize).toBeLessThanOrEqual(13);
  }
});
