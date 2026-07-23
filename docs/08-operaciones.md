# Entrega, observabilidad y continuidad

## Estrategia CI/CD

Trunk-based con ramas cortas y PR protegida. Pipeline reproducible:

1. Validación documental, formato, lint, tipos y límites modulares.
2. Unit/property, componentes con servicios efímeros y contratos.
3. Secret scan, SAST, SCA/licencias, IaC y contenedor.
4. Build único hermético; SBOM, firma y provenance; push a registro inmutable.
5. E2E/accesibilidad/DAST en ambiente efímero.
6. Promoción del mismo digest a staging, pruebas de humo/carga selectiva y aprobación basada en riesgo.
7. Producción canary/blue-green, migración expand-first, health y rollback automatizado.
8. Verificación posdespliegue y observación; contrato/release notes/evidencia archivados.

Producción usa identidad federada OIDC y credenciales breves. Ningún humano despliega desde laptop. Infraestructura como código revisada, state cifrado/bloqueado y drift detectado. Dependabot/Renovate equivalente crea cambios pequeños; parche urgente conserva pipeline esencial.

## Release y migraciones

SemVer para contratos/productos técnicos; releases de producto con fecha/canal. Feature flags separan deploy/release, con kill switch y auditoría. Canary por tenant nunca expone datos ni discrimina sin consentimiento contractual. Migración no bloquea tablas críticas por encima de presupuesto; backfills son reanudables, rate-limited y observables. Rollback de aplicación mantiene compatibilidad N/N-1; datos se compensan, no se “down migrate” destructivamente.

## SLI, SLO y error budget

| Servicio/jornada   | SLI                                                         | SLO mensual |
| ------------------ | ----------------------------------------------------------- | ----------- |
| API/POS online     | solicitudes válidas exitosas/total, excluye 4xx del usuario | 99.9%       |
| Confirmar venta    | intenciones aceptadas con efecto correcto                   | 99.95%      |
| Latencia API común | p95 server duration                                         | ≤400 ms     |
| Sync offline       | operaciones procesadas en 5 min tras conectividad           | ≥99%        |
| Jobs críticos      | completados dentro de objetivo                              | ≥99%        |
| Frescura dashboard | edad de proyección                                          | p95 ≤5 min  |

Ventanas y exclusiones se codifican; terceros se muestran por separado pero la experiencia end-to-end se mide. Burn alerts multiwindow (rápido/lento) llaman a guardia. Consumir presupuesto congela releases de riesgo y prioriza fiabilidad. Métricas de negocio no sustituyen SLI técnico.

## Observabilidad

OpenTelemetry es capa vendor-neutral para trazas, métricas y correlación de logs vía OTLP/Collector. Instrumentación automática se complementa con spans/eventos de dominio.

### Señales

- RED por servicio: rate, errors, duration; USE para infraestructura: utilization, saturation, errors.
- Negocio: intentos/confirmaciones/duplicados de venta, diferencias de caja, conflictos offline, movimientos/reembolsos y frescura de reportes.
- Dependencias: pool/locks/slow queries, lag, cola/DLQ, cache hit/eviction, storage y proveedor.
- Trazas muestreadas por riesgo/latencia/error; 100% errores críticos dentro de límites. Baggage no transporta PII.
- Dashboards por jornada y servicio, con runbook y owner; synthetic probes cubren login y venta segura en tenant sintético.

Evitar tenant/user/resource ID como etiqueta de métrica de alta cardinalidad; investigación tenant-specific usa logs/traces con acceso restringido. Trace/correlation ID aparece en respuesta de error y eventos.

## Logging y auditoría

Logs técnicos JSON a stdout/collector, UTC y esquema versionado: timestamp, severity, event, service/version/environment, trace/span/correlation, result, duration y códigos; tenant/actor seudonimizados sólo cuando necesario. Sanitizar input y limitar tamaño. No registrar cuerpos por defecto.

Auditoría de negocio/seguridad es almacenamiento lógico separado, append-only, acceso restringido e integridad verificable. Conserva actor, acción, recurso, tenant/sucursal, antes/después minimizado o hashes/referencias, motivo, aprobación, origen, resultado y tiempo. Administradores de tenant sólo ven su alcance; plataforma no puede borrar selectivamente sin evento.

Retención inicial revisable: logs técnicos 30 días hot + 60 archive; seguridad/auditoría 12 meses online y hasta 5 años cuando obligación/contrato de registros comerciales lo justifique; trazas 14–30 días según coste. Legal define tabla final por dato. Redacción/erasure no destruye evidencia obligatoria: seudonimiza/bloquea.

## Alertas y respuesta

Alerta debe ser accionable, deduplicada, tener severidad, impacto, owner, runbook y criterio de cierre. Page: SLO burn, ventas fallando/duplicadas, cross-tenant, corrupción/lag crítico, backup fallido y flujo de logs detenido. Ticket: capacidad, deuda y anomalía no urgente. Simulacros: incidente técnico trimestral, seguridad semestral y restauración según abajo. Postmortem sin culpa en ≤5 días hábiles para S0/S1, con acciones verificables.

## Backups

- PostgreSQL administrado: backup base diario + WAL/PITR continuo con RPO ≤5 min; retención operativa 35 días, mensual 12 meses si legal/coste lo aprueba.
- Cifrado con clave separada, cuenta/proyecto de backup restringido, inmutabilidad/object lock cuando disponible y copia regional/cuenta separada.
- Object storage versionado/retención según clase; configuración/IaC en repositorio y secretos recuperables desde vault con break-glass.
- Redis/cache/cola no son únicos registros; outbox/DLQ persistente se respalda según impacto.
- Monitorear edad, tamaño y éxito; un job exitoso no es evidencia de restauración.

Restauración mensual automatizada a ambiente aislado valida integridad, migraciones, conteos, constraints y jornada de venta. Trimestralmente se mide RPO/RTO end-to-end. Acceso y uso de backup se audita; datos restaurados mantienen retención y lista de supresión.

## Recuperación ante desastres

Objetivos producción: **RPO 5 min, RTO 60 min** para registro transaccional; servicios no críticos RTO 4 h. Región primaria con alta disponibilidad multi-zona; DR regional warm/cold según prueba de coste antes de GA. DNS, certificados, artefactos, IaC, KMS/vault y contactos tienen recuperación documentada.

### Runbook de desastre

1. Incident Commander declara, congela cambios y establece canal/bitácora.
2. Clasifica alcance e integridad; preserva evidencia y comunica estado sin especular.
3. Aísla causa; decide failover o restauración a punto seguro con aprobación dual.
4. Levanta datos/servicios desde artefactos firmados; rota secretos si exposición posible.
5. Ejecuta validaciones: tenant/RLS, constraints, ventas/caja/inventario, lag, synthetic journey.
6. Reabre primero lectura y luego escrituras; reconcilia operaciones offline/terceros por ID.
7. Comunica recuperación, monitorea y realiza postmortem/acciones.

Escenarios ensayados: pérdida de zona/región, borrado lógico, migración corrupta, credenciales comprometidas, cola/proveedor caído, ransomware de control plane y restauración con solicitudes de supresión pendientes.

## Capacidad, coste y mantenimiento

Presupuestos/alertas por ambiente y servicio; tagging obligatorio. Autoscaling usa CPU/memoria, latencia/cola y límites de BD. Pruebas determinan max connections/pool. Ventanas de mantenimiento se anuncian ≥72 h cuando sea posible, no consumen SLO sólo si contrato lo establece. Dependencias y runtimes siguen versiones LTS/soportadas; revisión mensual de EOL y trimestral de arquitectura/coste.
