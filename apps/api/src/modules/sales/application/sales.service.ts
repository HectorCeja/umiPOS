import { randomUUID } from 'node:crypto';
import { calculateLine, calculateTotals, type SaleChannel, type SalesPolicy } from '@nexo/sales';
import { Inject, Injectable, ConflictException } from '@nestjs/common';
import type { SessionIdentity } from '../../authentication/application/authentication.ports.js';
import { AuthorizationService } from '../../authorization/application/authorization.service.js';
import {
  PRODUCT_SALES_CATALOG,
  type ProductSalesCatalog,
} from '../../product/application/product-sales.port.js';
import {
  INVENTORY_SALES_COORDINATOR,
  type InventorySalesCoordinator,
} from '../../inventory/application/inventory-sales.port.js';
import { SALES_REPOSITORY, type SalesAdminQuery, type SalesRepository } from './sales.ports.js';

const defaults: SalesPolicy = {
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
const transportSafe = (value: unknown): unknown =>
  JSON.parse(
    JSON.stringify(value, (_key, item: unknown) =>
      typeof item === 'bigint' ? String(item) : item,
    ),
  ) as unknown;

@Injectable()
export class SalesService {
  constructor(
    @Inject(SALES_REPOSITORY) private readonly repository: SalesRepository,
    @Inject(PRODUCT_SALES_CATALOG) private readonly products: ProductSalesCatalog,
    @Inject(INVENTORY_SALES_COORDINATOR) private readonly inventory: InventorySalesCoordinator,
    private readonly authorization: AuthorizationService,
  ) {}
  create(
    i: SessionIdentity,
    t: string,
    b: {
      branchId: string;
      currency: string;
      channel: SaleChannel;
      businessDate: Date;
      externalReference?: string;
      notes?: string;
    },
    key: string,
  ) {
    return this.authorization
      .assert(i, t, 'sales.create', { type: 'sale', branchId: b.branchId })
      .then(() =>
        this.repository.create(t, i.userId, {
          ...b,
          source: b.channel,
          idempotencyKey: key,
          correlationId: randomUUID(),
        }),
      );
  }
  async list(i: SessionIdentity, t: string, branchId?: string) {
    await this.authorization.assert(i, t, 'sales.read', {
      type: 'sale',
      ...(branchId ? { branchId } : {}),
    });
    return transportSafe(await this.repository.list(t, i.userId, branchId));
  }
  async get(i: SessionIdentity, t: string, id: string) {
    await this.authorization.assert(i, t, 'sales.read', { type: 'sale', id });
    return transportSafe(await this.repository.get(t, i.userId, id));
  }
  async add(
    i: SessionIdentity,
    t: string,
    id: string,
    version: number,
    key: string,
    input: { productVariantId: string; quantity: string; notes?: string },
  ) {
    const current = await this.repository.get(t, i.userId, id);
    const sale = current.sale;
    await this.authorization.assert(i, t, 'sales.update', {
      type: 'sale',
      id,
      branchId: sale.branchId,
    });
    const variant = await this.products.resolveVariant(t, input.productVariantId, sale.currency);
    if (!variant.sellable) throw new ConflictException('VARIANT_NOT_SELLABLE');
    const tax = {
      profileId: variant.taxProfileId,
      profileVersion: variant.taxProfileVersion,
      treatment: variant.taxTreatment,
      rateBasisPoints: variant.taxRateBasisPoints,
      components: [{ code: 'IVA', rateBasisPoints: variant.taxRateBasisPoints }],
    };
    const value = calculateLine({
      unitAmountMinor: variant.unitAmountMinor,
      quantity: input.quantity,
      discounts: [],
      tax,
      roundingMode: 'HALF_UP',
    });
    const snapshot = {
      sku: variant.sku,
      ...(variant.barcode ? { barcode: variant.barcode } : {}),
      productName: variant.productName,
      variantName: variant.variantName,
      unit: variant.unit,
      currency: sale.currency,
      baseUnitAmountMinor: variant.unitAmountMinor,
      priceSource: 'BASE_PRICE',
      priceVersion: variant.priceVersion,
      tax,
      discounts: [],
      ...(input.notes ? { notes: input.notes } : {}),
    };
    return transportSafe(
      await this.repository.addItem(t, i.userId, id, version, key, {
        id: randomUUID(),
        productVariantId: variant.variantId,
        productId: variant.productId,
        snapshot,
        quantity: input.quantity,
        unitAmountMinor: variant.unitAmountMinor,
        subtotalMinor: String(value.subtotalMinor),
        discountMinor: String(value.discountMinor),
        taxMinor: String(value.taxMinor),
        totalMinor: String(value.totalMinor),
      }),
    );
  }
  async prepare(i: SessionIdentity, t: string, id: string, version: number, key: string) {
    const current = await this.repository.get(t, i.userId, id);
    const sale = current.sale;
    await this.authorization.assert(i, t, 'sales.complete', {
      type: 'sale',
      id,
      branchId: sale.branchId,
    });
    if (sale.status !== 'OPEN' || current.items.length === 0)
      throw new ConflictException('SALE_INVALID_STATE');
    const policy = {
      ...defaults,
      ...(await this.repository.policy(t, sale.branchId)),
    } as SalesPolicy;
    const reservationIds: string[] = [];
    try {
      for (const row of current.items) {
        const item = row as {
          id: string;
          productVariantId: string;
          quantity: { toString(): string };
          snapshot: { priceVersion: number; baseUnitAmountMinor: string };
        };
        const variant = await this.products.resolveVariant(t, item.productVariantId, sale.currency);
        if (
          variant.priceVersion !== item.snapshot.priceVersion ||
          variant.unitAmountMinor !== item.snapshot.baseUnitAmountMinor
        )
          throw new ConflictException('CHECKOUT_RECALCULATION_REQUIRED');
        if (variant.managesInventory && policy.automaticReservation) {
          const r = await this.inventory.reserve({
            tenantId: t,
            branchId: sale.branchId,
            actorId: i.userId,
            saleId: id,
            variantId: item.productVariantId,
            quantity: item.quantity.toString(),
            expiresAt: new Date(Date.now() + policy.reservationTtlSeconds * 1000),
            idempotencyKey: `${key}:${item.id}`,
            allowNegative: policy.allowNegativeStock,
          });
          reservationIds.push(r.reservationId);
        }
      }
    } catch (error) {
      if (reservationIds.length)
        await this.inventory.release({
          tenantId: t,
          actorId: i.userId,
          reservationIds,
          reason: 'Checkout preparation failed',
          idempotencyKey: `${key}:compensate`,
        });
      throw error;
    }
    const transition = (await this.repository.transition(
      t,
      i.userId,
      id,
      version,
      'CHECKOUT_PENDING',
      'sales.complete',
      key,
      undefined,
      { reservationIds },
    )) as Record<string, unknown>;
    const totalMinor = current.items.reduce((sum, row) => {
      const item = row as { totalMinor: bigint };
      return sum + item.totalMinor;
    }, 0n);
    return transportSafe({ ...transition, totalMinor });
  }
  async payment(
    i: SessionIdentity,
    t: string,
    id: string,
    key: string,
    b: { method: string; amountMinor: string; tenderedMinor?: string; providerReference?: string },
  ) {
    const current = await this.repository.get(t, i.userId, id);
    await this.authorization.assert(i, t, 'payments.record', {
      type: 'payment',
      branchId: current.sale.branchId,
    });
    return transportSafe(
      await this.repository.payment(t, i.userId, id, {
        id: randomUUID(),
        ...b,
        idempotencyKey: key,
      }),
    );
  }
  async paymentOutcome(i: SessionIdentity, t: string, saleId: string, paymentAttemptId: string) {
    const current = await this.repository.get(t, i.userId, saleId);
    await this.authorization.assert(i, t, 'payments.record', {
      type: 'payment',
      branchId: current.sale.branchId,
    });
    return transportSafe(
      await this.repository.paymentOutcome(t, i.userId, saleId, paymentAttemptId),
    );
  }
  async paymentOutcomeByKey(i: SessionIdentity, t: string, saleId: string, key: string) {
    const current = await this.repository.get(t, i.userId, saleId);
    await this.authorization.assert(i, t, 'payments.record', {
      type: 'payment',
      branchId: current.sale.branchId,
    });
    return transportSafe(await this.repository.paymentOutcomeByKey(t, i.userId, saleId, key));
  }
  async complete(i: SessionIdentity, t: string, id: string, version: number, key: string) {
    const current = await this.repository.get(t, i.userId, id);
    const totals = calculateTotals(
      current.items.map((row) => {
        const item = row as {
          id: string;
          productVariantId: string;
          productId?: string;
          snapshot: Record<string, unknown>;
          quantity: { toString(): string };
          unitAmountMinor: bigint;
          subtotalMinor: bigint;
          discountMinor: bigint;
          taxMinor: bigint;
          totalMinor: bigint;
          version: number;
        };
        return {
          id: item.id,
          productVariantId: item.productVariantId,
          ...(item.productId ? { productId: item.productId } : {}),
          ...(item.snapshot as object),
          quantity: item.quantity.toString(),
          unitAmountMinor: String(item.unitAmountMinor),
          subtotalMinor: String(item.subtotalMinor),
          discountTotalMinor: String(item.discountMinor),
          taxTotalMinor: String(item.taxMinor),
          lineTotalMinor: String(item.totalMinor),
          version: item.version,
          metadata: {},
        } as never;
      }),
      current.payments.map((row) => {
        const p = row as {
          id: string;
          method: string;
          status: string;
          amountMinor: bigint;
          tenderedMinor?: bigint;
          providerReference?: string;
          idempotencyKey: string;
        };
        return {
          ...p,
          amountMinor: String(p.amountMinor),
          ...(p.tenderedMinor ? { tenderedMinor: String(p.tenderedMinor) } : {}),
        } as never;
      }),
    );
    if (totals.dueMinor !== '0') throw new ConflictException('PAYMENT_INSUFFICIENT');
    const metadata = (current.sale.metadata ?? {}) as { reservationIds?: string[] };
    await this.inventory.commit({
      tenantId: t,
      actorId: i.userId,
      reservationIds: metadata.reservationIds ?? [],
      idempotencyKey: `${key}:inventory`,
    });
    return this.repository.transition(
      t,
      i.userId,
      id,
      version,
      'COMPLETED',
      'sales.complete',
      key,
      undefined,
      {
        integration: {
          branchId: current.sale.branchId,
          saleFolio: current.sale.folio,
          currency: current.sale.currency,
          totals,
          soldItems: current.items.map((row) => {
            const item = row as {
              productVariantId: string;
              quantity: { toString(): string };
              unitAmountMinor: bigint;
              totalMinor: bigint;
              snapshot: { sku?: string };
            };
            return {
              productVariantId: item.productVariantId,
              sku: item.snapshot.sku,
              quantity: item.quantity.toString(),
              unitAmountMinor: String(item.unitAmountMinor),
              lineTotalMinor: String(item.totalMinor),
            };
          }),
        },
      },
    );
  }
  async transition(
    i: SessionIdentity,
    t: string,
    id: string,
    v: number,
    key: string,
    to: string,
    permission: string,
    reason?: string,
  ) {
    if (to === 'SUSPENDED') {
      const current = await this.repository.get(t, i.userId, id);
      const policy = {
        ...defaults,
        ...(await this.repository.policy(t, current.sale.branchId)),
      } as SalesPolicy;
      if (!policy.allowSuspendedSales) throw new ConflictException('FEATURE_DISABLED');
      return this.repository.transition(t, i.userId, id, v, to, permission, key, reason, {
        suspendedExpiresAt: new Date(
          Date.now() + policy.suspendedSaleTtlSeconds * 1000,
        ).toISOString(),
      });
    }
    if (to !== 'CANCELLED')
      return this.repository.transition(t, i.userId, id, v, to, permission, key, reason);
    const current = await this.repository.get(t, i.userId, id);
    const metadata = (current.sale.metadata ?? {}) as { reservationIds?: string[] };
    if (metadata.reservationIds?.length)
      await this.inventory.release({
        tenantId: t,
        actorId: i.userId,
        reservationIds: metadata.reservationIds,
        reason: reason ?? 'Sale cancelled',
        idempotencyKey: `${key}:inventory`,
      });
    return this.repository.transition(t, i.userId, id, v, to, permission, key, reason);
  }
  async refund(
    i: SessionIdentity,
    t: string,
    id: string,
    key: string,
    input: Parameters<SalesRepository['refund']>[4],
  ) {
    await this.authorization.assert(i, t, 'sales.refund', { type: 'sale', id });
    return transportSafe(await this.repository.refund(t, i.userId, id, key, input));
  }
  async approveRefund(
    i: SessionIdentity,
    t: string,
    saleId: string,
    refundId: string,
    key: string,
    reason: string,
  ) {
    await this.authorization.assert(i, t, 'sales.refund', { type: 'sale', id: saleId });
    return transportSafe(
      await this.repository.approveRefund(t, i.userId, saleId, refundId, key, reason),
    );
  }
  async receipt(i: SessionIdentity, t: string, id: string, key: string) {
    await this.authorization.assert(i, t, 'receipts.generate', { type: 'receipt' });
    return transportSafe(await this.repository.receipt(t, i.userId, id, key));
  }
  async policy(i: SessionIdentity, t: string, branchId: string) {
    await this.authorization.assert(i, t, 'sales.read', { type: 'sale', branchId });
    return this.repository.policy(t, branchId);
  }
  async updatePolicy(
    i: SessionIdentity,
    t: string,
    branchId: string,
    configuration: Record<string, unknown>,
  ) {
    await this.authorization.assert(i, t, 'organization.update', {
      type: 'sales_policy',
      branchId,
    });
    return transportSafe(await this.repository.updatePolicy(t, i.userId, branchId, configuration));
  }
  async mappings(i: SessionIdentity, t: string) {
    await this.authorization.assert(i, t, 'sales.view_all_branches', { type: 'external_mapping' });
    return transportSafe(await this.repository.mappings(t, i.userId));
  }
  private async adminRead(i: SessionIdentity, t: string, permission: string, branchId?: string) {
    await this.authorization.assert(i, t, permission, {
      type: 'sales_administration',
      ...(branchId ? { branchId } : {}),
    });
  }
  async overview(i: SessionIdentity, t: string, q: SalesAdminQuery) {
    await this.adminRead(i, t, 'sales.dashboard.read', q.branchId);
    return transportSafe(await this.repository.overview(t, i.userId, q));
  }
  async search(i: SessionIdentity, t: string, q: SalesAdminQuery) {
    await this.adminRead(i, t, 'sales.history.read', q.branchId);
    return transportSafe(await this.repository.search(t, i.userId, q));
  }
  async detail(i: SessionIdentity, t: string, id: string) {
    await this.adminRead(i, t, 'sales.detail.read');
    return transportSafe(await this.repository.detail(t, i.userId, id));
  }
  async timeline(i: SessionIdentity, t: string, id: string) {
    await this.adminRead(i, t, 'sales.timeline.read');
    return transportSafe(await this.repository.timeline(t, i.userId, id));
  }
  async refunds(i: SessionIdentity, t: string, q: SalesAdminQuery) {
    await this.adminRead(i, t, 'sales.history.read', q.branchId);
    return transportSafe(await this.repository.refunds(t, i.userId, q));
  }
  async receipts(i: SessionIdentity, t: string, q: SalesAdminQuery) {
    await this.adminRead(i, t, 'sales.receipt.read', q.branchId);
    return transportSafe(await this.repository.receipts(t, i.userId, q));
  }
  async exceptions(i: SessionIdentity, t: string, q: SalesAdminQuery) {
    await this.adminRead(i, t, 'sales.exceptions.read', q.branchId);
    return transportSafe(await this.repository.exceptions(t, i.userId, q));
  }
  async diagnostic(i: SessionIdentity, t: string, id: string) {
    await this.adminRead(i, t, 'sales.diagnostics.read');
    return transportSafe(await this.repository.diagnostic(t, i.userId, id));
  }
}
