import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { setOnboardingStep, web } from './owner-corrective.helpers';
test.use({ video: 'on' });

test('video evidencia de tres prepares reales', async ({ page }) => {
  const summaries = await Promise.all(
    [1, 2, 3].map(async (run) => {
      const log = await readFile(
        `artifacts/owner-final-acceptance-master-part-2c/logs/prepare-${run}.log`,
        'utf8',
      );
      return `PREPARE ${run}\n${log.slice(log.lastIndexOf('NEXO READY'))}`;
    }),
  );
  await page.setContent(
    `<style>body{margin:0;background:#050713;color:#eef1ff;font:18px/1.5 monospace;padding:32px}pre{white-space:pre-wrap;border:1px solid #423a70;border-radius:18px;padding:24px;margin:0 0 24px;background:#10152a}</style>${summaries.map((value) => `<pre>${value}</pre>`).join('')}`,
  );
  await page.locator('pre').last().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1_000);
  await expect(page.getByText('Tiempo total: 68s').last()).toBeVisible();
});

test('video selección y centrado de iconos', async ({ page }) => {
  execFileSync('pnpm', ['owner:alpha2:reset'], { stdio: 'pipe' });
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.guided-onboarding').waitFor();
  await setOnboardingStep(page, 7);
  for (const label of ['Producto físico', 'Servicio', 'Bebida', 'Alimento']) {
    const choice = page.getByRole('button', { name: `Usar icono ${label}` });
    await choice.click();
    await expect(choice).toHaveAttribute('aria-pressed', 'true');
    await page.waitForTimeout(350);
  }
});
