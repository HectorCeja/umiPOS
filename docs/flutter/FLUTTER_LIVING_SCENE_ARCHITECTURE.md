# Flutter LivingScene Architecture

Normative source: [Design Language V1](../design/09_LIVING_SCENE_ENGINE.md). Flutter exposes `NexoLivingScene`, a typed scene controller, one pooled ticker and isolated repaint layers. The order is canvas → aurora → artwork → mask → trails → halo → route content. Decorative layers use `ExcludeSemantics`, `IgnorePointer` and a dedicated `RepaintBoundary`; content never rebuilds from the ambient clock.

The controller owns variant transitions and cancels stale generations. The widget owns lifecycle observation and its single clock. Feature/domain state is prohibited from this package.
