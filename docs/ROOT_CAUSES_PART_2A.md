# Root causes — Owner Master Pass 2A

- **Login CTA:** `ContextualHelp` renderizaba un footer accionable para toda guía pública; además Login repetía soporte fuera del panel. Se eliminó la acción pública en la fuente compartida.
- **Scroll de feedback:** `SaveStatus` ejecutaba `scrollIntoView` y focus para cualquier success/error/conflict. El estado local ahora anuncia y resalta sin mover; el desplazamiento vive únicamente en acciones explícitas de revelar contenido.
- **Caja/Ventas Actualizar:** ambas refrescaban estado, pero no tenían destino semántico. Ahora revelan y enfocan `overview` con reduced-motion.
- **Alpha2:** los seeds solo ofrecían personas ligadas a tenants completados. Alpha2 tiene identidad, tenant y membership propios, onboarding DRAFT/paso 1 y reset explícito.
- **Stepper:** `DepositLifecycle` reutilizaba un cluster de badges sin jerarquía ni responsive. Se sustituyó por stepper semántico.
- **Servicio:** el selector de creación usaba `image`, mientras el mapping de editor usaba `briefcase`. Ambos consumen `briefcase`.
- **Editor:** heredaba ancho estrecho y superficie genérica. Ahora usa modal amplio oscuro, layout de dos columnas, sheet móvil, uploader/inputs oficiales e `IconButton` común.
- **Ubicaciones:** API solo exponía list/create de activos y no existía UI. Se agregó update/archive/restore tenant-scoped, listado de archivados y configuración completa. La restricción única de Prisma escapaba como 500; ahora la UI previene el duplicado y el repositorio conserva un 409 defensivo.
- **Scroll móvil/icon buttons:** el canvas autenticado recortaba overflow y los icon buttons no declaraban geometría completa. El canvas permite scroll vertical y el control base centra SVG en hit area oficial.
- **Ayuda que bloqueaba acciones:** el panel fijo cubría controles y capturaba todo el hit area. El contenedor no modal ahora es click-through salvo sus controles interactivos; el CRUD real demostró que la ayuda visible ya no bloquea “Crear ubicación”.
