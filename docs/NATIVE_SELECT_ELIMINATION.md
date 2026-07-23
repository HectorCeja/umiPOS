# Eliminación de Select nativo

Estado: **TECHNICALLY_RESOLVED — OWNER CONFIRMATION REQUIRED**.

El barrido de `apps/web/src` y `packages/ui/src` no encuentra `<select>` ni `HTMLSelectElement` en TypeScript/TSX. Los módulos activos se recorren en Chromium y cualquier combobox renderizado debe usar `nexo-select-trigger`.

Flutter conserva su implementación nativa al framework con tokens y jerarquía equivalentes; no se insertó una primitive Web en Flutter. Su paridad visual queda cubierta por el Design System de Flutter y no bloquea la certificación Web.

NEXO Product Certification continúa bloqueada. Ningún ítem fue marcado `OWNER_CONFIRMED`.
