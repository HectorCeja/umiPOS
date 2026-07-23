#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { resolve, relative, basename } from 'node:path';

const argv = process.argv.slice(2);
const command = argv.find((value) => !value.startsWith('--')) ?? 'report';
const apply = argv.includes('--apply');
const json = argv.includes('--json');
const rootIndex = argv.indexOf('--root');
const root = resolve(rootIndex >= 0 && argv[rootIndex + 1] ? argv[rootIndex + 1] : process.cwd());
const retentionRuns = Math.max(1, Number(process.env.NEXO_RETENTION_RUNS ?? '1'));
const retentionDays = Math.max(1, Number(process.env.NEXO_RETENTION_DAYS ?? '30'));

const protectedNames = new Set(['data', 'uploads']);
const cachePaths = [
  '.turbo',
  'playwright-report',
  'test-results',
  'coverage',
  'storybook-static',
  'apps/web/.next',
  'apps/nexo_pos/build',
  'apps/nexo_pos/.dart_tool',
  'packages/nexo_flutter_design/build',
  'packages/nexo_flutter_design/.dart_tool',
];
const logPaths = ['logs', 'tmp/logs'];

function bytes(path) {
  if (!existsSync(path)) return 0;
  const stat = statSync(path, { throwIfNoEntry: false });
  if (!stat) return 0;
  if (!stat.isDirectory()) return stat.size;
  let total = 0;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    total += bytes(resolve(path, entry.name));
  }
  return total;
}

function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  const units = ['KiB', 'MiB', 'GiB', 'TiB'];
  let amount = value;
  let unit = -1;
  do {
    amount /= 1024;
    unit += 1;
  } while (amount >= 1024 && unit < units.length - 1);
  return `${amount.toFixed(amount >= 10 ? 1 : 2)} ${units[unit]}`;
}

function safeTarget(input) {
  const target = resolve(root, input);
  const rel = relative(root, target);
  if (!rel || rel.startsWith('..') || rel.split('/').some((part) => protectedNames.has(part))) {
    throw new Error(`Ruta protegida rechazada: ${input}`);
  }
  return target;
}

function remove(paths, title) {
  const existing = paths
    .map((item) => ({ item, path: safeTarget(item) }))
    .filter(({ path }) => existsSync(path));
  const recoverable = existing.reduce((total, entry) => total + bytes(entry.path), 0);
  if (!json) console.log(`${title}: ${formatBytes(recoverable)} recuperables`);
  for (const entry of existing) {
    if (!json) console.log(`  ${apply ? 'ELIMINANDO' : 'SIMULACIÓN'} ${entry.item}`);
    if (apply) rmSync(entry.path, { recursive: true, force: true });
  }
  return { recoverable, removed: apply ? existing.map(({ item }) => item) : [] };
}

function artifactCandidates() {
  const directory = resolve(root, 'artifacts');
  if (!existsSync(directory)) return { keep: [], remove: [] };
  const entries = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const path = resolve(directory, entry.name);
      return { name: entry.name, path, mtime: statSync(path).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  const keep = new Set(entries.slice(0, retentionRuns).map(({ name }) => name));
  const classified = { failed: false, certification: false };
  for (const entry of entries) {
    const label = entry.name.toLowerCase();
    if (!classified.failed && /(fail|error|blocked)/.test(label)) {
      keep.add(entry.name);
      classified.failed = true;
    }
    if (!classified.certification && /(certif|freeze|complete)/.test(label)) {
      keep.add(entry.name);
      classified.certification = true;
    }
  }
  const cutoff = Date.now() - retentionDays * 86_400_000;
  return {
    keep: entries.filter((entry) => keep.has(entry.name) || entry.mtime >= cutoff),
    remove: entries.filter((entry) => !keep.has(entry.name) && entry.mtime < cutoff),
  };
}

function cleanArtifacts() {
  const candidates = artifactCandidates();
  const recoverable = candidates.remove.reduce((total, entry) => total + bytes(entry.path), 0);
  if (!json) {
    console.log(`Artifacts: ${formatBytes(recoverable)} recuperables`);
    console.log(
      `  Retención: ${retentionRuns} ejecución(es), última fallida, última certificación, ${retentionDays} días`,
    );
    for (const entry of candidates.remove) {
      console.log(`  ${apply ? 'ELIMINANDO' : 'SIMULACIÓN'} artifacts/${entry.name}`);
    }
  }
  if (apply)
    for (const entry of candidates.remove) rmSync(entry.path, { recursive: true, force: true });
  return {
    recoverable,
    kept: candidates.keep.map(({ name }) => name),
    removed: apply ? candidates.remove.map(({ name }) => name) : [],
  };
}

function dockerInfo() {
  try {
    const output = execFileSync('docker', ['system', 'df', '--format', '{{json .}}'], {
      encoding: 'utf8',
    });
    return {
      available: true,
      lines: output
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line)),
    };
  } catch (error) {
    return { available: false, error: String(error).split('\n')[0] };
  }
}

