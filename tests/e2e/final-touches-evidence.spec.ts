import { expect, test, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  chooseCustomNexoSelect,
  chooseNexoSelect,
  ensureInventoryLocation,
  login,
  onePixelPng,
  setOnboardingStep,
  web,
} from './owner-corrective.helpers';

const screenshots = path.resolve(
  'artifacts/owner-final-acceptance-master-final-touches/screenshots',
);
test.use({ video: 'on' });

async function shot(page: Page, name: string) {
  await mkdir(screenshots, { recursive: true });
  await page.screenshot({ path: path.join(screenshots, name), animations: 'disabled' });
}

test('evidencia final upload onboarding sin desmontaje', async ({ page }) => {
  execFileSync('pnpm', ['owner:alpha2:reset'], { stdio: 'pipe' });
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.guided-onboarding').waitFor();
  await setOnboardingStep(page, 7);
  const form = page.locator('.onboarding-product-builder');
  await form.getByLabel('Nombre').fill('Producto Final Touches');
  await chooseCustomNexoSelect(page, 'Categoría', 'Especialidades');
  await form.getByLabel('Precio sugerido (MXN)').fill('95');
  await form.getByLabel('Descripción').fill('Producto real con imagen persistente');
  await shot(page, '01-onboarding-upload-antes.png');
  const uploading = form.locator('input[type=file]').setInputFiles({
    name: 'final-product.png',
    mimeType: 'image/png',
    buffer: Buffer.concat([onePixelPng, Buffer.alloc(700_000)]),
  });
  await shot(page, '02-onboarding-upload-durante.png');
  await uploading;
  await expect(form.getByAltText('Vista previa')).toBeVisible();
  await shot(page, '03-onboarding-upload-despues.png');
  await form.getByRole('button', { name: 'Eliminar imagen' }).click();
  await expect(form.getByText('Elegir archivo')).toBeVisible();
  await shot(page, '04-onboarding-upload-eliminable.png');
});

test('evidencia toast global e Inventario premium', async ({ page }) => {
  await login(page);
  await ensureInventoryLocation(page);
  await page.goto(`${web}/inventory`);
  await shot(page, '05-select-padding-final.png');
  await chooseNexoSelect(page, 'Producto o presentación', 0);
  await chooseNexoSelect(page, 'Ubicación de inventario', 0);
  await page.getByRole('button', { name: 'Consultar existencias' }).click();
  await expect(page.locator('.inventory-availability')).toHaveClass(/is-highlighted/);
  await expect
    .poll(async () => (await page.locator('.inventory-availability').boundingBox())?.y ?? 9999)
    .toBeLessThan(page.viewportSize()!.height);
  await shot(page, '06-inventario-saldo-premium-highlight.png');
  await page.goto(`${web}/products`);
  await page.locator('.product-catalog-card').first().click();
  await page.getByRole('button', { name: 'Editar producto' }).click();
  const name = page.getByLabel('Nombre').last();
  await name.fill(`${await name.inputValue()} `);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.locator('body > .nexo-toast-region .nexo-premium-toast').last()).toBeVisible();
  await shot(page, '07-premium-toast-productos.png');
});
