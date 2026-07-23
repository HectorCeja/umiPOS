# Flutter POS architecture

`apps/nexo_pos` is the operational application and depends on `packages/nexo_flutter_design`. `app/` owns bootstrap and presentation orchestration; `core/` owns typed API, money, security and offline boundaries; `testing/` owns explicit fixtures. No domain rule is copied from the backend. See [ADR-0053](../adr/ADR-0053-flutter-pos-safety-boundaries.md).
