# Smart Onboarding

The web maps the four persisted lifecycle milestones to twelve owner-facing steps and stores `journeyStep` for exact resume. Business type, regional configuration, hours, Cash suggestions, catalog choice, optional Inventory, optional Team and branding are versioned answers; the browser never declares completion alone.

## Connected owner journey

The visual 12-step journey is backed by the existing persisted Control Plane onboarding state and template application. It resumes from `currentStep`, saves answers/version through the real service and completes only when the backend accepts the transition. The UI never stores a separate completion authority.

The target is completion in under five minutes with four user decisions and a review step: business identity → region/language → business template → review → complete. Required answers are business name, country, currency, IANA time zone, BCP 47 locale and business type.

`organization_onboarding` is tenant-owned, forced-RLS and optimistic-locked. Draft updates are monotonic and completion requires step 4, an active template and the exact version. Completion atomically records template version, applies settings and enables listed features. Missing features remain disabled. Category suggestions are inert data until Catalog exists.

Restart clears only draft answers/template selection and increments version. It never deletes Organization, Branch, Membership or previously applied configuration. A second completion is an explicit reconfiguration, not an implicit rollback. Concurrent/stale commands return `409`.

The responsive UI uses visible labels, text errors, keyboard-native controls, minimum 44px action targets and a consistent progress indicator. Server validation remains authoritative.
