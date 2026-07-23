# ADR-0045 — Flutter token generation and theme foundation

## Contexto

NEXO Design Language V1 está congelado y Flutter no existía. Transcribir CSS, TypeScript y Dart crearía tres autoridades y drift invisible.

## Decisión

`apps/web/src/app/styles.css` conserva el bloque V1 certificado como fuente ejecutable. `packages/nexo_flutter_design/tool/generate-tokens.mjs` lo valida y genera Dart inmutable. Flutter añade aliases semánticos mediante `ColorScheme` y tres `ThemeExtension`: colors, metrics/depth y motion. La tipografía mantiene Instrument Sans/Manrope; los tamaños seleccionados son adaptación explícita porque V1 no publica una escala numérica única. Dark es el único theme V1.

## Alternativas

JSON nuevo habría obligado a modificar también Web durante un freeze. Transcripción Dart fue descartada por drift. ThemeData puro no cubre glass, blur, depth, states ni métricas NEXO.

## Consecuencias, riesgos y reversión

CI falla si el output cambia. El generador es el único writer del archivo Dart. Una futura fuente neutral versionada puede reemplazar al CSS si genera ambos outputs en un cambio del Design Language. Chart palette es una vista tipada de accents V1, no tokens nuevos.
