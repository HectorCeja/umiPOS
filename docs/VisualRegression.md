# Visual Regression Governance

Sales Administration agrega 27 baselines Chromium/Linux en `tests/e2e/sales-administration-visual.spec.ts-snapshots`: Overview, History, Detail, Timeline, open/suspended, refunds, receipt, relaciones, exceptions/diagnostic/outbox/quarantine, empty/loading/forbidden/conflict/worker, dark, reduced motion y tablet. Se crearon intencionalmente una vez con datos/fecha deterministas; la certificación posterior comparó 27/27 sin actualizar snapshots.

Baselines: tokens/controles, shell admin, feedback global, POS desktop/tablet vertical, pago táctil, dark y reduced motion. Viewports: 360×640, 430×932, 768×1024, 1024×768, 1366×768, 1440×900 y POS 1280×800.

Fuentes del sistema, contenido y reloj deterministas; animaciones deshabilitadas durante captura; tolerancia Playwright por pixel solo para rasterización inevitable. Cambios se revisan por contraste, reflow, foco, jerarquía y pérdida de información. El autor explica la intención; QA/design aprueba. Las capturas existentes de Control Plane continúan siendo baseline y no se reemplazan automáticamente.
