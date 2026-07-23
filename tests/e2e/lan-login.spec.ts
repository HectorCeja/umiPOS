import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { completeCleanOnboarding, createCleanBusiness, password } from './dynamic-context.helpers';
import { onePixelPng } from './owner-corrective.helpers';

test('login y cookies funcionan usando la IP LAN', async ({ page }) => {
  test.setTimeout(120_000);
  const ip = execFileSync(
    'bash',
    [
      '-lc',
      'ip -4 route get 1.1.1.1 | awk \'{for(i=1;i<=NF;i++) if($i=="src") {print $(i+1); exit}}\'',
    ],
    { encoding: 'utf8' },
  ).trim();
  const web = `http://${ip}:3000`;
  const api = `http://${ip}:3001`;
  const business = createCleanBusiness();
  const browserErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => browserErrors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) =>
    browserErrors.push(`requestfailed: ${request.method()} ${request.url()}`),
  );
  page.on('response', (response) => {
    if (response.status() >= 500 || [401, 409].includes(response.status())) {
      browserErrors.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });
  await page.goto(web);
  await page.getByLabel('Correo').fill(business.email);
  await page.getByRole('textbox', { name: 'Contraseña *' }).fill(password);
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await expect(page.locator('.guided-onboarding')).toBeVisible({ timeout: 20_000 });
  expect((await page.context().cookies()).some((cookie) => cookie.name === 'nexo_session')).toBe(
    true,
  );
  await completeCleanOnboarding(page, business.organizationId, api, web);
  for (const route of [
    '/products',
    '/inventory',
    '/cash',
    '/sales',
    '/settings/profile',
    '/help',
  ]) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('main, #main-content, .module-surface, .cash-console').first(),
    ).toBeVisible();
  }
  await page.goto(`${web}/settings/profile`);
  await page.locator('input[type=file]').setInputFiles({
    name: 'avatar-lan.png',
    mimeType: 'image/png',
    buffer: onePixelPng,
  });
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await expect(page.getByText(/Perfil actualizado/)).toBeVisible();
  await expect(page.locator('.profile-trigger .avatar img')).toBeVisible();
  await page.reload();
  await expect(page.locator('.profile-trigger .avatar img')).toBeVisible();
  mkdirSync('artifacts/owner-final-polish-part-2a/screenshots', { recursive: true });
  await page.screenshot({
    path: 'artifacts/owner-final-polish-part-2a/screenshots/lan-profile-avatar.png',
    fullPage: true,
  });
  expect(browserErrors, browserErrors.join('\n')).toEqual([]);
});
