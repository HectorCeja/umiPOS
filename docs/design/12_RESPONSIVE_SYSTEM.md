# 12 — Responsive System

## Breakpoints existentes

| Condición             | Sistema activo                                                            |
| --------------------- | ------------------------------------------------------------------------- |
| `>64rem`              | Sidebar persistente; Topbar completa; pointer parallax permitido          |
| `<=64rem`             | drawer compartido; trigger Topbar; artwork reducido; sin pointer parallax |
| `<=48rem`             | crop móvil; trails ocultos; layouts compactos                             |
| `<=40rem` / `<=520px` | grids/controles de una columna y compactación final                       |
| `<=760/800px`         | reglas internas UI/Onboarding                                             |
| `<=1180px`            | reorganización de grids operativos                                        |

La navegación canónica cambia a drawer en 64rem. Reglas históricas a 850px no definen el shell V1.

## Desktop y laptop

Sidebar fija de 216px, Topbar fija y content scroll. En poca altura, navegación/sidebar y contenido usan regiones internas scrolleables sin esconder footer/logout. No se crea una segunda scrollbar cuando el contenido cabe.

## Tablet

Drawer con lista completa, scrim, focus trap, Escape, close after navigation, restore focus y body lock. Los context selectors permanecen dentro del viewport y Floating UI aplica flip/shift. Artwork usa crop tablet sin pointer parallax.

## Mobile

Trigger accesible, drawer con safe areas y scroll interno. Cards reflow y las tablas existentes usan
wrapper con overflow. Artwork usa crop móvil, sin pointer parallax ni trails; su drift solo se detiene
con reduced motion/static mode.

## Viewports bajos

El sistema soporta 1024×600 y 568×320. Se preservan acciones, footer y último campo. Heights no dependen de un número fijo de items. Onboarding usa panel interno; Login móvil usa scroll natural.

## Reglas adaptativas

- Responsive no altera permisos ni el conjunto autorizado.
- Ningún item se oculta por `nth-child` o posición ordinal.
- No comprimir veinte columnas; elegir una estrategia de tabla explícita.
- Touch targets mantienen al menos la densidad touch definida.
- Safe areas se aplican a drawer, sheets y actions sticky.
- El cambio responsive no monta una escena o Command Palette adicional.

## Matriz de validación

V1 se verifica al menos en 1280×720, 1366×768, 1440×900, 1024×768/600, 768×1024, 390×844 y 568×320. Chromium es el motor certificado actual; otros motores requieren evidencia antes de declararse soportados.
