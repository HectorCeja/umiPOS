# 08 — Motion System

## Categorías

| Categoría        | Uso                           | Tiempo implementado          |
| ---------------- | ----------------------------- | ---------------------------- |
| Instant feedback | press, toggle, focus          | 80–100ms                     |
| Microinteraction | hover, input, card, badge     | 100–220ms                    |
| UI transition    | menu, drawer, dialog, route   | 220–320ms                    |
| Editorial reveal | funcional y frase ambiental   | 420–700ms + delays definidos |
| Ambient          | aurora, artwork, halo, trails | 19–59s                       |

Tokens exactos: instant `80ms`, fast `100ms`, normal `180ms`, standard `220ms`, slow `320ms` y
scene `30s`. En reduced motion, fast y normal pasan a `0ms`; la regla global limita cualquier otra
animación a `0.01ms` y una iteración, además de los overrides de escena.

Sus nombres son `--nexo-duration-instant`, `--nexo-duration-fast`, `--nexo-duration-normal`,
`--nexo-duration-standard`, `--nexo-duration-slow`, `--nexo-duration-scene`,
`--nexo-ease-standard`, `--nexo-ease-emphasized`, `--nexo-ease-decelerate`,
`--nexo-ease-accelerate` y `--nexo-ease-spring`. La capa web final añade `--v1-ease` con el mismo
valor que emphasized.

## Curvas

- standard `cubic-bezier(.2,0,0,1)`
- emphasized/V1 `cubic-bezier(.22,1,.36,1)`
- decelerate `cubic-bezier(.16,1,.3,1)`
- accelerate `cubic-bezier(.4,0,1,1)`
- spring controlado `cubic-bezier(.2,.8,.2,1)`

No se usa rebote juguetón ni overshoot visible.

## Interaction

- Hover: fondo/borde/icon opacity o elevación mínima; no todo flota.
- Press: ajuste rápido de sombra/glow o escala mínima sin layout shift.
- Focus: ring visible sobre canvas, surfaces y auroras; nunca se elimina sin reemplazo.
- Open/close: 220ms, foco disponible inmediatamente.
- Route: contenido entra sin mover shell o navegación.

## Reveal editorial

Contenido crítico aparece a 0–150ms. Cards/KPIs entran entre 200–450ms. Frase, artwork y detalle ambiental aparecen entre 850–1100ms. La implementación usa 420ms con delay 280–300ms para funcional y 700ms con delay 950ms–1s para editorial. Solo se reproduce al entrar en la ruta.

## Ambiente

Artwork drift 38s; crossfade 1600ms; Ken Burns opcional 30s; trails/particles 26s; auroras 47/53/59/43s; halos 19s y 23s; light leak 37s; ambient drift global 22s. Consulte [LivingScene](09_LIVING_SCENE_ENGINE.md).

## Reduced motion

El contenido se muestra inmediatamente. Se eliminan reveal delay/translate, Ken Burns, drift, parallax, trails y partículas móviles. Se conservan feedback esencial, focus y estados. No hay opacidad inicial en cero esperando animación.

## Reglas

- No almacenar frame state en React.
- Animar transform/opacity, no layout.
- No reiniciar por revalidación, sucursal o KPI.
- No usar smooth scrolling forzado con reduced motion.
- Motion nunca comunica un cambio de estado de negocio que aún no está confirmado.
