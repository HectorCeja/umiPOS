# Profile Avatar CSP

The Web CSP is built server-side by `buildContentSecurityPolicy`. Development explicitly permits the public API on `http://localhost:3001`; staging/production use validated server-owned `NEXO_PUBLIC_API_ORIGIN` and optional media origins. The policy preserves `'self'`, `blob:`, `data:`, nonce scripts, `object-src 'none'` and `frame-ancestors 'none'`; wildcard and credentialed/non-HTTP origins are rejected.

MinIO's internal hostname is never emitted. Avatar reads remain authenticated through `/v1/profile/avatar/:token` on the API.
