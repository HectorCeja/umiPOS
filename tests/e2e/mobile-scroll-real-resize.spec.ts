import { expect, test } from '@playwright/test';
import { web } from './owner-corrective.helpers';
for (const width of [280, 320, 360, 390, 412])
  test(`resize real ${width}px alcanza el final`, async ({ page }) => {
    await page.goto(`${web}/login`);
    await page.getByLabel('Correo electrónico').fill('alpha.owner@nexo.local');
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
    await page.locator('.product-main').waitFor();
    await page.goto(`${web}/products`);
    await page.setViewportSize({ width, height: 653 });
    const scrollRoot = page.locator('#main-content');
    await expect(scrollRoot).toBeVisible();
    await scrollRoot.focus();
    await page.keyboard.press('End');
    await expect
      .poll(
        () =>
          scrollRoot.evaluate(
            (node) => node.scrollTop + node.clientHeight >= node.scrollHeight - 2,
          ),
        { timeout: 3_000 },
      )
      .toBe(true);
    const metric = await scrollRoot.evaluate((node) => ({
      bottom: node.scrollTop + node.clientHeight,
      height: node.scrollHeight,
      horizontal: node.scrollWidth - node.clientWidth,
    }));
    expect(metric.bottom).toBeGreaterThanOrEqual(metric.height - 2);
    expect(metric.horizontal).toBeLessThanOrEqual(2);
    const menu = page.getByRole('button', { name: 'Abrir navegación' });
    await menu.click();
    await page.locator('.mobile-nav-close').click();
    await scrollRoot.evaluate((node) => node.scrollTo(0, node.scrollHeight));
    expect(
      await scrollRoot.evaluate(
        (node) => node.scrollTop + node.clientHeight >= node.scrollHeight - 2,
      ),
    ).toBe(true);
  });
