# Validación manual UI ↔ API y persistencia

Entorno recomendado: Web `http://localhost:3000`, API `http://localhost:3001`, usuario `alpha.owner@nexo.local`. Abre DevTools, activa **Preserve log** en Console y Network y filtra Network por `fetch/XHR`. Nunca copies cookies, tokens ni URLs prefirmadas en evidencia.

En todos los casos anota: `Resultado: [ ] PASS [ ] FAIL`, `Notas:`, captura de pantalla, método/URL/status sanitizados y cualquier error de Console. Un PASS exige respuesta 2xx, cero fallos inesperados, UI actualizada y persistencia después de recargar.

## Sesión y perfil

### TC-SESSION-001 — Login, recarga y logout

- Objetivo: certificar sesión real y navegación protegida.
- Rol/organización/sucursal: Owner / Alpha / Centro.
- Pasos: abre `/products` en contexto privado; confirma retorno a login; entra; confirma retorno a `/products`; recarga; cierra sesión; intenta volver con Back.
- Console/Network: `POST /v1/auth/login` 2xx con `Set-Cookie`; `GET /v1/identity` 2xx; logout 2xx; después del logout la ruta protegida vuelve al login. No registres el valor de cookies.
- Esperado/persistencia/permisos: la sesión sobrevive la recarga y deja de servir tras logout; no hay éxito falso ni 401 inesperado.
- Si falla: guarda URL, método, status, request-id y captura; no incluyas headers sensibles.

### TC-SESSION-002 — Credenciales inválidas y sesión expirada

- Pasos: usa una contraseña incorrecta; confirma mensaje estable y formulario conservado. Luego elimina solo las cookies del sitio en DevTools y abre `/products`.
- Esperado: login inválido 401 sin excepción; sesión ausente redirige con `returnTo`; ninguna mutación de producto se monta ni se envía.

### TC-PROFILE-001 — Identidad personal y avatar

- Datos: nombre `Hector QA`, avatar PNG/JPEG/WebP menor de 5 MB.
- Pasos: abre Perfil; cambia nombre; selecciona foto; guarda; verifica barra y menú; recarga; logout/login; reemplaza foto; recarga; elimina; recarga.
- Network: prepare POST 2xx, PUT prefirmado 2xx, complete POST 2xx, profile PATCH 2xx, avatar GET 200 con MIME correcto, DELETE 2xx. La URL interna de MinIO nunca debe aparecer como `src`.
- Esperado: `Hector QA` es identidad personal; `Alpha` es organización; `Owner/Propietario` es rol. El mismo avatar aparece en todas las superficies personales y vuelve a iniciales tras borrar.
- Aislamiento: con un usuario de otro tenant, el identificador del avatar ajeno debe dar 404/403, nunca bytes.

## Catálogo

### TC-PRODUCT-001 — Crear producto físico

- Datos: nombre `Café Americano QA`, SKU `QA-CAFE-001`, categoría `QA Bebidas`, precio `55.00`, barcode `750000000001`.
- Pasos: Productos → completa todos los campos → Agregar; busca SKU; recarga; logout/login; busca otra vez.
- Network: categoría/producto/precio/barcode POST 2xx; cookie de sesión y `x-csrf-token` presentes; sin duplicados ni 401.
- Esperado: un registro, precio 5,500 minor units en API/DB, visible después de ambas recargas y tenant correcto.

### TC-PRODUCT-002 — Validación y SKU duplicado

- Pasos: intenta campos inválidos y luego reutiliza `QA-CAFE-001`.
- Esperado: 422/409 explicado, formulario conserva datos, modal no se cierra, no aparece segundo producto.

### TC-PRODUCT-003 — Editar, archivar y restaurar

- Estado actual: **no implementado en la UI Web expuesta**; los contratos API existen. No simules un PASS visual. Registra `NOT IMPLEMENTED` y valida estas operaciones durante Product Certification por API/cliente administrativo aprobado.

### TC-PRODUCT-004 — Variante e imagen

- Variante: **no expuesta en la UI actual**. Imagen: usa el selector disponible al crear producto; confirma prepare, PUT y complete 2xx, render tras recarga y asociación al mismo productId.

