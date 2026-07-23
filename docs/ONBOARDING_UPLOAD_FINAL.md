# Onboarding Upload Final

El formulario conserva nombre, categoría, precio, descripción, icono, SKU y código de barras. La
misma instancia DOM sobrevive al procesamiento del archivo; preview, reemplazo y eliminación se
mantienen dentro del builder. Un error permanece local y no navega.

Causa sistémica: el `GlassPanel` se remontaba por `key={step}` y el contenedor combinaba
`flex-basis: 0`, altura cero y overrides responsive. Se eliminó el remount y se definió una altura
operable autoritativa, con comportamiento documental en móvil.

Prueba: `tests/e2e/onboarding-upload-final.spec.ts`. Evidencia: capturas 01–04 y video 01.
