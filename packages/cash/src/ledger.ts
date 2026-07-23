import type { CashCount, CashLedgerEntry, CashPolicy, CashReconciliation } from './types.js';
const minor = (value: string): bigint => {
  if (!/^-?\d+$/.test(value)) throw new Error('CASH_AMOUNT_INVALID');
  return BigInt(value);
};
export function deriveExpected(entries: readonly CashLedgerEntry[]): string {
  return entries
    .reduce(
      (sum, entry) =>
        sum + (entry.direction === 'IN' ? minor(entry.amountMinor) : -minor(entry.amountMinor)),
      0n,
    )
    .toString();
}
export function countDenominations(denominations: CashCount['denominations']): string {
  return denominations
    .reduce((sum, line) => {
      if (
        !/^\d+$/.test(line.denominationMinor) ||
        line.quantity < 0 ||
        !Number.isInteger(line.quantity)
      )
        throw new Error('CASH_COUNT_INVALID');
      return sum + BigInt(line.denominationMinor) * BigInt(line.quantity);
    }, 0n)
    .toString();
}
export function reconcileCash(
  expectedAmountMinor: string,
  countedAmountMinor: string,
  policy: CashPolicy,
): CashReconciliation {
  const expected = minor(expectedAmountMinor),
    counted = minor(countedAmountMinor),
    variance = counted - expected,
    absolute = variance < 0n ? -variance : variance,
    tolerance = minor(policy.varianceToleranceMinor),
    threshold = minor(policy.supervisorThresholdMinor);
  let status: CashReconciliation['status'] =
    variance === 0n
      ? 'MATCHED'
      : absolute <= tolerance
        ? 'WITHIN_TOLERANCE'
        : variance > 0n
          ? 'OVER'
          : 'SHORT';
  if (absolute > threshold) status = 'APPROVAL_REQUIRED';
  return {
    expectedAmountMinor: expected.toString(),
    countedAmountMinor: counted.toString(),
    varianceMinor: variance.toString(),
    status,
    severity: absolute === 0n ? 'NONE' : absolute <= threshold ? 'LOW' : 'HIGH',
  };
}
