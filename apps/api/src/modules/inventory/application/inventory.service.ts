import {
  assertCostMethodEnabled,
  assertManualMovement,
  assertMovement,
  assertQuantity,
  assertVariantReference,
} from '@nexo/inventory';
import { traceOperation } from '@nexo/observability';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { SessionIdentity } from '../../authentication/application/authentication.ports.js';
import { AuthorizationService } from '../../authorization/application/authorization.service.js';
import {
  INVENTORY_REPOSITORY,
  type InventoryRepository,
  type MovementInput,
} from './inventory.ports.js';
@Injectable()
export class InventoryService {
  constructor(
    @Inject(INVENTORY_REPOSITORY) private readonly repository: InventoryRepository,
    private readonly authorization: AuthorizationService,
  ) {}
  async locations(i: SessionIdentity, t: string, branchId?: string, includeArchived = false) {
    await this.allow(i, t, 'inventory.read', 'inventory_location');
    return this.repository.locations(t, branchId, includeArchived);
  }
  private async allow(i: SessionIdentity, t: string, p: string, r = 'inventory') {
    await this.authorization.assert(i, t, p, { type: r });
  }
  async location(
    i: SessionIdentity,
    t: string,
    input: Parameters<InventoryRepository['createLocation']>[2],
  ) {
    await this.allow(i, t, 'inventory.write', 'inventory_location');
    return this.repository.createLocation(t, i.userId, input);
  }
  async updateLocation(
    i: SessionIdentity,
    t: string,
    id: string,
    input: Parameters<InventoryRepository['updateLocation']>[3],
  ) {
    await this.allow(i, t, 'inventory.write', 'inventory_location');
    return this.repository.updateLocation(t, i.userId, id, input);
  }
  async record(i: SessionIdentity, t: string, input: MovementInput) {
    try {
      assertVariantReference({ variantId: input.variantId });
      assertMovement(input);
      assertManualMovement(input);
    } catch {
      throw new BadRequestException('Inventory movement is invalid');
    }
    await this.allow(
      i,
      t,
      ['ADJUSTMENT', 'CORRECTION'].includes(input.type) ? 'inventory.adjust' : 'inventory.write',
    );
    return traceOperation('inventory.movement.record', { tenantId: t }, () =>
      this.repository.record(t, i.userId, input),
    );
  }
  async availability(i: SessionIdentity, t: string, v: string, l: string) {
    await this.allow(i, t, 'inventory.read');
    return this.repository.availability(t, v, l);
  }
  async timeline(i: SessionIdentity, t: string, v: string, l: string) {
    await this.allow(i, t, 'inventory.read');
    return this.repository.timeline(t, v, l);
  }
  async reserve(
    i: SessionIdentity,
    t: string,
    input: Parameters<InventoryRepository['reserve']>[2],
  ) {
    assertQuantity(input.quantity);
    if (input.expiresAt <= new Date())
      throw new BadRequestException('Reservation expiry is invalid');
    await this.allow(i, t, 'inventory.write', 'inventory_reservation');
    return this.repository.reserve(t, i.userId, input);
  }
  async release(i: SessionIdentity, t: string, id: string, reason: string, key: string) {
    await this.allow(i, t, 'inventory.write', 'inventory_reservation');
    return this.repository.release(t, i.userId, id, reason, key);
  }
  async transfer(
    i: SessionIdentity,
    t: string,
    input: Parameters<InventoryRepository['transfer']>[2],
  ) {
    assertQuantity(input.quantity);
    assertMovement({
      quantity: input.quantity,
      type: 'TRANSFER',
      fromLocationId: input.fromLocationId,
      toLocationId: input.toLocationId,
    });
    await this.allow(i, t, 'inventory.write', 'inventory_transfer');
    return this.repository.transfer(t, i.userId, input);
  }
  async completeTransfer(i: SessionIdentity, t: string, id: string, key: string) {
    await this.allow(i, t, 'inventory.write', 'inventory_transfer');
    return this.repository.completeTransfer(t, i.userId, id, key);
  }
  async count(i: SessionIdentity, t: string, input: Parameters<InventoryRepository['count']>[2]) {
    assertQuantity(input.countedQuantity, true);
    await this.allow(i, t, 'inventory.adjust', 'inventory_count');
    return this.repository.count(t, i.userId, input);
  }
  async policy(i: SessionIdentity, t: string, input: Parameters<InventoryRepository['policy']>[2]) {
    try {
      assertCostMethodEnabled(input.costMethod);
    } catch {
      throw new BadRequestException('Inventory cost method is not operational');
    }
    if (input.standardUnitCost !== undefined)
      throw new BadRequestException('Standard cost is not operational');
    await this.allow(i, t, 'inventory.adjust', 'inventory_policy');
    return this.repository.policy(t, i.userId, input);
  }
}
