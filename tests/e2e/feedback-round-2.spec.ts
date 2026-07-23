import { expect, test } from '@playwright/test';
import {
  browserAudit,
  createProductForOwnerTest,
  expectClean,
  login,
} from './owner-corrective.helpers';

test('una creación real confirma el servidor y deja feedback visible', async ({ page }) => {
  await login(page);
  const audit = browserAudit(page);
  const card = await createProductForOwnerTest(page, 'Producto negocio real');
  await expect(card).toBeVisible();
  await expect(page.getByText('Cambios guardados.')).toBeVisible();
  await page.reload();
  await expect(card).toBeVisible();
  expectClean(audit);
});
