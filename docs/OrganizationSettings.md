# Organization Settings

Required settings are commercial name, optional logo reference/RFC/address, country, currency, time zone, locale, date format, time format, money format and regional settings. Explicit columns carry stable/queryable values; `branding`, `address` and `regionalSettings` are schema-governed JSON objects.

The server validates formats and optimistic version. Clients format for display only and never reinterpret persisted amounts/dates. RFC is confidential and excluded from telemetry. Logo upload is not implemented; branding may only hold a future object-storage reference after file-validation controls exist.
