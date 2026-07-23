import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/client/client.js';
import type { Prisma as PrismaTypes } from './generated/client/client.js';

export { Prisma } from './generated/client/client.js';

export type DatabaseClient = PrismaClient;
export type DatabaseTransaction = PrismaTypes.TransactionClient;

export function createDatabaseClient(databaseUrl: string): DatabaseClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
}

/**
 * Runs all tenant-owned work in one transaction and sets a transaction-local
 * PostgreSQL context. The value cannot leak through a pooled connection.
 */
export async function withTenantTransaction<T>(
  database: DatabaseClient,
  tenantId: string,
  operation: (transaction: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  return database.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
    return operation(transaction);
  });
}

/** Runs identity-owned work with a transaction-local user context for RLS. */
export async function withUserTransaction<T>(
  database: DatabaseClient,
  userId: string,
  operation: (transaction: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  return database.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
    return operation(transaction);
  });
}
