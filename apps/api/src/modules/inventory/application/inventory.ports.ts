import type { CostMethod, MovementType, StockState } from '@nexo/inventory';
export const INVENTORY_REPOSITORY = Symbol('INVENTORY_REPOSITORY');
export type MovementInput = Readonly<{
  variantId: string;
  locationId: string;
  type: MovementType;
  state: StockState;
  quantity: string;
  unitCost?: string;
  currency?: string;
  reason: string;
  occurredAt: Date;
  idempotencyKey: string;
  referenceType?: string;
  referenceId?: string;
}>;
export interface InventoryRepository {
  locations(tenantId: string, branchId?: string, includeArchived?: boolean): Promise<unknown>;
  createLocation(
    tenantId: string,
    actor: string,
    input: {
      branchId: string;
      parentId?: string;
      type: 'BRANCH' | 'WAREHOUSE' | 'ZONE' | 'SHELF' | 'BIN';
      code: string;
      name: string;
    },
  ): Promise<unknown>;
  updateLocation(
    tenantId: string,
    actor: string,
    locationId: string,
    input: {
      branchId?: string;
      type?: 'BRANCH' | 'WAREHOUSE' | 'ZONE' | 'SHELF' | 'BIN';
      code?: string;
      name?: string;
      active?: boolean;
    },
  ): Promise<unknown>;
  record(tenantId: string, actor: string, input: MovementInput): Promise<unknown>;
  availability(
    tenantId: string,
    variantId: string,
    locationId: string,
  ): Promise<Record<string, string>>;
  timeline(tenantId: string, variantId: string, locationId: string): Promise<unknown>;
  reserve(
    tenantId: string,
    actor: string,
    input: {
      variantId: string;
      locationId: string;
      quantity: string;
      sourceType: string;
      sourceId: string;
      expiresAt: Date;
      idempotencyKey: string;
    },
  ): Promise<unknown>;
  release(
    tenantId: string,
    actor: string,
    reservationId: string,
    reason: string,
    idempotencyKey: string,
  ): Promise<unknown>;
  consume(
    tenantId: string,
    actor: string,
    reservationId: string,
    idempotencyKey: string,
  ): Promise<unknown>;
  transfer(
    tenantId: string,
    actor: string,
    input: {
      variantId: string;
      fromLocationId: string;
      toLocationId: string;
      quantity: string;
      idempotencyKey: string;
    },
  ): Promise<unknown>;
  completeTransfer(
    tenantId: string,
    actor: string,
    id: string,
    idempotencyKey: string,
  ): Promise<unknown>;
  count(
    tenantId: string,
    actor: string,
    input: {
      variantId: string;
      locationId: string;
      countedQuantity: string;
      reason: string;
      idempotencyKey: string;
    },
  ): Promise<unknown>;
  policy(
    tenantId: string,
    actor: string,
    input: {
      variantId: string;
      allowNegative: boolean;
      costMethod: CostMethod;
      standardUnitCost?: string;
    },
  ): Promise<unknown>;
}
