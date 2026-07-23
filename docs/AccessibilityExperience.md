# Accessibility Experience

Objetivo: WCAG 2.2 AA. Baseline: contraste 4.5:1 texto normal y 3:1 grande/UI; focus de 3 px no oculto; targets NEXO ≥44×44 CSS px; zoom 200%, reflow a 320 CSS px y orientación libre.

Landmarks, skip link, headings y nombres accesibles son obligatorios. Dialog atrapa foco por comportamiento nativo, Escape cierra y el trigger recupera foco. Estados asíncronos usan live regions sin interrumpir de forma excesiva. Tablas conservan encabezados; tooltips no contienen información exclusiva. Drag, hover, color y motion siempre tienen alternativa.

Autenticación permite password managers y pegado; no exige acertijos cognitivos. Timeouts notifican y permiten extender cuando seguridad lo admite. Tests: Testing Library, interacción Storybook, Playwright teclado y `@axe-core/playwright`; cero violaciones critical/serious.
