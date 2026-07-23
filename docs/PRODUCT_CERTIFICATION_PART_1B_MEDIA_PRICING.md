# NEXO Product Certification — Part 1B, Parte 2

## Veredicto

**PASS WITH OBSERVATIONS**

## Executive Summary

Media privada, ownership, precio base, moneda, relaciones Product/Variant, RLS y entrega Web quedaron demostrados contra PostgreSQL, MinIO, API y Web desplegados. Se reprodujeron y corrigieron cuatro defectos materiales: MIME activo aceptado, finalización controlable mediante `objectKey`, ausencia de validación de bytes/tamaño y posibilidad de más de un precio activo durante carreras. No se encontró fuga cross-tenant. Signed GET no existe: la lectura es un proxy autenticado. Tax profiles, price lists, fechas efectivas, branch/channel pricing, replace/delete explícitos y limpieza de huérfanos no están implementados y no se presentan como certificados.

## Estado heredado

Se conservan Product Aggregate, SKU, Barcode, Category, Variant, optimistic locking, lifecycle, constraints compuestos y aislamiento certificados en Parte 1. La regresión final volvió a demostrar esas garantías.

## Media Architecture

Flujo real: Web Admin → API con sesión/CSRF y `product.media.manage` → fila `ProductMedia(PENDING)` y key generada por servidor → signed PUT privado MinIO → API lee/stat del objeto emitido → validación de tamaño y firma → activación transaccional → GET autenticado por API. No hay signed GET, CDN ni URL pública.

Autoridades: tenant, Product, Variant, media ID, bucket y key son del servidor; el navegador solo aporta archivo, MIME allowlisted, alt y filename restringido. El contrato de complete recibe únicamente `mediaId`.

## Object Key Authority

La key es `tenants/{tenant}/products/{product}/{media}/{filename}`. Filename admite solo ASCII seguro, 1–200 caracteres; traversal, separadores, null, CRLF y nombres absolutos fallan DTO. La key ya no es entrada de finalize ni aparece en list/get del catálogo. El upload intent sí devuelve la key junto con la URL firmada al actor autorizado, como metadata temporal necesaria de compatibilidad, sin credenciales permanentes.

## Tenant A/B Matrix

PASS. Tenant A no puede preparar/finalizar/leer media cuyo Product pertenece a B; la verificación ocurre por autorización, lookup tenant-bound, FK compuesta y FORCE RLS. Las respuestas dirigidas no incluyeron el tenant ajeno. El mismo patrón fue probado en sentido de ownership y complementado por RLS SQL.

## Cross-Product/Variant

PASS. `pendingMedia` exige `(tenantId, productId, mediaId, PENDING)`; `prepareMedia` valida Product y Variant dentro del mismo Product. El caso Product A + media B y Product A + Variant B devuelve 400. Las FKs compuestas de Parte 1 siguen aplicadas.

## Signed PUT

PASS. PUT se firma para bucket y key exactos; `X-Amz-Expires=900`; firma alterada, método/key alterados o acceso anónimo son rechazados por MinIO. La URL puede reutilizarse criptográficamente durante sus 900 segundos: no se afirma one-time. La activación sí es one-time y una carrera de dos finalizaciones produce un 201 y un rechazo.

## Signed GET

NOT APPLICABLE. No existe signed GET. Los bytes se entregan por endpoint autenticado con `product.read`, lookup tenant/product/media y streaming desde MinIO. Logout o suspensión cortan nuevas lecturas inmediatamente porque cada GET reautentica; no queda URL de lectura bearer reutilizable.

## Expiration

El servidor fija PUT en 900 s y no admite TTL cliente. Una URL MinIO equivalente firmada por 1 s fue rechazada tras expirar. No hay upload-intent TTL persistido; un intent PENDING puede finalizar mientras su objeto exista, observación transferida.

## MIME

PASS. Allowlist exacta: `image/jpeg`, `image/png`, `image/webp`. SVG, HTML, icon, parámetros MIME y subtipos arbitrarios fallan antes del intent. No existe matching por substring.

## Magic Bytes

PASS para la barrera adoptada: JPEG, PNG y WebP requieren sus firmas binarias; HTML/JS renombrado, contenido vacío y mismatch son rechazados al finalizar. No existe decodificación completa, normalización EXIF ni defensa de pixel-bomb; se clasifica como observación de un futuro pipeline, no como claim actual.

