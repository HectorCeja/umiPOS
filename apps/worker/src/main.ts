import { parseServerEnvironment } from '@nexo/config';
import { createDatabaseClient } from '@nexo/database';
import { availability as calculateAvailability } from '@nexo/inventory';
import { startTelemetry } from '@nexo/observability';
import { pino } from 'pino';
import { randomUUID } from 'node:crypto';
import { rm, writeFile } from 'node:fs/promises';

import { foundationWorkerStatus } from './lifecycle.js';

const environment = parseServerEnvironment(process.env);
const logger = pino({ level: environment.LOG_LEVEL, redact: ['password', 'token', 'secret'] });
const telemetry = startTelemetry({
  enabled: !environment.OTEL_SDK_DISABLED,
  endpoint: environment.OTEL_EXPORTER_OTLP_ENDPOINT,
  serviceName: 'nexo-worker',
  serviceVersion: process.env.npm_package_version ?? '0.0.0',
});
const database = createDatabaseClient(process.env.DATABASE_URL ?? '');
const workerId = randomUUID();
const readinessFile = '/tmp/nexo-worker-ready';

const injectLocalTestFault = (point: string, eventId?: string) => {
  if (process.env.LOCAL_DEVELOPMENT !== 'true') return;
  if (process.env.NEXO_WORKER_TEST_FAULT !== point) return;
  const target = process.env.NEXO_WORKER_TEST_EVENT_ID;
  if (target && target !== eventId) return;
  logger.error({ event: 'worker.test_fault.injected', point, eventId });
  process.exit(86);
};

logger.info({ event: 'worker.started', ...foundationWorkerStatus() });

const expireReservations = async () => {
  const expired = await database.inventoryReservation.findMany({
    where: { status: 'ACTIVE', expiresAt: { lte: new Date() } },
    orderBy: { expiresAt: 'asc' },
    take: 50,
  });
  for (const reservation of expired) {
    await database.$transaction(async (transaction) => {
      // FORCE RLS remains authoritative for worker writes. The worker discovers
      // expired rows globally, then narrows every mutation transaction to the
      // owning tenant before claiming or emitting ledger/outbox records.
      await transaction.$executeRawUnsafe(
        "SELECT set_config('app.current_tenant_id', $1, true)",
        reservation.tenantId,
      );
      const claimed = await transaction.inventoryReservation.updateMany({
        where: {
          tenantId: reservation.tenantId,
          id: reservation.id,
          status: 'ACTIVE',
          expiresAt: { lte: new Date() },
        },
        data: { status: 'EXPIRED', releasedAt: new Date(), releaseReason: 'Reservation expired' },
      });
      if (claimed.count !== 1) return;
      const eventId = randomUUID();
      const movement = await transaction.inventoryMovement.create({
        data: {
          tenantId: reservation.tenantId,
          variantId: reservation.variantId,
          locationId: reservation.locationId,
          type: 'RESERVATION_RELEASE',
          state: 'RESERVED',
          quantity: reservation.quantity.negated(),
          correlationId: reservation.id,
          idempotencyKey: `reservation-expiry:${reservation.id}`,
          referenceType: 'RESERVATION',
          referenceId: reservation.id,
          reason: 'Reservation expired',
          occurredAt: new Date(),
          actorUserId: reservation.createdBy,
        },
      });
      const rows = await transaction.inventoryMovement.groupBy({
        by: ['state'],
        where: {
          tenantId: reservation.tenantId,
          variantId: reservation.variantId,
          locationId: reservation.locationId,
        },
        _sum: { quantity: true },
      });
      const value = (state: string) =>
        rows.find((row) => row.state === state)?._sum.quantity?.toString() ?? '0';
      await transaction.inventorySnapshot.create({
        data: {
          tenantId: reservation.tenantId,
          variantId: reservation.variantId,
          locationId: reservation.locationId,
          throughMovementId: movement.id,
          balances: calculateAvailability({
            onHand: value('ON_HAND'),
            reserved: value('RESERVED'),
            committed: value('COMMITTED'),
            inTransit: value('IN_TRANSIT'),
            damaged: value('DAMAGED'),
            quarantine: value('QUARANTINE'),
          }),
        },
      });
      const payload = { reservationId: reservation.id, reason: 'expired' };
      await transaction.inventoryEvent.create({
        data: {
          tenantId: reservation.tenantId,
          id: eventId,
          actorUserId: reservation.createdBy,
          aggregateType: 'InventoryReservation',
          aggregateId: reservation.id,
          eventType: 'ReservationReleased',
          payload,
        },
      });
      await transaction.inventoryOutbox.create({
        data: {
          tenantId: reservation.tenantId,
          aggregateType: 'InventoryReservation',
          aggregateId: reservation.id,
          eventType: 'ReservationReleased',
          payload,
        },
      });
      logger.info({
        event: 'inventory.reservation.expired',
        reservationId: reservation.id,
        tenantId: reservation.tenantId,
      });
    });
  }
};

