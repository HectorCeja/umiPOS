# Storybook Governance

Storybook es el catálogo ejecutable de `@nexo/ui`. Secciones oficiales: Foundations/Tokens, Controls, Admin patterns, POS patterns y Feedback; se ampliarán con Typography, Spacing, Motion, Forms, Tables, Accessibility, UMI shell y Flutter parity.

Cada componente nuevo/modificado debe aparecer en una story con propósito, estados, responsive, dark, density/touch, keyboard y anti-pattern cuando aplique. Los play tests verifican interacción; addon-a11y hace revisión durante desarrollo y Playwright ejecuta axe en CI. Datos son deterministas y explícitamente visuales, no servicios comerciales falsos.

Un cambio de baseline requiere ticket/PR, explicación perceptual, revisión WCAG y aprobación del responsable de producto/UI. Nunca se usa actualización masiva para hacer verde una regresión.
