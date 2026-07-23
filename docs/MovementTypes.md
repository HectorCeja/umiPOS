# Movement Types

Tipos versionados: Purchase, Sale, Adjustment, Transfer, Reservation, ReservationRelease, Waste, Consumption, Return, Correction, Count e Import. El tipo describe la causa; `state` describe la dimensión afectada y el signo describe el efecto. Esta separación evita tipos combinatorios y permite futuras fuentes de Compras, Manufactura y Ecommerce.

Los movimientos nunca cambian de tipo ni cantidad. Un error se compensa con Correction correlacionada.
