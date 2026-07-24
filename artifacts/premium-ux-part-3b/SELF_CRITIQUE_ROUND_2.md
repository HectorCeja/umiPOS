# Self Critique — Round 2

Estas oportunidades son adicionales a Part 3A y todas quedaron corregidas en esta fase.

| # | Pantalla | Problema | Corrección | Motivo |
|---:|---|---|---|---|
| 1 | Global | El loading del botón no describía un estado vivo | Añadí indicador respirable y label contextualizable | Reduce incertidumbre sin usar un spinner genérico |
| 2 | Global | El estado loading no se anunciaba como unidad | El contenido usa `role=status` y `aria-live` | Da confianza también con lector de pantalla |
| 3 | Global | La selección de texto usaba el color del navegador | Incorporé selección con el acento oficial | Mantiene personalidad en detalles pequeños |
| 4 | Global | Scrollbars no pertenecían visualmente a NEXO | Añadí scrollbar fino y tokenizado | El recorrido largo se siente cuidado |
| 5 | Global | Los detalles avanzados competían con la tarea | Unifiqué disclosure cerrado y discreto | La información técnica sigue disponible sin saturar |
| 6 | Global | El resumen de un disclosure parecía texto común | Añadí affordance más/menos, hover y foco | Hace evidente que puede abrirse |
| 7 | Global | El contenido expandido quedaba pegado al borde | Apliqué margen interior consistente | Mejora lectura y ritmo |
| 8 | Éxito | El check aparecía suelto | Creé un medallón semántico suave | Convierte confirmación en un momento reconocible |
| 9 | Éxito | La confirmación se confundía con una alerta plana | Añadí profundidad y halo contenido | Celebra sin espectáculo |
| 10 | Éxito | No distinguía resultado de recomendaciones | Añadí rótulo “Ahora puedes” | Separa qué ocurrió de qué sigue |
| 11 | Éxito | El mensaje no explicitaba persistencia | Añadí consecuencia confirmada | Aumenta confianza después de guardar |
| 12 | Éxito | Los siguientes pasos tenían poco ritmo | Convertí la lista en una secuencia espaciada | Facilita decidir rápidamente |
| 13 | Siguiente paso | La recomendación parecía una card pasiva | Añadí respuesta de profundidad al hover | Comunica que continúa el flujo |
| 14 | Siguiente paso | El enlace no expresaba dirección | Añadí flecha animada sutil | Refuerza continuidad |
| 15 | Siguiente paso | El movimiento podía ignorar reduced motion | Usa exclusivamente tokens ya neutralizados | Preserva confort y accesibilidad |
| 16 | Productos | “Creado” no explicaba qué se guardó | Confirma información, precio e imagen | Evita que el owner tenga que comprobarlo |
| 17 | Productos | El éxito terminaba en una afirmación | Sugiere preparar inventario para vender | Conecta catálogo con operación |
| 18 | Productos | El enlace a Inventario tenía poco feedback | Hereda la recomendación interactiva premium | Reduce fricción del siguiente paso |
| 19 | Configuración | “Configuración guardada” era robótico | Explica nombre, moneda y zona horaria actualizados | Traduce persistencia a impacto de negocio |
| 20 | Configuración | El error podía hacer temer pérdida de datos | Aclara que los datos se conservan | Transmite tranquilidad |
| 21 | Equipo | La invitación exitosa no decía dónde seguirla | Indica Invitaciones pendientes | El owner sabe qué hacer después |
| 22 | Perfil | El éxito prometía cambios tras actualizar | Confirma representación inmediata en NEXO | Elimina una instrucción innecesaria |
| 23 | Perfil | El error no aclaraba conservación | Confirma que los cambios permanecen | Facilita un retry seguro |
| 24 | Caja | Todas las operaciones compartían mensaje genérico | La respuesta distingue apertura, cierre y movimiento | El feedback refleja la intención real |
| 25 | Caja | Abrir no confirmaba disponibilidad del turno | Indica que ya puede registrar ventas | Conecta estado con próxima tarea |
| 26 | Caja | Cerrar no confirmaba evidencia registrada | Explica conteo y diferencia persistidos | Refuerza seguridad financiera |
| 27 | Caja | Movimiento no explicaba su efecto | Confirma actualización del saldo esperado | Da control operacional |
| 28 | Ventas | El diagnóstico avanzado conservaba demasiado peso | Hereda disclosure visual cerrado por defecto | Mantiene la pantalla orientada a negocio |
| 29 | Ventas | El historial largo usaba scroll sin personalidad | Hereda scrollbar fino y consistente | Mejora sesiones extensas |
| 30 | Ayuda | Los enlaces de continuidad no tenían cierre visual | Heredan dirección y feedback coherentes | Une aprendizaje y acción |
| 31 | Logout | La navegación podía abortar el 204 confirmado | El cliente consume el transporte y permite cerrar el ciclo antes de navegar | Mantiene Network limpia hasta la despedida |
