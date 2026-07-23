export const productTypes = [
  'PHYSICAL',
  'SERVICE',
  'BUNDLE',
  'KIT',
  'COMPOSITE',
  'DIGITAL',
  'GIFT_CARD',
  'SUBSCRIPTION',
  'CUSTOM',
] as const;
export type ProductType = (typeof productTypes)[number];

export const enabledProductTypes = [
  'PHYSICAL',
  'SERVICE',
] as const satisfies readonly ProductType[];

export const productStatuses = ['DRAFT', 'ACTIVE', 'ARCHIVED', 'DISABLED'] as const;
export type ProductStatus = (typeof productStatuses)[number];

export const barcodeTypes = ['EAN', 'UPC', 'GTIN', 'QR', 'INTERNAL'] as const;
export type BarcodeType = (typeof barcodeTypes)[number];

export const productEventTypes = [
  'ProductCreated',
  'ProductUpdated',
  'ProductArchived',
  'ProductRestored',
  'ProductActivated',
  'VariantCreated',
  'MediaAdded',
  'CategoryUpdated',
  'PriceUpdated',
] as const;
export type ProductEventType = (typeof productEventTypes)[number];

export type ProductDomainEvent = Readonly<{
  id: string;
  tenantId: string;
  aggregateId: string;
  aggregateType: 'Product' | 'ProductVariant' | 'ProductCategory' | 'ProductMedia';
  type: ProductEventType;
  schemaVersion: 1;
  occurredAt: Date;
  payload: Readonly<Record<string, string | number | boolean | null>>;
}>;

export interface ProductSearchPort<T> {
  search(
    input: Readonly<{ tenantId: string; query: string; limit: number }>,
  ): Promise<readonly T[]>;
}

export function normalizeSku(value: string): string {
  const normalized = value.trim().normalize('NFKC').toUpperCase();
  if (normalized.length === 0 || normalized.length > 100) throw new Error('Invalid SKU');
  return normalized;
}

export function normalizeBarcode(value: string): string {
  const normalized = value.trim().normalize('NFKC');
  if (normalized.length === 0 || normalized.length > 256) throw new Error('Invalid barcode');
  return normalized;
}

export function validateBarcode(type: BarcodeType, value: string): string {
  const normalized = normalizeBarcode(value);
  if (type === 'GTIN' || type === 'EAN' || type === 'UPC') {
    if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(normalized))
      throw new Error('Invalid GS1 identifier length');
    if (!hasValidGs1CheckDigit(normalized)) throw new Error('Invalid GS1 check digit');
  }
  return normalized;
}

export function hasValidGs1CheckDigit(value: string): boolean {
  if (!/^\d+$/.test(value) || value.length < 2) return false;
  const digits = Array.from(value, Number);
  const expected = digits.pop();
  const sum = digits
    .reverse()
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  return expected === (10 - (sum % 10)) % 10;
}

export function assertProductTransition(from: ProductStatus, to: ProductStatus): void {
  const allowed: Readonly<Record<ProductStatus, readonly ProductStatus[]>> = {
    DRAFT: ['ACTIVE', 'ARCHIVED', 'DISABLED'],
    ACTIVE: ['ARCHIVED', 'DISABLED'],
    ARCHIVED: ['DRAFT', 'ACTIVE', 'DISABLED'],
    DISABLED: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
  };
  if (from !== to && !allowed[from].includes(to))
    throw new Error(`Invalid transition ${from} -> ${to}`);
}

export function assertProductTypeEnabled(type: ProductType): void {
  if (!(enabledProductTypes as readonly ProductType[]).includes(type))
    throw new Error(`Product type ${type} is not enabled`);
}

export function assertMoney(amount: string, currency: string): void {
  if (!/^(0|[1-9]\d{0,13})(\.\d{1,6})?$/.test(amount)) throw new Error('Invalid monetary amount');
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Invalid ISO 4217 currency');
}

export function optionCombinationKey(
  values: readonly Readonly<{ option: string; value: string }>[],
): string {
  if (values.length === 0) throw new Error('Variant requires at least one option value');
  const normalized = values.map(({ option, value }) => ({
    option: option.trim().normalize('NFKC').toLowerCase(),
    value: value.trim().normalize('NFKC').toLowerCase(),
  }));
  if (normalized.some(({ option, value }) => !option || !value))
    throw new Error('Empty option/value');
  if (new Set(normalized.map(({ option }) => option)).size !== normalized.length)
    throw new Error('Duplicate option');
  return normalized
    .sort((left, right) => left.option.localeCompare(right.option))
    .map(({ option, value }) => `${option}=${value}`)
    .join('|');
}
