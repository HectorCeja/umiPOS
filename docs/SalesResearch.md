# Sales Platform Research and Decision Record

## Official models reviewed

| Model                                                                                                                                                                                                                           | Useful principle                                                                           | Limitation for NEXO                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| [Square Orders](https://developer.squareup.com/docs/orders-api/what-it-does) and [idempotency](https://developer.squareup.com/docs/build-basics/common-api-patterns/idempotency)                                                | Server-owned order totals, explicit tenders and retry-safe commands                        | Provider-specific commerce/payment vocabulary                              |
| [Stripe PaymentIntents](https://docs.stripe.com/payments/payment-intents)                                                                                                                                                       | Intent and attempt lifecycle, one intent per checkout/session, reusable provider reference | Payment processor model cannot own NEXO's Sale or cash                     |
| [Shopify Orders](https://shopify.dev/docs/api/admin-graphql/latest/queries/orders)                                                                                                                                              | Historical order/line money snapshots and separate financial/fulfillment states            | Ecommerce/fulfillment model is broader than branch POS                     |
| [Toast Orders](https://doc.toasttab.com/openapi/orders/operation/ordersPost/)                                                                                                                                                   | Business date, channel, approval and void evidence are first-class                         | Restaurant-specific checks/kitchen semantics                               |
| [Saleor Checkout](https://docs.saleor.io/developer/checkout/overview)                                                                                                                                                           | Checkout is mutable preparation; completed Order is a distinct historical result           | Distributed GraphQL/plugins are unnecessary for the modular-monolith phase |
| [Medusa Checkout](https://docs.medusajs.com/resources/storefront-development/checkout)                                                                                                                                          | Payment preparation precedes atomic cart completion                                        | Shipping/customer steps are not universal for NEXO                         |
| [OASIS UBL 2.5](https://docs.oasis-open.org/ubl/UBL-2.5.pdf)                                                                                                                                                                    | Lines, references, compound tax and credit/debit correction are explicit                   | UBL Invoice is not a Mexican CFDI or a POS receipt implementation          |
| [OWASP Transaction Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html) and [REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) | Revalidate transaction data/authorization server-side and reject workflow skipping/replay  | Controls require NEXO-specific Membership, RLS and device context          |

## Coordination alternatives

- One PostgreSQL transaction across module-owned tables gives strong local consistency but violates module ownership if Sales writes Inventory internals.
- Distributed 2PC was rejected for operational coupling and poor portability.
- Pure choreography was rejected for critical synchronous POS feedback and harder partial-failure reasoning.
- Selected: an explicit checkout/process coordinator calling public ports, local module transactions, durable state/idempotency and transactional outboxes. This is hybrid consistency. Partial failure remains visible and retryable; a future durable broker preserves at-least-once semantics.

The [transactional outbox pattern](https://microservices.io/patterns/data/transactional-outbox) atomically stores state and its message but can publish more than once, so consumers deduplicate by event ID. A [Saga](https://microservices.io/patterns/data/saga.html) uses local transactions and compensations; NEXO uses this only where module boundaries prevent a shared transaction.

## Accounting boundary

Double-entry requires balanced debit/credit entries. Sales therefore emits immutable commercial facts but does not pretend to be the general ledger or Cash Management. Payment allocations and refunds retain enough references for a later posting engine; no accounting entries are synthesized in this phase.

## Selected MVP limits

Cash, externally recorded card, bank transfer and mixed allocations are enabled. Advanced promotions, card processing, Cash ledger, accounting posting, CFDI, productive UMI and offline completion are disabled. Public contracts reserve extension points without claiming those workflows exist.
