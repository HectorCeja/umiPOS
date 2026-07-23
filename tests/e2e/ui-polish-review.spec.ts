import AxeBuilder from '@axe-core/playwright';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';
const organizationId = '10000000-0000-4000-8000-000000000001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const artifacts = path.resolve('artifacts/ui-polish');

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: path.join(artifacts, 'screens', name), fullPage: true });
}

async function login(context: BrowserContext) {
  const response = await context.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email: 'alpha.owner@nexo.local',
      password,
      deviceFingerprint: `ui-polish-${Date.now()}`,
      deviceName: 'UI polish review',
    },
  });
  expect(response.ok()).toBe(true);
}

async function restartOnboarding(context: BrowserContext) {
  const current = (await (
    await context.request.get(`${api}/v1/organizations/${organizationId}/onboarding`)
  ).json()) as { version: number };
  const csrf = (await context.cookies()).find(({ name }) => name === 'nexo_csrf')?.value ?? '';
  const response = await context.request.post(
    `${api}/v1/organizations/${organizationId}/onboarding/restart`,
    { headers: { 'x-csrf-token': csrf }, data: { version: current.version } },
  );
  expect(response.ok()).toBe(true);
}

test.describe.serial('UI polish owner review evidence', () => {
  test.describe.configure({ timeout: 120_000 });
  test.beforeAll(async () => {
    await mkdir(path.join(artifacts, 'screens'), { recursive: true });
    await mkdir(path.join(artifacts, 'videos'), { recursive: true });
  });

  test('Login removes client review and keeps the cinematic essentials', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${web}/login?scene=static`);
    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
    await expect(page.locator('.login-story blockquote')).toHaveCount(0);
    await expect(page.locator('.nexo-living-scene__photo')).toBeVisible();
    await screenshot(page, 'login-desktop.png');
    const axe = await new AxeBuilder({ page }).analyze();
    expect(
      axe.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
    ).toEqual([]);
    await context.close();
  });

  test('Onboarding owns its scroll, uses editorial copy and restores completion', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: path.join(artifacts, 'videos'), size: { width: 1440, height: 900 } },
    });
    await login(context);
    await restartOnboarding(context);
    const page = await context.newPage();
    await page.goto(web);
    await expect(page.getByRole('button', { name: 'Empezar' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1),
    ).toBe(true);
    await screenshot(page, 'onboarding-welcome.png');
    for (let step = 1; step <= 7; step += 1) {
      await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
      await expect(page.locator('.guided-onboarding')).toHaveAttribute('data-step', String(step));
    }
    const scrollOwner = page.locator('.onboarding-content');
    expect(
      await scrollOwner.evaluate((element) => element.scrollHeight >= element.clientHeight),
    ).toBe(true);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await scrollOwner.evaluate((element) => element.scrollTo({ top: element.scrollHeight }));
    await screenshot(page, 'onboarding-catalog-panel-scroll.png');
    for (let step = 8; step <= 10; step += 1) {
      await page.getByRole('button', { name: 'Continuar' }).click();
      await expect(page.locator('.guided-onboarding')).toHaveAttribute('data-step', String(step));
    }
    await expect(page.getByRole('button', { name: 'Entrar a NEXO' })).toBeVisible();
    await screenshot(page, 'onboarding-review.png');
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
    await expect(page.getByRole('heading', { name: /Buenos días/ })).toBeVisible();
    await context.close();
  });

  test('Home branch menu remains anchored through resize and scroll', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await login(context);
    const page = await context.newPage();
    await page.goto(web);
    const trigger = page.getByRole('button', { name: /Sucursal activa/ });
    await trigger.click();
    const menu = page.locator('.context-menu');
    await expect(menu).toBeVisible();
    const [triggerBox, menuBox] = await Promise.all([trigger.boundingBox(), menu.boundingBox()]);
    expect(triggerBox).not.toBeNull();
    expect(menuBox).not.toBeNull();
    expect(Math.abs((menuBox?.left ?? 0) - (triggerBox?.left ?? 0))).toBeLessThan(24);
    await screenshot(page, 'home-branch-menu.png');
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(menu).toBeVisible();
    await expect
      .poll(async () => {
        const resized = await menu.boundingBox();
        return (resized?.x ?? -1) + (resized?.width ?? 0);
      })
      .toBeLessThanOrEqual(1024);
    await context.close();
  });

  test('administrative route tour produces owner-review captures without baselines', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await login(context);
    const page = await context.newPage();
    for (const [name, route] of [
      ['home', '/'],
      ['products', '/products'],
      ['inventory', '/inventory'],
      ['sales', '/sales'],
      ['cash', '/cash'],
      ['reports', '/reports'],
      ['team', '/control-plane/invitations'],
      ['settings', '/control-plane/settings'],
      ['profile', '/settings/profile'],
      ['help', '/help'],
    ] as const) {
      await page.goto(`${web}${route}?scene=static`);
      await page.waitForTimeout(1800);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
      await screenshot(page, `${name}-desktop.png`);
    }
    await context.close();
  });
});
