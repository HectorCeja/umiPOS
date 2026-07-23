export const PRODUCT_SALES_CATALOG = Symbol('PRODUCT_SALES_CATALOG');

export interface ProductSalesCatalog {
  resolveVariant(
    tenantId: string,
    variantId: string,
    currency: string,
  ): Promise<
    Readonly<{
      variantId: string;
      productId: string;
      sku: string;
      barcode?: string;
      productName: string;
      variantName: string;
      unit: string;
      sellable: boolean;
      managesInventory: boolean;
      unitAmountMinor: string;
      priceVersion: number;
      taxProfileId: string;
      taxProfileVersion: number;
      taxTreatment: 'EXCLUSIVE' | 'INCLUSIVE' | 'ZERO_RATED' | 'EXEMPT';
      taxRateBasisPoints: number;
    }>
  >;
}
