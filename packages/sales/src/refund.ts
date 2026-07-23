export const returnDestinations = ['AVAILABLE', 'DAMAGED', 'QUARANTINE', 'DISCARDED'] as const;
export type ReturnDestination = (typeof returnDestinations)[number];
export type RefundLine = Readonly<{
  saleItemId: string;
  quantity: string;
  amountMinor: string;
  destination: ReturnDestination;
  reason: string;
}>;
export type RefundRequest = Readonly<{
  id: string;
  saleId: string;
  actorId: string;
  authorizationPermission: 'sales.refund';
  idempotencyKey: string;
  lines: readonly RefundLine[];
  requestedAt: string;
}>;

const quantityPattern = /^(0|[1-9]\d{0,13})(?:\.(\d{1,6}))?$/;
const scaledQuantity = (value: string): bigint => {
  const match = quantityPattern.exec(value);
  if (!match) throw new Error('REFUND_NOT_ALLOWED');
  return BigInt(match[1] ?? '0') * 1_000_000n + BigInt((match[2] ?? '').padEnd(6, '0'));
};

export function calculateRefundAmountMinor(
  input: Readonly<{
    soldQuantity: string;
    soldTotalMinor: string;
    refundQuantity: string;
  }>,
): string {
  const sold = scaledQuantity(input.soldQuantity);
  const returned = scaledQuantity(input.refundQuantity);
  const total = BigInt(input.soldTotalMinor);
  if (sold <= 0n || returned <= 0n || returned > sold || total < 0n)
    throw new Error('REFUND_NOT_ALLOWED');
  return String((total * returned + sold / 2n) / sold);
}

export function assertRefundRequest(input: RefundRequest): void {
  if (input.lines.length === 0) throw new Error('REFUND_NOT_ALLOWED');
  for (const line of input.lines) {
    if (!quantityPattern.test(line.quantity) || scaledQuantity(line.quantity) <= 0n)
      throw new Error('REFUND_NOT_ALLOWED');
    if (!/^[1-9]\d*$/.test(line.amountMinor) || !line.reason.trim())
      throw new Error('REFUND_NOT_ALLOWED');
  }
}