### TC-CATEGORY-001 — Crear categoría

- Se ejecuta como parte de TC-PRODUCT-001. Confirma que `QA Bebidas` se reutiliza y no se duplica. Edición/jerarquía/archivo no están expuestos actualmente.

## Inventario, clientes y equipo

### TC-INVENTORY-001 — Lectura y capacidades no expuestas

- Pasos: abre Inventario, filtra producto y revisa disponibilidad/ledger.
- Esperado: GET 2xx y sin Console errors. Ajuste, conteo, transferencia y reserva tienen contratos API pero **no controles mutables Web accesibles**; no deben marcarse como probados desde UI.

### TC-CUSTOMER-001 — Clientes

- Estado: **no implementado**; navegación muestra “Próximamente”. Crear/editar/archivar no se presenta como funcional.

### TC-TEAM-001 — Invitar miembro

- Datos: `qa.member+<fecha>@example.test`, rol y alcance disponibles.
- Pasos: Equipo → crear invitación → recargar → buscar.
- Network: POST invitation 2xx con CSRF; persistencia tras recarga. Aceptación/cambio de rol/revocación solo se marca PASS si el control correspondiente aparece; de otro modo `NOT IMPLEMENTED`.
- Permisos: repite con rol restringido; debe devolver 403 y la UI no debe anunciar éxito.

## Organización, caja y ventas

### TC-ORG-001 — Editar organización

- Datos: cambia temporalmente un campo no crítico y restáuralo.
- Pasos: Configuración → guarda → recarga → verifica; restaura valor.
- Esperado: PATCH 2xx, `If-Match`/versión coherente, sin sobrescritura silenciosa. Branding y creación/edición de sucursal solo se prueban si el control está visible; de otro modo se clasifican no implementados en UI.

### TC-CASH-001 — Apertura, entrada/salida y cierre

- Datos: caja seed, apertura MXN 1,000.00, entrada 100.00, salida 50.00 con razón QA.
- Pasos: Caja → abrir → confirma sesión; registra movimientos disponibles; cuenta; reconcilia si lo exige; cierra; recarga.
- Network: cada POST 2xx; idempotency/versión donde aplica; el retry controlado no duplica. DB/summary deben reflejar los mismos minor units.
- Esperado: no hay doble apertura ni doble cierre; 409 se explica y conserva el estado.

### TC-SALE-001 — Venta cash Flutter POS

- Requisitos: terminal enrolada, caja abierta, backend real, `NEXO_TEST_HARNESS` ausente/false.
- Pasos: login → contexto → escanea `750000000001` → carrito → checkout → efectivo exacto → completa → receipt → TestPrinter → recarga app.
- Esperado: una Sale, un PaymentAttempt, un CashMovement, un Receipt, un evento Outbox y un consumo de Inventory; nunca doble cobro.

### TC-SALE-002 — Suspender/cancelar/refund administrativo

- Web Sales expone comandos administrativos según permiso. Ejecuta solamente los botones visibles, exige razón, confirma POST 2xx, recarga y timeline. Refunds no disponibles en Flutter permanecen Web Admin only.

## Onboarding, tenant y Flutter

### TC-ONBOARD-001 — Persistencia por pasos

- Pasos: inicia onboarding en tenant de prueba; completa un paso; recarga; continúa; completa; recarga y vuelve a iniciar sesión.
- Esperado: PUT/complete 2xx; reanuda en el paso guardado y no se repite tras finalizar. Restart solo con confirmación y permiso.

### TC-TENANT-001 — Aislamiento

- Datos previos: Owner A y usuario/tenant B proporcionados por el seed de aislamiento.
- Pasos: crea `QA-CAFE-001` en A; entra en B; busca SKU; intenta URL/UUID directo y mutación desde DevTools/API aprobada.
- Esperado: no visible; 404/403; ninguna fila modificada. Nunca cambies un organizationId local para “probar” autorización en producción.

### TC-FLUTTER-001 — Sesión, contexto y expiración