function dockerClean() {
  const info = dockerInfo();
  if (!info.available) {
    if (!json) console.log(`Docker no disponible: ${info.error}`);
    return info;
  }
  if (!json) {
    console.log('Docker: solo caché de build y objetos no usados; nunca volúmenes');
    console.log('  Este comando no ejecuta docker system prune ni docker volume prune.');
  }
  if (apply) {
    try {
      execFileSync('docker', ['builder', 'prune', '--force', '--filter', 'until=168h'], {
        stdio: json ? 'ignore' : 'inherit',
      });
      execFileSync('docker', ['image', 'prune', '--force', '--filter', 'until=168h'], {
        stdio: json ? 'ignore' : 'inherit',
      });
    } catch (error) {
      throw new Error(`La limpieza conservadora de Docker falló: ${String(error)}`);
    }
  }
  return {
    ...info,
    applied: apply,
    policy: 'build-cache-and-dangling-images-older-than-168h; volumes-never',
  };
}

function report() {
  const categories = {
    project: bytes(root),
    turbo: bytes(resolve(root, '.turbo')),
    nodeModules: bytes(resolve(root, 'node_modules')),
    artifacts: bytes(resolve(root, 'artifacts')),
    nextCache: bytes(resolve(root, 'apps/web/.next')),
    playwright: bytes(resolve(root, 'playwright-report')) + bytes(resolve(root, 'test-results')),
    flutter:
      bytes(resolve(root, 'apps/nexo_pos/build')) +
      bytes(resolve(root, 'apps/nexo_pos/.dart_tool')) +
      bytes(resolve(root, 'packages/nexo_flutter_design/build')) +
      bytes(resolve(root, 'packages/nexo_flutter_design/.dart_tool')),
    coverage: bytes(resolve(root, 'coverage')),
  };
  const result = { root, measuredAt: new Date().toISOString(), categories, docker: dockerInfo() };
  if (json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log('NEXO — REPORTE DE DISCO');
    for (const [name, value] of Object.entries(categories))
      console.log(`${name.padEnd(14)} ${formatBytes(value)}`);
    console.log('\nLas limpiezas son simulaciones por defecto. Añade --apply para confirmar.');
    console.log('PostgreSQL, MinIO, uploads, organizaciones y datos del owner nunca se eliminan.');
  }
  return result;
}

let result;
switch (command) {
  case 'report':
    result = report();
    break;
  case 'artifacts-clean':
    result = cleanArtifacts();
    break;
  case 'logs-clean':
    result = remove(
      [...logPaths, ...readdirSync(root).filter((name) => name.endsWith('.log'))],
      'Logs',
    );
    break;
  case 'cache-clean':
    result = remove(cachePaths, 'Cachés y salidas regenerables');
    break;
  case 'docker-clean':
    result = dockerClean();
    break;
  case 'clean':
    result = {
      artifacts: cleanArtifacts(),
      logs: remove(logPaths, 'Logs'),
      cache: remove(cachePaths, 'Cachés y salidas regenerables'),
    };
    break;
  default:
    throw new Error(`Comando desconocido: ${command}`);
}
if (json && command !== 'report') console.log(JSON.stringify(result, null, 2));
