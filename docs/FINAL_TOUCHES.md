# Final Touches — resolución técnica

Fecha: 2026-07-20. Estado: `TECHNICALLY_RESOLVED — OWNER CONFIRMATION REQUIRED`.

Se reprodujeron los tres patrones del owner con Chromium, API y PostgreSQL reales. El catálogo se
colapsaba por la combinación de un remount explícito (`key={step}`) y reglas de altura/flex
contradictorias. El feedback persistente seguía utilizando `SaveStatus` dentro del documento fuera de
Caja. El Select autoritativo solo había fijado el padding derecho.

La solución elimina el remount del wizard, estabiliza el panel, convierte `SaveStatus` y Ventas al
portal global, añade equivalencia de toast al POS Flutter, corrige ambos paddings del Select y revela
el saldo de Inventario mediante scroll, focus y highlight accesibles.

Evidencia: `artifacts/owner-final-acceptance-master-final-touches/`.

NEXO Product Certification continúa bloqueada. Ningún ítem está `OWNER_CONFIRMED`.