- Pasos: enrola dispositivo de prueba; login; selecciona organización/sucursal; reinicia; confirma restore; revoca sesión/device desde backend; reanuda.
- Esperado: secure storage real, contexto validado, revocación bloquea operación y no hay `FakePosApi` salvo `NEXO_TEST_HARNESS=true`.

### TC-FLUTTER-002 — Recovery y offline

- Pasos: provoca timeout después de crear PaymentAttempt; reinicia; ejecuta recovery; confirma lookup autoritativo. Después desconecta red e intenta venta.
- Esperado: no se crea otro intento/venta; recupera receipt si aprobó. Offline permite catálogo/cache/draft/receipt, pero bloquea toda operación financiera con explicación.

## Cobertura de acciones solicitadas

Una fila `No UI` se valida confirmando que no existe un control engañoso; el contrato correspondiente se cubre por integration test, no se declara probado visualmente.

| Dominio      | Acción                                    | Caso            | Disponibilidad UI actual                |
| ------------ | ----------------------------------------- | --------------- | --------------------------------------- |
| Sesión       | logout global                             | SESSION-001     | Flutter/API; sin control Web dedicado   |
| Producto     | editar/archivar/restaurar/variante        | PRODUCT-003/004 | No UI                                   |
| Categoría    | editar/jerarquía/archivar                 | CATEGORY-001    | No UI                                   |
| Inventario   | +/-/conteo/transferencia/reserva          | INVENTORY-001   | Lectura Web; mutación API-only          |
| Cliente      | crear/editar/buscar/duplicado/archivar    | CUSTOMER-001    | Próximamente / No UI                    |
| Equipo       | aceptar/rol/scope/revocar                 | TEAM-001        | Parcial; probar solo controles visibles |
| Organización | branding/sucursal CRUD                    | ORG-001         | Parcial; contratos API                  |
| Caja         | entrada/salida/doble open/count/close     | CASH-001        | Web/Flutter según permiso               |
| Ventas       | cantidades/descuento/suspend/resume/cobro | SALE-001/002    | POS y Sales Admin                       |
| Ventas       | cancel/refund                             | SALE-002        | Web Admin según permiso                 |
| Onboarding   | save/reload/resume/complete               | ONBOARD-001     | Web                                     |
| Tenant       | lectura/escritura por ID cruzado          | TENANT-001      | API + navegación autorizada             |
| Flutter      | auth/context/device/recovery/offline      | FLUTTER-001/002 | POS                                     |

## Registro por caso

| ID  | Fecha | Entorno | Resultado                     | Console | Network | Captura | Notas |
| --- | ----- | ------- | ----------------------------- | ------- | ------- | ------- | ----- |
|     |       |         | PASS / FAIL / NOT IMPLEMENTED |         |         |         |       |

## Corrective pass — casos críticos del owner

Para todos los casos siguientes usa `alpha.owner@nexo.local`, organización **Organization Alpha** y sucursal **Branch Centro**, salvo que el caso indique lo contrario. Antes de empezar limpia Console y Network, activa **Preserve log**, filtra por Fetch/XHR y conserva únicamente evidencia sanitizada.

### TC-CORR-SELECT-001 — Moneda, rol y ubicación legibles

- Objetivo: confirmar que ninguna opción depende de hover para leerse.
- Pasos: abre Configuración y despliega Moneda, Idioma y Zona horaria; abre Equipo y recorre los roles con Tab/flechas; abre Inventario y despliega Producto o presentación y Ubicación. Selecciona MXN, Cajero, un producto y Almacén QA.
- Pantalla: texto y fondo tienen contraste en estado normal, seleccionado, hover, focus y disabled; Escape cierra y Enter selecciona.
- Console/Network: cero errores; los GET de organización, roles, catálogo y ubicaciones son 200.
- Persistencia: recarga Configuración después de guardar MXN; el formulario conserva el valor.
- Evidencia: una captura por familia con el control abierto y otra con el valor seleccionado.
- Resultado: [ ] PASS [ ] FAIL. Notas:

### TC-CORR-ONBOARD-IMAGE-001 — Imagen recuperable en onboarding

