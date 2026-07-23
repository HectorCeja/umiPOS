# Feature Management

Organization administrators can query and change the eight registered product flags: POS, Inventory, Appointments, Kitchen, Loyalty, Reports, Marketplace and Ecommerce. Templates initialize them; explicit administration may later override them.

A feature is an availability prerequisite, never a permission grant: evaluation remains `enabled AND RBAC grant AND ABAC constraints`. Unknown/missing rows deny. Changes use `feature_flags.update`, optimistic version, structured trace and append-only evidence. Branch overrides remain deliberately unavailable because precedence has not been specified.
