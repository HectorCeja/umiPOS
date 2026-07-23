# Organization Administration

Create is the verified-identity bootstrap described by ADR-0030. Read/update/archive thereafter require `organization.read`, `organization.update` or owner-only `organization.archive`. Update supports name, tax ID, branding/logo reference, address, country, currency, locale, time zone, date/time/money formats and regional settings.

All region values remain explicit: ISO 3166-1 alpha-2, ISO 4217, BCP 47 and IANA time zone. Timestamps persist UTC. JSON extension points are bounded objects; frequently queried data must be promoted to columns.

Archive maps to the existing `OFFBOARDING` lifecycle and intentionally blocks normal AuthorizationContext resolution. Physical deletion and self-service restore are out of scope pending retention/billing/offboarding policy. A stale version returns `409`.
