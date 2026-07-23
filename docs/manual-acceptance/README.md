# Primera aceptación manual de NEXO

Esta guía permite al propietario validar NEXO desde una sola entrada sin conocer rutas internas. Ejecuta `pnpm manual-acceptance:prepare`, abre `http://localhost:3000` y conserva evidencia en `artifacts/manual-acceptance/current-run`. El producto guía hacia Login, Onboarding o Inicio según el estado autoritativo. Empieza por `START_HERE.md` y, sólo después de completar resultados reales, ejecuta `pnpm manual-acceptance:record`.

Usa [SCENARIOS.md](SCENARIOS.md): 156 escenarios en 26 categorías. Un fallo es cualquier resultado distinto al esperado, pérdida de trazabilidad, exposición cross-tenant/branch, cálculo local autoritativo o acción permitida sin autorización.
