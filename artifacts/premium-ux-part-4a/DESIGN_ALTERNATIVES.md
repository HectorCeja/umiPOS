# Design Alternatives

Para cada cambio importante se evaluaron tres rutas antes de implementar.

| Mejora | Alternativa A | Alternativa B | Alternativa C | Elección y razón |
|---|---|---|---|---|
| Jerarquía de títulos | Aumentar tamaño | Reducir contenido | Balancear líneas y limitar lectura | C: mejora comprensión sin alterar identidad ni contenido |
| Números financieros | Mono completo | Alinear con espacios | Números tabulares | C: precisión sin apariencia técnica |
| Navegación activa | Fondo más brillante | Barra lateral sutil | Animación permanente | B: orientación inmediata sin ruido |
| Shortcuts | Texto plano | Keycap táctil | Icono | B: reconocible y compacto |
| Detalle técnico | Eliminar | Drawer separado | Disclosure in situ | C: conserva soporte sin agregar navegación |
| Tablas | Más divisores | Zebra fuerte | Hover y headers sobrios | C: rastreo visual con menor ruido |
| Loading | Spinner | Skeleton en todo | Indicador respirable contextual | C: escala a botones sin exagerar |
| Mobile next step | Link inline | FAB | CTA ancho dentro del flujo | C: mantiene contexto y touch target |
| Estados vacíos | Ilustración grande | Texto mínimo | Mensaje educativo contenido | C: enseña sin competir con la tarea |
| Scroll | Ocultarlo | Scrollbar grueso | Fino y tokenizado | C: conserva affordance y elegancia |

Las opciones elegidas siguen el principio “claridad primero, decoración después” y no requieren contratos, módulos ni arquitectura nuevos.

