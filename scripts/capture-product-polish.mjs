import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'artifacts/product-polish';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
await page.goto('http://localhost:3000/');
await page.getByRole('heading', { name: 'Inicia sesión en NEXO' }).waitFor();
await page.screenshot({ path: `${output}/login.png`, fullPage: true });
await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
await page.getByRole('heading', { name: /Buenos días/ }).waitFor();
const onboarding = await page.request.get(
  'http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/onboarding',
);
const onboardingState = await onboarding.json();
const csrfCookie = (await context.cookies()).find((cookie) => cookie.name === 'nexo_csrf');
await page.request.post(
  'http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/onboarding/restart',
  {
    headers: { 'x-csrf-token': csrfCookie?.value ?? '' },
    data: { version: onboardingState.version },
  },
);
await page.goto('http://localhost:3000/');
await page.getByRole('heading', { name: 'Construyamos la base de tu negocio' }).waitFor();
await page.waitForTimeout(350);
await page.screenshot({ path: `${output}/onboarding-step-1.png`, fullPage: true });
for (let step = 1; step <= 11; step += 1) {
  await page.getByRole('button', { name: 'Guardar y continuar' }).click();
  await page.waitForTimeout(100);
  if (step === 1)
    await page.screenshot({ path: `${output}/onboarding-business.png`, fullPage: true });
  if (step === 4)
    await page.screenshot({ path: `${output}/onboarding-branch.png`, fullPage: true });
  if (step === 6) await page.screenshot({ path: `${output}/onboarding-cash.png`, fullPage: true });
}
await page.getByRole('button', { name: 'Ir a mi inicio' }).click();
await page.getByRole('heading', { name: /Buenos días/ }).waitFor();
await page.screenshot({ path: `${output}/home-populated.png`, fullPage: true });
const branchesResponse = await page.request.get(
  'http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/branches',
);
const branches = await branchesResponse.json();
if (!branches.some((branch) => branch.name === 'Norte')) {
  await page.request.post(
    'http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/branches',
    {
      headers: { 'x-csrf-token': csrfCookie?.value ?? '' },
      data: {
        code: 'NORTE',
        name: 'Norte',
        timeZone: 'America/Mazatlan',
        locale: 'es-MX',
        currency: 'MXN',
      },
    },
  );
  await page.reload();
  await page.getByRole('heading', { name: /Buenos días/ }).waitFor();
}
await page.getByRole('button', { name: 'Cambiar organización o sucursal' }).click();
await page.getByRole('button', { name: 'Norte' }).click();
await page.getByText('El día está comenzando').waitFor();
await page.screenshot({ path: `${output}/home-empty.png`, fullPage: true });
await page.getByRole('button', { name: 'Cambiar organización o sucursal' }).click();
await page.getByRole('button', { name: 'Centro' }).click();
await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
await page.screenshot({ path: `${output}/dark-mode.png`, fullPage: true });
await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
await page.getByRole('button', { name: /Héctor/ }).click();
await page.screenshot({ path: `${output}/account-menu.png`, fullPage: true });
await page.keyboard.press('Escape');
await page.getByRole('button', { name: 'Cambiar organización o sucursal' }).click();
await page.screenshot({ path: `${output}/navigation.png`, fullPage: true });
await page.goto('http://localhost:3000/cash');
await page.getByRole('heading', { name: 'Administración de Caja' }).waitFor();
await page.screenshot({ path: `${output}/cash-overview.png`, fullPage: true });
await page.goto('http://localhost:3000/sales');
await page.getByRole('heading', { name: 'Ventas' }).waitFor();
await page.screenshot({ path: `${output}/sales-overview.png`, fullPage: true });
await page.goto('http://localhost:3000/products');
await page.getByRole('heading', { name: 'Productos' }).waitFor();
await page.screenshot({ path: `${output}/products.png`, fullPage: true });
await page.keyboard.press('Control+k');
await page.getByRole('dialog').waitFor();
await page.screenshot({ path: `${output}/command-palette.png`, fullPage: true });
await page.keyboard.press('Escape');

await page.setViewportSize({ width: 820, height: 1180 });
await page.goto('http://localhost:3000/');
await page.getByRole('heading', { name: /Buenos días/ }).waitFor();
await page.screenshot({ path: `${output}/tablet.png`, fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.reload();
await page.getByRole('heading', { name: /Buenos días/ }).waitFor();
await page.screenshot({ path: `${output}/mobile.png`, fullPage: true });

await writeFile(
  `${output}/before-after.md`,
  `# Product polish before / after\n\nBefore: multiple entry URLs, technical Cash vocabulary, static onboarding and hidden logout.\n\nAfter: one root, authoritative session/onboarding routing, explicit account controls, Spanish business vocabulary, task-first Cash, activation checklist and a warm NEXO visual narrative.\n\nThe owner FAIL remains the baseline; these images prepare a new perception review and do not replace it.\n`,
);
await browser.close();