const expireSuspendedSales = async () => {
  const expired = await database.saleRecord.findMany({
    where: { status: 'SUSPENDED', expiresAt: { lte: new Date() } },
    orderBy: { expiresAt: 'asc' },
    take: 50,
  });
  for (const sale of expired) {
    await database.$transaction(async (transaction) => {
      await transaction.$executeRawUnsafe(
        "SELECT set_config('app.current_tenant_id', $1, true)",
        sale.tenantId,
      );
      const claimed = await transaction.saleRecord.updateMany({
        where: {
          tenantId: sale.tenantId,
          id: sale.id,
          status: 'SUSPENDED',
          version: sale.version,
          expiresAt: { lte: new Date() },
        },
        data: { status: 'EXPIRED', version: { increment: 1 } },
      });
      if (claimed.count !== 1) return;
      const payload = { reason: 'Suspended sale expired' };
      await transaction.salesEventRecord.create({
        data: {
          tenantId: sale.tenantId,
          aggregateId: sale.id,
          aggregateVersion: sale.version + 1,
          eventType: 'SaleExpired',
          actorUserId: sale.sellerUserId,
          correlationId: sale.correlationId,
          payload,
        },
      });
      await transaction.salesOutboxRecord.create({
        data: {
          tenantId: sale.tenantId,
          aggregateId: sale.id,
          aggregateVersion: sale.version + 1,
          eventType: 'SaleExpired',
          correlationId: sale.correlationId,
          payload,
        },
      });
      logger.info({ event: 'sales.suspended.expired', saleId: sale.id });
    });
  }
};

