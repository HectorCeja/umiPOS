import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('experience system exports the complete reusable vocabulary', async () => {
  const [source, styles] = await Promise.all([
    readFile('apps/web/src/app/contextual-help.tsx', 'utf8'),
    readFile('apps/web/src/app/styles.css', 'utf8'),
  ]);
  for (const component of [
    'ContextualHelp',
    'ScreenIntroduction',
    'GuidedTour',
    'FeatureSpotlight',
    'EducationalEmptyState',
    'HelpDrawer',
    'SearchHelp',
    'Glossary',
    'FAQ',
    'TipCard',
    'ActionExplanation',
    'DisabledActionReason',
    'InteractiveChecklist',
    'SuccessEducation',
    'NextStepRecommendation',
  ])
    expect(source).toContain(`function ${component}`);
  expect(styles).toContain('backdrop-filter');
});
