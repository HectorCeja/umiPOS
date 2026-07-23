# Navigation

The official web shell is `GlobalShell`: Inicio, Ventas, Caja, Productos, Inventario, Equipo, Configuración and Ayuda remain visible across modules. Sales and Cash add sticky contextual navigation with IntersectionObserver scrollspy, accessible hashes and reduced-motion-aware scrolling. Technical integrations remain advanced diagnostics.

## Unified owner navigation

The only shared entry is `/`. Root resolves Login → authoritative Onboarding → Home. Global business navigation is Inicio, Ventas, Caja, Productos, Inventario, Reportes, Equipo, Configuración and Ayuda. Future modules are marked “Próximamente”; diagnostics never occupy the business module level. Organization/sucursal context and explicit logout remain visible across desktop and compact navigation.

| Contexto               | Modelo                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Desktop administrativo | Sidebar persistente, topbar contextual, breadcrumbs y `Ctrl/Cmd+K`                    |
| Laptop                 | Sidebar colapsable; densidad cómoda o compacta                                        |
| Tablet administrativa  | Navigation rail en horizontal, drawer en vertical                                     |
| Tablet POS             | Shell dedicado; catálogo y carrito simultáneos cuando caben                           |
| Mobile                 | Hasta cinco destinos prioritarios; tareas de edición en pasos                         |
| Windows POS            | Fullscreen future-ready, teclado y touch equivalentes                                 |
| Flutter                | Navigation bar/rail adaptativa, deep links y restauración de estado                   |
| Entrada UMI            | Contexto firmado/validado, marca de origen y retorno seguro; sin navegación duplicada |

Atajos globales: `Ctrl/Cmd+K` command palette, `/` búsqueda cuando no se edita texto, `Esc` cierra la capa superior y restaura foco. Ningún atajo destructivo ejecuta de inmediato.
