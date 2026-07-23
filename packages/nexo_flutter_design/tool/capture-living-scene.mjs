import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('../../artifacts/flutter-design-parity/part-3');
const videos = path.join(root, 'videos');
const screenshots = path.join(root, 'screenshots');
await Promise.all([videos, screenshots].map((dir) => mkdir(dir, { recursive: true })));
const scenarios = [
  ['variants-sequence', 'home', 'balanced'],
  ['home-womanpos', 'home', 'high'],
  ['products-artwork', 'products', 'high'],
  ['inventory-artwork', 'inventory', 'high'],
  ['reports-artwork', 'reports', 'high'],
  ['administrative-abstract', 'profile', 'balanced'],
  ['ken-burns', 'home', 'high'],
  ['soft-drift', 'products', 'high'],
  ['light-trails', 'reports', 'high'],
  ['pointer-parallax', 'sales', 'high'],
  ['scene-crossfade', 'cash', 'balanced'],
  ['reduced-motion', 'home', 'static'],
  ['reduced-transparency', 'profile', 'reduced'],
  ['quality-modes', 'reports', 'reduced'],
  ['lifecycle-pause-resume', 'inventory', 'balanced'],
  ['product-grid-scene', 'products', 'balanced'],
  ['dialog-sheet-scene', 'cash', 'balanced'],
  ['responsive-crop', 'inventory', 'balanced'],
];
const browser = await chromium.launch({ headless: true });
for (const [name, scene, quality] of scenarios) {
  const mobile = name === 'responsive-crop';
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 720 },
    reducedMotion: name === 'reduced-motion' ? 'reduce' : 'no-preference',
    recordVideo: { dir: videos, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:4179/?scene=${scene}&quality=${quality}`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1200);
  if (name === 'pointer-parallax') {
    await page.mouse.move(1000, 260);
    await page.waitForTimeout(1200);
    await page.mouse.move(620, 360);
  }
  if (name === 'lifecycle-pause-resume') {
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  }
  await page.waitForTimeout(2200);
  await page.screenshot({ path: path.join(screenshots, `${name}.png`) });
  const video = page.video();
  await context.close();
  if (video) await video.saveAs(path.join(videos, `${name}.webm`));
}
await browser.close();
await writeFile(
  path.join(root, 'capture-manifest.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), scenarios: scenarios.map(([name, scene, quality]) => ({ name, scene, quality })), fixtures: 'visual-only' }, null, 2)}\n`,
);