## HTML/SVG

PASS. `image/svg+xml`, HTML y JavaScript no obtienen intent; contenido activo renombrado tampoco activa por mismatch. Lecturas válidas llevan MIME persistido y el middleware conserva `X-Content-Type-Options: nosniff`.

## Size Limits

PASS. Finalize exige `0 < size <= 5 MiB`, usando tamaño real de MinIO y conteo durante stream. Cero y boundary+1 fueron rechazados. Signed PUT no impide subir temporalmente un objeto mayor; no se vuelve catálogo activo.

## Filename and Metadata

Filename no gobierna storage y tiene regex estricta. Alt text requiere 1–500. Ordering existe (`sortOrder=0`) y no tiene endpoints de edición. EXIF no se procesa ni elimina; riesgo de privacidad pendiente.

## Replacement

PASS dentro del contrato actual: subir/finalizar nueva media convierte la anterior en no primaria solo después de validar la nueva. Un fallo antes de finalize conserva la anterior. No hay endpoint `replace`; el comportamiento es add + cambio de primaria.

## Deletion and Cleanup

NOT IMPLEMENTED para Product Media. No hay delete/restore ni cleanup worker/orphan scanner. Objetos de intent fallido o nunca finalizado pueden permanecer en MinIO. No hay borrado cross-owner porque no existe superficie de borrado. Requiere lifecycle rule o cleanup en Parte futura.

## Ordering and Primary Media

Una media activa primaria por Product está respaldada por índice parcial y advisory lock por Product. La carrera finalize es determinista. Reorder y selección manual no están implementados.

## Cache/CDN Readiness

La lectura autenticada usa `Cache-Control: private, max-age=300`; no hay CDN. List/get no devuelven keys. No se observó URL firmada en logs de aplicación. Invalidación avanzada de cache no existe.

## MinIO Security

PASS local: bucket privado con `mc anonymous set none`; listing, GET arbitrario y PUT/DELETE anónimos fallan. CORS del bucket está allowlisted y no se confunde con autorización. Producción espera TLS y credenciales externas según configuración; no fue posible verificar una plataforma productiva externa.

## Media Concurrency

PASS para finalize/finalize: advisory transaction lock, claim PENDING→ACTIVE y unique primary impiden doble asociación/evento. Replace/delete concurrente es NOT APPLICABLE por ausencia de endpoints.

## Pricing Architecture

Web Admin → POST price → RBAC → repositorio transaccional → `ProductPrice`; la operación crea una nueva versión histórica y desactiva la activa previa para Product+Variant+currency. Catalog list/get entrega solo active ordenado. No existe Pricing Engine separado.

## Monetary Model

PASS. PostgreSQL `Decimal(20,6)`, API/SDK string decimal, máximo 14 enteros y 6 decimales; no se aceptan floats, notación científica, NaN, Infinity ni negativos. El round-trip evita IEEE-754 como autoridad.

## Price Create

PASS. Product/Variant y tenant se derivan de path/contexto; Variant se valida contra Product; Product archivado no pasa `assertProductVariant`; campos extra son rechazados globalmente. Se emite `PriceUpdated` y outbox en la misma transacción.

## Active Price Resolution

PASS. Regla real: exactamente uno activo por `(tenant, Product, Variant, currency)`. Advisory lock serializa writes y el índice parcial es barrera final. Ocho creates concurrentes dejaron una sola fila activa; la última transacción serializada gana.

## Effective Dates

NOT IMPLEMENTED. No hay from/to, scheduling, intervalos, timezone ni prioridad temporal.

## Variant Pricing

PASS. Price siempre pertenece a Product y Variant; la FK compuesta y validación impiden Variant ajena. El Product default tiene Variant default, por lo que no existe fallback implícito desde Product sin Variant.

## Branch Pricing

NOT IMPLEMENTED.

## Channel Pricing

NOT IMPLEMENTED.

## Price Lists

NOT IMPLEMENTED funcionalmente. Existe `priceListKey` en persistencia y enum `PRICE_LIST`, pero no endpoints, modelo autoritativo ni selección; no se anuncia como capacidad.

## Zero and Negative Prices

Cero es un precio gratuito explícito y distinto de ausencia de precio. Negativos y overflow fallan tanto en dominio como en constraint DB.

## Currency

PASS para moneda única organizacional. Price debe coincidir exactamente con `Organization.defaultCurrency`; USD en organización MXN fue rechazado. No se certifica multi-currency.

