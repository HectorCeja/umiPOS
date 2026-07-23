import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { onePixelPng, setOnboardingStep, web } from './owner-corrective.helpers';

test('todos los valores sobreviven al upload real del catálogo', async ({ page }) => {
  execFileSync('pnpm', ['owner:alpha2:reset'], { stdio: 'pipe' });
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.guided-onboarding').waitFor();
  await setOnboardingStep(page, 7);
  const form = page.locator('.onboarding-product-builder');
  const fields = {
    Nombre: 'Tisana real',
    Categoría: 'Bebidas',
    'Precio sugerido (MXN)': '89.50',
    Descripción: 'Frutos rojos de temporada',
    'SKU (opcional)': 'TIS-REAL',
    'Código de barras (opcional)': '7501234567890',
  };
  for (const [label, value] of Object.entries(fields)) await form.getByLabel(label).fill(value);
  await form.getByRole('button', { name: 'Usar icono Bebida' }).click();
  await form
    .locator('input[type=file]')
    .setInputFiles({ name: 'tisana.png', mimeType: 'image/png', buffer: onePixelPng });
  for (const [label, value] of Object.entries(fields))
    await expect(form.getByLabel(label)).toHaveValue(value);
  await expect(form.getByRole('button', { name: 'Usar icono Bebida' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(form.getByAltText('Vista previa')).toBeVisible();
});
