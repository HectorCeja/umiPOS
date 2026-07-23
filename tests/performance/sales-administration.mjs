import { writeFile, mkdir } from 'node:fs/promises';
const base = 'http://127.0.0.1:3001',
  tenant = '10000000-0000-4000-8000-000000000001',
  branch = '20000000-0000-4000-8000-000000000001',
  samples = 20;
const login = await fetch(`${base}/v1/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
  body: JSON.stringify({
    email: 'alpha.owner@nexo.local',
    password: process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!',
    deviceFingerprint: `sales-perf-${Date.now()}`,
    deviceName: 'Sales admin performance',
  }),
});
if (!login.ok) throw new Error(`login ${login.status}`);
const cookie = login.headers
  .getSetCookie()
  .map((v) => v.split(';')[0])
  .join('; ');
const historyPath = `/v1/organizations/${tenant}/sales-administration/history?branchId=${branch}`;
const first = await fetch(base + historyPath, { headers: { cookie } });
const page = await first.json();
const saleId = page.items?.[0]?.id;
const operations = {
  overview: `/v1/organizations/${tenant}/sales-administration/overview?branchId=${branch}`,
  history: historyPath,
  filteredHistory: `${historyPath}&status=COMPLETED`,
  refunds: `/v1/organizations/${tenant}/sales-administration/refunds?branchId=${branch}`,
  receipts: `/v1/organizations/${tenant}/sales-administration/receipts?branchId=${branch}`,
  exceptions: `/v1/organizations/${tenant}/sales-administration/exceptions?branchId=${branch}`,
  ...(saleId
    ? {
        detail: `/v1/organizations/${tenant}/sales-administration/${saleId}/detail`,
        timeline: `/v1/organizations/${tenant}/sales-administration/${saleId}/timeline`,
        diagnostic: `/v1/organizations/${tenant}/sales-administration/${saleId}/diagnostic`,
      }
    : {}),
};
const report = {
  date: new Date().toISOString(),
  environment: 'local warmed Docker Compose',
  hardware: `${process.platform}/${process.arch}`,
  dataset: 'repeatable seed',
  samples,
  operations: {},
};
for (const [name, path] of Object.entries(operations)) {
  await fetch(base + path, { headers: { cookie } });
  const values = [];
  for (let i = 0; i < samples; i++) {
    const start = performance.now();
    const response = await fetch(base + path, { headers: { cookie } });
    if (!response.ok) throw new Error(`${name} ${response.status}`);
    await response.arrayBuffer();
    values.push(performance.now() - start);
  }
  values.sort((a, b) => a - b);
  report.operations[name] = {
    p50: +values[Math.floor(values.length * 0.5)].toFixed(2),
    p95: +values[Math.floor(values.length * 0.95)].toFixed(2),
    max: +values.at(-1).toFixed(2),
    budgetMs: name === 'detail' ? 200 : name === 'exceptions' || name === 'diagnostic' ? 300 : 250,
  };
}
await mkdir('artifacts/sales-administration', { recursive: true });
await writeFile('artifacts/sales-administration/performance.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
