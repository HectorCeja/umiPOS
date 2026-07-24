import { expect, test } from '@playwright/test';
import {
  browserAudit,
  evidence,
  expectClean,
  loginIsolatedOnboarding,
  setOnboardingStep,
} from './owner-corrective.helpers';

test('catalog controls align and category chips wrap with readable spacing', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loginIsolatedOnboarding(page);
  await setOnboardingStep(page, 7);
  const audit = browserAudit(page);
  const toolbar = page.locator('.nexo-gallery-picker__toolbar');
  const filters = page.locator('.nexo-gallery-picker__filters');
  await expect(toolbar).toBeVisible();
  await expect(filters.getByRole('button')).toHaveCount(6);
  const styles = await filters.evaluate((node) => {
    const computed = getComputedStyle(node);
    return { gap: computed.gap, wrap: computed.flexWrap };
  });
  expect(styles.wrap).toBe('wrap');
  expect(Number.parseFloat(styles.gap)).toBeGreaterThanOrEqual(8);
  const centers = await Promise.all(
    [
      toolbar.getByLabel('Buscar sugerencias'),
      toolbar.getByText('3 seleccionados'),
      toolbar.getByRole('button', { name: 'Seleccionar todos' }),
    ].map(async (locator) => {
      const box = await locator.boundingBox();
      return (box?.y ?? 0) + (box?.height ?? 0) / 2;
    }),
  );
  expect(Math.max(...centers) - Math.min(...centers)).toBeLessThan(18);
  await evidence(page, 'onboarding-catalog-alignment.png');
  expectClean(audit);
});
