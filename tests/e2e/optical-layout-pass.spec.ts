import AxeBuilder from '@axe-core/playwright';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { mkdir, rename } from 'node:fs/promises';
import path from 'node:path';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const root = path.resolve('artifacts/optical-layout-pass');

async function login(context: BrowserContext) {
  const response = await context.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email: 'alpha.owner@nexo.local',
      password,
      deviceFingerprint: `optical-layout-${Date.now()}`,
      deviceName: 'Optical layout QA',
    },
  });
  expect(response.ok()).toBe(true);
}

async function assertAccessible(page: Page) {
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
  ).toEqual([]);
}

async function assertNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
}

test.describe.serial('final optical layout pass', () => {
  test.describe.configure({ timeout: 180_000 });

  test.beforeAll(async () => {
    await Promise.all([
      mkdir(path.join(root, 'after'), { recursive: true }),
      mkdir(path.join(root, 'videos'), { recursive: true }),
    ]);
  });

  test('premium surfaces preserve optical breathing and accessibility', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await login(context);
    const page = await context.newPage();
    const routes = [
      ['home', '/'],
      ['products', '/products'],
      ['inventory', '/inventory'],
      ['reports', '/reports'],
      ['sales', '/sales'],
      ['cash', '/cash'],
      ['profile', '/settings/profile'],
      ['settings', '/control-plane/settings'],
    ] as const;

    for (const [name, route] of routes) {
      await page.goto(`${web}${route}?scene=static`);
      await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
      await assertNoHorizontalOverflow(page);
      await assertAccessible(page);
      await page.screenshot({ path: path.join(root, 'after', `${name}.png`), fullPage: true });
    }

    await page.goto(`${web}/products?scene=static`);
    const productCard = page.locator('.products-page > .premium-card').last();
    const productSpacing = await productCard.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        inline: Number.parseFloat(style.paddingInlineStart),
        block: Number.parseFloat(style.paddingBlockStart),
      };
    });
    expect(productSpacing.inline).toBeGreaterThanOrEqual(21);
    expect(productSpacing.block).toBeGreaterThanOrEqual(20);

    await page.goto(`${web}/inventory?scene=static`);
    const inventorySpacing = await page
      .locator('.inventory-workspace > .premium-card')
      .first()
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingInlineStart));
    expect(inventorySpacing).toBeGreaterThanOrEqual(21);

    await page.goto(`${web}/reports?scene=static`);
    const reportSpacing = await page
      .locator('.reports-grid > .premium-card')
      .first()
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingInlineStart));
    expect(reportSpacing).toBeGreaterThanOrEqual(21);

    await page.goto(`${web}/sales?scene=static`);
    const metricGap = await page
      .locator('.sales-premium .nexo-card:has(> span + strong)')
      .first()
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).rowGap));
    expect(metricGap).toBeGreaterThanOrEqual(5);

    const logoutGeometry = await page.locator('.sidebar-logout').evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        gap: Number.parseFloat(style.columnGap),
        padding: Number.parseFloat(style.paddingInlineStart),
      };
    });
    expect(logoutGeometry.gap).toBeGreaterThanOrEqual(10);
    expect(logoutGeometry.padding).toBeGreaterThanOrEqual(17);
    await context.close();
  });

  test('mobile surfaces keep breathing without changing responsive behavior', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await login(context);
    const page = await context.newPage();
    for (const [name, route] of [
      ['products-mobile', '/products'],
      ['inventory-mobile', '/inventory'],
      ['reports-mobile', '/reports'],
    ] as const) {
      await page.goto(`${web}${route}?scene=static`);
      await assertNoHorizontalOverflow(page);
      await page.screenshot({ path: path.join(root, 'after', `${name}.png`), fullPage: true });
    }
    await context.close();
  });

  test('records short review journeys without changing behavior', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: path.join(root, 'videos'), size: { width: 1440, height: 900 } },
    });
    await login(context);
    const page = await context.newPage();
    await page.goto(`${web}/?scene=static`);
    await page.waitForTimeout(800);
    await page.goto(`${web}/products?scene=static`);
    await page.waitForTimeout(800);
    await page.goto(`${web}/inventory?scene=static`);
    await page.waitForTimeout(800);
    await page.goto(`${web}/reports?scene=static`);
    await page.waitForTimeout(800);
    const video = page.video();
    await context.close();
    const source = await video?.path();
    if (source) await rename(source, path.join(root, 'videos', 'module-breathing-review.webm'));
  });

  test('records focused empty-state and form breathing reviews', async ({ browser }) => {
    for (const journey of [
      { name: 'sales-cash-empty-states', routes: ['/sales', '/cash'] },
      { name: 'profile-settings-forms', routes: ['/settings/profile', '/control-plane/settings'] },
    ]) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        recordVideo: { dir: path.join(root, 'videos'), size: { width: 1440, height: 900 } },
      });
      await login(context);
      const page = await context.newPage();
      for (const route of journey.routes) {
        await page.goto(`${web}${route}?scene=static`);
        await page.waitForTimeout(900);
      }
      const video = page.video();
      await context.close();
      const source = await video?.path();
      if (source) await rename(source, path.join(root, 'videos', `${journey.name}.webm`));
    }
  });
});
