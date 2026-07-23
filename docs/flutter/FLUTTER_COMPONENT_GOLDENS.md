# Component goldens

La suite `component_gallery_golden_test.dart` fija DPR 1, locale `es-MX`, fuentes empacadas y theme oscuro. Cubre 390×844, 768×1024, 800×600 y 1280×720; añade text scale 2, reduced motion, high contrast y touch density.

Los ocho goldens fueron creados explícitamente para componentes nuevos. CI sólo verifica; nunca ejecuta `--update-goldens`. Hashes SHA-256 se publican en `artifacts/flutter-design-parity/part-2/GOLDEN_REPORT.md`. La aceptación futura requiere revisión propietaria.
