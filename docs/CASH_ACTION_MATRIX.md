# Cash action matrix

Todas las acciones visibles usan endpoints OpenAPI reales, CSRF, estado loading común y guards por selección/estado. Familias certificadas: refresh; register/drawer create-update; session open/suspend/force-close; deposit prepare/hand-over/confirm/cancel; movement deposit/withdraw; transfer; denomination/count/reconcile/close; approvals and reopen. Una acción incompatible permanece disabled con contexto; ningún flujo válido convierte error de negocio en 500. La matriz ejecutable está cubierta por `cash-all-actions`, `cash-no-unexpected-500`, `cash-ui` y `cash.spec`.
