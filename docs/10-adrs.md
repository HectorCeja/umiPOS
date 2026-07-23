# Registro inicial de decisiones arquitectónicas

Estados: `Propuesta`, `Aceptada`, `Reemplazada`. Cada ADR de implementación se separará en `/docs/adr/NNNN-titulo.md`; este registro fija las decisiones fundacionales.

## ADR-001 — Monolito modular antes que microservicios

**Estado:** Aceptada. **Contexto:** dominio amplio, equipo/escala inicial desconocidos y transacciones estrechas entre venta, inventario y caja. **Decisión:** un desplegable API más workers, módulos encapsulados y eventos outbox. **Alternativas:** microservicios (escala independiente, alto coste distribuido); monolito por capas técnicas (simple, acoplamiento creciente). **Consecuencia:** entrega/consistencia simples; requiere fitness tests. Extraer sólo por escala, aislamiento y ownership medidos.

## ADR-002 — TypeScript, Next.js y NestJS

**Estado:** Aceptada con revisión anual. **Decisión:** TypeScript estricto end-to-end; React/Next.js App Router para web/PWA; NestJS para API modular. **Alternativas:** Vite SPA, Go, .NET/Java, móvil nativo. **Razón:** ecosistema, contratación, módulos y velocidad con experiencia web adaptable. **Consecuencia:** vigilar complejidad/caching de Next y CPU/event loop de Node; benchmarks gobiernan optimización, no preferencia.

## ADR-003 — PostgreSQL como sistema de registro

**Estado:** Aceptada. **Decisión:** PostgreSQL administrado para transacciones, constraints, reporting y RLS. Redis sólo efímero. **Alternativas:** documental y distributed SQL. **Consecuencia:** esquema/migraciones disciplinados, pool y queries observados; posibilidad de réplicas/partición posterior.

## ADR-004 — Multi-tenancy compartida con tenant_id + RLS

**Estado:** Aceptada. **Decisión:** pool compartido, contexto autenticado, filtros en aplicación, RLS default-deny y constraints compuestas. **Alternativas:** esquema/BD por tenant. **Consecuencia:** coste eficiente y operación uniforme con mayor blast radius; pruebas negativas obligatorias y router para silo futuro.

## ADR-005 — REST/OpenAPI y eventos internos versionados

**Estado:** Aceptada. **Decisión:** REST JSON contract-first para síncrono; eventos outbox para efectos asíncronos. **Alternativas:** GraphQL/gRPC/event-only. **Consecuencia:** API comprensible y tooling amplio; evitar chatty API con endpoints de caso de uso. gRPC puede usarse si aparecen servicios internos medidos.

## ADR-006 — Consistencia fuerte en núcleo comercial

**Estado:** Aceptada. **Decisión:** venta, pago registrado, caja e inventario relevante comparten transacción; reportes/notificaciones eventual. **Alternativa:** sagas desde inicio. **Consecuencia:** preserva invariantes y limita extracción; outbox evita dual write.

## ADR-007 — PWA offline limitada, servidor autoritativo

**Estado:** Aceptada. **Decisión:** cache/cola cifrada acotada, recibo provisional y sincronización idempotente; acciones sensibles bloqueadas. **Alternativas:** online-only (simple, mal ajuste); local-first total (complejidad/conflicto alto); nativa (coste). **Consecuencia:** resiliencia útil sin falsa consistencia; requiere pruebas intensivas de ciclo de vida.

## ADR-008 — Organización como tenant; sucursal como alcance

**Estado:** Aceptada. **Decisión:** tenant contractual es Organization; Branch no es tenant y comparte datos autorizados. **Consecuencia:** reportes/catálogo multi-sucursal coherentes; toda autorización evalúa ambas dimensiones cuando aplica.

## ADR-009 — Giro mediante capacidades, no forks

**Estado:** Aceptada. **Decisión:** plantillas inicializan capacidades/configuración editables; una base de código y lenguaje común. **Alternativas:** apps verticales/forks. **Consecuencia:** consistencia y menor mantenimiento; se deben vigilar condicionales y crear módulos si emerge un subdominio real.

