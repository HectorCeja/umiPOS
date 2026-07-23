import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const target = resolve(root, 'packages/nexo_flutter_design/assets/artwork');
const expected = {
  'womanpos.png': '3b106ed3f9f947213ab6118e0a9e55c1019bb2cbb9bdf8edfcd0a26555fa629e',
  'products.jpeg': 'c77b9f79e74501c126f77bd2477d9a2c614445f58fdb1e17a8cd69587b3bf662',
  'inventory.jpeg': 'f981549c0fd871bb2b08f23266b620997dfe3bf72324461dfbba13bbb5b04164',
  'analytics.jpeg': '0088673b4ca9611b9ff861c41a5cf6696c348ec1df8189a5075f0e39213b1526',
};
const hash = (data) => createHash('sha256').update(data).digest('hex');
await mkdir(target, { recursive: true });
for (const [name, digest] of Object.entries(expected)) {
  const sourceData = await readFile(resolve(root, name));
  if (hash(sourceData) !== digest) throw new Error(`Certified source drift: ${name}`);
  if (!process.argv.includes('--check')) await copyFile(resolve(root, name), resolve(target, name));
  const targetData = await readFile(resolve(target, name));
  if (hash(targetData) !== digest) throw new Error(`Flutter artwork drift: ${name}`);
}
process.stdout.write(`Artwork registry assets verified: ${Object.keys(expected).length}\n`);
