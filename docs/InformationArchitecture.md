# Information Architecture

Prompt 12.4 removes module-owned shells. Business settings replaces the user-facing Control Plane concept. Account/Profile, business context and Help belong to the global layer; Sales and Cash own only contextual sections.

## Prompt 12.3 simplification

Business tasks are first-level; technical delivery mechanisms are progressive disclosure under Configuración → Integraciones → Diagnóstico. Sales and Cash preserve their backend boundaries while using separate task vocabularies. Mailpit, Swagger, Storybook, MinIO and direct module URLs are development tools, not owner navigation.

```text
NEXO
├── Inicio
├── Ventas
│   ├── POS
│   ├── Historial
│   └── Ventas suspendidas
├── Operación
│   ├── Productos
│   ├── Inventario
│   ├── Clientes (future-ready)
│   ├── Caja (future-ready)
│   └── Agenda (future-ready)
├── Análisis
│   └── Reportes (future-ready)
├── Administración
│   ├── Equipo
│   ├── Sucursales
│   └── Configuración
├── Integraciones
└── Ayuda
```

Ordena tareas frecuentes antes que estructura interna. Los módulos future-ready no aparecen hasta que feature, permiso y disponibilidad sean verdaderos. Selector de organización y sucursal está en el topbar; el contexto operativo es persistente y se confirma al cambiar durante trabajo pendiente.

Rutas propuestas: `/home`, `/sales`, `/pos`, `/products`, `/inventory`, `/team`, `/branches`, `/settings`, `/integrations`, `/help`. Breadcrumbs solo en jerarquías administrativas. La búsqueda global encuentra entidades autorizadas; la command palette incluye navegación y acciones seguras. Favoritos y recientes nunca revelan recursos cuyo acceso fue revocado.

Visibilidad = feature activa ∩ permiso efectivo ∩ scope/contexto ∩ capacidad del cliente. El backend vuelve a evaluar siempre.
