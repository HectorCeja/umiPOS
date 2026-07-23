import { expect, test, type BrowserContext } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const artifacts = path.resolve('artifacts/action-button-optical-spacing/after');

async function login(context: BrowserContext) {
  const response = await context.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email: 'alpha.owner@nexo.local',
      password,
      deviceFingerprint: `action-spacing-${Date.now()}`,
      deviceName: 'Action button optical spacing QA',
    },
  });
  expect(response.ok()).toBe(true);
}

test.describe('action button optical spacing', () => {
  test.beforeAll(async () => mkdir(artifacts, { recursive: true }));

  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    test(`${viewport.name} preserves premium breathing and interaction states`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ viewport });
      await login(context);
      const page = await context.newPage();

      for (const [route, label, image] of [
        ['/products', 'Crear producto', `products-${viewport.name}`],
        ['/inventory', 'Abrir productos', `inventory-${viewport.name}`],
      ] as const) {
        await page.goto(`${web}${route}?scene=static`);
        const action = page.getByRole('link', { name: label, exact: true });
        await expect(action).toBeVisible();
        const geometry = await action.evaluate((element) => {
          const style = getComputedStyle(element);
          const bounds = element.getBoundingClientRect();
          return {
            width: bounds.width,
            height: bounds.height,
            paddingLeft: Number.parseFloat(style.paddingLeft),
            paddingRight: Number.parseFloat(style.paddingRight),
            lineHeight: Number.parseFloat(style.lineHeight),
            alignItems: style.alignItems,
            justifyContent: style.justifyContent,
            whiteSpace: style.whiteSpace,
          };
        });
        expect(geometry.width).toBeGreaterThanOrEqual(160);
        expect(geometry.height).toBeGreaterThanOrEqual(44);
        expect(geometry.paddingLeft).toBeGreaterThanOrEqual(24);
        expect(geometry.paddingRight).toBeGreaterThanOrEqual(24);
        expect(geometry.alignItems).toBe('center');
        expect(geometry.justifyContent).toBe('center');
        expect(geometry.whiteSpace).toBe('nowrap');

        await action.hover();
        await expect(action).toBeVisible();
        await action.focus();
        await expect(action).toBeFocused();
        await expect(action).toHaveCSS('outline-style', 'solid');
        await action.evaluate((element) =>
          element.addEventListener('click', (event) => event.preventDefault(), { once: true }),
        );
        const actionBox = await action.boundingBox();
        if (actionBox) {
          await page.mouse.move(
            actionBox.x + actionBox.width / 2,
            actionBox.y + actionBox.height / 2,
          );
          await page.mouse.down();
          await expect(action).toBeVisible();
          await page.mouse.up();
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        ).toBe(true);
        await page.screenshot({ path: path.join(artifacts, `${image}.png`), fullPage: true });
      }
      await context.close();
    });
  }
});
