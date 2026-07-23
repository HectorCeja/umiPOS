import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module.js';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { PRODUCT_REPOSITORY } from './application/product.ports.js';
import { ProductService } from './application/product.service.js';
import { PrismaProductRepository } from './infrastructure/prisma-product.repository.js';
import { ProductController } from './interface/product.controller.js';
import { PRODUCT_SALES_CATALOG } from './application/product-sales.port.js';
import { PrismaProductSalesCatalog } from './infrastructure/prisma-product-sales.catalog.js';
@Module({
  imports: [InfrastructureModule, AuthenticationModule, AuthorizationModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    { provide: PRODUCT_SALES_CATALOG, useClass: PrismaProductSalesCatalog },
  ],
  exports: [PRODUCT_SALES_CATALOG],
})
export class ProductModule {}
