# Premium Toast Standard

- Web: `PremiumToastPortal` monta en `document.body`, usa `position: fixed` y se ubica abajo a la
  derecha; en móvil queda sobre la navegación y respeta safe areas.
- Contenido: título, explicación, tono semántico, acción opcional, cierre, auto-dismiss, pausa por
  hover/focus y `aria-live`.
- `SaveStatus` es la integración autoritativa para Productos, Perfil, Configuración, Equipo,
  ubicaciones y onboarding. Caja usa el mismo portal directamente. Ventas ya no usa banners para
  resultados mutables y conserva “Ver recibo” como acción del toast.
- Flutter POS: cobro, impresión y cierre de caja muestran `NexoToast` mediante un `SnackBar`
  flotante, descartable y accesible.
- Validaciones de campos permanecen inline; estados educativos no mutables pueden seguir usando
  notices contextuales.