- Datos previos: tenant de prueba con onboarding reiniciable; PNG, JPEG y WebP válidos menores de 1 MB; un `.txt` renombrado y un archivo mayor de 1 MB.
- Pasos: llega al paso de producto; cancela el selector; carga PNG; confirma preview y formulario visible; reemplaza por JPEG y WebP; elimina; prueba archivo inválido y grande; vuelve al paso anterior, regresa, guarda, recarga y reanuda.
- Network: el avance usa PUT 200; al terminar, prepare/PUT MinIO/complete son 2xx. Un archivo inválido se rechaza antes del upload.
- Esperado: nunca aparece panel vacío; error recuperable; reemplazar/eliminar funciona; el producto terminado conserva su imagen.
- Evidencia: preview, error recuperable, producto final después de recarga.
- Resultado: [ ] PASS [ ] FAIL. Notas:

### TC-CORR-IDENTITY-001 — Avatar único e identidad clara

- Datos: nombre personal `Hector QA Corrective`, PNG menor de 1 MB.
- Pasos: Perfil → cambia nombre y avatar → Guardar. Sin recargar abre el menú de cuenta; compara botón superior, menú y Perfil. Recarga, logout/login, reemplaza y elimina.
- Esperado: las tres superficies usan `/v1/identity`; `Hector QA Corrective` es persona, `Organization Alpha` es negocio y `Propietario` es rol. El avatar cambia inmediatamente y todas las superficies vuelven a las mismas iniciales al borrar.
- Network: prepare, PUT, complete, PATCH y GET avatar 2xx; cero MinIO interno en `src`; cero imagen rota.
- Resultado: [ ] PASS [ ] FAIL. Notas:

### TC-CORR-CASH-001 — Selección, autocompletado y ayuda

- Pasos: abre Caja; abre “Cómo funciona Caja”; selecciona una radio-card de punto de cobro y una de cajón; abre Configurar puntos de cobro.
- Esperado: selección visible; Nombre/Código se actualizan; etiquetas principales son “Caja principal”, “Caja de reembolsos”, “Caja de transferencias” o “Caja con aprobación dual”, no nombres de harness; crear cajón está deshabilitado sin punto seleccionado.
- Console/Network: carga 200 sin 400/409/500 inesperados.
- Resultado: [ ] PASS [ ] FAIL. Notas:

### TC-CORR-CASH-002 — Flujo válido sin errores HTTP

- Datos: nombre `Caja Owner QA`, código `OWNER-QA-01`, apertura `100000`, entrada `10000`, conteo autoritativo mostrado por el resumen.
- Pasos: crea punto; confirma selección automática; crea cajón; abre sesión; registra entrada con motivo; suspende/reanuda; consulta resumen; cuenta; reconcilia; cierra; recarga.
- Network: cada comando 201/200; cero 400/409/500; no repitas una acción deshabilitada. Un segundo intento deliberado debe quedar prevenido por UI.
- Persistencia: después de recarga la sesión está cerrada y timeline/ledger conserva los movimientos.
- Resultado: [ ] PASS [ ] FAIL. Notas:

### TC-CORR-PRODUCT-001 — Imagen, estado y detalle

- Datos: `Ramen Owner QA`, SKU `RAMEN-OWNER-QA`, categoría `Alimentos QA`, precio `129.00`, PNG válido.
- Pasos: crea el producto; espera “Cambios guardados”; verifica card con imagen grande, precio, categoría y **Activo**; recarga; abre detalle; cierra con X, Escape, click exterior y Cerrar.
- Network: categoría (solo si nueva), producto, precio, media y activación 2xx; GET media 200. Cero recursos rotos.
- Esperado: no se anuncia “Listo” para un borrador; diálogo tiene focus, título y `aria-modal`; imagen persiste.
- Resultado: [ ] PASS [ ] FAIL. Notas:

### TC-CORR-CATEGORY-001 — Categoría existente y nueva

