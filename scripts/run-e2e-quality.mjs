import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const playwright = resolve('node_modules/@playwright/test/cli.js');
const reportRoot = process.env.NEXO_E2E_REPORT_ROOT ?? 'artifacts/e2e-results';
const artifactOwnership = resolve('scripts/e2e-artifact-ownership.mjs');
const phases = [
  {
    name: 'security',
    purpose: 'production-default IP throttling and dedicated-account lockout',
  },
  {
    name: 'visual',
    purpose: 'deterministic visual fixtures captured before mutable functional suites',
  },
  {
    name: 'functional',
    purpose: 'all tests that must run while shared services remain continuously available',
  },
  {
    name: 'lifecycle',
    purpose: 'restart and degradation scenarios, executed only after functional coverage',
  },
];

let failed = false;
for (const phase of phases) {
  run(process.execPath, [artifactOwnership, 'artifacts']);
  if (phase.name === 'security') {
    recreateApi('30');
    await ready();
  }
  process.stdout.write(`\nE2E phase: ${phase.name} — ${phase.purpose}\n`);
  const result = spawnSync(process.execPath, [playwright, 'test'], {
    env: { ...process.env, NEXO_E2E_PHASE: phase.name, NEXO_E2E_REPORT_ROOT: reportRoot },
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  run(process.execPath, [artifactOwnership, 'artifacts']);
  if (result.status !== 0) failed = true;
  if (phase.name === 'security') {
    recreateApi('10000');
    await ready();
    run('docker', ['compose', 'exec', '-T', 'redis', 'redis-cli', 'FLUSHDB']);
  }
}

process.exitCode = failed ? 1 : 0;

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function recreateApi(ipLimit) {
  run('docker', ['compose', 'up', '-d', '--force-recreate', '--no-deps', 'api'], {
    ...process.env,
    NEXO_E2E_AUTH_LOGIN_IP_RATE_LIMIT: ipLimit,
  });
}

async function ready() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      if ((await fetch('http://localhost:3001/health/ready')).status === 200) return;
    } catch {}
    await delay(500);
  }
  throw new Error('API did not recover at the E2E phase boundary.');
}
