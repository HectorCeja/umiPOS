import {
  countDenominations,
  defaultCashPolicy,
  reconcileCash,
  resolveCashPolicy,
  type CashApproval,
  type CashLedgerEntry,
  type CashPolicyOverride,
  type CashSessionSnapshot,
} from '@nexo/cash';
import type { DatabaseClient, DatabaseTransaction } from '@nexo/database';
import { withTenantTransaction } from '@nexo/database';
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { DATABASE } from '../../../infrastructure/infrastructure.module.js';
import { assertTransactionalAuthorization } from '../../authorization/infrastructure/transactional-authorization.js';
import type { CashRepository } from '../application/cash.ports.js';
interface SessionRow {
  id: string;
  tenant_id: string;
  organization_id: string;
  branch_id: string;
  register_id: string;
  drawer_id: string | null;
  opened_by_user_id: string;
  opened_by_membership_id: string;
  assigned_cashier_id: string;
  currency: string;
  business_date: Date;
  opened_at: Date | null;
  closed_at: Date | null;
  suspended_at: Date | null;
  reopened_at: Date | null;
  opening_float_minor: bigint;
  expected_amount_minor: bigint;
  counted_amount_minor: bigint | null;
  variance_minor: bigint | null;
  status: CashSessionSnapshot['status'];
  version: number;
  correlation_id: string;
  notes: string | null;
}

function isUniqueViolation(error: unknown) {
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as { code?: unknown; meta?: unknown; message?: unknown };
  return (
    candidate.code === 'P2002' ||
    (candidate.code === 'P2010' && JSON.stringify(candidate.meta).includes('23505')) ||
    (typeof candidate.message === 'string' && candidate.message.includes('23505'))
  );
}
interface HandoffRow {
  id: string;
  tenant_id: string;
  organization_id: string;
  branch_id: string;
  session_id: string;
  outgoing_cashier_id: string;
  incoming_cashier_id: string;
  outgoing_membership_id: string | null;
  incoming_membership_id: string | null;
  expected_amount_minor: bigint;
  counted_amount_minor: bigint | null;
  variance_minor: bigint | null;
  denominations: unknown;
  status: string;
  reason: string;
  notes: string | null;
  requested_by: string;
  accepted_by: string | null;
  approval_id: string | null;
  correlation_id: string;
  version: number;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}
