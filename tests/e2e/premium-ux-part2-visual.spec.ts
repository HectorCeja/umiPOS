import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  browserAudit,
  completeOnboarding,
  loginIsolatedOnboarding,
  setOnboardingStep,
  web,
} from './owner-corrective.helpers.js';

const root = path.resolve('artifacts/premium-ux-part-2/screenshots');
async function capture(page: import('@playwright/test').Page, name: string) {
  await mkdir(root, { recursive: true });
  await page.screenshot({
    path: path.join(root, `${name}.png`),
    fullPage: true,
    animations: 'disabled',
  });
}
async function freshGuide(page: import('@playwright/test').Page, route: string) {
  await page.goto(`${web}${route}`);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('nexo.help.v2.')) localStorage.removeItem(key);
  });
  await page.reload();
  await page.waitForLoadState('networkidle');
  if (!(await page.locator('.contextual-help__panel').isVisible()))
    await page.getByRole('button', { name: 'Ver guía' }).click();
  await expect(page.locator('.contextual-help__panel')).toBeVisible();
}

test('premium experience teaches throughout the visible product', async ({ page }) => {
  test.setTimeout(150_000);
  const audit = browserAudit(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(web);
  await expect(page.locator('.contextual-help__panel')).toBeVisible();
  await capture(page, 'login-contextual-help');
  await loginIsolatedOnboarding(page);
  await setOnboardingStep(page, 4);
  await expect(page.locator('.contextual-help__panel')).toBeVisible();
  await capture(page, 'onboarding-contextual-help');
  await completeOnboarding(page);
  for (const [name, route] of [
    ['dashboard', '/'],
    ['sales', '/sales'],
    ['cash', '/cash'],
    ['products', '/products'],
    ['inventory', '/inventory'],
    ['team', '/control-plane/invitations'],
    ['reports', '/reports'],
    ['settings', '/control-plane/settings'],
  ] as const) {
    await freshGuide(page, route);
    await capture(page, `${name}-contextual-help`);
  }
  await page.goto(`${web}/help`);
  await page.waitForLoadState('networkidle');
  await capture(page, 'help-center');
  const search = page.getByRole('searchbox', { name: 'Buscar en el Centro de ayuda' });
  await search.fill('inventario');
  await expect(
    page.getByRole('link', { name: /Conoce lo que realmente puedes vender/ }),
  ).toBeVisible();
  await capture(page, 'help-center-search');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('heading', { name: 'Respuestas que te devuelven al trabajo.' }),
  ).toBeVisible();
  await capture(page, 'help-center-mobile');
  expect(audit.consoleMessages).toEqual([]);
  expect(audit.failedRequests).toEqual([]);
  expect(audit.httpFailures).toEqual([]);
});
