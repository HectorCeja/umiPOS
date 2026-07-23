# Categories

Árbol tenant mediante adjacency list (`parent_id`) con profundidad arbitraria, slug único, orden, estado, versión y soft delete. Un trigger rechaza ciclos y auto-referencias. Breadcrumbs se resuelven recursivamente; una closure table sólo se añadirá con evidencia de rendimiento.
