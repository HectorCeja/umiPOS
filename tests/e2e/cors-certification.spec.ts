import { expect, test } from '@playwright/test';
import { localIpv4Address } from './network.helpers';

test('CORS permite el origen LAN configurado y rechaza orígenes externos', async ({ request }) => {
  const ip = localIpv4Address();
  const allowed = await request.fetch(`http://${ip}:3001/v1/organizations`, {
    method: 'OPTIONS',
    headers: { origin: `http://${ip}:3000`, 'access-control-request-method': 'GET' },
  });
  expect(allowed.headers()['access-control-allow-origin']).toBe(`http://${ip}:3000`);
  const denied = await request.fetch(`http://${ip}:3001/v1/organizations`, {
    method: 'OPTIONS',
    headers: { origin: 'https://attacker.invalid', 'access-control-request-method': 'GET' },
  });
  expect(denied.headers()['access-control-allow-origin']).toBeUndefined();
});
