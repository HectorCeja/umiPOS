# Stock Ledger

`InventoryMovement` es append-only por trigger y permisos: Runtime puede insertar/leer, no actualizar ni borrar. Orden determinista: `occurredAt`, `recordedAt`, ID. `InventorySnapshot` guarda balances a través de un movimiento para acelerar/reconciliar, pero se puede descartar y reconstruir.

Balance = suma por `tenantId + variantId + locationId + state`. Timeline devuelve movimientos, no estados sobrescritos. Import, Count y Correction preservan procedencia, actor, razón, referencia, correlación y causalidad. La auditoría `InventoryEvent` también es append-only.
