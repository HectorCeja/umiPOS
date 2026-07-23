# Roadmap y aceptación

## Estado de ejecución 2026-07-13

Prompts 1–7 completados. Product Platform es el modelo maestro descriptivo y queda congelado por ADR-0031; el siguiente incremento correcto es Inventory Foundation, que debe referenciar variantes y no modificar Product para almacenar stock.

**Estado 2026-07-13:** Foundation, Identity, Authentication, Authorization y Control Plane/Onboarding están completos. El siguiente incremento es Catalog/Product foundation; después Inventory y POS según dependencias.

## Estado al 2026-07-13

Foundation Architecture, Core Domain, Identity, Authentication, Authorization Platform y Control Plane están completados. Prompt 6 añade bootstrap autoservicio, administración, onboarding por plantillas, invitaciones y feature management sobre registry v2. MFA/WebAuthn y todos los módulos comerciales siguen fases separadas.

**Siguiente paso recomendado:** Catalog/Product foundation antes de Inventory y POS. El Control Plane ya aporta Tenant, Branch, features y autorización; no existe evidencia para reordenar el roadmap ni se requiere otro ADR.

## Estrategia de versiones

Fechas se comprometen después de discovery técnico y capacidad del equipo; el orden se basa en reducción de riesgo y valor. Cada fase tiene salida verificable.

### V0 — Foundation / Alpha interna

Tenant, identidad/acceso, sucursal, catálogo base, pipeline/IaC, observabilidad, RLS, design system y venta vertical mínima. Objetivo: probar límites, dinero, idempotencia y aislamiento antes de amplitud.

### V0.5 — Private beta

Inventario, clientes, caja, devoluciones, recibos, historial, onboarding, configuración por giro, agenda base, reportes y pruebas offline controladas. Pilotos: mínimo 3 negocios por arquetipo en una sucursal, con soporte cercano y migración reversible.

### V1.0 — MVP / General Availability México

Todo requisito `M`, UX/accessibility AA, portabilidad/privacidad, importación, endurecimiento, pentest, SLO/guardia, backups/DR y soporte comercial. Soporta multi-sucursal funcional aunque beta priorice una.

### V1.1 — Operación comercial ampliada

Transferencias, compras/proveedores base, recordatorios, permisos personalizados, reportes programados, API/webhooks limitados, mejoras alimentos (mesas/comandas según discovery) y optimización de hardware.

### V1.2 — Ecosistema México

CFDI 4.0 mediante PAC, pagos integrados tokenizados, conciliación y capacidades de lealtad. Cada integración tiene evaluación legal/PCI y fallback.

### V2 — Expansión

Configuración de nuevos países/impuestos, multi-moneda explícita, marketplace de integraciones, planes/entitlements, aislamiento dedicado opcional, analítica avanzada y apps nativas sólo si evidencia de dispositivo/offline lo exige.

## Criterios de aceptación del MVP

### Producto y operación real

- CA-001: propietario nuevo crea tenant/sucursal, configura giro, añade o importa artículos/servicios, abre caja y completa/recibe venta sin soporte; cumple OB-01.
- CA-002: retail vende por búsqueda/código, descuenta stock una vez, emite recibo y devolución reintegra exactamente lo debido.
- CA-003: negocio de citas configura disponibilidad, evita solapamiento, completa cita y la asocia a venta.
- CA-004: caja concilia ventas/movimientos, captura conteo/diferencia/motivo y produce cierre inmutable.
- CA-005: propietario ve dashboard e historial cuyos totales se reconcilian con ventas/devoluciones/caja; contador sólo lee/exporta.
- CA-006: capacidades cambian por giro/configuración sin pérdida y roles ven sólo navegación/acciones pertinentes.
- CA-007: organización opera ≥2 sucursales sin mezcla de catálogo contextual, stock, caja, citas o reportes.
- CA-008: venta comercial/recibo no afirma ser CFDI y la UI explica métodos de pago como registro, no procesamiento.

### Integridad y concurrencia

- CA-010: repetir simultáneamente confirmación con igual clave crea una venta/movimientos; payload distinto se rechaza.
- CA-011: 100 intentos concurrentes de doble reserva o devolución excesiva preservan invariantes.
- CA-012: venta completada no se edita; descuento, ajuste, devolución, rol y cierre tienen auditoría atribuible.
- CA-013: importes, impuestos, descuentos y redondeo pasan tablas de casos frontera aprobadas para MXN y al menos una moneda con precisión distinta.
- CA-014: fecha UTC, zona y fecha de negocio pasan cambios de día y horario aplicables sin alterar historia.

### Offline

