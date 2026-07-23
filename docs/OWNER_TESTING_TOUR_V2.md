# Owner Testing Tour V2

Human status before this run: **FAIL — PRODUCT EXPERIENCE, CONSISTENCY AND USABILITY**. Automated checks do not replace this review.

## Visual tour

1. Run `pnpm manual-acceptance:prepare`, open only `http://localhost:3000`, and sign in with the recommended demo owner.
2. Complete onboarding. Change individual weekdays, add a second Monday interval, choose starter products visually, and inspect the honest Custom Roles state.
3. Open the account menu in dark and light/system modes. Check contrast, outside-click close, Escape and returned focus.
4. Open Ctrl/Cmd+K. Search for Caja, use arrows/Enter, reopen it and close with Escape.
5. Visit Inicio, Ventas, Caja, Productos, Inventario, Equipo and Configuración at desktop, tablet and 390px mobile widths.

## Functional tour

1. Edit Profile, select a PNG/JPEG/WebP file from the device, save, and confirm visible progress and success.
2. Create a Product using the real Product service. Confirm success and refreshed list.
3. Exercise only Inventory actions marked READY in `OwnerScreenReadiness.md`; do not infer capabilities from disabled controls.
4. Change branch and confirm the selector remains present and has no duplicate record.
5. Sign out, sign in, refresh Home, and verify valid sessions never return silently to Login.

## Error and access tour

Use the ReadOnly account for a denied write. Confirm the message explains the restriction without making an internal code the headline. Create a validation failure and preserve a screenshot plus the optional diagnostic reference.

## Evidence

For every failure record viewport, theme, route, account, expected result, actual result, screenshot and diagnostic bundle. Answer the ten perception questions in the manual-acceptance result package. The phase remains owner-review pending until those real results are returned.
