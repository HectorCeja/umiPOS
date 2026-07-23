# Living Scene Engine

`LivingScene` está en `packages/ui/src/experience.tsx`. Su API tipada expone `variant`, `quality`, `motionEnabled`, `deterministic`, `pauseWhenHidden`, partículas, noise y Ken Burns.

Capas: imagen opcional, cuatro auroras no sincronizadas, dos halos, light leak, partículas deterministas, noise y scrim de contraste. `high` solicita 22 partículas (CSS limita nodos visibles según capacidad), `balanced` 14, `reduced` 6 y `static` 0. No existe state React por frame.

La Page Visibility API añade `is-static` cuando el documento se oculta. Storybook/CI usan `deterministic`; las posiciones y offsets son reproducibles. Login usa intensidad fuerte y Home una variante de menor intensidad.

Ejemplo: `<LivingScene variant="home" quality="balanced" deterministic={isVisualTest}>…</LivingScene>`.

## Authenticated artwork collection — 2026-07-16

`packages/ui/src/artwork-registry.ts` is the single source of image paths, intensity and responsive
crops. LivingScene resolves the entry from its `variant`; routes never mount standalone images or
duplicate paths. The existing override remains only for API compatibility.

LivingScene owns exactly one masked artwork node. Its previous/current pseudo-elements crossfade
between cached assets without mounting another scene. The pipeline applies NEXO duotone,
desaturation, progressive blur, radial/lateral masks, vignette and the existing contrast scrim.
Desktop parallax writes bounded CSS variables through requestAnimationFrame without React frame
state. It is disabled on touch and at widths up to 1024 px. Reduced motion, deterministic/static
mode and Page Visibility freeze Ken Burns, drift, parallax and trails. Asset provenance and crops:
`docs/ui/AUTHENTICATED_ARTWORK_ASSETS.md`.
