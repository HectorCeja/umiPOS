# 14 — Performance

## Principio

La escena debe sentirse viva, no costosa. El shell, la navegación y el contenido no actualizan por frame.

## LivingScene y Motion

- Una instancia por shell.
- Parallax mediante RAF + custom properties; sin React state por frame.
- Page Visibility congela loops.
- Quality high/balanced/reduced/static limita partículas a 22/14/6/0.
- Tablet/móvil eliminan pointer parallax; móvil oculta trails.
- `transform` y `opacity` son propiedades preferentes.
- `will-change` y blur se limitan a capas que lo requieren.

## Artwork/assets

Registry precarga cada source una vez por carga del módulo y el browser reutiliza cache. Los cuatro
assets actuales son 1408×768 y pesan 136–187KB. Login/Onboarding usan WebP de 84–86KB. El registry
define crop desktop/tablet/mobile; las dimensiones proceden de los archivos, no de props del registry.

## Layout y scroll

Fixed shell mantiene el chrome fuera del scroll de RouteContent durante una ruta montada; no garantiza
que el árbol persista entre navegaciones. Scene no incrementa height. Skeletons tienen una superficie
estable definida por CSS.

## Datos y componentes

`NexoDataTable` renderiza las rows recibidas con keys provistas por `rowKey`; `NexoPagination` es un
control separado. No existe virtualización genérica ni un chart engine en la biblioteca V1.

## Presupuestos

La implementación congelada no define tokens normativos de KB por ruta, LCP, INP o memoria. No se inventan cifras. Cualquier cambio debe medir antes/después: route ready, navegación, palette, selectors, long tasks, CLS, memoria y bundle; una regresión perceptible bloquea aprobación.

## Gate de cambio

1. Medir build de producción.
2. Verificar ausencia de loops ocultos y memory leaks.
3. Comparar route navigation y overlay latency.
4. Validar quality/reduced motion.
5. Registrar asset y bundle impact en Visual QA.
