import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module.js';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { INVENTORY_REPOSITORY } from './application/inventory.ports.js';
import { InventoryService } from './application/inventory.service.js';
import { PrismaInventoryRepository } from './infrastructure/prisma-inventory.repository.js';
import { InventoryController } from './interface/inventory.controller.js';
import { INVENTORY_SALES_COORDINATOR } from './application/inventory-sales.port.js';
import { InventorySalesCoordinatorAdapter } from './infrastructure/inventory-sales.coordinator.js';
@Module({
  imports: [InfrastructureModule, AuthenticationModule, AuthorizationModule],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    { provide: INVENTORY_REPOSITORY, useClass: PrismaInventoryRepository },
    { provide: INVENTORY_SALES_COORDINATOR, useClass: InventorySalesCoordinatorAdapter },
  ],
  exports: [INVENTORY_SALES_COORDINATOR],
})
export class InventoryModule {}
