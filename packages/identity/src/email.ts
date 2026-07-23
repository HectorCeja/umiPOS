export const emailIdentityStatuses = ['PENDING', 'VERIFIED', 'REVOKED'] as const;
export type EmailIdentityStatus = (typeof emailIdentityStatuses)[number];

export type EmailIdentity = Readonly<{
  id: string;
  userId: string;
  address: string;
  normalizedAddress: string;
  status: EmailIdentityStatus;
  primary: boolean;
  createdAt: Date;
  updatedAt: Date;
  verifiedAt?: Date;
  revokedAt?: Date;
}>;

export function normalizeEmailAddress(address: string): string {
  return address.trim().normalize('NFKC').toLocaleLowerCase('en-US');
}
