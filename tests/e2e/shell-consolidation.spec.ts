import AxeBuilder from '@axe-core/playwright';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const artifacts = path.resolve('artifacts/shell-consolidation');

async function login(context: BrowserContext) {
  const response = await context.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email: 'alpha.owner@nexo.local',
      password,
      deviceFingerprint: `shell-consolidation-${Date.now()}`,
      deviceName: 'Shell consolidation QA',
    },
  });
  expect(response.ok()).toBe(true);
}

async function assertSingleShell(page: Page, activeLabel: string) {
  await expect(page.locator('[data-nexo-app-shell="canonical"]')).toHaveCount(1);
  await expect(page.locator('.product-sidebar')).toHaveCount(1);
  await expect(page.locator('.product-topbar')).toHaveCount(1);
  await expect(page.locator('.nexo-living-scene')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toHaveCount(1);
  await expect(page.getByRole('link', { name: activeLabel, exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
}

async function capture(page: Page, name: string) {
  await page.screenshot({
    path: path.join(artifacts, 'screenshots', `${name}.png`),
    fullPage: true,
  });
}

test.describe.serial('single shared NexoAppShell', () => {
  test.describe.configure({ timeout: 120_000 });
  test.beforeAll(async () => {
    await mkdir(path.join(artifacts, 'screenshots'), { recursive: true });
    await mkdir(path.join(artifacts, 'videos'), { recursive: true });
  });

  test('Home and administrative routes mount one canonical shell', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await login(context);
    const page = await context.newPage();
    for (const [route, label] of [
      ['/', 'Inicio'],
      ['/products', 'Productos'],
      ['/inventory', 'Inventario'],
      ['/reports', 'Reportes'],
      ['/sales', 'Ventas'],
      ['/cash', 'Caja'],
      ['/control-plane/settings', 'Configuración'],
    ] as const) {
      await page.goto(`${web}${route}?scene=static`);
      await assertSingleShell(page, label);
      expect(await page.locator('[role="dialog"]').count()).toBe(0);
      await capture(page, `${label.toLowerCase()}-canonical-shell`);
    }
    await capture(page, 'desktop-single-shell');
    await context.close();
  });

  test('Home canonical shell visual evidence at the approved review viewport', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await login(context);
    const page = await context.newPage();
    await page.goto(`${web}/?scene=static`);
    await assertSingleShell(page, 'Inicio');
    await capture(page, 'home-1440x900-current');
    await context.close();
  });

  test('Command Palette and branch selector remain singular and anchored across routes', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await login(context);
    const page = await context.newPage();
    for (const route of ['/', '/products', '/inventory', '/reports']) {
      await page.goto(`${web}${route}?scene=static`);
      const trigger = page.getByRole('button', { name: /Sucursal activa/ });
      await trigger.click();
      const menu = page.locator('.context-menu');
      await expect(menu).toHaveCount(1);
      await expect(menu).toBeVisible();
      const [triggerBox, menuBox] = await Promise.all([trigger.boundingBox(), menu.boundingBox()]);
      expect(Math.abs((triggerBox?.x ?? 0) - (menuBox?.x ?? 0))).toBeLessThan(24);
      await page.keyboard.press('Escape');
      await page.keyboard.press('Control+k');
      await expect(page.getByRole('dialog')).toHaveCount(1);
      await page.keyboard.press('Escape');
    }
    await context.close();
  });

  for (const viewport of [
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'low', width: 1024, height: 600 },
    { name: 'landscape-small', width: 568, height: 320 },
  ]) {
    test(`${viewport.name} drawer exposes the complete shared navigation`, async ({ browser }) => {
      const context = await browser.newContext({ viewport });
      await login(context);
      const page = await context.newPage();
      await page.goto(`${web}/?scene=static`);
      const trigger = page.getByRole('button', { name: 'Abrir navegación' });
      await trigger.click();
      for (const label of ['Reportes', 'Equipo', 'Configuración', 'Ayuda']) {
        await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible();
      }
      await expect(page.getByRole('button', { name: /Cerrar sesión/ })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
      await capture(page, `${viewport.name}-drawer-open`);
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await context.close();
    });
  }

  test('Home, Products, Inventory, Reports, Cash and Settings have no serious axe findings', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await login(context);
    const page = await context.newPage();
    for (const route of [
      '/',
      '/products',
      '/inventory',
      '/reports',
      '/cash',
      '/control-plane/settings',
    ]) {
      await page.goto(`${web}${route}?scene=static`);
      const result = await new AxeBuilder({ page }).analyze();
      expect(
        result.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
      ).toEqual([]);
    }
    await context.close();
  });

  test('records shell continuity and global-overlay review videos', async ({ browser }) => {
    const journeys = [
      ['home-products', '/', '/products'],
      ['products-inventory', '/products', '/inventory'],
      ['inventory-reports', '/inventory', '/reports'],
      ['home-settings', '/', '/control-plane/settings'],
      ['command-palette-routes', '/', '/products'],
      ['branch-selector-routes', '/', '/inventory'],
      ['responsive-drawer', '/', '/reports'],
    ] as const;
    for (const [name, from, to] of journeys) {
      const context = await browser.newContext({
        viewport:
          name === 'responsive-drawer' ? { width: 390, height: 844 } : { width: 1280, height: 720 },
        recordVideo: {
          dir: path.join(artifacts, 'videos', '.raw'),
          size: { width: 1280, height: 720 },
        },
      });
      await login(context);
      const page = await context.newPage();
      await page.goto(`${web}${from}?scene=static`);
      if (name === 'command-palette-routes') {
        await page.keyboard.press('Control+k');
        await page.waitForTimeout(500);
        await page.keyboard.press('Escape');
        await page.getByRole('link', { name: 'Productos', exact: true }).click();
      } else if (name === 'branch-selector-routes') {
        await page.getByRole('button', { name: /Sucursal activa/ }).click();
        await page.waitForTimeout(500);
        await page.keyboard.press('Escape');
        await page.getByRole('link', { name: 'Inventario', exact: true }).click();
      } else if (name === 'responsive-drawer') {
        await page.getByRole('button', { name: 'Abrir navegación' }).click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: 'Reportes', exact: true }).click();
      } else {
        const target = new URL(to, web).pathname;
        const targetItem = nexoRouteLabel(target);
        await page.getByRole('link', { name: targetItem, exact: true }).click();
      }
      await page.waitForURL(new RegExp(`${to.replaceAll('/', '\\/')}`));
      await page.waitForTimeout(700);
      if (name === 'command-palette-routes') {
        await page.keyboard.press('Control+k');
        await page.waitForTimeout(500);
      } else if (name === 'branch-selector-routes') {
        await page.getByRole('button', { name: /Sucursal activa/ }).click();
        await page.waitForTimeout(500);
      }
      const video = page.video();
      await context.close();
      if (video) await copyFile(await video.path(), path.join(artifacts, 'videos', `${name}.webm`));
    }
  });

  test('records route and overlay interaction timings', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await login(context);
    const page = await context.newPage();
    const timings: Record<string, number[]> = {
      home: [],
      homeProducts: [],
      productsInventory: [],
      inventoryReports: [],
      commandPalette: [],
      branchSelector: [],
    };
    for (let sample = 0; sample < 5; sample += 1) {
      let started = performance.now();
      await page.goto(`${web}/?scene=static`);
      await expect(page.getByRole('heading', { name: /Buenos días/ })).toBeVisible();
      timings.home.push(performance.now() - started);
      started = performance.now();
      await page.getByRole('link', { name: 'Productos', exact: true }).click();
      await page.waitForURL('**/products');
      timings.homeProducts.push(performance.now() - started);
      started = performance.now();
      await page.getByRole('link', { name: 'Inventario', exact: true }).click();
      await page.waitForURL('**/inventory');
      timings.productsInventory.push(performance.now() - started);
      started = performance.now();
      await page.getByRole('link', { name: 'Reportes', exact: true }).click();
      await page.waitForURL('**/reports');
      timings.inventoryReports.push(performance.now() - started);
      started = performance.now();
      await page.getByRole('button', { name: 'Abrir búsqueda global' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      timings.commandPalette.push(performance.now() - started);
      await page.keyboard.press('Escape');
      started = performance.now();
      await page.getByRole('button', { name: /Sucursal activa/ }).click();
      await expect(page.locator('.context-menu')).toBeVisible();
      timings.branchSelector.push(performance.now() - started);
      await page.keyboard.press('Escape');
    }
    const summary = Object.fromEntries(
      Object.entries(timings).map(([name, values]) => [
        name,
        {
          samples: values.map((value) => Number(value.toFixed(2))),
          p50Ms: percentile(values, 0.5),
          p95Ms: percentile(values, 0.95),
        },
      ]),
    );
    await writeFile(
      path.join(artifacts, 'performance.json'),
      `${JSON.stringify(summary, null, 2)}\n`,
    );
    await context.close();
  });
});

function nexoRouteLabel(route: string) {
  if (route === '/products') return 'Productos';
  if (route === '/inventory') return 'Inventario';
  if (route === '/reports') return 'Reportes';
  if (route === '/control-plane/settings') return 'Configuración';
  return 'Inicio';
}

function percentile(values: number[], quantile: number) {
  const sorted = [...values].sort((left, right) => left - right);
  return Number((sorted[Math.ceil((sorted.length - 1) * quantile)] ?? 0).toFixed(2));
}
