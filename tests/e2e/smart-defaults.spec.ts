import { expect, test } from '@playwright/test';
import {
  browserAudit,
  chooseCustomNexoSelect,
  chooseNexoSelect,
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
  await chooseNexoSelect(page, 'Categoría', 'Bebidas');
  await chooseNexoSelect(page, 'Categoría', 'Servicios');
  await chooseCustomNexoSelect(page, 'Categoría', 'Especial de temporada');
  await page.goto(`${web}/cash`);
  await page.getByText('Configurar puntos de cobro').click();
  await chooseNexoSelect(page, 'Nombre', 'Caja principal');
  await chooseNexoSelect(page, 'Motivo', 'Fondo adicional para cambio');
  expectClean(audit);
});
