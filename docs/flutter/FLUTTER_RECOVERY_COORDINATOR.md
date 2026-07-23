# Flutter Recovery Coordinator

V1 status: **PASS**. Startup recovery inspects persisted attempts, performs lookup-only resolution, completes an approved existing sale, recovers receipt/cache and never retries payment automatically.

Estado: GAP crítico para certificación.

SQLite v1 conserva carrito, outbox y Payment Attempt, pero `apps/nexo_pos` no contiene todavía un coordinador productivo que, al iniciar, valide device y sesión, resuelva outcomes, consulte venta, recupere receipt y reanude impresión en ese orden. Ningún pago se reintenta automáticamente. La Parte 5 no está autorizada mientras este GAP permanezca.
