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
    await page.waitForTimeout(150);
    await page.keyboard.press('End');
    await expect
      .poll(
        () =>
          page.evaluate(
            () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2,
          ),
        { timeout: 3_000 },
      )
      .toBe(true);
    const metric = await page.evaluate(() => ({
      bottom: window.scrollY + window.innerHeight,
      height: document.documentElement.scrollHeight,
      horizontal: document.documentElement.scrollWidth - window.innerWidth,
    }));
    expect(metric.bottom).toBeGreaterThanOrEqual(metric.height - 2);
    expect(metric.horizontal).toBeLessThanOrEqual(2);
    const menu = page.getByRole('button', { name: 'Abrir navegación' });
    await menu.click();
    await page.locator('.mobile-nav-close').click();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    expect(
      await page.evaluate(
        () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2,
      ),
    ).toBe(true);
  });
