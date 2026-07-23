# Troubleshooting del avatar

## El preview aparece pero desaparece al refrescar

Verificar que `POST /v1/profile/avatar/complete` respondió 201 y que `/v1/identity` devuelve la misma `avatarUrl`. El `PUT` a MinIO por sí solo no guarda el perfil.

## La URL persistida devuelve 404

Los tokens de avatar superan 100 caracteres. La API configura `maxParamLength: 512`; eliminar esa configuración reproduce el defecto certificado en Parte 4C.

## Reemplazo o eliminación

Comprobar `profile_avatar_media.status`, `users.avatar_url` y la ausencia del objeto anterior. Un error de objeto inexistente se expone como 404, no como 500.

## Seguridad

Nunca registrar URL prefirmada, cookies, tokens ni credenciales S3. Las pruebas cross-user deben ejecutarse con RLS real y `app.current_user_id`.
