import { expect, test } from '@playwright/test';
import {
  browserAudit,
  chooseCustomNexoSelect,
  expectClean,
  onePixelPng,
  setOnboardingStep,
} from './owner-corrective.helpers';
import { createCleanBusiness, loginClean } from './dynamic-context.helpers';

test('el diálogo exacto de onboarding permanece completo tras seleccionar una imagen', async ({
  page,
}) => {
  const fixture = createCleanBusiness();
  const audit = browserAudit(page);
  await loginClean(page, fixture.email);
  await page.locator('.guided-onboarding').waitFor();
  await setOnboardingStep(page, 7);
  const dialog = page.locator('.onboarding-content');
  const form = dialog.locator('.onboarding-product-builder');
  const values = ['Latte final', '84.50', 'Receta de la casa', 'LAT-FINAL', '7501234567001'];
  const fields = [
    'Nombre',
    'Precio sugerido (MXN)',
    'Descripción',
    'SKU (opcional)',
    'Código de barras (opcional)',
  ];
  for (let index = 0; index < fields.length; index += 1)
    await form.getByLabel(fields[index]!).fill(values[index]!);
  await chooseCustomNexoSelect(page, 'Categoría', 'Bebidas');
  await form.evaluate((element) =>
    element.setAttribute('data-owner-instance', crypto.randomUUID()),
  );
  const identity = await form.getAttribute('data-owner-instance');
  await form.locator('input[type=file]').setInputFiles({
    name: 'latte.png',
    mimeType: 'image/png',
    buffer: Buffer.concat([onePixelPng, Buffer.alloc(500_000)]),
  });
  await expect(form.getByAltText('Vista previa')).toBeVisible();
  await expect(form).toHaveAttribute('data-owner-instance', identity!);
  await expect(dialog.locator('.onboarding-scroll-container')).not.toBeEmpty();
  for (let index = 0; index < fields.length; index += 1)
    await expect(form.getByLabel(fields[index]!)).toHaveValue(values[index]!);
  await expect(form.getByRole('combobox', { name: 'Categoría' })).toHaveText('Bebidas');
  await expect(form.getByText('Reemplazar imagen')).toBeVisible();
  await expect(form.getByRole('button', { name: 'Eliminar imagen' })).toBeVisible();
  expectClean(audit);
});
