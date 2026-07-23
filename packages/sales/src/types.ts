import type { DecimalString, RoundingMode } from './money.js';

export const saleStatuses = [
  'DRAFT',
  'OPEN',
  'SUSPENDED',
  'CHECKOUT_PENDING',
  'PAYMENT_PENDING',
  'COMPLETED',
  'CANCELLED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
  'FAILED',
  'EXPIRED',
] as const;
export type SaleStatus = (typeof saleStatuses)[number];
export const saleChannels = [
  'WEB_POS',
  'FLUTTER_POS',
  'UMI',
  'API',
  'IMPORT',
  'ECOMMERCE_FUTURE',
  'MARKETPLACE_FUTURE',
] as const;
export type SaleChannel = (typeof saleChannels)[number];
export const paymentMethods = [
  'CASH',
  'CARD_EXTERNAL',
  'BANK_TRANSFER',
  'UMI_WALLET_FUTURE',
  'GIFT_CARD_FUTURE',
  'OTHER',
] as const;
export type PaymentMethod = (typeof paymentMethods)[number];
export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REFUNDED';
export type PriceSource =
  | 'BASE_PRICE'
  | 'PRICE_LIST'
  | 'MANUAL_OVERRIDE'
  | 'PROMOTION'
  | 'CUSTOMER_PRICE'
  | 'UMI_CONTRACT_PRICE';
export type TaxTreatment = 'EXCLUSIVE' | 'INCLUSIVE' | 'ZERO_RATED' | 'EXEMPT';
export type Discount = Readonly<{
  id: string;
  kind: 'PERCENT' | 'FIXED';
  value: string;
  actorId: string;
  permission: string;
  reason: string;
  scope: 'LINE' | 'SALE';
  source: 'MANUAL';
  occurredAt: string;
}>;
export type TaxSnapshot = Readonly<{
  profileId: string;
  profileVersion: number;
  treatment: TaxTreatment;
  rateBasisPoints: number;
  components: readonly Readonly<{ code: string; rateBasisPoints: number }>[];
}>;
export type SaleItem = Readonly<{
  id: string;
  productVariantId: string;
  productId?: string;
  sku: string;
  barcode?: string;
  productName: string;
  variantName: string;
  unit: string;
  quantity: DecimalString;
  unitAmountMinor: string;
  baseUnitAmountMinor: string;
  currency: string;
  priceSource: PriceSource;
  priceVersion: number;
  tax: TaxSnapshot;
  discounts: readonly Discount[];
  subtotalMinor: string;
  discountTotalMinor: string;
  taxTotalMinor: string;
  lineTotalMinor: string;
  notes?: string;
  metadata: Readonly<Record<string, string>>;
  version: number;
}>;
export type PaymentAllocation = Readonly<{
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amountMinor: string;
  tenderedMinor?: string;
  providerReference?: string;
  idempotencyKey: string;
}>;
export type SalesPolicy = Readonly<{
  currency: string;
  allowWithoutInventory: boolean;
  allowNegativeStock: boolean;
  automaticReservation: boolean;
  reservationTtlSeconds: number;
  allowDiscounts: boolean;
  maximumDiscountBasisPoints: number;
  requireSupervisorAboveBasisPoints: number;
  allowManualPrice: boolean;
  allowSuspendedSales: boolean;
  suspendedSaleTtlSeconds: number;
  allowCancellation: boolean;
  allowRefund: boolean;
  roundingMode: RoundingMode;
  enabledPaymentMethods: readonly PaymentMethod[];
}>;
export type SaleEvent = Readonly<{
  eventId: string;
  eventType: string;
  eventVersion: 1;
  occurredAt: string;
  tenantId: string;
  organizationId: string;
  branchId: string;
  aggregateId: string;
  aggregateVersion: number;
  correlationId: string;
  causationId?: string;
  actorId: string;
  source: SaleChannel;
  payload: Readonly<Record<string, unknown>>;
}>;
export type SaleSnapshot = Readonly<{
  id: string;
  tenantId: string;
  organizationId: string;
  branchId: string;
  registerId?: string;
  customerId?: string;
  sellerUserId: string;
  membershipId: string;
  currency: string;
  businessDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  version: number;
  status: SaleStatus;
  channel: SaleChannel;
  source: string;
  externalReference?: string;
  idempotencyKey: string;
  correlationId: string;
  notes?: string;
  metadata: Readonly<Record<string, string>>;
  items: readonly SaleItem[];
  payments: readonly PaymentAllocation[];
}>;
