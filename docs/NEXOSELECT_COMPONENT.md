# NexoSelect — componente oficial

`NexoSelect` es la única interfaz de selección permitida en NEXO Web. Vive en `@nexo/ui`, usa un trigger `combobox`, un `listbox` portaleado a `document.body` y posicionamiento `fixed` mediante Floating UI.

## Contrato

- `label` y `options` son obligatorios.
- `value` + `onValueChange` ofrecen modo controlado; `defaultValue` ofrece modo no controlado.
- `name` genera un valor oculto compatible con formularios HTML.
- `searchable`, `loading`, `error`, `retry`, `emptyMessage` y `emptyAction` activan estados oficiales.
- Cada opción admite `description`, `metadata`, `keywords`, `group`, `icon`, `image`, `badge` y `disabled`.

El trigger siempre ocupa el ancho del layout, conserva una sola línea con ellipsis y expone el valor completo mediante `title`. El portal nunca modifica el grid ni el ancho del trigger.

## Uso

```tsx
<NexoSelect
  label="Ubicación"
  value={locationId}
  onValueChange={setLocationId}
  searchable
  options={locations.map((location) => ({
    value: location.id,
    label: location.name,
    description: location.code,
  }))}
/>
```

No se permiten implementaciones locales, `<select>` visibles ni estilos nativos alternativos.
