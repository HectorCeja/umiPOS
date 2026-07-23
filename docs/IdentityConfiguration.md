# Identity configuration

Identity configuration is parsed centrally by `@nexo/config` and converted to immutable `IdentityConfiguration`. Missing or insecure values fail startup; business modules do not read environment variables directly.

| Variable                               | Purpose                         | Local value        |
| -------------------------------------- | ------------------------------- | ------------------ |
| `IDENTITY_DEFAULT_LOCALE`              | new User locale                 | `es-MX`            |
| `IDENTITY_DEFAULT_TIME_ZONE`           | new User IANA zone              | `America/Mazatlan` |
| `IDENTITY_DEFAULT_REGIONAL_FORMAT`     | number/date presentation locale | `es-MX`            |
| `IDENTITY_PASSWORD_MIN_LENGTH`         | minimum password length         | `15`               |
| `IDENTITY_PASSWORD_MAX_LENGTH`         | maximum accepted length         | `128`              |
| `IDENTITY_PASSWORD_ARGON2_MEMORY_KIB`  | Argon2id memory                 | `19456`            |
| `IDENTITY_PASSWORD_ARGON2_PASSES`      | Argon2id passes                 | `2`                |
| `IDENTITY_PASSWORD_ARGON2_PARALLELISM` | Argon2id parallelism            | `1`                |
| `IDENTITY_PASSWORD_HISTORY_DEPTH`      | retained reuse comparisons      | `0`                |
| `IDENTITY_PASSWORD_EXPIRATION_DAYS`    | optional expiry; zero disables  | `0`                |

Capabilities `OAUTH`, `SSO`, `PASSKEYS`, `WEBAUTHN`, `MAGIC_LINKS` and `PASSWORDLESS` each have an explicit `IDENTITY_FEATURE_*` boolean and default to false in local Compose. Production configuration must be explicit. Enabling a flag before its adapter, threat model, migrations and tests exist is forbidden. Flags are rollout controls, not permissions, entitlements or proof that a feature is implemented.
