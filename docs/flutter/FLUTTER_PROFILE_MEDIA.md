# Flutter Profile Media

Estado contractual: OpenAPI 8.9.0. El avatar es media privada y persistente; una vista previa local nunca equivale a guardado.

El cliente solicita una intención con `POST /v1/profile/avatar/uploads`, carga el binario con el `PUT` prefirmado y confirma con `POST /v1/profile/avatar/complete`. La confirmación verifica el objeto en MinIO, detecta el tipo por firma binaria, calcula SHA-256 y, en una transacción de usuario, activa `profile_avatar_media` y actualiza `users.avatar_url`. Solo después se retira el objeto reemplazado. `DELETE /v1/profile/avatar` elimina la asociación y solicita el borrado del objeto.

La lectura autenticada usa `GET /v1/profile/avatar/{token}`. El recurso es privado, no entra en Semantics como contenido funcional y usa cache privado corto. El cliente debe invalidar su cache al confirmar, reemplazar o eliminar.

Formatos aceptados: PNG, JPEG y WebP; máximo 5 MiB. SVG y contenido cuya firma no corresponda con la extensión se rechazan. Las rutas internas y credenciales de MinIO no se exponen.

Flutter POS todavía no ofrece una pantalla productiva de perfil. Cuando se añada, deberá consumir este contrato sin duplicar persistencia ni conservar una URL `blob:` como estado autoritativo.
