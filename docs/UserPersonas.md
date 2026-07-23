# User Personas and Contexts

| Persona/contexto                         | Objetivo y frecuencia                            | Dispositivo/capacitación        | Riesgos y accesibilidad                             | Prioridad / nunca mostrar                         |
| ---------------------------------------- | ------------------------------------------------ | ------------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| Owner                                    | Controlar negocio, configurar y revisar a diario | Móvil y laptop; media           | Sobrecarga, cifras sin contexto; zoom y texto claro | Salud del negocio / datos de otro tenant          |
| Administrator                            | Operar catálogo, equipo y ajustes diariamente    | Laptop; media-alta              | Cambios masivos erróneos; confirmación y auditoría  | Gestión / secretos técnicos                       |
| Supervisor                               | Resolver excepciones durante el turno            | POS/tablet; media               | Aprobación bajo presión; actor/impacto explícitos   | Alertas y aprobaciones / credenciales del cajero  |
| Cashier                                  | Vender repetidamente y con rapidez               | Touch, teclado, escáner; mínima | Dobles cobros, sucursal incorrecta, fatiga          | Carrito, total, conexión / costos y configuración |
| Employee                                 | Ejecutar tareas acotadas                         | Móvil/tablet; mínima            | Descubrimiento de acciones no autorizadas           | Tarea y estado / controles administrativos        |
| ReadOnly/contador                        | Consultar y exportar periódicamente              | Desktop; media                  | Confundir lectura con edición                       | Filtros, trazabilidad / mutaciones                |
| Admin UMI                                | Entrar con contexto a una capacidad NEXO         | Desktop UMI; alta               | Contexto duplicado o deep link manipulado           | Origen y retorno / navegación global asumida      |
| Operador tablet                          | POS continuo en horizontal o vertical            | Tablet touch; mínima            | Target pequeño, cambio de orientación               | Catálogo y carrito / navegación secundaria        |
| Operador Windows POS                     | Alta frecuencia, teclado/escáner                 | Windows touch/teclado; mínima   | Focus perdido, escala, doble submit                 | Atajos y foco / gestos exclusivamente móviles     |
| Dueño móvil                              | Consultar y aprobar rápidamente                  | Móvil; media                    | Tablas ilegibles y shoulder surfing                 | Resumen y excepciones / PII innecesaria           |
| Empleado con baja alfabetización digital | Completar una tarea guiada                       | Terminal compartida; baja       | Jargon, memoria y temor al error                    | Una acción primaria / códigos internos            |

Los permisos efectivos provienen del Authorization Context. Las personas describen necesidades, no conceden capacidades.
