# Owner Onboarding

Prompt 12.4 makes all twelve visual steps editable. Exact `journeyStep` and every selection are stored inside the versioned Control Plane onboarding answers; completion remains a server command. Templates suggest rather than lock business type. Review provides an Edit action per block.

The frontend expands the existing Control Plane onboarding into a 12-part guided journey while preserving the authoritative backend lifecycle. Progress is persisted through `PUT /onboarding`; completion uses `POST /onboarding/complete`; template `coffee-shop`, version checks, authorization and CSRF remain backend-controlled.

The UI asks for business language only and groups the backend's BUSINESS, REGION, TEMPLATE and REVIEW stages into a comprehensible journey. Branch, catalog, Cash and team steps explain and link to existing capabilities. It does not claim a resource exists solely because a card was clicked. Completed seeded organizations go directly to Home; draft organizations resume from the persisted backend step.
