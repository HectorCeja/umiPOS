# Contrato de seguridad del reverse proxy

- La aplicación mantiene `trustProxy=false` hasta que la topología productiva y los hops estén definidos.
- Producción debe imponer `LOCAL_DEVELOPMENT=false`, cookies Secure, orígenes públicos explícitos y secretos sin defaults.
- El proxy debe reemplazar, no concatenar ciegamente, `Forwarded`, `X-Forwarded-For`, `X-Real-IP`, `X-Forwarded-Proto` y `X-Forwarded-Host` recibidos del cliente.
- Solo redes/hops administrados pueden aportar esos headers.
- TLS termina en infraestructura autorizada; el proxy fuerza HTTPS y HSTS donde corresponda.
- Rate limiting y auditoría no deben usar una IP reenviada hasta habilitar una lista exacta de proxies confiables.
- Correlation IDs siguen la validación de NEXO; valores arbitrarios se reemplazan.

Activar `trustProxy` sin lista/hops verificados es un cambio de seguridad y requiere una nueva certificación.