const publish = async () => {
  await expireReservations();
  await expireSuspendedSales();
  const events = await database.productOutbox.findMany({
    where: { publishedAt: null },
    orderBy: { occurredAt: 'asc' },
    take: 50,
  });
  for (const event of events) {
    try {
      // Structured log is the first durable integration sink. Future projectors
      // consume the same at-least-once envelope and deduplicate by event.id.
      logger.info({ event: 'product.outbox.published', envelope: event });
      await database.productOutbox.update({
        where: { tenantId_id: { tenantId: event.tenantId, id: event.id } },
        data: { attempts: { increment: 1 }, publishedAt: new Date(), lastError: null },
      });
    } catch (error) {
      logger.error({ event: 'product.outbox.failed', id: event.id, error });
      await database.productOutbox.update({
        where: { tenantId_id: { tenantId: event.tenantId, id: event.id } },
        data: { attempts: { increment: 1 }, lastError: String(error).slice(0, 1000) },
      });
    }
  }
  const inventoryEvents = await database.inventoryOutbox.findMany({
    where: { publishedAt: null },
    orderBy: { occurredAt: 'asc' },
    take: 50,
  });
  for (const event of inventoryEvents) {
    try {
      logger.info({ event: 'inventory.outbox.published', envelope: event });
      await database.inventoryOutbox.update({
        where: { tenantId_id: { tenantId: event.tenantId, id: event.id } },
        data: { attempts: { increment: 1 }, publishedAt: new Date(), lastError: null },
      });
    } catch (error) {
      logger.error({ event: 'inventory.outbox.failed', id: event.id, error });
      await database.inventoryOutbox.update({
        where: { tenantId_id: { tenantId: event.tenantId, id: event.id } },
        data: { attempts: { increment: 1 }, lastError: String(error).slice(0, 1000) },
      });
    }
  }
  const salesEvents = await database.$queryRawUnsafe<
    readonly {
      id: string;
      tenantId: string;
      aggregateId: string;
      aggregateVersion: number;
      eventType: string;
      eventVersion: number;
      correlationId: string;
      causationId: string | null;
      payload: unknown;
      occurredAt: Date;
      attempts: number;
    }[]
  >(
    `WITH candidates AS (
       SELECT tenant_id,id FROM sales_outbox
       WHERE published_at IS NULL AND quarantined_at IS NULL
         AND next_attempt_at <= now()
         AND (claim_expires_at IS NULL OR claim_expires_at < now())
       ORDER BY occurred_at
       FOR UPDATE SKIP LOCKED LIMIT 50
     )
     UPDATE sales_outbox o
     SET claimed_at=now(),claimed_by=$1::uuid,claim_expires_at=now()+interval '30 seconds'
     FROM candidates c
     WHERE o.tenant_id=c.tenant_id AND o.id=c.id
     RETURNING o.id,o.tenant_id AS "tenantId",o.aggregate_id AS "aggregateId",
       o.aggregate_version AS "aggregateVersion",o.event_type AS "eventType",
       o.event_version AS "eventVersion",o.correlation_id AS "correlationId",
       o.causation_id AS "causationId",o.payload,o.occurred_at AS "occurredAt",o.attempts`,
    workerId,
  );
  for (const event of salesEvents) {
    try {
      logger.info({ event: 'sales.outbox.published', envelope: event });
      if (event.eventType === 'SaleCompleted') {
        const posted = await database.$queryRawUnsafe<readonly { posted: number }[]>(
          'SELECT app.post_completed_sale_cash_worker($1::uuid,$2::uuid,$3::uuid) AS posted',
          event.tenantId,
          event.aggregateId,
          event.id,
        );
        logger.info({
          event: 'cash.sales.posted',
          saleId: event.aggregateId,
          allocations: posted[0]?.posted ?? 0,
        });
      }
      if (event.eventType === 'RefundApproved') {
        if (event.eventVersion !== 1) throw new Error('CASH_REFUND_EVENT_VERSION_UNSUPPORTED');
        const payload =
          typeof event.payload === 'object' &&
          event.payload !== null &&
          !Array.isArray(event.payload)
            ? (event.payload as Record<string, unknown>)
            : {};
        if (typeof payload.refundIntentId === 'string') {
          const processed = await database.$queryRawUnsafe<
            readonly { result: { cashPosted: number; completed: number } }[]
          >(
            'SELECT app.process_approved_refund_worker($1::uuid,$2::uuid,$3::uuid) AS result',
            event.tenantId,
            payload.refundIntentId,
            event.id,
          );
          logger.info({
            event: 'cash.refund.posted',
            refundId: payload.refundIntentId,
            posted: processed[0]?.result.cashPosted ?? 0,
          });
          logger.info({
            event: 'refund.completed',
            refundId: payload.refundIntentId,
            completed: processed[0]?.result.completed ?? 0,
          });
        }
      }
      if (['SaleCompleted', 'SaleCancelled', 'SaleRefunded'].includes(event.eventType)) {
        const integration: Record<string, unknown> =
          typeof event.payload === 'object' &&
          event.payload !== null &&
          'metadata' in event.payload &&
          typeof event.payload.metadata === 'object' &&
          event.payload.metadata !== null &&
          'integration' in event.payload.metadata &&
          typeof event.payload.metadata.integration === 'object' &&
          event.payload.metadata.integration !== null &&
          !Array.isArray(event.payload.metadata.integration)
            ? (event.payload.metadata.integration as Record<string, unknown>)
            : {};
        logger.info({
          event: 'umi.sales.local_sink',
          envelope: {
            eventId: event.id,
            eventType:
              event.eventType === 'SaleCompleted'
                ? 'nexo.sale.completed'
                : event.eventType === 'SaleCancelled'
                  ? 'nexo.sale.cancelled'
                  : 'nexo.sale.refunded',
            eventVersion: 1,
            occurredAt: event.occurredAt,
            organizationId: event.tenantId,
            saleId: event.aggregateId,
            correlationId: event.correlationId,
            ...integration,
          },
        });
      }
      await database.$executeRawUnsafe(
        `UPDATE sales_outbox SET attempts=attempts+1,published_at=now(),last_error=NULL,
         error_code=NULL,first_attempt_at=COALESCE(first_attempt_at,now()),last_attempt_at=now(),
         claimed_at=NULL,claimed_by=NULL,claim_expires_at=NULL
         WHERE tenant_id=$1::uuid AND id=$2::uuid AND claimed_by=$3::uuid`,
        event.tenantId,
        event.id,
        workerId,
      );
    } catch (error) {
      logger.error({
        event: event.attempts + 1 >= 10 ? 'sales.outbox.quarantined' : 'sales.outbox.failed',
        id: event.id,
        attempt: event.attempts + 1,
        error,
      });
      await database.$executeRawUnsafe(
        `UPDATE sales_outbox SET attempts=attempts+1,last_error=$4,error_code=$5,
         first_attempt_at=COALESCE(first_attempt_at,now()),last_attempt_at=now(),
         quarantined_at=CASE WHEN attempts+1>=10 THEN now() ELSE quarantined_at END,
         next_attempt_at=now()+make_interval(secs => LEAST(300,POWER(2,LEAST(attempts+1,8))::integer)),
         claimed_at=NULL,claimed_by=NULL,claim_expires_at=NULL
         WHERE tenant_id=$1::uuid AND id=$2::uuid AND claimed_by=$3::uuid`,
        event.tenantId,
        event.id,
        workerId,
        String(error).replaceAll(/\s+/g, ' ').slice(0, 500),
        'SALES_EVENT_PROCESSING_FAILED',
      );
    }
  }
  const cashEvents = await database.$queryRawUnsafe<
    readonly {
      id: string;
      tenantId: string;
      organizationId: string;
      branchId: string;
      eventType: string;
      eventVersion: number;
      payload: unknown;
      occurredAt: Date;
      attempts: number;
    }[]
  >(
    `WITH candidates AS (
       SELECT tenant_id,id FROM cash_outbox
       WHERE published_at IS NULL AND quarantined_at IS NULL
         AND next_attempt_at <= now()
         AND (claim_expires_at IS NULL OR claim_expires_at < now())
       ORDER BY occurred_at
       FOR UPDATE SKIP LOCKED LIMIT 50
     )
     UPDATE cash_outbox o
     SET claimed_at=now(),claimed_by=$1::uuid,claim_expires_at=now()+interval '30 seconds'
     FROM candidates c
     WHERE o.tenant_id=c.tenant_id AND o.id=c.id
     RETURNING o.id,o.tenant_id AS "tenantId",o.organization_id AS "organizationId",
       o.branch_id AS "branchId",o.event_type AS "eventType",o.event_version AS "eventVersion",
       o.payload,o.occurred_at AS "occurredAt",o.attempts`,
    workerId,
  );
  const publicTypes: Readonly<Record<string, string>> = {
    CashSessionOpened: 'nexo.cash.session.opened',
    CashSessionClosed: 'nexo.cash.session.closed',
    CashSessionForceClosed: 'nexo.cash.session.force_closed',
    CashVarianceDetected: 'nexo.cash.variance.detected',
    CashWithdrawalRecorded: 'nexo.cash.withdrawal.recorded',
    CashDepositPrepared: 'nexo.cash.deposit.prepared',
    CashTransferCompleted: 'nexo.cash.transfer.completed',
  };
  if (cashEvents[0]) injectLocalTestFault('cash-after-claim', cashEvents[0].id);
  for (const event of cashEvents) {
    try {
      const publicType = publicTypes[event.eventType];
      if (publicType) {
        const source =
          typeof event.payload === 'object' &&
          event.payload !== null &&
          !Array.isArray(event.payload)
            ? (event.payload as Record<string, unknown>)
            : {};
        const allowlisted = Object.fromEntries(
          [
            'sessionId',
            'registerId',
            'businessDate',
            'currency',
            'openingAmountMinor',
            'expectedAmountMinor',
            'countedAmountMinor',
            'varianceMinor',
            'status',
            'withdrawalId',
            'depositId',
            'transferId',
            'amountMinor',
          ].flatMap((key) => (key in source ? [[key, source[key]]] : [])),
        );
        const envelope = {
          eventId: event.id,
          eventType: publicType,
          eventVersion: 1,
          occurredAt: event.occurredAt,
          organizationId: event.organizationId,
          branchId: event.branchId,
          ...allowlisted,
        };
        await database.$executeRawUnsafe(
          `INSERT INTO cash_public_event_deliveries(tenant_id,event_id,event_type,event_version,payload) VALUES($1::uuid,$2::uuid,$3,1,$4::jsonb) ON CONFLICT DO NOTHING`,
          event.tenantId,
          event.id,
          publicType,
          JSON.stringify(envelope),
        );
        logger.info({ event: 'umi.cash.local_sink', envelope });
      }
      injectLocalTestFault('cash-after-publish', event.id);
      await database.$executeRawUnsafe(
        `UPDATE cash_outbox SET published_at=now(),attempts=attempts+1,last_error=NULL,error_code=NULL,
         first_attempt_at=COALESCE(first_attempt_at,now()),last_attempt_at=now(),
         claimed_at=NULL,claimed_by=NULL,claim_expires_at=NULL
         WHERE tenant_id=$1::uuid AND id=$2::uuid AND claimed_by=$3::uuid`,
        event.tenantId,
        event.id,
        workerId,
      );
    } catch (error) {
      logger.error({
        event: event.attempts + 1 >= 10 ? 'cash.outbox.quarantined' : 'cash.outbox.failed',
        id: event.id,
        attempt: event.attempts + 1,
        error,
      });
      await database.$executeRawUnsafe(
        `UPDATE cash_outbox SET attempts=attempts+1,last_error=$4,error_code=$5,
         first_attempt_at=COALESCE(first_attempt_at,now()),last_attempt_at=now(),
         quarantined_at=CASE WHEN attempts+1>=10 THEN now() ELSE quarantined_at END,
         next_attempt_at=now()+make_interval(secs => LEAST(300,POWER(2,LEAST(attempts+1,8))::integer)),
         claimed_at=NULL,claimed_by=NULL,claim_expires_at=NULL
         WHERE tenant_id=$1::uuid AND id=$2::uuid AND claimed_by=$3::uuid`,
        event.tenantId,
        event.id,
        workerId,
        String(error).replaceAll(/\s+/g, ' ').slice(0, 500),
        'CASH_EVENT_PROCESSING_FAILED',
      );
    }
  }
};
let cycleRunning = false;
const runCycle = () => {
  if (cycleRunning) return;
  cycleRunning = true;
  void publish()
    .then(() => writeFile(readinessFile, new Date().toISOString(), { encoding: 'utf8' }))
    .catch((error: unknown) => {
      logger.error({ event: 'worker.cycle.failed', error });
    })
    .finally(() => {
      cycleRunning = false;
    });
};
const pollIntervalMs = Number(process.env.WORKER_POLL_INTERVAL_MS ?? '500');
const lifecycleHandle = setInterval(runCycle, pollIntervalMs);
runCycle();

const shutdown = async () => {
  logger.info({ event: 'worker.stopping' });
  clearInterval(lifecycleHandle);
  await rm(readinessFile, { force: true });
  await database.$disconnect();
  await telemetry.shutdown();
};
process.once('SIGTERM', () => void shutdown());
process.once('SIGINT', () => void shutdown());
