import { defineConfig } from '@playwright/test';

const lifecycleTests = [
  '**/commerce-domain-closure.spec.ts',
  '**/failure-resilience-certification.spec.ts',
  '**/sales-foundation-certification.spec.ts',
];
const lifecyclePhase = process.env.NEXO_E2E_PHASE;
const reportRoot = process.env.NEXO_E2E_REPORT_ROOT;
const reportPhase = lifecyclePhase ?? 'all';
const visualSuites =
  /Control Plane visual regression|Sales Administration deterministic visual baselines/;
const securitySuites = /Part 1A abuse protection certification/;

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: lifecyclePhase === 'functional' ? lifecycleTests : undefined,
  testMatch: lifecyclePhase === 'lifecycle' ? lifecycleTests : undefined,
  grep: lifecyclePhase === 'visual' ? visualSuites : undefined,
  grepInvert:
    lifecyclePhase === 'functional'
      ? new RegExp(`${visualSuites.source}|${securitySuites.source}`)
      : undefined,
  ...(lifecyclePhase === 'security' ? { grep: securitySuites } : {}),
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  use: {
    baseURL: process.env.E2E_API_URL ?? 'http://127.0.0.1:3001',
    trace: 'retain-on-failure',
  },
  outputDir: reportRoot ? `${reportRoot}/${reportPhase}/test-results` : 'test-results',
  reporter: reportRoot
    ? [
        ['list'],
        ['json', { outputFile: `${reportRoot}/${reportPhase}/results.json` }],
        ['junit', { outputFile: `${reportRoot}/${reportPhase}/results.xml` }],
        ['html', { open: 'never', outputFolder: `${reportRoot}/${reportPhase}/html` }],
      ]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
});
