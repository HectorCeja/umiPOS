# Experiencia, interfaz y sistema de diseño

## Principios UX

- **Claridad operativa:** cada pantalla responde dónde estoy, qué pasó y qué puedo hacer.
- **Velocidad por repetición:** rutas frecuentes admiten teclado, lector de código y táctil; se minimizan cambios de contexto.
- **Prevención y recuperación:** validación temprana, borradores, acciones reversibles y mensajes con solución.
- **Divulgación progresiva:** defaults seguros primero; configuración avanzada bajo demanda.
- **Consistencia semántica:** una venta, caja, cliente o cita conserva nombre, estado y patrón en todos los giros.
- **Inclusión por defecto:** no depender de color, precisión motriz, audición, memoria ni idioma técnico.
- **Honestidad del sistema:** no ocultar demoras, conflicto offline, comisión, impuesto o efecto irreversible.

## Arquitectura de información adaptativa

La navegación primaria se compone desde un registro de capacidades autorizado por servidor. El giro propone un perfil (`commerce`, `food`, `appointments`, `services`), pero el propietario puede modificarlo. Ocultar un módulo no elimina datos ni permisos. La autorización nunca depende de que un elemento esté oculto.

Orden recomendado: **Vender**, Agenda (si aplica), Catálogo, Inventario (si aplica), Clientes, Caja, Ventas, Reportes, Equipo, Configuración. En móvil se priorizan las 4 acciones del rol y el resto vive en “Más”; en escritorio existe navegación lateral persistente. El cambio de organización/sucursal debe ser inequívoco y mostrar contexto activo.

## Onboarding inteligente

1. Crear cuenta y verificar identidad de contacto.
2. Crear organización: nombre, giro, país, moneda, zona horaria; explicar que puede cambiarse.
3. Crear primera sucursal y caja lógica.
4. Elegir ruta: producto, servicio o ambos; ofrecer importación o alta rápida.
5. Configurar impuestos/precios con defaults informativos, sin presentarlos como asesoría fiscal.
6. Invitar equipo opcionalmente.
7. Vista previa y primera venta guiada.
8. Checklist persistente de mejoras no bloqueantes.

Se permiten saltos salvo datos esenciales. El progreso se guarda. Nunca solicitar RFC, domicilio fiscal o datos de tarjeta si la capacidad actual no los necesita. Objetivo medido: primera venta válida, no completar formularios.

## Flujos críticos

### Venta

Seleccionar/buscar → ajustar cantidad/modificadores → cliente opcional → descuento autorizado → revisar totales/impuestos → elegir medio registrado → confirmar una vez → recibo → nueva venta. Confirmar crea una operación idempotente; doble toque no duplica. Falta de stock sigue política configurada y comunica consecuencia.

### Caja

Seleccionar sucursal/caja → fondo inicial → turno abierto → movimientos justificados → conteo ciego opcional → diferencia y motivo → cierre inmutable. Sólo roles autorizados reabren/corrigen mediante evento compensatorio.

### Cita

Elegir servicio → prestador/recurso → disponibilidad en zona de sucursal → cliente → confirmar → recordatorio futuro → llegada/en servicio/completada/no asistió/cancelada → crear venta asociada. Conflictos concurrentes se rechazan con alternativas.

## Diseño responsive

Diseño mobile-first por capacidad, no por modelos de dispositivo. Rangos orientativos, ajustables por contenido: compacto `<600 px`, medio `600–1023 px`, amplio `≥1024 px`. No deben convertirse en supuestos de agente de usuario.

| Contexto      | Composición                                         | Requisito clave                                                                    |
| ------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Teléfono      | una columna, acciones inferiores, paneles completos | agenda/consulta/gestión ligera; POS permitido pero no optimizado para gran volumen |
| Tablet/táctil | panel dividido adaptable, objetivos amplios         | contexto POS principal y orientación vertical/horizontal                           |
| Escritorio    | navegación lateral, densidad controlada, paneles    | administración, reportes y operaciones masivas                                     |