## Compare-At

NOT IMPLEMENTED.

## Cost Boundary

PASS estructural. ProductPrice representa precio de venta; no contiene cost ni modifica inventario/costo. Cost/FIFO permanece fuera de alcance y el catálogo no lo expone.

## Price Locking

No existe PATCH de una fila Price ni optimistic locking cliente. Cada cambio crea registro nuevo y desactiva el anterior dentro de una transacción serializada. Por tanto stale update no aplica al contrato actual.

## Price Idempotency and Concurrency

No hay idempotency-key específica. La concurrencia no produce ambigüedad activa, pero retries crean historia/eventos adicionales; observación no bloqueante. El aggregate final permanece determinista.

## Price Lifecycle

Contrato actual: create nueva activa + desactivar anterior. No hay archive/restore/scheduled/delete públicos.

## Historical Compatibility

Las filas previas se conservan inactivas; Product/Variant usan RESTRICT. El cambio de precio no reescribe ventas. Sales conserva sus snapshots/valores propios; Sales no fue certificado aquí.

## Tax References

PARTIAL. `taxProfileKey` es metadata string opcional; no existe entidad TaxCategory/Profile tenant-bound ni FK. Sales actualmente adapta una referencia default propia. No se certifica cálculo fiscal ni una referencia tax autoritativa, y no se presenta como implementada.

## Tax-Included Metadata

NOT IMPLEMENTED. No hay `taxIncluded` en ProductPrice ni precedencia Organization/Product/Price.

## Tenant Isolation

PASS. API, FKs compuestas y PostgreSQL RLS/FORCE RLS cubren Media y Price. Con rol runtime sin contexto no se observan filas; el contexto transaction-local limita al tenant. No se acepta tenant por body/query/header.

## Permission Matrix

- OWNER y ADMINISTRATOR: `product.media.manage` y `product.price.update`, scope organización.
- SUPERVISOR: `product.update`, no media/price manage.
- CASHIER, EMPLOYEE y READ_ONLY: `product.read`; no mutación media/precio.

API directa confirmó 403 para Cashier. Las features asociadas continúan default-deny mediante `POS`.

## Web Admin Media

PASS. Chromium demostró upload, finalize, render privado, reload y edición sin borrar configuración. La UI consume la response antes de navegar; no hubo falso éxito ni error Console/Network en los escenarios dirigidos.

## Web Admin Pricing

PASS para create/display/reload/validación del contrato actual. UI usa moneda MXN organizacional y string decimal. No existen stale-version/variant-price editor separados.

## Catalog Delivery Integrity

Web Admin y API reciben solo media ACTIVE, sin objectKey, y un único precio activo. Tipos no operativos continúan rechazados. Flutter POS contiene un consumidor del contrato Product/Price; la regresión específica completa queda indicada como no ejecutada en esta parte.

## OpenAPI

PASS: 144 operaciones válidas, compatibility 3.0.0 PASS. `PrepareMedia.contentType` enumera los tres MIME; complete solo admite `mediaId`; endpoints siguen protegidos. Amount permanece string decimal y tenant no es writeable.

## SDK

PASS, sin drift. El SDK ya no describe un `objectKey` controlable en complete; no contiene credenciales MinIO ni tenant autoritativo.

## Events and Outbox

Media exitosa emite `MediaAdded`; price emite `PriceUpdated`; ambos escriben ProductEvent y ProductOutbox dentro de la transacción. Replay de finalize no emite segundo evento. No hay integración UMI certificada.

## Audit

ProductEvent conserva tenant, actor, aggregate, event type y payload mínimo. Correlation ID no forma parte del modelo ProductEvent y las denegaciones siguen dependiendo de la estrategia parcial heredada de Part 1A. Signed URLs y bytes no se persisten en eventos.

## Migrations and Constraints

Migraciones aplicadas y seed/reset PASS. `20260721203000` mantiene FK compuesta Variant/Product para Price/Media. `20260722013000` agrega unique price active y refuerza primary media. Amount/base quantity checks, objectKey unique, tenant FKs, RLS y FORCE RLS están activos.

## Defectos encontrados

