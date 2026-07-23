import { expect, test } from '@playwright/test';
import { browserAudit, expectClean, login, web } from './owner-corrective.helpers';

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 820, height: 560 },
  { width: 768, height: 1024 },
  { width: 390, height: 720 },
]) {
  test(`el contenido conserva scroll en ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await login(page);
    await page.goto(`${web}/cash`);
    await page.waitForLoadState('networkidle');
    const audit = browserAudit(page);
    const scrollSurface = page.locator('.product-shell > .unified-content').first();
    const metrics = await scrollSurface.evaluate((node) => ({
      scrollHeight: node.scrollHeight,
      clientHeight: node.clientHeight,
      overflow: getComputedStyle(node).overflowY,
    }));
    expect(metrics.scrollHeight).toBeGreaterThanOrEqual(metrics.clientHeight);
    expect(metrics.overflow).not.toBe('hidden');
    if (metrics.scrollHeight > metrics.clientHeight) {
      await scrollSurface.evaluate((node) => node.scrollTo(0, node.scrollHeight));
      expect(await scrollSurface.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
    }
    await expect(page.getByRole('heading', { name: 'Administración de Caja' })).toBeVisible();
    expectClean(audit);
  });
}
