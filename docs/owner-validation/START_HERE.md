# START HERE — revalidación correctiva del owner

## MASTER PASS PART 2A — confirmación visual requerida

Estado técnico: `OWNER FINAL ACCEPTANCE MASTER PASS PART 2A — TECHNICALLY RESOLVED / OWNER CONFIRMATION REQUIRED`.

Cuenta limpia permanente: `alpha2.owner@nexo.local`, usando la credencial local autorizada de Alpha. `manual-acceptance:prepare` la restablece; `manual-acceptance:start` conserva su avance. Para reiniciarla bajo demanda: `pnpm owner:alpha2:reset`. Debe abrir onboarding paso 1 después del reset y nunca Organization Alpha.

Recorrido reducido Part 2A:

1. Login: abre la ayuda y confirma que solo contiene texto y X.
2. Alpha2: inicia sesión y confirma onboarding PASO 1.
3. Alpha: abre Caja y verifica feedback local; “Actualizar” sí revela el resumen.
4. Ventas: “Actualizar” revela detalle/timeline; guardar no salta al inicio.
5. Productos: confirma Servicio con maletín, abre editor desktop y 390 px, y revisa la X.
6. Configuración → Ubicaciones: crea, duplica código (error local), edita, archiva y restaura.
7. Inventario: confirma la ubicación real en el selector.
8. Repite a 320 px: llega al último contenido y comprueba hamburger/X centrados.
9. En todo el recorrido: Console y Network sin errores inesperados.

Evidencia: `artifacts/owner-final-acceptance-master-part-2a/`. Ningún P0 está `OWNER_CONFIRMED`. Product Certification continúa bloqueada.

## OWNER FINAL ACCEPTANCE GATE — PART 1A

La corrección técnica está lista, pero ningún P0 se considera cerrado hasta tu confirmación visual. Ejecuta `pnpm manual-acceptance:start` y abre `http://localhost:3000` en Chromium/Linux Mint.

Recorrido reducido, en este orden:

1. Login: abre la ayuda; no debe ofrecer Centro de Ayuda autenticado.
2. Onboarding limpio: ejecuta `pnpm owner:business:new`, inicia con el correo impreso y confirma el negocio nuevo.
3. Dashboard → Productos → Inventario → Ventas → Caja → Equipo → Configuración → Perfil.
4. Avatar: súbelo en Perfil, repite el recorrido y confirma header/menú tras cada navegación.
5. Productos: abre un producto, edita nombre/precio/foto/descripción/icono/categoría/SKU/código y recarga.
6. Inventario: cambia la sucursal, selecciona producto/ubicación y confirma la alineación de “Consultar existencias”.
7. Caja: crea punto/cajón, abre turno y realiza el ciclo permitido; ninguna acción visible debe producir 500.
8. Configuración: crea, renombra, archiva y restaura una sucursal.
9. Repite Inventario y Caja con DevTools docked; todo el contenido debe seguir accesible.
10. En todos los pasos: Console sin errores y Network sin 401/409/500 inesperados.

Guarda PASS/FAIL y captura en `OWNER_TEST_RUN.md`. Evidencia previa: `artifacts/owner-final-acceptance-part-1a/`. NEXO Product Certification sigue bloqueada.

## Part 2A — validación física en Mac

1. En Linux Mint ejecuta `pnpm owner:business:new` y guarda el correo mostrado.
2. Ejecuta `pnpm owner:share`.
3. En el Mac abre la URL Web impresa e inicia sesión.
4. Confirma el negocio nuevo en Header, Productos, Inventario, Caja y Configuración.
5. Recorre Ventas, Equipo, Perfil, Reportes y Ayuda.
6. Sube un avatar PNG; navega, recarga y confirma que permanece.
7. Console: cero errores. Network: cero 401, 409 o 500 inesperados.
8. Registra PASS/FAIL. Product Certification continúa bloqueada.

Estado esperado al comenzar: `CORRECTIVE PASS 2 COMPLETE — OWNER REVALIDATION REQUIRED`. Product Certification sigue bloqueada hasta tu aprobación explícita.

## Arranque confiable

La preparación desde cero se ejecuta una sola vez con `pnpm manual-acceptance:setup`.
Para el uso cotidiano ejecuta `pnpm manual-acceptance:start`; debe mostrar progreso y un
resumen `NEXO READY`. Confirma cualquier demora con `pnpm manual-acceptance:status` y abre
logs específicos con `pnpm manual-acceptance:logs api` (o `web`, `worker`, etc.). Usa
`pnpm manual-acceptance:stop` al terminar. Consulta [BOOT_CERTIFICATION.md](../BOOT_CERTIFICATION.md).

## CORRECTIVE PASS 2 REVALIDATION

Si es la primera ejecución usa `pnpm manual-acceptance:setup`; en ejecuciones posteriores
usa `pnpm manual-acceptance:start`. Después ejecuta el recorrido reducido `TC-CP2-001` a
`TC-CP2-012` de `UI_API_PERSISTENCE_MANUAL_TESTS.md` con Chromium en Linux Mint, Console y
Network preservados. La evidencia automatizada previa está en
`artifacts/ui-api-persistence-certification/corrective-pass-2/`.

