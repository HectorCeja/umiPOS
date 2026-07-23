# Flutter golden testing

La foundation fija viewport 800×600, DPR 1, locale `es-MX`, dark theme y reduced motion. El primer golden cubre paleta/surface/radius, no certifica un POS inexistente.

CI ejecuta `flutter test`; nunca `--update-goldens`. Flujo de cambio:

1. generar candidato local;
2. conservar baseline y diff;
3. revisión del propietario;
4. aprobación explícita;
5. incorporar baseline;
6. ejecutar test sin update.

Goldens futuros deben fijar platform, fonts versionadas, locale, DPR, text scale, quality y viewport. Un golden no sustituye semantics, focus o widget tests.
