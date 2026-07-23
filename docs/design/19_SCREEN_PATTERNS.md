# 19 — Screen Patterns

## Login

Objetivo: entrada segura y extraordinaria. Composición cinematográfica + panel preciso; logo, título, subtítulo, formulario, artwork y frase editorial. `AmbientExperience`, no App Shell. Desktop cabe sin body scroll; móvil prioriza formulario y permite scroll natural. No agregar social login, review card o slogans.

## Onboarding

Objetivo: construir el negocio con progreso y continuidad. 11 pasos dentro de scene/header/progress fijos y FunctionalPanel scrolleable con actions sticky. Phase map se compacta responsivamente. Copy de acciones: Empezar, Continuar, Entrar a NEXO. No usar página infinita ni ocultar contenido inferior.

## Home

Objetivo: control completo. Shell fijo, header editorial, KPIs, overview/actividad/acciones/insight y artwork `womanpos`. Reveal funcional primero y editorial después. El mensaje se centra ópticamente en su región. Mobile reflow conserva información crítica.

## Productos

Objetivo: catálogo preciso. Header, search, filters y acciones con breathing; cards/list/detail comparten datos. Artwork `products.jpeg` localizado en espacio negativo. No usar tabla genérica para el catálogo visual ni duplicar editor.

## Inventario

Objetivo: disponibilidad, riesgo y trazabilidad. Header, KPIs, saldo por estados, alertas/movimientos y acciones autorizadas. Artwork `inventory.jpeg`, quality reduced y alta estabilidad de lectura. No editar saldo directamente ni simular ubicaciones/transferencias/conteos sin contrato.

## Ventas

Objetivo: actividad y trazabilidad administrativa. Header editorial con reveal, KPIs, filtros, tabla y detalle. Artwork `womanpos` con crop Sales. Lifecycle/acciones usan estados reales. No sustituye POS Flutter ni simula refunds.

## Caja

Objetivo: precisión y confianza operativa. Header editorial, halo de estado, resumen, movimientos y lifecycle open/operation/close. Artwork `womanpos` con crop Cash. Motion no aparenta un estado no confirmado.

## Reportes

Objetivo: inteligencia de negocio. Header de módulo, periodo disponible, KPIs y estados honestos.
Artwork `analytics.jpeg` y quality high. La región de ingresos muestra un `EmptyState` hasta que exista
serie temporal; el producto actual no renderiza charts de series/clientes/métodos de pago y no los
simula.

## Perfil

Objetivo: identidad y preferencias personales. Scene abstracta mínima, formularios claros y acciones de seguridad confirmadas. Sin fotografía. User menu expone una sola ruta Perfil.

## Configuración

Objetivo: administración concentrada. Secondary navigation con offset común, sections/forms, dirty/save/error y scene abstracta. Sin fotografía ni botón global si contratos son independientes.

## Control Plane

Objetivo: organizaciones, sucursales, invitaciones y settings con permisos/RLS. Reutiliza `NexoAppShell`, navegación secundaria y scene abstracta. Chrome idéntico a Home salvo active item/acciones. No usa el Admin AppShell genérico de Storybook.

## Regla transversal

Cada pantalla conserva el mismo shell, tokens, focus, motion y responsive. La personalidad proviene de contenido, editorial header, scene variant y artwork registrado; no de un sistema visual local.
