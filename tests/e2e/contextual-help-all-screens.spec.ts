import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  evidence,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('every implemented primary Web screen exposes useful reopenable help', async ({ page }) => {
  test.setTimeout(90_000);
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);
  const routes = [
    ['/', 'Tu negocio, de un vistazo'],
    ['/sales', 'Cada venta cuenta una historia'],
    ['/cash', 'Control claro de cada turno'],
    ['/products', 'Construye un catálogo fácil de vender'],
    ['/inventory', 'Conoce lo que realmente puedes vender'],
    ['/reports', 'Convierte actividad en decisiones'],
    ['/control-plane/settings', 'Haz que NEXO hable como tu negocio'],
    ['/settings/profile', 'Tu identidad en todo NEXO'],
    ['/control-plane/invitations', 'Invita con claridad y control'],
    ['/help', 'Aprende NEXO a tu ritmo'],
  ] as const;
  for (const [route, title] of routes) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    const help = page.locator('.contextual-help');
    await expect(help).toBeVisible();
    const trigger = help.getByRole('button', { name: /Ver guía/ });
    if ((await trigger.getAttribute('aria-expanded')) !== 'true') await trigger.click();
    await expect(help.getByText(title, { exact: true })).toBeVisible();
    await expect(help.locator('.contextual-help__content')).toContainText('Empieza aquí:');
    await expect(help.locator('.contextual-help__content')).toContainText('Después:');
    const slug = route === '/' ? 'home' : route.split('/').filter(Boolean).join('-');
    await evidence(page, `help-${slug}.png`);
  }
  expectClean(audit);
});
