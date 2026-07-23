# Branch CRUD

La pantalla Sucursales usa la organización activa y endpoints reales para:

1. crear con nombre sugerido o personalizado;
2. editar y renombrar con control de versión;
3. archivar;
4. restaurar.

Cada mutación incluye sesión, CSRF y tenant resuelto por servidor. La UI conserva feedback, evita submit incompleto y vuelve a cargar la colección autoritativa. `branch-crud.spec.ts` valida el ciclo completo contra PostgreSQL.

La confirmación visual del owner permanece pendiente.