- Pasos: crea producto con categoría nueva `Alimentos QA`; crea otro usando exactamente esa categoría; intenta `alimentos qa`.
- Esperado: selector permite buscar; se reutiliza una sola categoría normalizada; no hay duplicados por espacios/mayúsculas; una colisión devuelve mensaje humano y conserva el formulario.
- Resultado: [ ] PASS [ ] FAIL. Notas:

### TC-CORR-INVENTORY-001 — IDs autoritativos y balance

- Pasos: abre Inventario; selecciona `Ramen Owner QA — presentación principal` y `Almacén QA`; pulsa Consultar existencias.
- Network: query contiene UUIDs de variante y ubicación, nunca los textos `ramen` o `centro`; respuesta 200.
- Esperado: helper explica En mano/Disponible/Reservado y el empty state indica cómo elegir. Si no hay balance, informa que falta existencia inicial; no muestra 400.
- Resultado: [ ] PASS [ ] FAIL. Notas:

### TC-CORR-TEAM-001 — Invitación, Mailpit y aceptación

- Datos: `beta.owner@nexo.local`, rol Cajero y alcance permitido.
- Pasos: Equipo → invita; verifica fila Pendiente; abre `http://localhost:8025`, busca el correo y abre el enlace; inicia sesión como el correo invitado; acepta en `/invitations/accept`; regresa como owner; verifica Miembro; prueba reenviar en otra invitación y revocarla.
- Esperado: mensaje “Invitación enviada a …” solo si Mailpit recibió; ruta de invitado no crea negocio; token es de un uso; membership refleja rol/alcance.
- Network: create/resend 2xx, accept 201, revoke 200; cero abortos 204 engañosos.
- Resultado: [ ] PASS [ ] FAIL. Notas:

### TC-CORR-ORG-001 — Nombre consistente

- Datos: `Ramen QA Owner`.
- Pasos: cambia el nombre en Configuración o completa onboarding de tenant limpio; verifica header, selector de negocio, Configuración, Productos, Inventario y Caja; recarga y logout/login.
- Network/PostgreSQL: PATCH u onboarding complete 2xx y GET organization retorna exactamente el valor.
- Esperado: no aparece Café Horizonte, Alpha, Mi negocio o NEXO Demo como fallback cuando existe nombre real.
- Resultado: [ ] PASS [ ] FAIL. Notas:

### TC-CORR-SESSION-001 — Advertencia, mantener y retorno

- Datos: entorno manual con idle 20 min y advertencia 5 min antes.
- Pasos: abre un formulario sin enviarlo; deja inactivo hasta el modal; confirma cuenta regresiva; pulsa Mantener sesión; verifica ruta/campos; repite y deja expirar; inicia sesión.
- Network: un solo POST refresh al mantener; logout/expiración no ejecuta mutaciones pendientes; login conserva `returnTo`.
- Esperado: modal “Tu sesión está por expirar por inactividad.”; campos no enviados permanecen al renovar; al expirar vuelve a la ruta después de login.
- Resultado: [ ] PASS [ ] FAIL. Notas:

# CORRECTIVE PASS 2 REVALIDATION

En todos los casos: Console sin errores; Network sin 401/400/409/500 inesperados; guarda captura y marca **PASS / FAIL** y notas.

## TC-CP2-001 — Bootstrap de onboarding

1. Abre una ventana privada sin cookies y entra a `http://localhost:3000`: debe mostrarse Login sin consultar `/v1/identity` ni `/v1/auth/refresh`.
2. Inicia sesión, entra al onboarding y recarga en un paso intermedio: identidad y progreso deben cargar sin 401 ni refresh duplicado.
3. Prueba una cookie expirada: debe ocurrir un solo refresh o retorno a Login con `returnTo`.

Evidencia: Console y Network. Resultado: \_**\_ Notas: \_\_**

## TC-CP2-002 — Horarios con mouse y teclado

1. En Horarios, abre Lunes. Selecciona 08:30–17:45 usando los selectores Hora/Minutos con mouse.
2. Repite mediante Tab, flechas y Enter; prueba 22:00–02:00, Cerrado y 24 horas.
3. Confirma scroll de las 24 horas y 60 minutos y ausencia de listas cortadas.

Evidencia: selector abierto. Resultado: \_**\_ Notas: \_\_**

