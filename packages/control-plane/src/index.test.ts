import { describe, expect, it } from 'vitest';

import {
  advanceOnboarding,
  completeOnboarding,
  restartOnboarding,
  validateTemplate,
} from './index.js';

describe('control-plane domain', () => {
  it('validates versioned data templates', () => {
    expect(
      validateTemplate({
        businessType: 'COFFEE_SHOP',
        categorySuggestions: ['Bebidas'],
        features: ['POS'],
        initialSettings: {},
        key: 'coffee-shop',
        name: 'Coffee Shop',
        suggestedPermissions: {},
        version: 1,
      }).key,
    ).toBe('coffee-shop');
  });

  it('enforces monotonic completion and safe restart', () => {
    const draft = advanceOnboarding({ currentStep: 1, status: 'DRAFT', version: 1 }, 4);
    const complete = completeOnboarding(draft, new Date('2026-07-13T00:00:00Z'));
    expect(complete.status).toBe('COMPLETED');
    expect(restartOnboarding(complete)).toMatchObject({ currentStep: 1, status: 'DRAFT' });
    expect(() => advanceOnboarding(complete, 5)).toThrow();
  });
});
