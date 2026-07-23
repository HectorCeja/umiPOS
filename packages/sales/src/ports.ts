import type { PaymentAllocation, SaleEvent, SalesPolicy } from './types.js';

export type SalesContext = Readonly<{
  tenantId: string;
  organizationId: string;
  branchId: string;
  actorUserId: string;
  membershipId: string;
  correlationId: string;
}>;
export interface ProductSalesPort {
  resolveVariant(
    input: Readonly<{ context: SalesContext; variantId: string; currency: string }>,
  ): Promise<
    Readonly<{
      variantId: string;
      productId: string;
      sku: string;
      barcode?: string;
      productName: string;
      variantName: string;
      unit: string;
      sellable: boolean;
      managesInventory: boolean;
      unitAmountMinor: string;
      priceVersion: number;
      taxProfileId: string;
      taxProfileVersion: number;
      taxTreatment: 'EXCLUSIVE' | 'INCLUSIVE' | 'ZERO_RATED' | 'EXEMPT';
      taxRateBasisPoints: number;
    }>
  >;
}
export interface InventorySalesPort {
  reserve(
    input: Readonly<{
      context: SalesContext;
      saleId: string;
      variantId: string;
      quantity: string;
      expiresAt: string;
      idempotencyKey: string;
      allowNegative: boolean;
    }>,
  ): Promise<Readonly<{ reservationId: string }>>;
  commit(
    input: Readonly<{
      context: SalesContext;
      saleId: string;
      reservationIds: readonly string[];
      idempotencyKey: string;
    }>,
  ): Promise<void>;
  release(
    input: Readonly<{
      context: SalesContext;
      saleId: string;
      reservationIds: readonly string[];
      reason: string;
      idempotencyKey: string;
    }>,
  ): Promise<void>;
}
export interface AuthorizationSalesPort {
  assert(
    input: Readonly<{
      context: SalesContext;
      permission: string;
      resourceId?: string;
      attributes?: Readonly<Record<string, unknown>>;
    }>,
  ): Promise<void>;
}
export interface SalesPolicyPort {
  get(context: SalesContext): Promise<SalesPolicy>;
}
export interface PaymentProviderPort {
  record(
    input: Readonly<{ context: SalesContext; saleId: string; allocation: PaymentAllocation }>,
  ): Promise<PaymentAllocation>;
}
export interface SalesEventPort {
  append(events: readonly SaleEvent[]): Promise<void>;
}
export interface UmiSalesIntegrationPort {
  publish(
    event: Readonly<{
      eventId: string;
      eventType:
        | 'nexo.sale.completed'
        | 'nexo.sale.cancelled'
        | 'nexo.sale.refunded'
        | 'nexo.sale.item_returned'
        | 'nexo.product.sold'
        | 'nexo.receipt.generated';
      eventVersion: 1;
      occurredAt: string;
      organizationId: string;
      branchId: string;
      saleId: string;
      correlationId: string;
      payload: Readonly<Record<string, unknown>>;
    }>,
  ): Promise<void>;
}
