# Locations

Jerarquía preparada: Organization → Branch → Warehouse → Zone → Shelf → Bin. La primera entrega usa Warehouse bajo Branch; parent compuesto, índice y trigger anti-ciclo permiten profundizar sin rediseño. `TRANSIT` representa custodia logística y no disponibilidad.

Código es único por tenant; archivar se expresa con `active=false`, no DELETE. Odoo distingue ubicaciones físicas, virtuales e inter-almacén y permite jerarquías; NEXO conserva esa idea sin copiar su modelo.
