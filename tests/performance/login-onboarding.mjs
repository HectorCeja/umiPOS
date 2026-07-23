import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const out = 'artifacts/login-onboarding-cinematic/performance.json';
await mkdir('artifacts/login-onboarding-cinematic', { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.addInitScript(() => {
  window.__nexoMetrics = { lcp: 0, cls: 0 };
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const last = entries.at(-1);
    if (last) window.__nexoMetrics.lcp = last.startTime;
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries())
      if (!entry.hadRecentInput) window.__nexoMetrics.cls += entry.value;
  }).observe({ type: 'layout-shift', buffered: true });
});
const started = Date.now();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
const metrics = await page.evaluate(() => ({
  ...window.__nexoMetrics,
  navigationMs: performance.getEntriesByType('navigation')[0]?.duration ?? 0,
  resourceBytes: performance
    .getEntriesByType('resource')
    .reduce((sum, entry) => sum + (entry.transferSize ?? 0), 0),
}));
await writeFile(
  out,
  `${JSON.stringify({ measuredAt: new Date().toISOString(), viewport: '1440x900', wallMs: Date.now() - started, ...metrics }, null, 2)}\n`,
);
await browser.close();
