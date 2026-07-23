# Permission Registry

The single source is `packages/authorization/src/registry.ts`, version `4`. Seed materializes exactly that registry into global definition tables; runtime reads definitions and tenant assignments but cannot mutate global definitions. Permission keys use lowercase dotted capability names and are never renamed in place. Removal/deprecation requires a contract and data migration.

The v4 registry contains 78 permissions, including Control Plane, Product, Inventory and Sales capabilities. Cash, Customers, appointments and reports remain future vocabulary where declared; a UI feature does not grant them.

Every entry declares resource, action, access kind, description and optional required product feature. CI validates the canonical OpenAPI and generated SDK; seed upserts registry version and grants. A new permission requires registry entry, role-matrix review, tests, documentation, feature relationship and backward-compatibility assessment.
