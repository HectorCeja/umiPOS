import { expect, test } from '@playwright/test';
import { loginIsolatedOnboarding, setOnboardingStep } from './owner-corrective.helpers';
test('cada SVG está centrado respecto a su NexoIconChoice', async ({ page }) => {
  await loginIsolatedOnboarding(page);
  await setOnboardingStep(page, 7);
  for (const button of await page.locator('.icon-choice-grid button').all()) {
    const centers = await button.evaluate((element) => {
      const a = element.getBoundingClientRect();
      const b = element.querySelector('svg')!.getBoundingClientRect();
      return {
        dx: Math.abs(a.x + a.width / 2 - (b.x + b.width / 2)),
        dy: Math.abs(a.y + a.height / 2 - (b.y + b.height / 2)),
      };
    });
    expect(centers.dx).toBeLessThanOrEqual(1);
    expect(centers.dy).toBeLessThanOrEqual(1);
  }
});
