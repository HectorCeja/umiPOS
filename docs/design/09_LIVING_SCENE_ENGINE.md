# 09 — LivingScene Engine

## Propósito

LivingScene es la infraestructura ambiental reutilizable del shell autenticado. Aporta profundidad, continuidad y contexto sin controlar datos ni layout.

## Arquitectura

```text
LivingScene
├─ Canvas/base
├─ Optional photo layer
├─ Authenticated Artwork (registry)
├─ Aurora violet/blue/cyan/indigo
├─ Ambient halos
├─ Light leaks
├─ Light trails
├─ Particle field
├─ Noise
├─ Vignette/contrast overlay
└─ Content
```

Cada `NexoAppShell` montado contiene exactamente una instancia. Las rutas reutilizan el mismo
componente canónico, pero la navegación puede remontar el shell. El crossfade recupera el source
anterior desde `sessionStorage` y lo desvanece durante 1600ms; no demuestra persistencia del árbol
entre documentos/rutas.

## Variantes

`login`, `home`, `dashboard`, `onboarding`, `catalog`, `products`, `inventory`, `sales`, `cash`, `reports`, `team`, `profile`, `settings`, `command`, `focused`, `minimal`.

Login y Onboarding conservan `AmbientExperience` y sus escenas cinematográficas separadas. Las variantes autenticadas activas son Home, Products, Inventory, Sales, Cash, Reports y las abstractas administrativas.

## Quality modes

| Modo     | Partículas | Uso actual                     |
| -------- | ---------: | ------------------------------ |
| high     |         22 | Reports                        |
| balanced |         14 | Home y mayoría autenticada     |
| reduced  |          6 | Inventory/capacidad limitada   |
| static   |          0 | deterministic/reduced fallback |

En la implementación actual, quality selecciona el conteo de partículas. `static` además activa el
estado estático porque forma parte del cálculo `staticScene`; high/balanced/reduced no cambian por sí
solos las demás duraciones.

## Lifecycle y rendimiento

- Precarga fuentes autenticadas una vez.
- Pausa/congela cuando `document.hidden`.
- `?scene=static`, deterministic, static quality o motion disabled estabilizan la escena.
- Pointer parallax usa RAF y custom properties, no state React.
- Tablet/móvil eliminan pointer parallax; móvil oculta trails.

## Motion ambiental

Auroras usan fases y duraciones diferentes. Artwork aplica drift muy lento; la foto opcional soporta Ken Burns. Parallax desktop se limita aproximadamente a ±4px horizontal y ±2.5px vertical. Crossfade de artwork dura 1600ms.

## Reduced motion

Artwork, auroras y halos conservan el frame estático. No hay Ken Burns, drift, trails, parallax ni partículas móviles. El contenido no depende de la escena para ser legible.

## Integración

La route elige variant; el registry decide asset/crop/mask. No se hardcodean rutas de imagen en pantallas. Halos locales ligeros pueden existir, pero no crean particle loops o LivingScenes adicionales.

## Antipatrones

- Una escena por card o ruta anidada.
- Aleatoriedad SSR/hydration.
- Animar React cada frame.
- Usar scene variant para alterar Sidebar/Topbar.
- Montar artwork como wallpaper fuera del engine.
