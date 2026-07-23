# Sale Aggregate

Sale gobierna identidad tenant/organization/branch, actor/membership, moneda, business date, canal, fuente, correlation/idempotency, estado, versión, líneas y asignaciones de pago. Toda mutación pasa por el aggregate y emite evento versionado.

SaleItem guarda `ProductVariant.id` autoritativo y Product ID solo informativo, junto con SKU/barcode/nombre/unidad/precio/impuesto/descuento y totales snapshot. Una venta completada es histórica y no admite delete. `If-Match` representa versión optimista.

Canales validados: WEB_POS, FLUTTER_POS, UMI, API, IMPORT; los futuros están declarados pero no habilitados por contrato de creación.
