import { expect, test } from '@playwright/test';
import {
  loginIsolatedOnboarding,
  onePixelPng,
  setOnboardingStep,
} from './owner-corrective.helpers';

test('el diálogo real nunca queda vacío durante ni después del upload', async ({ page }) => {
  await loginIsolatedOnboarding(page);
  await setOnboardingStep(page, 7);
  const builder = page.locator('.onboarding-product-builder');
  await builder.getByLabel('Nombre').fill('Latte persistente');
  const busyWasVisible = page.evaluate(() => {
    return new Promise<boolean>((resolve) => {
      const observer = new MutationObserver(() => {
        if (document.querySelector('.nexo-file-upload__progress')) {
          observer.disconnect();
          resolve(true);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(false);
      }, 2_000);
    });
  });
  await builder.locator('input[type=file]').setInputFiles({
    name: 'latte.png',
    mimeType: 'image/png',
    buffer: onePixelPng,
  });
  expect(await busyWasVisible).toBe(true);
  await expect(builder).toBeVisible();
  await expect(
    builder.getByRole('heading', { name: /Agrega algo propio|Crea tu primer producto/ }),
  ).toBeVisible();
  await expect(builder.getByLabel('Nombre')).toHaveValue('Latte persistente');
  await expect(builder.getByAltText('Vista previa')).toBeVisible();
  const scrollArea = page.locator('.onboarding-scroll-container');
  expect((await scrollArea.boundingBox())?.height).toBeGreaterThan(190);
});
