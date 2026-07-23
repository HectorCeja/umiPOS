# Inventory Engine

El motor opera comandos idempotentes: recibir/ajustar, reservar/liberar, despachar/completar transferencia y contar. No expone Prisma ni modifica Product. Una correlación une movimientos compuestos y una clave idempotente tenant-scoped evita duplicación. Cantidades usan `Decimal(20,6)` en PostgreSQL.

Invariantes: variante y ubicación pertenecen al mismo tenant; cantidad distinta de cero; emisión no negativa salvo política; reserva ≤ disponible; transferencia usa origen `ON_HAND` y destino `IN_TRANSIT`; conteo agrega solamente la diferencia. Correcciones son nuevos movimientos, nunca edición del pasado.
