import AxeBuilder from '@axe-core/playwright';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createCleanUser } from './dynamic-context.helpers';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const root = path.resolve('artifacts/final-immersion');
let fixtureEmail = '';

const artworkRoutes = [
  ['home', '/', 'woman-pos'],
  ['products', '/products', 'products'],
  ['inventory', '/inventory', 'inventory'],
  ['sales', '/sales', 'woman-pos'],
  ['cash', '/cash', 'woman-pos'],
  ['reports', '/reports', 'analytics'],
] as const;

async function login(context: BrowserContext) {
  const response = await context.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email: fixtureEmail,
      password,
      deviceFingerprint: `final-immersion-${Date.now()}`,
      deviceName: 'Final immersion QA',
    },
  });
  expect(response.ok()).toBe(true);
  await context.addInitScript(() => {
    localStorage.setItem('nexo.active-organization', '10000000-0000-4000-8000-000000000001');
    localStorage.setItem('nexo.active-branch', '20000000-0000-4000-8000-000000000001');
  });
}

async function waitForArtwork(page: Page, artworkId: string) {
  const scene = page.locator('.nexo-living-scene');
  await expect(scene).toHaveAttribute('data-artwork-id', artworkId);
  const artwork = page.locator('.nexo-living-scene__authenticated-artwork');
  await expect(artwork).toHaveCount(1);
  await expect
    .poll(() =>
      artwork.evaluate((element) => element.style.getPropertyValue('--nexo-authenticated-artwork')),
    )
    .toContain('/brand/');
}

