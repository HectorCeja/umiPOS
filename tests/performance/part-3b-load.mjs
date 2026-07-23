import { request } from '@playwright/test';
import { execFileSync } from 'node:child_process';

const tenant = '10000000-0000-4000-8000-000000000001';
const branch = '20000000-0000-4000-8000-000000000001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const durationSeconds = Number(process.env.PART3B_SOAK_SECONDS ?? 600);

const percentile = (values, p) => {
  const sorted = [...values].sort((a, b) => a - b);
  return Math.round(sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)] ?? 0);
};

const summarize = (rows, elapsedMs) => ({
  requests: rows.length,
  statuses: Object.fromEntries(
    [...new Set(rows.map(({ status }) => status))]
      .sort()
      .map((status) => [status, rows.filter((row) => row.status === status).length]),
  ),
  p50Ms: percentile(
    rows.map(({ ms }) => ms),
    0.5,
  ),
  p95Ms: percentile(
    rows.map(({ ms }) => ms),
    0.95,
  ),
  p99Ms: percentile(
    rows.map(({ ms }) => ms),
    0.99,
  ),
  minMs: Math.round(Math.min(...rows.map(({ ms }) => ms))),
  maxMs: Math.round(Math.max(...rows.map(({ ms }) => ms))),
  requestsPerSecond: Number((rows.length / (elapsedMs / 1000)).toFixed(2)),
});

const timed = async (operation) => {
  const start = performance.now();
  try {
    const response = await operation();
    return {
      status: response.status(),
      ms: performance.now() - start,
      body: response.ok() ? await response.json().catch(() => null) : null,
    };
  } catch (error) {
    return { status: 'NETWORK_ERROR', ms: performance.now() - start, error: String(error) };
  }
};

const context = await request.newContext({
  baseURL: 'http://127.0.0.1:3001',
  extraHTTPHeaders: { origin: 'http://localhost:3000' },
});
const login = await context.post('/v1/auth/login', {
  data: {
    email: 'alpha.owner@nexo.local',
    password,
    deviceFingerprint: `part-3b-${Date.now()}`,
    deviceName: 'Part 3B controlled load',
  },
});
if (login.status() !== 200) throw new Error(`login failed: ${login.status()}`);
const state = await context.storageState();
const csrf = state.cookies.find(({ name }) => name === 'nexo_csrf')?.value;
if (!csrf) throw new Error('missing CSRF cookie');
const writeHeaders = (key) => ({ 'x-csrf-token': csrf, 'idempotency-key': key });
const salePayload = {
  branchId: branch,
  currency: 'MXN',
  channel: 'WEB_POS',
  businessDate: '2026-07-22',
  notes: 'PART3B_CONTROLLED_FIXTURE',
};
const urls = {
  health: '/health/ready',
  products: `/v1/organizations/${tenant}/products`,
  analytics: `/v1/organizations/${tenant}/analytics/overview?branchId=${branch}&timezone=UTC&interval=day`,
};

for (let warm = 0; warm < 10; warm++) {
  await Promise.all([
    context.get(urls.health),
    context.get(urls.products),
    context.get(urls.analytics),
  ]);
}

const baseline = {};
for (const [name, url] of Object.entries(urls)) {
  const started = performance.now();
  const rows = await Promise.all(Array.from({ length: 30 }, () => timed(() => context.get(url))));
  baseline[name] = summarize(rows, performance.now() - started);
}

const sameKey = `part3b-same-${crypto.randomUUID()}`;
const sameStarted = performance.now();
const sameRows = await Promise.all(
  Array.from({ length: 100 }, () =>
    timed(() =>
      context.post(`/v1/organizations/${tenant}/sales`, {
        headers: writeHeaders(sameKey),
        data: salePayload,
      }),
    ),
  ),
);
const sameElapsed = performance.now() - sameStarted;
const sameIds = new Set(sameRows.filter(({ body }) => body?.id).map(({ body }) => body.id));

