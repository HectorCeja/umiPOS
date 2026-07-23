import { expect, test } from '@playwright/test';
import {
  browserAudit,
  expectClean,
  onePixelPng,
  setOnboardingStep,
  web,
} from './owner-corrective.helpers';

test('upload real conserva cada campo y el formulario montado', async ({ page }) => {
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.guided-onboarding').waitFor();
  const audit = browserAudit(page);
  await setOnboardingStep(page, 7);
  const builder = page.locator('.onboarding-product-builder');
  const values = { Nombre: 'Latte grande', Descripción: 'Leche y espresso', Precio: '78.50' };
  for (const [label, value] of Object.entries(values)) await builder.getByLabel(label).fill(value);
  await builder.getByLabel('Categoría').fill('Bebidas');
  await builder
    .locator('input[type=file]')
    .setInputFiles({ name: 'latte.png', mimeType: 'image/png', buffer: onePixelPng });
  await expect(builder.getByAltText('Vista previa')).toBeVisible();
  for (const [label, value] of Object.entries(values))
    await expect(builder.getByLabel(label)).toHaveValue(value);
  await expect(builder.getByLabel('Categoría')).toHaveValue('Bebidas');
  await expect(page.getByRole('button', { name: 'Atrás' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible();
  await expect(builder).not.toBeEmpty();
  expectClean(audit);
});
