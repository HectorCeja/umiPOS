# Availability

Dimensiones independientes: On Hand (custodia física utilizable), Reserved (asignación reversible), Committed (demanda firme), In Transit, Damaged y Quarantine. La fórmula inicial es `Available = OnHand - Reserved - Committed - Damaged - Quarantine`; In Transit se informa pero no se promete.

No se usa `stock == available`. Políticas futuras podrán excluir ubicaciones o estados sin reescribir el ledger. Microsoft igualmente separa cantidades físicas, reservadas y disponibles en sus vistas de on-hand.
