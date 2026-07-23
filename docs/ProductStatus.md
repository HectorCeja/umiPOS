# Product Status

Estados: Draft, Active, Archived y Disabled. Archivar establece `deleted_at`; restaurar vuelve a Draft. No existe DELETE físico en Runtime. Las transiciones se validan en dominio y las escrituras usan versión optimista.
