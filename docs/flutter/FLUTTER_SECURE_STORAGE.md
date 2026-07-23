# Flutter secure storage

`SecureStore` is the application boundary. `PlatformSecureStore` uses `flutter_secure_storage`; `MemorySecureStore` remains test-only. Device credentials and session cookie/CSRF continuity are stored through this boundary. Local SQLite never stores these secrets.

Logout and revocation must call `clear` or delete the scoped keys. A vault initialization or read failure is a storage failure, not permission to degrade to plain preferences.
