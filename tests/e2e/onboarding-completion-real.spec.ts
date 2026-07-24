import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import {
  browserAudit,
  chooseCustomNexoSelect,
  expectClean,
  onePixelPng,
  web,
} from './owner-corrective.helpers';

test('Alpha2 completa onboarding real con producto e imagen', async ({ page }) => {
  test.setTimeout(180_000);
  execFileSync('pnpm', ['owner:alpha2:reset'], { stdio: 'pipe' });
  const audit = browserAudit(page);
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await expect(page.locator('.guided-onboarding')).toHaveAttribute('data-step', '0');
  await page.getByRole('button', { name: 'Empezar' }).click();
  await page.getByLabel('Nombre comercial').fill(`Café Alpha2 ${Date.now().toString()}`);
  for (let step = 1; step < 7; step += 1) {
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.locator('.guided-onboarding')).toHaveAttribute('data-step', String(step + 1));
  }
  const builder = page.locator('.onboarding-product-builder');
  await builder.getByLabel('Nombre').fill('Latte grande');
  await builder.getByLabel('Descripción').fill('Espresso y leche');
  await chooseCustomNexoSelect(page, 'Categoría', 'Bebidas');
  await builder.getByLabel('Precio').fill('78.50');
  await builder
    .locator('input[type=file]')
    .setInputFiles({ name: 'latte.png', mimeType: 'image/png', buffer: onePixelPng });
  await expect(builder.getByAltText('Vista previa')).toBeVisible();
  for (let step = 7; step < 10; step += 1) {
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.locator('.guided-onboarding')).toHaveAttribute('data-step', String(step + 1));
  }
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await expect(page.locator('.product-main')).toBeVisible({ timeout: 60_000 });
  expectClean(audit);
});
