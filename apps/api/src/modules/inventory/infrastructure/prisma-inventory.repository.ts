import { randomUUID } from 'node:crypto';
import {
  addQuantity,
  availability as calculateAvailability,
  compareQuantity,
  consumeFifo,
  subtractQuantity,
} from '@nexo/inventory';
import type { DatabaseClient, DatabaseTransaction, Prisma } from '@nexo/database';
import { withTenantTransaction } from '@nexo/database';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE } from '../../../infrastructure/infrastructure.module.js';
import { assertTransactionalAuthorization } from '../../authorization/infrastructure/transactional-authorization.js';
import type { InventoryRepository, MovementInput } from '../application/inventory.ports.js';
@Injectable()
export class PrismaInventoryRepository implements InventoryRepository {
  constructor(@Inject(DATABASE) private readonly db: DatabaseClient) {}
  locations(t: string, branchId?: string, includeArchived = false) {
    return withTenantTransaction(this.db, t, (tx) =>
      tx.inventoryLocation.findMany({
        where: {
          tenantId: t,
          ...(!includeArchived ? { active: true } : {}),
          ...(branchId ? { branchId } : {}),
        },
        orderBy: [{ branchId: 'asc' }, { name: 'asc' }],
        select: { id: true, branchId: true, name: true, code: true, type: true, active: true },
      }),
    );
  }
  async createLocation(
    t: string,
    a: string,
    input: Parameters<InventoryRepository['createLocation']>[2],
  ) {
    try {
      return await this.write(t, a, 'inventory.write', async (tx) => {
        await this.assertActiveBranch(tx, t, input.branchId);
        if (input.parentId) await this.assertLocation(tx, t, input.parentId, input.branchId);
        return tx.inventoryLocation.create({ data: { tenantId: t, ...input } });
      });
    } catch (error) {
      if (isUniqueConflict(error)) throw new ConflictException('Inventory location already exists');
      throw error;
    }
  }
  async updateLocation(
    t: string,
    a: string,
    id: string,
    input: Parameters<InventoryRepository['updateLocation']>[3],
  ) {
    try {
      return await this.write(t, a, 'inventory.write', async (tx) => {
        const found = await tx.inventoryLocation.findUnique({
          where: { tenantId_id: { tenantId: t, id } },
        });
        if (!found) throw new NotFoundException('Inventory location not found');
        if (input.branchId) await this.assertActiveBranch(tx, t, input.branchId);
        return tx.inventoryLocation.update({
          where: { tenantId_id: { tenantId: t, id } },
          data: input,
        });
      });
    } catch (error) {
      if (isUniqueConflict(error)) throw new ConflictException('Inventory location already exists');
      throw error;
    }
  }
  record(t: string, a: string, input: MovementInput) {
    return this.write(
      t,
      a,
      ['ADJUSTMENT', 'CORRECTION'].includes(input.type) ? 'inventory.adjust' : 'inventory.write',
      async (tx) => this.recordTx(tx, t, a, input),
    );
  }
  availability(t: string, v: string, l: string) {
    return withTenantTransaction(this.db, t, (tx) => this.balance(tx, t, v, l));
  }
  timeline(t: string, v: string, l: string) {
    return withTenantTransaction(this.db, t, async (tx) => {
      await this.assertInventoryVariant(tx, t, v);
      await this.assertLocation(tx, t, l);
      return tx.inventoryMovement.findMany({
        where: { tenantId: t, variantId: v, locationId: l },
        orderBy: [{ occurredAt: 'asc' }, { recordedAt: 'asc' }],
        take: 500,
      });
    });
  }
  reserve(t: string, a: string, input: Parameters<InventoryRepository['reserve']>[2]) {
    return this.write(t, a, 'inventory.write', async (tx) => {
      await this.lockBalance(tx, t, input.variantId, input.locationId);
      const balance = await this.balance(tx, t, input.variantId, input.locationId);
      if (compareQuantity(balance.available, input.quantity) < 0)
        throw new ConflictException('Insufficient availability');
      const { idempotencyKey, ...reservationInput } = input;
      const reservation = await tx.inventoryReservation.create({
        data: { tenantId: t, createdBy: a, ...reservationInput },
      });
      await this.recordTx(tx, t, a, {
        variantId: input.variantId,
        locationId: input.locationId,
        type: 'RESERVATION',
        state: 'RESERVED',
        quantity: input.quantity,
        reason: 'Reservation created',
        occurredAt: new Date(),
        idempotencyKey,
        referenceType: 'RESERVATION',
        referenceId: reservation.id,
      });
      await this.event(tx, t, a, reservation.id, 'ReservationCreated', {
        variantId: input.variantId,
      });
      return reservation;
    });
  }
  release(t: string, a: string, id: string, reason: string, key: string) {
    return this.write(t, a, 'inventory.write', async (tx) => {
      const r = await tx.inventoryReservation.findFirst({
        where: { tenantId: t, id, status: 'ACTIVE' },
      });
      if (!r) throw new NotFoundException('Active reservation not found');
      const claimed = await tx.inventoryReservation.updateMany({
        where: { tenantId: t, id, status: 'ACTIVE' },
        data: { status: 'RELEASED', releasedAt: new Date(), releaseReason: reason },
      });
      if (claimed.count !== 1) throw new ConflictException('Reservation already finalized');
      await this.recordTx(tx, t, a, {
        variantId: r.variantId,
        locationId: r.locationId,
        type: 'RESERVATION_RELEASE',
        state: 'RESERVED',
        quantity: `-${r.quantity.toString()}`,
        reason,
        occurredAt: new Date(),
        idempotencyKey: key,
        referenceType: 'RESERVATION',
        referenceId: id,
      });
      await this.event(tx, t, a, id, 'ReservationReleased', {});
      return { id, status: 'RELEASED' };
    });
  }
  consume(t: string, a: string, id: string, key: string) {
    return this.write(t, a, 'inventory.write', async (tx) => {
      const reservation = await tx.inventoryReservation.findFirst({
        where: { tenantId: t, id },
      });
      if (!reservation) throw new NotFoundException('Reservation not found');
      if (reservation.status === 'CONSUMED') return reservation;
      if (reservation.status !== 'ACTIVE')
        throw new NotFoundException('Active reservation not found');
      const claimed = await tx.inventoryReservation.updateMany({
        where: { tenantId: t, id, status: 'ACTIVE' },
        data: { status: 'CONSUMED', releasedAt: new Date(), releaseReason: 'Sale completed' },
      });
      if (claimed.count !== 1) {
        const current = await tx.inventoryReservation.findUnique({
          where: { tenantId_id: { tenantId: t, id } },
        });
        if (current?.status === 'CONSUMED') return current;
        throw new ConflictException('Reservation already finalized');
      }
      await this.recordTx(tx, t, a, {
        variantId: reservation.variantId,
        locationId: reservation.locationId,
        type: 'RESERVATION_RELEASE',
        state: 'RESERVED',
        quantity: `-${reservation.quantity.toString()}`,
        reason: 'Reservation committed to sale',
        occurredAt: new Date(),
        idempotencyKey: `${key}:release`,
        referenceType: 'SALE',
        referenceId: reservation.sourceId,
      });
      await this.recordTx(tx, t, a, {
        variantId: reservation.variantId,
        locationId: reservation.locationId,
        type: 'SALE',
        state: 'ON_HAND',
        quantity: `-${reservation.quantity.toString()}`,
        reason: 'Sale completed',
        occurredAt: new Date(),
        idempotencyKey: `${key}:issue`,
        referenceType: 'SALE',
        referenceId: reservation.sourceId,
      });
      await this.event(tx, t, a, id, 'ReservationConsumed', { saleId: reservation.sourceId });
      return reservation;
    });
  }
  transfer(t: string, a: string, input: Parameters<InventoryRepository['transfer']>[2]) {
    return this.write(t, a, 'inventory.write', async (tx) => {
      await this.lockBalance(tx, t, input.variantId, input.fromLocationId);
      const balance = await this.balance(tx, t, input.variantId, input.fromLocationId);
      if (compareQuantity(balance.available, input.quantity) < 0)
        throw new ConflictException('Insufficient availability');
      const transfer = await tx.inventoryTransfer.create({
        data: { tenantId: t, createdBy: a, status: 'IN_TRANSIT', ...input },
      });
      const correlationId = transfer.id;
      await this.recordTx(
        tx,
        t,
        a,
        {
          variantId: input.variantId,
          locationId: input.fromLocationId,
          type: 'TRANSFER',
          state: 'ON_HAND',
          quantity: `-${input.quantity}`,
          reason: 'Transfer dispatched',
          occurredAt: new Date(),
          idempotencyKey: `${input.idempotencyKey}:dispatch`,
          referenceType: 'TRANSFER',
          referenceId: transfer.id,
        },
        correlationId,
      );
      await this.recordTx(
        tx,
        t,
        a,
        {
          variantId: input.variantId,
          locationId: input.toLocationId,
          type: 'TRANSFER',
          state: 'IN_TRANSIT',
          quantity: input.quantity,
          reason: 'Transfer in transit',
          occurredAt: new Date(),
          idempotencyKey: `${input.idempotencyKey}:transit`,
          referenceType: 'TRANSFER',
          referenceId: transfer.id,
        },
        correlationId,
      );
      await this.event(tx, t, a, transfer.id, 'TransferCreated', {
        variantId: input.variantId,
      });
      return transfer;
    });
  }
  completeTransfer(t: string, a: string, id: string, key: string) {
    return this.write(t, a, 'inventory.write', async (tx) => {
      const tr = await tx.inventoryTransfer.findFirst({
        where: { tenantId: t, id, status: 'IN_TRANSIT' },
      });
      if (!tr) throw new NotFoundException('Transfer not in transit');
      const claimed = await tx.inventoryTransfer.updateMany({
        where: { tenantId: t, id, status: 'IN_TRANSIT' },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
      if (claimed.count !== 1) throw new ConflictException('Transfer already finalized');
      await this.recordTx(
        tx,
        t,
        a,
        {
          variantId: tr.variantId,
          locationId: tr.toLocationId,
          type: 'TRANSFER',
          state: 'IN_TRANSIT',
          quantity: `-${tr.quantity.toString()}`,
          reason: 'Transfer received',
          occurredAt: new Date(),
          idempotencyKey: `${key}:clear`,
          referenceType: 'TRANSFER',
          referenceId: id,
        },
        id,
      );
      await this.recordTx(
        tx,
        t,
        a,
        {
          variantId: tr.variantId,
          locationId: tr.toLocationId,
          type: 'TRANSFER',
          state: 'ON_HAND',
          quantity: tr.quantity.toString(),
          reason: 'Transfer received',
          occurredAt: new Date(),
          idempotencyKey: `${key}:receive`,
          referenceType: 'TRANSFER',
          referenceId: id,
        },
        id,
      );
      const result = await tx.inventoryTransfer.findUniqueOrThrow({
        where: { tenantId_id: { tenantId: t, id } },
      });
      await this.event(tx, t, a, id, 'TransferCompleted', {});
      return result;
    });
  }
  count(t: string, a: string, input: Parameters<InventoryRepository['count']>[2]) {
    return this.write(t, a, 'inventory.adjust', async (tx) => {
      const idempotencyLock = `inventory-count:${t}:${input.idempotencyKey}`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${idempotencyLock}, 0))`;
      const existing = await tx.inventoryCount.findUnique({
        where: {
          tenantId_idempotencyKey: { tenantId: t, idempotencyKey: input.idempotencyKey },
        },
      });
      if (existing) {
        if (
          existing.variantId !== input.variantId ||
          existing.locationId !== input.locationId ||
          existing.countedQuantity.toString() !== input.countedQuantity ||
          existing.reason !== input.reason
        )
          throw new ConflictException('Inventory count replay payload differs');
        return {
          ...(existing.logicalBalances as Record<string, string>),
          counted: existing.countedQuantity.toString(),
          difference: existing.difference.toString(),
        };
      }
      await this.lockBalance(tx, t, input.variantId, input.locationId);
      const b = await this.balance(tx, t, input.variantId, input.locationId);
      const difference = subtractQuantity(input.countedQuantity, b.onHand);
      let movementId: string | undefined;
      if (compareQuantity(difference, '0') !== 0)
        movementId = (
          await this.recordTx(tx, t, a, {
            variantId: input.variantId,
            locationId: input.locationId,
            type: 'COUNT',
            state: 'ON_HAND',
            quantity: difference,
            reason: input.reason,
            occurredAt: new Date(),
            idempotencyKey: input.idempotencyKey,
          })
        ).id;
      const count = await tx.inventoryCount.create({
        data: {
          tenantId: t,
          variantId: input.variantId,
          locationId: input.locationId,
          logicalBalances: b as Prisma.InputJsonValue,
          countedQuantity: input.countedQuantity,
          difference,
          reason: input.reason,
          idempotencyKey: input.idempotencyKey,
          ...(movementId ? { movementId } : {}),
          actorUserId: a,
        },
      });
      await this.event(tx, t, a, count.id, 'InventoryCounted', {
        variantId: input.variantId,
        locationId: input.locationId,
        logicalQuantity: b.onHand,
        countedQuantity: input.countedQuantity,
        difference,
        ...(movementId ? { movementId } : {}),
      });
      return { ...b, counted: input.countedQuantity, difference };
    });
  }
  policy(t: string, a: string, input: Parameters<InventoryRepository['policy']>[2]) {
    return this.write(t, a, 'inventory.adjust', async (tx) => {
      await this.assertInventoryVariant(tx, t, input.variantId);
      return tx.inventoryPolicy.upsert({
        where: { tenantId_variantId: { tenantId: t, variantId: input.variantId } },
        create: { tenantId: t, ...input },
        update: { ...input, version: { increment: 1 } },
      });
    });
  }
  private async recordTx(
    tx: DatabaseTransaction,
    t: string,
    a: string,
    input: MovementInput,
    correlationId: string = randomUUID(),
  ) {
    try {
      await this.assertInventoryVariant(tx, t, input.variantId);
      await this.assertLocation(tx, t, input.locationId);
      await this.lockBalance(tx, t, input.variantId, input.locationId);
      const policy = await tx.inventoryPolicy.findUnique({
        where: { tenantId_variantId: { tenantId: t, variantId: input.variantId } },
      });
      if (
        compareQuantity(input.quantity, '0') < 0 &&
        !policy?.allowNegative &&
        input.state === 'ON_HAND'
      ) {
        const b = await this.balance(tx, t, input.variantId, input.locationId);
        if (compareQuantity(addQuantity(b.onHand, input.quantity), '0') < 0)
          throw new ConflictException('Negative stock prohibited');
      }
      const { currency, ...movementInput } = input;
      let fifo: ReturnType<typeof consumeFifo> | undefined;
      if (
        compareQuantity(input.quantity, '0') < 0 &&
        input.state === 'ON_HAND' &&
        policy?.costMethod === 'FIFO' &&
        !['COUNT', 'CORRECTION', 'TRANSFER'].includes(input.type)
      ) {
        const layers = await tx.inventoryCostLayer.findMany({
          where: {
            tenantId: t,
            variantId: input.variantId,
            locationId: input.locationId,
            remainingQuantity: { gt: 0 },
          },
          orderBy: [{ receivedAt: 'asc' }, { id: 'asc' }],
        });
        fifo = consumeFifo(
          layers.map((x) => ({
            id: x.id,
            remainingQuantity: x.remainingQuantity.toString(),
            unitCost: x.unitCost.toString(),
          })),
          input.quantity.slice(1),
        );
      }
      const movement = await tx.inventoryMovement.create({
        data: {
          tenantId: t,
          actorUserId: a,
          correlationId,
          ...movementInput,
          ...(fifo ? { totalCost: fifo.totalCost } : {}),
        },
      });
      if (compareQuantity(input.quantity, '0') > 0 && input.state === 'ON_HAND' && input.unitCost) {
        const organization = await tx.organization.findUniqueOrThrow({
          where: { id: t },
          select: { defaultCurrency: true },
        });
        const layerCurrency = currency ?? organization.defaultCurrency;
        if (layerCurrency !== organization.defaultCurrency)
          throw new BadRequestException('Inventory cost currency is invalid');
        await tx.inventoryCostLayer.create({
          data: {
            tenantId: t,
            variantId: input.variantId,
            locationId: input.locationId,
            receiptMovementId: movement.id,
            originalQuantity: input.quantity,
            remainingQuantity: input.quantity,
            unitCost: input.unitCost,
            currency: layerCurrency,
            receivedAt: input.occurredAt,
          },
        });
      }
      if (fifo) {
        for (const allocation of fifo.allocations)
          await tx.inventoryCostLayer.update({
            where: { tenantId_id: { tenantId: t, id: allocation.layerId } },
            data: {
              remainingQuantity: { decrement: allocation.quantity },
              ...(compareQuantity(
                (
                  await tx.inventoryCostLayer.findUniqueOrThrow({
                    where: { tenantId_id: { tenantId: t, id: allocation.layerId } },
                    select: { remainingQuantity: true },
                  })
                ).remainingQuantity.toString(),
                allocation.quantity,
              ) === 0
                ? { closedAt: new Date() }
                : {}),
            },
          });
      }
      const eventType =
        input.type === 'PURCHASE'
          ? 'StockReceived'
          : input.type === 'ADJUSTMENT'
            ? 'StockAdjusted'
            : 'StockAdjusted';
      await this.event(tx, t, a, movement.id, eventType, { variantId: input.variantId });
      const snapshot = await this.balance(tx, t, input.variantId, input.locationId);
      await tx.inventorySnapshot.create({
        data: {
          tenantId: t,
          variantId: input.variantId,
          locationId: input.locationId,
          throughMovementId: movement.id,
          balances: snapshot as Prisma.InputJsonValue,
        },
      });
      return movement;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002')
        throw new ConflictException('Duplicate idempotency key');
      throw error;
    }
  }
  private async balance(tx: DatabaseTransaction, t: string, v: string, l: string) {
    await this.assertInventoryVariant(tx, t, v);
    await this.assertLocation(tx, t, l);
    const rows = await tx.inventoryMovement.groupBy({
      by: ['state'],
      where: { tenantId: t, variantId: v, locationId: l },
      _sum: { quantity: true },
    });
    const value = (state: string) =>
      rows.find((x) => x.state === state)?._sum.quantity?.toString() ?? '0';
    return calculateAvailability({
      onHand: value('ON_HAND'),
      reserved: value('RESERVED'),
      committed: value('COMMITTED'),
      inTransit: value('IN_TRANSIT'),
      damaged: value('DAMAGED'),
      quarantine: value('QUARANTINE'),
    });
  }
  private async lockBalance(tx: DatabaseTransaction, t: string, v: string, l: string) {
    const key = `inventory-balance:${t}:${v}:${l}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
  }
  private async assertInventoryVariant(tx: DatabaseTransaction, t: string, v: string) {
    const variant = await tx.productVariant.findFirst({
      where: {
        tenantId: t,
        id: v,
        deletedAt: null,
        product: { type: 'PHYSICAL', deletedAt: null },
      },
      select: { id: true },
    });
    if (!variant) throw new BadRequestException('Inventory variant reference is invalid');
  }
  private async assertLocation(tx: DatabaseTransaction, t: string, l: string, branchId?: string) {
    const location = await tx.inventoryLocation.findFirst({
      where: { tenantId: t, id: l, active: true, ...(branchId ? { branchId } : {}) },
      select: { id: true },
    });
    if (!location) throw new BadRequestException('Inventory location reference is invalid');
  }
  private async assertActiveBranch(tx: DatabaseTransaction, t: string, branchId: string) {
    const branch = await tx.branch.findFirst({
      where: { tenantId: t, id: branchId, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!branch) throw new BadRequestException('Inventory branch reference is invalid');
  }
  private async write<T>(
    t: string,
    a: string,
    p: string,
    fn: (tx: DatabaseTransaction) => Promise<T>,
  ) {
    try {
      return await withTenantTransaction(this.db, t, async (tx) => {
        await assertTransactionalAuthorization(tx, {
          userId: a,
          tenantId: t,
          permission: p,
          resource: { type: 'inventory' },
        });
        return fn(tx);
      });
    } catch (error) {
      if (isUniqueConflict(error)) throw new ConflictException('Inventory replay rejected');
      throw error;
    }
  }
  private async event(
    tx: DatabaseTransaction,
    t: string,
    a: string,
    id: string,
    type: string,
    payload: Record<string, string>,
  ) {
    const data = {
      tenantId: t,
      actorUserId: a,
      aggregateType: 'Inventory',
      aggregateId: id,
      eventType: type,
      payload: payload as Prisma.InputJsonValue,
    };
    await tx.inventoryEvent.create({ data });
    await tx.inventoryOutbox.create({
      data: {
        tenantId: t,
        aggregateType: 'Inventory',
        aggregateId: id,
        eventType: type,
        payload: payload as Prisma.InputJsonValue,
      },
    });
  }
}

function isUniqueConflict(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}
