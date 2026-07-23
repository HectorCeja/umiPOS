import { expect, test } from '@playwright/test';
import { completeOnboarding, login, web } from './owner-corrective.helpers';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`contextual help stays inside ${viewport.width}px viewport`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await login(page);
    await completeOnboarding(page);
    await page.goto(`${web}/products`);
    const trigger = page.getByRole('button', { name: /Ver guía/ });
    if ((await trigger.getAttribute('aria-expanded')) !== 'true') await trigger.click();
    const box = await page.locator('.contextual-help__panel').boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
  });
}
