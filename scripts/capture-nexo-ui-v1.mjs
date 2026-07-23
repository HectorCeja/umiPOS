import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const origin = process.env.NEXO_WEB_URL ?? 'http://localhost:3000';
const api = process.env.NEXO_API_URL ?? 'http://localhost:3001';
const output = 'artifacts/nexo-ui-v1';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function shot(page, name, fullPage = true) {
  await page.screenshot({ path: `${output}/${name}.png`, fullPage, animations: 'disabled' });
}

const anonymous = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await anonymous.goto(origin);
await anonymous.getByRole('heading', { name: 'Inicia sesión en NEXO' }).waitFor();
await shot(anonymous, 'login');
await anonymous.close();

const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const login = await context.request.post(`${api}/v1/auth/login`, {
  headers: { origin: 'http://localhost:3000' },
  data: {
    email: 'alpha.owner@nexo.local',
    password,
    deviceFingerprint: `nexo-ui-v1-${Date.now()}`,
    deviceName: 'Capturas UI V1',
  },
});
if (!login.ok()) throw new Error(`No fue posible iniciar sesión: ${String(login.status())}`);
const onboardingState = await context.request.get(
  `${api}/v1/organizations/10000000-0000-4000-8000-000000000001/onboarding`,
);
const onboardingValue = await onboardingState.json();
const csrf = (await context.cookies()).find((cookie) => cookie.name === 'nexo_csrf')?.value ?? '';
const restart = await context.request.post(
  `${api}/v1/organizations/10000000-0000-4000-8000-000000000001/onboarding/restart`,
  { headers: { 'x-csrf-token': csrf }, data: { version: onboardingValue.version } },
);
if (!restart.ok())
  throw new Error(`No fue posible preparar onboarding: ${String(restart.status())}`);
const page = await context.newPage();

for (const [name, route] of [
  ['ventas', '/sales'],
  ['caja', '/cash'],
  ['productos-grid', '/products'],
  ['producto-nuevo', '/products'],
  ['inventario', '/inventory'],
  ['equipo', '/control-plane/invitations'],
  ['configuracion', '/control-plane/settings'],
  ['perfil', '/settings/profile'],
]) {
  await page.goto(`${origin}${route}`);
  await page.locator('.product-shell').waitFor();
  await shot(page, name);
}

await page.goto(`${origin}/`);
await page.locator('.guided-onboarding, .product-main').first().waitFor();
if (await page.locator('.guided-onboarding').isVisible()) {
  await shot(page, 'onboarding-bienvenida');
  await page.getByRole('button', { name: 'Guardar y continuar' }).click();
  await shot(page, 'onboarding-negocio');
  for (let index = 0; index < 4; index += 1)
    await page.getByRole('button', { name: 'Guardar y continuar' }).click();
  await shot(page, 'onboarding-horarios');
  await page.getByRole('button', { name: 'Guardar y continuar' }).click();
  await page.getByRole('button', { name: 'Guardar y continuar' }).click();
  await shot(page, 'onboarding-catalogo');
  await page.getByLabel('Cómo comenzar').selectOption('empty');
  await shot(page, 'crear-producto-personalizado');
  for (let index = 0; index < 3; index += 1)
    await page.getByRole('button', { name: 'Guardar y continuar' }).click();
  await shot(page, 'onboarding-revision');
  await page.getByRole('button', { name: 'Guardar y continuar' }).click();
  await page.getByRole('button', { name: 'Ir a mi inicio' }).click();
}
await page.getByRole('heading', { name: /Buenos días/ }).waitFor();
await shot(page, 'home-poblado');
await shot(page, 'desktop');
await page.keyboard.press('Control+K');
await page.getByRole('dialog').waitFor();
await shot(page, 'command-palette', false);
await page.keyboard.press('Escape');
await page.getByRole('button', { name: /Héctor/ }).click();
await shot(page, 'menu-usuario', false);
await page.keyboard.press('Escape');

await page.setViewportSize({ width: 820, height: 1180 });
await page.goto(`${origin}/sales`);
await shot(page, 'tablet');
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${origin}/`);
await shot(page, 'movil');
await page.emulateMedia({ reducedMotion: 'reduce' });
await shot(page, 'reduced-motion');

await context.close();

// Organization Beta is the real isolated empty-state fixture. Capture its Home
// without intercepting requests or fabricating client data.
const emptyContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const emptyLogin = await emptyContext.request.post(`${api}/v1/auth/login`, {
  headers: { origin: 'http://localhost:3000' },
  data: {
    email: 'beta.owner@nexo.local',
    password,
    deviceFingerprint: `nexo-ui-v1-empty-${Date.now()}`,
    deviceName: 'Captura de estado vacío UI V1',
  },
});
if (!emptyLogin.ok())
  throw new Error(`No fue posible iniciar la sesión Beta: ${String(emptyLogin.status())}`);
const emptyPage = await emptyContext.newPage();
await emptyPage.goto(origin);
await emptyPage.locator('body').waitFor();
await emptyPage.waitForLoadState('networkidle');
await shot(emptyPage, 'home-empty');
await emptyContext.close();
await browser.close();
