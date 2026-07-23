import { Prisma, type DatabaseClient } from '@nexo/database';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { DATABASE } from '../../infrastructure/infrastructure.module.js';
import type { SessionIdentity } from '../authentication/application/authentication.ports.js';
import { AuthorizationService } from '../authorization/application/authorization.service.js';
import type { AnalyticsQueryDto } from './analytics.dto.js';

type Scalar = bigint | number | string | null;
type Row = Record<string, Scalar>;

const exact = (value: Scalar | undefined) => String(value ?? 0);
const integer = (value: Scalar | undefined) => Number(value ?? 0);

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DATABASE) private readonly db: DatabaseClient,
    private readonly authorization: AuthorizationService,
  ) {}

  async overview(identity: SessionIdentity, tenantId: string, query: AnalyticsQueryDto) {
    await this.authorization.assert(
      identity,
      tenantId,
      'reports.read',
      { type: 'report', ...(query.branchId ? { branchId: query.branchId } : {}) },
      query.branchId,
    );
    const from = query.from ? new Date(`${query.from}T00:00:00.000Z`) : new Date(0);
    const to = query.to
      ? new Date(`${query.to}T00:00:00.000Z`)
      : new Date('9999-12-31T00:00:00.000Z');
    if (from >= to) throw new BadRequestException('from must be earlier than exclusive to');

    return this.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
      try {
        await tx.$queryRaw`SELECT now() AT TIME ZONE ${query.timezone}`;
      } catch {
        throw new BadRequestException('Unsupported timezone');
      }
      const branch = query.branchId
        ? Prisma.sql`AND s.branch_id = ${query.branchId}::uuid`
        : Prisma.empty;
      const inventoryBranch = query.branchId
        ? Prisma.sql`AND l.branch_id = ${query.branchId}::uuid`
        : Prisma.empty;

      const [
        financialRows,
        statusRows,
        paymentRows,
        attemptRows,
        cashRows,
        productRows,
        inventoryRows,
        seriesRows,
      ] = await Promise.all([
        tx.$queryRaw<Row[]>(Prisma.sql`
            WITH eligible AS (
              SELECT s.id,s.status,COALESCE(SUM(i.total_minor),0)::bigint total
              FROM sales s JOIN sale_items i ON i.tenant_id=s.tenant_id AND i.sale_id=s.id
              WHERE s.tenant_id=${tenantId}::uuid ${branch}
                AND s.status IN ('COMPLETED','PARTIALLY_REFUNDED','REFUNDED')
                AND s.completed_at >= ${from} AND s.completed_at < ${to}
              GROUP BY s.id,s.status
            ), refunds AS (
              SELECT COALESCE(SUM(r.amount_minor),0)::bigint total
              FROM refund_intents r JOIN eligible e ON e.id=r.sale_id
              WHERE r.status IN ('APPROVED','COMPLETED')
            )
            SELECT COALESCE(SUM(e.total),0)::bigint gross,
              (SELECT total FROM refunds)::bigint refunded,
              (COALESCE(SUM(e.total),0)-(SELECT total FROM refunds))::bigint net,
              COUNT(*)::bigint count,
              ROUND(COALESCE(AVG(e.total),0))::bigint average,
              ROUND(COALESCE(percentile_cont(0.5) WITHIN GROUP (ORDER BY e.total),0)::numeric)::bigint median,
              COALESCE(MAX(e.total),0)::bigint largest,COALESCE(MIN(e.total),0)::bigint smallest
            FROM eligible e`),
        tx.$queryRaw<Row[]>(Prisma.sql`
            SELECT status,COUNT(*)::bigint count FROM sales s
            WHERE s.tenant_id=${tenantId}::uuid ${branch}
              AND s.created_at >= ${from} AND s.created_at < ${to}
            GROUP BY status ORDER BY status`),
        tx.$queryRaw<Row[]>(Prisma.sql`
            WITH eligible AS (
              SELECT id FROM sales s WHERE s.tenant_id=${tenantId}::uuid ${branch}
                AND s.status IN ('COMPLETED','PARTIALLY_REFUNDED','REFUNDED')
                AND s.completed_at >= ${from} AND s.completed_at < ${to}
            )
            SELECT p.method,COUNT(*)::bigint count,COALESCE(SUM(p.amount_minor),0)::bigint total
            FROM sale_payments p JOIN eligible e ON e.id=p.sale_id
            WHERE p.tenant_id=${tenantId}::uuid AND p.status IN ('CAPTURED','REFUNDED')
            GROUP BY p.method ORDER BY p.method`),
        tx.$queryRaw<Row[]>(Prisma.sql`
            SELECT a.status,COUNT(*)::bigint count
            FROM payment_attempts a JOIN payment_intents p
              ON p.tenant_id=a.tenant_id AND p.id=a.payment_intent_id
            JOIN sales s ON s.tenant_id=p.tenant_id AND s.id=p.sale_id
            WHERE a.tenant_id=${tenantId}::uuid ${branch}
              AND a.created_at >= ${from} AND a.created_at < ${to}
            GROUP BY a.status ORDER BY a.status`),
        tx.$queryRaw<Row[]>(Prisma.sql`
            WITH ledger AS (
              SELECT COALESCE(SUM(CASE WHEN e.direction='IN' THEN e.amount_minor ELSE -e.amount_minor END),0)::bigint net
              FROM cash_ledger_entries e
              WHERE e.tenant_id=${tenantId}::uuid
                ${query.branchId ? Prisma.sql`AND e.branch_id=${query.branchId}::uuid` : Prisma.empty}
                AND e.occurred_at >= ${from} AND e.occurred_at < ${to}
            ), session_metrics AS (
              SELECT
                COALESCE(SUM(s.variance_minor) FILTER (WHERE s.closed_at IS NOT NULL),0)::bigint variance,
                COUNT(*) FILTER (WHERE s.status IN ('PENDING_OPEN','OPEN','SUSPENDED','COUNTING','RECONCILIATION_REQUIRED','PENDING_APPROVAL','REOPENED'))::bigint open_sessions
              FROM cash_sessions s
              WHERE s.tenant_id=${tenantId}::uuid
                ${query.branchId ? Prisma.sql`AND s.branch_id=${query.branchId}::uuid` : Prisma.empty}
            )
            SELECT ledger.net,session_metrics.variance,session_metrics.open_sessions
            FROM ledger CROSS JOIN session_metrics`),
        tx.$queryRaw<Row[]>(Prisma.sql`
            WITH refunded AS (
              SELECT rl.sale_item_id,COALESCE(SUM(rl.quantity),0)::numeric quantity,
                COALESCE(SUM(rl.amount_minor),0)::bigint amount
              FROM refund_lines rl JOIN refund_intents r
                ON r.tenant_id=rl.tenant_id AND r.id=rl.refund_intent_id
              WHERE rl.tenant_id=${tenantId}::uuid AND r.status IN ('APPROVED','COMPLETED')
              GROUP BY rl.sale_item_id
            )
            SELECT i.product_id::text product_id,i.product_variant_id::text variant_id,
              i.snapshot->>'productName' product_name,i.snapshot->>'variantName' variant_name,
              i.snapshot->>'sku' sku,SUM(i.quantity)::numeric quantity_sold,
              COALESCE(SUM(r.quantity),0)::numeric quantity_refunded,
              SUM(i.total_minor)::bigint gross,COALESCE(SUM(r.amount),0)::bigint refunded,
              (SUM(i.total_minor)-COALESCE(SUM(r.amount),0))::bigint net
            FROM sale_items i JOIN sales s ON s.tenant_id=i.tenant_id AND s.id=i.sale_id
            LEFT JOIN refunded r ON r.sale_item_id=i.id
            WHERE s.tenant_id=${tenantId}::uuid ${branch}
              AND s.status IN ('COMPLETED','PARTIALLY_REFUNDED','REFUNDED')
              AND s.completed_at >= ${from} AND s.completed_at < ${to}
            GROUP BY i.product_id,i.product_variant_id,i.snapshot->>'productName',
              i.snapshot->>'variantName',i.snapshot->>'sku'
            ORDER BY net DESC,product_name LIMIT ${query.limit}`),
        tx.$queryRaw<Row[]>(Prisma.sql`
            WITH balances AS (
              SELECT m.variant_id,m.location_id,
                COALESCE(SUM(m.quantity) FILTER (WHERE m.state='ON_HAND'),0)::numeric on_hand,
                COALESCE(SUM(m.quantity) FILTER (WHERE m.state='RESERVED'),0)::numeric reserved,
                COALESCE(SUM(m.quantity) FILTER (WHERE m.state='DAMAGED'),0)::numeric damaged,
                COALESCE(SUM(m.quantity) FILTER (WHERE m.state='QUARANTINE'),0)::numeric quarantine
              FROM inventory_movements m JOIN inventory_locations l
                ON l.tenant_id=m.tenant_id AND l.id=m.location_id
              WHERE m.tenant_id=${tenantId}::uuid ${inventoryBranch}
              GROUP BY m.variant_id,m.location_id
            ), value AS (
              SELECT COALESCE(SUM(c.remaining_quantity*c.unit_cost),0)::numeric amount
              FROM inventory_cost_layers c JOIN inventory_locations l
                ON l.tenant_id=c.tenant_id AND l.id=c.location_id
              WHERE c.tenant_id=${tenantId}::uuid ${inventoryBranch}
            )
            SELECT COALESCE(SUM(on_hand),0)::numeric on_hand,
              COALESCE(SUM(reserved),0)::numeric reserved,
              (COALESCE(SUM(on_hand),0)-COALESCE(SUM(reserved),0))::numeric available,
              COALESCE(SUM(damaged),0)::numeric damaged,
              COALESCE(SUM(quarantine),0)::numeric quarantine,
              COUNT(*) FILTER (WHERE on_hand<0)::bigint negative_balances,
              (SELECT amount FROM value)::numeric inventory_value
            FROM balances`),
        tx.$queryRaw<Row[]>(Prisma.sql`
            SELECT date_trunc(${query.interval},s.completed_at AT TIME ZONE ${query.timezone})::text bucket,
              COUNT(DISTINCT s.id)::bigint count,COALESCE(SUM(i.total_minor),0)::bigint gross
            FROM sales s JOIN sale_items i ON i.tenant_id=s.tenant_id AND i.sale_id=s.id
            WHERE s.tenant_id=${tenantId}::uuid ${branch}
              AND s.status IN ('COMPLETED','PARTIALLY_REFUNDED','REFUNDED')
              AND s.completed_at >= ${from} AND s.completed_at < ${to}
            GROUP BY bucket ORDER BY bucket`),
      ]);

      const financial = financialRows[0] ?? {};
      const inventory = inventoryRows[0] ?? {};
      const cash = cashRows[0] ?? {};
      const paymentTotal = paymentRows.reduce((sum, row) => sum + BigInt(exact(row.total)), 0n);
      return {
        scope: {
          tenantId,
          branchId: query.branchId ?? null,
          from: from.toISOString(),
          toExclusive: to.toISOString(),
          timezone: query.timezone,
          interval: query.interval,
        },
        revenue: {
          grossMinor: exact(financial.gross),
          refundedMinor: exact(financial.refunded),
          netMinor: exact(financial.net),
          collectedMinor: paymentTotal.toString(),
        },
        sales: {
          count: integer(financial.count),
          averageTicketMinor: exact(financial.average),
          medianTicketMinor: exact(financial.median),
          largestTicketMinor: exact(financial.largest),
          smallestTicketMinor: exact(financial.smallest),
          byStatus: statusRows.map((row) => ({
            status: String(row.status),
            count: integer(row.count),
          })),
        },
        payments: paymentRows.map((row) => ({
          method: String(row.method),
          count: integer(row.count),
          totalMinor: exact(row.total),
        })),
        paymentAttempts: attemptRows.map((row) => ({
          status: String(row.status),
          count: integer(row.count),
        })),
        cash: {
          netMinor: exact(cash.net),
          varianceMinor: exact(cash.variance),
          openSessions: integer(cash.open_sessions),
        },
        inventory: {
          current: exact(inventory.on_hand),
          reserved: exact(inventory.reserved),
          available: exact(inventory.available),
          damaged: exact(inventory.damaged),
          quarantine: exact(inventory.quarantine),
          negativeBalances: integer(inventory.negative_balances),
          fifoValue: exact(inventory.inventory_value),
        },
        products: productRows.map((row) => ({
          productId: row.product_id,
          variantId: row.variant_id,
          productName: row.product_name,
          variantName: row.variant_name,
          sku: row.sku,
          quantitySold: exact(row.quantity_sold),
          quantityRefunded: exact(row.quantity_refunded),
          grossMinor: exact(row.gross),
          refundedMinor: exact(row.refunded),
          netMinor: exact(row.net),
        })),
        timeSeries: seriesRows.map((row) => ({
          bucket: row.bucket,
          salesCount: integer(row.count),
          grossMinor: exact(row.gross),
        })),
      };
    });
  }
}
