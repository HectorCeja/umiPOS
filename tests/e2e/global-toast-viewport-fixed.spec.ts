import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

for (const width of [1280, 390, 320])
  test(`toast permanece dentro del viewport a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 640 });
    await login(page);
    await page.goto(`${web}/cash`);
    await page.getByText('Configurar puntos de cobro', { exact: true }).click();
    const suffix = `${width}-${Date.now()}`;
    await page.getByLabel('Nombre', { exact: true }).fill(`Caja toast ${suffix}`);
    await page.getByLabel('Código', { exact: true }).fill(`TV-${suffix}`);
    const scrollState = () =>
      page.evaluate(() => {
        const candidates = [
          document.scrollingElement,
          ...document.querySelectorAll<HTMLElement>('*'),
        ].filter(Boolean) as HTMLElement[];
        return candidates.sort(
          (a, b) => b.scrollHeight - b.clientHeight - (a.scrollHeight - a.clientHeight),
        )[0]!.scrollTop;
      });
    await page.evaluate(() => {
      const candidates = [
        document.scrollingElement,
        ...document.querySelectorAll<HTMLElement>('*'),
      ].filter(Boolean) as HTMLElement[];
      const target = candidates.sort(
        (a, b) => b.scrollHeight - b.clientHeight - (a.scrollHeight - a.clientHeight),
      )[0]!;
      target.scrollTop = target.scrollHeight;
    });
    const before = await scrollState();
    await page
      .getByRole('button', { name: 'Crear punto de cobro' })
      .evaluate((element: HTMLButtonElement) => {
        element.click();
      });
    const toast = page.locator('body > .nexo-toast-region .nexo-premium-toast');
    await expect(toast).toBeVisible();
    const box = await toast.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(640);
    expect(await scrollState()).toBe(before);
    expect(
      await toast.evaluate((element) => getComputedStyle(element.parentElement!).position),
    ).toBe('fixed');
  });
