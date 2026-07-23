# Flutter visual architecture

## Estado previo

Al inicio no existían `pubspec.yaml`, Dart, SDK configurado, app POS, UI package, theme, widget, asset Flutter, test ni golden. Los documentos Cash/Sales describían contratos futuros, no implementación.

## Arquitectura

```text
packages/nexo_flutter_design/
├── lib/nexo_flutter_design.dart
├── lib/src/tokens/generated/   # output, no edición manual
├── lib/src/theme/              # ThemeData + extensions
├── lib/src/adaptive/           # constraints + density
├── lib/src/accessibility/      # semantics/target policy
├── lib/src/foundation/         # preferences, quality, lifecycle
├── tool/                       # Web V1 → Dart
├── test/                       # unit/widget/golden
└── example/                    # showcase foundation, no POS
```

Dependencia permitida: Flutter SDK. No depende de dominio, networking, storage o Web. Features futuras dependen del package, nunca al revés. Tokens, widgets y lógica de negocio permanecen separados.

## Material/custom

Material 3 se usa para semantics, focus, input behavior y defaults nativos. `NexoTheme` reemplaza color, tipografía, surface, focus, density y estados para impedir apariencia Material genérica. Cupertino puede aportar interacción de plataforma, no otro skin.

V1 no certifica una familia de iconos Web. Foundation usa Material Symbols para controles base mediante `NexoIconography`; el mapping de producto se aprueba componente por componente en Part 2, sin mezclar familias ni inventar glyphs.

## Deferred

Primitives/componentes POS, navegación productiva, LivingScene renderer, scanner, haptics, offline y hardware pertenecen a partes posteriores.

Widgetbook did not exist. Adding it for one foundation view would introduce an unnecessary runtime/tool dependency, so `example/` is the executable showcase. Re-evaluate when Component Parity has a real catalog matrix.

## Assets

`assets/manifest.json` is the only future registry. Every raster/vector requires source, license, hash, dimensions/DPR variants and fallback. No Web path is duplicated ad hoc; image decoding, cache and precache belong to the future renderer. AVIF/WebP is selected only after target-decoder evidence.