1. HIGH funcional: finalize confiaba en objectKey cliente y podía activar media de otro Product del mismo tenant.
2. HIGH contenido: cualquier `image/*`, incluido SVG, obtenía signed PUT y finalize no validaba bytes.
3. MEDIUM: no se validaban cero/5 MiB/stream real.
4. HIGH integridad: carreras podían dejar varios precios activos.
5. MEDIUM: Price aceptaba moneda diferente de Organization.
6. LOW exposición interna: list/get incluía PENDING y objectKey.

## Correcciones aplicadas

Allowlist exacta; magic bytes; límite real; lookup del intent server-side; complete sin objectKey; claim one-time; advisory locks; unique active price; currency organizacional; validación Product/Variant previa; catálogo solo ACTIVE sin storage key; OpenAPI/Web/tests actualizados.

## Riesgos restantes

- Intent PENDING y objetos fallidos no tienen expiry/cleanup automatizado.
- Firma binaria no equivale a decoder seguro ni elimina EXIF.
- Signed PUT es reutilizable durante 900 s, aunque key y finalize están vinculados.
- No hay delete/reorder manual de media.
- Price retries no son idempotentes en historia/eventos.
- Tax references, price lists, fechas, branch/channel pricing y tax-included no existen funcionalmente.
- Audit denials/correlation en ProductEvent continúan parciales.

## Tests ejecutados

- Baseline heredado: 12/12 PASS.
- Suite final Media/Pricing: 7/7 PASS.
- Regresión combinada Product Core + Web + Authorization: 25/25 PASS (incluye las 6 pruebas Media/Pricing previas a la ampliación).
- API/Web typecheck y API lint: PASS.
- OpenAPI validate/compatibility: PASS; SDK drift: PASS.
- Docker build/deploy API+Web y health: PASS.

## Tests no ejecutados

- Signed GET: NOT APPLICABLE, no existe.
- Media delete/reorder/cleanup: NOT IMPLEMENTED.
- Price PATCH/stale, effective dates, price lists, branch/channel pricing: NOT IMPLEMENTED.
- Flutter POS real-API smoke: BLOCKED porque Flutter no está instalado en el host; impacto limitado a delivery del cliente operativo, no a invariantes API/DB demostradas.
- Producción externa/CDN/TLS/lifecycle MinIO: BLOCKED por no existir acceso a infraestructura productiva; configuración local privada sí fue probada.

## Quality Gates

`pnpm check` PASS: format, lint, typecheck, unit/integration y build; Turbo reportó 29/29 tareas en lint, 29/29 en typecheck, 29/29 en tests y 16/16 en build. Build productivo API/Web, migración, deploy, health, OpenAPI y SDK están PASS. No hubo retries de tests ni flakes observados.

## Evidencia

- Fallo previo: SVG devolvió 201; USD en organización MXN devolvió 201.
- Posterior: suite `media-pricing-integrity-certification.spec.ts` 7/7.
- Regresión dirigida 25/25.
- Imágenes finales: API `sha256:6d016d76e11f10b04f71266ed9d2479a12133c2adc650a351cad8560eed34e55`; Web `sha256:72aead869afc89deaad6560b955c497f3fc11426dd403d5ddd32bf666e6ab6ec`.
- Migración `20260722013000_media_pricing_integrity` aplicada.
- MinIO anonymous list/object GET 403; signed URL 1 s rechazada tras expiry.

## Archivos modificados

- `apps/api/src/modules/product/application/product.ports.ts`
- `apps/api/src/modules/product/application/product.service.ts`
- `apps/api/src/modules/product/interface/product.dto.ts`
- `apps/api/src/modules/product/interface/product.controller.ts`
- `apps/api/src/modules/product/infrastructure/prisma-product.repository.ts`
- `apps/web/src/app/products/page.tsx`
- `apps/web/src/app/product-experience.tsx`
- `packages/contracts/openapi/openapi.json`
- `packages/database/prisma/migrations/20260722013000_media_pricing_integrity/migration.sql`
- `tests/e2e/media-pricing-integrity-certification.spec.ts`
- `docs/PRODUCT_CERTIFICATION_PART_1B_MEDIA_PRICING.md`

## Observaciones para Parte 3 de 5

Inventory debe consumir solo Product/Variant activos y la moneda organizacional; no debe usar `taxProfileKey` como motor fiscal autoritativo. Mantener las FKs compuestas, RLS/FORCE RLS, unique active price y catálogo sin storage keys. La Parte 3 debe decidir lifecycle de objetos huérfanos únicamente si cruza inventario; no debe construir Pricing/Tax faltante dentro de Inventory.
