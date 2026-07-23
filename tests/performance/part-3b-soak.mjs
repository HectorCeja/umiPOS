import { request } from '@playwright/test';
import { execFileSync } from 'node:child_process';

const tenant = '10000000-0000-4000-8000-000000000001';
const branch = '20000000-0000-4000-8000-000000000001';
const seconds = Number(process.env.PART3B_SOAK_SECONDS ?? 1200);
const values = [];
const statuses = new Map();
const samples = [];
const context = await request.newContext({
  baseURL: 'http://127.0.0.1:3001',
  extraHTTPHeaders: { origin: 'http://localhost:3000' },
});
const login = await context.post('/v1/auth/login', {
  data: {
    email: 'alpha.readonly@nexo.local',
    password: process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!',
    deviceFingerprint: `part3b-clean-soak-${Date.now()}`,
    deviceName: 'Part 3B clean soak',
  },
});
if (login.status() !== 200) throw new Error(`login ${login.status()}`);
let csrf = (await context.storageState()).cookies.find(({ name }) => name === 'nexo_csrf')?.value;
if (!csrf) throw new Error('missing CSRF cookie');
let nextRefresh = 600;
const routes = [
  '/health/ready',
  `/v1/organizations/${tenant}/products`,
  `/v1/organizations/${tenant}/analytics/overview?branchId=${branch}&timezone=UTC&interval=day`,
  `/v1/organizations/${tenant}/sales-administration/history?branchId=${branch}`,
];
const started = performance.now();
let nextSample = 0;
while ((performance.now() - started) / 1000 < seconds) {
  const rows = await Promise.all(
    routes.map(async (route) => {
      const at = performance.now();
      try {
        const response = await context.get(route);
        await response.body();
        return { status: response.status(), ms: performance.now() - at };
      } catch {
        return { status: 'NETWORK_ERROR', ms: performance.now() - at };
      }
    }),
  );
  for (const row of rows) {
    values.push(row.ms);
    statuses.set(row.status, (statuses.get(row.status) ?? 0) + 1);
  }
  const elapsed = (performance.now() - started) / 1000;
  if (elapsed >= nextRefresh) {
    const refresh = await context.post('/v1/auth/refresh', { headers: { 'x-csrf-token': csrf } });
    if (refresh.status() !== 200) throw new Error(`refresh ${refresh.status()}`);
    csrf = (await context.storageState()).cookies.find(({ name }) => name === 'nexo_csrf')?.value;
    if (!csrf) throw new Error('missing rotated CSRF cookie');
    nextRefresh += 600;
  }
  if (elapsed >= nextSample) {
    const raw = execFileSync('docker', ['stats', '--no-stream', '--format', '{{json .}}'], {
      encoding: 'utf8',
    });
    samples.push({
      second: Math.round(elapsed),
      stats: raw
        .trim()
        .split('\n')
        .map(JSON.parse)
        .filter(({ Name }) =>
          ['nexo-api-1', 'nexo-worker-1', 'nexo-postgres-1', 'nexo-web-1'].includes(Name),
        )
        .map(({ Name, CPUPerc, MemUsage, PIDs }) => ({ Name, CPUPerc, MemUsage, PIDs })),
    });
    nextSample += 60;
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
values.sort((a, b) => a - b);
const p = (n) =>
  Math.round(values[Math.min(values.length - 1, Math.ceil(values.length * n) - 1)] ?? 0);
console.log(
  JSON.stringify(
    {
      durationSeconds: seconds,
      requests: values.length,
      statuses: Object.fromEntries(statuses),
      p50Ms: p(0.5),
      p95Ms: p(0.95),
      p99Ms: p(0.99),
      minMs: Math.round(values[0] ?? 0),
      maxMs: Math.round(values.at(-1) ?? 0),
      requestsPerSecond: Number(
        (values.length / ((performance.now() - started) / 1000)).toFixed(2),
      ),
      samples,
    },
    null,
    2,
  ),
);
await context.dispose();
