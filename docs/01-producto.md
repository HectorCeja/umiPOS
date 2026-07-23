# Producto, mercado y alcance

## Visión

NEXO será el sistema operativo cotidiano de pequeños y medianos negocios: una plataforma modular que permite comenzar a vender en minutos y unifica POS, catálogo, servicios, inventario, clientes, caja, agenda y conocimiento operativo. Se adapta al giro y rol sin fragmentar la experiencia ni encerrar al negocio en una configuración irreversible.

**Propuesta de valor:** una operación coherente, rápida y comprensible desde cualquier sucursal; menos herramientas, doble captura, errores y tiempo de capacitación; datos propios exportables y una base preparada para crecer.

## Problema y oportunidad

Los pequeños comercios suelen combinar caja manual, hojas de cálculo, mensajería, agendas y sistemas verticales. Esto produce inventario incierto, cierres difíciles de conciliar, escasa trazabilidad y aprendizaje repetido. NEXO no intentará ser un ERP universal: cubrirá con excelencia el ciclo vender–cobrar–controlar–entender y habilitará extensiones bien delimitadas.

## Objetivos de negocio

| ID    | Objetivo                       | Indicador inicial                                                   |
| ----- | ------------------------------ | ------------------------------------------------------------------- |
| OB-01 | Reducir tiempo a primer valor  | mediana registro→primera venta ≤ 10 min; p90 ≤ 20 min               |
| OB-02 | Lograr activación autoservicio | ≥ 70% crea catálogo mínimo, abre caja y vende en 24 h               |
| OB-03 | Crear hábito operativo         | ≥ 60% de organizaciones activadas opera 4 de sus primeros 7 días    |
| OB-04 | Retener negocios útiles        | retención de organizaciones a 90 días ≥ 75% tras estabilización     |
| OB-05 | Reducir carga de soporte       | ≥ 85% completa tareas críticas sin asistencia humana                |
| OB-06 | Validar adecuación multigiro   | éxito de tareas ≥ 90% en al menos retail, alimentos y citas         |
| OB-07 | Proteger confianza             | cero incidentes críticos conocidos sin contención; cumplimiento SLO |

Las metas son hipótesis de lanzamiento; Producto debe fijar baseline y revisarlas sin manipular denominadores. North Star: **organizaciones con al menos 20 ventas válidas en una semana**, segmentada por cohorte y giro.

## Objetivos técnicos

- OT-01: preservar consistencia financiera e inventario con transacciones, idempotencia y auditoría.
- OT-02: aislamiento multi-tenant verificable en aplicación y base de datos.
- OT-03: arquitectura modular que permita despliegue simple y extracción futura sin reescribir dominio.
- OT-04: POS perceptualmente inmediato y resistente a conectividad intermitente.
- OT-05: localización de idioma, moneda, impuestos y zona horaria como configuración, no condicionales dispersos.
- OT-06: cambios seguros mediante automatización, observabilidad y recuperación ensayada.
- OT-07: contratos de integración versionados y sustituibles.

## Público objetivo

PyMEs mexicanas con 1–10 sucursales y aproximadamente 1–100 colaboradores, operación presencial y necesidad de control sin personal técnico. El diseño no impide cuentas mayores, pero enterprise, franquicias complejas y manufactura no gobiernan el MVP.

### Giros soportados

| Arquetipo                | Giros iniciales                    | Capacidades preseleccionadas                                        |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------------- |
| Comercio de productos    | retail, abarrotes, otros comercios | variantes, códigos, inventario, venta rápida                        |
| Alimentos y bebidas      | cafeterías, restaurantes           | modificadores, notas, consumo; mesas/comandas avanzadas posteriores |
| Citas y cuidado personal | barberías, salones, tatuajes       | servicios, duración, prestador, agenda                              |
| Servicios generales      | profesionales y otros servicios    | servicios, clientes, agenda opcional                                |

El giro es una plantilla editable, nunca una partición del producto. Una organización puede habilitar productos y servicios simultáneamente.

## Personas y trabajos por realizar