## TC-CP2-003 — Catálogo e imagen de onboarding

1. Llega a Catálogo con tres sugerencias seleccionadas.
2. Captura buscador, contador, “Seleccionar todos” y chips alineados.
3. Sube PNG/JPEG/WebP real. Encabezado, categorías, selección, campos, Atrás y Continuar deben permanecer visibles.
4. Reemplaza, elimina, vuelve atrás y regresa. No debe aparecer un panel vacío.

Evidencia antes/después. Resultado: \_**\_ Notas: \_\_**

## TC-CP2-004 — Equipo y perfil

1. Confirma que correo es input de una línea y roles están alineados.
2. En Perfil confirma separación entre preview, Reemplazar y Eliminar foto.

Resultado: \_**\_ Notas: \_\_**

## TC-CP2-005 — Logo, iconos y avatar

1. Compara el mismo wordmark en Login, Onboarding y sidebar centrado.
2. Sube avatar y navega Inicio → Productos → Inventario → Ventas; header y menú deben mostrar la misma imagen en cada ruta y tras recarga.
3. Confirma iconos semánticos de Inicio, Ventas, Caja, Productos, Inventario, Equipo, Reportes y Configuración.

Resultado: \_**\_ Notas: \_\_**

## TC-CP2-006 — Ventas legible y ayuda

1. Abre Ventas y la guía. Debe explicar búsqueda, estados y acciones.
2. Abre una venta: no debe existir JSON abierto ni nombres como `SaleCompleted`.
3. Confirma resumen, productos, pagos, recibos y timeline en español con fechas legibles.

Resultado: \_**\_ Notas: \_\_**

## TC-CP2-007 — Máquina de estados de Ventas

1. Venta abierta: Suspender/Cancelar habilitados; Reanudar/Recibo explican por qué están deshabilitados.
2. Suspende y confirma que Reanudar queda habilitado; reanuda y cancela cuando corresponda.
3. Ningún botón habilitado debe provocar 409; doble click queda bloqueado.

Resultado: \_**\_ Notas: \_\_**

## TC-CP2-008 — Recibo, diagnóstico y scroll

1. En venta completada pulsa Regenerar recibo: observa loading, confirmación autoritativa y mensaje “Recibo regenerado correctamente”.
2. Confirma scroll/focus al detalle actualizado.
3. Pulsa Copiar diagnóstico: label “Copiado” y anuncio accesible; el JSON técnico permanece cerrado.

Resultado: \_**\_ Notas: \_\_**

## TC-CP2-009 — Card y modal de producto

1. Con DevTools abierto reduce el viewport. Nombre/SKU deben seguir horizontales y la card medir al menos ~300 px.
2. Prueba nombre y SKU largos, imagen vertical/horizontal y fallback.
3. Abre detalle: imagen real, una sola X “Cerrar detalle del producto”, Escape y click fuera.

Resultado: \_**\_ Notas: \_\_**

## TC-CP2-010 — Ayuda transversal

1. Revisa Login, Onboarding, Inicio, Ventas, Caja, Productos, Inventario, Equipo, Reportes, Configuración, Perfil e Invitaciones.
2. La ayuda aparece la primera vez, puede cerrarse/reabrirse y no tapa acciones.
3. Déjala 10 s; repite con hover/focus para comprobar pausa.
4. En Ayuda pulsa “Restablecer ayudas y recorridos” y confirma que reaparecen.

Resultado: \_**\_ Notas: \_\_**

## TC-CP2-011 — Estados educativos y acciones deshabilitadas

1. Revisa estados vacíos de Productos, Inventario, Equipo, Ventas, Caja y Reportes.
2. Cada uno debe explicar el siguiente paso. Cada acción crítica deshabilitada debe mostrar motivo.

Resultado: \_**\_ Notas: \_\_**

## TC-CP2-012 — Regresión de sesión y navegación

1. Navega, recarga y logout/login después de los cambios anteriores.
2. Confirma organización, avatar, ruta, formularios guardados y ausencia de requests fallidos.

Resultado: \_**\_ Notas: \_\_**
