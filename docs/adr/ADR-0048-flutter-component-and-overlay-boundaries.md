# ADR-0048 — Flutter component and overlay boundaries

## Contexto

Part 2 needs reusable NEXO controls and POS-ready display patterns without importing sales, cash, networking or application routing into the visual package.

## Decisión

Public widgets are grouped into primitives, controls, feedback, data display, overlays and patterns behind one barrel. APIs use semantic enums and abstract callbacks. Dialogs use Navigator, sheets adapt through the certified 768 threshold and menus use Flutter `MenuAnchor` for collision/focus behavior. The toast queue is a contract only; application layers own orchestration. Product tile, table and pagination never own datasource or domain state.

## Alternativas

Wrapping raw Material widgets per feature, adding a third-party UI suite and copying Web component aggregates were rejected. Manual overlay coordinates and a global service inside the design package were also rejected.

## Consecuencias

Features can compose platform-native interaction while retaining NEXO appearance. Productive POS flows remain deferred. New components require interaction semantics and a deterministic golden before public export.
