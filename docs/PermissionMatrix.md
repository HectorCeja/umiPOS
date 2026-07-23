# Permission Matrix — registry v4

Legend: `O` Organization, `B` Branch, `S` Self, `—` not granted. Feature-dependent permissions still deny when the feature is off.

| Permission                        | Owner | Admin | Supervisor | Cashier | Employee | ReadOnly |
| --------------------------------- | ----- | ----- | ---------- | ------- | -------- | -------- |
| organization.read                 | O     | O     | B          | B       | B        | O        |
| organization.update               | O     | O     | —          | —       | —        | —        |
| organization.archive              | O     | —     | —          | —       | —        | —        |
| branch.read                       | O     | O     | B          | B       | B        | O        |
| branch.create                     | O     | O     | —          | —       | —        | —        |
| branch.update                     | O     | O     | B          | —       | —        | —        |
| branch.archive                    | O     | O     | —          | —       | —        | —        |
| branch.restore                    | O     | O     | —          | —       | —        | —        |
| membership.read                   | O     | O     | B          | —       | —        | O        |
| membership.create                 | O     | O     | —          | —       | —        | —        |
| membership.update                 | O     | O     | —          | —       | —        | —        |
| membership.revoke                 | O     | —     | —          | —       | —        | —        |
| authorization.context.read        | O     | O     | B          | B       | B        | O        |
| authorization.evaluate            | O     | O     | B          | B       | B        | O        |
| authorization.roles.read          | O     | O     | B          | B       | B        | O        |
| authorization.permissions.read    | O     | O     | B          | B       | B        | O        |
| feature_flags.read                | O     | O     | B          | B       | B        | O        |
| feature_flags.update              | O     | O     | —          | —       | —        | —        |
| onboarding.read                   | O     | O     | B          | B       | B        | O        |
| onboarding.manage                 | O     | O     | —          | —       | —        | —        |
| templates.read                    | O     | O     | B          | B       | B        | O        |
| invitation.read                   | O     | O     | B          | —       | —        | —        |
| invitation.create                 | O     | O     | —          | —       | —        | —        |
| invitation.revoke                 | O     | O     | —          | —       | —        | —        |
| invitation.resend                 | O     | O     | —          | —       | —        | —        |
| product.read                      | O     | O     | B          | B       | B        | O        |
| product.create                    | O     | O     | —          | —       | —        | —        |
| product.update                    | O     | O     | B          | —       | —        | —        |
| product.delete                    | O     | O     | —          | —       | —        | —        |
| inventory.read                    | O     | O     | B          | B       | B        | O        |
| inventory.write                   | O     | O     | B          | —       | —        | —        |
| inventory.adjust                  | O     | O     | B          | —       | —        | —        |
| sales.read                        | O     | O     | B          | B       | B        | O        |
| sales.create                      | O     | O     | B          | B       | B        | —        |
| sales.refund                      | O     | O     | B          | —       | —        | —        |
| sales.update                      | O     | O     | B          | B       | B        | —        |
| sales.suspend                     | O     | O     | B          | B       | —        | —        |
| sales.resume                      | O     | O     | B          | B       | —        | —        |
| sales.complete                    | O     | O     | B          | B       | —        | —        |
| sales.cancel                      | O     | O     | B          | —       | —        | —        |
| sales.discount                    | O     | O     | B          | —       | —        | —        |
| sales.override_price              | O     | O     | B          | —       | —        | —        |
| sales.view_cost                   | O     | O     | B          | —       | —        | —        |
| sales.view_all_branches           | O     | O     | B          | —       | —        | —        |
| Sales administration reads        | O     | O     | B          | B       | B        | O        |
| sales.refund.request/approve      | O     | O     | B          | —       | —        | —        |
| sales.receipt.read/regenerate     | O     | O     | B          | B       | B        | O        |
| sales.exceptions/diagnostics.read | O     | O     | B          | —       | —        | —        |
| sales.manual_create (disabled)    | O     | O     | —          | —       | —        | —        |
| cash.navigation.read              | O     | O     | B          | B       | B        | O        |
| integrations.outbox.read          | O     | O     | B          | —       | —        | —        |
| payments.record                   | O     | O     | B          | B       | —        | —        |
| receipts.generate                 | O     | O     | B          | B       | —        | —        |
| cash.register.read/manage         | O     | O     | B          | B/—     | —        | O/—      |
| cash.drawer.read/manage           | O     | O     | B          | B/—     | —        | O/—      |
| cash.session.read/open            | O     | O     | B          | B       | —        | O/—      |
| cash.session.suspend/resume       | O     | O     | B          | B       | —        | —        |
| cash.session.close                | O     | O     | B          | S       | —        | —        |
| cash.session.force_close          | O     | O     | B          | —       | —        | —        |
| cash.session.reopen/handoff       | O     | O     | B          | —       | —        | —        |
| cash.movement.read/create         | O     | O     | B          | B       | —        | O/—      |
| cash.withdraw/deposit/transfer    | O     | O     | B          | —       | —        | —        |
| cash.count/reconcile/approve      | O     | O     | B          | B/—/—   | —        | —        |
| cash.view_expected/variance       | O     | O     | B          | —       | —        | O        |
| cash.refund/timeline.read         | O     | O     | B          | —/B     | —        | —/O      |
| cash.all_branches.read            | O     | O     | —          | —       | —        | —        |
| customer.read                     | O     | O     | B          | B       | B        | O        |
| customer.edit                     | O     | O     | B          | —       | —        | —        |
| appointments.read                 | O     | O     | B          | —       | B        | O        |
| appointments.manage               | O     | O     | B          | —       | B        | —        |
| reports.read                      | O     | O     | B          | —       | —        | O        |
| reports.export                    | O     | O     | B          | —       | —        | —        |

The executable registry is authoritative if narrative and table ever diverge; such divergence fails the documentation gate and must be corrected immediately.
