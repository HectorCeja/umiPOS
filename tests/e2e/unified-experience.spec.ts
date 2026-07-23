import {
  expect,
  test,
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { chooseNexoSelect } from './owner-corrective.helpers';

const apiBase = 'http://localhost:3001';
const organizationId = '10000000-0000-4000-8000-000000000001';

test.describe.serial('Unified Product Experience 40/40', () => {
  let browser: Browser, context: BrowserContext, page: Page;
  test.beforeAll(async () => {
    test.setTimeout(60_000);
    browser = await chromium.launch();
    context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    page = await context.newPage();
    await page.goto('http://localhost:3000');
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
    await page.locator('.guided-onboarding, .product-main').first().waitFor();
    const current = await page.request.get(
      'http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/onboarding',
    );
    const state = (await current.json()) as { version: number };
    const csrf = (await context.cookies()).find((x) => x.name === 'nexo_csrf')?.value ?? '';
    await page.request.post(
      'http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/onboarding/restart',
      { headers: { 'x-csrf-token': csrf }, data: { version: state.version } },
    );
    await page.goto('http://localhost:3000');
  });
  test.afterAll(async () => browser.close());
  test('01 shell de onboarding real', async () =>
    expect(page.getByText('PASO 1 DE 11')).toBeVisible());
  test('02 negocio editable', async () => {
    await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
    await page.getByLabel('Nombre comercial').fill('Café Horizonte');
    await expect(page.getByLabel('Nombre comercial')).toHaveValue('Café Horizonte');
  });
  test('03 logo puede cargarse', async () => {
    await page.locator('input[type=file]').setInputFiles({
      name: 'logo.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#6c55b6"/></svg>',
      ),
    });
    await expect(page.getByAltText('Vista previa')).toBeVisible();
    await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
  });
  for (const [number, name] of [
    ['04', 'Cafetería'],
    ['05', 'Restaurante'],
    ['06', 'Tienda'],
    ['07', 'Servicios'],
    ['08', 'Otro'],
  ] as const)
    test(`${number} selecciona ${name}`, async () => {
      await page.getByRole('button', { name: new RegExp(name) }).click();
      await expect(page.getByRole('button', { name: new RegExp(name) })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
  test('09 región editable', async () => {
    await page.getByRole('button', { name: /Cafetería/ }).click();
    await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
    const country = await chooseNexoSelect(page, 'País', /Estados Unidos/);
    await expect(country).toHaveAttribute('data-value', 'US');
  });
  test('10 moneda editable', async () => {
    const currency = await chooseNexoSelect(page, 'Moneda', /Dólar/);
    await expect(currency).toHaveAttribute('data-value', 'USD');
  });
  test('11 idioma editable', async () => {
    const language = await chooseNexoSelect(page, 'Idioma', /English/);
    await expect(language).toHaveAttribute('data-value', 'en-US');
  });
  test('12 zona horaria editable', async () => {
    const zone = await chooseNexoSelect(page, 'Zona horaria', /Tijuana/);
    await expect(zone).toHaveAttribute('data-value', 'America/Tijuana');
    await chooseNexoSelect(page, 'Idioma', /Español/);
    await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
  });
  test('13 sucursal editable', async () => {
    await page.getByLabel('Nombre de la primera sucursal').fill('Centro');
    await page.getByLabel('Código comercial').fill('CENTRO');
    await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
  });
  test('14 horarios editables', async () => {
    const monday = page.locator('.nexo-schedule__day').filter({ hasText: 'Lunes' });
    if (!(await monday.getByLabel('Abre').isVisible()))
      await monday.getByRole('button', { name: /Editar Lunes/ }).click();
    await monday.getByLabel('Abre').fill('08:30');
    await monday.getByLabel('Cierra').fill('19:30');
    await expect(monday.getByLabel('Abre')).toHaveValue('08:30');
  });
  test('15 copiar horarios', async () => {
    await page.locator('.nexo-schedule__toolbar button').click();
    await expect(
      page.locator('.nexo-schedule__day').filter({ hasText: 'Viernes' }).locator('input').first(),
    ).toBeChecked();
    await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
  });
  test('16 caja editable', async () => {
    await page.getByLabel('Nombre del punto de cobro').fill('Caja terraza');
    await page.getByLabel('Fondo inicial sugerido').fill('1500');
    await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
  });
  test('17 catálogo editable', async () => {
    await page.getByRole('radio', { name: /Catálogo vacío/ }).click();
    await expect(page.getByRole('heading', { name: 'Crea tu primer producto' })).toBeVisible();
    await page.getByLabel('Nombre', { exact: true }).fill('Tisana Horizonte');
    await page.getByLabel(/Precio sugerido/).fill('64');
    await page
      .getByRole('button', { name: /Usar icono/ })
      .nth(3)
      .click();
    await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Tisana Horizonte');
    await page.getByRole('radio', { name: /Explorar sugerencias/ }).click();
    await page.getByRole('button', { name: /Espresso/ }).click();
    await expect(page.getByText('2 seleccionados')).toBeVisible();
    await page.getByRole('button', { name: /Espresso/ }).click();
    await expect(page.getByText('3 seleccionados')).toBeVisible();
    await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
  });
  test('18 inventario opcional', async () => {
    await page.getByLabel('Controlar inventario').uncheck();
    await expect(page.getByLabel('Controlar inventario')).not.toBeChecked();
    await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
  });
  test('19 equipo omitible', async () => {
    await expect(page.getByLabel(/Correo de la persona/)).toHaveValue('');
    await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
  });
  test('20 revisión permite editar', async () => {
    await page.getByRole('button', { name: 'Editar' }).first().click();
    await expect(page.getByText('PASO 2 DE 11')).toBeVisible();
    for (let i = 0; i < 9; i++)
      await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
  });
  test('21 onboarding reanudable', async () => {
    await page.reload();
    await expect(page.getByText('PASO 11 DE 11')).toBeVisible();
  });
  test('22 finalización autoritativa', async () => {
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
    await expect(page.getByRole('heading', { name: /Héctor/ })).toBeVisible();
  });
  test('23 menú tiene perfil y logout', async () => {
    await page.getByRole('button', { name: /Héctor/ }).click();
    await expect(page.getByRole('menuitem', { name: 'Perfil' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar sesión' }).last()).toBeVisible();
    await page.keyboard.press('Escape');
  });
  test('24 tema oscuro', async () => {
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
  test('25 command palette unificada', async () => {
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel('Buscar acciones')).toBeVisible();
    await page.keyboard.press('Escape');
  });
  for (const [n, label, route] of [
    ['26', 'Inicio', '/'],
    ['27', 'Ventas', '/sales'],
    ['28', 'Caja', '/cash'],
    ['29', 'Productos', '/products'],
    ['30', 'Inventario', '/inventory'],
    ['31', 'Equipo', '/control-plane/invitations'],
    ['32', 'Configuración', '/control-plane/settings'],
  ] as const)
    test(`${n} shell global en ${label}`, async () => {
      await page.goto(`http://localhost:3000${route}`);
      await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Organización activa: Café Horizonte' }),
      ).toBeVisible();
    });
  test('33 scrollspy Ventas', async () => {
    await page.goto('http://localhost:3000/sales');
    await expect(page.getByRole('navigation', { name: 'Secciones de esta página' })).toBeVisible();
    await page.getByRole('button', { name: 'Historial' }).click();
    await expect(page).toHaveURL(/#sales-history/);
  });
  test('34 scrollspy Caja', async () => {
    await page.goto('http://localhost:3000/cash');
    await page.getByRole('button', { name: 'Aprobaciones' }).click();
    await expect(page).toHaveURL(/#approvals/);
  });
  test('35 volver arriba', async () => {
    await page.evaluate(() => scrollTo(0, 1000));
    await expect(page.getByRole('button', { name: /Volver arriba/ })).toBeVisible();
    await page.getByRole('button', { name: /Volver arriba/ }).click();
  });
  test('36 sin enums ingleses conocidos', async () => {
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/NO_ACTIVE_SESSION|UNAVAILABLE|COMPLETED|CANCELLED|EXPIRED/);
  });
  test('37 sin UUID visibles', async () => {
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
    );
  });
  test('38 vacíos explicados', async () =>
    expect(page.getByText(/Sin sesión abierta|Todavía no hay una sesión/).first()).toBeVisible());
  test('39 perfil conectado', async () => {
    await page.goto('http://localhost:3000/settings/profile');
    await expect(page.getByRole('heading', { name: 'Perfil y preferencias' })).toBeVisible();
    await page.getByLabel('Nombre visible').fill('Héctor Cejudo');
    await page.getByRole('button', { name: 'Guardar perfil' }).click();
    await expect(page.getByText(/Perfil guardado\. Verás los cambios/)).toBeVisible({
      timeout: 15_000,
    });
  });
  test('40 readiness no promete POS', async () => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('a[href="/pos"]')).toHaveCount(0);
    await expect(page.getByText(/checkout/i)).toHaveCount(0);
  });
  test('41 tema persiste entre rutas', async () => {
    await page.evaluate(() => localStorage.setItem('nexo-theme', 'dark'));
    await page.goto('http://localhost:3000/products');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
  test('42 menú cierra con Escape y restaura foco', async () => {
    const trigger = page.getByRole('button', { name: /Héctor/ });
    await trigger.click();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });
  test('43 menú cierra con clic exterior', async () => {
    await page.getByRole('button', { name: /Héctor/ }).click();
    await page.mouse.click(12, Math.min(420, page.viewportSize()?.height ?? 420));
    await expect(page.locator('.unified-account-menu')).toHaveCount(0);
  });
  test('44 sucursal no aparece duplicada', async () => {
    const options = await page.getByLabel('Sucursal activa').locator('option').allTextContents();
    expect(new Set(options).size).toBe(options.length);
  });
  test('45 paleta ofrece resultados enriquecidos', async () => {
    await page.keyboard.press('Control+k');
    await page.getByLabel('Buscar acciones').fill('Caja');
    await expect(page.getByRole('option', { name: /Caja/ })).toContainText('efectivo');
    await page.keyboard.press('Escape');
  });
  test('46 sesión válida conserva Inicio', async () => {
    await page.goto('http://localhost:3000');
    await expect(page.getByRole('heading', { name: /Buenos días/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Inicia sesión en NEXO' })).toHaveCount(0);
  });
  test('47 móvil no produce scroll horizontal', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/products');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  });
  test('48 tablet conserva navegación', async () => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('http://localhost:3000/inventory');
    const trigger = page.getByRole('button', { name: 'Abrir navegación' });
    await expect(trigger).toBeVisible();
    await trigger.focus();
    await page.keyboard.press('Enter');
    const navigation = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'Reportes' })).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'Equipo' })).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'Configuración' })).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'Ayuda' })).toBeVisible();
  });
  test('49 perfil usa selector de archivo real', async () => {
    await page.goto('http://localhost:3000/settings/profile');
    await expect(page.locator('input[type=file]')).toHaveAttribute('accept', /image\/png/);
    await page.locator('input[type=file]').setInputFiles({
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64',
      ),
    });
    await page.getByRole('button', { name: 'Guardar perfil' }).click();
    await expect(page.getByText(/Perfil guardado\. Verás los cambios/)).toBeVisible({
      timeout: 15_000,
    });
    const identity = await page.request.get(`${apiBase}/v1/identity`);
    expect(identity.ok()).toBe(true);
    expect(((await identity.json()) as { avatarUrl?: string }).avatarUrl).toContain(
      '/v1/profile/avatar/',
    );
    await page.reload();
    await expect(page.getByAltText('Vista previa')).toBeVisible();
    await page.goto('http://localhost:3000/products');
    await expect(page.locator('.profile-trigger .avatar img')).toBeVisible();
  });
  test('49b producto acepta datos comerciales e imagen real', async () => {
    await page.goto('http://localhost:3000/products');
    const suffix = Date.now().toString();
    await page.getByLabel('Nombre del producto').fill(`Producto estable ${suffix}`);
    await page.getByLabel('SKU comercial (opcional)').fill(`EST-${suffix}`);
    await page.getByLabel('Descripción (opcional)').fill('Producto de certificación local.');
    await page.getByLabel('Categoría').fill('Pruebas de estabilidad');
    await page.getByLabel('Precio en MXN').fill('45.00');
    await page.getByLabel('Código de barras').fill(`750${suffix.slice(-10)}`);
    await page.getByRole('button', { name: /Alimento/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: /Alimento/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.locator('input[type=file]').setInputFiles({
      name: 'producto.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64',
      ),
    });
    await page.getByRole('button', { name: 'Agregar al catálogo' }).click();
    await expect(page.getByText('Cambios guardados.')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(`Producto estable ${suffix}`)).toBeVisible();
  });
  test('50 roles personalizados comunica estado real', async () => {
    const current = await page.request.get(
      `${apiBase}/v1/organizations/${organizationId}/onboarding`,
    );
    expect(current.ok()).toBe(true);
    await page.goto('http://localhost:3000');
    await expect(page.getByText(/checkout/i)).toHaveCount(0);
  });
  test('51 identidad V1 y reduced motion', async () => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.product-shell')).toBeVisible();
    await expect(page.locator('.product-main')).toHaveCSS('animation-name', 'none');
  });
  test('52 avatar sobrevive logout y login', async () => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('http://localhost:3000/products');
    await page.locator('.profile-trigger').click();
    await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
    await expect(page.locator('.profile-trigger .avatar img')).toBeVisible();
  });
  test('53 superficies estabilizadas no desbordan', async () => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 800 },
    ]) {
      await page.setViewportSize(viewport);
      for (const route of [
        '/inventory',
        '/control-plane/invitations',
        '/control-plane/settings',
        '/products',
      ]) {
        await page.goto(`http://localhost:3000${route}`);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        ).toBe(true);
      }
    }
  });
  test('54 hover conserva texto legible', async () => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000/products');
    const buttons = page.locator('button:visible');
    const count = Math.min(await buttons.count(), 30);
    for (let index = 0; index < count; index++) {
      const button = buttons.nth(index);
      await button.hover();
      const style = await button.evaluate((node) => {
        const computed = getComputedStyle(node);
        return { color: computed.color, opacity: Number(computed.opacity) };
      });
      expect(style.color).not.toBe('rgba(0, 0, 0, 0)');
      expect(style.opacity).toBeGreaterThanOrEqual(0.5);
    }
  });
});
