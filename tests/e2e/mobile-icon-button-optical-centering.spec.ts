import { expect, test } from '@playwright/test';
import { web } from './owner-corrective.helpers';
test('hamburger y X comparten centro geométrico', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.product-main').waitFor();
  const trigger = page.getByRole('button', { name: 'Abrir navegación' });
  async function expectCentered(button: typeof trigger) {
    const box = await button.boundingBox();
    const icon = await button.locator('svg').boundingBox();
    expect(box && icon).toBeTruthy();
    expect(Math.abs(box!.x + box!.width / 2 - (icon!.x + icon!.width / 2))).toBeLessThanOrEqual(1);
    expect(Math.abs(box!.y + box!.height / 2 - (icon!.y + icon!.height / 2))).toBeLessThanOrEqual(
      1,
    );
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  await expectCentered(trigger);
  await trigger.click();
  await expectCentered(page.locator('.mobile-nav-close'));
});
