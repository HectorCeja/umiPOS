import { chromium } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';
const organizationId = '10000000-0000-4000-8000-000000000001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const output = 'artifacts/ui-part-2/videos';
const temporary = `${output}/.raw`;
await rm(temporary, { recursive: true, force: true });
await mkdir(temporary, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function authenticatedContext(
  viewport = { width: 1440, height: 900 },
  reducedMotion = 'no-preference',
) {
  const context = await browser.newContext({
    viewport,
    reducedMotion,
    recordVideo: { dir: temporary, size: viewport },
  });
  const login = await context.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email: 'alpha.owner@nexo.local',
      password,
      deviceFingerprint: `ui2-video-${crypto.randomUUID()}`,
      deviceName: 'UI Parte 2 video evidence',
    },
  });
  if (!login.ok()) throw new Error(`Video login failed: ${String(login.status())}`);
  return context;
}

async function capture(name, route, action, viewport, reducedMotion) {
  const context = await authenticatedContext(viewport, reducedMotion);
  const page = await context.newPage();
  await page.goto(`${web}${route}`);
  await page.waitForLoadState('networkidle');
  if (action) await action(page);
  await page.waitForTimeout(reducedMotion === 'reduce' ? 500 : 1800);
  const video = page.video();
  await context.close();
  if (video) await video.saveAs(`${output}/${name}.webm`);
}

async function captureOnboarding(name, targetStep) {
  const context = await authenticatedContext();
  const page = await context.newPage();
  const stateResponse = await context.request.get(
    `${api}/v1/organizations/${organizationId}/onboarding`,
  );
  const state = await stateResponse.json();
  const csrf = (await context.cookies()).find((cookie) => cookie.name === 'nexo_csrf')?.value ?? '';
  const reset = await context.request.post(
    `${api}/v1/organizations/${organizationId}/onboarding/restart`,
    { headers: { 'x-csrf-token': csrf }, data: { version: state.version } },
  );
  if (!reset.ok()) throw new Error(`Onboarding restart failed: ${String(reset.status())}`);
  await page.goto(web);
  for (let step = 1; step <= targetStep; step += 1) {
    await page.getByRole('button', { name: 'Guardar y continuar' }).click();
    await page.locator('.guided-onboarding').waitFor();
  }
  await page.waitForTimeout(1400);
  for (let step = targetStep + 1; step <= 10; step += 1) {
    await page.getByRole('button', { name: 'Guardar y continuar' }).click();
  }
  await page.getByRole('button', { name: 'Ir a mi inicio' }).click();
  await page.locator('.product-main').waitFor();
  const video = page.video();
  await context.close();
  if (video) await video.saveAs(`${output}/${name}.webm`);
}

await captureOnboarding('onboarding-complete', 10);
await captureOnboarding('schedule-editor', 5);
await capture('living-scene-modules', '/reports', async (page) => {
  await page.mouse.move(1100, 340);
});
await capture('catalog-selection', '/products', async (page) => {
  await page
    .locator('.product-list article')
    .first()
    .hover()
    .catch(() => undefined);
});
await capture('create-product', '/products#new-product', async (page) => {
  await page.getByLabel('Nombre del producto').focus();
});
await capture('inventory', '/inventory', async (page) => {
  await page.getByLabel('Variante del producto').focus();
});
await capture('sales-detail', '/sales', async (page) => {
  await page.getByRole('button', { name: 'Actualizar' }).hover();
});
await capture('cash-operation', '/cash', async (page) => {
  await page
    .getByRole('heading', { name: /Caja/ })
    .focus()
    .catch(() => undefined);
});
await capture('reports', '/reports', async (page) => {
  await page.locator('.report-kpis article').first().hover();
});
await capture('command-palette', '/reports', async (page) => {
  await page.keyboard.press('Control+K');
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('ArrowDown');
});
await capture('team', '/control-plane/invitations', async (page) => {
  await page.getByLabel('Correo electrónico').focus();
});
await capture('responsive-mobile', '/inventory', undefined, { width: 390, height: 844 });
await capture('reduced-motion', '/reports', undefined, { width: 1440, height: 900 }, 'reduce');

await browser.close();
