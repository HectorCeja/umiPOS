import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const source = resolve(root, 'apps/web/src/app/styles.css');
const output = resolve(here, '../lib/src/tokens/generated/nexo_tokens.g.dart');
const css = await readFile(source, 'utf8');
const v1Block = css.match(/:root\s*\{\s*--v1-canvas:[\s\S]*?\n\}/)?.[0];
if (!v1Block) throw new Error('Frozen --v1-* token block was not found.');
const values = Object.fromEntries(
  [...v1Block.matchAll(/--v1-([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
    name,
    value.trim(),
  ]),
);
const required = [
  'canvas',
  'canvas-2',
  'surface',
  'surface-raised',
  'surface-interactive',
  'line',
  'line-strong',
  'text',
  'muted',
  'faint',
  'violet',
  'violet-hover',
  'blue',
  'cyan',
  'pink',
  'mint',
  'warning',
  'danger',
  'ease',
];
for (const name of required)
  if (!values[name]) throw new Error(`Missing frozen token --v1-${name}`);

function color(value) {
  if (value.startsWith('#')) {
    const hex = value.slice(1);
    return `Color(0xFF${hex.length === 3 ? [...hex].map((x) => x + x).join('') : hex.toUpperCase()})`;
  }
  const m = value.match(/rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*(\d+)%\)/);
  if (!m) throw new Error(`Unsupported color: ${value}`);
  const [r, g, b, a] = m.slice(1).map(Number);
  const argb = [Math.round(a * 2.55), r, g, b]
    .map((x) => x.toString(16).padStart(2, '0').toUpperCase())
    .join('');
  return `Color(0x${argb})`;
}
function name(value) {
  return value.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}
const colors = required
  .filter((x) => x !== 'ease')
  .map((key) => `  static const ${name(key)} = ${color(values[key])};`)
  .join('\n');
const curve = values.ease
  .match(/cubic-bezier\(([^)]+)\)/)?.[1]
  .split(',')
  .map(Number);
if (!curve || curve.length !== 4) throw new Error('Invalid --v1-ease.');
const generated = `// GENERATED from apps/web/src/app/styles.css. DO NOT EDIT.\n// Source: NEXO Design Language V1 frozen palette.\nimport 'package:flutter/animation.dart';\n\n/// Frozen V1 palette. Semantic aliases live in NexoTheme.\nabstract final class NexoV1Colors {\n${colors}\n}\n\n/// Frozen V1 emphasized curve.\nabstract final class NexoV1Motion {\n  static const emphasized = Cubic(${curve.join(', ')});\n}\n`;
if (process.argv.includes('--check')) {
  const current = await readFile(output, 'utf8').catch(() => '');
  if (current !== generated) {
    console.error(
      'Flutter token output has drifted. Run pnpm --filter @nexo/flutter-design tokens:generate.',
    );
    process.exit(1);
  }
} else {
  await writeFile(output, generated);
}
