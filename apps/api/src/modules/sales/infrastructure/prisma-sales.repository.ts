import { createHash, randomUUID } from 'node:crypto';
import type { DatabaseClient, DatabaseTransaction, Prisma } from '@nexo/database';
import { withTenantTransaction } from '@nexo/database';
import {
  assertTransition,
  calculateRefundAmountMinor,
  parseDecimal,
  requestFingerprint,
} from '@nexo/sales';
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE } from '../../../infrastructure/infrastructure.module.js';
import { assertTransactionalAuthorization } from '../../authorization/infrastructure/transactional-authorization.js';
import type { SalesRepository } from '../application/sales.ports.js';

const canonicalPaymentStatus = (status: string): string =>
  (
    ({
      CAPTURED: 'approved',
      APPROVED: 'approved',
      DECLINED: 'declined',
      FAILED: 'failed',
      CANCELLED: 'cancelled',
      REVERSED: 'reversed',
      REFUNDED: 'refunded',
      PROCESSING: 'processing',
      CREATED: 'pending',
      UNKNOWN: 'unknown',
    }) as Readonly<Record<string, string>>
  )[status] ?? 'unknown';

@Injectable()
export class PrismaSalesRepository implements SalesRepository {
  constructor(@Inject(DATABASE) private readonly db: DatabaseClient) {}
  create(t: string, a: string, input: Parameters<SalesRepository['create']>[2]) {
    return withTenantTransaction(this.db, t, async (tx) => {
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.create',
        resource: { type: 'sale', branchId: input.branchId },
      });
      const fingerprint = requestFingerprint({
        branchId: input.branchId,
        currency: input.currency,
        channel: input.channel,
        businessDate: input.businessDate.toISOString().slice(0, 10),
        externalReference: input.externalReference,
        notes: input.notes,
      });
      // Serialize only contenders for the same logical create operation. The
      // unique constraints remain the final guard, while this lets concurrent
      // retries observe the committed idempotency record instead of surfacing
      // a transient unique-constraint error as HTTP 500.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${t}:CREATE_SALE:${input.idempotencyKey}`}, 0))`;
      const replay = await tx.salesIdempotencyRecord.findUnique({
        where: {
          tenantId_operation_key: {
            tenantId: t,
            operation: 'CREATE_SALE',
            key: input.idempotencyKey,
          },
        },
      });
      if (replay) {
        if (replay.requestFingerprint !== fingerprint)
          throw new ConflictException('IDEMPOTENCY_CONFLICT');
        if (!replay.resourceId) throw new ConflictException('IDEMPOTENCY_CONFLICT');
        return tx.saleRecord.findFirstOrThrow({ where: { tenantId: t, id: replay.resourceId } });
      }
      const membership = await tx.membership.findUnique({
        where: { tenantId_principalId: { tenantId: t, principalId: a } },
      });
      if (!membership) throw new NotFoundException('Membership not found');
      const sequence = await tx.salesFolioSequence.upsert({
        where: { tenantId_branchId: { tenantId: t, branchId: input.branchId } },
        create: { tenantId: t, branchId: input.branchId, prefix: 'S', nextValue: 2n },
        update: { nextValue: { increment: 1 } },
      });
      const folio = `${sequence.prefix}-${String(sequence.nextValue - 1n).padStart(8, '0')}`;
      const sale = await tx.saleRecord.create({
        data: {
          tenantId: t,
          organizationId: t,
          branchId: input.branchId,
          sellerUserId: a,
          membershipId: membership.id,
          currency: input.currency,
          businessDate: input.businessDate,
          folio,
          status: 'OPEN',
          channel: input.channel,
          source: input.source,
          idempotencyKey: input.idempotencyKey,
          correlationId: input.correlationId,
          ...(input.externalReference ? { externalReference: input.externalReference } : {}),
          ...(input.notes ? { notes: input.notes } : {}),
        },
      });
      await this.event(tx, t, sale.id, sale.version, 'SaleCreated', sale.correlationId, a, {
        status: 'DRAFT',
      });
      await this.event(tx, t, sale.id, sale.version, 'SaleOpened', sale.correlationId, a, {
        status: 'OPEN',
      });
      await tx.salesIdempotencyRecord.create({
        data: {
          tenantId: t,
          operation: 'CREATE_SALE',
          key: input.idempotencyKey,
          requestFingerprint: fingerprint,
          responseStatus: 201,
          responseBody: { id: sale.id },
          resourceId: sale.id,
          expiresAt: new Date(Date.now() + 30 * 86400000),
        },
      });
      return sale;
    });
  }
  list(t: string, a: string, branchId?: string) {
    return withTenantTransaction(this.db, t, async (tx) => {
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.read',
        resource: { type: 'sale', ...(branchId ? { branchId } : {}) },
      });
      return tx.saleRecord.findMany({
        where: { tenantId: t, ...(branchId ? { branchId } : {}) },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });
  }
  get(t: string, a: string, id: string) {
    return withTenantTransaction(this.db, t, async (tx) => {
      const sale = await tx.saleRecord.findFirst({ where: { tenantId: t, id } });
      if (!sale) throw new NotFoundException('SALE_NOT_FOUND');
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.read',
        resource: { type: 'sale', id, branchId: sale.branchId },
      });
      const [items, payments] = await Promise.all([
        tx.saleItemRecord.findMany({
          where: { tenantId: t, saleId: id },
          orderBy: { createdAt: 'asc' },
        }),
        tx.salePaymentRecord.findMany({
          where: { tenantId: t, saleId: id },
          orderBy: { createdAt: 'asc' },
        }),
      ]);
      return {
        sale: sale as unknown as Record<string, unknown> & {
          id: string;
          branchId: string;
          currency: string;
          status: string;
          version: number;
          metadata: unknown;
        },
        items: items as unknown as Record<string, unknown>[],
        payments: payments as unknown as Record<string, unknown>[],
      };
    });
  }
  addItem(
    t: string,
    a: string,
    id: string,
    v: number,
    key: string,
    item: Parameters<SalesRepository['addItem']>[5],
  ) {
    return withTenantTransaction(this.db, t, async (tx) => {
      const sale = await this.saleForUpdate(tx, t, id);
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.update',
        resource: { type: 'sale', id, branchId: sale.branchId },
      });
      if (!['DRAFT', 'OPEN'].includes(sale.status))
        throw new ConflictException('SALE_INVALID_STATE');
      const replay = await tx.salesIdempotencyRecord.findUnique({
        where: { tenantId_operation_key: { tenantId: t, operation: 'ADD_ITEM', key } },
      });
      const fingerprint = requestFingerprint(item);
      if (replay) {
        if (replay.requestFingerprint !== fingerprint)
          throw new ConflictException('IDEMPOTENCY_CONFLICT');
        return replay.responseBody;
      }
      if (sale.version !== v) throw new ConflictException('SALE_VERSION_CONFLICT');
      const created = await tx.saleItemRecord.create({
        data: {
          tenantId: t,
          saleId: id,
          id: item.id,
          productVariantId: item.productVariantId,
          productId: item.productId,
          snapshot: item.snapshot as Prisma.InputJsonValue,
          quantity: item.quantity,
          unitAmountMinor: BigInt(item.unitAmountMinor),
          subtotalMinor: BigInt(item.subtotalMinor),
          discountMinor: BigInt(item.discountMinor),
          taxMinor: BigInt(item.taxMinor),
          totalMinor: BigInt(item.totalMinor),
        },
      });
      const updated = await tx.saleRecord.updateMany({
        where: { tenantId: t, id, version: v },
        data: { version: { increment: 1 } },
      });
      if (updated.count !== 1) throw new ConflictException('SALE_VERSION_CONFLICT');
      await this.event(tx, t, id, v + 1, 'SaleItemAdded', sale.correlationId, a, {
        itemId: item.id,
        productVariantId: item.productVariantId,
      });
      await tx.salesIdempotencyRecord.create({
        data: {
          tenantId: t,
          operation: 'ADD_ITEM',
          key,
          requestFingerprint: fingerprint,
          responseStatus: 200,
          responseBody: { id: created.id } as Prisma.InputJsonValue,
          resourceId: id,
          expiresAt: new Date(Date.now() + 86400000),
        },
      });
      return created;
    });
  }
  transition(
    t: string,
    a: string,
    id: string,
    v: number,
    to: string,
    permission: string,
    key: string,
    reason?: string,
    metadata?: Record<string, unknown>,
  ) {
    return withTenantTransaction(this.db, t, async (tx) => {
      const sale = await this.saleForUpdate(tx, t, id);
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission,
        resource: { type: 'sale', id, branchId: sale.branchId },
      });
      const replay = await tx.salesIdempotencyRecord.findUnique({
        where: { tenantId_operation_key: { tenantId: t, operation: `TRANSITION_${to}`, key } },
      });
      const fingerprint = requestFingerprint({ id, v, to, reason, metadata });
      if (replay) {
        if (replay.requestFingerprint !== fingerprint)
          throw new ConflictException('IDEMPOTENCY_CONFLICT');
        return replay.responseBody;
      }
      try {
        assertTransition(sale.status as never, to as never);
      } catch (error) {
        if (error instanceof Error && error.message === 'SALE_INVALID_STATE')
          throw new ConflictException('SALE_INVALID_STATE');
        throw error;
      }
      if (['CANCELLED', 'FAILED', 'EXPIRED'].includes(to) && !reason)
        throw new ConflictException('SALE_REASON_REQUIRED');
      const result = await tx.saleRecord.updateMany({
        where: { tenantId: t, id, version: v },
        data: {
          status: to,
          version: { increment: 1 },
          ...(to === 'COMPLETED' ? { completedAt: new Date() } : {}),
          ...(to === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
          ...(to === 'SUSPENDED' && typeof metadata?.suspendedExpiresAt === 'string'
            ? { expiresAt: new Date(metadata.suspendedExpiresAt) }
            : {}),
          ...(to === 'OPEN' && sale.status === 'SUSPENDED' ? { expiresAt: null } : {}),
          ...(metadata
            ? {
                metadata: {
                  ...(sale.metadata as Record<string, unknown>),
                  ...metadata,
                } as Prisma.InputJsonValue,
              }
            : {}),
        },
      });
      if (result.count !== 1) throw new ConflictException('SALE_VERSION_CONFLICT');
      const eventType =
        to === 'CHECKOUT_PENDING'
          ? 'CheckoutPrepared'
          : to === 'OPEN' && sale.status === 'SUSPENDED'
            ? 'SaleResumed'
            : `Sale${to
                .split('_')
                .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
                .join('')}`;
      await this.event(tx, t, id, v + 1, eventType, sale.correlationId, a, {
        ...(reason ? { reason } : {}),
        ...(metadata ? { metadata } : {}),
      });
      if (to === 'CHECKOUT_PENDING' && metadata?.reservationIds)
        await this.event(tx, t, id, v + 1, 'InventoryReservationRequested', sale.correlationId, a, {
          reservationIds: metadata.reservationIds,
        });
      if (to === 'CANCELLED') {
        const reservationIds = (sale.metadata as { reservationIds?: unknown }).reservationIds;
        if (Array.isArray(reservationIds) && reservationIds.length)
          await this.event(
            tx,
            t,
            id,
            v + 1,
            'InventoryReservationReleased',
            sale.correlationId,
            a,
            { reservationIds },
          );
      }
      const body = { id, status: to, version: v + 1 };
      await tx.salesIdempotencyRecord.create({
        data: {
          tenantId: t,
          operation: `TRANSITION_${to}`,
          key,
          requestFingerprint: fingerprint,
          responseStatus: 200,
          responseBody: body,
          resourceId: id,
          expiresAt: new Date(Date.now() + 30 * 86400000),
        },
      });
      return body;
    });
  }
  payment(t: string, a: string, id: string, input: Parameters<SalesRepository['payment']>[3]) {
    return withTenantTransaction(this.db, t, async (tx) => {
      const sale = await this.saleForUpdate(tx, t, id);
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'payments.record',
        resource: { type: 'payment', branchId: sale.branchId },
      });
      const replay = await tx.salePaymentRecord.findUnique({
        where: { tenantId_idempotencyKey: { tenantId: t, idempotencyKey: input.idempotencyKey } },
      });
      if (replay) {
        const sameRequest =
          replay.saleId === id &&
          replay.method === input.method &&
          replay.amountMinor === BigInt(input.amountMinor) &&
          replay.tenderedMinor === (input.tenderedMinor ? BigInt(input.tenderedMinor) : null) &&
          replay.providerReference === (input.providerReference ?? null);
        if (!sameRequest) throw new ConflictException('PAYMENT_IDEMPOTENCY_CONFLICT');
        const intent = await tx.paymentIntentRecord.findUnique({
          where: {
            tenantId_idempotencyKey: { tenantId: t, idempotencyKey: input.idempotencyKey },
          },
          include: { attempts: { orderBy: { sequence: 'desc' }, take: 1 } },
        });
        return {
          ...replay,
          ...(intent
            ? {
                paymentIntentId: intent.id,
                ...(intent.attempts[0] ? { paymentAttemptId: intent.attempts[0].id } : {}),
              }
            : {}),
          saleVersion: sale.version,
        };
      }
      if (!['CHECKOUT_PENDING', 'PAYMENT_PENDING'].includes(sale.status))
        throw new ConflictException('SALE_INVALID_STATE');
      const amountMinor = BigInt(input.amountMinor);
      const tenderedMinor = input.tenderedMinor ? BigInt(input.tenderedMinor) : null;
      if (input.method === 'CASH') {
        if (tenderedMinor === null || tenderedMinor < amountMinor)
          throw new ConflictException('CASH_TENDERED_INSUFFICIENT');
      } else if (tenderedMinor !== null) {
        throw new ConflictException('TENDERED_AMOUNT_CASH_ONLY');
      }
      const [items, captured] = await Promise.all([
        tx.saleItemRecord.aggregate({
          where: { tenantId: t, saleId: id },
          _sum: { totalMinor: true },
        }),
        tx.salePaymentRecord.aggregate({
          where: { tenantId: t, saleId: id, status: 'CAPTURED' },
          _sum: { amountMinor: true },
        }),
      ]);
      const totalMinor = items._sum.totalMinor ?? 0n;
      const paidMinor = captured._sum.amountMinor ?? 0n;
      if (paidMinor + amountMinor > totalMinor)
        throw new ConflictException('PAYMENT_EXCEEDS_BALANCE');
      const intent = await tx.paymentIntentRecord.create({
        data: {
          tenantId: t,
          saleId: id,
          status: 'CAPTURED',
          amountMinor,
          currency: sale.currency,
          idempotencyKey: input.idempotencyKey,
          provider: input.method === 'CASH' ? 'NEXO_CASH' : 'EXTERNAL_RECORD',
          ...(input.providerReference ? { providerReference: input.providerReference } : {}),
        },
      });
      const attempt = await tx.paymentAttemptRecord.create({
        data: {
          tenantId: t,
          paymentIntentId: intent.id,
          sequence: 1,
          status: 'CAPTURED',
          method: input.method,
          ...(input.providerReference ? { providerReference: input.providerReference } : {}),
        },
      });
      const payment = await tx.salePaymentRecord.create({
        data: {
          tenantId: t,
          saleId: id,
          id: input.id,
          method: input.method,
          status: 'CAPTURED',
          amountMinor,
          ...(tenderedMinor !== null ? { tenderedMinor } : {}),
          ...(input.providerReference ? { providerReference: input.providerReference } : {}),
          idempotencyKey: input.idempotencyKey,
        },
      });
      const updated = await tx.saleRecord.updateMany({
        where: { tenantId: t, id, version: sale.version },
        data: { status: 'PAYMENT_PENDING', version: { increment: 1 } },
      });
      if (updated.count !== 1) throw new ConflictException('SALE_VERSION_CONFLICT');
      await this.event(tx, t, id, sale.version + 1, 'PaymentRecorded', sale.correlationId, a, {
        paymentId: payment.id,
        method: payment.method,
      });
      return {
        ...payment,
        paymentIntentId: intent.id,
        paymentAttemptId: attempt.id,
        saleVersion: sale.version + 1,
      };
    });
  }
  paymentOutcome(t: string, a: string, saleId: string, paymentAttemptId: string) {
    return withTenantTransaction(this.db, t, async (tx) => {
      const sale = await this.saleForUpdate(tx, t, saleId);
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'payments.record',
        resource: { type: 'payment', branchId: sale.branchId },
      });
      const attempt = await tx.paymentAttemptRecord.findFirst({
        where: { tenantId: t, id: paymentAttemptId, paymentIntent: { saleId } },
        include: { paymentIntent: true },
      });
      if (!attempt) throw new NotFoundException('PAYMENT_ATTEMPT_NOT_FOUND');
      const canonical = canonicalPaymentStatus(attempt.status);
      return {
        paymentAttemptId: attempt.id,
        paymentIntentId: attempt.paymentIntentId,
        saleId,
        amountMinor: String(attempt.paymentIntent.amountMinor),
        currency: attempt.paymentIntent.currency,
        status: canonical,
        lastCheckedAt: new Date().toISOString(),
        retryGuidance:
          canonical === 'unknown' || canonical === 'processing' || canonical === 'pending'
            ? 'QUERY_ONLY_DO_NOT_RECREATE'
            : 'TERMINAL',
        safeDisplayReference: attempt.providerReference ?? attempt.id,
      };
    });
  }
  paymentOutcomeByKey(t: string, a: string, saleId: string, idempotencyKey: string) {
    return withTenantTransaction(this.db, t, async (tx) => {
      const sale = await this.saleForUpdate(tx, t, saleId);
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'payments.record',
        resource: { type: 'payment', branchId: sale.branchId },
      });
      const intent = await tx.paymentIntentRecord.findFirst({
        where: { tenantId: t, saleId, idempotencyKey },
        include: { attempts: { orderBy: { sequence: 'desc' }, take: 1 } },
      });
      if (!intent || !intent.attempts[0]) throw new NotFoundException('PAYMENT_ATTEMPT_NOT_FOUND');
      const attempt = intent.attempts[0];
      const canonical = canonicalPaymentStatus(attempt.status);
      return {
        paymentAttemptId: attempt.id,
        paymentIntentId: intent.id,
        saleId,
        amountMinor: String(intent.amountMinor),
        currency: intent.currency,
        status: canonical,
        lastCheckedAt: new Date().toISOString(),
        retryGuidance:
          canonical === 'unknown' || canonical === 'processing' || canonical === 'pending'
            ? 'QUERY_ONLY_DO_NOT_RECREATE'
            : 'TERMINAL',
        safeDisplayReference: attempt.providerReference ?? attempt.id,
      };
    });
  }
  policy(t: string, branchId: string) {
    return withTenantTransaction(this.db, t, async (tx) => {
      const rows = await tx.salesPolicyRecord.findMany({
        where: { tenantId: t, OR: [{ branchId }, { branchId: null }] },
        orderBy: { branchId: 'asc' },
      });
      return rows.reduce<Record<string, unknown>>(
        (configuration, row) => ({
          ...configuration,
          ...(row.configuration as Record<string, unknown>),
        }),
        {},
      );
    });
  }
  updatePolicy(t: string, a: string, branchId: string, configuration: Record<string, unknown>) {
    return withTenantTransaction(this.db, t, async (tx) => {
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'organization.update',
        resource: { type: 'sales_policy', branchId },
      });
      const existing = await tx.salesPolicyRecord.findFirst({ where: { tenantId: t, branchId } });
      const merged = {
        ...((existing?.configuration ?? {}) as Record<string, unknown>),
        ...configuration,
      } as Prisma.InputJsonValue;
      const result = await (existing
        ? tx.salesPolicyRecord.update({
            where: { tenantId_id: { tenantId: t, id: existing.id } },
            data: { configuration: merged, version: { increment: 1 } },
          })
        : tx.salesPolicyRecord.create({
            data: { tenantId: t, branchId, configuration: merged },
          }));
      await this.event(tx, t, branchId, result.version, 'SalesPolicyUpdated', randomUUID(), a, {
        branchId,
        changedKeys: Object.keys(configuration).sort(),
      });
      return result;
    });
  }
  refund(
    t: string,
    a: string,
    id: string,
    key: string,
    input: Parameters<SalesRepository['refund']>[4],
  ) {
    return withTenantTransaction(this.db, t, async (tx) => {
      const sale = await this.saleForUpdate(tx, t, id);
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.refund',
        resource: { type: 'sale', id, branchId: sale.branchId },
      });
      if (!['COMPLETED', 'PARTIALLY_REFUNDED'].includes(sale.status))
        throw new ConflictException('REFUND_NOT_ALLOWED');
      const replay = await tx.refundIntentRecord.findUnique({
        where: { tenantId_idempotencyKey: { tenantId: t, idempotencyKey: key } },
      });
      if (replay) {
        if (replay.saleId !== id) throw new ConflictException('IDEMPOTENCY_CONFLICT');
        const replayLines = await tx.refundLineRecord.findMany({
          where: { tenantId: t, refundIntentId: replay.id },
          orderBy: { id: 'asc' },
        });
        const existing = replayLines
          .map((line) => ({
            saleItemId: line.saleItemId,
            quantity: line.quantity.toFixed(6).replace(/\.?0+$/, ''),
            amountMinor: String(line.amountMinor),
            destination: line.destination,
            reason: line.reason,
          }))
          .sort((left, right) => left.saleItemId.localeCompare(right.saleItemId));
        const requested = [...input.lines].sort((left, right) =>
          left.saleItemId.localeCompare(right.saleItemId),
        );
        if (requestFingerprint(existing) !== requestFingerprint(requested))
          throw new ConflictException('IDEMPOTENCY_CONFLICT');
        return replay;
      }
      if (input.lines.length === 0) throw new ConflictException('REFUND_NOT_ALLOWED');
      const itemIds = input.lines.map((line) => line.saleItemId);
      if (new Set(itemIds).size !== itemIds.length)
        throw new ConflictException('REFUND_NOT_ALLOWED');
      const items = await tx.saleItemRecord.findMany({
        where: { tenantId: t, saleId: id, id: { in: itemIds } },
      });
      if (items.length !== new Set(itemIds).size) throw new ConflictException('REFUND_NOT_ALLOWED');
      let amount = 0n;
      for (const line of input.lines) {
        const item = items.find((value) => value.id === line.saleItemId);
        const requested = parseDecimal(line.quantity, 6);
        if (!item || requested <= 0n || requested > parseDecimal(item.quantity.toFixed(6), 6))
          throw new ConflictException('REFUND_NOT_ALLOWED');
        const returned = await tx.$queryRaw<{ quantity: string }[]>`
          SELECT COALESCE(SUM(rl.quantity),0)::text AS quantity
          FROM refund_lines rl
          JOIN refund_intents ri
            ON ri.tenant_id=rl.tenant_id AND ri.id=rl.refund_intent_id
          WHERE rl.tenant_id=${t}::uuid
            AND rl.sale_item_id=${line.saleItemId}::uuid
            AND ri.status<>'REJECTED'
        `;
        if (
          requested + parseDecimal(returned[0]?.quantity ?? '0', 6) >
          parseDecimal(item.quantity.toFixed(6), 6)
        )
          throw new ConflictException('REFUND_NOT_ALLOWED');
        const authoritative = calculateRefundAmountMinor({
          soldQuantity: item.quantity.toFixed(6),
          soldTotalMinor: String(item.totalMinor),
          refundQuantity: line.quantity,
        });
        if (authoritative !== line.amountMinor)
          throw new ConflictException('REFUND_AMOUNT_MISMATCH');
        amount += BigInt(authoritative);
      }
      const already = await tx.refundIntentRecord.aggregate({
        where: { tenantId: t, saleId: id, status: { not: 'REJECTED' } },
        _sum: { amountMinor: true },
      });
      const paid = await tx.salePaymentRecord.aggregate({
        where: { tenantId: t, saleId: id, status: 'CAPTURED' },
        _sum: { amountMinor: true },
      });
      if (amount + (already._sum.amountMinor ?? 0n) > (paid._sum.amountMinor ?? 0n))
        throw new ConflictException('REFUND_NOT_ALLOWED');
      const reason = [...new Set(input.lines.map((line) => line.reason))].join('; ').slice(0, 500);
      const intent = await tx.refundIntentRecord.create({
        data: {
          tenantId: t,
          saleId: id,
          actorUserId: a,
          status: 'REQUESTED',
          amountMinor: amount,
          idempotencyKey: key,
          reason,
        },
      });
      await tx.refundLineRecord.createMany({
        data: input.lines.map((line) => ({
          tenantId: t,
          refundIntentId: intent.id,
          saleItemId: line.saleItemId,
          quantity: line.quantity,
          amountMinor: BigInt(line.amountMinor),
          destination: line.destination,
          reason: line.reason,
        })),
      });
      const updated = await tx.saleRecord.updateMany({
        where: { tenantId: t, id, version: sale.version },
        data: { version: { increment: 1 } },
      });
      if (updated.count !== 1) throw new ConflictException('SALE_VERSION_CONFLICT');
      await this.event(tx, t, id, sale.version + 1, 'RefundRequested', sale.correlationId, a, {
        refundIntentId: intent.id,
        amountMinor: String(amount),
      });
      return { ...intent, saleVersion: sale.version + 1 };
    });
  }
  receipt(t: string, a: string, id: string, key: string) {
    return withTenantTransaction(this.db, t, async (tx) => {
      const sale = await this.saleForUpdate(tx, t, id);
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'receipts.generate',
        resource: { type: 'receipt', branchId: sale.branchId },
      });
      if (
        sale.status !== 'COMPLETED' &&
        sale.status !== 'PARTIALLY_REFUNDED' &&
        sale.status !== 'REFUNDED'
      )
        throw new ConflictException('SALE_INVALID_STATE');
      const existing = await tx.saleReceiptRecord.findFirst({ where: { tenantId: t, saleId: id } });
      if (existing) return existing;
      const [record, items, payments, organization, branch, user] = await Promise.all([
        tx.saleRecord.findUniqueOrThrow({ where: { tenantId_id: { tenantId: t, id } } }),
        tx.saleItemRecord.findMany({ where: { tenantId: t, saleId: id } }),
        tx.salePaymentRecord.findMany({ where: { tenantId: t, saleId: id } }),
        tx.organization.findUniqueOrThrow({ where: { id: t } }),
        tx.branch.findUniqueOrThrow({ where: { tenantId_id: { tenantId: t, id: sale.branchId } } }),
        tx.user.findUniqueOrThrow({ where: { id: a } }),
      ]);
      const model = {
        version: 1,
        saleId: id,
        saleFolio: record.folio,
        businessDate: record.businessDate.toISOString().slice(0, 10),
        completedAt: record.completedAt?.toISOString(),
        currency: record.currency,
        organization: {
          name: organization.name,
          legalTaxId: organization.legalTaxId,
          address: organization.address,
        },
        branch: { name: branch.name, timeZone: branch.timeZone ?? organization.timeZone },
        sellerDisplay: user.displayName,
        lines: items.map((item) => ({
          ...(item.snapshot as object),
          quantity: item.quantity.toString(),
          unitAmountMinor: String(item.unitAmountMinor),
          discountMinor: String(item.discountMinor),
          taxMinor: String(item.taxMinor),
          totalMinor: String(item.totalMinor),
        })),
        payments: payments.map((payment) => ({
          method: payment.method,
          status: payment.status,
          amountMinor: String(payment.amountMinor),
          ...(payment.tenderedMinor ? { tenderedMinor: String(payment.tenderedMinor) } : {}),
        })),
        locale: organization.defaultLocale,
      };
      const serialized = JSON.stringify(model);
      const receipt = await tx.saleReceiptRecord.create({
        data: {
          tenantId: t,
          saleId: id,
          version: 1,
          model: model as Prisma.InputJsonValue,
          contentHash: createHash('sha256').update(serialized).digest('hex'),
        },
      });
      await this.event(tx, t, id, sale.version, 'ReceiptGenerated', record.correlationId, a, {
        receiptId: receipt.id,
        idempotencyKey: key,
      });
      return receipt;
    });
  }
  approveRefund(
    t: string,
    a: string,
    saleId: string,
    refundId: string,
    key: string,
    reason: string,
  ) {
    return withTenantTransaction(this.db, t, async (tx) => {
      const sale = await this.saleForUpdate(tx, t, saleId);
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.refund',
        resource: { type: 'sale', branchId: sale.branchId },
      });
      const intent = await tx.refundIntentRecord.findUnique({
        where: { tenantId_id: { tenantId: t, id: refundId } },
      });
      if (!intent || intent.saleId !== saleId) throw new NotFoundException('REFUND_NOT_ALLOWED');
      if (['APPROVED', 'COMPLETED'].includes(intent.status)) return intent;
      if (intent.status !== 'REQUESTED') throw new ConflictException('REFUND_NOT_ALLOWED');
      const approved = await tx.refundIntentRecord.update({
        where: { tenantId_id: { tenantId: t, id: refundId } },
        data: { status: 'APPROVED' },
      });
      await this.event(tx, t, saleId, sale.version, 'RefundApproved', sale.correlationId, a, {
        refundIntentId: refundId,
        amountMinor: String(approved.amountMinor),
        reason,
        idempotencyKey: key,
      });
      return approved;
    });
  }
  mappings(t: string, a: string) {
    return withTenantTransaction(this.db, t, async (tx) => {
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.view_all_branches',
        resource: { type: 'external_mapping' },
      });
      return tx.externalMappingRecord.findMany({
        where: { tenantId: t },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });
  }
  overview(t: string, a: string, q: Parameters<SalesRepository['overview']>[2]) {
    return withTenantTransaction(this.db, t, async (tx) => {
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.dashboard.read',
        resource: { type: 'sales_administration', ...(q.branchId ? { branchId: q.branchId } : {}) },
      });
      const where = {
        tenantId: t,
        ...(q.branchId ? { branchId: q.branchId } : {}),
        ...(q.businessDate ? { businessDate: new Date(`${q.businessDate}T00:00:00.000Z`) } : {}),
      };
      const scopedSales = await tx.saleRecord.findMany({ where, select: { id: true }, take: 5000 });
      const scopedSaleIds = scopedSales.map((row) => row.id);
      const [statuses, payments, refunds, pendingOutbox] = await Promise.all([
        tx.saleRecord.groupBy({ by: ['status'], where, _count: { _all: true } }),
        tx.salePaymentRecord.groupBy({
          by: ['method'],
          where: { tenantId: t, saleId: { in: scopedSaleIds } },
          _sum: { amountMinor: true },
          _count: { _all: true },
        }),
        tx.refundIntentRecord.groupBy({
          by: ['status'],
          where: { tenantId: t, saleId: { in: scopedSaleIds } },
          _count: { _all: true },
          _sum: { amountMinor: true },
        }),
        tx.salesOutboxRecord.count({ where: { tenantId: t, publishedAt: null } }),
      ]);
      const totals = await tx.saleItemRecord.aggregate({
        where: {
          tenantId: t,
          saleId: { in: scopedSaleIds },
        },
        _sum: { totalMinor: true },
        _count: { _all: true },
      });
      return {
        statuses,
        payments,
        refunds,
        soldAmountMinor: String(totals._sum.totalMinor ?? 0n),
        soldLines: totals._count._all,
        pendingOutbox,
      };
    });
  }
  search(t: string, a: string, q: Parameters<SalesRepository['search']>[2]) {
    return withTenantTransaction(this.db, t, async (tx) => {
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.history.read',
        resource: { type: 'sales_administration', ...(q.branchId ? { branchId: q.branchId } : {}) },
      });
      const page = q.page ?? 1,
        pageSize = q.pageSize ?? 25;
      const term = q.search?.trim();
      const termIsUuid = term
        ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(term)
        : false;
      const itemMatches = term
        ? await tx.saleItemRecord.findMany({
            where: {
              tenantId: t,
              OR: [
                { snapshot: { path: ['sku'], string_contains: term } },
                { snapshot: { path: ['barcode'], string_contains: term } },
                { snapshot: { path: ['productName'], string_contains: term } },
              ],
            },
            select: { saleId: true },
            take: 500,
          })
        : [];
      const where = {
        tenantId: t,
        ...(q.branchId ? { branchId: q.branchId } : {}),
        ...(q.status ? { status: q.status } : {}),
        ...(q.businessDate ? { businessDate: new Date(`${q.businessDate}T00:00:00.000Z`) } : {}),
        ...(term
          ? {
              OR: [
                ...(termIsUuid ? [{ id: { equals: term } }] : []),
                { folio: { contains: term, mode: 'insensitive' as const } },
                { externalReference: { contains: term, mode: 'insensitive' as const } },
                { id: { in: itemMatches.map((row) => row.saleId) } },
              ],
            }
          : {}),
      };
      const [items, total] = await Promise.all([
        tx.saleRecord.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        tx.saleRecord.count({ where }),
      ]);
      return { items, page, pageSize, total };
    });
  }
  detail(t: string, a: string, id: string) {
    return withTenantTransaction(this.db, t, async (tx) => {
      const sale = await tx.saleRecord.findFirst({ where: { tenantId: t, id } });
      if (!sale) throw new NotFoundException('SALE_NOT_FOUND');
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.detail.read',
        resource: { type: 'sale', id, branchId: sale.branchId },
      });
      const [items, payments, refunds, receipts, events, inventoryEvents, cashEntries] =
        await Promise.all([
          tx.saleItemRecord.findMany({
            where: { tenantId: t, saleId: id },
            orderBy: { createdAt: 'asc' },
          }),
          tx.salePaymentRecord.findMany({ where: { tenantId: t, saleId: id } }),
          tx.refundIntentRecord.findMany({ where: { tenantId: t, saleId: id } }),
          tx.saleReceiptRecord.findMany({
            where: { tenantId: t, saleId: id },
            orderBy: { version: 'desc' },
          }),
          tx.salesEventRecord.findMany({
            where: { tenantId: t, aggregateId: id },
            orderBy: { occurredAt: 'asc' },
          }),
          tx.inventoryEvent.findMany({
            where: { tenantId: t, payload: { path: ['saleId'], equals: id } },
            orderBy: { createdAt: 'asc' },
            take: 100,
          }),
          tx.$queryRaw<
            {
              id: string;
              sessionId: string;
              movementType: string;
              amountMinor: bigint;
              currency: string;
              occurredAt: Date;
              correlationId: string;
            }[]
          >`SELECT id,session_id AS "sessionId",movement_type AS "movementType",amount_minor AS "amountMinor",currency,occurred_at AS "occurredAt",correlation_id AS "correlationId" FROM cash_ledger_entries WHERE tenant_id=${t}::uuid AND sale_id=${id}::uuid ORDER BY occurred_at LIMIT 100`,
        ]);
      return {
        sale,
        items,
        payments,
        refunds,
        receipts,
        relationships: { inventory: inventoryEvents, cash: cashEntries },
        events,
      };
    });
  }
  timeline(t: string, a: string, id: string) {
    return this.detail(t, a, id).then((value) => {
      const row = value as {
        events: unknown[];
        relationships: { inventory: unknown[]; cash: unknown[] };
      };
      return { items: [...row.events, ...row.relationships.inventory, ...row.relationships.cash] };
    });
  }
  refunds(t: string, a: string, q: Parameters<SalesRepository['refunds']>[2]) {
    return withTenantTransaction(this.db, t, async (tx) => {
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.history.read',
        resource: { type: 'refund', ...(q.branchId ? { branchId: q.branchId } : {}) },
      });
      const page = q.page ?? 1,
        pageSize = q.pageSize ?? 25;
      const sales = q.branchId
        ? await tx.saleRecord.findMany({
            where: { tenantId: t, branchId: q.branchId },
            select: { id: true },
          })
        : [];
      const where = {
        tenantId: t,
        ...(q.status ? { status: q.status } : {}),
        ...(q.branchId ? { saleId: { in: sales.map((row) => row.id) } } : {}),
      };
      const [items, total] = await Promise.all([
        tx.refundIntentRecord.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        tx.refundIntentRecord.count({ where }),
      ]);
      return { items, page, pageSize, total };
    });
  }
  receipts(t: string, a: string, q: Parameters<SalesRepository['receipts']>[2]) {
    return withTenantTransaction(this.db, t, async (tx) => {
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.receipt.read',
        resource: { type: 'receipt', ...(q.branchId ? { branchId: q.branchId } : {}) },
      });
      return {
        items: await tx.saleReceiptRecord.findMany({
          where: { tenantId: t },
          orderBy: { createdAt: 'desc' },
          take: q.pageSize ?? 25,
        }),
      };
    });
  }
  exceptions(t: string, a: string, q: Parameters<SalesRepository['exceptions']>[2]) {
    return withTenantTransaction(this.db, t, async (tx) => {
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.exceptions.read',
        resource: { type: 'sales_exception', ...(q.branchId ? { branchId: q.branchId } : {}) },
      });
      const [failed, pending] = await Promise.all([
        tx.saleRecord.findMany({
          where: {
            tenantId: t,
            status: { in: ['FAILED', 'EXPIRED', 'CHECKOUT_PENDING', 'PAYMENT_PENDING'] },
          },
          orderBy: { updatedAt: 'desc' },
          take: q.pageSize ?? 25,
        }),
        tx.salesOutboxRecord.findMany({
          where: { tenantId: t, OR: [{ publishedAt: null }, { lastError: { not: null } }] },
          orderBy: { occurredAt: 'desc' },
          take: q.pageSize ?? 25,
          select: {
            id: true,
            aggregateId: true,
            eventType: true,
            eventVersion: true,
            correlationId: true,
            attempts: true,
            lastError: true,
            occurredAt: true,
            publishedAt: true,
          },
        }),
      ]);
      return {
        items: [
          ...failed.map((row) => ({
            module: 'SALES',
            code: `SALE_${row.status}`,
            resourceId: row.id,
            correlationId: row.correlationId,
            occurredAt: row.updatedAt,
          })),
          ...pending.map((row) => ({
            ...row,
            module: 'OUTBOX',
            lastError: row.lastError ? 'Error de publicación sanitizado' : null,
          })),
        ],
      };
    });
  }
  diagnostic(t: string, a: string, id: string) {
    return withTenantTransaction(this.db, t, async (tx) => {
      const sale = await tx.saleRecord.findFirst({ where: { tenantId: t, id } });
      if (!sale) throw new NotFoundException('SALE_NOT_FOUND');
      await assertTransactionalAuthorization(tx, {
        userId: a,
        tenantId: t,
        permission: 'sales.diagnostics.read',
        resource: { type: 'sale', id, branchId: sale.branchId },
      });
      const [events, pending] = await Promise.all([
        tx.salesEventRecord.findMany({
          where: { tenantId: t, aggregateId: id },
          select: { eventType: true, correlationId: true, occurredAt: true },
          orderBy: { occurredAt: 'desc' },
          take: 20,
        }),
        tx.salesOutboxRecord.count({ where: { tenantId: t, aggregateId: id, publishedAt: null } }),
      ]);
      return {
        saleId: id,
        branchId: sale.branchId,
        timestamp: new Date().toISOString(),
        correlationId: sale.correlationId,
        appVersion: process.env.npm_package_version ?? 'local',
        apiVersion: '8.5.0',
        workerStatus: pending ? 'PENDING' : 'SYNCHRONIZED',
        outboxPending: pending,
        events,
      };
    });
  }
  private async saleForUpdate(tx: DatabaseTransaction, t: string, id: string) {
    const rows = await tx.$queryRaw<
      {
        id: string;
        branch_id: string;
        currency: string;
        status: string;
        version: number;
        correlation_id: string;
        metadata: unknown;
      }[]
    >`SELECT id,branch_id,currency,status,version,correlation_id,metadata FROM sales WHERE tenant_id=${t}::uuid AND id=${id}::uuid FOR UPDATE`;
    const row = rows[0];
    if (!row) throw new NotFoundException('SALE_NOT_FOUND');
    return {
      id: row.id,
      branchId: row.branch_id,
      currency: row.currency,
      status: row.status,
      version: row.version,
      correlationId: row.correlation_id,
      metadata: row.metadata,
    };
  }
  private event(
    tx: DatabaseTransaction,
    t: string,
    id: string,
    version: number,
    type: string,
    correlationId: string,
    actorUserId: string,
    payload: Record<string, unknown>,
  ) {
    return Promise.all([
      tx.salesEventRecord.create({
        data: {
          tenantId: t,
          aggregateId: id,
          aggregateVersion: version,
          eventType: type,
          actorUserId,
          correlationId,
          payload: payload as Prisma.InputJsonValue,
        },
      }),
      tx.salesOutboxRecord.create({
        data: {
          tenantId: t,
          aggregateId: id,
          aggregateVersion: version,
          eventType: type,
          eventVersion: 1,
          correlationId,
          payload: payload as Prisma.InputJsonValue,
        },
      }),
    ]);
  }
}
