import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const root = path.resolve('artifacts/final-owner-ui-review');

async function login(context: BrowserContext) {
  const response = await context.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email: 'alpha.owner@nexo.local',
      password,
      deviceFingerprint: `final-owner-evidence-${Date.now()}`,
      deviceName: 'Final owner evidence',
    },
  });
  expect(response.ok()).toBe(true);
}

async function record(
  browser: Browser,
  name: string,
  action: (page: Page, context: BrowserContext) => Promise<void>,
  options: { width?: number; height?: number; reducedMotion?: 'reduce' | 'no-preference' } = {},
) {
  const viewport = { width: options.width ?? 1280, height: options.height ?? 720 };
  const context = await browser.newContext({
    viewport,
    reducedMotion: options.reducedMotion ?? 'no-preference',
    recordVideo: { dir: path.join(root, 'videos', '.raw'), size: viewport },
  });
  await login(context);
  const page = await context.newPage();
  await action(page, context);
  const video = page.video();
  await context.close();
  if (video) await copyFile(await video.path(), path.join(root, 'videos', `${name}.webm`));
}

test.describe.serial('final owner evidence', () => {
  test.describe.configure({ timeout: 600_000 });
  test.beforeAll(async () => mkdir(path.join(root, 'videos', '.raw'), { recursive: true }));

  test('records the twelve required interaction journeys', async ({ browser }) => {
    await record(browser, '01-organization-selector', async (page) => {
      await page.goto(web);
      await page.getByRole('button', { name: /Organización activa/ }).click();
      await page.waitForTimeout(1800);
    });
    await record(browser, '02-branch-selector', async (page) => {
      await page.goto(web);
      await page.getByRole('button', { name: /Sucursal activa/ }).click();
      await page.waitForTimeout(1800);
    });
    await record(browser, '03-dropdown-flip', async (page) => {
      await page.goto(web);
      const trigger = page.getByRole('button', { name: /Sucursal activa/ });
      await trigger.evaluate((element) => {
        Object.assign((element as HTMLElement).style, {
          transform: 'translate3d(300px, 610px, 0)',
          zIndex: '120',
        });
      });
      await trigger.click();
      await expect(page.getByRole('menu', { name: 'Sucursales disponibles' })).toHaveAttribute(
        'data-placement',
        /top/,
      );
      await page.waitForTimeout(1800);
    });
    await record(browser, '04-selector-after-scroll', async (page) => {
      await page.goto(web);
      await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
      await page.waitForTimeout(700);
      await page.getByRole('button', { name: /Sucursal activa/ }).click();
      await page.waitForTimeout(1500);
    });
    await record(browser, '05-selector-after-resize', async (page) => {
      await page.goto(web);
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.getByRole('button', { name: /Sucursal activa/ }).click();
      await page.waitForTimeout(1500);
    });
    await record(browser, '06-user-menu-simplified', async (page) => {
      await page.goto(web);
      await page.getByRole('button', { name: /Abrir menú de usuario/ }).click();
      await page.waitForTimeout(1800);
    });
    await record(browser, '07-home-parallax', async (page) => {
      await page.goto(web);
      await page.mouse.move(180, 180);
      await page.waitForTimeout(1300);
      await page.mouse.move(1120, 620, { steps: 20 });
      await page.waitForTimeout(2500);
    });
    await record(browser, '08-home-products-inventory-artwork', async (page) => {
      await page.goto(web);
      for (const label of ['Productos', 'Inventario']) {
        await page.getByRole('link', { name: label, exact: true }).click();
        await page.waitForTimeout(1800);
      }
    });
    await record(browser, '09-sales-cash-artwork', async (page) => {
      await page.goto(`${web}/sales`);
      await page.waitForTimeout(1500);
      await page.getByRole('link', { name: 'Caja', exact: true }).click();
      await page.waitForTimeout(2200);
    });
    await record(browser, '10-reports-light-trails', async (page) => {
      await page.goto(`${web}/reports`);
      await page.waitForTimeout(5000);
    });
    await record(
      browser,
      '11-reduced-motion',
      async (page) => {
        await page.goto(`${web}/reports`);
        await expect(page.locator('.nexo-living-scene__authenticated-artwork')).toHaveCSS(
          'animation-name',
          'none',
        );
        await page.waitForTimeout(2200);
      },
      { reducedMotion: 'reduce' },
    );
    await record(
      browser,
      '12-mobile-context-selector',
      async (page) => {
        await page.goto(web);
        await page.getByRole('button', { name: 'Abrir navegación' }).click();
        await page.getByRole('button', { name: 'Cambiar organización o sucursal' }).click();
        await page.waitForTimeout(2200);
      },
      { width: 390, height: 844 },
    );
  });

  test('measures authenticated route and global-control timings', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await login(context);
    const page = await context.newPage();
    const samples: Record<string, number[]> = {
      homeReady: [],
      productsReady: [],
      inventoryReady: [],
      reportsReady: [],
      homeSales: [],
      salesCash: [],
      commandPalette: [],
      branchSelector: [],
    };
    for (let sample = 0; sample < 3; sample += 1) {
      for (const [key, route] of [
        ['homeReady', '/'],
        ['productsReady', '/products'],
        ['inventoryReady', '/inventory'],
        ['reportsReady', '/reports'],
      ] as const) {
        const started = performance.now();
        await page.goto(`${web}${route}`);
        await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
        samples[key].push(performance.now() - started);
      }
      await page.goto(web);
      let started = performance.now();
      await page.getByRole('link', { name: 'Ventas', exact: true }).click();
      await expect(page).toHaveURL(/\/sales$/);
      samples.homeSales.push(performance.now() - started);
      started = performance.now();
      await page.getByRole('link', { name: 'Caja', exact: true }).click();
      await expect(page).toHaveURL(/\/cash$/);
      samples.salesCash.push(performance.now() - started);
      started = performance.now();
      await page.keyboard.press('Control+KeyK');
      await expect(page.getByRole('dialog', { name: /Explora NEXO/ })).toBeVisible();
      samples.commandPalette.push(performance.now() - started);
      await page.keyboard.press('Escape');
      started = performance.now();
      await page.getByRole('button', { name: /Sucursal activa/ }).click();
      await expect(page.getByRole('menu', { name: 'Sucursales disponibles' })).toBeVisible();
      samples.branchSelector.push(performance.now() - started);
      await page.keyboard.press('Escape');
    }
    const browserMetrics = await page.evaluate(() => ({
      usedHeapBytes:
        'memory' in performance
          ? ((performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
              ?.usedJSHeapSize ?? null)
          : null,
      longTasks: performance.getEntriesByType('longtask').length,
    }));
    const percentile = (values: number[], quantile: number) => {
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * quantile) - 1)];
    };
    const summary = Object.fromEntries(
      Object.entries(samples).map(([key, values]) => [
        key,
        {
          samplesMs: values.map((value) => Number(value.toFixed(2))),
          p50Ms: Number(percentile(values, 0.5).toFixed(2)),
          p95Ms: Number(percentile(values, 0.95).toFixed(2)),
        },
      ]),
    );
    await writeFile(
      path.join(root, 'performance.json'),
      `${JSON.stringify({ summary, browserMetrics }, null, 2)}\n`,
    );
    await context.close();
  });
});
