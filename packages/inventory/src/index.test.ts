import { describe, expect, it } from 'vitest';
import {
  assertCanIssue,
  assertCostMethodEnabled,
  assertManualMovement,
  assertVariantReference,
  availability,
  consumeFifo,
  weightedAverage,
} from './index.js';
describe('Inventory domain', () => {
  it('separates availability dimensions', () => {
    expect(
      availability({
        onHand: '10',
        reserved: '2',
        committed: '1',
        inTransit: '4',
        damaged: '1',
        quarantine: '1',
      }).available,
    ).toBe('5');
  });
  it('validates variant-only and negative-stock policies', () => {
    expect(() => {
      assertVariantReference({ productId: 'p', variantId: 'v' });
    }).toThrow(/Variant/);
    expect(() => {
      assertCanIssue('2', '3', false);
    }).toThrow(/Insufficient/);
  });
  it('uses exact six-decimal arithmetic at database-scale quantities', () => {
    expect(
      availability({
        onHand: '99999999999999.999999',
        reserved: '0.000001',
        committed: '0',
        inTransit: '0',
        damaged: '0',
        quarantine: '0',
      }).available,
    ).toBe('99999999999999.999998');
    expect(() => {
      assertCanIssue('0.000001', '0.000002', false);
    }).toThrow(/Insufficient/);
  });
  it('keeps internal ledger transitions out of the manual movement contract', () => {
    expect(() => {
      assertManualMovement({ type: 'PURCHASE', state: 'ON_HAND', quantity: '1' });
    }).not.toThrow();
    expect(() => {
      assertManualMovement({ type: 'SALE', state: 'ON_HAND', quantity: '-1' });
    }).toThrow(/internal/);
    expect(() => {
      assertManualMovement({ type: 'ADJUSTMENT', state: 'DAMAGED', quantity: '1' });
    }).toThrow(/ON_HAND/);
    expect(() => {
      assertManualMovement({ type: 'PURCHASE', state: 'ON_HAND', quantity: '-1' });
    }).toThrow(/positive/);
  });
  it('calculates FIFO allocations', () => {
    expect(
      consumeFifo(
        [
          { id: 'a', remainingQuantity: '2', unitCost: '10' },
          { id: 'b', remainingQuantity: '3', unitCost: '12' },
        ],
        '4',
      ),
    ).toEqual({
      totalCost: '44',
      allocations: [
        { layerId: 'a', quantity: '2', unitCost: '10' },
        { layerId: 'b', quantity: '2', unitCost: '12' },
      ],
    });
    expect(
      consumeFifo(
        [{ id: 'precise', remainingQuantity: '99999999.999999', unitCost: '0.123456' }],
        '0.000001',
      ).totalCost,
    ).toBe('0');
    expect(
      consumeFifo([{ id: 'round', remainingQuantity: '1', unitCost: '0.500000' }], '0.000001')
        .totalCost,
    ).toBe('0.000001');
  });
  it('calculates weighted average exactly and exposes only operational FIFO', () => {
    expect(weightedAverage('2', '20', '3', '20')).toBe('16');
    expect(weightedAverage('0.000001', '0.000001', '0.000001', '0.000001')).toBe('0.500001');
    for (const method of ['WEIGHTED_AVERAGE', 'STANDARD', 'LIFO'] as const)
      expect(() => {
        assertCostMethodEnabled(method);
      }).toThrow(/not operational/);
  });
});
