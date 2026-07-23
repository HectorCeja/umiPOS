# Data display foundation

`NexoKpiCard` usa números tabulares y semántica unificada. `NexoProductTile` recibe imagen, nombre, precio formateado, estado y callback abstracto; no agrega carrito ni consulta inventario. `NexoTable<T>` define caption, columnas tipadas, alineación numérica, sort visual, selección, loading/empty/error y overflow horizontal explícito. `NexoPagination` sólo emite callbacks.

La tabla no incluye datasource/server pagination y el product tile no contiene pricing engine. Estas fronteras son deliberadas.