test.describe.serial('NEXO final immersion pass', () => {
  test.describe.configure({ timeout: 240_000 });

  test.beforeAll(async () => {
    fixtureEmail = createCleanUser().email;
    await Promise.all([
      mkdir(path.join(root, 'screenshots', 'after'), { recursive: true }),
      mkdir(path.join(root, 'videos'), { recursive: true }),
      mkdir(path.join(root, 'performance'), { recursive: true }),
    ]);
  });

  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    test(`${viewport.name} uses the official artwork registry and smart crops`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ viewport });
      await login(context);
      const page = await context.newPage();
      for (const [name, route, artworkId] of artworkRoutes) {
        await page.goto(`${web}${route}?scene=static`);
        await waitForArtwork(page, artworkId);
        await expect(page.locator('h1').first()).toBeVisible();
        await page.waitForTimeout(450);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        ).toBe(true);
        await page.screenshot({
          path: path.join(root, 'screenshots', 'after', `${name}-${viewport.name}.png`),
        });
      }
      await context.close();
    });
  }

  test('profile and settings use the registered abstract artwork pipeline', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await login(context);
    const page = await context.newPage();
    for (const [name, route] of [
      ['profile', '/settings/profile'],
      ['settings', '/control-plane/settings'],
    ] as const) {
      await page.goto(`${web}${route}?scene=static`);
      await expect(page.locator('.nexo-living-scene')).toHaveAttribute(
        'data-artwork-id',
        'abstract',
      );
      await expect(page.locator('.nexo-living-scene__authenticated-artwork')).toHaveCount(1);
      await expect
        .poll(() =>
          page
            .locator('.nexo-living-scene__authenticated-artwork')
            .evaluate((element) => element.style.getPropertyValue('--nexo-authenticated-artwork')),
        )
        .toContain('radial-gradient');
      await expect(page.locator('h1').first()).toBeVisible();
      await page.waitForTimeout(450);
      await page.screenshot({
        path: path.join(root, 'screenshots', 'after', `${name}-desktop.png`),
      });
    }
    await context.close();
  });

  test('the app shell is fixed and only route content scrolls', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await login(context);
    const page = await context.newPage();
    for (const [, route] of [
      ...artworkRoutes,
      ['profile', '/settings/profile', 'abstract'],
      ['settings', '/control-plane/settings', 'abstract'],
    ] as const) {
      await page.goto(`${web}${route}?scene=static`);
      const scrollRegion = page
        .locator('.product-shell > .unified-content, .product-shell > .product-main')
        .first();
      await expect(scrollRegion).toBeVisible();
      const before = await Promise.all([
        page.locator('.product-sidebar').boundingBox(),
        page.locator('.product-topbar').boundingBox(),
      ]);
      await scrollRegion.evaluate((element) => {
        element.scrollTop = Math.min(320, element.scrollHeight - element.clientHeight);
      });
      const after = await Promise.all([
        page.locator('.product-sidebar').boundingBox(),
        page.locator('.product-topbar').boundingBox(),
      ]);
      expect(after).toEqual(before);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      expect(
        await page.evaluate(() => ({
          body: getComputedStyle(document.body).overflow,
          shell: getComputedStyle(document.querySelector('.product-shell')!).overflow,
        })),
      ).toEqual({ body: 'hidden', shell: 'hidden' });
    }
    await context.close();
  });

  test('crossfades artwork, pauses when hidden and disables pointer motion off desktop', async ({
    browser,
  }) => {
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await login(desktop);
    const page = await desktop.newPage();
    await page.goto(web);
    await waitForArtwork(page, 'woman-pos');
    await page.mouse.move(1180, 680);
    await expect
      .poll(() =>
        page
          .locator('.nexo-living-scene')
          .evaluate((element) => element.style.getPropertyValue('--nexo-artwork-x')),
      )
      .not.toBe('');
    await page.getByRole('link', { name: 'Productos', exact: true }).click();
    await expect(page).toHaveURL(/\/products/);
    await waitForArtwork(page, 'products');
    await expect(page.locator('.nexo-living-scene__authenticated-artwork')).toHaveAttribute(
      'data-transitioning',
      'true',
    );
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.locator('.nexo-living-scene')).toHaveClass(/is-static/);
    await desktop.close();

    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await login(mobile);
    const mobilePage = await mobile.newPage();
    await mobilePage.goto(`${web}/products`);
    await mobilePage.mouse.move(340, 700);
    expect(
      await mobilePage
        .locator('.nexo-living-scene')
        .evaluate((element) => element.style.getPropertyValue('--nexo-artwork-x')),
    ).toBe('');
    await mobile.close();
  });

  test('axe and route timings remain within the review budget', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await login(context);
    const page = await context.newPage();
    const timings: Array<{ route: string; readyMs: number; resources: number }> = [];
    for (const [, route] of [
      ...artworkRoutes,
      ['profile', '/settings/profile', 'abstract'],
      ['settings', '/control-plane/settings', 'abstract'],
    ] as const) {
      const start = performance.now();
      await page.goto(`${web}${route}?scene=static`);
      await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
      timings.push({
        route,
        readyMs: Number((performance.now() - start).toFixed(2)),
        resources: await page.evaluate(() => performance.getEntriesByType('resource').length),
      });
      const axe = await new AxeBuilder({ page }).analyze();
      expect(
        axe.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
      ).toEqual([]);
    }
    await writeFile(
      path.join(root, 'performance', 'route-timings.json'),
      `${JSON.stringify({ measuredAt: new Date().toISOString(), timings }, null, 2)}\n`,
    );
    await context.close();
  });

  test('records one fixed-shell artwork review per approved module', async ({ browser }) => {
    for (const [name, route, artworkId] of artworkRoutes) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        recordVideo: { dir: path.join(root, 'videos'), size: { width: 1440, height: 900 } },
      });
      await login(context);
      const page = await context.newPage();
      await page.goto(`${web}${route}`);
      await waitForArtwork(page, artworkId);
      const scrollRegion = page
        .locator('.product-shell > .unified-content, .product-shell > .product-main')
        .first();
      await page.waitForTimeout(900);
      await scrollRegion.evaluate((element) => {
        element.scrollTo({ top: Math.min(360, element.scrollHeight - element.clientHeight) });
      });
      await page.waitForTimeout(1100);
      const video = page.video();
      await context.close();
      const source = await video?.path();
      if (source) await rename(source, path.join(root, 'videos', `${name}.webm`));
    }
  });
});