- CA-020: dispositivo autorizado completa operación elegible sin red, muestra pendiente y sincroniza un efecto al reconectar/reintentar/cerrar/reabrir.
- CA-021: configuración vencida, límite superado, usuario revocado o acción de alto riesgo se bloquea con explicación.
- CA-022: conflictos quedan confirmados/rechazados/en revisión, visibles y auditados; cero sobrescritura silenciosa.
- CA-023: actualización/rollback de PWA no pierde cola; logout advierte y protege pendientes.

### Seguridad y privacidad

- CA-030: 100% ASVS 5.0.0 L2 aplicable tiene evidencia aprobada; L3 seleccionado documentado; cero excepción crítica/alta explotable.
- CA-031: matriz automatizada por endpoint demuestra denegación cross-tenant/sucursal/rol/objeto y RLS con rol productivo.
- CA-032: pentest independiente cierra hallazgos bloqueantes; Top 10:2025 y abuso de negocio tienen control/prueba.
- CA-033: MFA/recuperación/revocación, soporte JIT, rate limits, CSP/CSRF/CORS y secretos pasan pruebas.
- CA-034: inventario/aviso/contrato/retención/derechos/subencargados y runbook de incidente son validados por Legal/Privacidad.
- CA-035: escaneo de BD, objetos, logs, trazas, analytics y backups no encuentra PAN/CVV, credenciales o PII prohibida.
- CA-036: exportación y offboarding de tenant se ensayan; URLs caducan y borrado/retención queda evidenciado.

### Accesibilidad y experiencia

- CA-040: auditoría WCAG 2.2 AA de flujos críticos sin falla bloqueante y con corrección de hallazgos graves.
- CA-041: todas las jornadas críticas completan con teclado y combinaciones AT de RA-14; foco/errores/estado offline se anuncian.
- CA-042: éxito de venta ≥90%, mediana ≤60 s tras práctica y SUS ≥80 en muestra representativa; resultados segmentados.
- CA-043: compacto/medio/amplio, 320 CSS px, zoom 200/400%, landscape y teclado virtual conservan tarea.

### Rendimiento, resiliencia y operación

- CA-050: pruebas bajo carga objetivo cumplen RNF-001..005 sin noisy neighbor, pool agotado ni error >presupuesto.
- CA-051: canary y rollback del mismo artefacto se demuestran; migración compatible N/N-1.
- CA-052: alertas detectan venta fallida, cross-tenant sintético, cola/DLQ, backup/log detenido y SLO burn; runbooks funcionan.
- CA-053: restauración aislada demuestra RPO ≤5 min/RTO ≤60 min y reconciliación; DR game day aprobado.
- CA-054: SBOM/firma/provenance, scans, licencias, IaC y dependencias cumplen gate.
- CA-055: 30 días de beta cumplen SLO o riesgo residual explícitamente aceptado; no S0/S1 abiertos.

## Checklist go/no-go

Producto, Ingeniería, UX, Seguridad, Privacidad/Legal, QA y Operaciones firman sus CA. Soporte tiene runbooks, estado público/canales y escalación; términos, precios y límites son claros; métricas de activación respetan privacidad. **No-go automático:** posible fuga tenant, pérdida/duplicación monetaria no reconciliable, restauración no probada, hallazgo crítico/alto explotable, falla accesible que impide vender o dependencia sin plan de contingencia.

## Métricas post-lanzamiento

Revisar semanalmente activación/tiempo a valor, ventas activas, éxito/latencia, abandonos por paso, conflictos offline, tickets por 100 organizaciones, diferencias/reembolsos anómalos, accessibility feedback y SLO/error budget. Guardrails: incidentes, exportación/eliminación, churn y carga cognitiva. Toda métrica tiene definición, owner, fuente, exclusiones y segmento; no optimizar volumen a costa de integridad.

# Prompt 8 — Inventory Platform

Implementado: ledger inmutable por variante, disponibilidad multidimensional, reservas, transferencias, conteos, ubicaciones, costos, snapshots y outbox. Siguiente candidato: POS, condicionado al Quality Gate verde de Prompt 8. POS consumirá Application Services y no modificará Product ni tablas Inventory.

# Prompt 9 — Sales Platform

Implementado el motor headless de venta, checkout, pagos, recibos, reservas, idempotencia, eventos y contratos públicos UMI/Flutter. La evaluación arquitectónica recomienda: (1) discovery UX y consolidación del Design System, (2) Cash Management, (3) POS Experience web; Customers puede avanzar en paralelo cuando exista capacidad. Flutter e integración productiva UMI esperan respectivamente evidencia de offline/hardware y documentación contractual UMI. Un cambio formal del orden publicado requiere ADR antes de ejecución.
