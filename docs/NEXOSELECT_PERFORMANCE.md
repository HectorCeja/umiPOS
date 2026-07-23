# Rendimiento de NexoSelect

La lista tiene altura y scroll internos. A partir de 121 resultados activa una ventana virtual de 80 filas con overscan, manteniendo la posición ARIA respecto del conjunto completo. La búsqueda local se ejecuta sobre texto normalizado y evita dependencias adicionales; las integraciones remotas pueden aplicar hasta 150 ms de debounce antes de actualizar `options`.

Floating UI observa geometría solo mientras el portal está montado. Cerrarlo desmonta portal, listeners y observadores. No existen listeners permanentes por selector cerrado.

La suite verifica límite de DOM, metadata de virtualización, apertura perceptualmente inmediata, ausencia de layout shift y scroll interno. Los resultados medidos se registran en `TEST_RESULTS.md`.
