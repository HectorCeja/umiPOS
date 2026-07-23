# NexoDestructiveButton

`NexoDestructiveButton` es la acción oficial para operaciones reversibles como Archivar. Incluye el icono `archive` del registro NEXO y no comparte la apariencia de una eliminación permanente.

## Escala semántica

1. **Neutral:** acciones secundarias sin riesgo.
2. **Warning:** requieren atención antes de continuar.
3. **Destructive:** cambio reversible que retira una entidad de la operación diaria.
4. **Critical:** acción de alto impacto o eliminación irreversible.

Destructive utiliza ruby oscuro translúcido, borde rosado contenido, blur de 12 px, elevación y glow sutil. Critical conserva mayor contraste. La variante histórica `danger` adopta la apariencia Critical para evitar cualquier superficie roja plana mientras se completa la migración semántica de acciones no relacionadas con Archivar.

```tsx
<NexoDestructiveButton onClick={archiveBranch}>Archivar</NexoDestructiveButton>
```
