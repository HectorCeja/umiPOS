# Inventory location flow

Entidad autoritativa: `InventoryLocation`, tenant y branch scoped bajo RLS. Configuración → Ubicaciones permite presets o nombre propio, código, sucursal, tipo, edición, archivo y restauración. Inventario lista solo activas, envía UUID, invalida por tenant/sucursal y ofrece Crear ubicación en vacío. Endpoints: GET/POST `/v1/organizations/:organizationId/inventory/locations`; PUT `/v1/organizations/:organizationId/inventory/locations/:locationId`.
