# Product Card — jerarquía definitiva

## Con fotografía

La imagen llena un marco 4:3 mediante `object-fit: cover`. El tipo aparece únicamente como un badge
glass monocromático de 32 px en la esquina superior derecha. Nombre, categoría/precio, SKU y estado
siguen en el contenido, sin un segundo icono protagonista.

## Sin fotografía

El mismo marco conserva gradiente, iluminación y glass. El icono semántico grande queda centrado y el
badge de tipo desaparece, de modo que el placeholder se percibe intencional.

## Implementación

`ProductCard` vive en `packages/ui/src/pos.tsx` y es consumido por Productos Web, historias POS y
`ProductListItem`. Flutter POS no expone actualmente una Product Card equivalente que requiera esta
composición. Las pruebas comprueban cobertura completa de imagen, centrado del fallback, posición del
badge, ausencia de iconos duplicados y comportamiento responsive.
