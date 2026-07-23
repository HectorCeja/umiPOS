import { describe, expect, it } from 'vitest';

import {
  assertMoney,
  assertProductTransition,
  assertProductTypeEnabled,
  hasValidGs1CheckDigit,
  optionCombinationKey,
  validateBarcode,
} from './index.js';

describe('Product domain', () => {
  it('supports the declared lifecycle and keeps subscription disabled', () => {
    expect(() => {
      assertProductTransition('DRAFT', 'ACTIVE');
    }).not.toThrow();
    expect(() => {
      assertProductTransition('ARCHIVED', 'ACTIVE');
    }).not.toThrow();
    expect(() => {
      assertProductTypeEnabled('SERVICE');
    }).not.toThrow();
    for (const type of [
      'BUNDLE',
      'KIT',
      'COMPOSITE',
      'DIGITAL',
      'GIFT_CARD',
      'SUBSCRIPTION',
      'CUSTOM',
    ] as const) {
      expect(() => {
        assertProductTypeEnabled(type);
      }).toThrow(/not enabled/);
    }
  });

  it('validates GS1 check digits and monetary strings without binary floats', () => {
    expect(hasValidGs1CheckDigit('7501031311309')).toBe(true);
    expect(validateBarcode('GTIN', '7501031311309')).toBe('7501031311309');
    expect(() => {
      validateBarcode('GTIN', '7501031311308');
    }).toThrow(/check digit/);
    expect(() => {
      assertMoney('149.950000', 'MXN');
    }).not.toThrow();
    expect(() => {
      assertMoney('-1', 'MXN');
    }).toThrow();
  });

  it('creates stable unlimited option-combination keys', () => {
    expect(
      optionCombinationKey([
        { option: 'Size', value: 'L' },
        { option: 'Color', value: 'Red' },
        { option: 'Capacity', value: '1 L' },
      ]),
    ).toBe('capacity=1 l|color=red|size=l');
    expect(() =>
      optionCombinationKey([
        { option: 'Color', value: 'Red' },
        { option: 'color', value: 'Blue' },
      ]),
    ).toThrow(/Duplicate/);
  });
});
