# UX Writing

Raw lifecycle enums are translated at the presentational boundary. Empty money and status values explain when data will exist and the next action. “Control Plane”, handoff, timeline and backend provenance are removed from primary business copy.

## Prompt 12.3 es-MX policy

Primary product language is Spanish (Mexico). Business vocabulary replaces internal transport terms: Propietario, Devolución, Recibo, Actividad, Punto de cobro, Cajón de efectivo, Operaciones por procesar and Eventos con error. Outbox, quarantine, sink, idempotency and correlation identifiers are limited to authorized advanced diagnostics or developer documentation.

Voz: español de México, clara, breve, cercana y profesional. Tono sereno en errores, directo en operación y respetuoso en seguridad. Preparar mensajes mediante claves i18n; no concatenar frases.

| Situación          | Patrón                | Ejemplo                                                                 |
| ------------------ | --------------------- | ----------------------------------------------------------------------- |
| Botón              | verbo + objeto        | `Guardar producto`                                                      |
| Loading            | acción en curso       | `Guardando producto…`                                                   |
| Vacío              | estado + cómo empezar | `Aún no hay productos. Crea el primero.`                                |
| Campo              | causa + corrección    | `El SKU ya existe. Usa uno diferente.`                                  |
| Permiso            | impacto sin filtrar   | `No tienes acceso a esta acción.`                                       |
| Sesión             | estado + recuperación | `Tu sesión terminó. Inicia sesión para continuar.`                      |
| Offline            | impacto + seguridad   | `Sin conexión. La venta no se ha perdido.`                              |
| Conflicto          | qué cambió + acción   | `Esta venta cambió en otro dispositivo. Actualiza antes de continuar.`  |
| Replay idempotente | resultado             | `La operación ya se había completado; mostramos el resultado original.` |
| Inventario         | límite + alternativa  | `No hay unidades suficientes. Ajusta la cantidad.`                      |
| Venta completa     | irreversibilidad      | `La venta ya está completada. Inicia una devolución si corresponde.`    |

Prohibidos sin contexto: “Algo salió mal”, “Error 500”, “Inválido”. Los códigos se reservan para diagnóstico secundario y soporte.
