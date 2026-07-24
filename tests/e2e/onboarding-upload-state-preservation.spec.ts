import { expect, test } from '@playwright/test';
import { chooseCustomNexoSelect, onePixelPng, setOnboardingStep } from './owner-corrective.helpers';
import { createCleanBusiness, loginClean } from './dynamic-context.helpers';

test('todos los valores sobreviven al upload real del catálogo', async ({ page }) => {
  const fixture = createCleanBusiness();
  await loginClean(page, fixture.email);
  await page.locator('.guided-onboarding').waitFor();
  await setOnboardingStep(page, 7);
  const form = page.locator('.onboarding-product-builder');
  const fields = {
    Nombre: 'Tisana real',
    'Precio sugerido (MXN)': '89.50',
    Descripción: 'Frutos rojos de temporada',
    'SKU (opcional)': 'TIS-REAL',
    'Código de barras (opcional)': '7501234567890',
  };
  for (const [label, value] of Object.entries(fields)) await form.getByLabel(label).fill(value);
  await chooseCustomNexoSelect(page, 'Categoría', 'Bebidas');
  await form.getByRole('button', { name: 'Usar icono Bebida' }).click();
  await form
    .locator('input[type=file]')
    .setInputFiles({ name: 'tisana.png', mimeType: 'image/png', buffer: onePixelPng });
  for (const [label, value] of Object.entries(fields))
    await expect(form.getByLabel(label)).toHaveValue(value);
  await expect(form.getByRole('combobox', { name: 'Categoría' })).toHaveText('Bebidas');
  await expect(form.getByRole('button', { name: 'Usar icono Bebida' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(form.getByAltText('Vista previa')).toBeVisible();
});
