import type { SaleChannel } from '@nexo/sales';

export const SALES_REPOSITORY = Symbol('SALES_REPOSITORY');
export interface SalesRepository {
  create(
    tenantId: string,
    actorId: string,
    input: {
      branchId: string;
      currency: string;
      channel: SaleChannel;
      businessDate: Date;
      source: string;
      idempotencyKey: string;
      correlationId: string;
      externalReference?: string;
      notes?: string;
    },
  ): Promise<unknown>;
  list(tenantId: string, actorId: string, branchId?: string): Promise<unknown>;
  get(
    tenantId: string,
    actorId: string,
    saleId: string,
  ): Promise<{
    sale: Record<string, unknown> & {
      id: string;
      branchId: string;
      currency: string;
      status: string;
      version: number;
      metadata: unknown;
    };
    items: Record<string, unknown>[];
    payments: Record<string, unknown>[];
  }>;
  addItem(
    tenantId: string,
    actorId: string,
    saleId: string,
    expectedVersion: number,
    idempotencyKey: string,
    item: {
      id: string;
      productVariantId: string;
      productId: string;
      snapshot: Record<string, unknown>;
      quantity: string;
      unitAmountMinor: string;
      subtotalMinor: string;
      discountMinor: string;
      taxMinor: string;
      totalMinor: string;
    },
  ): Promise<unknown>;
  transition(
    tenantId: string,
    actorId: string,
    saleId: string,
    expectedVersion: number,
    to: string,
    permission: string,
    idempotencyKey: string,
    reason?: string,
    metadata?: Record<string, unknown>,
  ): Promise<unknown>;
  payment(
    tenantId: string,
    actorId: string,
    saleId: string,
    input: {
      id: string;
      method: string;
      amountMinor: string;
      tenderedMinor?: string;
      providerReference?: string;
      idempotencyKey: string;
    },
  ): Promise<unknown>;
  paymentOutcome(
    tenantId: string,
    actorId: string,
    saleId: string,
    paymentAttemptId: string,
  ): Promise<unknown>;
  paymentOutcomeByKey(
    tenantId: string,
    actorId: string,
    saleId: string,
    idempotencyKey: string,
  ): Promise<unknown>;
  policy(tenantId: string, branchId: string): Promise<Record<string, unknown>>;
  updatePolicy(
    tenantId: string,
    actorId: string,
    branchId: string,
    configuration: Record<string, unknown>,
  ): Promise<unknown>;
  refund(
    tenantId: string,
    actorId: string,
    saleId: string,
    key: string,
    input: {
      lines: readonly {
        saleItemId: string;
        quantity: string;
        amountMinor: string;
        destination: 'AVAILABLE' | 'DAMAGED' | 'QUARANTINE' | 'DISCARDED';
        reason: string;
      }[];
    },
  ): Promise<unknown>;
  approveRefund(
    tenantId: string,
    actorId: string,
    saleId: string,
    refundId: string,
    key: string,
    reason: string,
  ): Promise<unknown>;
  receipt(tenantId: string, actorId: string, saleId: string, key: string): Promise<unknown>;
  mappings(tenantId: string, actorId: string): Promise<unknown>;
  overview(tenantId: string, actorId: string, query: SalesAdminQuery): Promise<unknown>;
  search(tenantId: string, actorId: string, query: SalesAdminQuery): Promise<unknown>;
  detail(tenantId: string, actorId: string, saleId: string): Promise<unknown>;
  timeline(tenantId: string, actorId: string, saleId: string): Promise<unknown>;
  refunds(tenantId: string, actorId: string, query: SalesAdminQuery): Promise<unknown>;
  receipts(tenantId: string, actorId: string, query: SalesAdminQuery): Promise<unknown>;
  exceptions(tenantId: string, actorId: string, query: SalesAdminQuery): Promise<unknown>;
  diagnostic(tenantId: string, actorId: string, saleId: string): Promise<unknown>;
}

export interface SalesAdminQuery {
  branchId?: string;
  status?: string;
  search?: string;
  businessDate?: string;
  paymentMethod?: string;
  page?: number;
  pageSize?: number;
}
