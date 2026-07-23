# 06 — Layout System

## App Shell canónico

`NexoAppShell` es el único shell administrativo. Contiene LivingScene, Sidebar/drawer, Topbar, contenido de ruta, overlays, Command Palette y context selectors.

```text
NexoAppShell (100dvh, fixed application frame)
├─ LivingScene (fixed, una instancia)
├─ Sidebar (desktop) / Drawer (tablet y móvil)
├─ Topbar (fixed chrome)
├─ RouteContent (único scroll principal)
└─ Global overlays / Command Palette
```

## Fixed shell y scroll

`html`, `body`, `.product-shell` y LivingScene ocupan 100dvh sin usar el body como scroll principal. `.unified-content`/`.product-main` contienen el desplazamiento. Esto mantiene navegación y escena estables durante el scroll; no implica persistencia del árbol entre rutas.

No se permiten doble scroll, scroll atrapado, altura calculada por cantidad de items o una escena que aumente la altura documental.

## Sidebar y Topbar

Desktop usa Sidebar de 216px (`--home-sidebar`). La Topbar y el chrome mantienen fondo, borde, ancho y profundidad sin depender de la scene variant. Solo cambian item activo, permisos, branch context y acciones de página.

Los selectores globales viven en Topbar, admiten nombres largos y usan positioning flotante anclado. El menú de usuario no duplica Perfil/Preferencias. Command Palette se monta una vez.

## Secondary Navigation

Cuando existe subnavegación, el layout reserva su altura junto a Topbar mediante una regla común. El contenido comienza después de ambas; las rutas sin subnavegación no reciben offset. No existen offsets particulares para Equipo o Configuración.

## Content widths

El shell admite composiciones editoriales, operativas, wide y full mediante el layout del contenido, no mediante otro shell. Cards/grids conservan personalidad por módulo. Los anchos específicos permanecen en las clases aprobadas; no hay un token público único de `contentWidth` en V1.

## Overlays

Dialogs, drawers, menus y palette se renderizan por encima del shell con z-index y scrim comunes. Deben conservar focus trap/restore, Escape, scroll lock y safe areas. No se monta una escena adicional dentro de un overlay.

## Onboarding y Login

Son flujos fuera del shell administrativo. Login desktop cabe en viewport; móvil permite scroll natural. Onboarding fija escena/header/progreso/actions y desplaza solo el panel funcional. No se reutiliza el scroll del App Shell.

Consulte [Responsive](12_RESPONSIVE_SYSTEM.md) y [Screen Patterns](19_SCREEN_PATTERNS.md).
