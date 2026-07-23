export const userStatuses = [
  'PENDING_VERIFICATION',
  'ACTIVE',
  'LOCKED',
  'SUSPENDED',
  'DISABLED',
  'DELETED',
  'EXPIRED',
] as const;

export type UserStatus = (typeof userStatuses)[number];

export type JsonObject = Readonly<Record<string, unknown>>;

export type User = Readonly<{
  id: string;
  status: UserStatus;
  givenName: string;
  familyName: string;
  displayName: string;
  avatarUrl?: string;
  locale: string;
  timeZone: string;
  regionalFormat: string;
  preferences: JsonObject;
  metadata: JsonObject;
  featureOverrides: JsonObject;
  createdAt: Date;
  updatedAt: Date;
  statusChangedAt: Date;
  lastAccessedAt?: Date;
  deletedAt?: Date;
}>;

const transitions = {
  PENDING_VERIFICATION: ['ACTIVE', 'SUSPENDED', 'DISABLED', 'DELETED', 'EXPIRED'],
  ACTIVE: ['LOCKED', 'SUSPENDED', 'DISABLED', 'DELETED', 'EXPIRED'],
  LOCKED: ['ACTIVE', 'SUSPENDED', 'DISABLED', 'DELETED', 'EXPIRED'],
  SUSPENDED: ['ACTIVE', 'DISABLED', 'DELETED', 'EXPIRED'],
  DISABLED: ['ACTIVE', 'DELETED'],
  EXPIRED: ['ACTIVE', 'DISABLED', 'DELETED'],
  DELETED: [],
} as const satisfies Readonly<Record<UserStatus, readonly UserStatus[]>>;

export class InvalidUserTransitionError extends Error {
  constructor(from: UserStatus, to: UserStatus) {
    super(`Invalid user status transition: ${from} -> ${to}`);
    this.name = 'InvalidUserTransitionError';
  }
}

export function canTransitionUser(from: UserStatus, to: UserStatus): boolean {
  return (transitions[from] as readonly UserStatus[]).includes(to);
}

export function transitionUser(user: User, target: UserStatus, changedAt: Date): User {
  if (!canTransitionUser(user.status, target)) {
    throw new InvalidUserTransitionError(user.status, target);
  }
  return Object.freeze({
    ...user,
    status: target,
    statusChangedAt: changedAt,
    updatedAt: changedAt,
    ...(target === 'DELETED' ? { deletedAt: changedAt } : {}),
  });
}