## Preparación

1. Confirma servicios: Web `http://localhost:3000`, API `http://localhost:3001`, Mailpit `http://localhost:8025`.
2. Usa una ventana privada de Chromium, DevTools acoplado, Console y Network con **Preserve log**.
3. En Network activa Fetch/XHR. No captures cookies, tokens, URLs prefirmadas ni payloads personales.
4. Inicia con `alpha.owner@nexo.local` y la contraseña local autorizada. La organización seed debe ser `Organization Alpha` y la sucursal `Branch Centro`.
5. Abre [UI_API_PERSISTENCE_MANUAL_TESTS.md](UI_API_PERSISTENCE_MANUAL_TESTS.md) para registrar PASS/FAIL y notas.

## Orden obligatorio

1. `TC-CP2-001` a `TC-CP2-003`: bootstrap, horario y uploader del onboarding.
2. `TC-CP2-004` y `TC-CP2-005`: perfil, logo, iconos y avatar durante navegación.
3. `TC-CP2-006` a `TC-CP2-008`: Ventas legible, estados, recibo, diagnóstico y scroll.
4. `TC-CP2-009`: cards y modal de producto.
5. `TC-CP2-010` y `TC-CP2-011`: ayuda transversal, empty states y motivos deshabilitados.
6. `TC-CP2-012`: sesión, refresh, navegación y persistencia.

## Regla de fallo

Marca FAIL ante cualquier `console.error`, `pageerror`, request fallido, HTTP 500, 401 inesperado, 400 por payload de UI, 409 evitable, loader infinito, dato perdido al recargar, imagen rota o mensaje de éxito previo a la respuesta. Guarda captura, método/ruta/status sanitizados y `request-id`. No continúes una operación financiera si el estado es ambiguo.

## Entrega al equipo

Completa [OWNER_TEST_RUN.md](OWNER_TEST_RUN.md), adjunta capturas por ID y comunica explícitamente si los casos críticos pasan. Solo el owner puede autorizar el cambio final a `COMPLETE` y el inicio posterior de NEXO Product Certification.

# OWNER FINAL ACCEPTANCE MASTER PASS — PART 2B

Estado: **IN PROGRESS — OWNER REVALIDATION NOT YET REQUESTED**.

NEXO Product Certification continúa bloqueada. No iniciar todavía la revalidación del owner. Para
continuar la validación técnica, preparar el entorno y restablecer el usuario limpio:

```bash
pnpm manual-acceptance:prepare
pnpm owner:alpha2:reset
pnpm manual-acceptance:start
```

Recorrido reducido: iniciar con Alpha2, llegar a Catálogo, llenar todos los campos, subir una imagen,
confirmar que el formulario permanece y completar onboarding. Después cerrar sesión, entrar con Alpha,
validar toasts y grid de Caja, cards de Productos y scroll/menú en 280, 320, 360, 390 y 412 px.

Evidencia: `artifacts/owner-final-acceptance-master-part-2b/`.

# OWNER FINAL ACCEPTANCE MASTER PASS — PART 2C

Estado técnico: **TECHNICALLY RESOLVED — OWNER CONFIRMATION REQUIRED**. Product Certification sigue bloqueada.

Recorrido reducido para la confirmación futura del owner:

1. Ejecuta `pnpm manual-acceptance:start` (la preparación ya pasó tres veces consecutivas).
2. Ejecuta `pnpm owner:alpha2:reset`, inicia con Alpha2 y deja vacío el nombre comercial: debe impedir avanzar, explicar el dato y enfocar el campo.
3. En Catálogo completa todos los campos y sube una imagen: el diálogo, los valores y el preview deben permanecer durante y después.
4. Revisa los selects del mismo paso, editor de Producto e Inventario: exactamente un chevron, sin textura ni flecha nativa.
5. Revisa las opciones de icono del catálogo: centro óptico y selección sin desplazamiento.
6. Inicia con Alpha, baja al final de Caja y ejecuta una acción válida: el toast debe permanecer dentro del viewport y el scroll no debe cambiar; repite a 390 px.
7. Mantén Console y Network abiertas: cero errores inesperados.

Evidencia: `artifacts/owner-final-acceptance-master-part-2c/`. Ningún ítem está `OWNER_CONFIRMED`.

# FINAL TOUCHES — recorrido reducido

1. Restablece Alpha2 y llega a Catálogo; completa todos los campos y sube, reemplaza y elimina una imagen.
2. Confirma que el diálogo nunca se vacía y que todos los valores permanecen.
3. Con Alpha, edita un Producto y confirma el Premium Toast abajo a la derecha sin movimiento del viewport.
4. En Inventario selecciona producto y ubicación, pulsa “Consultar existencias” y confirma que Saldo por estado entra en vista, recibe focus y se resalta.
5. Revisa sus tarjetas, skeleton y empty state a desktop y 390 px.
6. Revisa el padding izquierdo y chevron de selects en onboarding, Productos, Inventario y Configuración.
7. Mantén Console y Network abiertas durante el recorrido.

Evidencia: `artifacts/owner-final-acceptance-master-final-touches/`. Product Certification permanece bloqueada.
