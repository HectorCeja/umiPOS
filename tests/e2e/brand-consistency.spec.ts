import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('brand surfaces consume the authoritative NEXO component', async () => {
  const [brand, cinematic, shell, onboarding, stories, flutter] = await Promise.all([
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
    readFile('apps/web/src/app/cinematic-experience.tsx', 'utf8'),
    readFile('apps/web/src/app/global-shell.tsx', 'utf8'),
    readFile('apps/web/src/app/product-experience.tsx', 'utf8'),
    readFile('packages/ui/src/product-polish.stories.tsx', 'utf8'),
    readFile('packages/nexo_flutter_design/lib/src/components/brand.dart', 'utf8'),
  ]);
  expect(brand).toContain('data-nexo-brand="authoritative"');
  expect(cinematic).toContain('<NexoBrand');
  expect(shell).toContain('<NexoWordmark compact />');
  expect(onboarding).toContain('<NexoWordmark');
  expect(stories).toContain('<NexoBrand');
  expect(flutter).toContain('class NexoBrand extends StatelessWidget');
});
