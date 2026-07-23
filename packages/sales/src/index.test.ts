import { describe, expect, test } from 'vitest';

import { Sale } from './sale.js';
import { calculateLine, calculateTotals } from './totals.js';
import { allowedTransitions, assertTransition } from './lifecycle.js';
import { divideRounded, formatDecimal, parseDecimal } from './money.js';
import { assertRefundRequest, calculateRefundAmountMinor } from './refund.js';
import type { SalesPolicy, TaxSnapshot } from './types.js';

const tax: TaxSnapshot = {
  profileId: 'tax-mx-iva',
  profileVersion: 1,
  treatment: 'EXCLUSIVE',
  rateBasisPoints: 1600,
  components: [{ code: 'IVA', rateBasisPoints: 1600 }],
};
const policy: SalesPolicy = {
  currency: 'MXN',
  allowWithoutInventory: true,
  allowNegativeStock: false,
  automaticReservation: true,
  reservationTtlSeconds: 900,
  allowDiscounts: true,
  maximumDiscountBasisPoints: 2000,
  requireSupervisorAboveBasisPoints: 1000,
  allowManualPrice: false,
  allowSuspendedSales: true,
  suspendedSaleTtlSeconds: 3600,
  allowCancellation: true,
  allowRefund: true,
  roundingMode: 'HALF_UP',
  enabledPaymentMethods: ['CASH', 'CARD_EXTERNAL', 'BANK_TRANSFER'],
};
const create = () =>
  Sale.create({
    id: 'sale-1',
    tenantId: 'tenant-a',
    organizationId: 'tenant-a',
    branchId: 'branch-a',
    sellerUserId: 'user-a',
    membershipId: 'membership-a',
    currency: 'MXN',
    businessDate: '2026-07-13',
    channel: 'API',
    source: 'test',
    idempotencyKey: 'create-1',
    correlationId: 'correlation-1',
    metadata: {},
    now: '2026-07-14T00:00:00.000Z',
  });

describe('decimal money', () => {
  test('uses exact scaled integers and explicit rounding', () => {
    expect(parseDecimal('12.34', 2)).toBe(1234n);
    expect(formatDecimal(1234n, 2)).toBe('12.34');
    expect(divideRounded(5n, 2n, 'HALF_UP')).toBe(3n);
    expect(divideRounded(5n, 2n, 'HALF_EVEN')).toBe(2n);
  });
  test('rejects excess precision', () => {
    expect(() => parseDecimal('1.001', 2)).toThrow('DECIMAL_SCALE_EXCEEDED');
  });
});

describe('refund authority', () => {
  test('derives partial line refunds from the immutable sold total using HALF_UP', () => {
    expect(
      calculateRefundAmountMinor({
        soldQuantity: '3',
        soldTotalMinor: '1000',
        refundQuantity: '1',
      }),
    ).toBe('333');
    expect(
      calculateRefundAmountMinor({
        soldQuantity: '2',
        soldTotalMinor: '101',
        refundQuantity: '1',
      }),
    ).toBe('51');
  });
  test('rejects zero, negative, excess precision and quantities above the sold amount', () => {
    expect(() =>
      calculateRefundAmountMinor({
        soldQuantity: '1',
        soldTotalMinor: '100',
        refundQuantity: '1.000001',
      }),
    ).toThrow('REFUND_NOT_ALLOWED');
    expect(() => {
      assertRefundRequest({
        id: 'r',
        saleId: 's',
        actorId: 'a',
        authorizationPermission: 'sales.refund',
        idempotencyKey: 'refund-key',
        requestedAt: '2026-07-22T00:00:00Z',
        lines: [
          {
            saleItemId: 'i',
            quantity: '0',
            amountMinor: '1',
            destination: 'AVAILABLE',
            reason: 'x',
          },
        ],
      });
    }).toThrow('REFUND_NOT_ALLOWED');
  });
});

