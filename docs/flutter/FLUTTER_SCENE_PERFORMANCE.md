# Flutter Scene Performance

One clock drives all ambient layers. Aurora and trail painters repaint inside a boundary; route content is isolated. There is no controller per particle or trail, no network asset, no shader dependency and no `BackdropFilter` in the scene. Four assets total 664,827 bytes and are hash-checked. GPU p95 is not asserted from Linux headless; device profiling remains the required source for GPU/raster budgets.
