# 10 — Artwork System

## Principio

Los módulos operativos cuentan una historia; los administrativos priorizan concentración. Artwork contextual se integra al LivingScene y nunca se monta como wallpaper o imagen independiente.

## Registry oficial

| Variante                                                                 | Asset                   | Intensidad | Crop D/T/M                  |
| ------------------------------------------------------------------------ | ----------------------- | ---------: | --------------------------- |
| Home                                                                     | `/brand/womanpos.png`   |       0.44 | 74% 48% / 70% 50% / 66% 48% |
| Sales                                                                    | `womanpos.png`          |       0.44 | 82% 52% / 76% 50% / 70% 50% |
| Cash                                                                     | `womanpos.png`          |       0.44 | 68% 54% / 66% 52% / 62% 50% |
| Products/Catalog                                                         | `/brand/products.jpeg`  |       0.36 | 74% 48% / 70% 50% / 66% 48% |
| Inventory                                                                | `/brand/inventory.jpeg` |       0.38 | 78% 50% / 72% 50% / 68% 48% |
| Reports                                                                  | `/brand/analytics.jpeg` |       0.42 | 72% 46% / 68% 48% / 64% 46% |
| Profile, Settings, Help, Control Plane, Team y variantes administrativas | abstract                |        .10 | abstract registry crop      |

Los cuatro assets son 1408×768 y locales. Login/Onboarding usan sus WebP cinematográficos separados.

## Duotone y masks

La fotografía pasa por dominante índigo/azul, desaturación, negros profundos, highlights suaves, blur y masks gradiente/radial. Vignette, auroras y scrim completan la integración. El tratamiento reduce ocultamiento lo suficiente para que el contexto sea perceptible, sin volver protagonista la foto.

## Crop strategy

Home preserva mujer, terminal y restaurante; Products, mercancía; Inventory, almacén/racks; Reports, monitor analítico. Sales y Cash comparten source pero cambian encuadre. El sujeto se desplaza hacia la región libre, nunca detrás de title, KPI, tabla o formulario.

## Movimiento

Artwork usa crossfade 1600ms, drift 38s y parallax desktop reducido. Ken Burns pertenece solo a la capa artwork/foto aprobada. Trails permanecen bajos y no cruzan texto. Tablet elimina pointer parallax; móvil usa crop propio y sin trails; reduced motion deja artwork estático.

## Asset pipeline

- Assets locales, sin URLs externas ni marcas visibles.
- Dimensiones explícitas, cache y precarga única del registry.
- No cargar variantes no usadas ni múltiples imágenes 4K.
- Toda incorporación requiere licencia documentada, hash, dimensiones, crop D/T/M y visual review.

## Decisión foto/abstract

Home, Products, Inventory, Reports, Sales y Cash usan fotografía. Profile, Settings, Help y Control Plane usan abstract. La ausencia de foto en administración es deliberada y no es un estado incompleto.
