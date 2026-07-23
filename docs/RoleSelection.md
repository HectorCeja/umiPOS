# Role Selection

Team onboarding presents localized role cards with description, scope and major capability. Selection does not create permissions: Authorization Engine remains the only authority.

Custom Roles are **not available**. Current architecture uses a versioned permission registry and fixed role definitions. Enabling arbitrary roles here would weaken default deny, so no create control is shown. This is a deliberate limitation for a future authorized design, not hidden debt.
