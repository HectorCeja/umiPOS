import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';

test('Web, API, Mailpit y MinIO escuchan fuera de loopback', async ({ request }) => {
  const ip = process.env.NEXO_LAN_IP ?? execIp();
  expect((await request.get(`http://${ip}:3000`)).ok()).toBe(true);
  expect((await request.get(`http://${ip}:3001/health/ready`)).ok()).toBe(true);
  expect((await request.get(`http://${ip}:8025/readyz`)).ok()).toBe(true);
  expect((await request.get(`http://${ip}:9000/minio/health/live`)).ok()).toBe(true);
});

function execIp() {
  return execFileSync(
    'bash',
    [
      '-lc',
      'ip -4 route get 1.1.1.1 | awk \'{for(i=1;i<=NF;i++) if($i=="src") {print $(i+1); exit}}\'',
    ],
    { encoding: 'utf8' },
  ).trim();
}
