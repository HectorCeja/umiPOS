import type {
  AuthorizationSalesPort,
  InventorySalesPort,
  ProductSalesPort,
  SalesContext,
  SalesPolicyPort,
} from './ports.js';
import type { Sale } from './sale.js';
import { calculateTotals } from './totals.js';

export type CheckoutPreparation = Readonly<{
  saleId: string;
  saleVersion: number;
  totals: ReturnType<typeof calculateTotals>;
  reservationIds: readonly string[];
  calculatedAt: string;
  expiresAt: string;
}>;

export class CheckoutEngine {
  constructor(
    private readonly authorization: AuthorizationSalesPort,
    private readonly products: ProductSalesPort,
    private readonly inventory: InventorySalesPort,
    private readonly policies: SalesPolicyPort,
  ) {}
  async calculate(context: SalesContext, sale: Sale) {
    await this.authorization.assert({
      context,
      permission: 'sales.update',
      resourceId: sale.snapshot().id,
    });
    const policy = await this.policies.get(context);
    if (sale.snapshot().currency !== policy.currency) throw new Error('CURRENCY_MISMATCH');
    return calculateTotals(sale.snapshot().items, sale.snapshot().payments);
  }
  async prepare(
    context: SalesContext,
    sale: Sale,
    now: Date,
    idempotencyKey: string,
  ): Promise<CheckoutPreparation> {
    await this.authorization.assert({
      context,
      permission: 'sales.complete',
      resourceId: sale.snapshot().id,
    });
    const policy = await this.policies.get(context);
    const state = sale.snapshot();
    if (state.status !== 'OPEN') throw new Error('SALE_INVALID_STATE');
    if (state.items.length === 0) throw new Error('SALE_EMPTY');
    const expiresAt = new Date(now.getTime() + policy.reservationTtlSeconds * 1000).toISOString();
    const reservations: string[] = [];
    try {
      for (const item of state.items) {
        const current = await this.products.resolveVariant({
          context,
          variantId: item.productVariantId,
          currency: state.currency,
        });
        if (!current.sellable) throw new Error('VARIANT_NOT_SELLABLE');
        if (
          current.priceVersion !== item.priceVersion ||
          current.unitAmountMinor !== item.baseUnitAmountMinor
        )
          throw new Error('CHECKOUT_RECALCULATION_REQUIRED');
        if (current.managesInventory && policy.automaticReservation) {
          const result = await this.inventory.reserve({
            context,
            saleId: state.id,
            variantId: item.productVariantId,
            quantity: item.quantity,
            expiresAt,
            idempotencyKey: `${idempotencyKey}:${item.id}`,
            allowNegative: policy.allowNegativeStock,
          });
          reservations.push(result.reservationId);
        } else if (current.managesInventory && !policy.allowWithoutInventory)
          throw new Error('INVENTORY_UNAVAILABLE');
      }
    } catch (error) {
      if (reservations.length)
        await this.inventory.release({
          context,
          saleId: state.id,
          reservationIds: reservations,
          reason: 'checkout preparation failed',
          idempotencyKey: `${idempotencyKey}:compensate`,
        });
      throw error;
    }
    sale.transition('CHECKOUT_PENDING', context.actorUserId, now.toISOString());
    return {
      saleId: state.id,
      saleVersion: sale.snapshot().version,
      totals: calculateTotals(sale.snapshot().items, sale.snapshot().payments),
      reservationIds: reservations,
      calculatedAt: now.toISOString(),
      expiresAt,
    };
  }
  async confirm(
    context: SalesContext,
    sale: Sale,
    reservationIds: readonly string[],
    now: Date,
    idempotencyKey: string,
  ): Promise<void> {
    await this.authorization.assert({
      context,
      permission: 'sales.complete',
      resourceId: sale.snapshot().id,
    });
    sale.assertCompletable();
    await this.inventory.commit({
      context,
      saleId: sale.snapshot().id,
      reservationIds,
      idempotencyKey,
    });
    sale.transition('COMPLETED', context.actorUserId, now.toISOString());
  }
}
