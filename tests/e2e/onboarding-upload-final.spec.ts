import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import {
  browserAudit,
  expectClean,
  onePixelPng,
  setOnboardingStep,
  web,
} from './owner-corrective.helpers';

test('el diálogo exacto de onboarding permanece completo tras seleccionar una imagen', async ({
  page,
}) => {
  execFileSync('pnpm', ['owner:alpha2:reset'], { stdio: 'pipe' });
  const audit = browserAudit(page);
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.guided-onboarding').waitFor();
  await setOnboardingStep(page, 7);
  const dialog = page.locator('.onboarding-content');
  const form = dialog.locator('.onboarding-product-builder');
  const values = [
    'Latte final',
    'Bebidas',
    '84.50',
    'Receta de la casa',
    'LAT-FINAL',
    '7501234567001',
  ];
  const fields = [
    'Nombre',
    'Categoría',
    'Precio sugerido (MXN)',
    'Descripción',
    'SKU (opcional)',
    'Código de barras (opcional)',
  ];
  for (let index = 0; index < fields.length; index += 1)
    await form.getByLabel(fields[index]!).fill(values[index]!);
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
  await expect(form.getByText('Reemplazar imagen')).toBeVisible();
  await expect(form.getByRole('button', { name: 'Eliminar imagen' })).toBeVisible();
  expectClean(audit);
});
