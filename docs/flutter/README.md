# NEXO Flutter POS V1

Status: **CERTIFIED**, version 1.0. See [certification](FLUTTER_POS_V1_CERTIFICATION.md), [freeze](FLUTTER_POS_V1_FREEZE.md), [frozen scope](FLUTTER_POS_V1_SCOPE.md), and [post-V1 backlog](FLUTTER_POS_POST_V1_BACKLOG.md).

## Part 4 — POS Application

[Architecture](FLUTTER_POS_ARCHITECTURE.md) · [Bootstrap](FLUTTER_POS_BOOTSTRAP.md) · [Enrollment](FLUTTER_DEVICE_ENROLLMENT.md) · [Checkout](FLUTTER_CHECKOUT.md) · [Payments](FLUTTER_PAYMENT_ARCHITECTURE.md) · [Offline policy](FLUTTER_OFFLINE_POLICY.md) · [Implementation report](FLUTTER_POS_IMPLEMENTATION_REPORT.md)

The canonical productive app is `apps/nexo_pos`; it consumes `packages/nexo_flutter_design` and published contracts. Financial offline behavior is deliberately blocked in V1. Administrative refunds remain Web Admin responsibility.

## Part 3 — LivingScene and Motion

[Architecture](FLUTTER_LIVING_SCENE_ARCHITECTURE.md) · [Variants](FLUTTER_SCENE_VARIANTS.md) · [Artwork](FLUTTER_ARTWORK_SYSTEM.md) · [Crop](FLUTTER_CROP_AND_FOCAL_POINTS.md) · [Motion](FLUTTER_MOTION_SYSTEM.md) · [Editorial](FLUTTER_EDITORIAL_MOTION.md) · [Reduced Motion](FLUTTER_REDUCED_MOTION.md) · [Quality](FLUTTER_QUALITY_MODES.md) · [Lifecycle](FLUTTER_SCENE_LIFECYCLE.md) · [Accessibility](FLUTTER_SCENE_ACCESSIBILITY.md) · [Performance](FLUTTER_SCENE_PERFORMANCE.md) · [Goldens](FLUTTER_SCENE_GOLDENS.md) · [Parity](FLUTTER_LIVING_SCENE_PARITY_REPORT.md)

Estado: **Flutter Design Parity · Part 2 of 5 · Component Library Foundation**.

Esta carpeta traduce, no redefine, [Design Language V1](../design/README.md). El package ejecutable es `packages/nexo_flutter_design`; no existe todavía una app POS ni lógica de checkout.

## Lectura

1. [Architecture](FLUTTER_VISUAL_ARCHITECTURE.md)
2. [Token mapping](FLUTTER_TOKEN_MAPPING.md)
3. [Theme](FLUTTER_THEME_SYSTEM.md)
4. [Responsive](FLUTTER_RESPONSIVE_FOUNDATION.md)
5. [Accessibility](FLUTTER_ACCESSIBILITY_FOUNDATION.md)
6. [Platform](FLUTTER_PLATFORM_ADAPTATION.md)
7. [Goldens](FLUTTER_GOLDEN_TESTING.md)
8. [Parity matrix](FLUTTER_PARITY_MATRIX.md)
9. [Phase report](FLUTTER_FOUNDATION_REPORT.md)
10. [Component library](FLUTTER_COMPONENT_LIBRARY.md)
11. [Component API](FLUTTER_COMPONENT_API.md)
12. [States and interaction](FLUTTER_COMPONENT_STATES.md)
13. [Overlays and forms](FLUTTER_OVERLAY_SYSTEM.md)
14. [Data display](FLUTTER_DATA_DISPLAY_FOUNDATION.md)
15. [Showcase and goldens](FLUTTER_SHOWCASE.md)
16. [Component parity report](FLUTTER_COMPONENT_PARITY_REPORT.md)

Los valores V1 siguen perteneciendo al Design Language congelado. Cambiarlos requiere versionar primero `docs/design/`.
