# NEXO Design Bible

> Design Direction V1 · Creative Direction Sprint · 15 julio 2026  
> Estado: dirección conceptual para revisión del propietario. No autoriza implementación.

> Implementación V1: Prompt 12.7 traduce esta dirección a tokens, tipografía, motion y superficies. La dirección continúa sujeta a aprobación visual humana; la Biblia sigue siendo la autoridad creativa y no una declaración de calidad perceptual.

## 1. Mandato

NEXO convierte complejidad operativa en calma, orientación y deseo de avanzar. No es un
ERP decorado ni un POS web: es el lugar donde una persona entiende, prepara y cuida su
negocio. Cada pantalla debe contestar en menos de cinco segundos: **dónde estoy, qué
importa y qué hago después**.

La experiencia buscada es “hospitality intelligence”: la precisión de una herramienta
financiera con la calidez de un anfitrión excelente. Se ve tecnológica, nunca fría;
lujosa, nunca ostentosa; viva, nunca inquieta.

## 2. Investigación y síntesis

La investigación estudió principios, no expresiones visuales copiables.

| Referencia                  | Principio observado                                   | Adopción conceptual                                | Rechazo explícito                                |
| --------------------------- | ----------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------ |
| Shopify Admin / Polaris     | IA merchant-first, lenguaje compartido, localización  | complejidad progresiva y tareas de negocio         | estructura, componentes y estética Polaris       |
| Shopify POS                 | acciones táctiles, contexto de tienda, lectura rápida | objetivos grandes y estado operativo inmediato     | cuadrícula/layout POS y patrones de cobro        |
| Stripe Dashboard            | densidad disciplinada, búsqueda y recursos trazables  | datos financieros alineados y detalle bajo demanda | sidebar, azul, tablas y composición Stripe       |
| Toast / Square / Lightspeed | operación contextual, acciones según turno            | una siguiente acción inequívoca y estados humanos  | pantallas de órdenes, layouts y activos de marca |
| Linear                      | velocidad percibida, jerarquía y command surface      | navegación rápida, foco y transiciones breves      | oscuridad, estructura o palette literal          |
| Raycast / Arc               | interacción por teclado y capas con profundidad       | command palette rica, foco restaurado, contexto    | geometría, materiales y shortcuts propietarios   |
| Notion                      | bloques comprensibles y edición de baja fricción      | composición modular editorial                      | minimalismo monocromo y modelo de documento      |
| Apple HIG                   | propósito, legibilidad, jerarquía, adaptación         | lectura primero, escalado y motion funcional       | Liquid Glass, SF y componentes Apple             |
| Material Design 3           | roles semánticos, forma y motion tokenizados          | tokens, estados y adaptación                       | componentes, dynamic color y siluetas Material   |
| Fluent 2                    | aliases semánticos y baseline disciplinado            | tokens globales/semánticos, capas y contraste      | Segoe, acrílico y lenguaje Windows               |
| Behance POS (corpus)        | impacto editorial, catálogo visual, ritmo             | imagen con función, narrativa y previews           | imágenes, layouts, marcas y tendencias aisladas  |

