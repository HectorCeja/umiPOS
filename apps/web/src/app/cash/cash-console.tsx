'use client';

import { openApiOperations } from '@nexo/sdk';
import {
  ApprovalCard,
  Button,
  CashOperationalSummary,
  CashSessionStatus,
  CashSurface,
  CashTimeline,
  DenominationCounter,
  DepositLifecycle,
  DrawerStatus,
  HandoffStepper,
  IntegrationSinkStatus,
  NexoSelect,
  OutboxStatus,
  QuarantineTable,
  ReconciliationSummary,
  TextField,
  TransferSummary,
  PremiumToastPortal,
} from '@nexo/ui';
import { NexoEditorialHeader } from '../nexo-editorial-header';
import { apiFetch, browserUuid } from '../../lib/api-client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionNavigation } from '../section-navigation';
import { cashPointPresets, cashReasonPresets } from '../business-presets';
import { useActiveOrganization } from '../active-organization';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const path = (template: string, organizationId: string) =>
  template.replace('{organizationId}', encodeURIComponent(organizationId));
const displayAmount = (value: unknown, fallback = 'Sin importe registrado') => {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;
  const amount = Number(value) / 100;
  if (!Number.isFinite(amount)) return fallback;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};
const cashToastTitle = (detail: string) => {
  if (/punto de cobro/iu.test(detail)) return 'Punto de cobro listo';
  if (/cajón/iu.test(detail)) return 'Cajón listo';
  if (/abierta/iu.test(detail)) return 'Caja abierta';
  if (/cerrada/iu.test(detail)) return 'Caja cerrada';
  return 'Movimiento registrado';
};

interface OperationalStatus {
  worker: string;
  cashPending: number;
  cashQuarantined: number;
  salesPending: number;
  salesQuarantined: number;
  localUmiSinkDeliveries: number;
}
interface Register {
  id: string;
  name: string;
  code: string;
  status: string;
  version: number;
}
interface Drawer {
  id: string;
  name: string;
  code: string;
  status: string;
  version: number;
  registerId?: string;
}
interface CashSession {
  id: string;
  status: string;
  version: number;
  currency: string;
  expectedAmountMinor: string;
}
interface Approval {
  id: string;
  actionType: string;
  requestedBy: string;
  status: string;
  version?: number;
}
interface QuarantineItem {
  eventId: string;
  eventType: string;
  sourceModule: string;
  attempts: number;
  errorCode: string;
  message: string;
  status: string;
}

