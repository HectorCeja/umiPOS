import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { setOnboardingStep, web } from './owner-corrective.helpers';
test('logout está disponible y espera 204 en cualquier paso', async ({ page }) => {
  execFileSync('pnpm', ['owner:alpha2:reset'], { stdio: 'pipe' });
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.guided-onboarding').waitFor();
  await setOnboardingStep(page, 7);
  const response = page.waitForResponse((r) => r.url().endsWith('/v1/auth/logout'));
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  expect((await response).status()).toBe(204);
  await expect(page).toHaveURL(/\/login$/);
});
