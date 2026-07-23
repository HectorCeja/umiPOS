import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('artifacts/flutter-design-parity/part-4');
await Promise.all(
  ['screenshots', 'videos'].map((name) => mkdir(path.join(root, name), { recursive: true })),
);
const browser = await chromium.launch({ headless: true });
for (const scenario of [
  { name: 'catalog-desktop', viewport: { width: 1280, height: 720 } },
  { name: 'catalog-mobile', viewport: { width: 390, height: 844 } },
]) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    recordVideo: { dir: path.join(root, 'videos'), size: scenario.viewport },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4179', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(root, 'screenshots', `${scenario.name}.png`),
    fullPage: true,
  });
  await page.mouse.move(scenario.viewport.width * 0.25, scenario.viewport.height * 0.5);
  await page.waitForTimeout(1200);
  await page.mouse.click(scenario.viewport.width * 0.25, scenario.viewport.height * 0.5);
  await page.waitForTimeout(1800);
  await context.close();
}
await browser.close();