Fuentes primarias consultadas: [Shopify Polaris foundations](https://polaris-react.shopify.com/foundations),
[Shopify visual design](https://shopify.dev/docs/apps/design/visual-design),
[Stripe Dashboard](https://docs.stripe.com/dashboard/basics),
[Apple HIG](https://developer.apple.com/design/human-interface-guidelines/),
[Apple typography](https://developer.apple.com/design/human-interface-guidelines/typography),
[Apple layout](https://developer.apple.com/design/human-interface-guidelines/layout),
[Fluent tokens](https://fluent2.microsoft.design/design-tokens),
[Fluent typography](https://fluent2.microsoft.design/typography),
[Material theming](https://developer.android.com/codelabs/m3-design-theming) y el
[corpus POS de Behance](https://www.behance.net/search/projects/pos%20ui%20user%20interface?locale=en_US).

### Hallazgos del corpus visual

Se revisaron decenas de composiciones POS/hospitality: los conceptos memorables usan un
foco dominante, fotografía o ilustración contextual, datos en capas y estados de selección
claros. Los menos eficaces repiten tarjetas, saturan con gradientes, usan tipografía mínima,
inventan analytics o confunden “premium” con blur. NEXO adopta ritmo y narrativa, no esas
formas.

## 3. Filosofía

1. **Calma competente.** La interfaz sabe qué importa y no obliga a interpretarla.
2. **Hospitalidad digital.** Guía como una persona atenta: anticipa, explica y nunca juzga.
3. **Profundidad con propósito.** Las capas representan jerarquía o interacción, no adorno.
4. **Operación humana.** Dice “efectivo esperado”, no nombres de tablas o estados internos.
5. **Belleza útil.** Cada imagen, transición y color mejora comprensión o confianza.

## 4. Emociones objetivo

| Momento         | Emoción               | Señal de diseño                                         |
| --------------- | --------------------- | ------------------------------------------------------- |
| Primera entrada | curiosidad segura     | escena editorial, promesa breve, acción única           |
| Configuración   | control acompañado    | progreso claro, preview vivo, decisiones reversibles    |
| Inicio          | orgullo y orientación | saludo contextual, pulso del negocio, foco editorial    |
| Operación       | calma y velocidad     | estados inequívocos, acción siguiente, densidad precisa |
| Error           | confianza recuperable | explicación humana, conservación de datos, reintento    |
| Éxito           | satisfacción discreta | confirmación visible y breve, sin celebración infantil  |

## 5. Diez principios inquebrantables

1. Una pantalla, una historia principal.
2. Toda acción muestra intención, progreso, resultado y recuperación.
3. La información se revela según relevancia, permiso y momento.
4. El usuario conserva control real; sugerir nunca significa imponer.
5. La autoridad vive en el sistema; la presentación nunca inventa datos.
6. El idioma principal es español de México, humano y directo.
7. Accesibilidad, teclado y reduced motion son parte de la estética.
8. La composición responde al contenido, no a una cuadrícula de cards genéricas.
9. El mismo producto debe sentirse continuo en desktop, tablet y móvil.
10. Ningún detalle visual compensa una jerarquía confusa.

## 6. Prohibiciones

- No parecer Bootstrap, ERP, CRM, dashboard administrativo o proyecto universitario.
- No usar formularios infinitos, paredes de texto ni tarjetas idénticas en mosaico.
- No mostrar UUID, SQL, enums, códigos internos, outbox o lenguaje de arquitectura.
- No colocar acciones falsas, métricas inventadas, tendencias simuladas o módulos decorativos.
- No usar color como única señal, placeholder como label o icono sin nombre accesible.
- No abusar de glass, blur, neón, gradientes, sombras, partículas o animación continua.
- No llenar estados vacíos con guiones.
- No convertir la web en POS o checkout operativo.
- No copiar ninguna marca, layout, componente, asset o identidad estudiada.

## 7. Personalidad y voz

NEXO habla con frases breves, concretas y serenas. Usa “tu negocio” cuando acompaña y el
nombre real cuando confirma contexto. Evita entusiasmo artificial, diminutivos, tecnicismos
y culpar. Un éxito dice “Producto agregado”; un conflicto dice “Hay una versión más
reciente. Recarga antes de guardar”; un vacío dice qué aparecerá y cómo empezar.

Se mueve como una puerta bien balanceada: responde de inmediato, desacelera al asentarse y
nunca rebota. Se siente táctil por luz, escala y continuidad, no por realismo material.

## 8. Tres moodboards

### A · Hospitality Premium

- **Inspiración:** lobby nocturno, barra de café, papel algodón, cerámica, latón cepillado.
- **Color:** vino profundo, cacao, crema, terracota, salvia.
- **Iluminación:** cálida lateral; pools de luz locales.
- **Composición:** editorial, asimétrica, imágenes grandes y datos íntimos.
- **Fotografía:** oficio, manos, materiales, espacios; nunca stock de comida aleatoria.
- **Ilustración:** bodegones abstractos y recortes táctiles.
- **Movimiento:** pausado, suave, orgánico.
- **Personalidad:** anfitrión boutique; cálido, sensorial, confiable.
- **Iconografía:** redondeada y humana.
- **Fondos/materiales:** grano fino, papel oscuro, metal satinado.
- **Riesgo:** puede sentirse demasiado nicho para retail/servicios.

### B · Enterprise Luxury

- **Inspiración:** instrumentos de precisión, arquitectura nocturna, fintech editorial.
- **Color:** grafito, azul tinta, violeta mineral, blanco cálido, menta precisa.
- **Iluminación:** ambiental controlada, bordes de luz fría y focos locales.
- **Composición:** amplia, jerarquía tipográfica dominante, módulos no uniformes.
- **Fotografía:** negocio contemporáneo tratado como objeto valioso.
- **Ilustración:** diagramas abstractos, mapas de actividad y líneas luminosas.
- **Movimiento:** rápido y amortiguado.
- **Personalidad:** director de operaciones calmado; sofisticado y universal.
- **Iconografía:** geométrica, 1.75 px, terminaciones suaves.
- **Fondos/materiales:** vidrio ahumado mínimo, grafito, aluminio oscuro.
- **Riesgo:** sin hospitality puede volverse fintech genérico.

### C · Future Retail

- **Inspiración:** señalética cinética, retail inmersivo, displays OLED, luz espectral.
- **Color:** negro azulado, índigo eléctrico, cian profundo, coral controlado.
- **Iluminación:** halos direccionales y refracción sutil.
- **Composición:** capas flotantes, galerías, navegación espacial.
- **Fotografía:** producto recortado, macro y movimiento congelado.
- **Ilustración:** volúmenes 3D suaves y portales de categoría.
- **Movimiento:** directo, elástico solo en selección.
- **Personalidad:** curioso, audaz, experimental.
- **Iconografía:** monoline con momentos sólidos.
- **Fondos/materiales:** profundidad OLED, mesh atmosférico, noise ultrafino.
- **Riesgo:** fatiga visual y menor longevidad.

### Matriz de dirección

Escala 1–5; claridad y accesibilidad pesan ×2.

| Criterio                | Peso | Hospitality | Enterprise | Future |
| ----------------------- | ---: | ----------: | ---------: | -----: |
| Primera impresión       |    1 |           5 |          5 |      5 |
| Claridad operacional    |    2 |           4 |          5 |      3 |
| Universalidad sectorial |    1 |           3 |          5 |      4 |
| Hospitality             |    1 |           5 |          4 |      3 |
| Accesibilidad           |    2 |           4 |          5 |      3 |
| Longevidad              |    1 |           4 |          5 |      3 |
| Paridad futura móvil    |    1 |           4 |          5 |      4 |
| **Total ponderado /45** |      |      **37** |     **44** | **31** |

**Recomendación para aprobación:** Enterprise Luxury como estructura, con temperatura y
fotografía de Hospitality Premium. Future Retail queda como acento para catálogo y
onboarding, nunca como sistema completo.

## 9. Paleta propuesta

### Fundaciones oscuras

| Token       | Hex       | Uso y razón                                    |
| ----------- | --------- | ---------------------------------------------- |
| Night 1000  | `#070912` | canvas OLED con matiz azul, evita negro muerto |
| Night 950   | `#0B0E19` | fondo principal, profundidad sin ruido         |
| Night 900   | `#111522` | superficie base                                |
| Night 850   | `#171C2B` | superficie elevada                             |
| Night 800   | `#202638` | hover y campos                                 |
| Line subtle | `#2A3146` | separación estructural, no caja decorativa     |

### Marca y estado

| Token      | Hex       | Uso y razón                                     |
| ---------- | --------- | ----------------------------------------------- |
| Violet 500 | `#7868E6` | marca y foco editorial; mineral, no juguetón    |
| Violet 400 | `#9588F2` | hover/énfasis sobre oscuro                      |
| Blue 500   | `#4E7FE8` | información, navegación contextual              |
| Mint 400   | `#68D7B0` | éxito/confirmación; legible y hospitalario      |
| Amber 400  | `#E9B96E` | atención sin alarma                             |
| Rose 400   | `#EB7F8D` | error elegante, jamás texto sobre rojo saturado |
| Warm white | `#F5F2EE` | texto principal menos clínico que blanco puro   |
| Fog 300    | `#B8BECC` | texto secundario                                |
| Fog 500    | `#7F879A` | metadata no esencial                            |

Los colores semánticos no se reutilizan como marca. El violeta identifica NEXO; menta,
ámbar y rosa conservan significado. Gradientes máximos: dos tonos próximos, contraste
local comprobado y superficie inferior al 25% de la pantalla.

### Tema claro conceptual

Canvas `#F4F2F7`, superficie `#FFFCFA`, texto `#171522`, bordes `#DDD8E4`, violeta
`#6556CD`. Solo se autoriza si logra paridad perceptual y contraste; no es inversión
automática del oscuro.

## 10. Tipografía

### Comparación

| Familia           | Licencia    | Fortalezas                                 | Riesgo                   |
| ----------------- | ----------- | ------------------------------------------ | ------------------------ |
| Manrope           | SIL OFL 1.1 | números claros, geometría amable, variable | muy usada en SaaS        |
| Plus Jakarta Sans | SIL OFL 1.1 | cálida, hospitality, excelente display     | cuerpo algo ancho        |
| Instrument Sans   | SIL OFL 1.1 | editorial, contemporánea, refinada         | menos contraste de pesos |
| Geist             | SIL OFL 1.1 | técnica, precisa, compacta                 | voz demasiado dev-tool   |

**Elección:** Instrument Sans para display/heading y Manrope para body/label/numeric.
Instrument aporta una voz menos genérica; Manrope mantiene lectura y cifras operativas.
Dos familias es el máximo. Ambas son OFL 1.1; la implementación futura deberá usar
paquetes versionados/autohospedados, subsets latinos, preload del peso crítico y fallbacks
métricamente compatibles. No se redistribuyen archivos manualmente en este sprint.

Escala: Display 64/68; H1 44/50; H2 30/38; H3 22/30; Body 16/25; Compact 14/21;
Label 13/18; Caption 12/17. Money usa números tabulares. Peso mínimo 400; metadata 450;
acciones 600; headings 580–650. Nunca texto operativo menor a 12 px.

## 11. Composición, espacio y materiales

- Grid desktop de 12 columnas; contenido 1180–1440 px; rail 248 px; gutters 28–40 px.
- Tablet 8 columnas; móvil 4; la jerarquía se reordena, no se encoge.
- Escala de espacio: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Radios: 10 controles, 16 paneles, 24 hero, píldora solo para estado/segmentación.
- Bordes sustituyen sombras en nivel base. Elevación 1/2/3 corresponde a sticky,
  popover y dialog; nunca sombra arbitraria.
- Cada pantalla tiene un “momento” dominante y máximo dos acciones primarias visibles.

## 12. Fondos vivos

El canvas combina Night 1000, un mesh estático de violeta/azul al 8–12%, noise monocromo
al 1.5% y luz contextual que responde al módulo. Solo login/onboarding/Home admiten
movimiento ambiental: deriva de 18–24 segundos, desplazamiento máximo 16 px y pausa con
reduced motion. Ventas usa luz azul; Caja violeta; Productos un halo menta-violeta;
Inventario azul petróleo. No hay wallpapers, GIF, partículas, parallax ni blobs brillantes.

## 13. Motion System

| Familia     | Duración | Curva                       | Uso                        |
| ----------- | -------: | --------------------------- | -------------------------- |
| Instant     |    80 ms | linear-out                  | pressed, toggle, highlight |
| Micro       |   140 ms | `cubic-bezier(.2,.8,.2,1)`  | hover, focus, icono        |
| Component   |   220 ms | `cubic-bezier(.22,1,.36,1)` | menu, card, select         |
| Spatial     |   320 ms | `cubic-bezier(.16,1,.3,1)`  | drawer, route, onboarding  |
| Celebration |   480 ms | secuencia amortiguada       | finalización excepcional   |

Movimiento máximo: 8 px en micro, 24 px en capas. Press escala 0.985; hover de card
sube 2 px solo si es clicable. Skeleton usa shimmer lento con luminancia <8%, no pulso.
Dialogs aparecen con opacidad + escala 0.98; sidebar con clip/width sin mover contenido;
command palette con opacidad + 12 px. Route transitions mantienen shell y cambian solo el
canvas. Reduced motion elimina traslación/escala y conserva crossfade de 80 ms.

## 14. Anatomía de componentes

- **Buttons:** sólidos solo para acción primaria; secundarios tintados; terciarios sin
  contenedor; 44/48/56 px; icono 18/20; success sustituye spinner sin cambiar ancho.
- **Inputs:** label persistente, helper útil, superficie Night 800, focus doble (borde +
  halo), error inline; campos compuestos se perciben como una unidad.
- **Cards:** una razón semántica para existir; headline, evidencia y acción; variante media,
  editorial, metric y actionable; nunca “card por cada dato”.
- **Dialogs:** encabezado decisional, contenido corto, consecuencias visibles, footer fijo;
  destructive requiere verbo específico.
- **Tables:** números alineados, filas 52–60 px, header sticky solo con scroll, hover suave,
  detalle responsive como lista editorial.
- **Gallery/Product cards:** imagen 4:3, selección visible, categoría, precio editable y
  preview; el checkbox es redundante, no único indicador.
- **Category cards:** textura/color abstracto propio, nombre y conteo; no fotografías stock.
- **Navigation:** shell constante, contexto de negocio/sucursal, grupos por intención;
  diagnósticos fuera del nivel principal.
- **Header:** breadcrumb mínimo, título, contexto temporal, acción siguiente.
- **Command palette:** resultados ricos, recientes, contexto y preview; nunca modal vacío.
- **User menu:** identidad, rol, negocio, preferencias, ayuda y logout; contraste AA.
- **Select/search:** picker buscable para listas complejas; card/segment para decisiones;
  select simple solo para 3–7 valores compactos.
- **Tabs:** vistas hermanas, no pasos; underline/luz, no píldoras repetidas.
- **Timeline:** línea luminosa sobria, actor/acción/tiempo; técnica bajo disclosure.
- **Charts:** solo datos reales; una pregunta por chart; color semántico y tabla accesible.
- **Metrics:** cifra + significado + periodo; tendencia únicamente con comparación real.

## 15. Experiencias clave

### Login — vender antes de autenticar

Composición 45/55: formulario sereno y un “escenario vivo” del negocio al otro lado. La
promesa es una frase; el demo se identifica sin infraestructura. Tras éxito, la escena se
enfoca y el formulario se disuelve hacia el destino. Sin carrusel ni lista de features.

### Onboarding — configurar como un dispositivo premium

Un asistente de 7 capítulos visibles, no 12 formularios: Identidad, Contexto, Sucursal,
Ritmo, Operación, Catálogo y Revisión. Cada decisión produce un preview lateral vivo. Las
opciones son visuales; los detalles aparecen después. Progreso por capítulos y resumen
persistente. “Continuar después” preserva todo. La revisión es un recorrido editable, no
una tabla.

### Home — enamorar con relevancia

Hero contextual que cambia por hora y estado; un pulso central del negocio; una columna de
atención; actividad reciente y activación integrada. Con datos vacíos, muestra futuro y una
acción, no métricas en cero. La imagen editorial ocupa espacio solo si explica configuración
o identidad.

### Ventas — claridad comercial

Cabecera con venta del día y estado; banda temporal sobria; historial como superficie
principal, filtros en una command bar; estados humanos; detalle como narrativa de venta,
pagos, inventario y caja. Excepciones viven en un inbox, no en el dashboard principal.

### Caja — turno, no formulario

Centro visual: sesión actual y efectivo esperado. A un lado, actividad; al otro, siguiente
acción. Movimientos se abren como sheet contextual. Cierre usa un flujo guiado con conteo,
diferencia y revisión. Configurar cajón/punto de cobro vive fuera de operación.

### Productos — construir un catálogo

Entrada por galería, búsqueda visual y categorías. “Nuevo producto” abre un canvas: imagen
primero, identidad y precio visibles; variantes crecen en una matriz amigable; inventario
es una relación opcional. Guardado progresivo muestra una tarjeta real en preview.

### Inventario

Mapa de disponibilidad por ubicación, alertas como tareas y movimientos como historia.
Ajustar o transferir abre una capa centrada en producto y destino, jamás IDs.

### Equipo, Configuración y Perfil

Equipo presenta personas y acceso, no memberships. Configuración es un índice editorial
con estado de cada área. Perfil privilegia avatar, identidad y preferencias; seguridad es
una sección separada.

## 16. Catálogo visual

La exploración inicia con categorías cinematográficas abstractas. El usuario selecciona
productos como una galería: click/tap, shift para rango, teclado, contador fijo y preview.
La búsqueda tolera nombre/SKU/categoría. La selección activa se expresa por borde, overlay,
check y elevación. “Catálogo vacío” ofrece tres caminos equivalentes: crear producto,
plantilla curada o importar próximamente. Crear producto personalizado nunca queda oculto.

## 17. Más de 100 microinteracciones

|       # | Momento                                                                                   | Respuesta diseñada                                                                      |
| ------: | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
|     1–5 | login: focus, password, submit, success, error                                            | halo, reveal, morph a spinner, enfoque de escena, shake 2 px sin reduced motion         |
|    6–10 | sesión: restore, expiry, logout, return, multi-tab                                        | skeleton de contexto, aviso, cierre limpio, destino preservado, sincronización discreta |
|   11–15 | navegación: hover, active, collapse, mobile, breadcrumb                                   | luz lateral, marker deslizante, labels fade, sheet, transición de ruta                  |
|   16–20 | branch/user menus: open, outside, Escape, select, focus return                            | capa 220 ms, cierre inmediato, selección confirmada, ancla restaurada                   |
|   21–25 | palette: invoke, type, arrows, preview, execute                                           | dim ambiental, match destacado, cursor vivo, preview crossfade, cierre direccional      |
|   26–30 | onboarding: next, back, skip, resume, chapter complete                                    | slide contextual, dirección inversa, confirmación, retorno exacto, check dibujado       |
|   31–35 | choices: hover, select, deselect, disabled, recommendation                                | borde luminoso, check, fade, motivo tooltip, etiqueta entra                             |
|   36–40 | schedule: expand, time, interval, copy, validation                                        | accordion, cursor temporal, inserción, ripple entre días, rango se marca                |
|   41–45 | catalog: hover, select, range, filter, preview                                            | zoom 1.02, overlay, ola secuencial, layout animate, pane crossfade                      |
|   46–50 | product: upload, crop, variant, price, save                                               | progreso, marco, fila emerge, numeric settle, success persistente                       |
|   51–55 | upload: drag, reject, progress, replace, remove                                           | dropzone glow, explicación, ring, dissolve, undo toast                                  |
|   56–60 | forms: dirty, save, no change, conflict, server error                                     | status dot, spinner estable, copy, compare sheet, retry                                 |
|   61–65 | buttons: hover, pressed, loading, success, disabled                                       | luz, 0.985, spinner, check, reason tooltip                                              |
|   66–70 | inputs: focus, filled, clear, error, autofill                                             | halo, label settle, icon reveal, summary link, color neutralizado                       |
|   71–75 | tables: row hover, select, sort, paginate, responsive                                     | track, marker, arrow rotate, content crossfade, cards reflow                            |
|   76–80 | sales: refresh, filter, detail, refund status, receipt                                    | timestamp update, chips flow, pane, timeline pulse, paper preview                       |
|   81–85 | cash: open, movement, count, variance, close                                              | state morph, ledger entry, denomination sum, color+copy, guided completion              |
|   86–90 | inventory: stock change, alert, transfer, count, empty                                    | numeric roll, attention pulse once, path, reconcile, next action                        |
|   91–95 | team: role hover, invite, resend, revoke, scope                                           | capabilities preview, success, cooldown, confirm, branch chips                          |
|  96–100 | feedback: toast, inline success, warning, error, offline                                  | stack, check, accent, focus summary, persistent reconnect                               |
| 101–105 | surfaces: card hover, accordion, dialog, drawer, tooltip                                  | lift 2 px, height, scale .98, slide 24 px, delay 400 ms                                 |
| 106–110 | system: skeleton, route, data refresh, help, diagnostic                                   | shimmer, shell-stable fade, highlight, contextual reveal, copy confirm                  |
| 111–115 | accessibility: focus, reduced motion, zoom, live update, skip                             | 2 px ring, no travel, reflow, polite announce, visible link                             |
| 116–120 | celebration: onboarding complete, first product, first branch, recovered error, all clear | restrained light sweep, card placement, context update, calm reset, status settle       |

## 18. Responsive doctrine

Desktop no es una versión estirada y móvil no es una versión apilada. A 1440+, rail +
canvas + insight pane; laptop reduce el pane; tablet convierte rail en compact nav y usa
sheets; móvil prioriza una tarea, sticky action y navegación inferior contextual. Galerías
pasan 5→3→2 columnas; tablas se vuelven tarjetas; charts conservan pregunta y resumen.
Zoom 200% usa la estrategia de tablet. Cero scroll horizontal salvo data grid anunciado.

## 19. Accesibilidad creativa

Contraste AA mínimo, focus siempre visible, targets 44 px, estado redundante, teclado
completo, headings/landmarks, live regions y orden lógico. La imagen decorativa no compite
con copy; la informativa tiene alt contextual. Reduced motion conserva causalidad sin
movimiento espacial. Un diseño que solo funciona con visión perfecta, hover o color no es
lujo: es defecto.

## 20. Mockups y artefactos

Los mockups conceptuales están en `artifacts/design-direction-v1/`. Son imágenes para
decisión, no especificaciones pixel-perfect ni código. Incluyen los tres moodboards y las
superficies Login, Onboarding, Home, Ventas, Caja, Productos, Inventario, Equipo,
Configuración, Perfil, Command Palette, modo oscuro, modo claro, tablet y móvil.

## 21. Criterios de aprobación antes de implementar

El propietario debe elegir o rechazar la dirección recomendada y responder: ¿la primera
impresión provoca curiosidad?, ¿la personalidad es propia?, ¿la operación se entiende?,
¿la mezcla de Enterprise Luxury y Hospitality representa NEXO?, ¿el tema claro merece
existir?, ¿los mockups evitan parecer dashboard genérico? Hasta entonces no se cambian
pantallas, CSS, componentes ni arquitectura.
