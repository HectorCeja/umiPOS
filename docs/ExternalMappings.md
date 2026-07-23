# External Mappings

Relación genérica tenant-owned: system, entityType, internalId, externalId, version/status/metadata y synchronizedAt. Unicidad protege ambas direcciones para Organization, Branch, ProductVariant y Sale. RLS FORCE y Authorization protegen consulta/mutación; no se usa mapping como autoridad tenant.