export function CashConsole() {
  const activeContext = useActiveOrganization();
  const organizationId = activeContext.organization?.id ?? '';
  const branchId = activeContext.branch?.id ?? '';
  const [status, setStatus] = useState<OperationalStatus | null>(null);
  const [registers, setRegisters] = useState<Register[]>([]);
  const [drawers, setDrawers] = useState<Drawer[]>([]);
  const [selectedRegisterId, setSelectedRegisterId] = useState('');
  const [selectedDrawerId, setSelectedDrawerId] = useState('');
  const [session, setSession] = useState<CashSession | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [quarantine, setQuarantine] = useState<QuarantineItem[]>([]);
  const [timeline, setTimeline] = useState<Parameters<typeof CashTimeline>[0]['events']>([]);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [name, setName] = useState('Caja principal');
  const [code, setCode] = useState('CASH-01');
  const [amount, setAmount] = useState('100.00');
  const [reason, setReason] = useState('Fondo adicional para cambio');
  const [resourceId, setResourceId] = useState('');
  const [depositId, setDepositId] = useState('');
  const [handoffId, setHandoffId] = useState('');
  const [handoffVersion, setHandoffVersion] = useState(1);
  const [targetSessionId, setTargetSessionId] = useState('');
  const [incomingCashierId, setIncomingCashierId] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [organizationName, setOrganizationName] = useState('Organización');
  const [branchName, setBranchName] = useState('Sucursal');

  const refresh = useCallback(async () => {
    if (!organizationId || !branchId) return;
    setLoading(true);
    setError('');
    try {
      const query = `?branchId=${encodeURIComponent(branchId)}`;
      const [
        statusResponse,
        registersResponse,
        drawersResponse,
        activeResponse,
        approvalsResponse,
        quarantineResponse,
        organizationResponse,
        branchesResponse,
      ] = await Promise.all([
        apiFetch(
          `${apiBase}${path(openApiOperations.getCashIntegrationOperationalStatus.path, organizationId)}${query}`,
          { credentials: 'include' },
        ),
        apiFetch(
          `${apiBase}${path(openApiOperations.listCashRegisters.path, organizationId)}${query}`,
          {
            credentials: 'include',
          },
        ),
        apiFetch(
          `${apiBase}${path(openApiOperations.listCashDrawers.path, organizationId)}${query}`,
          {
            credentials: 'include',
          },
        ),
        apiFetch(
          `${apiBase}${path(openApiOperations.getActiveCashSession.path, organizationId)}${query}`,
          {
            credentials: 'include',
          },
        ),
        apiFetch(
          `${apiBase}${path(openApiOperations.listCashApprovals.path, organizationId)}${query}`,
          {
            credentials: 'include',
          },
        ),
        apiFetch(
          `${apiBase}${path(openApiOperations.listCashIntegrationQuarantine.path, organizationId)}${query}`,
          { credentials: 'include' },
        ),
        apiFetch(`${apiBase}/v1/organizations/${organizationId}`),
        apiFetch(`${apiBase}/v1/organizations/${organizationId}/branches`),
      ]);
      if (
        ![
          statusResponse,
          registersResponse,
          drawersResponse,
          activeResponse,
          approvalsResponse,
          quarantineResponse,
        ].every((response) => response.ok)
      ) {
        throw new Error('No pudimos cargar Caja. Revisa tu sesión, permisos y sucursal.');
      }
      setStatus((await statusResponse.json()) as OperationalStatus);
      const registerValues = (await registersResponse.json()) as Register[];
      const drawerValues = (await drawersResponse.json()) as Drawer[];
      setRegisters(registerValues);
      setDrawers(drawerValues);
      setSelectedRegisterId((current) =>
        registerValues.some((item) => item.id === current)
          ? current
          : (registerValues[0]?.id ?? ''),
      );
      setSelectedDrawerId((current) =>
        drawerValues.some((item) => item.id === current) ? current : (drawerValues[0]?.id ?? ''),
      );
      const active = (await activeResponse.json()) as CashSession | null;
      setSession(active);
      setApprovals((await approvalsResponse.json()) as Approval[]);
      setQuarantine(((await quarantineResponse.json()) as { items: QuarantineItem[] }).items);
      if (organizationResponse.ok) {
        setOrganizationName(((await organizationResponse.json()) as { name: string }).name);
      }
      if (branchesResponse.ok) {
        const branchValues = (await branchesResponse.json()) as { id: string; name: string }[];
        setBranchName(branchValues.find((item) => item.id === branchId)?.name ?? 'Sucursal');
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'No pudimos cargar Caja. Intenta de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  }, [branchId, organizationId]);

  const refreshAndReveal = async () => {
    await refresh();
    revealSection('overview');
  };

  useEffect(() => {
    if (organizationId && branchId) void refresh();
  }, [refresh]);

  const selectedRegister = useMemo(
    () => registers.find((item) => item.id === selectedRegisterId),
    [registers, selectedRegisterId],
  );
  const selectedDrawer = useMemo(
    () => drawers.find((item) => item.id === selectedDrawerId),
    [drawers, selectedDrawerId],
  );
  const validAmount = /^\d+(?:\.\d{1,2})?$/.test(amount) && Number(amount) > 0;
  const amountMinor = String(Math.round(Number(amount) * 100));
  const selectRegister = (register: Register) => {
    setSelectedRegisterId(register.id);
    setName(friendlyRegisterName(register.name));
    setCode(register.code);
    const assigned = drawers.find((drawer) => drawer.registerId === register.id);
    if (assigned) setSelectedDrawerId(assigned.id);
  };
  const selectDrawer = (drawer: Drawer) => {
    setSelectedDrawerId(drawer.id);
    setName(friendlyRegisterName(drawer.name).replace(/ · Cajón$/u, ''));
    setCode(drawer.code.replace(/-D$/u, ''));
  };

  const csrf = () =>
    document.cookie
      .split('; ')
      .find((value) => value.startsWith('nexo_csrf='))
      ?.slice('nexo_csrf='.length) ?? '';
  const operationPath = (template: string, values: Record<string, string>) =>
    Object.entries(values).reduce(
      (result, [key, value]) => result.replace(`{${key}}`, encodeURIComponent(value)),
      template,
    );
  const command = useCallback(
    async (
      template: string,
      values: Record<string, string>,
      body: Record<string, unknown>,
      method: 'POST' | 'PATCH' = 'POST',
    ) => {
      setLoading(true);
      setError('');
      setNotice('');
      try {
        const response = await apiFetch(`${apiBase}${operationPath(template, values)}`, {
          method,
          credentials: 'include',
          headers: { 'content-type': 'application/json', 'x-csrf-token': csrf() },
          body: JSON.stringify(body),
        });
        const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
        if (!response.ok) {
          const detail =
            typeof payload.detail === 'string'
              ? payload.detail
              : `HTTP ${response.status.toString()}`;
          throw new Error(cashErrorMessage(response.status, detail));
        }
        setNotice(
          template === openApiOperations.createCashRegister.path
            ? 'Punto de cobro creado. Ya puedes asociarle un cajón de efectivo.'
            : template === openApiOperations.createCashDrawer.path
              ? 'Cajón de efectivo creado y asociado al punto seleccionado.'
              : template.includes('/close')
                ? 'Caja cerrada con seguridad. El conteo y la diferencia quedaron registrados.'
                : template.includes('/open')
                  ? 'Caja abierta. El turno ya está listo para registrar ventas.'
                  : 'Movimiento confirmado. El saldo esperado de la caja ya fue actualizado.',
        );
        if (
          template.includes('/cash/sessions') &&
          typeof payload.id === 'string' &&
          typeof payload.status === 'string' &&
          typeof payload.version === 'number'
        ) {
          setSession((current) => ({ ...current, ...payload }) as unknown as CashSession);
        }
        if (
          typeof payload.id === 'string' &&
          payload.id === handoffId &&
          typeof payload.version === 'number'
        ) {
          setHandoffVersion(payload.version);
        }
        if (
          template === openApiOperations.createCashRegister.path &&
          typeof payload.id === 'string'
        ) {
          setSelectedRegisterId(payload.id);
          if (typeof payload.name === 'string') setName(payload.name);
          if (typeof payload.code === 'string') setCode(payload.code);
        }
        if (
          template === openApiOperations.createCashDrawer.path &&
          typeof payload.id === 'string'
        ) {
          setSelectedDrawerId(payload.id);
        }
        await refresh();
        if (template === openApiOperations.countCash.path && session?.id) {
          const summaryResponse = await apiFetch(
            `${apiBase}${operationPath(openApiOperations.getCashOperationalSummary.path, {
              organizationId,
              sessionId: session.id,
            })}`,
            { credentials: 'include' },
          );
          if (summaryResponse.ok) {
            setSummary((await summaryResponse.json()) as Record<string, unknown>);
          }
        }
        return payload;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'No pudimos completar la operación.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handoffId, organizationId, refresh, session?.id],
  );

  const ids = () => ({ organizationId });
  const sessionIds = () => ({ organizationId, sessionId: session?.id ?? '' });
  const idempotency = () => browserUuid();

  const items = [
    { id: 'overview', label: 'Resumen' },
    { id: 'session', label: 'Sesión actual' },
    { id: 'operations', label: 'Movimientos y cierre' },
    { id: 'approvals', label: 'Aprobaciones' },
  ];
  return (
    <div className="module-surface cash-premium" data-module="cash">
      <NexoEditorialHeader
        eyebrow="CONTROL OPERATIVO"
        title="Administración de Caja"
        description="Supervisa sesiones, movimientos y cierres de efectivo."
        statement={
          <>
            Precisión en cada
            <br />
            movimiento.
          </>
        }
        tone="cash"
        actions={
          <Button loading={loading} onClick={() => void refreshAndReveal()}>
            Actualizar
          </Button>
        }
      />
      <SectionNavigation items={items} />
      <div className="business-context" aria-label="Contexto operativo">
        <span>
          <small>Organización</small>
          <strong>{organizationName}</strong>
        </span>
        <span>
          <small>Sucursal</small>
          <strong>{branchName}</strong>
        </span>
        <span>
          <small>Estado</small>
          <strong>En línea</strong>
        </span>
      </div>
      {(error || notice) && (
        <PremiumToastPortal
          label="Notificaciones de Caja"
          title={error ? 'No pudimos completar la acción' : cashToastTitle(notice)}
          detail={error || notice}
          tone={error ? 'danger' : 'success'}
          onDismiss={() => {
            setError('');
            setNotice('');
          }}
        />
      )}
      <section id="overview">
        <CashSurface title="Resumen de caja">
          <CashOperationalSummary
            currency="MXN"
            opening="Sin sesión abierta"
            movements="Sin movimientos todavía"
            expected="Disponible al abrir una sesión"
          />
          <details className="cash-help">
            <summary>Cómo funciona Caja</summary>
            <ol>
              <li>Selecciona o crea un punto de cobro.</li>
              <li>Asocia un cajón de efectivo.</li>
              <li>Abre una sesión con el fondo inicial contado.</li>
              <li>Opera ventas y registra movimientos extraordinarios con un motivo.</li>
              <li>Cuenta el efectivo y cierra o entrega el turno.</li>
            </ol>
          </details>
          <div className="cash-selection-grid" role="radiogroup" aria-label="Puntos de cobro">
            {registers.map((register) => (
              <button
                type="button"
                className={`cash-select-card${register.id === selectedRegisterId ? ' is-selected' : ''}`}
                role="radio"
                aria-checked={register.id === selectedRegisterId}
                key={register.id}
                onClick={() => {
                  selectRegister(register);
                }}
              >
                <strong>{friendlyRegisterName(register.name)}</strong>
                <span>{register.code} · Punto de cobro</span>
                <small>
                  {register.status === 'ACTIVE' ? 'Activo' : 'No disponible'} · {branchName}
                </small>
              </button>
            ))}
          </div>
          <div className="cash-selection-grid" role="radiogroup" aria-label="Cajones de efectivo">
            {drawers.map((drawer) => (
              <button
                type="button"
                className={`cash-select-card${drawer.id === selectedDrawerId ? ' is-selected' : ''}`}
                role="radio"
                aria-checked={drawer.id === selectedDrawerId}
                key={drawer.id}
                onClick={() => {
                  selectDrawer(drawer);
                }}
              >
                <strong>{friendlyRegisterName(drawer.name)}</strong>
                <span>{drawer.code} · Cajón de efectivo</span>
                <small>
                  {drawer.status === 'ASSIGNED' ? 'Asociado' : 'Disponible'} · {branchName}
                </small>
              </button>
            ))}
          </div>
          <details className="advanced-settings">
            <summary>Configurar puntos de cobro</summary>
            <div className="nexo-grid" aria-label="Administrar puntos de cobro y cajones">
              <NexoSelect
                label="Nombre"
                value={name}
                onValueChange={setName}
                options={cashPointPresets.map((preset) => ({ value: preset, label: preset }))}
                searchable
                allowCustom
              />
              <TextField
                label="Código"
                value={code}
                onChange={(event) => {
                  setCode(event.currentTarget.value);
                }}
              />
            </div>
            <div className="nexo-cluster">
              <Button
                loading={loading}
                disabled={!name.trim() || !code.trim()}
                onClick={() =>
                  void command(openApiOperations.createCashRegister.path, ids(), {
                    branchId,
                    name,
                    code,
                    currency: 'MXN',
                  })
                }
              >
                Crear punto de cobro
              </Button>
              <Button
                variant="secondary"
                disabled={!selectedRegister}
                onClick={() =>
                  void command(
                    openApiOperations.updateCashRegister.path,
                    { organizationId, registerId: selectedRegister?.id ?? '' },
                    { name, status: 'ACTIVE', version: selectedRegister?.version ?? 0 },
                    'PATCH',
                  )
                }
              >
                Guardar punto de cobro seleccionado
              </Button>
              <Button
                disabled={!selectedRegister}
                onClick={() =>
                  void command(openApiOperations.createCashDrawer.path, ids(), {
                    branchId,
                    name: `${name} · Cajón`,
                    code: `${code}-D`,
                    registerId: selectedRegister?.id,
                  })
                }
              >
                Crear cajón de efectivo
              </Button>
              <Button
                variant="secondary"
                disabled={!selectedDrawer || !selectedRegister}
                onClick={() =>
                  void command(
                    openApiOperations.updateCashDrawer.path,
                    { organizationId, drawerId: selectedDrawer?.id ?? '' },
                    {
                      name: `${name} · Cajón`,
                      status: 'ASSIGNED',
                      registerId: selectedRegister?.id,
                      version: selectedDrawer?.version ?? 0,
                    },
                    'PATCH',
                  )
                }
              >
                Guardar cajón seleccionado
              </Button>
            </div>
          </details>
        </CashSurface>
      </section>
      <section id="session">
        <CashSurface title="Sesión activa">
          <CashSessionStatus status={session?.status ?? 'NO_ACTIVE_SESSION'} />
          <DrawerStatus status={selectedDrawer?.status ?? 'UNAVAILABLE'} />
          <div className="nexo-cluster">
            <Button
              disabled={!selectedRegister || !selectedDrawer || Boolean(session) || !validAmount}
              onClick={() =>
                void command(openApiOperations.openCashSession.path, ids(), {
                  branchId,
                  registerId: selectedRegister?.id,
                  drawerId: selectedDrawer?.id,
                  currency: 'MXN',
                  businessDate: new Date().toISOString().slice(0, 10),
                  openingFloatMinor: amountMinor,
                  idempotencyKey: idempotency(),
                  correlationId: browserUuid(),
                })
              }
            >
              Abrir sesión
            </Button>
            <Button
              variant="secondary"
              disabled={!session || !['OPEN', 'SUSPENDED'].includes(session.status)}
              onClick={() =>
                void command(
                  session?.status === 'SUSPENDED'
                    ? openApiOperations.resumeCashSession.path
                    : openApiOperations.suspendCashSession.path,
                  sessionIds(),
                  {
                    version: session?.version,
                    reason,
                    idempotencyKey: idempotency(),
                  },
                )
              }
            >
              {session?.status === 'SUSPENDED' ? 'Reanudar' : 'Suspender'}
            </Button>
            <Button
              variant="danger"
              disabled={!session || session.status !== 'OPEN'}
              onClick={() =>
                void command(openApiOperations.closeCashSession.path, sessionIds(), {
                  version: session?.version,
                  force: true,
                  reason,
                  idempotencyKey: idempotency(),
                })
              }
            >
              Forzar cierre
            </Button>
          </div>
          <ReconciliationSummary
            expected={displayAmount(summary?.expectedAmountMinor, session?.expectedAmountMinor)}
            counted={displayAmount(summary?.countedAmountMinor)}
            variance={displayAmount(summary?.varianceMinor)}
          />
          <Button
            variant="secondary"
            disabled={!session}
            onClick={() =>
              void (async () => {
                if (!session) return;
                const values = { organizationId, sessionId: session.id };
                const [timelineResponse, summaryResponse] = await Promise.all([
                  apiFetch(
                    `${apiBase}${operationPath(openApiOperations.getCashTimeline.path, values)}`,
                    { credentials: 'include' },
                  ),
                  apiFetch(
                    `${apiBase}${operationPath(openApiOperations.getCashOperationalSummary.path, values)}`,
                    { credentials: 'include' },
                  ),
                ]);
                if (!timelineResponse.ok || !summaryResponse.ok) {
                  setError('No pudimos consultar la actividad y el resumen para esta sucursal.');
                  return;
                }
                const ledger = (await timelineResponse.json()) as {
                  id: string;
                  movementType: string;
                  amountMinor: string;
                  currency: string;
                }[];
                setTimeline(
                  ledger.map((entry) => ({
                    id: entry.id,
                    title: cashMovementLabel(entry.movementType),
                    detail: new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: entry.currency,
                    }).format(Number(entry.amountMinor) / 100),
                  })),
                );
                setSummary((await summaryResponse.json()) as Record<string, unknown>);
              })()
            }
          >
            Consultar actividad y resumen
          </Button>
          <CashTimeline events={timeline} />
        </CashSurface>
      </section>
      <section id="operations">
        <CashSurface title="Movimientos, depósitos y transferencias">
          <div className="cash-movement-grid">
            <TextField
              label="Monto"
              value={amount}
              onChange={(event) => {
                setAmount(event.currentTarget.value);
              }}
              help="Importe en pesos. Puedes incluir centavos, por ejemplo 250.50."
              inputMode="decimal"
            />
            <NexoSelect
              label="Motivo"
              value={reason}
              onValueChange={setReason}
              options={cashReasonPresets.map((preset) => ({ value: preset, label: preset }))}
              searchable
              allowCustom
            />
            <TextField
              label="Turno que recibirá el efectivo"
              value={targetSessionId}
              onChange={(event) => {
                setTargetSessionId(event.currentTarget.value);
              }}
            />
            <TextField
              label="Comprobante del depósito"
              value={depositId}
              onChange={(event) => {
                setDepositId(event.currentTarget.value);
              }}
            />
          </div>
          <div className="nexo-cluster">
            {(['CASH_IN', 'CASH_OUT', 'WITHDRAWAL'] as const).map((type) => (
              <Button
                key={type}
                disabled={!session || session.status !== 'OPEN' || !validAmount || !reason.trim()}
                variant={type === 'CASH_IN' ? 'primary' : 'secondary'}
                onClick={() =>
                  void command(openApiOperations.recordCashMovement.path, sessionIds(), {
                    type,
                    amountMinor,
                    currency: session?.currency ?? 'MXN',
                    reason,
                    idempotencyKey: idempotency(),
                    correlationId: browserUuid(),
                  })
                }
              >
                {type === 'CASH_IN'
                  ? 'Entrada de efectivo'
                  : type === 'CASH_OUT'
                    ? 'Salida de efectivo'
                    : 'Retiro'}
              </Button>
            ))}
          </div>
          <DenominationCounter rows={[]} />
          <div className="nexo-cluster">
            <Button
              disabled={!session || session.status !== 'OPEN' || !validAmount || !reason.trim()}
              onClick={() =>
                void (async () => {
                  const result = await command(
                    openApiOperations.prepareCashDeposit.path,
                    sessionIds(),
                    {
                      amountMinor,
                      currency: session?.currency ?? 'MXN',
                      destination: 'Caja fuerte',
                      reason,
                      correlationId: browserUuid(),
                      idempotencyKey: idempotency(),
                    },
                  );
                  if (typeof result?.id === 'string') setDepositId(result.id);
                })()
              }
            >
              Preparar depósito
            </Button>
            {(['HANDED_OVER', 'CONFIRMED_MANUALLY', 'CANCELLED'] as const).map((statusValue) => (
              <Button
                key={statusValue}
                variant="secondary"
                disabled={!depositId}
                onClick={() =>
                  void command(
                    openApiOperations.transitionCashDeposit.path,
                    { organizationId, depositId },
                    { status: statusValue, reason, idempotencyKey: idempotency() },
                  )
                }
              >
                {statusValue === 'HANDED_OVER'
                  ? 'Entregar depósito'
                  : statusValue === 'CONFIRMED_MANUALLY'
                    ? 'Confirmar depósito'
                    : 'Cancelar depósito'}
              </Button>
            ))}
          </div>
          <DepositLifecycle status={depositId ? 'IN_PROGRESS' : 'EMPTY'} />
          <TransferSummary
            source={session?.id ?? 'Selecciona origen'}
            destination={targetSessionId || 'Selecciona destino'}
            amount={amountMinor}
          />
          <Button
            disabled={
              !session ||
              session.status !== 'OPEN' ||
              !targetSessionId ||
              !validAmount ||
              !reason.trim()
            }
            onClick={() =>
              void command(openApiOperations.transferCash.path, ids(), {
                sourceSessionId: session?.id,
                destinationSessionId: targetSessionId,
                amountMinor,
                currency: session?.currency ?? 'MXN',
                reason,
                correlationId: browserUuid(),
                idempotencyKey: idempotency(),
              })
            }
          >
            Transferir
          </Button>
          <div className="nexo-cluster">
            <Button
              disabled={!session || session.status !== 'OPEN' || !validAmount}
              onClick={() =>
                void command(openApiOperations.countCash.path, sessionIds(), {
                  currency: session?.currency ?? 'MXN',
                  denominations: [{ denominationMinor: amountMinor, quantity: 1 }],
                  idempotencyKey: idempotency(),
                })
              }
            >
              Contar denominación
            </Button>
            <Button
              disabled={!session || !summary?.countedAmountMinor}
              onClick={() =>
                void command(openApiOperations.reconcileCashSession.path, sessionIds(), {
                  idempotencyKey: idempotency(),
                })
              }
            >
              Reconciliar
            </Button>
            <Button
              disabled={!session || !summary?.countedAmountMinor}
              onClick={() =>
                void command(openApiOperations.closeCashSession.path, sessionIds(), {
                  version: session?.version,
                  idempotencyKey: idempotency(),
                  reason,
                })
              }
            >
              Cerrar sesión
            </Button>
          </div>
          <HandoffStepper status="INITIATED" />
          <div className="nexo-grid">
            <TextField
              label="Persona que recibe la caja"
              value={incomingCashierId}
              onChange={(event) => {
                setIncomingCashierId(event.currentTarget.value);
              }}
            />
            <TextField
              label="Referencia de entrega"
              value={handoffId}
              onChange={(event) => {
                setHandoffId(event.currentTarget.value);
              }}
            />
            <TextField
              label="Referencia de aprobación"
              value={resourceId}
              onChange={(event) => {
                setResourceId(event.currentTarget.value);
              }}
            />
          </div>
          <div className="nexo-cluster">
            <Button
              disabled={!session || !incomingCashierId}
              onClick={() =>
                void (async () => {
                  const result = await command(
                    openApiOperations.initiateCashShiftHandoff.path,
                    sessionIds(),
                    {
                      incomingCashierId,
                      reason,
                      expiresAt: new Date(Date.now() + 600_000).toISOString(),
                      correlationId: browserUuid(),
                      idempotencyKey: idempotency(),
                    },
                  );
                  if (typeof result?.id === 'string') setHandoffId(result.id);
                  if (typeof result?.version === 'number') setHandoffVersion(result.version);
                })()
              }
            >
              Iniciar entrega de turno
            </Button>
            <Button
              disabled={!handoffId}
              onClick={() =>
                void command(
                  openApiOperations.countCashShiftHandoff.path,
                  { organizationId, handoffId },
                  {
                    totalMinor: amountMinor,
                    version: handoffVersion,
                    idempotencyKey: idempotency(),
                  },
                )
              }
            >
              Contar para la entrega
            </Button>
            {(['ACCEPTED', 'REJECTED', 'CANCELLED'] as const).map((decision) => (
              <Button
                key={decision}
                variant="secondary"
                disabled={!handoffId}
                onClick={() =>
                  void command(
                    openApiOperations.decideCashShiftHandoff.path,
                    { organizationId, handoffId },
                    { decision, reason, version: handoffVersion, idempotencyKey: idempotency() },
                  )
                }
              >
                {decision === 'ACCEPTED'
                  ? 'Aceptar entrega'
                  : decision === 'REJECTED'
                    ? 'Rechazar entrega'
                    : 'Cancelar entrega'}
              </Button>
            ))}
            <Button
              disabled={!handoffId}
              onClick={() =>
                void command(
                  openApiOperations.completeCashShiftHandoff.path,
                  { organizationId, handoffId },
                  { version: handoffVersion, idempotencyKey: idempotency() },
                )
              }
            >
              Completar entrega de turno
            </Button>
          </div>
          <Button
            variant="secondary"
            disabled={!session || !resourceId}
            onClick={() =>
              void command(openApiOperations.reopenCashSession.path, sessionIds(), {
                version: session?.version,
                reason,
                approvalId: resourceId,
                correlationId: browserUuid(),
                idempotencyKey: idempotency(),
              })
            }
          >
            Reabrir con aprobación
          </Button>
        </CashSurface>
      </section>
      <section id="approvals">
        <CashSurface title="Aprobaciones y diferencias">
          {approvals.length === 0 ? (
            <ApprovalCard
              action="Sin solicitudes pendientes"
              requester="Nadie requiere una decisión"
              status="EMPTY"
            />
          ) : (
            approvals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                action={approval.actionType}
                requester={approval.requestedBy}
                status={approval.status}
              />
            ))
          )}
          <div className="nexo-cluster">
            <Button
              disabled={!session && !resourceId}
              onClick={() =>
                void (async () => {
                  const result = await command(openApiOperations.requestCashApproval.path, ids(), {
                    branchId,
                    actionType: 'WITHDRAWAL',
                    resourceId: resourceId || session?.id,
                    requiredPermission: 'cash.withdraw',
                    thresholdMinor: amountMinor,
                    reason,
                    expiresAt: new Date(Date.now() + 600_000).toISOString(),
                    correlationId: browserUuid(),
                    idempotencyKey: idempotency(),
                  });
                  if (typeof result?.id === 'string') setResourceId(result.id);
                })()
              }
            >
              Solicitar aprobación
            </Button>
            {(['APPROVED', 'REJECTED'] as const).map((decision) => (
              <Button
                key={decision}
                variant="secondary"
                disabled={!approvals[0]}
                onClick={() =>
                  void command(
                    openApiOperations.decideCashApproval.path,
                    { organizationId, approvalId: approvals[0]?.id ?? '' },
                    {
                      decision,
                      reason,
                      version: approvals[0]?.version ?? 1,
                      idempotencyKey: idempotency(),
                    },
                  )
                }
              >
                {decision === 'APPROVED' ? 'Aprobar' : 'Rechazar'}
              </Button>
            ))}
          </div>
        </CashSurface>
      </section>
      <details className="advanced-diagnostics">
        <summary>Ver diagnóstico avanzado</summary>
        <CashSurface title="Estado de procesamiento">
          <OutboxStatus
            pending={(status?.cashPending ?? 0) + (status?.salesPending ?? 0)}
            quarantined={(status?.cashQuarantined ?? 0) + (status?.salesQuarantined ?? 0)}
          />
          <QuarantineTable items={quarantine} />
          <IntegrationSinkStatus
            deliveries={status?.localUmiSinkDeliveries ?? 0}
            status={status?.worker ?? 'PENDING'}
          />
        </CashSurface>
      </details>
    </div>
  );
}

function revealSection(id: string) {
  const node = document.getElementById(id);
  if (!node) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  node.setAttribute('tabindex', '-1');
  node.focus({ preventScroll: true });
  node.classList.add('is-revealed');
  window.setTimeout(() => {
    node.classList.remove('is-revealed');
  }, 1800);
}

function cashMovementLabel(value: string) {
  const labels: Record<string, string> = {
    CASH_IN: 'Entrada de efectivo',
    CASH_OUT: 'Salida de efectivo',
    WITHDRAWAL: 'Retiro',
    CASH_SALE: 'Venta en efectivo',
    CASH_REFUND: 'Devolución en efectivo',
    OPENING_FLOAT: 'Fondo inicial',
  };
  return labels[value] ?? 'Movimiento de caja';
}

function friendlyRegisterName(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes('refund')) return 'Caja de reembolsos';
  if (normalized.includes('transfer')) return 'Caja de transferencias';
  if (normalized.includes('approver')) return 'Caja con aprobación dual';
  if (normalized.includes('suspend') || normalized.includes('race'))
    return 'Caja operativa auxiliar';
  return value;
}

function cashErrorMessage(status: number, detail: string) {
  if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente para continuar.';
  if (status === 403) return 'No tienes permiso para realizar esta operación.';
  if (status === 409) {
    if (/already|open session|active session/iu.test(detail))
      return 'Esta caja ya tiene una sesión abierta. Cierra la sesión actual antes de abrir otra.';
    return 'El estado de Caja cambió. Actualiza la pantalla y continúa desde la acción disponible.';
  }
  if (status === 400 || status === 422)
    return 'Revisa los datos capturados y selecciona un punto de cobro y cajón válidos.';
  if (status >= 500)
    return 'Caja no pudo procesar la operación. El estado se conservó; intenta de nuevo o solicita soporte.';
  return detail;
}
