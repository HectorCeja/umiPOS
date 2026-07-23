# ADR-0044 — Living Scene Engine reusable

## Contexto

Login, Home y próximas superficies requieren atmósfera consistente sin rerender por frame ni librería pesada.

## Decisión

Usar una primitiva React estructural y CSS compositado con API tipada para variante, calidad, modo determinista y pausa por Page Visibility.

## Alternativas

Canvas ofrecía más partículas, pero aumentaba complejidad de pruebas y accesibilidad. Una librería de motion añadía bundle sin beneficio necesario. Fondos por pantalla duplicaban reglas.

## Consecuencias y reversión

Las escenas comparten capas, tokens y reduced motion. La densidad queda acotada y no hay tracking. Puede reemplazarse cada renderer de capa conservando la API pública. El riesgo principal son filtros costosos; calidad reducida y pausa mitigan el costo.
