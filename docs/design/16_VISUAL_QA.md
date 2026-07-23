# 16 — Visual QA

## Principio de aprobación

La implementación aprobada es la referencia. Los mockups explican origen, pero una diferencia resuelta por el propietario se documenta conforme al producto congelado.

## Captura determinista

- fixed locale/timezone/data/viewport;
- fuentes e imágenes cargadas;
- scene deterministic con seed fija;
- animations pausadas o reduced motion según caso;
- sin timestamps/IDs visibles variables;
- estabilidad de red explícita.

## Proceso

```text
Implementar → congelar escena → capturar → comparar → overlay/diff
→ revisar causa → corregir o solicitar aprobación → documentar → baseline
```

Un baseline solo se actualiza con aprobación explícita. Nunca se usa update global para ocultar diferencias. El umbral configurado de la suite no reemplaza revisión perceptual de estructura, spacing, type, artwork o chrome.

## Artefactos

Por pantalla: baseline, actual, overlay 50%, diff/heatmap, viewport, browser, commit, fecha, conclusión y known difference. Videos demuestran motion, scroll, focus y continuidad; no sustituyen screenshots deterministas.

## Estados

- PASS: coincide con la referencia aprobada.
- PASS WITH KNOWN DIFFERENCE: causa/impacto/evidencia/aprobación registrados.
- FAIL: regresión o diferencia sin aprobación.

No existe la categoría “casi igual”.

## Owner review y freeze

El propietario revisa los cambios perceptuales antes de baseline. Tras aprobación se actualiza de forma individual, se conserva evidencia anterior y se registra en changelog/phase report. El freeze V1 se rompe únicamente con una versión posterior y un nuevo gate.

## Cobertura actual

Chromium es el motor certificado. Storybook/UI cubre primitives/patrones seleccionados; E2E cubre Login, Onboarding, shell, módulos, responsive, reduced motion, accessibility y final artwork. Firefox/WebKit requieren una certificación separada.
