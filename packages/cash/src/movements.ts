import type { CashDirection, CashMovementType } from './types.js';
export const CASH_MOVEMENT_REGISTRY_VERSION = 1 as const;
export type CashMovementDefinition = Readonly<{
  type: CashMovementType;
  direction: CashDirection;
  affectsExpected: boolean;
  permission: string;
  reasonRequired: boolean;
  approvalRequired: boolean;
  receiptRequired: boolean;
  externalReferenceAllowed: boolean;
  closedSessionAllowed: boolean;
  automatic: boolean;
}>;
const definition = (
  type: CashMovementType,
  direction: CashDirection,
  permission: string,
  options: Partial<Omit<CashMovementDefinition, 'type' | 'direction' | 'permission'>> = {},
): CashMovementDefinition => ({
  type,
  direction,
  permission,
  affectsExpected: true,
  reasonRequired: true,
  approvalRequired: false,
  receiptRequired: true,
  externalReferenceAllowed: true,
  closedSessionAllowed: false,
  automatic: false,
  ...options,
});
export const cashMovementRegistry: readonly CashMovementDefinition[] = [
  definition('OPENING_FLOAT', 'IN', 'cash.session.open', {
    reasonRequired: false,
    automatic: true,
  }),
  definition('CASH_SALE', 'IN', 'cash.movement.create', { reasonRequired: false, automatic: true }),
  definition('CASH_REFUND', 'OUT', 'cash.refund', { approvalRequired: true, automatic: true }),
  definition('CASH_IN', 'IN', 'cash.movement.create'),
  definition('CASH_OUT', 'OUT', 'cash.movement.create'),
  definition('WITHDRAWAL', 'OUT', 'cash.withdraw', { approvalRequired: true }),
  definition('DEPOSIT', 'OUT', 'cash.deposit', { approvalRequired: true }),
  definition('TRANSFER_OUT', 'OUT', 'cash.transfer', { approvalRequired: true }),
  definition('TRANSFER_IN', 'IN', 'cash.transfer', { approvalRequired: true }),
  definition('PAID_OUT', 'OUT', 'cash.movement.create', { approvalRequired: true }),
  definition('CHANGE_IN', 'IN', 'cash.movement.create'),
  definition('CHANGE_OUT', 'OUT', 'cash.movement.create'),
  definition('COUNT_ADJUSTMENT', 'IN', 'cash.reconcile', { approvalRequired: true }),
  definition('CORRECTION', 'IN', 'cash.reconcile', {
    approvalRequired: true,
    closedSessionAllowed: true,
  }),
  definition('CLOSING_TRANSFER', 'OUT', 'cash.session.close', { automatic: true }),
  definition('REOPENING_ADJUSTMENT', 'IN', 'cash.session.reopen', {
    approvalRequired: true,
    closedSessionAllowed: true,
  }),
  definition('UNKNOWN_RECONCILIATION', 'IN', 'cash.reconcile', {
    approvalRequired: true,
    closedSessionAllowed: true,
  }),
];
export function movementDefinition(type: CashMovementType): CashMovementDefinition {
  const found = cashMovementRegistry.find((item) => item.type === type);
  if (!found) throw new Error('CASH_MOVEMENT_NOT_ALLOWED');
  return found;
}
