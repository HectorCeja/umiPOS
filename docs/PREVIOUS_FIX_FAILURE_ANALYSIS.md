# Previous fix failure analysis

Las pruebas anteriores medían que el nodo existía, no que todo su contenido fuera alcanzable; recorrían 320 px como mínimo; validaban el contenedor interno aunque el navegador real desplazaba el documento; y aceptaban mappings que devolvían strings. Part 2B agrega valores antes/después del upload, coordenadas finales del documento, 280 px, centros geométricos y ausencia de feedback fijo.
