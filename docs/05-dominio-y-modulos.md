# Modelo conceptual y arquitectura modular

## Lenguaje y agregados conceptuales

`Organization` es el tenant y posee preferencias/capacidades; `Branch` representa ubicación operativa; `Membership` vincula `User` con organización, roles y alcances. Un `CatalogItem` es producto, servicio o híbrido; `Variant` identifica una opción vendible; `Price` y `TaxRule` son efectivos en tiempo/contexto.

`StockLedgerEntry` es el hecho inmutable que cambia existencia. `Customer` pertenece al tenant. `Sale` agrega líneas, snapshots, totales, pagos registrados y estado; `Refund` referencia líneas/importe original. `CashSession` agrupa movimientos y esperado/contado. `Appointment` reserva `Resource`/prestador y servicio en un intervalo. `AuditEvent` registra quién hizo qué, dónde, cuándo y resultado.

### Relaciones e invariantes

- Organización 1–N sucursales, membresías, clientes, artículos y reglas.
- Sucursal 1–N cajas, sesiones, citas y saldos de inventario.
- Venta pertenece exactamente a tenant+sucursal; toda línea conserva descripción, cantidad, precio, impuesto y descuento al vender.
- Suma de líneas, ajustes, impuestos y redondeo coincide con total; pagos efectivos coinciden con total o estado expresa saldo futuro (no MVP).
- Venta completada no se edita; devolución no supera cantidad/importe neto disponible.
- Saldo de inventario es suma/proyección del ledger; movimiento posee causa y referencia idempotente.
- Una caja no tiene sesiones incompatibles superpuestas según política; cierre no se reescribe.
- Recursos excluyentes no tienen citas activas superpuestas.
- Identificadores globales son opacos; folios legibles sólo son únicos dentro del alcance documentado.
- Eliminación de usuario no rompe autoría; seudonimiza cuando proceda.

## Catálogo completo de módulos

| ID     | Módulo                  | Responsabilidad / datos propios                            | MVP            |
| ------ | ----------------------- | ---------------------------------------------------------- | -------------- |
| MOD-01 | Identidad               | credenciales externas/locales, sesiones, MFA, recuperación | sí             |
| MOD-02 | Organizaciones          | tenant, ciclo de vida, plan/capacidades                    | sí             |
| MOD-03 | Sucursales              | ubicaciones, zona, cajas/dispositivos                      | sí             |
| MOD-04 | Acceso                  | membresías, roles, permisos, políticas/alcances            | sí             |
| MOD-05 | Configuración           | giro, locale, moneda, impuestos/preferencias               | sí             |
| MOD-06 | Catálogo                | productos, servicios, variantes, categorías, precios       | sí             |
| MOD-07 | Inventario              | ledger, saldo, ajustes, umbrales                           | sí             |
| MOD-08 | Clientes                | perfiles, privacidad, historial referenciado               | sí             |
| MOD-09 | Ventas/POS              | carrito confirmado, cálculo, folio, devoluciones           | sí             |
| MOD-10 | Pagos registrados       | medios/importe/referencia; no procesa tarjeta              | sí             |
| MOD-11 | Caja                    | sesiones, movimientos, arqueo/cierre                       | sí             |
| MOD-12 | Agenda                  | servicios agendables, recursos, disponibilidad, citas      | sí condicional |
| MOD-13 | Reporting               | proyecciones, dashboard, consultas/exportación             | sí             |
| MOD-14 | Recibos                 | representación/entrega de comprobante comercial            | sí             |
| MOD-15 | Auditoría               | eventos de seguridad/negocio protegidos                    | sí             |
| MOD-16 | Notificaciones          | inbox y entrega por adaptadores                            | mínimo         |
| MOD-17 | Importación/exportación | jobs, validación, portabilidad                             | sí             |
| MOD-18 | Sincronización          | dispositivos, cursores, cola/conflictos                    | sí             |
| MOD-19 | Integraciones           | credenciales, webhooks, adaptadores                        | base           |
| MOD-20 | Suscripciones           | planes, metering, cobro SaaS                               | post-MVP       |
| MOD-21 | Fiscal                  | CFDI/PAC/certificados/estado fiscal                        | post-MVP       |
| MOD-22 | Compras/proveedores     | órdenes, recepciones, costo                                | post-MVP       |
| MOD-23 | Plataforma interna      | soporte JIT, feature flags, operaciones tenant             | mínimo seguro  |

## Dependencias permitidas

`Identidad → Acceso → Organizaciones/Sucursales` establece contexto. Configuración publica políticas consumidas por Catálogo/Ventas/Agenda. Ventas usa contratos públicos de Catálogo, Inventario, Pagos y Caja dentro de la transacción coordinada; Clientes y Agenda son asociaciones opcionales. Todos emiten a Auditoría/outbox sin depender de su implementación. Reporting, Recibos y Notificaciones consumen eventos y no son prerequisito para confirmar venta. Sync invoca los mismos casos de uso de Ventas, nunca escribe tablas.

| Productor              | Consumidor                      | Contrato             | Consistencia                   |
| ---------------------- | ------------------------------- | -------------------- | ------------------------------ |
| Acceso                 | todos                           | contexto autorizado  | síncrona                       |
| Configuración/Catálogo | Ventas                          | snapshot calculable  | síncrona/versionada            |
| Ventas                 | Inventario/Pagos/Caja           | completar/devolver   | transacción local              |
| Ventas                 | Reportes/Recibos/Notificaciones | eventos outbox       | eventual                       |
| Agenda                 | Ventas                          | referencia cita      | síncrona opcional              |
| todos                  | Auditoría                       | evento actor/acción  | misma transacción si crítico   |
| Fiscal futuro          | Ventas                          | referencia inmutable | eventual; fiscal independiente |

### Prohibiciones

- Reporting no actualiza ventas.
- Inventario no infiere ventas desde UI.
- Configuración no contiene condicionales de autorización.
- Integraciones no mutan tablas; llaman casos de uso.
- Ningún módulo comparte entidad ORM mutable ni usa una tabla “utilitaria” como canal oculto.
- Dependencias cíclicas son fallo de arquitectura y bloquean integración.

## Estados principales

- Venta: `draft → pending_sync → completed`; `draft → cancelled`; completed admite refunds vinculados, no retorna a draft.
- Cita: `scheduled → confirmed/arrived → in_service → completed`; scheduled/confirmed admiten cancelled/no_show según política.
- Caja: `open → closing → closed`; corrección es movimiento/aprobación separada.
- Tenant: `provisioning → active → suspended → offboarding → deleted`; suspensión conserva acceso administrativo limitado según contrato.
- Import/export: queued → processing → succeeded/partially_succeeded/failed → expired.

## Propiedad y evolución de datos

Cada módulo posee esquema lógico, migraciones y diccionario. Cambios aditivos preceden lectores; backfill es reanudable/medido; retirada ocurre después de comprobar consumidores. Datos maestros pueden archivarse, no borrarse si referidos por historia. Los eventos incluyen nombre, versión, ID, tenant, instante, actor/correlation y payload mínimo; PII se referencia o minimiza.
