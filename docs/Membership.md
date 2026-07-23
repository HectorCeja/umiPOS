# Membership

`Membership` vincula un `principalId` externo con una Organization. No crea usuarios ni autenticación. Un principal puede tener una membresía por organización y pertenecer a varias organizaciones.

Roles base: OWNER, ADMIN, SUPERVISOR, CASHIER, EMPLOYEE y ACCOUNTANT. El alcance es `ALL_BRANCHES` o `RESTRICTED`; el segundo se materializa en `MembershipBranchScope` con FKs compuestas tenant-safe. Estados: ACTIVE, SUSPENDED y REVOKED.

La revocación es lógica y efectiva en la siguiente resolución. Prompt 6 implementa cambios de rol/alcance/estado con auditoría y revalidación transaccional. Una invitación crea Membership sólo tras validación atómica. No se permite dejar una organización sin OWNER activo.
