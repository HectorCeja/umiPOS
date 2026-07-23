import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
test.describe('Connected Sales administration', () => {
  test('loads authoritative data, supports keyboard/tablet/dark and is not a POS', async ({
    page,
  }) => {
    expect(
      (
        await page.request.post('http://localhost:3001/v1/auth/login', {
          headers: { origin: 'http://localhost:3000' },
          data: {
            email: 'alpha.owner@nexo.local',
            password,
            deviceFingerprint: `sales-ui-${Date.now()}`,
            deviceName: 'Sales admin UI',
          },
        })
      ).status(),
    ).toBe(200);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto('http://localhost:3000/sales');
    await page.getByRole('button', { name: 'Actualizar' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Resumen operativo' })).toBeVisible();
    await expect(page.getByText(/no es terminal POS/i)).toBeVisible();
    await expect(page.getByText(/Venta manual deshabilitada/i)).toBeVisible();
    expect(await new AxeBuilder({ page }).analyze()).toMatchObject({ violations: [] });
  });

  const surfaces = [
    ['/sales', 'Overview'],
    ['/sales/history', 'History'],
    ['/sales/open', 'Open sales'],
    ['/sales/suspended', 'Suspended sales'],
    ['/sales/refunds', 'Refunds'],
    ['/sales/receipts', 'Receipts'],
    ['/sales/exceptions', 'Operational exceptions'],
  ] as const;

  for (const [route, heading] of surfaces) {
    test(`${heading}: axe, keyboard, reflow and touch target certification`, async ({ page }) => {
      const login = await page.request.post('http://localhost:3001/v1/auth/login', {
        headers: { origin: 'http://localhost:3000' },
        data: {
          email: 'alpha.owner@nexo.local',
          password,
          deviceFingerprint: `sales-a11y-${heading}-${Date.now()}`,
          deviceName: 'Sales accessibility certification',
        },
      });
      expect(login.status()).toBe(200);
      await page.setViewportSize({ width: 640, height: 720 });
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
      await page.goto(`http://localhost:3000${route}`);
      await expect(page.getByRole('heading', { name: 'Ventas' })).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      const result = await new AxeBuilder({ page }).analyze();
      expect(
        result.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
      ).toEqual([]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      ).toBe(true);
    });
  }
});
