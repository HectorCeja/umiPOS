# Security UX

- Sesión expirada conserva solo intención no sensible y solicita autenticación accesible.
- Cambio de sucursal muestra destino y bloquea si una venta pendiente puede quedar inconsistente.
- Descuento/cancelación/refund muestra monto, impacto, actor y motivo; aprobación de supervisor usa su propia sesión, nunca comparte contraseña.
- Reautenticación se reserva para riesgo, no se usa como fricción genérica.
- Contenido sin permiso no se renderiza; mensajes no confirman existencia de otro tenant.
- POS compartido ofrece bloqueo rápido, timeout visible y logout; datos sensibles se minimizan contra shoulder surfing.
- Confirmación destructiva usa nombre/impacto, foco seguro y opción cancelar; no requiere escribir texto salvo riesgo excepcional.
- Enlaces externos future-ready muestran dominio/destino y protección anti-phishing.
- Estados offline, replay y conflicto evitan repetir pagos o ventas a ciegas.