describe('sale lifecycle', () => {
  test('only exposes explicit transitions', () => {
    expect(allowedTransitions('OPEN')).toEqual([
      'SUSPENDED',
      'CHECKOUT_PENDING',
      'CANCELLED',
      'EXPIRED',
    ]);
    expect(() => {
      assertTransition('COMPLETED', 'OPEN');
    }).toThrow('SALE_INVALID_STATE');
  });
  test('records versioned transition events and requires cancellation reason', () => {
    const sale = create();
    sale.transition('OPEN', 'user-a', '2026-07-14T00:01:00.000Z');
    expect(() => {
      sale.transition('CANCELLED', 'user-a', '2026-07-14T00:02:00.000Z');
    }).toThrow('SALE_REASON_REQUIRED');
    sale.transition('CANCELLED', 'user-a', '2026-07-14T00:02:00.000Z', 'customer request');
    expect(sale.snapshot().status).toBe('CANCELLED');
    expect(sale.pullEvents().map((event) => event.eventType)).toEqual([
      'SaleCreated',
      'SaleOpen',
      'SaleCancelled',
    ]);
  });
});

describe('authoritative totals', () => {
  test('calculates exclusive tax after discount deterministically', () => {
    const line = calculateLine({
      unitAmountMinor: '10000',
      quantity: '2',
      discounts: [
        {
          id: 'd',
          kind: 'PERCENT',
          value: '1000',
          actorId: 'supervisor',
          permission: 'sales.discount',
          reason: 'test',
          scope: 'LINE',
          source: 'MANUAL',
          occurredAt: '2026-07-14T00:00:00Z',
        },
      ],
      tax,
      roundingMode: 'HALF_UP',
    });
    expect(line).toEqual({
      subtotalMinor: 20000n,
      discountMinor: 2000n,
      taxMinor: 2880n,
      totalMinor: 20880n,
    });
  });
  test('preserves monetary invariants over a broad deterministic input matrix', () => {
    for (let unit = 1n; unit <= 10_000n; unit += 137n) {
      for (let quantity = 1; quantity <= 12; quantity += 1) {
        const line = calculateLine({
          unitAmountMinor: String(unit),
          quantity: String(quantity),
          discounts: [],
          tax,
          roundingMode: 'HALF_UP',
        });
        expect(line.subtotalMinor).toBe(unit * BigInt(quantity));
        expect(line.discountMinor).toBe(0n);
        expect(line.taxMinor).toBeGreaterThanOrEqual(0n);
        expect(line.totalMinor).toBe(line.subtotalMinor - line.discountMinor + line.taxMinor);
        expect(
          calculateLine({
            unitAmountMinor: String(unit),
            quantity: String(quantity),
            discounts: [],
            tax,
            roundingMode: 'HALF_UP',
          }),
        ).toEqual(line);
      }
    }
  });
  test('preserves immutable product snapshots and computes cash change', () => {
    const sale = create();
    sale.transition('OPEN', 'user-a', '2026-07-14T00:01:00Z');
    sale.addItem(
      {
        actorId: 'user-a',
        now: '2026-07-14T00:02:00Z',
        productVariantId: 'variant-1',
        productId: 'product-1',
        sku: 'COFFEE',
        productName: 'Coffee snapshot',
        variantName: 'Large',
        unit: 'EA',
        quantity: '1',
        unitAmountMinor: '10000',
        currency: 'MXN',
        priceSource: 'BASE_PRICE',
        priceVersion: 1,
        tax,
      },
      policy,
    );
    const item = sale.snapshot().items[0];
    expect(item?.productName).toBe('Coffee snapshot');
    const totals = calculateTotals(sale.snapshot().items, [
      {
        id: 'pay-1',
        method: 'CASH',
        status: 'CAPTURED',
        amountMinor: '11600',
        tenderedMinor: '12000',
        idempotencyKey: 'pay-key',
      },
    ]);
    expect(totals.totalMinor).toBe('11600');
    expect(totals.changeMinor).toBe('400');
    expect(totals.dueMinor).toBe('0');
  });
  test('prevents invalid currency and discount policy bypass', () => {
    const sale = create();
    expect(() =>
      sale.addItem(
        {
          actorId: 'user-a',
          now: '2026-07-14T00:01:00Z',
          productVariantId: 'v',
          sku: 'S',
          productName: 'P',
          variantName: 'V',
          unit: 'EA',
          quantity: '1',
          unitAmountMinor: '100',
          currency: 'USD',
          priceSource: 'BASE_PRICE',
          priceVersion: 1,
          tax,
        },
        policy,
      ),
    ).toThrow('CURRENCY_MISMATCH');
  });
});
