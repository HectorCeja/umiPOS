# Inventory Policies

La política tenant+variant controla stock negativo, método de costo, costo estándar y umbral bajo. Default: no negativo y FIFO. Cambios incrementan versión y sólo afectan operaciones posteriores; no revalúan historia silenciosamente.

Reglas centrales: cantidad válida/no cero, variante obligatoria, costo no negativo, moneda de tres letras, reserva y salida dentro de disponibilidad, ubicaciones distintas en transferencias y LIFO deshabilitado. La base refuerza checks y FKs compuestas.
