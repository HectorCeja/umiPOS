import { createHash } from 'node:crypto';
export type CashReceipt = Readonly<{
  version: 1;
  kind:
    | 'OPENING'
    | 'MOVEMENT'
    | 'WITHDRAWAL'
    | 'DEPOSIT'
    | 'TRANSFER'
    | 'COUNT'
    | 'CLOSING'
    | 'VARIANCE'
    | 'REOPENING'
    | 'HANDOFF';
  sessionId: string;
  registerId: string;
  businessDate: string;
  occurredAt: string;
  currency: string;
  amountMinor?: string;
  expectedAmountMinor?: string;
  countedAmountMinor?: string;
  varianceMinor?: string;
  actorDisplay: string;
  approverDisplay?: string;
  reference?: string;
}>;
export function cashReceipt(
  model: CashReceipt,
): Readonly<{ model: CashReceipt; contentHash: string }> {
  return { model, contentHash: createHash('sha256').update(JSON.stringify(model)).digest('hex') };
}
