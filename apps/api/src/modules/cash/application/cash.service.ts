import { Inject, Injectable } from '@nestjs/common';
import type { SessionIdentity } from '../../authentication/application/authentication.ports.js';
import { AuthorizationService } from '../../authorization/application/authorization.service.js';
import { CASH_REPOSITORY, type CashRepository } from './cash.ports.js';
@Injectable()
export class CashService {
  constructor(
    @Inject(CASH_REPOSITORY) private readonly repo: CashRepository,
    private readonly authorization: AuthorizationService,
  ) {}
  private async allow(i: SessionIdentity, t: string, p: string, branchId?: string) {
    await this.authorization.assert(i, t, p, {
      type: 'cash_session',
      ...(branchId === undefined ? {} : { branchId }),
    });
  }
  async register(
    i: SessionIdentity,
    t: string,
    b: Parameters<CashRepository['createRegister']>[2],
  ) {
    await this.allow(i, t, 'cash.register.manage', b.branchId);
    return this.repo.createRegister(t, i.userId, b);
  }
  async updateRegister(
    i: SessionIdentity,
    t: string,
    id: string,
    b: Parameters<CashRepository['updateRegister']>[3],
  ) {
    return this.repo.updateRegister(t, i.userId, id, b);
  }
  async drawer(i: SessionIdentity, t: string, b: Parameters<CashRepository['createDrawer']>[2]) {
    await this.allow(i, t, 'cash.drawer.manage', b.branchId);
    return this.repo.createDrawer(t, i.userId, b);
  }
  async updateDrawer(
    i: SessionIdentity,
    t: string,
    id: string,
    b: Parameters<CashRepository['updateDrawer']>[3],
  ) {
    return this.repo.updateDrawer(t, i.userId, id, b);
  }
  async open(i: SessionIdentity, t: string, b: Parameters<CashRepository['open']>[3]) {
    await this.allow(i, t, 'cash.session.open', b.branchId);
    const membershipId = await this.authorization.activeMembershipId(i, t, b.branchId);
    return this.repo.open(t, i.userId, membershipId, b);
  }
  async movement(
    i: SessionIdentity,
    t: string,
    id: string,
    b: Parameters<CashRepository['movement']>[4],
  ) {
    const permission: string =
      b.type === 'WITHDRAWAL'
        ? 'cash.withdraw'
        : b.type === 'DEPOSIT'
          ? 'cash.deposit'
          : 'cash.movement.create';
    const session = await this.repo.get(t, id);
    await this.allow(i, t, permission, session.branchId);
    const membershipId = await this.authorization.activeMembershipId(i, t, session.branchId);
    return this.repo.movement(t, i.userId, membershipId, id, b);
  }
  async count(
    i: SessionIdentity,
    t: string,
    id: string,
    b: Parameters<CashRepository['count']>[3],
  ) {
    const session = await this.repo.get(t, id);
    await this.allow(i, t, 'cash.count', session.branchId);
    return this.repo.count(t, i.userId, id, b);
  }
  async reconcile(i: SessionIdentity, t: string, id: string, key: string) {
    const session = await this.repo.get(t, id);
    await this.allow(i, t, 'cash.reconcile', session.branchId);
    return this.repo.reconcile(t, i.userId, id, key);
  }
  async close(
    i: SessionIdentity,
    t: string,
    id: string,
    b: Parameters<CashRepository['close']>[3],
  ) {
    const session = await this.repo.get(t, id);
    await this.allow(
      i,
      t,
      b.force ? 'cash.session.force_close' : 'cash.session.close',
      session.branchId,
    );
    return this.repo.close(t, i.userId, id, b);
  }
  async get(i: SessionIdentity, t: string, id: string) {
    await this.allow(i, t, 'cash.session.read');
    return this.repo.get(t, id);
  }
  async active(i: SessionIdentity, t: string, branchId: string) {
    await this.allow(i, t, 'cash.session.read', branchId);
    return this.repo.active(t, branchId);
  }
  async timeline(i: SessionIdentity, t: string, id: string) {
    await this.allow(i, t, 'cash.timeline.read');
    return this.repo.timeline(t, id);
  }
  async summary(i: SessionIdentity, t: string, id: string) {
    await this.allow(i, t, 'cash.session.read');
    return this.repo.summary(t, id);
  }
  async transition(
    i: SessionIdentity,
    t: string,
    id: string,
    to: 'SUSPENDED' | 'OPEN',
    b: Omit<Parameters<CashRepository['transition']>[3], 'to'>,
  ) {
    const session = await this.repo.get(t, id);
    await this.allow(
      i,
      t,
      to === 'SUSPENDED' ? 'cash.session.suspend' : 'cash.session.resume',
      session.branchId,
    );
    return this.repo.transition(t, i.userId, id, { ...b, to });
  }
  async policy(i: SessionIdentity, t: string, branchId?: string, registerId?: string) {
    await this.allow(i, t, 'cash.register.read', branchId);
    return this.repo.policy(t, branchId, registerId);
  }
  async savePolicy(i: SessionIdentity, t: string, b: Parameters<CashRepository['savePolicy']>[2]) {
    await this.allow(i, t, 'cash.register.manage', b.branchId);
    return this.repo.savePolicy(t, i.userId, b);
  }
  async requestApproval(
    i: SessionIdentity,
    t: string,
    b: Parameters<CashRepository['requestApproval']>[2],
  ) {
    await this.allow(i, t, 'cash.movement.create', b.branchId);
    return this.repo.requestApproval(t, i.userId, b);
  }
  async decideApproval(
    i: SessionIdentity,
    t: string,
    id: string,
    b: Parameters<CashRepository['decideApproval']>[3],
  ) {
    return this.repo.decideApproval(t, i.userId, id, b);
  }
  async approvals(i: SessionIdentity, t: string, b: string) {
    await this.allow(i, t, 'cash.approve', b);
    return this.repo.approvals(t, b);
  }
  async deposit(
    i: SessionIdentity,
    t: string,
    id: string,
    b: Parameters<CashRepository['prepareDeposit']>[4],
  ) {
    const session = await this.repo.get(t, id);
    await this.allow(i, t, 'cash.deposit', session.branchId);
    const m = await this.authorization.activeMembershipId(i, t, session.branchId);
    return this.repo.prepareDeposit(t, i.userId, m, id, b);
  }
  async depositTransition(
    i: SessionIdentity,
    t: string,
    id: string,
    b: Parameters<CashRepository['updateDeposit']>[4],
  ) {
    await this.allow(i, t, 'cash.deposit');
    const m = await this.authorization.activeMembershipId(i, t);
    return this.repo.updateDeposit(t, i.userId, m, id, b);
  }
  async transfer(i: SessionIdentity, t: string, b: Parameters<CashRepository['transfer']>[3]) {
    await this.allow(i, t, 'cash.transfer');
    const m = await this.authorization.activeMembershipId(i, t);
    return this.repo.transfer(t, i.userId, m, b);
  }
  async reopen(
    i: SessionIdentity,
    t: string,
    id: string,
    b: Parameters<CashRepository['reopen']>[3],
  ) {
    const session = await this.repo.get(t, id);
    await this.allow(i, t, 'cash.session.reopen', session.branchId);
    return this.repo.reopen(t, i.userId, id, b);
  }
  async initiateHandoff(
    i: SessionIdentity,
    t: string,
    id: string,
    b: Parameters<CashRepository['initiateHandoff']>[4],
  ) {
    const session = await this.repo.get(t, id);
    await this.allow(i, t, 'cash.session.handoff', session.branchId);
    const membershipId = await this.authorization.activeMembershipId(i, t, session.branchId);
    return this.repo.initiateHandoff(t, i.userId, membershipId, id, b);
  }
  async countHandoff(
    i: SessionIdentity,
    t: string,
    id: string,
    b: Parameters<CashRepository['countHandoff']>[3],
  ) {
    const handoff = (await this.repo.getHandoff(t, id)) as { branchId: string };
    await this.allow(i, t, 'cash.count', handoff.branchId);
    return this.repo.countHandoff(t, i.userId, id, b);
  }
  async decideHandoff(
    i: SessionIdentity,
    t: string,
    id: string,
    b: Parameters<CashRepository['decideHandoff']>[3],
  ) {
    const handoff = (await this.repo.getHandoff(t, id)) as { branchId: string };
    await this.allow(
      i,
      t,
      b.decision === 'CANCELLED' ? 'cash.session.handoff' : 'cash.session.handoff.accept',
      handoff.branchId,
    );
    return this.repo.decideHandoff(t, i.userId, id, b);
  }
  async completeHandoff(
    i: SessionIdentity,
    t: string,
    id: string,
    b: Parameters<CashRepository['completeHandoff']>[3],
  ) {
    const handoff = (await this.repo.getHandoff(t, id)) as { branchId: string };
    await this.allow(i, t, 'cash.session.handoff', handoff.branchId);
    return this.repo.completeHandoff(t, i.userId, id, b);
  }
  async getHandoff(i: SessionIdentity, t: string, id: string) {
    const handoff = (await this.repo.getHandoff(t, id)) as { branchId: string };
    await this.allow(i, t, 'cash.session.read', handoff.branchId);
    return handoff;
  }
  async registers(i: SessionIdentity, t: string, b: string) {
    await this.allow(i, t, 'cash.register.read', b);
    return this.repo.registers(t, b);
  }
  async drawers(i: SessionIdentity, t: string, b: string) {
    await this.allow(i, t, 'cash.drawer.read', b);
    return this.repo.drawers(t, b);
  }
  async quarantine(
    i: SessionIdentity,
    t: string,
    branchId: string | undefined,
    sourceModule: 'CASH' | 'SALES' | undefined,
    offset: number,
    limit: number,
  ) {
    await this.allow(i, t, 'integrations.quarantine.read', branchId);
    return this.repo.quarantine(t, branchId, sourceModule, offset, limit);
  }
  async operations(i: SessionIdentity, t: string, branchId?: string) {
    await this.allow(i, t, 'integrations.quarantine.read', branchId);
    return this.repo.operations(t, branchId);
  }
}
