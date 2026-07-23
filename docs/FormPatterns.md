# Form Patterns

1. Validación cliente mejora feedback; el backend conserva autoridad.
2. Mostrar error junto al campo y resumen global solo si hay varios; mover foco al primer error en submit.
3. Preservar datos tras fallos recuperables y advertir antes de abandonar cambios.
4. Autosave solo en contenido reversible y con estado visible; nunca pagos, permisos o cancelaciones.
5. Deshabilitar submit mientras está pendiente e incluir idempotency key en comandos críticos.
6. Optimistic UI solo para acciones reversibles sin autoridad comercial.
7. Mapear errores OpenAPI estables a mensajes accionables; no duplicar esquema cuando SDK/contrato puede reutilizarse.
