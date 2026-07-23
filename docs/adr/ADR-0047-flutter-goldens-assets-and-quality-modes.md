# ADR-0047 — Flutter goldens, assets and visual quality modes

## Contexto

La foundation necesita evidencia estable y preparar LivingScene/assets sin implementarlos antes de Parte 3.

## Decisión

Goldens fijan viewport, DPR, locale, platform y reduced motion; CI nunca usa `--update-goldens`. Los cambios requieren diff y aprobación del propietario. Assets futuros viven bajo manifest con licencia/origen; no se copian assets Web ad hoc. Quality modes son `high`, `balanced`, `reduced`, `static`; en Parte 1 son contrato, no renderer. Un lifecycle observer ofrece pausa a futuros loops.

## Alternativas

Capturas manuales y aprobación automática se descartaron. BackdropFilter indiscriminado y duplicación de artwork por pantalla se descartaron por GPU/memoria.

## Consecuencias, riesgos y reversión

El golden foundation prueba theme/surfaces, no certifica POS. Fonts binarios requieren incorporación versionada/licenciada antes de goldens tipográficos cross-platform. Static elimina ambient motion. El renderer futuro puede cambiar sin alterar el contrato.
