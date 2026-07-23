# Profile and Preferences

`/settings/profile` usa `PATCH /v1/profile`, CSRF y la identidad autenticada. Permite editar presentación, locale, zona horaria y preferencias no sensibles. Email y Membership no se modifican. Tema se persiste localmente para evitar depender de roles o claims. La carga binaria privada de avatar no se simula: actualmente se admite una URL HTTPS administrada.
