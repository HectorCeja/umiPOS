# User Flows

## Contrato común

Cada flujo resuelve tenant/membership/branch y permiso en backend; muestra loading específico, bloquea doble submit, conserva idempotency key durante retry y traduce errores estables. Touch usa targets ≥44 px; teclado conserva orden/foco; móvil divide formularios largos sin perder datos.

| Flujo (actor)                | Precondición → camino principal → resultado                  | Alternativas/errores/confirmación                     | Pasos objetivo |
| ---------------------------- | ------------------------------------------------------------ | ----------------------------------------------------- | -------------: |
| Registro (Owner)             | Sin sesión → identidad → verificar correo → onboarding       | correo existente sin enumeración                      |              3 |
| Login/recuperación           | identidad → credencial o recuperación → sesión               | lockout, enlace expirado, MFA future                  |            2–4 |
| Onboarding                   | Owner → datos básicos → plantilla → confirmar → org+sucursal | reiniciar idempotente; locale inválido                |              4 |
| Seleccionar/cambiar contexto | memberships → organización → sucursal                        | trabajo pendiente exige confirmar                     |            1–2 |
| Crear organización/sucursal  | permiso admin → formulario → confirmación backend            | duplicado/locale; conservar formulario                |              2 |
| Invitar/asignar rol          | miembro admin → correo+scope+rol → enviar/aceptar            | expiración/reenvío; no revelar otro tenant            |              3 |
| Crear producto/variante      | permiso+feature → datos → precio → guardar                   | SKU/barcode duplicado; enfocar error                  |            2–3 |
| Subir imagen                 | producto → archivo+alt → progreso → asociar                  | formato/tamaño; retry idempotente                     |              2 |
| Recibir/ajustar inventario   | variante+location → cantidad+motivo → confirmar              | política/costo inválido; acción auditada              |            2–3 |
| Transferir inventario        | origen/destino → líneas → revisar → crear                    | disponibilidad/concurrencia                           |              3 |
| Contar inventario            | conteo → captura → diferencias → aprobar                     | pausa/reanudación; supervisor si excede política      |              3 |
| Crear venta                  | cashier+branch → nueva venta → OPEN                          | branch archivada/feature off                          |              1 |
| Agregar producto/servicio    | buscar/escanear → seleccionar → servidor agrega snapshot     | no vendible/no stock; servicio omite stock            |              1 |
| Modificar cantidad           | línea → +/- o campo → servidor recalcula                     | conflicto/version; restaurar valor confirmado         |              1 |
| Descuento/aprobación         | elegir tipo+motivo → evaluar permiso/política → recalcular   | límite: solicitar supervisor sin compartir credencial |            2–3 |
| Suspender/recuperar          | acción+motivo → reservar según política → lista → abrir      | expiración/liberación; conflicto entre terminales     |            1–2 |
| Preparar checkout            | cobrar → servidor revalida y reserva → resumen               | precio/stock cambió: explicar y volver al carrito     |              1 |
| Efectivo                     | importe recibido → validar → confirmar pago                  | insuficiente; cambio visible; doble submit bloqueado  |              2 |
| Pago mixto                   | método+importe repetidos → saldo cero → confirmar            | asignación rechazada no cuenta                        |             3+ |
| Completar/recibo             | pago suficiente → servidor completa → recibo                 | timeout: consultar idempotencia antes de reintentar   |              1 |
| Cancelar abierta             | permiso+motivo → confirmar → liberar reserva                 | completada requiere refund, no cancelación            |              2 |
| Iniciar refund               | venta → líneas/cantidades/destino → motivo+aprobación        | límite/estado; no promete proveedor real              |              3 |
| Historial/detalle            | filtros → resultados → detalle/receipt                       | read-only; cross-branch según scope                   |            1–2 |
| Revocar sesión               | seguridad → sesión → confirmar → revocada                    | sesión actual vuelve a login                          |              2 |
| Integración UMI futura       | admin → estado/mappings → diagnóstico                        | sin conexión productiva; no mostrar secretos          |              2 |

## Recuperación crítica de checkout

Si `prepare` responde `CHECKOUT_RECALCULATION_REQUIRED`, se conserva carrito, se resalta cada diferencia y se requiere aceptar el nuevo resultado. Tras timeout de `complete`, la UI consulta por idempotency key; nunca crea otra venta ni registra otro pago a ciegas.
