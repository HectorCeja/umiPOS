import { chromium, expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  browserAudit,
  createProductForOwnerTest,
  expectClean,
  web,
} from './owner-corrective.helpers';
import {
  completeCleanOnboarding,
  createCleanBusiness,
  loginClean,
} from './dynamic-context.helpers';

const root = path.resolve('artifacts/owner-final-acceptance-master-part-2a');
const evidenceMode = process.env.NEXO_E2E_ARTIFACT_MODE === 'evidence';
test('walkthrough Chromium real de bloqueadores Part 2A', async () => {
  test.setTimeout(120_000);
  execFileSync('pnpm', ['owner:alpha2:reset'], { stdio: 'pipe' });
  await mkdir(path.join(root, 'screenshots'), { recursive: true });
  await mkdir(path.join(root, 'videos'), { recursive: true });
  const browser = await chromium.launch();
  let context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...(evidenceMode
      ? { recordVideo: { dir: path.join(root, 'videos'), size: { width: 1440, height: 900 } } }
      : {}),
  });
  let page = await context.newPage();
  const audit = browserAudit(page);
  await page.goto(web);
  await page.evaluate(() => localStorage.removeItem('nexo.help.v2.login'));
  await page.reload();
  const help = page.getByRole('complementary', { name: 'Ayuda de Cómo iniciar sesión' });
  await expect(help.locator('.contextual-help__panel')).toBeVisible();
  await expect(help.locator('.contextual-help__panel a')).toHaveCount(0);
  await page.screenshot({ path: path.join(root, 'screenshots/01-login-sin-cta.png') });
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await expect(page.locator('.guided-onboarding')).toHaveAttribute('data-step', '0', {
    timeout: 20_000,
  });
  await page.screenshot({ path: path.join(root, 'screenshots/02-alpha2-paso-1.png') });
  expectClean(audit);
  await context.close();
  context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...(evidenceMode
      ? { recordVideo: { dir: path.join(root, 'videos'), size: { width: 1440, height: 900 } } }
      : {}),
  });
  page = await context.newPage();
  const authenticatedAudit = browserAudit(page);
  const fixture = createCleanBusiness();
  await loginClean(page, fixture.email);
  await completeCleanOnboarding(page, fixture.organizationId);
  await page.goto(`${web}/control-plane/inventory-locations`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Ubicaciones' })).toBeVisible();
  await page.screenshot({ path: path.join(root, 'screenshots/03-ubicaciones-configuracion.png') });
  const evidenceCode = `EVID-${Date.now()}`;
  await page.getByRole('textbox', { name: 'Nombre *' }).fill('Ubicación evidencia');
  await page.getByRole('textbox', { name: 'Código *' }).fill(evidenceCode);
  const createdLocation = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().includes('/inventory/locations'),
  );
  const createdLocationFinished = page.waitForEvent(
    'requestfinished',
    (request) => request.method() === 'POST' && request.url().includes('/inventory/locations'),
  );
  await page.getByRole('button', { name: 'Crear ubicación' }).click();
  expect((await createdLocation).status()).toBe(201);
  await createdLocationFinished;
  await expect(page.getByText('Ubicación creada y disponible en Inventario.')).toBeVisible();
  await expect(page.getByText(evidenceCode, { exact: false })).toBeVisible();
  await page.screenshot({ path: path.join(root, 'screenshots/03a-feedback-local-exito.png') });
  await page.getByRole('textbox', { name: 'Nombre *' }).fill('Ubicación duplicada');
  await page.getByRole('textbox', { name: 'Código *' }).fill(evidenceCode);
  await page.getByRole('button', { name: 'Crear ubicación' }).click();
  await expect(
    page.getByText('Ya existe una ubicación con ese código. Elige otro para continuar.'),
  ).toBeVisible();
  await page.screenshot({ path: path.join(root, 'screenshots/03b-feedback-local-error.png') });
  await page.goto(`${web}/inventory`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(root, 'screenshots/04-selector-ubicaciones.png') });
  await page.goto(`${web}/products`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(root, 'screenshots/05-servicio-icono-unico.png') });
  const card = await createProductForOwnerTest(page, 'Producto evidencia Part 2A');
  await card.click();
  await page.getByRole('button', { name: 'Editar producto' }).click();
  await page.screenshot({ path: path.join(root, 'screenshots/06-editor-producto-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(root, 'screenshots/07-editor-producto-movil-x.png') });
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Cerrar detalle del producto' }).click();
  await page.waitForLoadState('networkidle');
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(`${web}/cash`);
  await page.waitForLoadState('networkidle');
  const scroll = page.locator('.unified-content');
  await scroll.evaluate((node) => node.scrollTo(0, node.scrollHeight));
  await page.screenshot({
    path: path.join(root, 'screenshots/08-scroll-320-stepper.png'),
    fullPage: false,
  });
  expectClean(authenticatedAudit);
  const video = evidenceMode ? page.video() : null;
  await context.close();
  if (video) await video.saveAs(path.join(root, 'videos/owner-master-part2a.webm'));
  await browser.close();
});
