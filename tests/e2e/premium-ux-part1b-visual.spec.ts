import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  completeOnboarding,
  loginIsolatedOnboarding,
  setOnboardingStep,
  web,
} from './owner-corrective.helpers.js';

const root = path.resolve('artifacts/premium-ux-part-1b/screenshots');
async function shot(page: import('@playwright/test').Page, folder: string, name: string) {
  const directory = path.join(root, folder);
  await mkdir(directory, { recursive: true });
  await page.screenshot({
    path: path.join(directory, `${name}.png`),
    fullPage: true,
    animations: 'disabled',
  });
}

test('capture certified component and layout surfaces', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(web);
  await shot(page, 'desktop', 'login');
  await loginIsolatedOnboarding(page);
  await setOnboardingStep(page, 4);
  await shot(page, 'desktop', 'onboarding');
  await completeOnboarding(page);

  for (const [name, route] of [
    ['dashboard', '/'],
    ['sales', '/sales'],
    ['cash', '/cash'],
    ['products', '/products'],
    ['inventory', '/inventory'],
    ['team', '/control-plane/invitations'],
    ['settings', '/control-plane/settings'],
    ['reports', '/reports'],
    ['help', '/help'],
  ] as const) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await shot(page, 'desktop', name);
  }
  await page.getByRole('button', { name: 'Abrir búsqueda global' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await shot(page, 'desktop', 'command-palette-modal');

  for (const [folder, width, height] of [
    ['tablet', 768, 1024],
    ['mobile', 390, 844],
    ['devtools', 980, 720],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto(`${web}/products`);
    await page.waitForLoadState('networkidle');
    await shot(page, folder, 'products');
    await page.goto(`${web}/sales`);
    await page.waitForLoadState('networkidle');
    await shot(page, folder, 'sales');
    await page.goto(web);
    await page.waitForLoadState('networkidle');
    await shot(page, folder, 'dashboard');
  }
});