## ADR-010 — Motor de dinero/impuestos configurable

**Estado:** Aceptada. **Decisión:** moneda, precisión, impuestos efectivos, modo incluido y redondeo explícitos; snapshot por venta. **Alternativa:** reglas MX hard-coded. **Consecuencia:** expansión viable y auditoría, con mayor necesidad de casos property-based.

## ADR-011 — Proveedores externos detrás de puertos

**Estado:** Aceptada. **Decisión:** identidad, correo, PAC, PSP, objetos y observabilidad se integran por adaptadores. **Consecuencia:** sustituibilidad y pruebas; evitar “abstracción universal” y documentar capacidades específicas.

## ADR-012 — OpenTelemetry y telemetría vendor-neutral

**Estado:** Aceptada. **Decisión:** OTLP/Collector para traces/metrics/log correlation; backend de almacenamiento se decide por evaluación. **Consecuencia:** portabilidad y modelo común; coste/cardinalidad requieren gobierno.

## ADR-013 — ASVS 5.0.0 L2 + controles L3 por riesgo

**Estado:** Aceptada. **Decisión:** L2 completo aplicable; L3 selectivo para plataforma/tenant/secretos/operaciones. **Alternativa:** sólo Top 10. **Consecuencia:** evidencia considerable pero verificable; OWASP IDs versionados.

## ADR-014 — No procesar tarjeta ni timbrar CFDI en MVP

**Estado:** Aceptada. **Decisión:** registrar medios externos sin PAN/CVV; recibo comercial separado. Integraciones PSP/PAC posteriores. **Consecuencia:** menor alcance PCI/fiscal y salida más rápida; comunicación debe evitar confusión y arquitectura conserva puertos.

## ADR-015 — Managed containers antes que Kubernetes

**Estado:** Propuesta hasta seleccionar nube. **Decisión:** servicios administrados y contenedores/IaC; no operar Kubernetes sin necesidad. **Alternativas:** serverless functions (cold starts/límites) y Kubernetes (control/coste). **Criterio:** reevaluar por topología, portabilidad, escala, seguridad o equipo SRE.

## ADR-016 — Datos analíticos como proyecciones

**Estado:** Aceptada. **Decisión:** libros transaccionales son verdad; dashboard/reportes consumen proyecciones reconstruibles y declaran frescura. **Consecuencia:** POS aislado de consultas; reconciliación y lag observable obligatorios.

## Plantilla ADR futura

Título; estado/fecha/owners; contexto y fuerzas; opciones/evidencia; decisión; consecuencias positivas/negativas; seguridad/privacidad/operación; plan de migración/rollback; señales de revisión; enlaces a requisitos/fuentes. Una decisión reemplazada no se borra.

## ADR de foundation

- [ADR-017 — pnpm workspaces and Turborepo](adr/0017-workspace-tooling.md)
- [ADR-018 — Node 24 LTS, ESM and exact versions](adr/0018-runtime-modules.md)
- [ADR-019 — Prisma 7 with first-class SQL migrations](adr/0019-prisma-and-sql.md)
- [ADR-020 — OpenAPI design-first with a foundation exception](adr/0020-openapi-workflow.md)
- [ADR-021 — Vitest as common unit/component runner](adr/0021-test-runner.md)
- [ADR-022 — Docker Compose for local parity services](adr/0022-local-infrastructure.md)
- [ADR-023 — Tenant boundary and relational model](adr/0023-tenant-boundary-and-relational-model.md)
- [ADR-024 — Explicit TenantContext and resolution](adr/0024-explicit-tenant-context-and-resolution.md)
- [ADR-025 — PostgreSQL roles and forced RLS](adr/0025-postgresql-roles-and-rls.md)
- [ADR-026 — Design-first core OpenAPI](adr/0026-openapi-design-first-core-contract.md)
- [ADR-027 — Identity Platform boundary](adr/0027-identity-platform-boundary.md)
- [ADR-028 — Native verifier and provider-neutral authentication](adr/0028-native-authentication-verifier.md)
- [ADR-029 — Embedded database-backed authorization engine](adr/0029-embedded-authorization-engine.md)
