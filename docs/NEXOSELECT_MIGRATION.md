# Migración global a NexoSelect

## Resultado

Se migraron Onboarding, Productos, Inventario, Caja/configuración, sucursales, ubicaciones, Perfil y `TimePicker`. La fachada histórica `Select` de `@nexo/ui` delega en `NexoSelect`, evitando dos sistemas activos mientras preserva compatibilidad de imports.

## Cambios de integración

- `onChange(event)` pasó a `onValueChange(value)`.
- Las opciones HTML pasaron a objetos tipados.
- El selector de producto de Inventario usa búsqueda y opciones ricas con foto/icono, SKU, categoría y estado.
- El portal usa viewport positioning y no participa en el sizing del formulario.

El gate `native-select-elimination.spec.ts` inspecciona Web/UI y `systemic-nexoselect-sweep.spec.ts` recorre módulos reales. Resultado: cero `<select>` visibles y cero referencias `HTMLSelectElement` en las fuentes activas.
