import { createHash } from 'node:crypto';
import type { SaleSnapshot } from './types.js';
import { calculateTotals } from './totals.js';

export type ReceiptModel = Readonly<{
  version: 1;
  saleId: string;
  saleFolio: string;
  businessDate: string;
  completedAt: string;
  currency: string;
  organization: Readonly<{ name: string; legalTaxId?: string; address: string }>;
  branch: Readonly<{ name: string; address: string; timeZone: string }>;
  sellerDisplay: string;
  lines: readonly Readonly<{
    description: string;
    variant: string;
    sku: string;
    quantity: string;
    unitAmountMinor: string;
    discountMinor: string;
    taxMinor: string;
    totalMinor: string;
  }>[];
  totals: ReturnType<typeof calculateTotals>;
  payments: SaleSnapshot['payments'];
  legalText: string;
  locale: string;
  integrationReferences: Readonly<Record<string, string>>;
}>;

export function generateReceipt(
  input: Readonly<{
    sale: SaleSnapshot;
    folio: string;
    organization: ReceiptModel['organization'];
    branch: ReceiptModel['branch'];
    sellerDisplay: string;
    legalText: string;
    locale: string;
    integrationReferences?: Readonly<Record<string, string>>;
  }>,
): Readonly<{ model: ReceiptModel; contentHash: string }> {
  if (input.sale.status !== 'COMPLETED' || !input.sale.completedAt)
    throw new Error('SALE_INVALID_STATE');
  const model: ReceiptModel = {
    version: 1,
    saleId: input.sale.id,
    saleFolio: input.folio,
    businessDate: input.sale.businessDate,
    completedAt: input.sale.completedAt,
    currency: input.sale.currency,
    organization: input.organization,
    branch: input.branch,
    sellerDisplay: input.sellerDisplay,
    lines: input.sale.items.map((item) => ({
      description: item.productName,
      variant: item.variantName,
      sku: item.sku,
      quantity: item.quantity,
      unitAmountMinor: item.unitAmountMinor,
      discountMinor: item.discountTotalMinor,
      taxMinor: item.taxTotalMinor,
      totalMinor: item.lineTotalMinor,
    })),
    totals: calculateTotals(input.sale.items, input.sale.payments),
    payments: input.sale.payments,
    legalText: input.legalText,
    locale: input.locale,
    integrationReferences: input.integrationReferences ?? {},
  };
  return { model, contentHash: createHash('sha256').update(JSON.stringify(model)).digest('hex') };
}
