import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { login, web } from './owner-corrective.helpers';

test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, video: 'off' });

test('Retina conserva bordes, radios, iconos y alineación', async ({ page }) => {
  test.setTimeout(90_000);
  await mkdir('artifacts/visual-perfection/screenshots', { recursive: true });
  await login(page);
  for (const [route, name] of [
    ['/products', 'products-retina'],
    ['/inventory', 'inventory-retina'],
    ['/control-plane/invitations', 'team-retina'],
    ['/control-plane/branches', 'branches-retina'],
  ] as const) {
    await page.goto(`${web}${route}`);
    await expect(page.getByText('Validando tu sesión…')).toBeHidden({ timeout: 15_000 });
    await expect(page.locator('main').first()).toBeVisible();
    await page.screenshot({
      path: `artifacts/visual-perfection/screenshots/${name}.png`,
      fullPage: true,
    });
    if (route === '/inventory') {
      const trigger = page.getByRole('combobox', { name: 'Producto o presentación' });
      await trigger.click();
      await expect(page.locator('.nexo-select-content')).toBeVisible();
      await page.screenshot({
        path: 'artifacts/visual-perfection/screenshots/nexoselect-motion-search-retina.png',
      });
      await page.keyboard.press('Escape');
    }
    expect(await page.evaluate(() => window.devicePixelRatio)).toBe(2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
  }
});
