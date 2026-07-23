# Owner Test Run — UI/API/Persistencia

## Owner Final Acceptance Gate — Part 1A

| Caso                                       | Fecha | Entorno             | Resultado   | Console | Network | Captura | Notas |
| ------------------------------------------ | ----- | ------------------- | ----------- | ------- | ------- | ------- | ----- |
| OFA-001 Ayuda pública de Login             |       | Chromium/Linux Mint | PASS / FAIL |         |         |         |       |
| OFA-002 Avatar durante navegación completa |       | Chromium/Linux Mint | PASS / FAIL |         |         |         |       |
| OFA-003 Cero botones verdes de acción      |       | Chromium/Linux Mint | PASS / FAIL |         |         |         |       |
| OFA-004 Feedback y scroll automático       |       | Chromium/Linux Mint | PASS / FAIL |         |         |         |       |
| OFA-005 Caja real sin 500                  |       | Chromium/Linux Mint | PASS / FAIL |         |         |         |       |
| OFA-006 Edición completa de producto       |       | Chromium/Linux Mint | PASS / FAIL |         |         |         |       |
| OFA-007 Selector/alineación de Inventario  |       | Chromium/Linux Mint | PASS / FAIL |         |         |         |       |
| OFA-008 CRUD de sucursales                 |       | Chromium/Linux Mint | PASS / FAIL |         |         |         |       |
| OFA-009 Viewport con DevTools              |       | Chromium/Linux Mint | PASS / FAIL |         |         |         |       |
| OFA-010 Walkthrough de negocio nuevo       |       | Chromium/Linux Mint | PASS / FAIL |         |         |         |       |

El estado no cambia a COMPLETE hasta que todas las filas tengan confirmación del owner.

Ejecuta en este orden para evitar que un dato dependiente o una sesión vieja contamine el resultado. Usa una fecha/sufijo único en todo dato QA.

| Sesión                       | Casos                                                     | Objetivo de salida                                                      |
| ---------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1. Autenticación y perfil    | SESSION-001/002, PROFILE-001, CORR-IDENTITY/SESSION-001   | Sesión real; advertencia y nombre/avatar personal consistentes          |
| 2. Organización y sucursales | ORG-001, CORR-ORG-001                                     | Contexto y nombre real persistentes en todas las superficies            |
| 3. Productos y categorías    | PRODUCT-001..004, CATEGORY-001, CORR-PRODUCT/CATEGORY-001 | Crear/media/estado/detalle persisten; validación no produce éxito falso |
| 4. Inventario                | INVENTORY-001, CORR-INVENTORY-001                         | Selectores envían UUIDs; consulta real sin 400                          |
| 5. Clientes                  | CUSTOMER-001                                              | Confirmar estado Próximamente, sin UI engañosa                          |
| 6. Equipo y permisos         | TEAM-001, CORR-TEAM-001                                   | Mailpit, aceptación, persistencia y 403 real                            |
| 7. Caja                      | CASH-001, CORR-CASH-001/002                               | Selección clara y apertura/movimientos/conteo/cierre autoritativos      |
| 8. Ventas                    | SALE-001/002                                              | Integridad Sale/Payment/Inventory/Cash/Receipt/Outbox                   |
| 9. Persistencia              | recargas de todos los casos                               | Sobrevive recarga y nueva sesión                                        |
| 10. Aislamiento tenant       | TENANT-001                                                | Cero lectura/escritura cruzada                                          |
| 11. Flutter POS              | FLUTTER-001/002                                           | Backend real, revocación, recovery y bloqueo offline                    |
| 12. Regresión final          | CORR-SELECT-001 + CORR-SESSION-001 + PRODUCT-001          | Console/Network limpios, selectores legibles y sin regresión            |

Antes de cada sesión: limpia solo los filtros de DevTools, no la base; activa Preserve log; registra commit, navegador/dispositivo y API base. Después: exporta HAR sanitizado (sin cookies/Authorization/URLs prefirmadas), captura Console y marca cada caso.

| Caso | Fecha | Entorno | Navegador/dispositivo | Resultado   | Error observado | Console error | Network error | Captura | Comentarios |
| ---- | ----- | ------- | --------------------- | ----------- | --------------- | ------------- | ------------- | ------- | ----------- |
|      |       |         |                       | PASS / FAIL |                 |               |               |         |             |

Si falla: detente solo si la siguiente acción depende de ese caso; conserva formulario y evidencia; anota request-id, endpoint/método/status y hora; no compartas secretos. Un control ausente se registra `NOT IMPLEMENTED`, nunca PASS.

# CORRECTIVE PASS 2 REVALIDATION

| Caso       | Fecha | Chromium/Linux Mint | Resultado | Console | Network | Captura | Notas |
| ---------- | ----- | ------------------- | --------- | ------- | ------- | ------- | ----- |
| TC-CP2-001 |       |                     |           |         |         |         |       |
| TC-CP2-002 |       |                     |           |         |         |         |       |
| TC-CP2-003 |       |                     |           |         |         |         |       |
| TC-CP2-004 |       |                     |           |         |         |         |       |
| TC-CP2-005 |       |                     |           |         |         |         |       |
| TC-CP2-006 |       |                     |           |         |         |         |       |
| TC-CP2-007 |       |                     |           |         |         |         |       |
| TC-CP2-008 |       |                     |           |         |         |         |       |
| TC-CP2-009 |       |                     |           |         |         |         |       |
| TC-CP2-010 |       |                     |           |         |         |         |       |
| TC-CP2-011 |       |                     |           |         |         |         |       |
| TC-CP2-012 |       |                     |           |         |         |         |       |
