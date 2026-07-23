# Flutter Design Parity — Foundation report

## Part 3 extension

The foundation now exposes the canonical LivingScene, typed artwork/crop registry, central ambient clock, editorial reveal, lifecycle and concrete quality policies. Part 1 tokens and Part 2 component APIs remain unchanged.

## Part 2 — Component Library Foundation

Part 2 preserves the Part 1 token/theme architecture and adds the canonical domain-independent component package surface. Six public modules expose 44 widgets plus typed variants/contracts. Native Flutter focus, menu collision, safe areas and back behavior are adapted behind NEXO APIs. Twenty-nine total package tests pass, including eight new multi-viewport component goldens and fifteen focused Part 2 interaction tests. The release showcase and evidence live at `artifacts/flutter-design-parity/part-2/`.

No feature repository, client, cash/sales model, offline service, LivingScene renderer or productive POS screen was introduced. Verdict: **COMPLETE** for Part 2.

**Verdict: COMPLETE — Part 1 of 5.**

## Resultado

Parte 1 crea el primer package Flutter del repositorio sin implementar POS. La arquitectura, token generation, dark theme, extensions, adaptive/density, accessibility/reduced motion, quality contracts, showcase y golden foundation son ejecutables.

## Baseline

Antes: 0 apps/packages/Dart/themes/widgets/tests/goldens/assets Flutter. Flutter SDK no estaba instalado globalmente. Toolchain de validación local: Flutter 3.44.6, Dart 3.12.2.

## Decisiones

- [ADR-0045](../adr/ADR-0045-flutter-token-and-theme-foundation.md)
- [ADR-0046](../adr/ADR-0046-flutter-adaptive-accessibility-and-platform-policy.md)
- [ADR-0047](../adr/ADR-0047-flutter-goldens-assets-and-quality-modes.md)

## Límites

No hay app POS, components productivos, product icon mapping, platform runners ni LivingScene renderer. Estos elementos están deliberadamente fuera de Parte 1. El package no importa dominio/backend.

## Readiness

Component Parity puede comenzar usando APIs tipadas. Las familias tipográficas y su licencia/hash están versionadas; los goldens de componentes futuros deben ampliar la matriz por plataforma.

Dependencies are limited to Flutter SDK at runtime and `flutter_test`/`flutter_lints` in development. Font assets total 352 KiB and are OFL-1.1. The ntfy delivery record is stored without topic/token at `artifacts/flutter-design-parity/part-1/ntfy-result.json`.

## Performance baseline

`pnpm flutter:check` completed locally in 11.1s and the full monorepo gate in 20.58s on the audit host. Part 1 has no runtime app, image decode, shader or route, so startup/first-frame/memory/long-task budgets remain **baseline pending**, not fabricated. Theme construction is synchronous and no animation/render loop exists. Parts that introduce runtime screens must measure those budgets before setting numeric thresholds.

| Budget area                  | Part 1 state                                 |
| ---------------------------- | -------------------------------------------- |
| startup visual / first frame | baseline pending: no app runner              |
| shader compilation           | baseline pending: no custom renderer         |
| image decode                 | not applicable: fonts only                   |
| theme initialization         | synchronous; benchmark begins with first app |
| rebuild count / memory       | baseline pending: no product screen          |
| golden stability             | 1 baseline, normal rerun PASS                |
