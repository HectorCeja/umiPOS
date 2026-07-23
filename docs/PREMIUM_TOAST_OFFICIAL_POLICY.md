# Política oficial de Premium Toast

- Un solo provider DOM: `#nexo-toast-provider`.
- Desktop: esquina superior derecha, inmediatamente debajo del Header global y ancho máximo de 28 rem.
- La coordenada vertical se deriva del borde inferior real de `[data-nexo-toast-safe-area]` mediante `ResizeObserver`, más `--nexo-toast-safe-gap`.
- Móvil y tablet: misma zona, misma separación editorial y safe areas del sistema.
- `position: fixed`; nunca depende del documento o contenedor desplazable.
- El provider usa top layer para permanecer visible sobre dialogs sin cambiar posición.
- Stacking, gap, blur, elevación, entrada/salida y cierre proceden del componente compartido.
- Duración normal oficial: 4 segundos. Procesos activos conservan su duración persistente.
- No existen variantes por pantalla ni clases específicas de onboarding.
- Ningún módulo define su propio offset. Si el Header cambia de altura, el provider se reposiciona sin recrear el toast ni cambiar su animación.
