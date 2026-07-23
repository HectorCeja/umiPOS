import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const story = (id: string, globals = '') => `/iframe.html?id=${id}&viewMode=story${globals}`;

async function analyzeAfterStorybookAxe(page: Page) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await new AxeBuilder({ page }).analyze();
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('Axe is already running'))
        throw error;
      await page.waitForTimeout(200);
    }
  }
  return new AxeBuilder({ page }).analyze();
}

test.describe('NEXO design system', () => {
  for (const id of [
    'foundations-tokens-and-controls--controls',
    'patterns-admin--shell',
    'patterns-feedback--recoverable-states',
    'patterns-pos--operational-shell',
    'patterns-pos--payment-patterns',
    'patterns-cash--overview',
    'patterns-cash--operations',
    'patterns-cash--quarantine',
  ]) {
    test(`${id} has no critical or serious axe violations`, async ({ page }) => {
      await page.goto(story(id));
      await expect(page.locator('#storybook-root')).toBeVisible();
      const results = await analyzeAfterStorybookAxe(page);
      expect(
        results.violations.filter((item) => ['critical', 'serious'].includes(item.impact ?? '')),
      ).toEqual([]);
    });
  }

  test('admin shell keyboard navigation exposes skip link', async ({ page }) => {
    await page.goto(story('patterns-admin--shell'));
    await page.locator('.nexo-app-shell').focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('POS quantity supports keyboard and retains server-labelled totals', async ({ page }) => {
    await page.goto(story('patterns-pos--operational-shell'));
    const quantity = page.getByRole('spinbutton', { name: 'Cantidad' });
    await quantity.fill('3');
    await expect(page.getByLabel('Totales calculados por el servidor')).toContainText('MXN 135.00');
  });

  test('visual baselines cover admin desktop, POS touch, dark and tablet portrait', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(story('patterns-admin--shell'));
    await expect(page).toHaveScreenshot('admin-shell-1366x768.png', { fullPage: true });

    await page.goto(story('patterns-pos--operational-shell'));
    await expect(page).toHaveScreenshot('pos-shell-1366x768.png', { fullPage: true });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(story('patterns-pos--operational-shell'));
    await expect(page).toHaveScreenshot('pos-shell-768x1024.png', { fullPage: true });

    await page.setViewportSize({ width: 430, height: 932 });
    await page.goto(story('foundations-tokens-and-controls--dark-touch'));
    await expect(page).toHaveScreenshot('dark-touch-430x932.png', { fullPage: true });
  });

  test('Cash patterns support keyboard, tablet and deterministic visual states', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(story('patterns-cash--overview'));
    await expect(page).toHaveScreenshot('cash-overview-1024x768.png', { fullPage: true });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(story('patterns-cash--operations'));
    await page.getByLabel('Tipo de movimiento').focus();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Monto')).toBeFocused();
    await expect(page).toHaveScreenshot('cash-operations-768x1024.png', { fullPage: true });

    await page.goto(story('patterns-cash--quarantine', '&globals=theme:dark'));
    await expect(page.getByRole('table', { name: 'Eventos en quarantine' })).toBeVisible();
    await expect(page).toHaveScreenshot('cash-quarantine-dark-768x1024.png', { fullPage: true });
  });
});
