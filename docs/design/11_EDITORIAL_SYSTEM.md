# 11 — Editorial System

## Propósito

El sistema editorial da identidad y contexto a una pantalla sin convertirla en landing page. La información funcional conserva prioridad.

## Page header

`NexoEditorialHeader` implementa eyebrow opcional, title, description, statement, actions opcionales
y tone `sales` o `cash`; el halo cambia con esos tones. No expone una prop de alignment ni una
variante genérica de palabra destacada. Home usa su composición editorial propia aprobada.

## Jerarquía de copy

1. Título identifica la tarea o módulo.
2. Subtítulo explica estado/alcance.
3. Frase editorial aporta intención emocional.
4. Supporting text aclara operación.
5. Labels y metadata describen controles/datos.

No se inventan slogans. El copy evita IA ficticia, promesas exageradas y lenguaje promocional dentro de operación.

## Reveal

Shell, navegación y contenido crítico son inmediatos. KPIs/cards entran a 200–450ms. Frase, artwork y halo secundario aparecen a 850–1100ms. Reduced motion muestra todo inmediatamente. El reveal se activa por entrada real, no por rerender, refresh, hover o cambio de sucursal.

## Composición

Los títulos pueden romper líneas y combinar tamaños, pesos u opacidades. El centro es óptico dentro de su región, no necesariamente del viewport. El artwork ocupa espacio negativo y la frase no bloquea controles.

## Nuevas pantallas

- Defina objetivo operativo antes del texto editorial.
- Use una frase solo cuando exista una región y función narrativa aprobadas.
- Reutilice `NexoEditorialHeader` únicamente para Sales/Cash; extenderlo a otro tone requiere
  modificar primero esta especificación y su API.
- Mantenga acciones en el mismo flujo del header/toolbar.
- Verifique español largo, reduced motion, 320 CSS px y contraste.

Consulte [Screen Patterns](19_SCREEN_PATTERNS.md).