### P1 — Propietaria “Mariana”

Administra 1–3 locales, alterna móvil y laptop, y quiere saber si vende y si su caja e inventario cuadran. Necesita alta guiada, resumen accionable y control de permisos. Teme perder datos y “configurar un sistema”. Éxito: primera venta el mismo día y cierre entendible.

### P2 — Administrador “Luis”

Mantiene catálogo, precios, turnos y equipo. Usa escritorio/tablet, trabaja bajo presión y necesita operaciones masivas, trazabilidad y corrección segura. Éxito: resolver excepciones sin editar datos históricos.

### P3 — Supervisora “Alejandra”

Abre/cierra caja, autoriza descuentos o devoluciones y monitorea una sucursal. Necesita alertas y acciones con PIN/reautenticación. Éxito: detectar y explicar diferencias en el turno.

### P4 — Cajero “Diego”

Repite ventas durante horas, puede usar pantalla táctil y conectividad irregular. Necesita búsqueda veloz, objetivos grandes, teclado/escáner y recuperación de errores. Éxito: cobrar sin dudar ni duplicar.

### P5 — Prestadora “Sofía”

Consulta agenda en móvil y registra servicios. Debe ver sólo lo necesario. Éxito: identificar su siguiente cita y actualizar estado con pocos pasos.

### P6 — Contadora “Elena”

Accede periódicamente y sólo lectura a ventas, impuestos y cierres; exporta periodos. Éxito: datos estables, fechados y conciliables sin acceso operativo.

## Principios de producto

1. Vender primero: configuración progresiva, datos de ejemplo opcionales y ruta crítica visible.
2. Complejidad por demanda: mostrar sólo módulos habilitados, conservando acceso a configuración.
3. Correcciones explícitas: reversos y ajustes; nunca reescribir silenciosamente historia financiera.
4. Confianza visible: estados de sincronización, totales explicables y confirmación proporcional al riesgo.
5. Interoperabilidad: importación/exportación y contratos; los datos pertenecen al negocio.
6. Defaults locales, modelo global: México es configuración inicial, no supuesto estructural.

## Definición del MVP

### Incluido

- Registro, acceso, recuperación, sesiones, invitaciones y RBAC base.
- Organización, una o varias sucursales, preferencias regionales y plantilla de giro.
- Productos, servicios, categorías, variantes simples, precios, impuestos y unidades.
- Existencias por sucursal, movimientos, ajuste con motivo y alertas básicas.
- Clientes con perfil mínimo, búsqueda y consentimiento/aviso aplicable.
- POS: carrito, descuentos autorizados, impuestos, pago registrado (efectivo/externo), recibo y devolución total/parcial controlada.
- Turnos de caja, entradas/salidas justificadas, arqueo y cierre.
- Historial con filtros, detalle y exportación básica.
- Dashboard y reportes básicos de ventas, métodos, impuestos, productos y caja.
- Agenda opcional: recursos/personas, disponibilidad, citas, estados y asociación a venta.
- Configuración modular por giro, rol y sucursal.
- PWA instalable y cola offline acotada para ventas elegibles.

### Fuera del MVP

CFDI/timbrado, procesamiento de tarjeta, mesas/comandas/KDS, compras y proveedores, nómina, contabilidad de doble partida, e-commerce, lealtad, marketing, recetas/insumos, paquetes/membresías, marketplace de integraciones, apps móviles nativas y analítica predictiva. Podrán existir adaptadores piloto sin declararse capacidad soportada.

## Hipótesis y descubrimiento continuo

Antes de congelar UX se realizarán entrevistas contextuales y pruebas de tareas con mínimo 5 participantes por arquetipo (producto, alimentos, citas), incluyendo usuarios con baja alfabetización digital y tecnologías de asistencia. Se medirán tiempo, éxito, errores y confianza. Analítica requiere minimización, consentimiento cuando aplique y prohibición de grabar campos sensibles. Cada trimestre se revisan solicitudes por impacto, frecuencia, giro y coste de complejidad.
