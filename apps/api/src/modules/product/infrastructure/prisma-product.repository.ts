import { randomUUID } from 'node:crypto';
import type { DatabaseClient, DatabaseTransaction, Prisma } from '@nexo/database';
import { withTenantTransaction } from '@nexo/database';
import { assertProductTransition, normalizeSku, optionCombinationKey } from '@nexo/product';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE } from '../../../infrastructure/infrastructure.module.js';
import { assertTransactionalAuthorization } from '../../authorization/infrastructure/transactional-authorization.js';
import type {
  CreateProductInput,
  CreateVariantInput,
  ProductRepository,
} from '../application/product.ports.js';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(@Inject(DATABASE) private readonly db: DatabaseClient) {}
  list(tenantId: string, query?: string) {
    return withTenantTransaction(this.db, tenantId, async (tx) => {
      const products = await tx.product.findMany({
        where: {
          tenantId,
          deletedAt: null,
          ...(query
            ? {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { normalizedSku: { contains: query.toUpperCase() } },
                  { searchTerms: { has: query } },
                ],
              }
            : {}),
        },
        include: {
          variants: true,
          prices: { where: { active: true }, orderBy: { updatedAt: 'desc' } },
          barcodes: true,
          media: { where: { status: 'ACTIVE', deletedAt: null } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      const categories = await tx.productCategory.findMany({
        where: { tenantId, id: { in: products.flatMap((product) => product.categoryId ?? []) } },
        select: { id: true, name: true, parentId: true, slug: true },
      });
      const byId = new Map(categories.map((category) => [category.id, category]));
      return products.map((product) => ({
        ...serializeProduct(product),
        category: product.categoryId ? (byId.get(product.categoryId) ?? null) : null,
      }));
    });
  }
  get(tenantId: string, id: string) {
    return withTenantTransaction(this.db, tenantId, async (tx) => {
      const value = await tx.product.findFirst({
        where: { tenantId, id },
        include: {
          variants: true,
          prices: { where: { active: true }, orderBy: { updatedAt: 'desc' } },
          barcodes: true,
          media: { where: { status: 'ACTIVE', deletedAt: null } },
        },
      });
      if (!value) throw new NotFoundException('Product not found');
      const category = value.categoryId
        ? await tx.productCategory.findFirst({
            where: { tenantId, id: value.categoryId },
            select: { id: true, name: true, parentId: true, slug: true },
          })
        : null;
      return { ...serializeProduct(value), category };
    });
  }
  categories(tenantId: string) {
    return withTenantTransaction(this.db, tenantId, (tx) =>
      tx.productCategory.findMany({
        where: { tenantId },
        select: { id: true, name: true, slug: true, parentId: true, sortOrder: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
    );
  }
  create(tenantId: string, actor: string, input: CreateProductInput) {
    return this.write(tenantId, actor, 'product.create', async (tx) => {
      try {
        if (input.categoryId) await this.assertCategory(tx, tenantId, input.categoryId);
        const product = await tx.product.create({
          data: {
            tenantId,
            createdBy: actor,
            updatedBy: actor,
            name: input.name,
            type: input.type,
            ...(input.sku ? { sku: input.sku, normalizedSku: normalizeSku(input.sku) } : {}),
            ...(input.shortName ? { shortName: input.shortName } : {}),
            ...(input.description ? { description: input.description } : {}),
            ...(input.unitCode ? { unitCode: input.unitCode } : {}),
            ...(input.searchTerms ? { searchTerms: input.searchTerms } : {}),
            ...(input.categoryId ? { categoryId: input.categoryId } : {}),
            ...(input.iconKey ? { metadata: { iconKey: input.iconKey } } : {}),
          },
        });
        await tx.productVariant.create({
          data: {
            tenantId,
            productId: product.id,
            name: 'Default',
            optionKey: '__default__',
            isDefault: true,
            ...(input.sku ? { sku: input.sku, normalizedSku: normalizeSku(input.sku) } : {}),
            createdBy: actor,
            updatedBy: actor,
          },
        });
        await this.event(tx, tenantId, actor, product.id, 'ProductCreated', { type: input.type });
        return product;
      } catch (error) {
        this.conflict(error);
        throw error;
      }
    });
  }
  update(
    tenantId: string,
    id: string,
    actor: string,
    input: Partial<CreateProductInput> & { version: number },
  ) {
    return this.write(tenantId, actor, 'product.update', async (tx) => {
      if (input.categoryId) await this.assertCategory(tx, tenantId, input.categoryId);
      if (input.type) {
        const current = await tx.product.findFirst({
          where: { tenantId, id, deletedAt: null },
          select: { type: true },
        });
        if (!current) throw new ConflictException('Stale or missing product');
        if (current.type !== input.type)
          throw new BadRequestException('Product type cannot be changed after creation');
      }
      const result = await tx.product.updateMany({
        where: { tenantId, id, version: input.version, deletedAt: null },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(input.shortName ? { shortName: input.shortName } : {}),
          ...(input.description ? { description: input.description } : {}),
          ...(input.type ? { type: input.type } : {}),
          ...(input.searchTerms ? { searchTerms: input.searchTerms } : {}),
          ...(input.sku ? { sku: input.sku, normalizedSku: normalizeSku(input.sku) } : {}),
          ...(input.categoryId ? { categoryId: input.categoryId } : {}),
          ...(input.iconKey ? { metadata: { iconKey: input.iconKey } } : {}),
          updatedBy: actor,
          version: { increment: 1 },
        },
      });
      if (!result.count) throw new ConflictException('Stale or missing product');
      if (input.sku) {
        await tx.productVariant.updateMany({
          where: { tenantId, productId: id, isDefault: true, deletedAt: null },
          data: {
            sku: input.sku,
            normalizedSku: normalizeSku(input.sku),
            updatedBy: actor,
            version: { increment: 1 },
          },
        });
      }
      await this.event(tx, tenantId, actor, id, 'ProductUpdated', {});
      return tx.product.findUniqueOrThrow({ where: { tenantId_id: { tenantId, id } } });
    });
  }
  status(
    tenantId: string,
    id: string,
    actor: string,
    status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'DISABLED',
    version: number,
  ) {
    return this.write(
      tenantId,
      actor,
      status === 'ARCHIVED'
        ? 'product.archive'
        : status === 'ACTIVE'
          ? 'product.update'
          : 'product.restore',
      async (tx) => {
        const current = await tx.product.findFirst({
          where: { tenantId, id, version },
          select: { status: true },
        });
        if (!current) throw new ConflictException('Stale or missing product');
        try {
          assertProductTransition(current.status, status);
        } catch {
          throw new BadRequestException('Product status transition is invalid');
        }
        const result = await tx.product.updateMany({
          where: { tenantId, id, version },
          data: {
            status,
            deletedAt: status === 'ARCHIVED' ? new Date() : null,
            updatedBy: actor,
            version: { increment: 1 },
          },
        });
        if (!result.count) throw new ConflictException('Stale or missing product');
        await this.event(
          tx,
          tenantId,
          actor,
          id,
          status === 'ARCHIVED'
            ? 'ProductArchived'
            : status === 'ACTIVE'
              ? 'ProductActivated'
              : 'ProductRestored',
          {},
        );
        return tx.product.findUniqueOrThrow({ where: { tenantId_id: { tenantId, id } } });
      },
    );
  }
  variant(tenantId: string, productId: string, actor: string, input: CreateVariantInput) {
    return this.write(tenantId, actor, 'product.variant.create', async (tx) => {
      try {
        const variant = await tx.productVariant.create({
          data: {
            tenantId,
            productId,
            name: input.name,
            optionValues: input.optionValues,
            optionKey: optionCombinationKey(
              Object.entries(input.optionValues).map(([option, value]) => ({ option, value })),
            ),
            ...(input.sku ? { sku: input.sku, normalizedSku: normalizeSku(input.sku) } : {}),
            createdBy: actor,
            updatedBy: actor,
          },
        });
        await this.event(tx, tenantId, actor, variant.id, 'VariantCreated', { productId });
        return variant;
      } catch (error) {
        this.conflict(error);
        throw error;
      }
    });
  }
  category(
    tenantId: string,
    actor: string,
    input: { name: string; slug: string; parentId?: string; sortOrder?: number },
  ) {
    return this.write(tenantId, actor, 'product.category.manage', async (tx) => {
      if (input.parentId) await this.assertCategory(tx, tenantId, input.parentId);
      const item = await tx.productCategory.create({
        data: {
          tenantId,
          name: input.name,
          slug: input.slug,
          ...(input.parentId ? { parentId: input.parentId } : {}),
          ...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder }),
        },
      });
      await this.event(tx, tenantId, actor, item.id, 'CategoryUpdated', {});
      return item;
    });
  }
  barcode(
    tenantId: string,
    productId: string,
    actor: string,
    input: {
      type: 'EAN' | 'UPC' | 'GTIN' | 'QR' | 'INTERNAL';
      value: string;
      variantId?: string;
      isPrimary?: boolean;
    },
  ) {
    return this.write(tenantId, actor, 'product.barcode.manage', async (tx) => {
      try {
        await this.assertProduct(tx, tenantId, productId);
        if (input.variantId)
          await this.assertProductVariant(tx, tenantId, productId, input.variantId);
        if (input.isPrimary) {
          await tx.productBarcode.updateMany({
            where: { tenantId, productId, isPrimary: true },
            data: { isPrimary: false },
          });
        }
        return await tx.productBarcode.create({
          data: {
            tenantId,
            productId,
            type: input.type,
            value: input.value,
            normalizedValue: input.value,
            ...(input.variantId ? { variantId: input.variantId } : {}),
            ...(input.isPrimary ? { isPrimary: true } : {}),
          },
        });
      } catch (error) {
        this.conflict(error);
        throw error;
      }
    });
  }
  price(
    tenantId: string,
    productId: string,
    actor: string,
    input: {
      variantId: string;
      amount: string;
      currency: string;
      taxProfileKey?: string;
      unitCode?: string;
    },
  ) {
    return this.write(tenantId, actor, 'product.price.update', async (tx) => {
      const organization = await tx.organization.findUnique({
        where: { id: tenantId },
        select: { defaultCurrency: true },
      });
      if (!organization || input.currency !== organization.defaultCurrency)
        throw new BadRequestException('Price currency must match the organization currency');
      await this.assertProductVariant(tx, tenantId, productId, input.variantId);
      const lockKey = `product-price:${tenantId}:${productId}:${input.variantId}:${input.currency}`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
      await tx.productPrice.updateMany({
        where: {
          tenantId,
          productId,
          variantId: input.variantId,
          currency: input.currency,
          active: true,
        },
        data: { active: false, version: { increment: 1 } },
      });
      const item = await tx.productPrice.create({
        data: {
          tenantId,
          productId,
          variantId: input.variantId,
          amount: input.amount,
          currency: input.currency,
          ...(input.taxProfileKey ? { taxProfileKey: input.taxProfileKey } : {}),
          ...(input.unitCode ? { unitCode: input.unitCode } : {}),
        },
      });
      await this.event(tx, tenantId, actor, productId, 'PriceUpdated', { priceId: item.id });
      return item;
    });
  }
  prepareMedia(
    tenantId: string,
    productId: string,
    actor: string,
    input: { contentType: string; altText: string; fileName: string; variantId?: string },
  ) {
    return this.write(tenantId, actor, 'product.media.manage', async (tx) => {
      await this.assertProduct(tx, tenantId, productId);
      if (input.variantId)
        await this.assertProductVariant(tx, tenantId, productId, input.variantId);
      const id = randomUUID();
      const objectKey = `tenants/${tenantId}/products/${productId}/${id}/${input.fileName}`;
      await tx.productMedia.create({
        data: {
          id,
          tenantId,
          productId,
          objectKey,
          contentType: input.contentType,
          altText: input.altText,
          ...(input.variantId ? { variantId: input.variantId } : {}),
        },
      });
      return { id, objectKey };
    });
  }
  pendingMedia(tenantId: string, productId: string, mediaId: string) {
    return withTenantTransaction(this.db, tenantId, async (tx) => {
      const item = await tx.productMedia.findFirst({
        where: { tenantId, productId, id: mediaId, status: 'PENDING', deletedAt: null },
        select: { objectKey: true, contentType: true },
      });
      if (!item) throw new BadRequestException('Pending media reference is invalid');
      return item;
    });
  }
  activateMedia(
    tenantId: string,
    productId: string,
    mediaId: string,
    actor: string,
    sizeBytes: number,
  ) {
    return this.write(tenantId, actor, 'product.media.manage', async (tx) => {
      const lockKey = `product-media:${tenantId}:${productId}`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
      const claimed = await tx.productMedia.updateMany({
        where: { tenantId, productId, id: mediaId, status: 'PENDING', deletedAt: null },
        data: { status: 'ACTIVE', sizeBytes, isPrimary: false },
      });
      if (!claimed.count) throw new ConflictException('Media is stale or already finalized');
      await tx.productMedia.updateMany({
        where: { tenantId, productId, id: { not: mediaId }, status: 'ACTIVE', deletedAt: null },
        data: { isPrimary: false },
      });
      const item = await tx.productMedia.update({
        where: { tenantId_id: { tenantId, id: mediaId } },
        data: { isPrimary: true },
      });
      await this.event(tx, tenantId, actor, mediaId, 'MediaAdded', { productId });
      return { ...item, sizeBytes: item.sizeBytes?.toString() ?? null };
    });
  }
  media(tenantId: string, productId: string, mediaId: string) {
    return withTenantTransaction(this.db, tenantId, async (tx) => {
      const item = await tx.productMedia.findFirst({
        where: { tenantId, productId, id: mediaId, status: 'ACTIVE', deletedAt: null },
        select: { objectKey: true, contentType: true, altText: true },
      });
      if (!item) throw new NotFoundException('Product media not found');
      return item;
    });
  }
  private write<T>(
    tenantId: string,
    actor: string,
    permission: string,
    fn: (tx: DatabaseTransaction) => Promise<T>,
  ) {
    return withTenantTransaction(this.db, tenantId, async (tx) => {
      await assertTransactionalAuthorization(tx, {
        userId: actor,
        tenantId,
        permission,
        resource: { type: 'product' },
      });
      return fn(tx);
    });
  }
  private async assertProduct(tx: DatabaseTransaction, tenantId: string, productId: string) {
    const product = await tx.product.findFirst({
      where: { tenantId, id: productId, deletedAt: null },
      select: { id: true },
    });
    if (!product) throw new BadRequestException('Product reference is invalid');
  }
  private async assertCategory(tx: DatabaseTransaction, tenantId: string, categoryId: string) {
    const category = await tx.productCategory.findFirst({
      where: { tenantId, id: categoryId, deletedAt: null },
      select: { id: true },
    });
    if (!category) throw new BadRequestException('Category reference is invalid');
  }
  private async assertProductVariant(
    tx: DatabaseTransaction,
    tenantId: string,
    productId: string,
    variantId: string,
  ) {
    const variant = await tx.productVariant.findFirst({
      where: { tenantId, productId, id: variantId, deletedAt: null },
      select: { id: true },
    });
    if (!variant) throw new BadRequestException('Variant reference is invalid');
  }
  private async event(
    tx: DatabaseTransaction,
    tenantId: string,
    actor: string,
    aggregateId: string,
    eventType: string,
    payload: Record<string, string>,
  ) {
    const event = {
      tenantId,
      actorUserId: actor,
      aggregateType: 'Product',
      aggregateId,
      eventType,
      payload: payload as Prisma.InputJsonValue,
    };
    await tx.productEvent.create({ data: event });
    await tx.productOutbox.create({
      data: {
        tenantId,
        aggregateType: 'Product',
        aggregateId,
        eventType,
        payload: payload as Prisma.InputJsonValue,
      },
    });
  }
  private conflict(error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002')
      throw new ConflictException('SKU, barcode or variant already exists');
  }
}

function serializeProduct<T extends { media: { sizeBytes: bigint | null }[] }>(product: T) {
  return {
    ...product,
    media: product.media.map((item) => {
      const { objectKey: _objectKey, ...publicItem } = item as typeof item & { objectKey?: string };
      void _objectKey;
      return { ...publicItem, sizeBytes: item.sizeBytes?.toString() ?? null };
    }),
  };
}
