# Variantes oficiales de NexoSelect

- **Simple:** estado, tipo, moneda, rol o sucursal.
- **Searchable:** producto, ubicación, categoría o usuario; normaliza mayúsculas y acentos.
- **Rich:** thumbnail/icono, título, descripción, metadata y badge en una fila compacta.
- **Async:** loading, error recuperable con retry y empty state educativo.
- **Grouped:** encabezados semánticos por categoría, sucursal, tipo o estado.

Las variantes comparten trigger, portal, movimiento, scrollbar, estados y API. No existe multi-select nuevo porque el alcance actual no presenta un caso de negocio que lo requiera.

En móvil el portal conserva márgenes y safe areas, aprovecha el ancho disponible y mantiene targets de al menos 44 px. En escritorio alinea su origen al trigger, cambia de lado si falta espacio y nunca sale del viewport.
