import { request } from '@playwright/test';
import { spawn } from 'node:child_process';

const tenant = '10000000-0000-4000-8000-000000000001';
const branch = '20000000-0000-4000-8000-000000000001';
const context = await request.newContext({
  baseURL: 'http://127.0.0.1:3001',
  extraHTTPHeaders: { origin: 'http://localhost:3000' },
  timeout: 20_000,
});
const login = await context.post('/v1/auth/login', {
  data: {
    email: 'alpha.owner@nexo.local',
    password: process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!',
    deviceFingerprint: `part3b-lock-${Date.now()}`,
    deviceName: 'Part 3B lock probe',
  },
});
if (login.status() !== 200) throw new Error(`login ${login.status()}`);
const csrf = (await context.storageState()).cookies.find(({ name }) => name === 'nexo_csrf')?.value;
const key = `part3b-lock-sale-${crypto.randomUUID()}`;
const created = await context.post(`/v1/organizations/${tenant}/sales`, {
  headers: { 'x-csrf-token': csrf, 'idempotency-key': key },
  data: {
    branchId: branch,
    currency: 'MXN',
    channel: 'API',
    businessDate: '2026-07-22',
    notes: 'PART3B_LOCK_PROBE',
  },
});
if (created.status() !== 201) throw new Error(`create ${created.status()}`);
const sale = await created.json();
const sql = `BEGIN; SELECT id FROM sales WHERE tenant_id='${tenant}' AND id='${sale.id}' FOR UPDATE; SELECT pg_sleep(8); ROLLBACK;`;
const locker = spawn(
  'docker',
  [
    'compose',
    'exec',
    '-T',
    'postgres',
    'sh',
    '-lc',
    `psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "${sql}"`,
  ],
  { cwd: process.cwd(), stdio: 'ignore' },
);
const lockerDone = new Promise((resolve, reject) => {
  locker.once('exit', resolve);
  locker.once('error', reject);
});
await new Promise((resolve) => setTimeout(resolve, 500));
const started = performance.now();
const response = await context.post(`/v1/organizations/${tenant}/sales/${sale.id}/cancel`, {
  headers: {
    'x-csrf-token': csrf,
    'idempotency-key': `part3b-lock-cancel-${crypto.randomUUID()}`,
    'if-match': String(sale.version),
  },
  data: { reason: 'Controlled lock timeout probe' },
});
const elapsedMs = Math.round(performance.now() - started);
await lockerDone;
console.log(
  JSON.stringify(
    {
      saleId: sale.id,
      lockHeldMs: 8000,
      responseStatus: response.status(),
      responseElapsedMs: elapsedMs,
      responseBody: await response.json().catch(() => null),
    },
    null,
    2,
  ),
);
await context.dispose();
