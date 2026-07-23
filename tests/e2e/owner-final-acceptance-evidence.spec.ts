import { expect, test, type Page } from '@playwright/test';
import { copyFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { browserAudit, completeOnboarding, expectClean, web } from './owner-corrective.helpers';

const api = 'http://localhost:3001';
const root = path.resolve('artifacts/owner-final-acceptance-part-1a');
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

async function capture(page: Page, name: string) {
  await page.screenshot({ path: path.join(root, 'screenshots', `${name}.png`), fullPage: true });
}

test('recorrido exacto del owner con usuario, negocio y onboarding nuevos', async ({ browser }) => {
  test.setTimeout(180_000);
  await mkdir(path.join(root, 'screenshots'), { recursive: true });
  await mkdir(path.join(root, 'videos', '.raw'), { recursive: true });
  const fixture = spawnSync('node', ['scripts/owner-onboarding.mjs', 'new-business'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  expect(fixture.status, fixture.stderr).toBe(0);
  const email = fixture.stdout.match(/Usuario: (.+)/)?.[1]?.trim();
  const organizationId = fixture.stdout.match(/ID: ([0-9a-f-]+)/)?.[1];
  expect(email).toBeTruthy();
  expect(organizationId).toBeTruthy();

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: path.join(root, 'videos', '.raw'), size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto(`${web}/?mode=login`);
  await capture(page, '01-login-public-help');
  const signedIn = await context.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email,
      password,
      deviceFingerprint: `owner-final-${Date.now()}`,
      deviceName: 'Owner Final Acceptance Chromium',
    },
  });
  expect(signedIn.status()).toBe(200);
  await page.addInitScript((id) => {
    localStorage.setItem('nexo.active-organization', id);
  }, organizationId!);
  await page.goto(`${web}/control-plane/onboarding`);
  await expect(page.locator('.guided-onboarding')).toBeVisible();
  await capture(page, '02-onboarding-clean-business');
  await completeOnboarding(page);

  const audit = browserAudit(page);
  for (const [route, name] of [
    ['/', '03-dashboard'],
    ['/products', '04-products'],
    ['/inventory', '05-inventory'],
    ['/sales', '06-sales'],
    ['/cash', '07-cash'],
    ['/control-plane/invitations', '08-team'],
    ['/control-plane/settings', '09-settings'],
    ['/settings/profile', '10-profile'],
  ] as const) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
    const closeHelp = page.getByRole('button', { name: /Cerrar ayuda de/ });
    if (await closeHelp.isVisible().catch(() => false)) {
      if (route === '/') await capture(page, '03a-contextual-help-viewport-safe');
      await closeHelp.click();
    }
    await capture(page, name);
  }
  const logoutResponse = page.waitForResponse(
    (response) => response.url().endsWith('/v1/auth/logout') && response.status() === 204,
  );
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await logoutResponse;
  await expect(page.locator('.login-screen')).toBeVisible();
  await capture(page, '11-logout');
  expectClean(audit);
  const video = page.video();
  await context.close();
  if (video)
    await copyFile(await video.path(), path.join(root, 'videos', 'owner-walkthrough.webm'));
});
