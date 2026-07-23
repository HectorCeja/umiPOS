import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const root = path.resolve('artifacts/final-ui-freeze');

const routes = [
  ['home', '/', 'woman-pos'],
  ['products', '/products', 'products'],
  ['inventory', '/inventory', 'inventory'],
  ['sales', '/sales', 'woman-pos'],
  ['cash', '/cash', 'woman-pos'],
  ['reports', '/reports', 'analytics'],
  ['profile', '/settings/profile', 'abstract'],
  ['settings', '/control-plane/settings', 'abstract'],
  ['team', '/control-plane/invitations', 'abstract'],
  ['help', '/help', 'abstract'],
] as const;

async function login(context: BrowserContext) {
  const response = await context.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email: 'alpha.owner@nexo.local',
      password,
      deviceFingerprint: `final-ui-freeze-${Date.now()}`,
      deviceName: 'Final UI freeze QA',
    },
  });
  expect(response.ok()).toBe(true);
}

async function expectArtwork(page: Page, artworkId: string) {
  const scene = page.locator('.nexo-living-scene');
  await expect(scene).toHaveAttribute('data-artwork-id', artworkId);
  await expect(page.locator('.nexo-living-scene__authenticated-artwork')).toHaveCount(1);
  await expect(page.locator('.nexo-living-scene__artwork-trails')).toHaveCount(1);
}

test.describe.serial('NEXO final UI freeze hotfix', () => {
  test.describe.configure({ timeout: 240_000 });

  test.beforeAll(async () => {
    await Promise.all([
      mkdir(path.join(root, 'screenshots', 'after'), { recursive: true }),
      mkdir(path.join(root, 'videos'), { recursive: true }),
    ]);
  });

  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    test(`${viewport.name}: titles, secondary navigation and artwork remain complete`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ viewport });
      await login(context);
      const page = await context.newPage();
      for (const [name, route, artworkId] of routes) {
        await page.goto(`${web}${route}?scene=static`);
        await expectArtwork(page, artworkId);
        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible();
        const headingBox = await heading.boundingBox();
        expect(headingBox).not.toBeNull();
        expect(headingBox!.y).toBeGreaterThanOrEqual(0);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        ).toBe(true);
        const navigation = page.locator('.section-nav');
        if (name === 'team' || name === 'settings') {
          await expect(navigation).toHaveCount(1);
          const navigationBox = await navigation.boundingBox();
          expect(navigationBox).not.toBeNull();
          expect(headingBox!.y).toBeGreaterThanOrEqual(
            navigationBox!.y + navigationBox!.height - 1,
          );
          expect(await navigation.evaluate((element) => getComputedStyle(element).top)).toBe('0px');
        }
        await page.waitForTimeout(1800);
        await page.screenshot({
          path: path.join(root, 'screenshots', 'after', `${name}-${viewport.name}.png`),
        });
      }
      await context.close();
    });
  }

  test('routes without secondary navigation receive no artificial offset', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await login(context);
    const page = await context.newPage();
    for (const route of ['/', '/products', '/inventory', '/reports']) {
      await page.goto(`${web}${route}?scene=static`);
      await expect(page.locator('.section-nav')).toHaveCount(0);
      const content = page
        .locator('.product-shell > .unified-content, .product-shell > .product-main')
        .first();
      await expect(content).toBeVisible();
      expect(
        await content.evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--nexo-secondary-navigation-height'),
        ),
      ).toBe('');
    }
    await context.close();
  });

  test('completed onboarding preserves its approved redirect without inheriting a subnav offset', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await login(context);
    const page = await context.newPage();
    await page.goto(`${web}/control-plane/onboarding?scene=static`);
    await expect(page).toHaveURL(`${web}/`);
    await expect(page.locator('.section-nav')).toHaveCount(0);
    await expect(page.locator('h1').first()).toBeVisible();
    await context.close();
  });

  test('records the complete artwork matrix', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await login(context);
    const page = await context.newPage();
    const matrix = [];
    for (const [name, route, artworkId] of routes) {
      await page.goto(`${web}${route}?scene=static`);
      await expectArtwork(page, artworkId);
      matrix.push({
        screen: name,
        route,
        artwork: artworkId,
        crop: await page
          .locator('.nexo-living-scene__authenticated-artwork')
          .evaluate((element) => element.style.getPropertyValue('--nexo-artwork-position-desktop')),
        mask: await page
          .locator('.nexo-living-scene__authenticated-artwork')
          .evaluate((element) => getComputedStyle(element).maskImage),
        status: 'PASS',
      });
    }
    await writeFile(path.join(root, 'artwork-matrix.json'), `${JSON.stringify(matrix, null, 2)}\n`);
    await context.close();
  });

  test('records fixed subnavigation and complete artwork motion', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: path.join(root, 'videos'), size: { width: 1440, height: 900 } },
    });
    await login(context);
    const page = await context.newPage();
    await page.goto(`${web}/control-plane/invitations`);
    await expect(page.getByRole('heading', { name: 'Personas y acceso' })).toBeVisible();
    await page.waitForTimeout(900);
    await page.goto(`${web}/control-plane/settings`);
    await expect(page.getByRole('heading', { name: 'Datos del negocio' })).toBeVisible();
    await page.waitForTimeout(900);
    await page.goto(web);
    await page.waitForTimeout(800);
    await page.goto(`${web}/products`);
    await page.waitForTimeout(800);
    await page.goto(`${web}/inventory`);
    await page.waitForTimeout(800);
    await page.goto(`${web}/reports`);
    await page.waitForTimeout(1000);
    const video = page.video();
    await context.close();
    const source = await video?.path();
    if (source) await rename(source, path.join(root, 'videos', 'subnav-and-artwork.webm'));
  });
});
