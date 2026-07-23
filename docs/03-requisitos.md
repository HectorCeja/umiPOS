# Requisitos funcionales y no funcionales

## Reglas de especificación

Cada requisito es obligatorio para MVP salvo marca `POST`. Prioridad MoSCoW: `M` imprescindible, `S` importante. La aceptación detallada se complementa con [09-roadmap-y-aceptacion.md](09-roadmap-y-aceptacion.md). Seguridad `RS`, accesibilidad `RA` y operación son requisitos de igual rango.

## Requisitos funcionales

### Identidad y acceso

- RF-001 `M`: registrar propietario con correo verificado, aceptación versionada de términos y aviso.
- RF-002 `M`: iniciar/cerrar sesión, recuperar credencial sin revelar existencia de cuenta y revocar sesiones.
- RF-003 `M`: invitar, activar, suspender y retirar usuarios conservando autoría histórica.
- RF-004 `M`: asignar membresías y roles por organización/sucursal con mínimo privilegio.
- RF-005 `M`: exigir reautenticación/MFA para acciones sensibles definidas y ofrecer MFA al propietario.
- RF-006 `S`: mostrar actividad y sesiones activas con cierre remoto.

### Tenant, sucursales y configuración

- RF-010 `M`: crear/editar organización con estado de ciclo de vida y propietario transferible de forma controlada.
- RF-011 `M`: administrar sucursales, dirección, zona horaria, moneda operativa y estado.
- RF-012 `M`: seleccionar contexto autorizado de organización y sucursal sin mezclar datos.
- RF-013 `M`: elegir plantilla de giro y habilitar/deshabilitar capacidades sin borrar información.
- RF-014 `M`: configurar idioma, formatos, moneda, redondeo, impuestos y precios incluidos/excluidos.
- RF-015 `M`: administrar cajas lógicas y dispositivos autorizados.

### Catálogo

- RF-020 `M`: crear/editar/archivar productos y servicios con nombre, SKU/código opcional, categoría, precio e impuesto.
- RF-021 `M`: manejar variantes simples, unidades y códigos únicos en el alcance configurado.
- RF-022 `M`: buscar por nombre, SKU o código con respuesta apta para venta.
- RF-023 `M`: importar catálogo mediante plantilla validada, previsualización y reporte por fila.
- RF-024 `M`: mantener historial efectivo de cambios de precio/impuesto; ventas conservan snapshot.
- RF-025 `S`: operar modificadores simples para alimentos/servicios sin recetas.

### Inventario

- RF-030 `M`: mantener existencias por artículo inventariable y sucursal mediante libro de movimientos.
- RF-031 `M`: descontar/reintegrar inventario por venta/devolución exactamente una vez.
- RF-032 `M`: registrar ajuste con cantidad, motivo, actor, fecha y evidencia opcional; no editar el movimiento.
- RF-033 `M`: consultar existencia y kardex filtrable.
- RF-034 `S`: configurar permiso para venta sin existencia y umbral de stock bajo.
- RF-035 `POST`: transferir existencias entre sucursales con tránsito/recepción.

### Clientes

- RF-040 `M`: crear perfil mínimo y ampliarlo sólo con datos necesarios; prevenir duplicados de forma asistida.
- RF-041 `M`: buscar, editar y archivar clientes respetando retención y derechos aplicables.
- RF-042 `M`: asociar cliente opcional a venta/cita y visualizar historial según permiso.
- RF-043 `M`: registrar procedencia, finalidad/consentimiento cuando aplique y versión de aviso.
- RF-044 `M`: exportar/corregir/suprimir o bloquear datos mediante flujo auditado sujeto a obligaciones legales.

### POS y ventas

