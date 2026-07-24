import { spawnSync } from 'node:child_process';

if (process.env.NEXO_E2E_RESET_DATABASE !== 'true') {
  throw new Error(
    'Refusing to reset PostgreSQL without NEXO_E2E_RESET_DATABASE=true. This command is E2E-only.',
  );
}

function run(command, args, input) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    input,
    stdio: input ? 'pipe' : 'inherit',
  });
  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
}

run(
  'docker',
  [
    'compose',
    'exec',
    '-T',
    'postgres',
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-U',
    'nexo_admin',
    '-d',
    'nexo',
  ],
  `DROP SCHEMA IF EXISTS app CASCADE;
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public AUTHORIZATION nexo_migration;
   GRANT USAGE ON SCHEMA public TO nexo_runtime;`,
);
run('docker', ['compose', 'exec', '-T', 'redis', 'redis-cli', 'FLUSHDB']);
run('docker', ['compose', 'run', '--rm', 'migrate']);
