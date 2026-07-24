import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('reset post-submit limpia touched, dirty y errores fantasma', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/products`);
  const form = page.locator('#new-product form');
  await form.getByLabel('Nombre del producto').fill(`Reset QA ${Date.now()}`);
  await form.getByRole('button', { name: 'Agregar al catálogo' }).click();
  await expect(page.locator('.nexo-premium-toast')).toContainText('Cambios guardados');
  expect(await form.evaluate((element: HTMLFormElement) => element.matches(':invalid'))).toBe(true);
  await expect
    .poll(
      () =>
        form
          .getByLabel('Nombre del producto')
          .evaluate((element) => element.matches(':user-invalid')),
      { message: 'the remounted form clears native user-interaction validity' },
    )
    .toBe(false);
  await expect(form.locator('.nexo-error')).toHaveCount(0);
});
