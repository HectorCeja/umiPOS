import type { DatabaseClient } from '@nexo/database';
import { withTenantTransaction } from '@nexo/database';
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE } from '../../../infrastructure/infrastructure.module.js';
import { INVENTORY_REPOSITORY, type InventoryRepository } from '../application/inventory.ports.js';
import type { InventorySalesCoordinator } from '../application/inventory-sales.port.js';

@Injectable()
export class InventorySalesCoordinatorAdapter implements InventorySalesCoordinator {
  constructor(
    @Inject(INVENTORY_REPOSITORY) private readonly inventory: InventoryRepository,
    @Inject(DATABASE) private readonly db: DatabaseClient,
  ) {}
  async reserve(input: Parameters<InventorySalesCoordinator['reserve']>[0]) {
    const locations = await withTenantTransaction(this.db, input.tenantId, (tx) =>
      tx.inventoryLocation.findMany({
        where: {
          tenantId: input.tenantId,
          branchId: input.branchId,
          active: true,
          type: { in: ['WAREHOUSE', 'BRANCH'] },
        },
        orderBy: { createdAt: 'asc' },
      }),
    );
    if (!locations.length) throw new NotFoundException('Inventory location not found');
    const required = this.quantity(input.quantity);
    let location = locations.at(0);
    if (!location) throw new NotFoundException('Inventory location not found');
    for (const candidate of locations) {
      const availability = await this.inventory.availability(
        input.tenantId,
        input.variantId,
        candidate.id,
      );
      if (this.quantity(availability.available ?? '0') >= required) {
        location = candidate;
        break;
      }
    }
    try {
      const value = await this.inventory.reserve(input.tenantId, input.actorId, {
        variantId: input.variantId,
        locationId: location.id,
        quantity: input.quantity,
        sourceType: 'SALE',
        sourceId: input.saleId,
        expiresAt: input.expiresAt,
        idempotencyKey: input.idempotencyKey,
      });
      return { reservationId: (value as { id: string }).id };
    } catch (error) {
      if (!input.allowNegative) throw error;
      throw new ConflictException('Negative-stock reservation requires Inventory policy support');
    }
  }
  private quantity(value: string) {
    const match = /^(\d+)(?:\.(\d{1,6}))?$/.exec(value);
    if (!match) throw new ConflictException('Invalid Inventory quantity');
    const whole = match[1];
    if (!whole) throw new ConflictException('Invalid Inventory quantity');
    return BigInt(whole) * 1_000_000n + BigInt((match[2] ?? '').padEnd(6, '0'));
  }
  async commit(input: Parameters<InventorySalesCoordinator['commit']>[0]) {
    for (const [index, id] of input.reservationIds.entries())
      await this.inventory.consume(
        input.tenantId,
        input.actorId,
        id,
        `${input.idempotencyKey}:${String(index)}`,
      );
  }
  async release(input: Parameters<InventorySalesCoordinator['release']>[0]) {
    for (const [index, id] of input.reservationIds.entries())
      await this.inventory.release(
        input.tenantId,
        input.actorId,
        id,
        input.reason,
        `${input.idempotencyKey}:${String(index)}`,
      );
  }
}
