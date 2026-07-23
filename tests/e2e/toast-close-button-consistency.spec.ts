import { expect, test } from '@playwright/test';
import { openCatalog } from './last-two-blockers.helpers';

test('toast y guía comparten NexoIconButton y geometría circular', async ({ page }) => {
  await openCatalog(page);
  const helpClose = page.getByRole('button', { name: /Cerrar ayuda de/ });
  await page.getByRole('button', { name: 'Continuar' }).click();
  const toastClose = page.getByRole('button', { name: 'Cerrar notificación' });
  await expect(toastClose).toBeVisible();
  for (const close of [helpClose, toastClose]) {
    await expect(close).toHaveClass(/nexo-icon-button/);
    await expect(close).toHaveClass(/nexo-overlay-close/);
    const geometry = await close.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        width: box.width,
        height: box.height,
        radius: parseFloat(style.borderRadius),
        border: style.borderStyle,
      };
    });
    expect(Math.abs(geometry.width - geometry.height)).toBeLessThanOrEqual(1);
    expect(geometry.radius).toBeGreaterThanOrEqual(geometry.width / 2 - 1);
  }
});
