import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('productos y caja ofrecen valores profesionales sin impedir entrada personalizada', async ({
  page,
}) => {
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/products`);
  await expect(page.locator('#product-category-options option[value="Bebidas"]')).toHaveCount(1);
  await expect(page.locator('#product-category-options option[value="Servicios"]')).toHaveCount(1);
  await page.getByLabel('Categoría').fill('Especial de temporada');
  await expect(page.getByLabel('Categoría')).toHaveValue('Especial de temporada');
  await page.goto(`${web}/cash`);
  await expect(page.locator('#cash-name-presets option[value="Caja principal"]')).toHaveCount(1);
  await expect(
    page.locator('#cash-reason-presets option[value="Fondo adicional para cambio"]'),
  ).toHaveCount(1);
  expectClean(audit);
});
