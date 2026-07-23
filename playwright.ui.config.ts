import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/ui',
  outputDir: './test-results/ui',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.01 } },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:6006',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'pnpm --filter @nexo/ui exec vite preview --outDir storybook-static --host 127.0.0.1 --port 6006',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: false,
    timeout: 30_000,
  },
  reporter: [['list']],
});