No habrá scroll horizontal para contenido a 320 CSS px salvo tablas/diagramas cuyo significado lo requiera; esas vistas ofrecen tarjetas o columnas elegibles. Teclado virtual no debe cubrir importe/acción. Soporta zoom 200% y reflow equivalente a 400%. Impresión de recibos es una presentación separada.

## Sistema de diseño

### Fundamentos

- Tokens semánticos versionados: color (`surface`, `text`, `action`, `danger`, `success`), tipografía, espacio, radio, elevación, movimiento y capas.
- Escala espacial base 4 px, objetivos táctiles preferidos ≥44×44 CSS px y mínimo WCAG 2.2 AA de 24×24 donde aplique.
- Tipografía legible con tamaño base equivalente a 16 px; números tabulares para dinero y cantidades.
- Temas claro/oscuro/alto contraste sin codificar estados sólo por color.
- Movimiento funcional, breve y desactivable con `prefers-reduced-motion`.

### Patrones normativos

Los controles se especificarán por anatomía, estados, interacción, contenido, accesibilidad y pruebas: acción, campo, selector, búsqueda, diálogo, aviso, toast, tabla/lista, tarjeta de métrica, navegación, cantidad, dinero, fecha/hora, estado de sincronización y recibo. Se reutilizan primitivas accesibles maduras; cualquier divergencia necesita prueba con teclado y lector.

Estados mínimos: default, hover cuando exista, focus visible, active, disabled explicando causa, loading, empty, error, success y offline/conflict. Skeleton sólo cuando conserva estructura; operaciones de escritura muestran progreso y resultado, nunca un spinner indefinido.

### Contenido

Español claro, voz directa, verbos en acciones (“Cerrar caja”), fechas localizadas y dinero con código cuando haya ambigüedad (`MXN 1,234.50`). Errores indican problema, causa conocida y siguiente acción, sin culpar. No usar “Aceptar” para acciones destructivas. Las traducciones usan claves con parámetros y pluralización; no concatenan frases.

## Accesibilidad — requisitos `RA`

Objetivo: **WCAG 2.2 nivel AA** en experiencia web y PWA, incluyendo flujos autenticados y documentos esenciales.

- RA-01: todo uso debe ser operable con teclado, sin trampa, con orden lógico y atajos documentados/reconfigurables cuando sean de una tecla.
- RA-02: foco visible no queda oculto; cumple apariencia AA y se mueve sólo por acción predecible.
- RA-03: estructura, nombre, rol, estado y relaciones se exponen programáticamente; HTML semántico primero.
- RA-04: contraste ≥4.5:1 para texto normal, ≥3:1 para texto grande y componentes/gráficos esenciales.
- RA-05: color, posición, sonido o gesto no son el único medio de transmitir información.
- RA-06: contenido refluye a 320 CSS px y con zoom 200%; espaciado de texto configurable no pierde contenido.
- RA-07: etiquetas e instrucciones persisten; errores se asocian al campo, resumen al inicio y sugerencia cuando exista.
- RA-08: autenticación no exige prueba cognitiva; permite gestores de contraseña, pegar y alternativas accesibles; no bloquea por CAPTCHA inaccesible.
- RA-09: objetivos de puntero cumplen WCAG 2.2; existe alternativa a arrastre y gestos multipunto.
- RA-10: cambios de estado y mensajes importantes se anuncian sin robar foco; temporizadores se ajustan salvo límite esencial.
- RA-11: orientación no se restringe; animación respeta reducción de movimiento y no hay destellos peligrosos.
- RA-12: idioma de página/partes, títulos, encabezados, landmarks y texto alternativo son correctos.
- RA-13: recibos y exportaciones esenciales tienen alternativa accesible; tablas incluyen encabezados/caption.
- RA-14: componentes se prueban con teclado y al menos NVDA+Firefox/Chrome, VoiceOver+Safari y zoom/contraste del sistema.
- RA-15: declaración de accesibilidad, canal de reporte y SLA de triage; una falla que bloquea venta es severidad alta.

La conformidad se valida por criterios de éxito, no por una sola herramienta automática. QA conserva evidencia por release.
