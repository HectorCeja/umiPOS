import { expect, test } from '@playwright/test';
import { enterAuthenticatedApp } from './premium-ux-part1b.helpers.js';

test('help center offers search, guides, glossary, FAQ, checklist and reset', async ({ page }) => {
  await enterAuthenticatedApp(page);
  await page.goto('http://localhost:3000/help');
  await expect(
    page.getByRole('heading', { name: 'Respuestas que te devuelven al trabajo.' }),
  ).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Buscar en el Centro de ayuda' })).toBeVisible();
  await expect(page.getByText('GLOSARIO')).toBeVisible();
  await expect(page.getByText('PREGUNTAS FRECUENTES')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restablecer ayudas y recorridos' })).toBeVisible();
});