const snapshot = (r: SessionRow): CashSessionSnapshot => ({
  id: r.id,
  tenantId: r.tenant_id,
  organizationId: r.organization_id,
  branchId: r.branch_id,
  registerId: r.register_id,
  ...(r.drawer_id ? { drawerId: r.drawer_id } : {}),
  openedByUserId: r.opened_by_user_id,
  openedByMembershipId: r.opened_by_membership_id,
  assignedCashierId: r.assigned_cashier_id,
  currency: r.currency,
  businessDate: r.business_date.toISOString().slice(0, 10),
  ...(r.opened_at ? { openedAt: r.opened_at.toISOString() } : {}),
  ...(r.closed_at ? { closedAt: r.closed_at.toISOString() } : {}),
  ...(r.suspended_at ? { suspendedAt: r.suspended_at.toISOString() } : {}),
  ...(r.reopened_at ? { reopenedAt: r.reopened_at.toISOString() } : {}),
  openingFloatMinor: r.opening_float_minor.toString(),
  expectedAmountMinor: r.expected_amount_minor.toString(),
  ...(r.counted_amount_minor === null
    ? {}
    : { countedAmountMinor: r.counted_amount_minor.toString() }),
  ...(r.variance_minor === null ? {} : { varianceMinor: r.variance_minor.toString() }),
  status: r.status,
  version: r.version,
  correlationId: r.correlation_id,
  ...(r.notes ? { notes: r.notes } : {}),
});
@Injectable()
export class PrismaCashRepository implements CashRepository {
  constructor(@Inject(DATABASE) private readonly db: DatabaseClient) {}
  createRegister(t: string, a: string, i: Parameters<CashRepository['createRegister']>[2]) {
    return this.tx(t, a, 'cash.register.manage', i.branchId, async (x) => {
      try {
        const id = randomUUID();
        const rows = await x.$queryRaw<
          unknown[]
        >`INSERT INTO cash_registers(tenant_id,organization_id,branch_id,id,name,code,default_currency,default_opening_float_minor) VALUES(${t}::uuid,${t}::uuid,${i.branchId}::uuid,${id}::uuid,${i.name},${i.code},${i.currency},${i.openingFloatMinor ? BigInt(i.openingFloatMinor) : null}) RETURNING *`;
        return rows[0] as never;
      } catch (error) {
        if (isUniqueViolation(error))
          throw new ConflictException('CASH_REGISTER_CODE_ALREADY_EXISTS');
        throw error;
      }
    });
  }
  updateRegister(
    t: string,
    a: string,
    id: string,
    i: Parameters<CashRepository['updateRegister']>[3],
  ) {
    return withTenantTransaction(this.db, t, async (x) => {
      const current = await x.$queryRaw<
        { branch_id: string }[]
      >`SELECT branch_id FROM cash_registers WHERE tenant_id=${t}::uuid AND id=${id}::uuid FOR UPDATE`;
      const row = current.at(0);
      if (!row) throw new NotFoundException('CASH_REGISTER_NOT_FOUND');
      await assertTransactionalAuthorization(x, {
        userId: a,
        tenantId: t,
        permission: 'cash.register.manage',
        resource: { id, type: 'cash_register', branchId: row.branch_id },
      });
      const changed = await x.$queryRaw<
        unknown[]
      >`UPDATE cash_registers SET name=${i.name},status=${i.status},version=version+1,archived_at=CASE WHEN ${i.status}='ARCHIVED' THEN now() ELSE NULL END,updated_at=now() WHERE tenant_id=${t}::uuid AND id=${id}::uuid AND version=${i.version} RETURNING id,branch_id AS "branchId",name,code,status,default_currency AS currency,default_opening_float_minor::text AS "openingFloatMinor",version`;
      if (!changed[0]) throw new ConflictException('CASH_REGISTER_VERSION_CONFLICT');
      return changed[0];
    });
  }
  createDrawer(t: string, a: string, i: Parameters<CashRepository['createDrawer']>[2]) {
    return this.tx(t, a, 'cash.drawer.manage', i.branchId, async (x) => {
      try {
        const id = randomUUID();
        const rows = await x.$queryRaw<
          unknown[]
        >`INSERT INTO cash_drawers(tenant_id,organization_id,branch_id,id,name,code,register_id,status) VALUES(${t}::uuid,${t}::uuid,${i.branchId}::uuid,${id}::uuid,${i.name},${i.code},${i.registerId ?? null}::uuid,${i.registerId ? 'ASSIGNED' : 'AVAILABLE'}) RETURNING *`;
        return rows[0];
      } catch (error) {
        if (isUniqueViolation(error))
          throw new ConflictException('CASH_DRAWER_CODE_ALREADY_EXISTS');
        throw error;
      }
    });
  }
  updateDrawer(t: string, a: string, id: string, i: Parameters<CashRepository['updateDrawer']>[3]) {
    return withTenantTransaction(this.db, t, async (x) => {
      const current = await x.$queryRaw<
        { branch_id: string }[]
      >`SELECT branch_id FROM cash_drawers WHERE tenant_id=${t}::uuid AND id=${id}::uuid FOR UPDATE`;
      const row = current.at(0);
      if (!row) throw new NotFoundException('CASH_DRAWER_NOT_FOUND');
      await assertTransactionalAuthorization(x, {
        userId: a,
        tenantId: t,
        permission: 'cash.drawer.manage',
        resource: { id, type: 'cash_drawer', branchId: row.branch_id },
      });
      const changed = await x.$queryRaw<
        unknown[]
      >`UPDATE cash_drawers SET name=${i.name},status=${i.status},register_id=${i.registerId ?? null}::uuid,version=version+1,updated_at=now() WHERE tenant_id=${t}::uuid AND id=${id}::uuid AND version=${i.version} RETURNING id,branch_id AS "branchId",name,code,status,register_id AS "registerId",version`;
      if (!changed[0]) throw new ConflictException('CASH_DRAWER_VERSION_CONFLICT');
      return changed[0];
    });
  }
  open(t: string, a: string, m: string, i: Parameters<CashRepository['open']>[3]) {
    return this.tx(t, a, 'cash.session.open', i.branchId, async (x) =>
      this.idem(x, t, 'session.open', i.idempotencyKey, i, async () => {
        const existing = await x.$queryRaw<SessionRow[]>`SELECT * FROM cash_sessions
        WHERE tenant_id=${t}::uuid AND register_id=${i.registerId}::uuid
          AND status IN('PENDING_OPEN','OPEN','SUSPENDED','COUNTING','RECONCILIATION_REQUIRED','PENDING_APPROVAL','REOPENED')
        FOR UPDATE`;
        if (existing[0]) throw new ConflictException('CASH_SESSION_ALREADY_OPEN');
        const id = randomUUID(),
          now = new Date();
        try {
          const rows = await x.$queryRaw<
            SessionRow[]
          >`INSERT INTO cash_sessions(tenant_id,organization_id,branch_id,id,register_id,drawer_id,opened_by_user_id,opened_by_membership_id,assigned_cashier_id,currency,business_date,status,opening_float_minor,expected_amount_minor,opened_at,correlation_id) VALUES(${t}::uuid,${t}::uuid,${i.branchId}::uuid,${id}::uuid,${i.registerId}::uuid,${i.drawerId ?? null}::uuid,${a}::uuid,${m}::uuid,${a}::uuid,${i.currency},${i.businessDate}::date,'OPEN',${BigInt(i.openingFloatMinor)},0,${now},${i.correlationId}::uuid) RETURNING *`;
          const created = rows.at(0);
          if (created === undefined) throw new ConflictException('CASH_SESSION_ALREADY_OPEN');
          await this.ledger(x, t, a, m, created, {
            type: 'OPENING_FLOAT',
            amountMinor: i.openingFloatMinor,
            currency: i.currency,
            reason: 'Opening float',
            idempotencyKey: i.idempotencyKey,
            correlationId: i.correlationId,
            sourceType: 'SESSION_OPEN',
            sourceId: id,
          });
          await this.event(x, t, a, created, 'CashSessionOpened', {
            openingAmountMinor: i.openingFloatMinor,
          });
          return snapshot(await this.session(x, t, id, false));
        } catch (error) {
          throw new ConflictException('CASH_SESSION_ALREADY_OPEN', { cause: error });
        }
      }),
    );
  }
  movement(
    t: string,
    a: string,
    m: string,
    id: string,
    i: Parameters<CashRepository['movement']>[4],
  ) {
    const permission =
      i.type === 'WITHDRAWAL'
        ? 'cash.withdraw'
        : i.type === 'DEPOSIT'
          ? 'cash.deposit'
          : 'cash.movement.create';
    return this.sessionTx(t, a, id, permission, async (x) => {
      return this.idem(x, t, 'movement.record', i.idempotencyKey, { id, ...i }, async () => {
        const session = await this.session(x, t, id, true);
        if (!['OPEN', 'REOPENED'].includes(session.status))
          throw new ConflictException('CASH_SESSION_NOT_OPEN');
        if (session.currency !== i.currency) throw new ConflictException('CASH_CURRENCY_MISMATCH');
        return this.ledger(x, t, a, m, session, i);
      });
    });
  }
  count(t: string, a: string, id: string, i: Parameters<CashRepository['count']>[3]) {
    return this.sessionTx(t, a, id, 'cash.count', async (x) =>
      this.idem(x, t, 'session.count', i.idempotencyKey, { id, ...i }, async () => {
        const session = await this.session(x, t, id, true);
        const total = i.denominations ? countDenominations(i.denominations) : i.totalMinor;
        if (total === undefined) throw new ConflictException('CASH_COUNT_INVALID');
        const n = await x.$queryRaw<
          { next: number }[]
        >`SELECT COALESCE(MAX(sequence),0)+1 AS next FROM cash_counts WHERE tenant_id=${t}::uuid AND session_id=${id}::uuid`;
        const countId = randomUUID();
        await x.$executeRaw`INSERT INTO cash_counts(tenant_id,organization_id,branch_id,id,session_id,currency,kind,counted_amount_minor,sequence,actor_id) VALUES(${t}::uuid,${t}::uuid,${session.branch_id}::uuid,${countId}::uuid,${id}::uuid,${i.currency},${i.denominations ? 'DENOMINATION' : 'TOTAL'},${BigInt(total)},${n[0]?.next ?? 1},${a}::uuid)`;
        for (const d of i.denominations ?? [])
          await x.$executeRaw`INSERT INTO cash_count_denominations(tenant_id,count_id,denomination_minor,quantity) VALUES(${t}::uuid,${countId}::uuid,${BigInt(d.denominationMinor)},${d.quantity})`;
        await x.$executeRaw`UPDATE cash_sessions SET status='COUNTING',counted_amount_minor=${BigInt(total)},version=version+1,updated_at=now() WHERE tenant_id=${t}::uuid AND id=${id}::uuid`;
        return { id: countId, countedAmountMinor: total, sequence: n[0]?.next ?? 1 };
      }),
    );
  }
  reconcile(t: string, a: string, id: string, key: string) {
    return this.sessionTx(t, a, id, 'cash.reconcile', async (x) => {
      return this.idem(x, t, 'session.reconcile', key, { sessionId: id }, async () => {
        const s = await this.session(x, t, id, true);
        if (s.counted_amount_minor === null) throw new ConflictException('CASH_COUNT_REQUIRED');
        const policy = await this.policyIn(x, t, s.branch_id, s.register_id);
        const result = reconcileCash(
          s.expected_amount_minor.toString(),
          s.counted_amount_minor.toString(),
          policy,
        );
        await x.$executeRaw`INSERT INTO cash_reconciliations(tenant_id,organization_id,branch_id,id,session_id,expected_amount_minor,counted_amount_minor,variance_minor,status,severity,actor_id) VALUES(${t}::uuid,${t}::uuid,${s.branch_id}::uuid,${randomUUID()}::uuid,${id}::uuid,${BigInt(result.expectedAmountMinor)},${BigInt(result.countedAmountMinor)},${BigInt(result.varianceMinor)},${result.status},${result.severity},${a}::uuid)`;
        await x.$executeRaw`UPDATE cash_sessions SET expected_amount_minor=${BigInt(result.expectedAmountMinor)},variance_minor=${BigInt(result.varianceMinor)},status=${result.status === 'APPROVAL_REQUIRED' ? 'PENDING_APPROVAL' : 'COUNTING'},version=version+1,updated_at=now() WHERE tenant_id=${t}::uuid AND id=${id}::uuid`;
        return result;
      });
    });
  }
  close(t: string, a: string, id: string, i: Parameters<CashRepository['close']>[3]) {
    return this.sessionTx(
      t,
      a,
      id,
      i.force ? 'cash.session.force_close' : 'cash.session.close',
      async (x) => {
        return this.idem(x, t, 'session.close', i.idempotencyKey, { id, ...i }, async () => {
          const s = await this.session(x, t, id, true);
          if (s.version !== i.version) throw new ConflictException('CASH_SESSION_VERSION_CONFLICT');
          if (!i.force && s.counted_amount_minor === null)
            throw new ConflictException('CASH_COUNT_REQUIRED');
          if (!i.force) {
            const pending = await x.$queryRaw<{ count: bigint }[]>`
              SELECT COUNT(*)::bigint AS count
              FROM sales_outbox o
              JOIN sales sale
                ON sale.tenant_id=o.tenant_id AND sale.id=o.aggregate_id
              JOIN payment_intents intent
                ON intent.tenant_id=sale.tenant_id AND intent.sale_id=sale.id
              JOIN payment_attempts attempt
                ON attempt.tenant_id=intent.tenant_id
               AND attempt.payment_intent_id=intent.id
              WHERE o.tenant_id=${t}::uuid
                AND o.event_type='SaleCompleted'
                AND o.published_at IS NULL
                AND o.quarantined_at IS NULL
                AND sale.register_id=${s.register_id}::uuid
                AND sale.completed_at >= ${s.opened_at}
                AND attempt.method='CASH'
                AND attempt.status='CAPTURED'`;
            if ((pending.at(0)?.count ?? 0n) > 0n)
              throw new ConflictException('CASH_FINANCIAL_POSTING_PENDING');
          }
          const status = i.force ? 'FORCE_CLOSED' : 'CLOSED';
          const rows = await x.$queryRaw<
            SessionRow[]
          >`UPDATE cash_sessions SET status=${status},closed_at=now(),version=version+1,notes=COALESCE(${i.reason ?? null},notes),updated_at=now() WHERE tenant_id=${t}::uuid AND id=${id}::uuid RETURNING *`;
          const closed = rows.at(0);
          if (closed === undefined) throw new NotFoundException('CASH_SESSION_NOT_FOUND');
          await this.event(
            x,
            t,
            a,
            closed,
            i.force ? 'CashSessionForceClosed' : 'CashSessionClosed',
            {
              expectedAmountMinor: s.expected_amount_minor.toString(),
              countedAmountMinor: s.counted_amount_minor?.toString(),
            },
          );
          return snapshot(closed);
        });
      },
    );
  }
  get(t: string, id: string) {
    return withTenantTransaction(this.db, t, async (x) =>
      snapshot(await this.session(x, t, id, false)),
    );
  }
  active(t: string, b: string) {
    return withTenantTransaction(this.db, t, async (x) => {
      const rows = await x.$queryRaw<
        SessionRow[]
      >`SELECT * FROM cash_sessions WHERE tenant_id=${t}::uuid AND branch_id=${b}::uuid AND status IN('OPEN','SUSPENDED','COUNTING','RECONCILIATION_REQUIRED','PENDING_APPROVAL','REOPENED') ORDER BY opened_at DESC LIMIT 1`;
      return rows[0] ? snapshot(rows[0]) : null;
    });
  }
  timeline(t: string, id: string) {
    return withTenantTransaction(
      this.db,
      t,
      (x) =>
        x.$queryRaw<
          CashLedgerEntry[]
        >`SELECT id,tenant_id AS "tenantId",organization_id AS "organizationId",branch_id AS "branchId",session_id AS "sessionId",register_id AS "registerId",drawer_id AS "drawerId",currency,direction,movement_type AS "movementType",amount_minor::text AS "amountMinor",source_type AS "sourceType",source_id AS "sourceId",sale_id AS "saleId",payment_allocation_id AS "paymentAllocationId",reference,reason,actor_id AS "actorId",membership_id AS "membershipId",approved_by AS "approvedBy",occurred_at AS "occurredAt",business_date AS "businessDate",idempotency_key AS "idempotencyKey",correlation_id AS "correlationId",causation_id AS "causationId",metadata,created_at AS "createdAt" FROM cash_ledger_entries WHERE tenant_id=${t}::uuid AND session_id=${id}::uuid ORDER BY occurred_at,id LIMIT 500`,
    );
  }
  summary(t: string, id: string) {
    return withTenantTransaction(this.db, t, async (x) => {
      const s = await this.session(x, t, id, false);
      const totals = await x.$queryRaw<
        { movement_type: string; amount: bigint }[]
      >`SELECT movement_type,SUM(CASE WHEN direction='IN' THEN amount_minor ELSE -amount_minor END) amount FROM cash_ledger_entries WHERE tenant_id=${t}::uuid AND session_id=${id}::uuid GROUP BY movement_type`;
      return {
        session: snapshot(s),
        expectedAmountMinor: s.expected_amount_minor.toString(),
        countedAmountMinor: s.counted_amount_minor?.toString(),
        varianceMinor: s.variance_minor?.toString(),
        movements: Object.fromEntries(totals.map((r) => [r.movement_type, r.amount.toString()])),
      };
    });
  }
  transition(t: string, a: string, id: string, i: Parameters<CashRepository['transition']>[3]) {
    return this.sessionTx(
      t,
      a,
      id,
      i.to === 'SUSPENDED' ? 'cash.session.suspend' : 'cash.session.resume',
      async (x) =>
        this.idem(x, t, `session:${i.to}`, i.idempotencyKey, i, async () => {
          const s = await this.session(x, t, id, true);
          const expected = i.to === 'SUSPENDED' ? 'OPEN' : 'SUSPENDED';
          if (s.status !== expected) throw new ConflictException('CASH_SESSION_INVALID_STATE');
          if (s.version !== i.version) throw new ConflictException('CASH_SESSION_VERSION_CONFLICT');
          const rows = await x.$queryRaw<
            SessionRow[]
          >`UPDATE cash_sessions SET status=${i.to},version=version+1,notes=${i.reason},suspended_at=${i.to === 'SUSPENDED' ? new Date() : null},updated_at=now() WHERE tenant_id=${t}::uuid AND id=${id}::uuid RETURNING *`;
          const changed = rows.at(0);
          if (changed === undefined) throw new NotFoundException('CASH_SESSION_NOT_FOUND');
          await this.event(
            x,
            t,
            a,
            changed,
            i.to === 'SUSPENDED' ? 'CashSessionSuspended' : 'CashSessionResumed',
            { reason: i.reason },
          );
          return snapshot(changed);
        }),
    );
  }
  policy(t: string, b?: string, r?: string) {
    return withTenantTransaction(this.db, t, async (x) => this.policyIn(x, t, b, r));
  }
  savePolicy(t: string, a: string, i: Parameters<CashRepository['savePolicy']>[2]) {
    return this.tx(t, a, 'cash.register.manage', i.branchId, async (x) =>
      this.idem(x, t, 'policy.save', i.idempotencyKey, i, async () => {
        const existing = await x.$queryRaw<
          { id: string }[]
        >`SELECT id FROM cash_policies WHERE tenant_id=${t}::uuid AND branch_id IS NOT DISTINCT FROM ${i.branchId ?? null}::uuid AND register_id IS NOT DISTINCT FROM ${i.registerId ?? null}::uuid FOR UPDATE`;
        const body = JSON.stringify(i.configuration);
        if (existing[0])
          await x.$executeRaw`UPDATE cash_policies SET configuration=${body}::jsonb,version=version+1,updated_at=now() WHERE tenant_id=${t}::uuid AND id=${existing[0].id}::uuid`;
        else
          await x.$executeRaw`INSERT INTO cash_policies(tenant_id,organization_id,branch_id,register_id,configuration) VALUES(${t}::uuid,${t}::uuid,${i.branchId ?? null}::uuid,${i.registerId ?? null}::uuid,${body}::jsonb)`;
        return this.policyIn(x, t, i.branchId, i.registerId);
      }),
    );
  }
  requestApproval(t: string, a: string, i: Parameters<CashRepository['requestApproval']>[2]) {
    return this.tx(t, a, 'cash.movement.create', i.branchId, async (x) =>
      this.idem(x, t, 'approval.request', i.idempotencyKey, i, async () => {
        const id = randomUUID();
        const rows = await x.$queryRaw<
          CashApproval[]
        >`INSERT INTO cash_approvals(tenant_id,organization_id,branch_id,id,action_type,resource_id,requested_by,requested_at,required_permission,threshold_minor,reason,status,expires_at,correlation_id) VALUES(${t}::uuid,${t}::uuid,${i.branchId}::uuid,${id}::uuid,${i.actionType},${i.resourceId}::uuid,${a}::uuid,now(),${i.requiredPermission},${i.thresholdMinor ? BigInt(i.thresholdMinor) : null},${i.reason},'PENDING',${new Date(i.expiresAt)},${i.correlationId}::uuid) RETURNING id,action_type AS "actionType",resource_id AS "resourceId",requested_by AS "requestedBy",requested_at AS "requestedAt",required_permission AS "requiredPermission",threshold_minor::text AS "thresholdMinor",reason,status,expires_at AS "expiresAt",correlation_id AS "correlationId"`;
        await this.simpleEvent(x, t, i.branchId, a, id, 'CashApprovalRequested', {
          actionType: i.actionType,
        });
        const created = rows.at(0);
        if (created === undefined) throw new ConflictException('CASH_APPROVAL_NOT_FOUND');
        return created;
      }),
    );
  }
  async decideApproval(
    t: string,
    a: string,
    id: string,
    i: Parameters<CashRepository['decideApproval']>[3],
  ) {
    const branchId = await withTenantTransaction(this.db, t, async (x) => {
      const rows = await x.$queryRaw<
        { branch_id: string }[]
      >`SELECT branch_id FROM cash_approvals WHERE tenant_id=${t}::uuid AND id=${id}::uuid`;
      const row = rows.at(0);
      if (!row) throw new NotFoundException('CASH_APPROVAL_NOT_FOUND');
      return row.branch_id;
    });
    return this.tx(
      t,
      a,
      i.decision === 'CANCELLED' ? 'cash.movement.create' : 'cash.approve',
      branchId,
      async (x) =>
        this.idem(x, t, 'approval.decide', i.idempotencyKey, { id, ...i }, async () => {
          const current = await x.$queryRaw<
            {
              requested_by: string;
              status: string;
              expires_at: Date;
              version: number;
              branch_id: string;
            }[]
          >`SELECT requested_by,status,expires_at,version,branch_id FROM cash_approvals WHERE tenant_id=${t}::uuid AND id=${id}::uuid FOR UPDATE`;
          const row = current.at(0);
          if (row === undefined) throw new NotFoundException('CASH_APPROVAL_NOT_FOUND');
          if (row.status !== 'PENDING' || row.expires_at <= new Date())
            throw new ConflictException('CASH_APPROVAL_EXPIRED');
          const p = await this.policyIn(x, t, row.branch_id);
          if (!p.selfApprovalAllowed && row.requested_by === a)
            throw new ConflictException('CASH_APPROVAL_DENIED');
          if (row.version !== i.version)
            throw new ConflictException('CASH_SESSION_VERSION_CONFLICT');
          const rows = await x.$queryRaw<
            CashApproval[]
          >`UPDATE cash_approvals SET status=${i.decision},decided_by=${a}::uuid,decided_at=now(),decision_reason=${i.reason},version=version+1 WHERE tenant_id=${t}::uuid AND id=${id}::uuid AND status='PENDING' RETURNING id,action_type AS "actionType",resource_id AS "resourceId",requested_by AS "requestedBy",requested_at AS "requestedAt",required_permission AS "requiredPermission",threshold_minor::text AS "thresholdMinor",reason,status,decided_by AS "decidedBy",decided_at AS "decidedAt",decision_reason AS "decisionReason",expires_at AS "expiresAt",correlation_id AS "correlationId"`;
          await this.simpleEvent(
            x,
            t,
            row.branch_id,
            a,
            id,
            i.decision === 'APPROVED' ? 'CashApprovalGranted' : 'CashApprovalRejected',
            { reason: i.reason },
          );
          const decided = rows.at(0);
          if (decided === undefined) throw new ConflictException('CASH_APPROVAL_DENIED');
          return decided;
        }),
    );
  }
  approvals(t: string, b: string) {
    return withTenantTransaction(
      this.db,
      t,
      (x) =>
        x.$queryRaw<
          CashApproval[]
        >`SELECT id,action_type AS "actionType",resource_id AS "resourceId",requested_by AS "requestedBy",requested_at AS "requestedAt",required_permission AS "requiredPermission",threshold_minor::text AS "thresholdMinor",reason,status,version,decided_by AS "decidedBy",decided_at AS "decidedAt",decision_reason AS "decisionReason",expires_at AS "expiresAt",correlation_id AS "correlationId" FROM cash_approvals WHERE tenant_id=${t}::uuid AND branch_id=${b}::uuid ORDER BY requested_at DESC LIMIT 200`,
    );
  }
  prepareDeposit(
    t: string,
    a: string,
    m: string,
    id: string,
    i: Parameters<CashRepository['prepareDeposit']>[4],
  ) {
    return this.sessionTx(t, a, id, 'cash.deposit', async (x) =>
      this.idem(x, t, 'deposit.prepare', i.idempotencyKey, i, async () => {
        const s = await this.session(x, t, id, true);
        const p = await this.policyIn(x, t, s.branch_id, s.register_id);
        if (p.depositApprovalRequired && !i.approvalId)
          throw new ConflictException('CASH_VARIANCE_APPROVAL_REQUIRED');
        const approvedBy = i.approvalId
          ? await this.requireApproval(x, t, i.approvalId, 'APPROVED', 'DEPOSIT', id)
          : null;
        const depositId = randomUUID();
        await this.ledger(x, t, a, m, s, {
          type: 'DEPOSIT',
          amountMinor: i.amountMinor,
          currency: i.currency,
          reason: i.reason,
          ...(i.reference === undefined ? {} : { reference: i.reference }),
          idempotencyKey: i.idempotencyKey,
          correlationId: i.correlationId,
          sourceType: 'CASH_DEPOSIT',
          sourceId: depositId,
        });
        const rows = await x.$queryRaw<
          Record<string, unknown>[]
        >`INSERT INTO cash_deposits(tenant_id,organization_id,branch_id,id,session_id,destination,reference,bag_reference,amount_minor,currency,status,actor_id,approved_by,reason,correlation_id,idempotency_key) VALUES(${t}::uuid,${t}::uuid,${s.branch_id}::uuid,${depositId}::uuid,${id}::uuid,${i.destination},${i.reference ?? null},${i.bagReference ?? null},${BigInt(i.amountMinor)},${i.currency},'PREPARED',${a}::uuid,${approvedBy}::uuid,${i.reason},${i.correlationId}::uuid,${i.idempotencyKey}) RETURNING *`;
        await this.event(x, t, a, s, 'CashDepositPrepared', {
          depositId,
          amountMinor: i.amountMinor,
        });
        return rows[0] ?? {};
      }),
    );
  }
  updateDeposit(
    t: string,
    a: string,
    m: string,
    id: string,
    i: Parameters<CashRepository['updateDeposit']>[4],
  ) {
    return withTenantTransaction(this.db, t, async (x) => {
      const current = await x.$queryRaw<
        {
          status: string;
          session_id: string;
          amount_minor: bigint;
          currency: string;
          correlation_id: string;
        }[]
      >`SELECT status,session_id,amount_minor,currency,correlation_id FROM cash_deposits WHERE tenant_id=${t}::uuid AND id=${id}::uuid FOR UPDATE`;
      const deposit = current.at(0);
      if (!deposit) throw new NotFoundException('CASH_DEPOSIT_NOT_FOUND');
      const authorizedSession = await this.session(x, t, deposit.session_id, false);
      await assertTransactionalAuthorization(x, {
        userId: a,
        tenantId: t,
        permission: 'cash.deposit',
        resource: { id, type: 'cash_deposit', branchId: authorizedSession.branch_id },
      });
      return this.idem(x, t, 'deposit.transition', i.idempotencyKey, { id, ...i }, async () => {
        const status = deposit.status;
        const valid =
          (status === 'PREPARED' && ['HANDED_OVER', 'CANCELLED'].includes(i.status)) ||
          (status === 'HANDED_OVER' && i.status === 'CONFIRMED_MANUALLY');
        if (!valid) throw new ConflictException('CASH_DEPOSIT_INVALID_STATE');
        if (i.status === 'CANCELLED') {
          const session = await this.session(x, t, deposit.session_id, false);
          await this.ledger(x, t, a, m, session, {
            type: 'CORRECTION',
            amountMinor: deposit.amount_minor.toString(),
            currency: deposit.currency,
            reason: i.reason,
            reference: `cash-deposit-cancellation:${id}`,
            idempotencyKey: `${i.idempotencyKey}:correction`,
            correlationId: deposit.correlation_id,
            sourceType: 'CASH_DEPOSIT_CANCELLATION',
            sourceId: id,
          });
        }
        const rows = await x.$queryRaw<
          Record<string, unknown>[]
        >`UPDATE cash_deposits SET status=${i.status},reason=${i.reason},handed_over_at=CASE WHEN ${i.status}='HANDED_OVER' THEN now() ELSE handed_over_at END,confirmed_at=CASE WHEN ${i.status}='CONFIRMED_MANUALLY' THEN now() ELSE confirmed_at END,cancelled_at=CASE WHEN ${i.status}='CANCELLED' THEN now() ELSE cancelled_at END,updated_at=now() WHERE tenant_id=${t}::uuid AND id=${id}::uuid RETURNING *`;
        if (!rows[0]) throw new NotFoundException('CASH_DEPOSIT_NOT_FOUND');
        const session = await this.session(x, t, deposit.session_id, false);
        await this.event(
          x,
          t,
          a,
          session,
          `CashDeposit${i.status === 'HANDED_OVER' ? 'HandedOver' : i.status === 'CANCELLED' ? 'Cancelled' : 'ConfirmedManually'}`,
          {
            depositId: id,
            status: i.status,
          },
        );
        return rows[0];
      });
    });
  }
  transfer(t: string, a: string, m: string, i: Parameters<CashRepository['transfer']>[3]) {
    return this.transferTx(
      t,
      a,
      i.sourceSessionId,
      i.destinationSessionId,
      'cash.transfer',
      async (x) =>
        this.idem(x, t, 'transfer', i.idempotencyKey, i, async () => {
          if (i.sourceSessionId === i.destinationSessionId)
            throw new ConflictException('CASH_TRANSFER_INVALID');
          const ids = [i.sourceSessionId, i.destinationSessionId].sort();
          await x.$queryRawUnsafe(
            `SELECT id FROM cash_sessions WHERE tenant_id=$1::uuid AND id=ANY($2::uuid[]) ORDER BY id FOR UPDATE`,
            t,
            ids,
          );
          const source = await this.session(x, t, i.sourceSessionId, false),
            destination = await this.session(x, t, i.destinationSessionId, false);
          if (
            source.organization_id !== destination.organization_id ||
            source.branch_id !== destination.branch_id ||
            source.currency !== destination.currency ||
            source.currency !== i.currency
          )
            throw new ConflictException('CASH_TRANSFER_INVALID');
          const p = await this.policyIn(x, t, source.branch_id, source.register_id);
          if (!p.transferAllowed) throw new ConflictException('CASH_TRANSFER_INVALID');
          const transferId = randomUUID(),
            reference = `cash-transfer:${transferId}`;
          await this.ledger(x, t, a, m, source, {
            type: 'TRANSFER_OUT',
            amountMinor: i.amountMinor,
            currency: i.currency,
            reason: i.reason,
            reference,
            idempotencyKey: `${i.idempotencyKey}:out`,
            correlationId: i.correlationId,
            sourceType: 'CASH_TRANSFER_OUT',
            sourceId: transferId,
          });
          await this.ledger(x, t, a, m, destination, {
            type: 'TRANSFER_IN',
            amountMinor: i.amountMinor,
            currency: i.currency,
            reason: i.reason,
            reference,
            idempotencyKey: `${i.idempotencyKey}:in`,
            correlationId: i.correlationId,
            sourceType: 'CASH_TRANSFER_IN',
            sourceId: transferId,
          });
          await x.$executeRaw`INSERT INTO cash_transfers(tenant_id,organization_id,branch_id,id,source_session_id,destination_session_id,amount_minor,currency,status,reference,idempotency_key,actor_id,approved_by) VALUES(${t}::uuid,${t}::uuid,${source.branch_id}::uuid,${transferId}::uuid,${source.id}::uuid,${destination.id}::uuid,${BigInt(i.amountMinor)},${i.currency},'COMPLETED',${reference},${i.idempotencyKey},${a}::uuid,${i.approvalId ?? null}::uuid)`;
          await this.event(x, t, a, source, 'CashTransferCompleted', {
            transferId,
            destinationSessionId: destination.id,
            amountMinor: i.amountMinor,
          });
          return { id: transferId, status: 'COMPLETED', reference };
        }),
    );
  }
  reopen(t: string, a: string, id: string, i: Parameters<CashRepository['reopen']>[3]) {
    return this.sessionTx(t, a, id, 'cash.session.reopen', async (x) =>
      this.idem(x, t, 'session.reopen', i.idempotencyKey, i, async () => {
        const s = await this.session(x, t, id, true),
          p = await this.policyIn(x, t, s.branch_id, s.register_id);
        if (!p.reopenAllowed || !['CLOSED', 'FORCE_CLOSED'].includes(s.status))
          throw new ConflictException('CASH_SESSION_REOPEN_NOT_ALLOWED');
        if (s.version !== i.version) throw new ConflictException('CASH_SESSION_VERSION_CONFLICT');
        await this.requireApproval(x, t, i.approvalId, 'APPROVED', 'REOPEN', id);
        const rows = await x.$queryRaw<
          SessionRow[]
        >`UPDATE cash_sessions SET status='REOPENED',reopened_at=now(),version=version+1,notes=${i.reason},updated_at=now() WHERE tenant_id=${t}::uuid AND id=${id}::uuid RETURNING *`;
        const changed = rows.at(0);
        if (!changed) throw new NotFoundException('CASH_SESSION_NOT_FOUND');
        await this.event(x, t, a, changed, 'CashSessionReopened', { reason: i.reason });
        return snapshot(changed);
      }),
    );
  }
  async initiateHandoff(
    t: string,
    a: string,
    membershipId: string,
    id: string,
    i: Parameters<CashRepository['initiateHandoff']>[4],
  ) {
    const branchId = await withTenantTransaction(
      this.db,
      t,
      async (x) => (await this.session(x, t, id, false)).branch_id,
    );
    return this.tx(t, a, 'cash.session.handoff', branchId, async (x) =>
      this.idem(x, t, 'handoff.initiate', i.idempotencyKey, { id, ...i }, async () => {
        const s = await this.session(x, t, id, true);
        if (s.status !== 'OPEN' || s.assigned_cashier_id === i.incomingCashierId)
          throw new ConflictException('CASH_HANDOFF_INVALID_STATE');
        const incoming = await this.activeMembership(x, t, i.incomingCashierId, s.branch_id);
        const handoffId = randomUUID();
        const rows = await x.$queryRaw<
          HandoffRow[]
        >`INSERT INTO cash_handoffs(tenant_id,organization_id,branch_id,id,session_id,outgoing_cashier_id,incoming_cashier_id,outgoing_membership_id,incoming_membership_id,expected_amount_minor,status,reason,notes,requested_by,correlation_id,idempotency_key,expires_at) VALUES(${t}::uuid,${t}::uuid,${s.branch_id}::uuid,${handoffId}::uuid,${id}::uuid,${s.assigned_cashier_id}::uuid,${i.incomingCashierId}::uuid,${membershipId}::uuid,${incoming.id}::uuid,${s.expected_amount_minor},'COUNT_REQUIRED',${i.reason},${i.notes ?? null},${a}::uuid,${i.correlationId}::uuid,${i.idempotencyKey},${new Date(i.expiresAt)}) RETURNING *`;
        await this.event(x, t, a, s, 'CashShiftHandoffInitiated', {
          handoffId,
          incomingCashierId: i.incomingCashierId,
        });
        const created = rows.at(0);
        if (created === undefined) throw new ConflictException('CASH_HANDOFF_INVALID_STATE');
        return this.handoffView(created);
      }),
    );
  }
  countHandoff(t: string, a: string, id: string, i: Parameters<CashRepository['countHandoff']>[3]) {
    return this.handoffTx(t, a, id, 'cash.count', async (x, row) =>
      this.idem(x, t, 'handoff.count', i.idempotencyKey, { id, ...i }, async () => {
        if (row.status !== 'COUNT_REQUIRED' || row.version !== i.version)
          throw new ConflictException('CASH_HANDOFF_INVALID_STATE');
        const total = i.denominations ? countDenominations(i.denominations) : i.totalMinor;
        if (total === undefined) throw new ConflictException('CASH_COUNT_INVALID');
        const variance = BigInt(total) - row.expected_amount_minor;
        const rows = await x.$queryRaw<
          HandoffRow[]
        >`UPDATE cash_handoffs SET counted_amount_minor=${BigInt(total)},variance_minor=${variance},denominations=${JSON.stringify(i.denominations ?? [])}::jsonb,counted_by=${a}::uuid,counted_at=now(),status='PENDING_ACCEPTANCE',version=version+1,updated_at=now() WHERE tenant_id=${t}::uuid AND id=${id}::uuid AND version=${i.version} RETURNING *`;
        await this.simpleEvent(x, t, row.branch_id, a, id, 'CashShiftHandoffCounted', {
          countedAmountMinor: total,
          varianceMinor: variance.toString(),
        });
        const counted = rows.at(0);
        if (counted === undefined) throw new ConflictException('CASH_HANDOFF_INVALID_STATE');
        return this.handoffView(counted);
      }),
    );
  }
  decideHandoff(
    t: string,
    a: string,
    id: string,
    i: Parameters<CashRepository['decideHandoff']>[3],
  ) {
    return this.handoffTx(
      t,
      a,
      id,
      i.decision === 'CANCELLED' ? 'cash.session.handoff' : 'cash.session.handoff.accept',
      async (x, row) =>
        this.idem(x, t, 'handoff.decide', i.idempotencyKey, { id, ...i }, async () => {
          if (row.version !== i.version || row.status !== 'PENDING_ACCEPTANCE')
            throw new ConflictException('CASH_HANDOFF_INVALID_STATE');
          if (i.decision !== 'CANCELLED' && row.incoming_cashier_id !== a)
            throw new ConflictException('CASH_HANDOFF_ACTOR_INVALID');
          if (i.decision === 'CANCELLED' && row.requested_by !== a)
            throw new ConflictException('CASH_HANDOFF_ACTOR_INVALID');
          const next = i.decision;
          let rows: HandoffRow[];
          if (next === 'ACCEPTED') {
            rows = await x.$queryRaw<
              HandoffRow[]
            >`UPDATE cash_handoffs SET status='ACCEPTED',accepted_by=${a}::uuid,accepted_at=now(),notes=CONCAT_WS(E'\n',notes,${i.reason}::text),version=version+1,updated_at=now() WHERE tenant_id=${t}::uuid AND id=${id}::uuid AND version=${i.version} RETURNING *`;
          } else if (next === 'REJECTED') {
            rows = await x.$queryRaw<
              HandoffRow[]
            >`UPDATE cash_handoffs SET status='REJECTED',rejected_at=now(),notes=CONCAT_WS(E'\n',notes,${i.reason}::text),version=version+1,updated_at=now() WHERE tenant_id=${t}::uuid AND id=${id}::uuid AND version=${i.version} RETURNING *`;
          } else {
            rows = await x.$queryRaw<
              HandoffRow[]
            >`UPDATE cash_handoffs SET status='CANCELLED',cancelled_at=now(),notes=CONCAT_WS(E'\n',notes,${i.reason}::text),version=version+1,updated_at=now() WHERE tenant_id=${t}::uuid AND id=${id}::uuid AND version=${i.version} RETURNING *`;
          }
          const eventType =
            next === 'ACCEPTED'
              ? 'CashShiftHandoffAccepted'
              : next === 'REJECTED'
                ? 'CashShiftHandoffRejected'
                : 'CashShiftHandoffCancelled';
          await this.simpleEvent(x, t, row.branch_id, a, id, eventType, { reason: i.reason });
          const decided = rows.at(0);
          if (decided === undefined) throw new ConflictException('CASH_HANDOFF_INVALID_STATE');
          return this.handoffView(decided);
        }),
    );
  }
  completeHandoff(
    t: string,
    a: string,
    id: string,
    i: Parameters<CashRepository['completeHandoff']>[3],
  ) {
    return this.handoffTx(t, a, id, 'cash.session.handoff', async (x, row) =>
      this.idem(x, t, 'handoff.complete', i.idempotencyKey, { id, ...i }, async () => {
        if (row.status !== 'ACCEPTED' || row.version !== i.version)
          throw new ConflictException('CASH_HANDOFF_INVALID_STATE');
        if (row.expires_at && row.expires_at <= new Date())
          throw new ConflictException('CASH_HANDOFF_EXPIRED');
        const policy = await this.policyIn(x, t, row.branch_id);
        if (
          row.variance_minor !== null &&
          BigInt(row.variance_minor < 0n ? -row.variance_minor : row.variance_minor) >
            BigInt(policy.varianceToleranceMinor)
        ) {
          if (!i.approvalId) throw new ConflictException('CASH_VARIANCE_APPROVAL_REQUIRED');
          await this.requireApproval(x, t, i.approvalId, 'APPROVED', 'HANDOFF', id);
        }
        const receipt = {
          type: 'CASH_SHIFT_HANDOFF',
          handoffId: id,
          sessionId: row.session_id,
          expectedAmountMinor: row.expected_amount_minor.toString(),
          countedAmountMinor: row.counted_amount_minor?.toString(),
          varianceMinor: row.variance_minor?.toString(),
        };
        const rows = await x.$queryRaw<
          HandoffRow[]
        >`UPDATE cash_handoffs SET status='COMPLETED',approval_id=${i.approvalId ?? null}::uuid,receipt=${JSON.stringify(receipt)}::jsonb,completed_at=now(),version=version+1,updated_at=now() WHERE tenant_id=${t}::uuid AND id=${id}::uuid AND version=${i.version} RETURNING *`;
        await x.$executeRaw`UPDATE cash_sessions SET assigned_cashier_id=${row.incoming_cashier_id}::uuid,version=version+1,updated_at=now() WHERE tenant_id=${t}::uuid AND id=${row.session_id}::uuid AND assigned_cashier_id=${row.outgoing_cashier_id}::uuid`;
        await this.simpleEvent(x, t, row.branch_id, a, id, 'CashShiftHandoffCompleted', {
          sessionId: row.session_id,
          incomingCashierId: row.incoming_cashier_id,
        });
        const completed = rows.at(0);
        if (completed === undefined) throw new ConflictException('CASH_HANDOFF_INVALID_STATE');
        return this.handoffView(completed);
      }),
    );
  }
  getHandoff(t: string, id: string) {
    return withTenantTransaction(this.db, t, async (x) =>
      this.handoffView(await this.handoffRow(x, t, id, false)),
    );
  }
  registers(t: string, b: string) {
    return withTenantTransaction(
      this.db,
      t,
      (x) =>
        x.$queryRaw<
          unknown[]
        >`SELECT id,branch_id AS "branchId",name,code,status,default_currency AS currency,default_opening_float_minor::text AS "openingFloatMinor",version FROM cash_registers WHERE tenant_id=${t}::uuid AND branch_id=${b}::uuid ORDER BY name`,
    );
  }
  drawers(t: string, b: string) {
    return withTenantTransaction(
      this.db,
      t,
      (x) =>
        x.$queryRaw<
          unknown[]
        >`SELECT id,branch_id AS "branchId",name,code,status,register_id AS "registerId",version FROM cash_drawers WHERE tenant_id=${t}::uuid AND branch_id=${b}::uuid ORDER BY name`,
    );
  }
  quarantine(
    t: string,
    branchId: string | undefined,
    sourceModule: 'CASH' | 'SALES' | undefined,
    offset: number,
    limit: number,
  ) {
    return withTenantTransaction(this.db, t, async (x) => {
      const rows = await x.$queryRaw<unknown[]>`
        SELECT * FROM (
          SELECT c.id AS "eventId",c.event_type AS "eventType",c.event_version AS "eventVersion",
            NULL::uuid AS "aggregateId",c.organization_id AS "organizationId",c.branch_id AS "branchId",
            NULL::uuid AS "correlationId",c.attempts,c.first_attempt_at AS "firstAttemptAt",
            c.last_attempt_at AS "lastAttemptAt",c.quarantined_at AS "quarantinedAt",
            c.error_code AS "errorCode",LEFT(COALESCE(c.last_error,'Processing failed'),240) AS message,
            'QUARANTINED'::text AS status,false AS "replayEligibility",'CASH'::text AS "sourceModule",
            c.occurred_at AS "occurredAt"
          FROM cash_outbox c
          WHERE c.tenant_id=${t}::uuid AND c.quarantined_at IS NOT NULL
            AND (${branchId ?? null}::uuid IS NULL OR c.branch_id=${branchId ?? null}::uuid)
            AND (${sourceModule ?? null}::text IS NULL OR ${sourceModule ?? null}::text='CASH')
          UNION ALL
          SELECT s.id,s.event_type,s.event_version,s.aggregate_id,s.tenant_id,sa.branch_id,
            s.correlation_id,s.attempts,s.first_attempt_at,s.last_attempt_at,s.quarantined_at,
            s.error_code,LEFT(COALESCE(s.last_error,'Processing failed'),240),
            'QUARANTINED',false,'SALES',s.occurred_at
          FROM sales_outbox s
          JOIN sales sa ON sa.tenant_id=s.tenant_id AND sa.id=s.aggregate_id
          WHERE s.tenant_id=${t}::uuid AND s.quarantined_at IS NOT NULL
            AND (${branchId ?? null}::uuid IS NULL OR sa.branch_id=${branchId ?? null}::uuid)
            AND (${sourceModule ?? null}::text IS NULL OR ${sourceModule ?? null}::text='SALES')
        ) q ORDER BY "quarantinedAt" DESC,"eventId" LIMIT ${limit} OFFSET ${offset}`;
      const totals = await x.$queryRaw<{ total: bigint }[]>`
        SELECT COUNT(*)::bigint AS total FROM (
          SELECT c.id FROM cash_outbox c WHERE c.tenant_id=${t}::uuid AND c.quarantined_at IS NOT NULL
            AND (${branchId ?? null}::uuid IS NULL OR c.branch_id=${branchId ?? null}::uuid)
            AND (${sourceModule ?? null}::text IS NULL OR ${sourceModule ?? null}::text='CASH')
          UNION ALL
          SELECT s.id FROM sales_outbox s JOIN sales sa ON sa.tenant_id=s.tenant_id AND sa.id=s.aggregate_id
          WHERE s.tenant_id=${t}::uuid AND s.quarantined_at IS NOT NULL
            AND (${branchId ?? null}::uuid IS NULL OR sa.branch_id=${branchId ?? null}::uuid)
            AND (${sourceModule ?? null}::text IS NULL OR ${sourceModule ?? null}::text='SALES')
        ) q`;
      return { items: rows, offset, limit, total: Number(totals[0]?.total ?? 0n) };
    });
  }
  operations(t: string, branchId?: string) {
    return withTenantTransaction(this.db, t, async (x) => {
      const rows = await x.$queryRaw<
        {
          cash_pending: bigint;
          cash_quarantined: bigint;
          sales_pending: bigint;
          sales_quarantined: bigint;
          sink_deliveries: bigint;
        }[]
      >`SELECT
        (SELECT COUNT(*) FROM cash_outbox WHERE tenant_id=${t}::uuid AND published_at IS NULL AND quarantined_at IS NULL AND (${branchId ?? null}::uuid IS NULL OR branch_id=${branchId ?? null}::uuid)) cash_pending,
        (SELECT COUNT(*) FROM cash_outbox WHERE tenant_id=${t}::uuid AND quarantined_at IS NOT NULL AND (${branchId ?? null}::uuid IS NULL OR branch_id=${branchId ?? null}::uuid)) cash_quarantined,
        (SELECT COUNT(*) FROM sales_outbox so JOIN sales s ON s.tenant_id=so.tenant_id AND s.id=so.aggregate_id WHERE so.tenant_id=${t}::uuid AND so.published_at IS NULL AND so.quarantined_at IS NULL AND (${branchId ?? null}::uuid IS NULL OR s.branch_id=${branchId ?? null}::uuid)) sales_pending,
        (SELECT COUNT(*) FROM sales_outbox so JOIN sales s ON s.tenant_id=so.tenant_id AND s.id=so.aggregate_id WHERE so.tenant_id=${t}::uuid AND so.quarantined_at IS NOT NULL AND (${branchId ?? null}::uuid IS NULL OR s.branch_id=${branchId ?? null}::uuid)) sales_quarantined,
        (SELECT COUNT(*) FROM cash_public_event_deliveries WHERE tenant_id=${t}::uuid) sink_deliveries`;
      const row = rows.at(0);
      if (row === undefined) throw new Error('Cash operational status query returned no row');
      return {
        worker: 'HEALTHY',
        cashPending: Number(row.cash_pending),
        cashQuarantined: Number(row.cash_quarantined),
        salesPending: Number(row.sales_pending),
        salesQuarantined: Number(row.sales_quarantined),
        localUmiSinkDeliveries: Number(row.sink_deliveries),
      };
    });
  }
  private async policyIn(x: DatabaseTransaction, t: string, b?: string, r?: string) {
    const rows = await x.$queryRaw<
      {
        branch_id: string | null;
        register_id: string | null;
        configuration: Record<string, unknown>;
      }[]
    >`SELECT branch_id,register_id,configuration FROM cash_policies WHERE tenant_id=${t}::uuid AND (branch_id IS NULL OR branch_id=${b ?? null}::uuid) AND (register_id IS NULL OR register_id=${r ?? null}::uuid) ORDER BY (branch_id IS NOT NULL),(register_id IS NOT NULL)`;
    let organization: Record<string, unknown> | undefined,
      branch: Record<string, unknown> | undefined,
      register: Record<string, unknown> | undefined;
    for (const row of rows) {
      if (row.register_id) register = row.configuration;
      else if (row.branch_id) branch = row.configuration;
      else organization = row.configuration;
    }
    return resolveCashPolicy(
      defaultCashPolicy,
      organization as CashPolicyOverride | undefined,
      branch as CashPolicyOverride | undefined,
      register as CashPolicyOverride | undefined,
    );
  }
  private async idem<T>(
    x: DatabaseTransaction,
    t: string,
    operation: string,
    key: string,
    input: unknown,
    work: () => Promise<T>,
  ): Promise<T> {
    const serialize = (value: unknown) =>
      JSON.stringify(value, (_key, item: unknown) =>
        typeof item === 'bigint' ? item.toString() : item,
      );
    const fingerprint = createHash('sha256').update(serialize(input)).digest('hex');
    const prior = await x.$queryRaw<
      { request_fingerprint: string; state: string; response: T | null }[]
    >`SELECT request_fingerprint,state,response FROM cash_idempotency_records WHERE tenant_id=${t}::uuid AND operation=${operation} AND key=${key} FOR UPDATE`;
    const found = prior.at(0);
    if (found) {
      if (found.request_fingerprint !== fingerprint)
        throw new ConflictException('IDEMPOTENCY_CONFLICT');
      if (found.state === 'COMPLETED' && found.response !== null) return found.response;
      throw new ConflictException('IDEMPOTENCY_IN_PROGRESS');
    }
    const inserted = await x.$queryRaw<{ inserted: number }[]>`
      INSERT INTO cash_idempotency_records(
        tenant_id,organization_id,operation,key,request_fingerprint,response,status_code,state,expires_at
      ) VALUES (
        ${t}::uuid,${t}::uuid,${operation},${key},${fingerprint},NULL,NULL,'IN_PROGRESS',now()+interval '24 hours'
      ) ON CONFLICT (tenant_id,operation,key) DO NOTHING
      RETURNING 1 AS inserted`;
    if (!inserted[0]) {
      const raced = await x.$queryRaw<
        { request_fingerprint: string; state: string; response: T | null }[]
      >`SELECT request_fingerprint,state,response FROM cash_idempotency_records WHERE tenant_id=${t}::uuid AND operation=${operation} AND key=${key} FOR UPDATE`;
      const winner = raced[0];
      if (!winner || winner.request_fingerprint !== fingerprint)
        throw new ConflictException('IDEMPOTENCY_CONFLICT');
      if (winner.state === 'COMPLETED' && winner.response !== null) return winner.response;
      throw new ConflictException('IDEMPOTENCY_IN_PROGRESS');
    }
    const result = await work();
    const body = serialize(result);
    await x.$executeRaw`UPDATE cash_idempotency_records SET response=${body}::jsonb,status_code=200,state='COMPLETED',updated_at=now() WHERE tenant_id=${t}::uuid AND operation=${operation} AND key=${key}`;
    return JSON.parse(body) as T;
  }
  private async requireApproval(
    x: DatabaseTransaction,
    t: string,
    id: string,
    status: string,
    actionType?: string,
    resourceId?: string,
  ): Promise<string> {
    const rows = await x.$queryRaw<
      {
        status: string;
        expires_at: Date;
        action_type: string;
        resource_id: string;
        decided_by: string | null;
      }[]
    >`SELECT status,expires_at,action_type,resource_id,decided_by FROM cash_approvals WHERE tenant_id=${t}::uuid AND id=${id}::uuid`;
    const row = rows.at(0);
    if (
      !row ||
      row.status !== status ||
      row.decided_by === null ||
      row.expires_at <= new Date() ||
      (actionType !== undefined && row.action_type !== actionType) ||
      (resourceId !== undefined && row.resource_id !== resourceId)
    )
      throw new ConflictException('CASH_APPROVAL_DENIED');
    return row.decided_by;
  }
  private async simpleEvent(
    x: DatabaseTransaction,
    t: string,
    b: string,
    a: string,
    aggregateId: string,
    type: string,
    payload: Readonly<Record<string, unknown>>,
  ) {
    const id = randomUUID(),
      occurred = new Date(),
      body = JSON.stringify(payload);
    await x.$executeRaw`INSERT INTO cash_events(tenant_id,organization_id,branch_id,id,event_type,event_version,aggregate_id,aggregate_version,payload,occurred_at,correlation_id,actor_id) VALUES(${t}::uuid,${t}::uuid,${b}::uuid,${id}::uuid,${type},1,${aggregateId}::uuid,1,${body}::jsonb,${occurred},${randomUUID()}::uuid,${a}::uuid)`;
    await x.$executeRaw`INSERT INTO cash_outbox(tenant_id,organization_id,branch_id,id,event_type,event_version,payload,occurred_at) VALUES(${t}::uuid,${t}::uuid,${b}::uuid,${id}::uuid,${type},1,${body}::jsonb,${occurred})`;
  }
  private async activeMembership(
    x: DatabaseTransaction,
    t: string,
    userId: string,
    branchId: string,
  ) {
    const rows = await x.$queryRaw<
      { id: string }[]
    >`SELECT m.id FROM memberships m WHERE m.tenant_id=${t}::uuid AND m.principal_id=${userId}::uuid AND m.status='ACTIVE' AND (m.access_scope='ALL_BRANCHES' OR EXISTS(SELECT 1 FROM membership_branch_scopes bs WHERE bs.tenant_id=m.tenant_id AND bs.membership_id=m.id AND bs.branch_id=${branchId}::uuid))`;
    const membership = rows.at(0);
    if (!membership) throw new ConflictException('CASH_HANDOFF_MEMBERSHIP_INVALID');
    return membership;
  }
  private handoffView(row: HandoffRow) {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      organizationId: row.organization_id,
      branchId: row.branch_id,
      sessionId: row.session_id,
      outgoingCashierId: row.outgoing_cashier_id,
      incomingCashierId: row.incoming_cashier_id,
      outgoingMembershipId: row.outgoing_membership_id,
      incomingMembershipId: row.incoming_membership_id,
      expectedAmountMinor: row.expected_amount_minor.toString(),
      countedAmountMinor: row.counted_amount_minor?.toString(),
      varianceMinor: row.variance_minor?.toString(),
      denominations: row.denominations,
      status: row.status,
      reason: row.reason,
      notes: row.notes,
      requestedBy: row.requested_by,
      acceptedBy: row.accepted_by,
      approvalId: row.approval_id,
      correlationId: row.correlation_id,
      version: row.version,
      expiresAt: row.expires_at?.toISOString(),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      completedAt: row.completed_at?.toISOString(),
    };
  }
  private async handoffRow(x: DatabaseTransaction, t: string, id: string, lock: boolean) {
    const rows = await x.$queryRawUnsafe<HandoffRow[]>(
      `SELECT * FROM cash_handoffs WHERE tenant_id=$1::uuid AND id=$2::uuid${lock ? ' FOR UPDATE' : ''}`,
      t,
      id,
    );
    const row = rows.at(0);
    if (!row) throw new NotFoundException('CASH_HANDOFF_NOT_FOUND');
    return row;
  }
  private async handoffTx<T>(
    t: string,
    a: string,
    id: string,
    permission: string,
    work: (x: DatabaseTransaction, row: HandoffRow) => Promise<T>,
  ) {
    return withTenantTransaction(this.db, t, async (x) => {
      const row = await this.handoffRow(x, t, id, true);
      await assertTransactionalAuthorization(x, {
        userId: a,
        tenantId: t,
        permission,
        resource: { id, type: 'cash_handoff', branchId: row.branch_id },
      });
      return work(x, row);
    });
  }
  private tx<T>(
    t: string,
    a: string,
    p: string,
    b: string | undefined,
    work: (x: DatabaseTransaction) => Promise<T>,
  ) {
    return withTenantTransaction(this.db, t, async (x) => {
      await assertTransactionalAuthorization(x, {
        userId: a,
        tenantId: t,
        permission: p,
        resource: { id: 'cash', type: 'cash_session', ...(b ? { branchId: b } : {}) },
      });
      return work(x);
    });
  }
  private sessionTx<T>(
    t: string,
    a: string,
    sessionId: string,
    permission: string,
    work: (x: DatabaseTransaction) => Promise<T>,
  ) {
    return withTenantTransaction(this.db, t, async (x) => {
      const session = await this.session(x, t, sessionId, false);
      await assertTransactionalAuthorization(x, {
        userId: a,
        tenantId: t,
        permission,
        resource: { id: sessionId, type: 'cash_session', branchId: session.branch_id },
      });
      return work(x);
    });
  }
  private transferTx<T>(
    t: string,
    a: string,
    sourceSessionId: string,
    destinationSessionId: string,
    permission: string,
    work: (x: DatabaseTransaction) => Promise<T>,
  ) {
    return withTenantTransaction(this.db, t, async (x) => {
      const source = await this.session(x, t, sourceSessionId, false);
      const destination = await this.session(x, t, destinationSessionId, false);
      for (const session of [source, destination]) {
        await assertTransactionalAuthorization(x, {
          userId: a,
          tenantId: t,
          permission,
          resource: {
            id: session.id,
            type: 'cash_session',
            branchId: session.branch_id,
          },
        });
      }
      return work(x);
    });
  }
  private async session(x: DatabaseTransaction, t: string, id: string, lock: boolean) {
    const rows = await x.$queryRawUnsafe<SessionRow[]>(
      `SELECT * FROM cash_sessions WHERE tenant_id=$1::uuid AND id=$2::uuid${lock ? ' FOR UPDATE' : ''}`,
      t,
      id,
    );
    if (!rows[0]) throw new NotFoundException('CASH_SESSION_NOT_FOUND');
    return rows[0];
  }
  private async ledger(
    x: DatabaseTransaction,
    t: string,
    a: string,
    m: string,
    s: SessionRow,
    i: Readonly<{
      type: string;
      amountMinor: string;
      currency: string;
      reason: string;
      idempotencyKey: string;
      correlationId: string;
      sourceType?: string;
      sourceId?: string;
      reference?: string;
    }>,
  ) {
    if (!/^[1-9]\d*$/.test(i.amountMinor)) throw new ConflictException('CASH_AMOUNT_INVALID');
    const direction = [
        'CASH_OUT',
        'WITHDRAWAL',
        'DEPOSIT',
        'PAID_OUT',
        'CHANGE_OUT',
        'CASH_REFUND',
      ].includes(i.type)
        ? 'OUT'
        : 'IN',
      sourceType = i.sourceType ?? 'MANUAL',
      sourceId = i.sourceId ?? i.idempotencyKey;
    const prior = await x.$queryRaw<
      CashLedgerEntry[]
    >`SELECT id FROM cash_ledger_entries WHERE tenant_id=${t}::uuid AND source_type=${sourceType} AND source_id=${sourceId}`;
    if (prior[0]) return prior[0];
    const id = randomUUID(),
      amount = BigInt(i.amountMinor);
    const rows = await x.$queryRaw<
      CashLedgerEntry[]
    >`INSERT INTO cash_ledger_entries(tenant_id,organization_id,branch_id,id,session_id,register_id,drawer_id,currency,direction,movement_type,amount_minor,source_type,source_id,reference,reason,actor_id,membership_id,occurred_at,business_date,idempotency_key,correlation_id) VALUES(${t}::uuid,${t}::uuid,${s.branch_id}::uuid,${id}::uuid,${s.id}::uuid,${s.register_id}::uuid,${s.drawer_id}::uuid,${i.currency},${direction},${i.type},${amount},${sourceType},${sourceId},${i.reference ?? null},${i.reason},${a}::uuid,${m}::uuid,now(),${s.business_date},${i.idempotencyKey},${i.correlationId}::uuid) RETURNING id,tenant_id AS "tenantId",organization_id AS "organizationId",branch_id AS "branchId",session_id AS "sessionId",register_id AS "registerId",currency,direction,movement_type AS "movementType",amount_minor::text AS "amountMinor",source_type AS "sourceType",source_id AS "sourceId",reason,actor_id AS "actorId",membership_id AS "membershipId",occurred_at AS "occurredAt",business_date AS "businessDate",idempotency_key AS "idempotencyKey",correlation_id AS "correlationId",metadata,created_at AS "createdAt"`;
    const created = rows.at(0);
    if (created === undefined) throw new ConflictException('CASH_MOVEMENT_DUPLICATE');
    await x.$executeRaw`UPDATE cash_sessions SET expected_amount_minor=expected_amount_minor+${direction === 'IN' ? amount : -amount},version=version+1,updated_at=now() WHERE tenant_id=${t}::uuid AND id=${s.id}::uuid`;
    await this.event(
      x,
      t,
      a,
      s,
      i.type === 'CASH_SALE' ? 'CashSalePosted' : 'CashMovementRecorded',
      { entryId: id, amountMinor: i.amountMinor, movementType: i.type },
    );
    return created;
  }
  private async event(
    x: DatabaseTransaction,
    t: string,
    a: string,
    s: SessionRow,
    type: string,
    payload: Readonly<Record<string, unknown>>,
  ) {
    const id = randomUUID(),
      occurred = new Date(),
      body = JSON.stringify(payload);
    await x.$executeRaw`INSERT INTO cash_events(tenant_id,organization_id,branch_id,id,event_type,event_version,aggregate_id,aggregate_version,payload,occurred_at,correlation_id,actor_id) VALUES(${t}::uuid,${t}::uuid,${s.branch_id}::uuid,${id}::uuid,${type},1,${s.id}::uuid,${s.version},${body}::jsonb,${occurred},${s.correlation_id}::uuid,${a}::uuid)`;
    await x.$executeRaw`INSERT INTO cash_outbox(tenant_id,organization_id,branch_id,id,event_type,event_version,payload,occurred_at) VALUES(${t}::uuid,${t}::uuid,${s.branch_id}::uuid,${id}::uuid,${type},1,${body}::jsonb,${occurred})`;
  }
}
