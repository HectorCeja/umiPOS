import { chromium } from '@playwright/test';
import { mkdir, copyFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('../../artifacts/flutter-design-parity/part-2');
const screenshots = path.join(root, 'screenshots');
const videos = path.join(root, 'videos');
const goldens = path.join(root, 'goldens');
await Promise.all(
  [screenshots, videos, goldens, path.join(root, 'diffs')].map((dir) =>
    mkdir(dir, { recursive: true }),
  ),
);

const browser = await chromium.launch({ headless: true });
const scenarios = [
  ['buttons-and-states', async (page) => page.mouse.move(180, 220)],
  [
    'form-interactions',
    async (page) => {
      await page.mouse.wheel(0, 420);
      await page.mouse.click(320, 330);
      await page.keyboard.type('Fixture accesible');
    },
  ],
  [
    'dialog-and-focus',
    async (page) => {
      await page.mouse.wheel(0, 1750);
      await page.mouse.click(130, 610);
    },
  ],
  [
    'sheet-adaptive',
    async (page) => {
      await page.mouse.wheel(0, 1750);
      await page.mouse.click(300, 610);
    },
  ],
  [
    'menu-keyboard',
    async (page) => {
      await page.mouse.wheel(0, 1750);
      await page.mouse.click(480, 610);
      await page.keyboard.press('ArrowDown');
    },
  ],
  ['product-grid-responsive', async (page) => page.mouse.wheel(0, 780)],
  ['table-toolbar-responsive', async (page) => page.mouse.wheel(0, 2600)],
  ['reduced-motion', async (page) => page.mouse.wheel(0, 1300)],
];

for (const [name, action] of scenarios) {
  const context = await browser.newContext({
    viewport: name.includes('responsive')
      ? { width: 390, height: 844 }
      : { width: 1280, height: 720 },
    reducedMotion: name === 'reduced-motion' ? 'reduce' : 'no-preference',
    recordVideo: { dir: videos, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4179', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await action(page);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(screenshots, `${name}.png`), fullPage: false });
  const video = page.video();
  await context.close();
  if (video) await video.saveAs(path.join(videos, `${name}.webm`));
}
await browser.close();

const sourceGoldens = path.resolve('test/goldens');
for (const file of await readdir(sourceGoldens)) {
  if (file.startsWith('components.'))
    await copyFile(path.join(sourceGoldens, file), path.join(goldens, file));
}
await writeFile(
  path.join(root, 'capture-manifest.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), scenarios: scenarios.map(([name]) => name), fixtures: 'visual-only' }, null, 2)}\n`,
);
