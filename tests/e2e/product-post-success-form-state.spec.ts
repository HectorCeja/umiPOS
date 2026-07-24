import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('formulario de Producto vuelve a estado neutral después del éxito', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/products`);
  await page.getByLabel('Nombre del producto').fill(`Producto neutral ${Date.now()}`);
  await page.getByRole('button', { name: 'Agregar al catálogo' }).click();
  await expect(page.locator('.nexo-premium-toast')).toContainText('Cambios guardados');
  const name = page.getByLabel('Nombre del producto');
  await expect(name).toHaveValue('');
  await expect(name).toHaveAttribute('aria-invalid', 'false');
  await expect
    .poll(() => name.evaluate((element) => element.matches(':user-invalid')), {
      message: 'the remounted product form reaches its neutral native-validity state',
    })
    .toBe(false);
  await expect(page.locator('#new-product [role=alert]')).toHaveCount(0);
});
