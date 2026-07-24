import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

test.describe('Premium product experience', () => {
  test.describe.configure({ mode: 'serial' });
  test('presents a complete login without technical language or identifiers', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
    await expect(page.getByText('Vende mejor.')).toBeVisible();
    await expect(page.getByText(/UUID|infraestructura técnica|no es el POS/i)).toHaveCount(0);
    const violations = (await new AxeBuilder({ page }).analyze()).violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    );
    expect(violations).toEqual([]);
  });

  test('restores identity and explains business context on the Home dashboard', async ({
    page,
  }) => {
    const login = await page.request.post('http://localhost:3001/v1/auth/login', {
      headers: { origin: 'http://localhost:3000' },
      data: {
        email: 'alpha.owner@nexo.local',
        password,
        deviceFingerprint: `premium-home-${Date.now()}`,
        deviceName: 'Premium product experience',
      },
    });
    expect(login.ok()).toBe(true);
    await page.goto('http://localhost:3000/');
    await expect(page.getByRole('heading', { name: /Buenos días, Alpha/ })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Organización activa: Organization Alpha/ }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Sucursal activa: Centro/ })).toBeVisible();
    await expect(page.getByText('Propietario').first()).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
    await expect(page.getByText(/UUID|infraestructura técnica|no es el POS/i)).toHaveCount(0);
    await expect(page.getByText(/Mailpit|Cash Overview|Outbox|Quarantine/i)).toHaveCount(0);
    await page.keyboard.press('Control+K');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('exposes an explicit real logout and returns to login', async ({ page }) => {
    const login = await page.request.post('http://localhost:3001/v1/auth/login', {
      headers: { origin: 'http://localhost:3000' },
      data: {
        email: 'alpha.owner@nexo.local',
        password,
        deviceFingerprint: `product-logout-${Date.now()}`,
        deviceName: 'Product logout',
      },
    });
    expect(login.ok()).toBe(true);
    await page.goto('http://localhost:3000/');
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
  });

  test('keeps technical Cash diagnostics out of primary navigation', async ({ page }) => {
    const login = await page.request.post('http://localhost:3001/v1/auth/login', {
      headers: { origin: 'http://localhost:3000' },
      data: {
        email: 'alpha.owner@nexo.local',
        password,
        deviceFingerprint: `product-cash-${Date.now()}`,
        deviceName: 'Product Cash',
      },
    });
    expect(login.ok()).toBe(true);
    await page.goto('http://localhost:3000/cash');
    await expect(page.getByText('Resumen de caja')).toBeVisible();
    await expect(page.getByRole('link', { name: /Integraciones|Outbox|Quarantine/i })).toHaveCount(
      0,
    );
    await expect(page.getByText('Ver diagnóstico avanzado')).toBeVisible();
  });
});
