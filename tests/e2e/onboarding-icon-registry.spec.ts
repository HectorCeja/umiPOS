import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { setOnboardingStep, web } from './owner-corrective.helpers';
test('onboarding usa el registro SVG oficial sin Unicode legacy', async ({ page }) => {
  execFileSync('pnpm', ['owner:alpha2:reset'], { stdio: 'pipe' });
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.guided-onboarding').waitFor();
  await setOnboardingStep(page, 7);
  const picker = page.locator('.icon-choice-grid');
  await expect(picker.locator('button')).toHaveCount(4);
  await expect(picker.locator('button svg[data-product-icon]')).toHaveCount(4);
  await expect(picker).not.toContainText(/[✦◆❖◉♨☕]/u);
});
