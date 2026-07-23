# Product Editing

Un producto existente puede editar desde su detalle:

- nombre, SKU y descripción;
- categoría e icono semántico;
- precio activo;
- código de barras principal;
- fotografía principal.

El PATCH exige solo `version`; el repositorio actualiza SKU normalizado y variante predeterminada dentro del tenant. Al reemplazar precio, código o media, el anterior deja de ser principal/activo antes de crear el nuevo. La UI consume de nuevo el detalle autoritativo y la persistencia se verifica tras recarga.

No hubo migración. La confirmación visual del owner permanece pendiente.
