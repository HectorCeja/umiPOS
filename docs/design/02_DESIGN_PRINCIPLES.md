# 02 — Design Principles

## Operational First

La tarea, el estado y la acción autorizada aparecen antes que la decoración. Una pantalla puede ser atmosférica, pero sus datos y controles permanecen inequívocos.

- Correcto: KPI legible sobre scrim estable.
- Incorrecto: artwork luminoso que obliga a cambiar el color del texto.

## Calm Intelligence

La interfaz presenta complejidad sin ansiedad. Usa jerarquía, agrupación y estados parciales en lugar de saturación.

- Correcto: error localizado con retry.
- Incorrecto: reemplazar toda la pantalla por un fallo de una sección.

## Editorial Clarity

Los títulos explican contexto y personalidad mediante escala, ritmo y reveal. El contenido funcional nunca espera al editorial.

- Correcto: cards visibles antes de la frase ambiental.
- Incorrecto: hero promocional que desplaza la operación.

## Premium without Noise

La calidad proviene de proporción, respiración, bordes localizados y detalle óptico. Blur, glow y partículas se aplican con jerarquía.

- Correcto: una superficie elevada con highlight superior tenue.
- Incorrecto: todas las cards con el mismo borde brillante.

## Motion with Purpose

Motion orienta, confirma, conecta o ambienta. Cada categoría usa su propia escala temporal.

- Correcto: press inmediato y crossfade lento de artwork.
- Incorrecto: usar una duración ambiental para abrir un menú.

## Context over Decoration

Scene variant y artwork responden al módulo. Productos muestra catálogo; Inventario, almacén; Reportes, analítica. Perfil y Configuración usan abstracción.

- Correcto: crop situado fuera de títulos y tablas.
- Incorrecto: la misma foto con el mismo encuadre en todas las rutas.

## Accessible by Construction

Semántica, foco, contraste, teclado, targets táctiles y reduced motion forman parte del componente desde su origen.

- Correcto: active state con superficie, texto e indicador.
- Incorrecto: depender solo del color.

## One System

Shell, navegación, tokens, escena y componentes son compartidos. Las variaciones se expresan mediante props, slots y variantes tipadas.

- Correcto: una implementación canónica de `NexoAppShell`, fija durante el scroll de la ruta.
- Incorrecto: una Sidebar visualmente equivalente copiada por módulo.
