# Session Management

## Modelo

Una sesión server-side contiene ID UUID, User, Device, fingerprint HMAC, IP, User-Agent, ubicación opcional, creación, última actividad, expiración idle y absoluta, estado, fecha/motivo de revocación, nivel de confianza, token de acceso y CSRF digeridos. Sus refresh tokens son registros separados por generación.

La sesión es estado de seguridad global del User; no contiene Organization, Branch, rol ni TenantContext.

## Ciclo de vida

```text
login → ACTIVE/generation 0
          ├─ authenticate → desliza idle, nunca absolute
          ├─ refresh → ROTATED(n) + ACTIVE(n+1)
          ├─ logout/revoke/reset/reuse → REVOKED
          └─ idle o absolute vencido → no autenticable
```

- Access TTL: 15 min.
- Idle timeout: 30 min y deslizante.
- Absolute estándar: 12 h.
- Absolute con `rememberMe`: 30 días.
- La expiración idle siempre se recorta al límite absoluto.
- Cada refresh rota access, refresh y CSRF en una transacción serializable.

Una generación refresh consumida queda `ROTATED`, nunca se sobrescribe. Reutilizar una generación no activa marca `REUSED`, revoca toda la familia y genera `REFRESH_REUSE_DETECTED`. En una carrera concurrente hay un ganador aparente y el intento perdedor cierra la familia completa; ambos contextos quedan inutilizables.

## Operaciones del usuario

- `GET /v1/sessions`: sólo sesiones activas propias, identifica la actual.
- `DELETE /v1/sessions/{id}`: revocación de otra o la actual, limitada al User autenticado.
- logout: sesión actual.
- logout global: todas las sesiones del User.
- password reset: todas las sesiones y tokens de acción.

Todas las mutaciones requieren acceso vigente y CSRF ligado a la sesión. La revocación es idempotente hacia el exterior y no revela sesiones de otro User.

## Dispositivo y fingerprint

Device ID es estable por User + fingerprint digerido. El fingerprint de sesión también liga User-Agent y no es un factor de autenticación: sirve para auditoría/riesgo, no para bloquear legítimos cambios de navegador. `RECOGNIZED` expresa reconocimiento temporal; no implica confianza alta ni bypass MFA.

## Evidencia

Playwright real demuestra rotación, replay, carrera concurrente, listado, revocación y logout. PostgreSQL demuestra estados durables y eventos; no se aceptan mocks para estas garantías.
