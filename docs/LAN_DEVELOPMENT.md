# Desarrollo LAN

La configuración completa y el modelo de seguridad están en [DEV_LAN_ACCESS.md](DEV_LAN_ACCESS.md).

`owner:share` publica Web `:3000`, API `:3001`, Mailpit `:8025` y MinIO `:9000/:9001` sobre la IP
privada detectada. Compose enlaza puertos en todas las interfaces; PostgreSQL y Redis no deben
exponerse fuera de una red de desarrollo confiable.

El Web reescribe hosts loopback al hostname que abrió el navegador. Los UUID de idempotencia usan
`getRandomValues()` cuando `randomUUID()` no está disponible en HTTP LAN. MinIO se configura con
`S3_PUBLIC_ENDPOINT` antes de firmar; una URL prefirmada nunca se reescribe después.

La experiencia de aceptación usa el build productivo estable y por ello no ofrece Hot Reload.
Hot Reload corresponde al comando de desarrollo, no al entorno manual compartido.