- RF-050 `M`: iniciar carrito en sucursal/caja autorizada y agregar producto/servicio por búsqueda, favorito o código.
- RF-051 `M`: modificar cantidades/notas, retirar líneas y calcular subtotal, descuentos, impuestos, redondeo y total de forma determinista.
- RF-052 `M`: aplicar descuento por línea/venta dentro de límites; exceso requiere permiso y queda auditado.
- RF-053 `M`: registrar uno o varios medios de pago, cambio en efectivo y referencia externa opcional; no capturar PAN/CVV.
- RF-054 `M`: confirmar venta atómicamente con clave idempotente, folio único por tenant/sucursal y snapshot de cálculo.
- RF-055 `M`: generar recibo comercial imprimible/compartible sin llamarlo CFDI.
- RF-056 `M`: anular antes de completar y devolver total/parcial después, con autorización, motivo y operación compensatoria.
- RF-057 `M`: consultar ventas por folio, fecha, sucursal, caja, usuario, cliente y estado.
- RF-058 `M`: impedir edición destructiva de venta completada; toda corrección deja cadena auditada.
- RF-059 `M`: asociar venta con cita y separar fecha de operación, creación y sincronización.

### Caja

- RF-060 `M`: abrir un turno por caja/usuario según política, con fondo y fecha de negocio.
- RF-061 `M`: registrar entradas/salidas no originadas por ventas, con concepto y autorización.
- RF-062 `M`: calcular esperado por medio sin sustituir conteo real.
- RF-063 `M`: cerrar mediante arqueo, diferencia y motivo; generar resumen inmutable.
- RF-064 `M`: impedir ventas en efectivo sin turno cuando la política lo requiera.
- RF-065 `S`: permitir cierre ciego y aprobación de diferencias por supervisor.

### Agenda

- RF-070 `M`: habilitar agenda sólo para tenants aplicables y configurar servicios, duración, buffers, prestadores/recursos y disponibilidad.
- RF-071 `M`: crear/reprogramar/cancelar cita con cliente, sucursal, servicio, zona horaria y motivo.
- RF-072 `M`: impedir doble reserva mediante control concurrente y proponer espacios alternos.
- RF-073 `M`: consultar día/semana/lista de forma accesible y filtrar por prestador/estado.
- RF-074 `M`: transicionar estados válidos con auditoría: programada, confirmada, llegada, en servicio, completada, no asistió, cancelada.
- RF-075 `POST`: recordatorios automatizados por adaptadores de mensajería.

### Dashboard, reportes y exportación

- RF-080 `M`: mostrar ventas netas/brutas, devoluciones, transacciones y comparativo con periodo anterior, indicando zona/actualización.
- RF-081 `M`: reportar ventas por tiempo, sucursal, artículo/servicio, categoría, medio, impuesto y usuario conforme permisos.
- RF-082 `M`: reportar cajas, movimientos y diferencias.
- RF-083 `M`: exportar CSV con locale/encoding documentado y protección contra inyección de fórmulas.
- RF-084 `M`: permitir al contador sólo lectura/exportación en alcances concedidos.
- RF-085 `M`: reconciliar métricas de reporte con libro de ventas y explicitar definiciones.

### Plataforma e integraciones

- RF-090 `M`: emitir eventos internos versionados mediante outbox para procesos asíncronos.
- RF-091 `M`: registrar auditoría consultable de acciones de riesgo y cambios administrativos.
- RF-092 `M`: notificar dentro del producto resultados que requieren atención, sin exponer secretos.
- RF-093 `POST`: exponer API/webhooks públicos versionados, firmados, reintentables y administrables.
- RF-094 `POST`: integrar PAC para CFDI mediante puerto desacoplado y estado fiscal independiente de venta.
- RF-095 `M`: exportar datos del tenant y ejecutar cierre/eliminación conforme política y retención.

### Offline y sincronización

- RF-100 `M`: mostrar estado online/offline/sincronizando/error y última sincronización.
- RF-101 `M`: permitir carrito y ventas offline sólo en dispositivo previamente autorizado con catálogo/configuración vigente dentro de TTL.
- RF-102 `M`: asignar ID de operación cliente no predecible y clave idempotente; cifrar cola local y sincronizar exactamente una vez desde perspectiva del negocio.
- RF-103 `M`: bloquear offline acciones de alto riesgo: alta de usuario, permisos, devolución, ajuste, cierre final y cambios de precio/impuesto.
- RF-104 `M`: resolver conflicto con reglas explícitas; nunca sobrescribir silenciosamente y escalar casos ambiguos.
- RF-105 `M`: permitir inspeccionar/reintentar operaciones pendientes y advertir antes de cerrar sesión/borrar datos locales.

## Requisitos no funcionales

### Rendimiento y capacidad

