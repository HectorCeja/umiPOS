# NEXO UI Polish — inventario previo a cambios

Fecha de inspección: 2026-07-15. Estado base: `CONDITIONALLY COMPLETE`.

Fuentes inspeccionadas: rutas reales de `apps/web/src/app`, capturas certificadas de Parte 2,
mockups `login.png`, `onboarding.png`, `home.png`, componentes `product-experience.tsx`,
`global-shell.tsx`, `control-plane-shell.tsx` y estilos compartidos. Contact sheet:
`artifacts/ui-polish/inventory/admin-contact-sheet.png`.

Escala: Excelente, Buena, Aceptable, Inconsistente, Heredada, Necesita reconstrucción.

| Pantalla / ruta                               | Shell                       | Sidebar                                         | Topbar                              | Living Scene               | Motion    | Responsive | Tipografía | Scroll                        | Glow / halos               | Componentes                            | Estado                                        |
| --------------------------------------------- | --------------------------- | ----------------------------------------------- | ----------------------------------- | -------------------------- | --------- | ---------- | ---------- | ----------------------------- | -------------------------- | -------------------------------------- | --------------------------------------------- |
| Login `/login`                                | escena propia correcta      | N/A                                             | N/A                                 | login + foto               | Buena     | Buena      | Buena      | página en viewport bajo       | Buena                      | formulario cinematic                   | Buena; retirar review/testimonio              |
| Onboarding `/` incompleto                     | shell cinematic propio      | rail propio requerido                           | header propio                       | onboarding + foto por paso | Buena     | Buena      | Buena      | viewport completo, incorrecto | Buena                      | panel funcional + rail                 | Necesita reconstrucción de scroll             |
| Home `/` completo                             | copia local del mejor shell | visualmente Excelente, implementación duplicada | Excelente, implementación duplicada | home + artwork             | Buena     | Buena      | Excelente  | natural                       | Excelente                  | cards propias                          | Excelente visual / Inconsistente arquitectura |
| Productos `/products`                         | `GlobalShell`               | compartida                                      | compartida                          | products                   | Aceptable | Buena      | Buena      | natural                       | Aceptable                  | editor y catálogo conectados           | Buena                                         |
| Inventario `/inventory`                       | `GlobalShell`               | compartida                                      | compartida                          | inventory                  | Aceptable | Buena      | Buena      | natural                       | Bajo, adecuado a datos     | superficies operativas                 | Aceptable; backend limitado                   |
| Ventas `/sales`                               | `GlobalShell`               | compartida                                      | compartida                          | sales                      | Aceptable | Buena      | Buena      | página extensa                | Aceptable                  | consola administrativa                 | Aceptable                                     |
| Ventas subrutas                               | `GlobalShell` vía consola   | compartida                                      | compartida                          | sales                      | Aceptable | Buena      | Buena      | variable por tabla            | Aceptable                  | tablas/detalles                        | Aceptable                                     |
| Caja `/cash`                                  | `GlobalShell`               | compartida                                      | compartida                          | cash                       | Aceptable | Buena      | Aceptable  | página muy extensa            | Inconsistente por densidad | consola Cash heredada dentro del shell | Inconsistente                                 |
| Reportes `/reports`                           | `GlobalShell`               | compartida                                      | compartida                          | reports                    | Buena     | Buena      | Buena      | natural                       | Buena                      | editorial + estados honestos           | Buena; datos limitados                        |
| Equipo `/control-plane/invitations`           | `GlobalShell` + subnav      | compartida                                      | compartida                          | team                       | Aceptable | Buena      | Buena      | natural                       | Aceptable                  | Control Plane forms                    | Buena                                         |
| Organizaciones `/control-plane/organizations` | `GlobalShell` + subnav      | compartida                                      | compartida                          | settings                   | Aceptable | Buena      | Buena      | natural                       | Aceptable                  | Control Plane forms                    | Buena; baseline bloqueado                     |
| Sucursales `/control-plane/branches`          | `GlobalShell` + subnav      | compartida                                      | compartida                          | settings                   | Aceptable | Buena      | Buena      | natural                       | Aceptable                  | Control Plane forms                    | Buena; baseline bloqueado                     |
| Configuración `/control-plane/settings`       | `GlobalShell` + subnav      | compartida                                      | compartida                          | settings                   | Aceptable | Buena      | Buena      | natural                       | Aceptable                  | Control Plane forms                    | Buena; baseline bloqueado                     |
| Perfil `/settings/profile`                    | `GlobalShell`               | compartida                                      | compartida                          | settings                   | Aceptable | Buena      | Buena      | natural                       | Aceptable                  | profile form                           | Buena                                         |
| Ayuda `/help`                                 | `GlobalShell`               | compartida                                      | compartida                          | minimal                    | Aceptable | Buena      | Buena      | natural                       | Bajo                       | content cards                          | Aceptable                                     |
| Command Palette                               | overlay global              | usa mismo modelo de items                       | trigger compartido                  | no duplica scene           | Buena     | Buena      | Buena      | lista interna                 | Buena                      | `CommandPalette`                       | Buena                                         |

## Hallazgos bloqueantes de polish

1. Existen dos implementaciones de shell: Home dentro de `product-experience.tsx` y
   `GlobalShell` para módulos. Aunque se parecen, divergen en navegación, selector de contexto,
   cuenta, copy de estado y comportamiento de foco.
2. Home abre `context-menu` desde dos triggers, pero el menú vive anclado al bloque de Sidebar; el
   trigger de Topbar no posee ancla propia. Esto explica su aparición en una esquina incorrecta.
3. Onboarding permite que el documento completo crezca. Rail, escena, progreso y acciones pierden
   continuidad en pasos densos; el scroll debe aislarse en el panel funcional.
4. El copy de acciones de onboarding sigue priorizando persistencia técnica sobre avance narrativo.
5. Login incluye un `blockquote` de review de cliente que la dirección actual ordena retirar sin
   sustitución.
6. Los módulos comparten tokens y scene engine, pero las frases editoriales y el ritmo de entrada
   no tienen un primitive común; algunos headers se sienten funcionales y otros editoriales.
7. Caja conserva mayor densidad y más patrones heredados que el resto, aunque ya está dentro del
   shell compartido.

## Restricciones de esta pasada

- No actualizar snapshots.
- No tocar baselines aprobados de Control Plane ni POS.
- No modificar responsive navigation sin una regresión demostrable.
- No implementar ni simular los gaps backend de Inventario y Reportes.
- Toda evidencia nueva irá a `artifacts/ui-polish/` para aprobación del propietario.

## Corrección focal tras rechazo — 2026-07-15

Los hallazgos 1, 5, 6 y 7 se atendieron sin ampliar alcance: chrome estabilizado entre rutas,
`NexoEditorialHeader` compartido para Ventas/Caja, reveal Home, Login recalibrado y Onboarding con
scroll interno/mapa compacto. La nueva evidencia vive en `artifacts/owner-review-correction/` y no
reemplaza baselines. La clasificación visual continúa pendiente del propietario.

## Final review additions — 2026-07-16

| Surface              | Change                              | Evidence                       | Status       |
| -------------------- | ----------------------------------- | ------------------------------ | ------------ |
| Topbar context       | Spacious selectors + floating menus | final owner screenshots/videos | OWNER REVIEW |
| User menu            | Profile/Help/Logout only            | simplified menu capture        | OWNER REVIEW |
| Authenticated shell  | Masked artwork + subtle trails      | route captures + motion videos | OWNER REVIEW |
| Login/Onboarding/POS | No visual change                    | protected regressions          | PRESERVED    |
