import type { SaleStatus } from './types.js';

const transitions: Readonly<Record<SaleStatus, readonly SaleStatus[]>> = {
  DRAFT: ['OPEN', 'CANCELLED'],
  OPEN: ['SUSPENDED', 'CHECKOUT_PENDING', 'CANCELLED', 'EXPIRED'],
  SUSPENDED: ['OPEN', 'CANCELLED', 'EXPIRED'],
  CHECKOUT_PENDING: ['OPEN', 'PAYMENT_PENDING', 'FAILED', 'CANCELLED'],
  PAYMENT_PENDING: ['COMPLETED', 'FAILED', 'CANCELLED'],
  COMPLETED: ['PARTIALLY_REFUNDED', 'REFUNDED'],
  PARTIALLY_REFUNDED: ['PARTIALLY_REFUNDED', 'REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
  FAILED: ['OPEN', 'CANCELLED'],
  EXPIRED: [],
};

export function assertTransition(from: SaleStatus, to: SaleStatus): void {
  if (!transitions[from].includes(to)) throw new Error('SALE_INVALID_STATE');
}

export function allowedTransitions(status: SaleStatus): readonly SaleStatus[] {
  return transitions[status];
}
