# Login Experience

`/` is the only owner entry. Without a valid session it renders the commercial NEXO login, including value proposition, local-demo notice, autofill, password visibility, recovery request, accessible loading/error/status and help. Login and logout use the existing Authentication endpoints; logout sends the existing CSRF token and returns to `/`.

After authentication the root queries authoritative Control Plane onboarding. Draft routes to guided onboarding, completed routes to Home, 401 returns to login, and missing/inaccessible membership displays a recoverable account state.
