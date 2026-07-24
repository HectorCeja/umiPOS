import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve('.');
const common = [
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'turbo.json',
  'tsconfig.base.json',
  'packages',
];
const services = {
  web: [...common, 'apps/web', 'infra/docker/web.Dockerfile'],
  api: [...common, 'apps/api', 'infra/docker/api.Dockerfile'],
  worker: [...common, 'apps/worker', 'infra/docker/worker.Dockerfile'],
};
const fingerprints = Object.fromEntries(
  Object.entries(services).map(([service, paths]) => [service, fingerprint(paths)]),
);

if (process.argv.includes('--write-env')) {
  const output = process.env.NEXO_RUNTIME_FINGERPRINT_ENV ?? 'artifacts/runtime-fingerprints.env';
  writeFileSync(
    output,
    `${Object.entries(fingerprints)
      .map(([service, value]) => `NEXO_${service.toUpperCase()}_SOURCE_FINGERPRINT=${value}`)
      .join('\n')}\n`,
  );
  process.stdout.write(`${output}\n`);
  process.exit(0);
}

const report = { checkedAt: new Date().toISOString(), services: [], stale: [] };
for (const [service, computed] of Object.entries(fingerprints)) {
  const expected = process.env[`NEXO_EXPECTED_${service.toUpperCase()}_FINGERPRINT`] ?? computed;
  const inspected = spawnSync(
    'docker',
    [
      'inspect',
      `nexo-${service}-1`,
      '--format',
      '{{index .Config.Labels "org.nexo.source-fingerprint"}}|{{.Image}}|{{.Created}}',
    ],
    { encoding: 'utf8' },
  );
  const [actual = '', imageId = '', createdAt = ''] = inspected.stdout.trim().split('|');
  const item = {
    service,
    expected,
    actual,
    imageId,
    createdAt,
    rebuild: `docker compose --env-file artifacts/runtime-fingerprints.env build ${service} && docker compose --env-file artifacts/runtime-fingerprints.env up -d --force-recreate ${service}`,
  };
  report.services.push(item);
  if (inspected.status !== 0 || actual !== expected) report.stale.push(item);
}
const output = process.env.NEXO_RUNTIME_FRESHNESS_REPORT;
if (output) writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (report.stale.length) process.exitCode = 1;

function fingerprint(paths) {
  const files = paths.flatMap(filesUnder).sort();
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(relative(root, file));
    hash.update('\0');
    hash.update(readFileSync(file));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function filesUnder(input) {
  const path = resolve(input);
  if (path.endsWith('.tsbuildinfo')) return [];
  const state = statSync(path);
  if (state.isFile()) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    if (
      ['node_modules', 'dist', 'build', '.next', '.turbo', 'coverage', 'src/generated'].includes(
        entry.name,
      )
    )
      return [];
    return filesUnder(resolve(path, entry.name));
  });
}
