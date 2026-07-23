# Flutter token mapping

## Pipeline

```text
apps/web/src/app/styles.css (--v1-* frozen)
        │ generate + validate
        ▼
tool/generate-tokens.mjs
        ▼
lib/src/tokens/generated/nexo_tokens.g.dart
        ▼
ColorScheme + typed ThemeExtensions
```

`pnpm --filter @nexo/flutter-design tokens:check` falla ante drift. No modifica Web. El output Dart nunca se edita a mano.

## Cobertura

La paleta V1 (18 colors + emphasized curve) se genera literalmente. Spacing 4/8/12/16/24/32, radius 6/8/12/16.8/22.4/30/999, shadows, blur 18/28/50, motion 80/100/180/220/320ms/30s, sidebar 216 y control target 44 se traducen desde tokens/documentación certificada. Chart palette reutiliza accents certificados porque V1 no publica chart tokens; no declara valores nuevos.

Typography families y roles se preservan. La escala Web es component-level, por lo que los tamaños del TextTheme son `ADAPTED`, no tokens V1.

## Ownership

Design Language owners aprueban V1. El generador posee Dart. Flutter maintainers poseen aliases/adaptaciones. Un cambio visual comienza en `docs/design/`, actualiza Web source y regenera Flutter.
