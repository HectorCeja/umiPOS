import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import os from 'node:os';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const samples = { login: [], home: [], navigation: [], commandPalette: [] };
for (let index = 0; index < 10; index += 1) {
  const loginStart = performance.now();
  await page.goto('http://localhost:3000/');
  await page.getByRole('heading', { name: 'Bienvenido de nuevo' }).waitFor();
  samples.login.push(performance.now() - loginStart);
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  const homeStart = performance.now();
  await page.getByRole('heading', { name: /Héctor/ }).waitFor();
  samples.home.push(performance.now() - homeStart);
  const paletteStart = performance.now();
  await page.keyboard.press('Control+K');
  await page.getByRole('dialog').waitFor();
  samples.commandPalette.push(performance.now() - paletteStart);
  await page.keyboard.press('Escape');
  const navigationStart = performance.now();
  await page.goto('http://localhost:3000/sales');
  await page.getByRole('heading', { name: 'Ventas' }).waitFor();
  samples.navigation.push(performance.now() - navigationStart);
  await page.context().clearCookies();
}
const percentile = (values, fraction) => {
  const sorted = [...values].sort((a, b) => a - b);
  return Number(sorted[Math.ceil(sorted.length * fraction) - 1].toFixed(2));
};
const report = Object.fromEntries(
  Object.entries(samples).map(([operation, values]) => [
    operation,
    {
      samples: values.length,
      p50Ms: percentile(values, 0.5),
      p95Ms: percentile(values, 0.95),
      maxMs: Number(Math.max(...values).toFixed(2)),
    },
  ]),
);
await writeFile(
  'artifacts/product-polish/performance.json',
  JSON.stringify(
    {
      measuredAt: new Date().toISOString(),
      environment: 'local Docker, warmed, Chromium headless',
      hardware: `${os.cpus()[0]?.model ?? 'unknown'}, ${String(Math.round(os.totalmem() / 1024 ** 3))} GiB`,
      report,
    },
    null,
    2,
  ),
);
await browser.close();
