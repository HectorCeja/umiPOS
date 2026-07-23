import type { DatabaseClient } from '@nexo/database';
import { withTenantTransaction } from '@nexo/database';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE } from '../../../infrastructure/infrastructure.module.js';
import type { ProductSalesCatalog } from '../application/product-sales.port.js';

@Injectable()
export class PrismaProductSalesCatalog implements ProductSalesCatalog {
  constructor(@Inject(DATABASE) private readonly db: DatabaseClient) {}
  resolveVariant(tenantId: string, variantId: string, currency: string) {
    return withTenantTransaction(this.db, tenantId, async (tx) => {
      const variant = await tx.productVariant.findFirst({
        where: { tenantId, id: variantId },
        include: {
          prices: { where: { currency, kind: 'BASE', active: true } },
          barcodes: true,
          product: true,
        },
      });
      const price = variant?.prices[0];
      if (!variant || !price) throw new NotFoundException('VARIANT_NOT_FOUND');
      // Product owns the sellable projection. Inventory tracking and tax profile
      // become explicit Product fields in the next compatible schema evolution.
      return {
        variantId: variant.id,
        productId: variant.productId,
        sku: variant.sku ?? variant.product.sku ?? variant.id,
        ...(variant.barcodes[0]?.value ? { barcode: variant.barcodes[0].value } : {}),
        productName: variant.product.name,
        variantName: variant.name,
        unit: variant.product.unitCode,
        sellable: variant.product.status === 'ACTIVE',
        managesInventory: variant.product.type === 'PHYSICAL',
        unitAmountMinor: price.amount.toFixed(2).replace('.', ''),
        priceVersion: price.version,
        taxProfileId: 'mx-default-iva',
        taxProfileVersion: 1,
        taxTreatment: 'EXCLUSIVE' as const,
        taxRateBasisPoints: 1600,
      };
    });
  }
}
