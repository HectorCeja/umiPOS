import AxeBuilder from '@axe-core/playwright';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const screenshots = path.resolve('artifacts/final-owner-ui-review/screenshots');

async function login(context: BrowserContext) {
  const response = await context.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email: 'alpha.owner@nexo.local',
      password,
      deviceFingerprint: `final-owner-ui-${Date.now()}`,
      deviceName: 'Final owner UI review',
    },
  });
  expect(response.ok()).toBe(true);
}

async function capture(page: Page, name: string) {
  await page.screenshot({ path: path.join(screenshots, `${name}.png`), fullPage: true });
}

async function noSeriousAxe(page: Page) {
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
  ).toEqual([]);
}

test.describe.serial('final owner UI review', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeAll(async () => mkdir(screenshots, { recursive: true }));

  test('context selectors have premium spacing, long-name resilience and anchored menus', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await login(context);
    const page = await context.newPage();
    for (const [name, route] of [
      ['home', '/'],
      ['products', '/products'],
      ['inventory', '/inventory'],
      ['reports', '/reports'],
      ['sales', '/sales'],
      ['cash', '/cash'],
      ['profile', '/settings/profile'],
      ['settings', '/control-plane/settings'],
    ] as const) {
      await page.goto(`${web}${route}`);
      const selectors = page.locator('.home-context-controls .context-selector');
      await expect(selectors).toHaveCount(2);
      for (const selector of await selectors.all()) {
        const geometry = await selector.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            width: element.getBoundingClientRect().width,
            height: element.getBoundingClientRect().height,
            gap: Number.parseFloat(style.columnGap),
            paddingLeft: Number.parseFloat(style.paddingLeft),
          };
        });
        expect(geometry.width).toBeGreaterThanOrEqual(168);
        expect(geometry.height).toBeGreaterThanOrEqual(44);
        expect(geometry.gap).toBeGreaterThanOrEqual(10);
        expect(geometry.paddingLeft).toBeGreaterThanOrEqual(12);
      }
      const branch = page.getByRole('button', { name: /Sucursal activa/ });
      await branch.click();
      const menu = page.getByRole('menu', { name: 'Sucursales disponibles' });
      await expect(menu).toBeVisible();
      const [triggerBox, menuBox] = await Promise.all([branch.boundingBox(), menu.boundingBox()]);
      expect(Math.abs((triggerBox?.x ?? 0) - (menuBox?.x ?? 0))).toBeLessThanOrEqual(12);
      expect(menuBox?.width ?? 0).toBeGreaterThanOrEqual(triggerBox?.width ?? 0);
      await page.keyboard.press('Escape');
      await expect(branch).toBeFocused();
      await expect(page.locator('.nexo-living-scene__authenticated-artwork')).toHaveCount(1);
      await noSeriousAxe(page);
      await capture(page, `${name}-authenticated-artwork`);
    }

    const organization = page.getByRole('button', { name: /Organización activa/ });
    await organization.locator('.context-selector__copy strong').evaluate((element) => {
      element.textContent = 'Restaurante del Centro Histórico';
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
    await context.close();
  });

  test('floating menus flip, shift and the user menu has one Profile action', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await login(context);
    const page = await context.newPage();
    await page.goto(web);
    const branch = page.getByRole('button', { name: /Sucursal activa/ });
    await branch.evaluate((element) => {
      Object.assign((element as HTMLElement).style, {
        transform: 'translate3d(300px, 610px, 0)',
        zIndex: '120',
      });
    });
    await branch.click();
    const branchMenu = page.getByRole('menu', { name: 'Sucursales disponibles' });
    await expect(branchMenu).toBeVisible();
    await expect(branchMenu).toHaveAttribute('data-placement', /top/);
    const menuBox = await branchMenu.boundingBox();
    expect((menuBox?.x ?? 0) + (menuBox?.width ?? 0)).toBeLessThanOrEqual(1268);
    await capture(page, 'dropdown-flip-top-end');
    await page.keyboard.press('ArrowDown');
    await expect(branchMenu.getByRole('menuitemradio').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(branch).toBeFocused();

    const userTrigger = page.getByRole('button', { name: /Abrir menú de usuario/ });
    await userTrigger.click();
    const userMenu = page.getByRole('menu', { name: 'Menú de usuario' });
    await expect(userMenu).toBeVisible();
    await expect(userMenu.getByRole('menuitem', { name: 'Perfil', exact: true })).toHaveCount(1);
    await expect(userMenu.getByText('Preferencias', { exact: true })).toHaveCount(0);
    await page.keyboard.press('ArrowDown');
    await expect(userMenu.getByRole('menuitem', { name: 'Perfil', exact: true })).toBeFocused();
    await noSeriousAxe(page);
    await capture(page, 'user-menu-simplified');
    await context.close();
  });

  test('captures the closed and connected Home context selector states', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await login(context);
    const page = await context.newPage();
    await page.goto(web);
    await capture(page, 'topbar-home-selectors-closed');

    const organization = page.getByRole('button', { name: /Organización activa/ });
    await organization.click();
    await expect(page.getByRole('menu', { name: 'Negocios disponibles' })).toBeVisible();
    await capture(page, 'topbar-home-organization-open');
    await page.keyboard.press('Escape');

    const branch = page.getByRole('button', { name: /Sucursal activa/ });
    await branch.click();
    await expect(page.getByRole('menu', { name: 'Sucursales disponibles' })).toBeVisible();
    await capture(page, 'topbar-home-branch-open');
    await context.close();
  });

  test('artwork parallax is desktop-only and reduced motion is static', async ({ browser }) => {
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await login(desktop);
    const page = await desktop.newPage();
    await page.goto(web);
    const scene = page.locator('.nexo-living-scene');
    await expect(page.locator('.nexo-living-scene__authenticated-artwork')).toBeVisible();
    await page.waitForTimeout(250);
    await page.mouse.move(1200, 700);
    await expect
      .poll(() => scene.evaluate((element) => element.style.getPropertyValue('--nexo-artwork-x')))
      .not.toBe('');
    await capture(page, 'home-artwork-parallax');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.locator('.nexo-living-scene')).toHaveClass(/is-static/);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.locator('.nexo-living-scene')).not.toHaveClass(/is-static/);
    await desktop.close();

    const reduced = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    await login(reduced);
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(`${web}/reports`);
    await expect(reducedPage.locator('.nexo-living-scene__authenticated-artwork')).toHaveCSS(
      'animation-name',
      'none',
    );
    await capture(reducedPage, 'reports-reduced-motion');
    await reduced.close();
  });

  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 1512, height: 982 },
    { width: 1366, height: 768 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 568, height: 320 },
  ]) {
    test(`selectors and artwork remain contained at ${viewport.width}x${viewport.height}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ viewport });
      await login(context);
      const page = await context.newPage();
      await page.goto(web);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
      await expect(page.locator('.nexo-living-scene__authenticated-artwork')).toHaveCount(1);
      if (viewport.width <= 780) {
        const drawer = page.getByRole('button', { name: 'Abrir navegación' });
        await drawer.click();
        const selector = page.getByRole('button', { name: 'Cambiar organización o sucursal' });
        await selector.click();
        const menu = page.getByRole('menu', { name: 'Sucursales disponibles' });
        await expect(menu).toBeVisible();
        const box = await menu.boundingBox();
        expect(box?.x ?? -1).toBeGreaterThanOrEqual(12);
        expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport.width - 12);
      }
      await capture(page, `responsive-${viewport.width}x${viewport.height}`);
      await context.close();
    });
  }
});
