import { randomUUID } from 'node:crypto';
import { assertTransition } from './lifecycle.js';
import { calculateLine, calculateTotals } from './totals.js';
import type {
  Discount,
  PaymentAllocation,
  SaleEvent,
  SaleItem,
  SaleSnapshot,
  SaleStatus,
  SalesPolicy,
  TaxSnapshot,
} from './types.js';

type CreateSale = Omit<
  SaleSnapshot,
  'createdAt' | 'updatedAt' | 'version' | 'status' | 'items' | 'payments'
> & { now: string };

export class Sale {
  #state: SaleSnapshot;
  #events: SaleEvent[] = [];
  private constructor(state: SaleSnapshot) {
    this.#state = state;
  }
  static create(input: CreateSale): Sale {
    const sale = new Sale({
      ...input,
      createdAt: input.now,
      updatedAt: input.now,
      version: 1,
      status: 'DRAFT',
      items: [],
      payments: [],
    });
    sale.emit('SaleCreated', input.sellerUserId, {});
    return sale;
  }
  static restore(state: SaleSnapshot): Sale {
    return new Sale(structuredClone(state));
  }
  snapshot(): SaleSnapshot {
    return structuredClone(this.#state);
  }
  pullEvents(): readonly SaleEvent[] {
    const events = [...this.#events];
    this.#events = [];
    return events;
  }
  transition(to: SaleStatus, actorId: string, now: string, reason?: string): void {
    assertTransition(this.#state.status, to);
    if (['CANCELLED', 'FAILED', 'EXPIRED'].includes(to) && !reason)
      throw new Error('SALE_REASON_REQUIRED');
    const from = this.#state.status;
    this.mutate(
      {
        status: to,
        ...(to === 'COMPLETED' ? { completedAt: now } : {}),
        ...(to === 'CANCELLED' ? { cancelledAt: now } : {}),
      },
      now,
    );
    this.emit(
      `Sale${to
        .split('_')
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join('')}`,
      actorId,
      { from, to, reason },
    );
  }
  addItem(
    input: Readonly<{
      id?: string;
      actorId: string;
      now: string;
      productVariantId: string;
      productId?: string;
      sku: string;
      barcode?: string;
      productName: string;
      variantName: string;
      unit: string;
      quantity: string;
      unitAmountMinor: string;
      currency: string;
      priceSource: SaleItem['priceSource'];
      priceVersion: number;
      tax: TaxSnapshot;
      metadata?: Readonly<Record<string, string>>;
      notes?: string;
    }>,
    policy: SalesPolicy,
  ): SaleItem {
    if (!['DRAFT', 'OPEN'].includes(this.#state.status)) throw new Error('SALE_INVALID_STATE');
    if (input.currency !== this.#state.currency || policy.currency !== this.#state.currency)
      throw new Error('CURRENCY_MISMATCH');
    const calculated = calculateLine({
      unitAmountMinor: input.unitAmountMinor,
      quantity: input.quantity,
      discounts: [],
      tax: input.tax,
      roundingMode: policy.roundingMode,
    });
    const item: SaleItem = {
      id: input.id ?? randomUUID(),
      productVariantId: input.productVariantId,
      ...(input.productId ? { productId: input.productId } : {}),
      sku: input.sku,
      ...(input.barcode ? { barcode: input.barcode } : {}),
      productName: input.productName,
      variantName: input.variantName,
      unit: input.unit,
      quantity: input.quantity,
      unitAmountMinor: input.unitAmountMinor,
      baseUnitAmountMinor: input.unitAmountMinor,
      currency: input.currency,
      priceSource: input.priceSource,
      priceVersion: input.priceVersion,
      tax: input.tax,
      discounts: [],
      subtotalMinor: String(calculated.subtotalMinor),
      discountTotalMinor: String(calculated.discountMinor),
      taxTotalMinor: String(calculated.taxMinor),
      lineTotalMinor: String(calculated.totalMinor),
      ...(input.notes ? { notes: input.notes } : {}),
      metadata: input.metadata ?? {},
      version: 1,
    };
    this.mutate({ items: [...this.#state.items, item] }, input.now);
    this.emit('SaleItemAdded', input.actorId, {
      itemId: item.id,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
    });
    return item;
  }
  applyDiscount(itemId: string, discount: Discount, policy: SalesPolicy, now: string): void {
    if (!policy.allowDiscounts) throw new Error('DISCOUNT_NOT_ALLOWED');
    if (discount.kind === 'PERCENT' && Number(discount.value) > policy.maximumDiscountBasisPoints)
      throw new Error('DISCOUNT_LIMIT_EXCEEDED');
    const items = this.#state.items.map((item) => {
      if (item.id !== itemId) return item;
      const discounts = [...item.discounts, discount];
      const value = calculateLine({
        unitAmountMinor: item.unitAmountMinor,
        quantity: item.quantity,
        discounts,
        tax: item.tax,
        roundingMode: policy.roundingMode,
      });
      return {
        ...item,
        discounts,
        subtotalMinor: String(value.subtotalMinor),
        discountTotalMinor: String(value.discountMinor),
        taxTotalMinor: String(value.taxMinor),
        lineTotalMinor: String(value.totalMinor),
        version: item.version + 1,
      };
    });
    if (!items.some((item) => item.id === itemId)) throw new Error('SALE_ITEM_NOT_FOUND');
    this.mutate({ items }, now);
    this.emit('SaleItemUpdated', discount.actorId, { itemId, discountId: discount.id });
  }
  recordPayment(
    payment: PaymentAllocation,
    actorId: string,
    now: string,
    policy: SalesPolicy,
  ): void {
    if (!policy.enabledPaymentMethods.includes(payment.method))
      throw new Error('PAYMENT_METHOD_DISABLED');
    if (this.#state.payments.some((value) => value.idempotencyKey === payment.idempotencyKey))
      return;
    const payments = [...this.#state.payments, payment];
    const totals = calculateTotals(this.#state.items, payments);
    if (BigInt(totals.paidMinor) > BigInt(totals.totalMinor))
      throw new Error('PAYMENT_EXCEEDS_TOTAL');
    this.mutate({ payments }, now);
    this.emit('PaymentRecorded', actorId, {
      paymentId: payment.id,
      method: payment.method,
      status: payment.status,
    });
  }
  assertCompletable(): void {
    if (this.#state.status !== 'PAYMENT_PENDING') throw new Error('SALE_INVALID_STATE');
    if (this.#state.items.length === 0) throw new Error('SALE_EMPTY');
    if (calculateTotals(this.#state.items, this.#state.payments).dueMinor !== '0')
      throw new Error('PAYMENT_INSUFFICIENT');
  }
  private mutate(change: Partial<SaleSnapshot>, now: string): void {
    this.#state = { ...this.#state, ...change, version: this.#state.version + 1, updatedAt: now };
  }
  private emit(
    eventType: string,
    actorId: string,
    payload: Readonly<Record<string, unknown>>,
  ): void {
    this.#events.push({
      eventId: randomUUID(),
      eventType,
      eventVersion: 1,
      occurredAt: this.#state.updatedAt,
      tenantId: this.#state.tenantId,
      organizationId: this.#state.organizationId,
      branchId: this.#state.branchId,
      aggregateId: this.#state.id,
      aggregateVersion: this.#state.version,
      correlationId: this.#state.correlationId,
      actorId,
      source: this.#state.channel,
      payload,
    });
  }
}
