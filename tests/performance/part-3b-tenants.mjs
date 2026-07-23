import { request } from '@playwright/test';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const fixtures = [
  {
    email: 'alpha.owner@nexo.local',
    tenant: '10000000-0000-4000-8000-000000000001',
    branch: '20000000-0000-4000-8000-000000000001',
  },
  {
    email: 'beta.owner@nexo.local',
    tenant: '10000000-0000-4000-8000-000000000002',
    branch: '20000000-0000-4000-8000-000000000002',
  },
];
for (const fixture of fixtures) {
  fixture.context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  const login = await fixture.context.post('/v1/auth/login', {
    data: {
      email: fixture.email,
      password,
      deviceFingerprint: `part3b-tenant-${fixture.tenant}-${Date.now()}`,
      deviceName: 'Part 3B tenant concurrency',
    },
  });
  if (login.status() !== 200) throw new Error(`${fixture.email} login ${login.status()}`);
  fixture.csrf = (await fixture.context.storageState()).cookies.find(
    ({ name }) => name === 'nexo_csrf',
  )?.value;
}
const stamp = crypto.randomUUID();
const started = performance.now();
const rows = await Promise.all(
  fixtures.flatMap((fixture) =>
    Array.from({ length: 50 }, (_, index) =>
      fixture.context
        .post(`/v1/organizations/${fixture.tenant}/sales`, {
          headers: {
            'x-csrf-token': fixture.csrf,
            'idempotency-key': `part3b-scope-${stamp}-${index}`,
          },
          data: {
            branchId: fixture.branch,
            currency: 'MXN',
            channel: 'API',
            businessDate: '2026-07-22',
            notes: 'PART3B_MULTI_TENANT_FIXTURE',
          },
        })
        .then(async (response) => ({
          tenant: fixture.tenant,
          status: response.status(),
          body: await response.json().catch(() => null),
        })),
    ),
  ),
);
const elapsedMs = performance.now() - started;
const byTenant = Object.fromEntries(
  fixtures.map(({ tenant }) => {
    const own = rows.filter((row) => row.tenant === tenant);
    return [
      tenant,
      {
        statuses: Object.fromEntries(
          [...new Set(own.map(({ status }) => status))].map((status) => [
            status,
            own.filter((row) => row.status === status).length,
          ]),
        ),
        ids: new Set(own.map(({ body }) => body?.id).filter(Boolean)).size,
        folios: new Set(own.map(({ body }) => body?.folio).filter(Boolean)).size,
      },
    ];
  }),
);
const alpha = fixtures[0],
  beta = fixtures[1];
const betaId = rows.find((row) => row.tenant === beta.tenant)?.body?.id;
const alphaCross = await alpha.context.get(`/v1/organizations/${beta.tenant}/sales/${betaId}`);
const betaCross = await beta.context.get(
  `/v1/organizations/${alpha.tenant}/sales/${rows.find((row) => row.tenant === alpha.tenant)?.body?.id}`,
);
console.log(
  JSON.stringify(
    {
      requests: rows.length,
      elapsedMs: Math.round(elapsedMs),
      requestsPerSecond: Number((rows.length / (elapsedMs / 1000)).toFixed(2)),
      byTenant,
      crossTenantStatuses: [alphaCross.status(), betaCross.status()],
    },
    null,
    2,
  ),
);
await Promise.all(fixtures.map(({ context }) => context.dispose()));
