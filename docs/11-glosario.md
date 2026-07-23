# Glosario

| Término                  | Definición normativa en NEXO                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| Agenda                   | Capacidad de reservar servicios/recursos en intervalos; no calendario personal general.        |
| Arqueo                   | Conteo real por medio al cerrar o verificar caja.                                              |
| Caja                     | Punto lógico donde se registran movimientos; no necesariamente dispositivo físico.             |
| Capacidad                | Funcionalidad habilitable por tenant/plan/configuración; no equivale a permiso.                |
| Carrito                  | Intención mutable previa a venta completada.                                                   |
| Cliente                  | Persona/contacto del negocio tenant; puede ser anónimo en una venta.                           |
| Contador                 | Rol de sólo lectura/exportación dentro del alcance concedido.                                  |
| CFDI                     | Comprobante Fiscal Digital por Internet regulado por SAT; un recibo NEXO no es CFDI.           |
| Correlation ID           | Identificador para seguir una cadena técnica sin revelar secreto.                              |
| CSD                      | Certificado de Sello Digital usado en procesos fiscales mexicanos futuros.                     |
| Devolución               | Operación compensatoria total/parcial sobre una venta completada.                              |
| Dispositivo autorizado   | Instalación/navegador registrado con capacidad y límites offline; no es identidad del usuario. |
| Encargado                | Quien trata datos por cuenta del responsable, sujeto a contrato/instrucciones.                 |
| Fecha de negocio         | Día operativo asignado en zona de sucursal; puede diferir del instante UTC.                    |
| Giro                     | Plantilla editable de capacidades/defaults, no tipo irreversible de tenant.                    |
| Idempotencia             | Propiedad por la que reintentar la misma intención no repite su efecto.                        |
| Inventario               | Control de movimientos/existencia; el saldo es proyección del ledger.                          |
| Ledger/Kardex            | Secuencia inmutable de movimientos que explica un saldo.                                       |
| Membresía                | Relación de usuario con organización, roles y alcances; identidad por sí sola no da acceso.    |
| Medio de pago registrado | Clasificación/importes declarados al POS; no implica que NEXO procesó fondos.                  |
| Monolito modular         | Aplicación desplegada como unidad con límites internos exigibles y datos/contratos propios.    |
| Organización             | Negocio cliente y frontera tenant contractual.                                                 |
| Outbox                   | Registro transaccional de eventos pendientes de publicación para evitar dual write.            |
| PAC                      | Proveedor Autorizado de Certificación de CFDI.                                                 |
| Pago                     | En MVP, registro de medio e importe asociado a venta; no captura tarjeta.                      |
| PII/dato personal        | Información de una persona identificada o identificable conforme contexto/ley.                 |
| POS                      | Punto de Venta: flujo de carrito, cálculo, cobro registrado y confirmación.                    |
| PWA                      | Aplicación web instalable con service worker/capacidades offline acotadas.                     |
| Recibo comercial         | Evidencia no fiscal de venta generada por NEXO.                                                |
| Recurso                  | Persona, estación o equipo cuya disponibilidad puede reservar Agenda.                          |
| Responsable              | Quien decide finalidades/medios del tratamiento de datos personales.                           |
| RLS                      | Row-Level Security de PostgreSQL; defensa en profundidad para filas por tenant.                |
| Rol                      | Conjunto base de permisos; puede limitarse por sucursal/atributos.                             |
| SLI/SLO                  | Indicador medido/objetivo de fiabilidad; SLA sería compromiso contractual.                     |
| Snapshot                 | Valores históricos copiados al confirmar para que cambios futuros no reescriban la venta.      |
| Sucursal                 | Unidad operativa/ubicación dentro de una organización; alcance, no tenant independiente.       |
| Tenant                   | Frontera lógica de aislamiento; en NEXO corresponde a Organización.                            |
| Turno/sesión de caja     | Intervalo abierto–cerrado que agrupa esperado, movimientos y conteo.                           |
| Venta completada         | Transacción comercial inmutable confirmada por autoridad servidor.                             |
| Venta pendiente          | Intención offline aún no aceptada; no debe presentarse como confirmada definitivamente.        |
| Worker                   | Proceso que ejecuta jobs/eventos fuera de petición interactiva.                                |

## Roles base

Propietario: control contractual y administrativo; Administrador: operación/configuración delegada; Supervisor: control de turno/excepciones; Cajero: venta y caja asignada; Empleado: capacidades operativas acotadas; Contador: lectura/exportación. Los nombres no sustituyen permisos granulares ni garantizan acceso entre sucursales.