- RNF-001: p75 de interacción local del POS ≤100 ms y búsqueda sobre catálogo sincronizado ≤300 ms en dispositivo objetivo.
- RNF-002: API p95 ≤400 ms y p99 ≤1 s para lecturas/escrituras síncronas comunes, excluyendo terceros y reportes exportables.
- RNF-003: confirmación online p95 ≤1.5 s; UI acusa recepción antes de 300 ms sin afirmar éxito prematuro.
- RNF-004: MVP se prueba a 500 organizaciones activas concurrentes, 100 solicitudes/s sostenidas y picos de 250; escalar horizontalmente sin afinidad salvo canal explícito.
- RNF-005: consultas interactivas se paginan; trabajos >2 s se consideran asíncronos con estado.

### Disponibilidad y resiliencia

- RNF-010: SLO mensual de API/POS online 99.9%, excluyendo mantenimiento anunciado; presupuesto ≈43.8 min/mes.
- RNF-011: tasa de ventas confirmadas sin error atribuible a NEXO ≥99.95% y cero duplicados conocidos.
- RNF-012: timeouts, reintentos con jitter sólo para operación segura/idempotente, circuit breaker y límites de concurrencia en dependencias.
- RNF-013: despliegue con rollback; cambios incompatibles usan expand/migrate/contract.
- RNF-014: degradación conserva venta básica cuando reportes/notificaciones están indisponibles.

### Integridad y datos

- RNF-020: importes se almacenan como decimal de precisión definida y moneda ISO 4217; nunca punto flotante binario.
- RNF-021: tiempo se almacena como instante UTC y se presenta en zona IANA; fecha de negocio se conserva explícitamente.
- RNF-022: operaciones financieras, inventario y caja son ACID, inmutables o compensatorias y auditables.
- RNF-023: cada escritura externa admite idempotencia y control de concurrencia optimista cuando corresponda.
- RNF-024: RPO ≤5 min y RTO ≤60 min para producción; restauración se prueba trimestralmente.

### Seguridad, privacidad y cumplimiento

- RNF-030: cumplir `RS` de [06-seguridad-y-privacidad.md](06-seguridad-y-privacidad.md), objetivo ASVS 5.0.0 L2 y threat model por release mayor.
- RNF-031: cifrado en tránsito TLS moderno y en reposo administrado; secretos fuera de repositorio y rotables.
- RNF-032: no almacenar datos de autenticación de tarjeta; pagos integrados futuros usan proveedor y tokenización para minimizar PCI.
- RNF-033: minimización, finalidad, retención, derechos y evidencia conforme LFPDPPP vigente y contratos.
- RNF-034: aislamiento de tenant tiene pruebas negativas automatizadas y monitoreo.

### Accesibilidad, compatibilidad e i18n

- RNF-040: satisfacer `RA-01..15` y WCAG 2.2 AA sin excepciones silenciosas.
- RNF-041: soportar las dos últimas versiones estables de Chrome, Edge, Firefox y Safari; tabletas Android/iPadOS dentro de soporte del fabricante.
- RNF-042: PWA funcional desde 320 CSS px, touch, teclado y escáner que emula teclado.
- RNF-043: todo texto, plural, fecha, número, moneda y zona es localizable; datos no se traducen destructivamente.

### Mantenibilidad y operación

- RNF-050: límites modulares sin ciclos, APIs internas explícitas y ownership; ningún módulo lee tablas privadas de otro.
- RNF-051: contratos API/eventos versionados y compatibles durante ventana definida.
- RNF-052: cobertura por riesgo; 100% de invariantes financieras, autorización y aislamiento poseen pruebas automatizadas.
- RNF-053: trazas, métricas y logs estructurados correlacionables sin PII/secretos indebidos.
- RNF-054: SBOM por release, dependencias fijadas/verificadas y vulnerabilidades críticas bloquean promoción salvo excepción temporal aprobada.
- RNF-055: documentación y ADR cambian en el mismo PR que su comportamiento.

### Usabilidad

- RNF-060: ≥90% de participantes representativos completa venta simple sin ayuda tras onboarding; mediana ≤60 s tras primera práctica.
- RNF-061: System Usability Scale objetivo ≥80 en validación pre-GA.
- RNF-062: ninguna acción irreversible depende sólo de confirmación genérica; el sistema muestra alcance y alternativa.
