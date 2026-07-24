import { mkdirSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const target = resolve(process.argv[2] ?? 'artifacts');
mkdirSync(target, { recursive: true });
const uid = process.getuid?.();
const gid = process.getgid?.();
if (uid === undefined || gid === undefined) process.exit(0);

const result = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--network=none',
    '--volume',
    `${realpathSync(target)}:/owned`,
    'alpine:3.22',
    'chown',
    '-R',
    `${uid}:${gid}`,
    '/owned',
  ],
  { stdio: 'inherit' },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
