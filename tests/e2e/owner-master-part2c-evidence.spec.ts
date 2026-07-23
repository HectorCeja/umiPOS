import { expect, test, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { login, onePixelPng, setOnboardingStep, web } from './owner-corrective.helpers';

const root = path.resolve('artifacts/owner-final-acceptance-master-part-2c/screenshots');
test.use({ video: 'on' });
async function shot(page: Page, name: string, fullPage = false) {
  await mkdir(root, { recursive: true });
  await page.screenshot({ path: path.join(root, name), fullPage, animations: 'disabled' });
}
async function alpha2(page: Page, step: number) {
  execFileSync('pnpm', ['owner:alpha2:reset'], { stdio: 'pipe' });
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.guided-onboarding').waitFor();
  await setOnboardingStep(page, step);
}

test('video onboarding, validación, selects, iconos y upload estable', async ({ page }) => {
  await alpha2(page, 1);
  await page.getByLabel('Nombre comercial *').fill('');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await shot(page, '01-business-name-required.png');
  await setOnboardingStep(page, 3);
  await shot(page, '02-onboarding-selects-single-chevron.png');
  await setOnboardingStep(page, 7);
  const builder = page.locator('.onboarding-product-builder');
  await builder.getByLabel('Nombre').fill('Latte del owner');
  await builder.getByLabel('Categoría').fill('Bebidas');
  await builder.getByLabel('Precio sugerido (MXN)').fill('79');
  await builder.getByLabel('Descripción').fill('Espresso y leche');
  await builder.getByLabel('SKU (opcional)').fill('LAT-OWNER');
  await builder.getByLabel('Código de barras (opcional)').fill('750000000001');
  await shot(page, '03-onboarding-before-upload.png');
  const upload = builder.locator('input[type=file]').setInputFiles({
    name: 'latte-owner.png',
    mimeType: 'image/png',
    buffer: Buffer.concat([onePixelPng, Buffer.alloc(700_000)]),
  });
  await shot(page, '04-onboarding-during-upload.png');
  await upload;
  await expect(builder.getByAltText('Vista previa')).toBeVisible();
  await shot(page, '05-onboarding-after-upload-dialog-complete.png');
  await shot(page, '06-onboarding-icons-centered.png');
  await builder.locator('input[type=file]').setInputFiles({
    name: 'invalid.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('no image'),
  });
  await expect(builder.getByRole('alert')).toBeVisible();
  await shot(page, '07-onboarding-upload-error-recoverable.png');
});

test('video toast viewport-fixed desktop y móvil', async ({ page }) => {
  await login(page);
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 640 });
    await page.goto(`${web}/cash`);
    await page.getByText('Configurar puntos de cobro', { exact: true }).click();
    const suffix = `${width}-${Date.now()}`;
    await page.getByLabel('Nombre', { exact: true }).fill(`Caja evidencia ${suffix}`);
    await page.getByLabel('Código', { exact: true }).fill(`EV-${suffix}`);
    await page.evaluate(() => {
      const elements = [
        document.scrollingElement,
        ...document.querySelectorAll<HTMLElement>('*'),
      ].filter(Boolean) as HTMLElement[];
      const target = elements.sort(
        (a, b) => b.scrollHeight - b.clientHeight - (a.scrollHeight - a.clientHeight),
      )[0]!;
      target.scrollTop = target.scrollHeight;
    });
    await page
      .getByRole('button', { name: 'Crear punto de cobro' })
      .evaluate((element: HTMLButtonElement) => {
        element.click();
      });
    await expect(page.locator('body > .nexo-toast-region')).toBeVisible();
    await shot(page, `08-cash-toast-fixed-${width}.png`);
  }
});

test('video selects transversales en editor e Inventario', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/products`);
  await page
    .locator('.product-catalog-card')
    .filter({ hasText: 'Producto persistente owner' })
    .click();
  await page.getByRole('button', { name: 'Editar producto' }).click();
  await shot(page, '09-product-editor-select-single-chevron.png');
  await page.goto(`${web}/inventory`);
  await shot(page, '10-inventory-selects-single-chevron.png');
});