const divergent = await timed(() =>
  context.post(`/v1/organizations/${tenant}/sales`, {
    headers: writeHeaders(sameKey),
    data: { ...salePayload, notes: 'PART3B_DIVERGENT' },
  }),
);

const uniqueStarted = performance.now();
const uniqueRows = await Promise.all(
  Array.from({ length: 100 }, (_, index) => {
    const key = `part3b-unique-${index}-${crypto.randomUUID()}`;
    return timed(() =>
      context.post(`/v1/organizations/${tenant}/sales`, {
        headers: writeHeaders(key),
        data: salePayload,
      }),
    );
  }),
);
const uniqueElapsed = performance.now() - uniqueStarted;
const uniqueIds = new Set(uniqueRows.filter(({ body }) => body?.id).map(({ body }) => body.id));

const analyticsStarted = performance.now();
const analyticsRows = await Promise.all(
  Array.from({ length: 100 }, () => timed(() => context.get(urls.analytics))),
);
const analyticsElapsed = performance.now() - analyticsStarted;
const analyticsBodies = new Set(
  analyticsRows.filter(({ body }) => body).map(({ body }) => JSON.stringify(body)),
);

const spikeStarted = performance.now();
const spikeRows = await Promise.all(
  Array.from({ length: 250 }, () => timed(() => context.get(urls.products))),
);
const spikeElapsed = performance.now() - spikeStarted;

const soakRows = [];
const memory = [];
const soakStarted = performance.now();
let nextMemory = 0;
while ((performance.now() - soakStarted) / 1000 < durationSeconds) {
  const round = await Promise.all([
    timed(() => context.get(urls.products)),
    timed(() => context.get(urls.analytics)),
    timed(() => context.get(urls.health)),
    timed(() => context.get(urls.products)),
  ]);
  soakRows.push(...round);
  const elapsed = (performance.now() - soakStarted) / 1000;
  if (elapsed >= nextMemory) {
    const raw = execFileSync('docker', ['stats', '--no-stream', '--format', '{{json .}}'], {
      encoding: 'utf8',
    });
    memory.push({
      second: Math.round(elapsed),
      stats: raw
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line))
        .filter(({ Name }) =>
          ['nexo-api-1', 'nexo-worker-1', 'nexo-postgres-1', 'nexo-web-1'].includes(Name),
        )
        .map(({ Name, CPUPerc, MemUsage, PIDs }) => ({ Name, CPUPerc, MemUsage, PIDs })),
    });
    nextMemory += 60;
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
const recoveryStarted = performance.now();
const recoveryRows = await Promise.all(
  Array.from({ length: 30 }, () => timed(() => context.get(urls.health))),
);

console.log(
  JSON.stringify(
    {
      configuration: {
        warmupPerRoute: 10,
        baselineSamples: 30,
        sameKeyRequests: 100,
        uniqueSaleRequests: 100,
        analyticsConcurrent: 100,
        productSpike: 250,
        soakSeconds: durationSeconds,
        soakConcurrencyPerSecond: 4,
      },
      baseline,
      sameKey: { ...summarize(sameRows, sameElapsed), logicalIds: sameIds.size },
      divergent: { status: divergent.status, ms: Math.round(divergent.ms) },
      uniqueSales: { ...summarize(uniqueRows, uniqueElapsed), logicalIds: uniqueIds.size },
      analytics: {
        ...summarize(analyticsRows, analyticsElapsed),
        distinctBodies: analyticsBodies.size,
      },
      spike: summarize(spikeRows, spikeElapsed),
      soak: summarize(soakRows, performance.now() - soakStarted),
      memory,
      recovery: {
        ...summarize(recoveryRows, performance.now() - recoveryStarted),
        recoveryMs: Math.round(performance.now() - recoveryStarted),
      },
    },
    null,
    2,
  ),
);
await context.dispose();
