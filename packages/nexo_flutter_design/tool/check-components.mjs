import fs from 'node:fs';
import path from 'node:path';

const packageRoot = process.cwd();
const repoRoot = path.resolve(packageRoot, '../..');
const barrel = fs.readFileSync(path.join(packageRoot, 'lib/nexo_flutter_design.dart'), 'utf8');
for (const source of [
  'primitives.dart',
  'controls.dart',
  'feedback.dart',
  'data_display.dart',
  'overlays.dart',
  'patterns.dart',
]) {
  if (!barrel.includes(source)) throw new Error(`Missing public export: ${source}`);
}

const requiredDocs = [
  'FLUTTER_COMPONENT_LIBRARY.md',
  'FLUTTER_COMPONENT_API.md',
  'FLUTTER_COMPONENT_STATES.md',
  'FLUTTER_INTERACTION_POLICY.md',
  'FLUTTER_OVERLAY_SYSTEM.md',
  'FLUTTER_FORM_FOUNDATION.md',
  'FLUTTER_DATA_DISPLAY_FOUNDATION.md',
  'FLUTTER_SHOWCASE.md',
  'FLUTTER_COMPONENT_GOLDENS.md',
  'FLUTTER_COMPONENT_ACCESSIBILITY.md',
  'FLUTTER_COMPONENT_PERFORMANCE.md',
  'FLUTTER_COMPONENT_PARITY_REPORT.md',
];
for (const file of requiredDocs) {
  const target = path.join(repoRoot, 'docs/flutter', file);
  if (!fs.existsSync(target) || fs.statSync(target).size < 100)
    throw new Error(`Missing or empty documentation: ${file}`);
}

const goldenDir = path.join(packageRoot, 'test/goldens');
const componentGoldens = fs
  .readdirSync(goldenDir)
  .filter((file) => file.startsWith('components.') && file.endsWith('.png'));
if (componentGoldens.length !== 8)
  throw new Error(`Expected 8 component goldens, found ${componentGoldens.length}`);
console.log(
  `Component contract PASS: 6 exports, ${requiredDocs.length} docs, ${componentGoldens.length} goldens.`,
);
