import type { BarcodeType, ProductStatus, ProductType } from '@nexo/product';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
export type CreateProductInput = Readonly<{
  name: string;
  sku?: string;
  type: ProductType;
  shortName?: string;
  description?: string;
  unitCode?: string;
  searchTerms?: string[];
  categoryId?: string;
  iconKey?: string;
}>;
export type CreateVariantInput = Readonly<{
  name: string;
  sku?: string;
  optionValues: Record<string, string>;
}>;
export interface ProductRepository {
  list(tenantId: string, query?: string): Promise<unknown>;
  get(tenantId: string, productId: string): Promise<unknown>;
  create(tenantId: string, actor: string, input: CreateProductInput): Promise<unknown>;
  update(
    tenantId: string,
    productId: string,
    actor: string,
    input: Partial<CreateProductInput> & { version: number },
  ): Promise<unknown>;
  status(
    tenantId: string,
    productId: string,
    actor: string,
    status: ProductStatus,
    version: number,
  ): Promise<unknown>;
  variant(
    tenantId: string,
    productId: string,
    actor: string,
    input: CreateVariantInput,
  ): Promise<unknown>;
  category(
    tenantId: string,
    actor: string,
    input: { name: string; slug: string; parentId?: string; sortOrder?: number },
  ): Promise<unknown>;
  categories(tenantId: string): Promise<unknown>;
  barcode(
    tenantId: string,
    productId: string,
    actor: string,
    input: { type: BarcodeType; value: string; variantId?: string; isPrimary?: boolean },
  ): Promise<unknown>;
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
  ): Promise<unknown>;
  prepareMedia(
    tenantId: string,
    productId: string,
    actor: string,
    input: { contentType: string; altText: string; fileName: string; variantId?: string },
  ): Promise<{ id: string; objectKey: string }>;
  pendingMedia(
    tenantId: string,
    productId: string,
    mediaId: string,
  ): Promise<{ objectKey: string; contentType: string }>;
  activateMedia(
    tenantId: string,
    productId: string,
    mediaId: string,
    actor: string,
    sizeBytes: number,
  ): Promise<unknown>;
  media(
    tenantId: string,
    productId: string,
    mediaId: string,
  ): Promise<{ objectKey: string; contentType: string; altText: string }>;
}
