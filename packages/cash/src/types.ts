export const cashSessionStatuses = [
  'PENDING_OPEN',
  'OPEN',
  'SUSPENDED',
  'COUNTING',
  'RECONCILIATION_REQUIRED',
  'PENDING_APPROVAL',
  'CLOSED',
  'FORCE_CLOSED',
  'REOPENED',
  'CANCELLED',
] as const;
export type CashSessionStatus = (typeof cashSessionStatuses)[number];
export const cashMovementTypes = [
  'OPENING_FLOAT',
  'CASH_SALE',
  'CASH_REFUND',
  'CASH_IN',
  'CASH_OUT',
  'WITHDRAWAL',
  'DEPOSIT',
  'TRANSFER_OUT',
  'TRANSFER_IN',
  'PAID_OUT',
  'CHANGE_IN',
  'CHANGE_OUT',
  'COUNT_ADJUSTMENT',
  'CORRECTION',
  'CLOSING_TRANSFER',
  'REOPENING_ADJUSTMENT',
  'UNKNOWN_RECONCILIATION',
] as const;
export type CashMovementType = (typeof cashMovementTypes)[number];
export type CashDirection = 'IN' | 'OUT';
export type CashContext = Readonly<{
  tenantId: string;
  organizationId: string;
  branchId: string;
  actorUserId: string;
  membershipId: string;
  correlationId: string;
}>;
export type CashRegister = Readonly<{
  id: string;
  tenantId: string;
  organizationId: string;
  branchId: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ARCHIVED';
  defaultCurrency: string;
  defaultOpeningFloatMinor?: string;
  drawerId?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}>;
export type CashDrawer = Readonly<{
  id: string;
  tenantId: string;
  organizationId: string;
  branchId: string;
  name: string;
  code: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'IN_USE' | 'OUT_OF_SERVICE' | 'ARCHIVED';
  registerId?: string;
  hardwareReference?: string;
  version: number;
}>;
export type CashSessionSnapshot = Readonly<{
  id: string;
  tenantId: string;
  organizationId: string;
  branchId: string;
  registerId: string;
  drawerId?: string;
  openedByUserId: string;
  openedByMembershipId: string;
  assignedCashierId: string;
  currency: string;
  businessDate: string;
  openedAt?: string;
  closedAt?: string;
  suspendedAt?: string;
  reopenedAt?: string;
  openingFloatMinor: string;
  expectedAmountMinor: string;
  countedAmountMinor?: string;
  varianceMinor?: string;
  status: CashSessionStatus;
  version: number;
  correlationId: string;
  notes?: string;
}>;
export type CashLedgerEntry = Readonly<{
  id: string;
  tenantId: string;
  organizationId: string;
  branchId: string;
  sessionId: string;
  registerId: string;
  drawerId?: string;
  currency: string;
  direction: CashDirection;
  movementType: CashMovementType;
  amountMinor: string;
  sourceType: string;
  sourceId: string;
  saleId?: string;
  paymentAllocationId?: string;
  reference?: string;
  reason: string;
  actorId: string;
  membershipId: string;
  approvedBy?: string;
  occurredAt: string;
  businessDate: string;
  idempotencyKey: string;
  correlationId: string;
  causationId?: string;
  metadata: Readonly<Record<string, string>>;
  createdAt: string;
}>;
export type CashPolicy = Readonly<{
  openingFloatRequired: boolean;
  defaultOpeningFloatMinor: string;
  manualOpeningAllowed: boolean;
  cashCountRequired: boolean;
  denominationCountRequired: boolean;
  blindCount: boolean;
  varianceToleranceMinor: string;
  supervisorThresholdMinor: string;
  withdrawalThresholdMinor: string;
  maximumDrawerMinor: string;
  sharedDrawerAllowed: boolean;
  oneActiveSessionPerCashier: boolean;
  cashRefundAllowed: boolean;
  negativeExpectedAllowed: boolean;
  forceCloseAllowed: boolean;
  reopenAllowed: boolean;
  transferAllowed: boolean;
  depositApprovalRequired: boolean;
  selfApprovalAllowed: boolean;
  sessionInactivitySeconds: number;
  businessDayCutoffMinutes: number;
  pendingEventClosePolicy: 'BLOCK' | 'ALLOW_WITH_APPROVAL';
  dualControl: boolean;
}>;
export type CashPolicyScope = 'GLOBAL' | 'ORGANIZATION' | 'BRANCH' | 'REGISTER';
export type CashPolicyOverride = Readonly<Partial<CashPolicy>>;
export type CashCount = Readonly<{
  id: string;
  sessionId: string;
  currency: string;
  kind: 'TOTAL' | 'DENOMINATION';
  denominations: readonly Readonly<{ denominationMinor: string; quantity: number }>[];
  countedAmountMinor: string;
  actorId: string;
  occurredAt: string;
  sequence: number;
}>;
export type CashReconciliationStatus =
  | 'MATCHED'
  | 'WITHIN_TOLERANCE'
  | 'OVER'
  | 'SHORT'
  | 'RECOUNT_REQUIRED'
  | 'APPROVAL_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';
export type CashReconciliation = Readonly<{
  expectedAmountMinor: string;
  countedAmountMinor: string;
  varianceMinor: string;
  status: CashReconciliationStatus;
  severity: 'NONE' | 'LOW' | 'HIGH';
}>;
export type CashApproval = Readonly<{
  id: string;
  actionType: string;
  resourceId: string;
  requestedBy: string;
  requestedAt: string;
  requiredPermission: string;
  thresholdMinor?: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  decidedBy?: string;
  decidedAt?: string;
  decisionReason?: string;
  expiresAt: string;
  correlationId: string;
}>;
export type CashEvent = Readonly<{
  eventId: string;
  eventType: string;
  eventVersion: 1;
  occurredAt: string;
  tenantId: string;
  organizationId: string;
  branchId: string;
  aggregateId: string;
  aggregateVersion: number;
  registerId: string;
  sessionId?: string;
  correlationId: string;
  causationId?: string;
  actorId: string;
  payload: Readonly<Record<string, unknown>>;
}>;
