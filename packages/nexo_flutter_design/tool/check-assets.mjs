import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(resolve(packageRoot, 'assets/manifest.json'), 'utf8'));

for (const asset of manifest.assets) {
  if (!asset.source || asset.license !== 'OFL-1.1' || !asset.licenseFile) {
    throw new Error(`Incomplete license metadata for ${asset.id}`);
  }
  const [bytes, license] = await Promise.all([
    readFile(resolve(packageRoot, asset.path)),
    readFile(resolve(packageRoot, asset.licenseFile), 'utf8'),
  ]);
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== asset.sha256) throw new Error(`Asset drift: ${asset.id}`);
  if (!license.includes('SIL OPEN FONT LICENSE'))
    throw new Error(`Invalid OFL metadata: ${asset.id}`);
}

console.log(`Flutter assets verified: ${manifest.assets.length}`);
