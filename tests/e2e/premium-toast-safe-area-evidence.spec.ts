import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { login, web } from './owner-corrective.helpers';

const root = path.resolve('artifacts/premium-toast-safe-area/screenshots');

async function trigger(page: Page) {
  await login(page);
  await page.goto(`${web}/products`);
  await page.getByLabel('Nombre del producto').fill(`Safe area ${Date.now()}`);
  await page.getByRole('button', { name: 'Agregar al catálogo' }).click();
  await expect(page.locator('#nexo-toast-provider .nexo-premium-toast')).toBeVisible();
}

for (const viewport of [
  { width: 1280, height: 720, name: 'desktop' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 390, height: 844, name: 'mobile' },
]) {
  test(`evidencia safe area ${viewport.name}`, async ({ page }) => {
    test.setTimeout(60_000);
    await mkdir(root, { recursive: true });
    await page.setViewportSize(viewport);
    await trigger(page);
    await page.screenshot({
      path: path.join(root, `toast-safe-area-${viewport.name}.png`),
      animations: 'disabled',
    });
  });
}
