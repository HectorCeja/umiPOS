import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const output = 'artifacts/design-freeze/directions';
await mkdir(output, { recursive: true });
const server = spawn(
  'pnpm',
  [
    '--filter',
    '@nexo/ui',
    'exec',
    'vite',
    'preview',
    '--outDir',
    'storybook-static',
    '--host',
    '127.0.0.1',
    '--port',
    '6006',
  ],
  { stdio: 'ignore' },
);

try {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:6006');
      if (response.ok) break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const stories = [
    ['hospitality-premium', 'hospitality-premium.png'],
    ['enterprise-modern', 'enterprise-modern.png'],
    ['tech-luxury', 'tech-luxury.png'],
  ];
  for (const [story, file] of stories) {
    await page.goto(
      `http://127.0.0.1:6006/iframe.html?id=design-freeze-three-directions--${story}&viewMode=story`,
    );
    await page.locator('.design-concept').waitFor();
    await page.screenshot({ path: `${output}/${file}`, fullPage: true });
  }
  await browser.close();
} finally {
  server.kill('SIGTERM');
}
