import { divideRounded, multiplyMoney, percentage } from './money.js';
import type { Discount, PaymentAllocation, SaleItem, SalesPolicy, TaxSnapshot } from './types.js';

export type CalculatedLine = Readonly<{
  subtotalMinor: bigint;
  discountMinor: bigint;
  taxMinor: bigint;
  totalMinor: bigint;
}>;
export type SaleTotals = Readonly<{
  subtotalMinor: string;
  discountMinor: string;
  taxMinor: string;
  totalBeforeRoundingMinor: string;
  roundingMinor: string;
  totalMinor: string;
  paidMinor: string;
  dueMinor: string;
  changeMinor: string;
  refundableMinor: string;
}>;

const integer = (value: string) => {
  if (!/^-?(0|[1-9]\d*)$/.test(value)) throw new Error('INVALID_MONEY');
  return BigInt(value);
};

export function calculateLine(
  input: Readonly<{
    unitAmountMinor: string;
    quantity: string;
    discounts: readonly Discount[];
    tax: TaxSnapshot;
    roundingMode: SalesPolicy['roundingMode'];
  }>,
): CalculatedLine {
  const subtotalMinor = multiplyMoney(
    integer(input.unitAmountMinor),
    input.quantity,
    6,
    input.roundingMode,
  );
  let discountMinor = 0n;
  for (const discount of input.discounts) {
    const remaining = subtotalMinor - discountMinor;
    const amount =
      discount.kind === 'PERCENT'
        ? percentage(remaining, Number(discount.value), input.roundingMode)
        : integer(discount.value);
    discountMinor += amount > remaining ? remaining : amount;
  }
  const taxable = subtotalMinor - discountMinor;
  let taxMinor = 0n;
  if (input.tax.treatment === 'EXCLUSIVE')
    taxMinor = percentage(taxable, input.tax.rateBasisPoints, input.roundingMode);
  if (input.tax.treatment === 'INCLUSIVE' && input.tax.rateBasisPoints > 0)
    taxMinor =
      taxable -
      divideRounded(
        taxable * 10000n,
        BigInt(10000 + input.tax.rateBasisPoints),
        input.roundingMode,
      );
  return {
    subtotalMinor,
    discountMinor,
    taxMinor,
    totalMinor: input.tax.treatment === 'EXCLUSIVE' ? taxable + taxMinor : taxable,
  };
}

export function calculateTotals(
  items: readonly SaleItem[],
  payments: readonly PaymentAllocation[],
): SaleTotals {
  const subtotal = items.reduce((sum, item) => sum + integer(item.subtotalMinor), 0n);
  const discount = items.reduce((sum, item) => sum + integer(item.discountTotalMinor), 0n);
  const tax = items.reduce((sum, item) => sum + integer(item.taxTotalMinor), 0n);
  const total = items.reduce((sum, item) => sum + integer(item.lineTotalMinor), 0n);
  const captured = payments.filter((payment) => payment.status === 'CAPTURED');
  const applied = captured.reduce((sum, payment) => sum + integer(payment.amountMinor), 0n);
  const tendered = captured.reduce(
    (sum, payment) => sum + integer(payment.tenderedMinor ?? payment.amountMinor),
    0n,
  );
  const change =
    tendered > total && captured.some((payment) => payment.method === 'CASH')
      ? tendered - total
      : 0n;
  const paid = applied > total ? total : applied;
  return {
    subtotalMinor: String(subtotal),
    discountMinor: String(discount),
    taxMinor: String(tax),
    totalBeforeRoundingMinor: String(total),
    roundingMinor: '0',
    totalMinor: String(total),
    paidMinor: String(paid),
    dueMinor: String(total - paid),
    changeMinor: String(change),
    refundableMinor: String(paid),
  };
}
