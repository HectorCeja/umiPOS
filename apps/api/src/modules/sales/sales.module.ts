import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module.js';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { ProductModule } from '../product/product.module.js';
import { InventoryModule } from '../inventory/inventory.module.js';
import { SALES_REPOSITORY } from './application/sales.ports.js';
import { SalesService } from './application/sales.service.js';
import { PrismaSalesRepository } from './infrastructure/prisma-sales.repository.js';
import { SalesController } from './interface/sales.controller.js';
@Module({
  imports: [
    InfrastructureModule,
    AuthenticationModule,
    AuthorizationModule,
    ProductModule,
    InventoryModule,
  ],
  controllers: [SalesController],
  providers: [SalesService, { provide: SALES_REPOSITORY, useClass: PrismaSalesRepository }],
})
export class SalesModule {}
