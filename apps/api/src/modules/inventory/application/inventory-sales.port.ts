export const INVENTORY_SALES_COORDINATOR = Symbol('INVENTORY_SALES_COORDINATOR');
export interface InventorySalesCoordinator {
  reserve(
    input: Readonly<{
      tenantId: string;
      branchId: string;
      actorId: string;
      saleId: string;
      variantId: string;
      quantity: string;
      expiresAt: Date;
      idempotencyKey: string;
      allowNegative: boolean;
    }>,
  ): Promise<Readonly<{ reservationId: string }>>;
  commit(
    input: Readonly<{
      tenantId: string;
      actorId: string;
      reservationIds: readonly string[];
      idempotencyKey: string;
    }>,
  ): Promise<void>;
  release(
    input: Readonly<{
      tenantId: string;
      actorId: string;
      reservationIds: readonly string[];
      reason: string;
      idempotencyKey: string;
    }>,
  ): Promise<void>;
}
