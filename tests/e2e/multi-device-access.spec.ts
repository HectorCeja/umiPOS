import { expect, test } from '@playwright/test';
import { localIpv4Address } from './network.helpers';

test('Web, API, Mailpit y MinIO escuchan fuera de loopback', async ({ request }) => {
  const ip = localIpv4Address();
  expect((await request.get(`http://${ip}:3000`)).ok()).toBe(true);
  expect((await request.get(`http://${ip}:3001/health/ready`)).ok()).toBe(true);
  expect((await request.get(`http://${ip}:8025/readyz`)).ok()).toBe(true);
  expect((await request.get(`http://${ip}:9000/minio/health/live`)).ok()).toBe(true);
});
