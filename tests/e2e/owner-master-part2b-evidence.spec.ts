import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  chooseCustomNexoSelect,
  login,
  onePixelPng,
  setOnboardingStep,
  web,
} from './owner-corrective.helpers';

const root = path.resolve('artifacts/owner-final-acceptance-master-part-2b/screenshots');
test.use({ video: 'on' });

async function shot(page: import('@playwright/test').Page, name: string, fullPage = true) {
  await mkdir(root, { recursive: true });
  await page.screenshot({ path: path.join(root, name), fullPage, animations: 'disabled' });
}

test('evidencia onboarding con imagen y salida', async ({ page }) => {
  execFileSync('pnpm', ['owner:alpha2:reset'], { stdio: 'pipe' });
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.guided-onboarding').waitFor();
  await setOnboardingStep(page, 7);
  const form = page.locator('.onboarding-product-builder');
  await form.getByLabel('Nombre').fill('Latte de evidencia');
  await form.getByLabel('Descripción').fill('Espresso y leche');
  await form.getByLabel('Precio').fill('78.50');
  await chooseCustomNexoSelect(page, 'Categoría', 'Bebidas');
  await shot(page, '01-onboarding-before-upload.png');
  const uploading = form.locator('input[type=file]').setInputFiles({
    name: 'latte.png',
    mimeType: 'image/png',
    buffer: onePixelPng,
  });
  await shot(page, '02-onboarding-during-upload.png');
  await uploading;
  await expect(form.getByAltText('Vista previa')).toBeVisible();
  await shot(page, '03-onboarding-after-upload.png');
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
  await shot(page, '04-onboarding-logout-and-icons.png');
});

test('evidencia Caja toast y grid', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/cash`);
  await page.getByText('Configurar puntos de cobro', { exact: true }).click();
  const suffix = Date.now().toString();
  await chooseCustomNexoSelect(page, 'Nombre', `Caja Evidencia ${suffix}`);
  await page.getByLabel('Código', { exact: true }).fill(`EVI-${suffix}`);
  await page.getByRole('button', { name: 'Crear punto de cobro' }).click();
  await expect(page.locator('.nexo-premium-toast')).toBeVisible();
  await shot(page, '05-cash-premium-toast-success.png');
  await page.getByText('Movimientos y cierre', { exact: true }).click();
  await shot(page, '06-cash-movement-grid-aligned.png');
});

test('evidencia móvil scroll e icon buttons', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/products`);
  for (const width of [280, 320, 360, 390, 412]) {
    await page.setViewportSize({ width, height: 653 });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await shot(page, `07-mobile-${width}-bottom.png`, false);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, '08-mobile-hamburger-centered.png', false);
  await page.getByRole('button', { name: 'Abrir navegación' }).click();
  await shot(page, '09-mobile-close-centered.png', false);
});
